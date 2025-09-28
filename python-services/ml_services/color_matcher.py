import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
import colorsys
from typing import List, Dict, Tuple, Optional
import pickle
import os

class AdvancedColorMatcher:
    def __init__(self):
        self.matcher = None
        self.scaler = StandardScaler()
        self.color_data = []
        self.feature_matrix = None
        self.recommendation_model = None
        
    def load_colors(self, colors_data: List[Dict]):
        """Load and prepare color data for matching"""
        self.color_data = colors_data
        features = []
        
        for color in colors_data:
            try:
                # Extract color features
                h1 = color.get('color1', {}).get('h', 0)
                s1 = color.get('color1', {}).get('s', 0)
                b1 = color.get('color1', {}).get('b', 0)
                
                h2 = color.get('color2', {}).get('h', 0)
                s2 = color.get('color2', {}).get('s', 0)
                b2 = color.get('color2', {}).get('b', 0)
                
                # Convert to LAB for perceptual matching
                lab1 = self._hsb_to_lab(h1, s1, b1)
                lab2 = self._hsb_to_lab(h2, s2, b2)
                
                # Create feature vector
                feature_vector = [
                    *lab1, *lab2,  # LAB values
                    h1, s1, b1, h2, s2, b2,  # Original HSB
                    abs(h1 - h2), abs(s1 - s2), abs(b1 - b2),  # Color differences
                    self._calculate_color_temperature(h1, s1, b1),  # Color temperature
                    self._calculate_vibrancy(s1, b1),  # Vibrancy
                ]
                
                features.append(feature_vector)
                
            except Exception as e:
                # Skip invalid colors
                continue
        
        if features:
            self.feature_matrix = np.array(features)
            self.feature_matrix = self.scaler.fit_transform(self.feature_matrix)
            
            # Initialize nearest neighbors matcher
            self.matcher = NearestNeighbors(
                n_neighbors=min(50, len(features)), 
                metric='euclidean',
                algorithm='ball_tree'
            )
            self.matcher.fit(self.feature_matrix)
            
            # Train recommendation model
            self._train_recommendation_model()
    
    def find_matches(self, extracted_colors: List[Dict], max_matches: int = 20) -> List[Dict]:
        """Find matching automotive colors using ML"""
        if not self.matcher or not extracted_colors:
            return []
        
        all_matches = []
        
        for extracted in extracted_colors:
            try:
                # Convert extracted color to feature vector
                r = extracted.get('r', 0) / 255.0
                g = extracted.get('g', 0) / 255.0
                b = extracted.get('b', 0) / 255.0
                
                h, s, v = colorsys.rgb_to_hsv(r, g, b)
                lab = self._hsb_to_lab(h, s, v)
                
                # Create feature vector matching training data
                feature_vector = [
                    *lab, *lab,  # Use same LAB for both color1 and color2
                    h, s, v, h, s, v,  # HSB values
                    0, 0, 0,  # No color differences for single color
                    self._calculate_color_temperature(h, s, v),
                    self._calculate_vibrancy(s, v),
                ]
                
                # Scale feature vector
                feature_vector = self.scaler.transform([feature_vector])
                
                # Find nearest neighbors
                distances, indices = self.matcher.kneighbors(feature_vector)
                
                # Score matches based on distance and color properties
                for dist, idx in zip(distances[0], indices[0]):
                    if idx < len(self.color_data):
                        color = self.color_data[idx]
                        
                        # Calculate perceptual similarity score
                        similarity_score = self._calculate_similarity_score(
                            extracted, color, dist
                        )
                        
                        match = {
                            **color,
                            'similarity_score': similarity_score,
                            'distance': float(dist),
                            'match_type': self._determine_match_type(similarity_score)
                        }
                        all_matches.append(match)
                        
            except Exception as e:
                continue
        
        # Remove duplicates and sort by similarity
        unique_matches = {}
        for match in all_matches:
            key = f"{match['make']}_{match['colorName']}"
            if key not in unique_matches or match['similarity_score'] > unique_matches[key]['similarity_score']:
                unique_matches[key] = match
        
        # Sort by similarity score and return top matches
        sorted_matches = sorted(
            unique_matches.values(), 
            key=lambda x: x['similarity_score'], 
            reverse=True
        )
        
        return sorted_matches[:max_matches]
    
    def get_color_recommendations(self, user_preferences: List[Dict]) -> List[Dict]:
        """Get ML-powered color recommendations based on user preferences"""
        if not self.recommendation_model or not user_preferences:
            return []
        
        try:
            # Extract features from user preferences
            pref_features = []
            for pref in user_preferences:
                color = pref.get('color', {})
                h = color.get('color1', {}).get('h', 0)
                s = color.get('color1', {}).get('s', 0)
                b = color.get('color1', {}).get('b', 0)
                
                lab = self._hsb_to_lab(h, s, b)
                features = [*lab, h, s, b, self._calculate_vibrancy(s, b)]
                pref_features.append(features)
            
            if not pref_features:
                return []
            
            # Average user preferences
            avg_features = np.mean(pref_features, axis=0)
            
            # Predict similar colors
            predictions = self.recommendation_model.predict([avg_features])
            
            # Find colors closest to predictions
            feature_vector = self.scaler.transform([avg_features])
            distances, indices = self.matcher.kneighbors(feature_vector, n_neighbors=15)
            
            recommendations = []
            for idx in indices[0]:
                if idx < len(self.color_data):
                    color = self.color_data[idx]
                    recommendations.append({
                        **color,
                        'recommendation_score': float(1.0 / (1.0 + distances[0][list(indices[0]).index(idx)]))
                    })
            
            return recommendations
            
        except Exception as e:
            return []
    
    def _hsb_to_lab(self, h: float, s: float, b: float) -> Tuple[float, float, float]:
        """Convert HSB to LAB color space"""
        # HSB to RGB
        r, g, b_rgb = colorsys.hsv_to_rgb(h, s, b)
        
        # Simple RGB to LAB approximation
        # For production, use colorspacious library
        l = 0.299 * r + 0.587 * g + 0.114 * b_rgb
        a = (r - g) * 0.5
        b_lab = (r + g - 2 * b_rgb) * 0.25
        
        return (l * 100, a * 200, b_lab * 200)
    
    def _calculate_color_temperature(self, h: float, s: float, b: float) -> float:
        """Calculate color temperature approximation"""
        # Warm colors (reds, oranges, yellows) have higher temperature
        if h < 0.17 or h > 0.83:  # Red range
            return 0.8 + s * 0.2
        elif 0.17 <= h <= 0.33:  # Yellow range
            return 0.6 + s * 0.3
        else:  # Cool colors (blues, greens)
            return 0.2 + (1 - s) * 0.3
    
    def _calculate_vibrancy(self, s: float, b: float) -> float:
        """Calculate color vibrancy"""
        return s * b
    
    def _calculate_similarity_score(self, extracted: Dict, car_color: Dict, distance: float) -> float:
        """Calculate comprehensive similarity score"""
        base_score = max(0, 1.0 - distance / 10.0)  # Normalize distance
        
        # Bonus for exact color type matches
        extracted_type = extracted.get('colorType', '')
        car_type = car_color.get('colorType', '')
        
        type_bonus = 0.1 if extracted_type == car_type else 0
        
        # Bonus for popular manufacturers
        popular_makes = ['Ferrari', 'Lamborghini', 'Porsche', 'BMW', 'Mercedes-Benz']
        make_bonus = 0.05 if car_color.get('make', '') in popular_makes else 0
        
        return min(1.0, base_score + type_bonus + make_bonus)
    
    def _determine_match_type(self, similarity_score: float) -> str:
        """Determine match quality type"""
        if similarity_score >= 0.9:
            return "Excellent Match"
        elif similarity_score >= 0.7:
            return "Good Match"
        elif similarity_score >= 0.5:
            return "Fair Match"
        else:
            return "Approximate Match"
    
    def _train_recommendation_model(self):
        """Train ML model for color recommendations"""
        if not self.feature_matrix or len(self.feature_matrix) < 10:
            return
        
        try:
            # Create training data for recommendation
            # Use color popularity and user interaction patterns
            X = self.feature_matrix[:, :7]  # Use first 7 features (LAB + basic HSB)
            
            # Create synthetic target based on color properties
            # In production, use actual user interaction data
            y = []
            for color in self.color_data:
                # Synthetic popularity score based on make and color type
                make = color.get('make', '')
                color_type = color.get('colorType', '')
                
                score = 0.5  # Base score
                if make in ['Ferrari', 'Lamborghini', 'Porsche']:
                    score += 0.3
                if color_type in ['Metal Flake', 'Two-Tone Polished']:
                    score += 0.2
                
                y.append(score)
            
            # Train random forest model
            self.recommendation_model = RandomForestRegressor(
                n_estimators=50, 
                random_state=42,
                max_depth=10
            )
            self.recommendation_model.fit(X, y)
            
        except Exception as e:
            self.recommendation_model = None
    
    def save_model(self, filepath: str):
        """Save trained model to disk"""
        model_data = {
            'matcher': self.matcher,
            'scaler': self.scaler,
            'recommendation_model': self.recommendation_model,
            'color_data': self.color_data
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
                
            self.matcher = model_data.get('matcher')
            self.scaler = model_data.get('scaler')
            self.recommendation_model = model_data.get('recommendation_model')
            self.color_data = model_data.get('color_data', [])