import cv2
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from PIL import Image, ImageEnhance
import colorsys
from typing import List, Dict, Tuple, Optional
import io
import base64

class AdvancedImageProcessor:
    def __init__(self):
        self.min_color_percentage = 0.02  # Minimum 2% of image for color to be considered
        self.max_colors = 12
        
    def process_image_data(self, image_data: str) -> List[Dict]:
        """Process base64 image data and extract automotive colors"""
        try:
            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to OpenCV format
            cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            return self.extract_automotive_colors(cv_image)
            
        except Exception as e:
            return []
    
    def extract_automotive_colors(self, image: np.ndarray) -> List[Dict]:
        """Enhanced color extraction optimized for automotive images"""
        try:
            # Preprocessing pipeline
            processed_image = self._preprocess_image(image)
            
            # Multiple extraction methods
            kmeans_colors = self._kmeans_extraction(processed_image)
            dominant_colors = self._histogram_analysis(processed_image)
            edge_colors = self._edge_based_extraction(processed_image)
            
            # Combine and rank results
            combined_colors = self._merge_color_results(
                kmeans_colors, dominant_colors, edge_colors
            )
            
            # Filter and enhance results
            final_colors = self._filter_automotive_colors(combined_colors)
            
            return final_colors[:self.max_colors]
            
        except Exception as e:
            return []
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for better color extraction"""
        # Resize for performance while maintaining aspect ratio
        height, width = image.shape[:2]
        max_size = 800
        
        if max(height, width) > max_size:
            scale = max_size / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Enhance contrast and saturation
        image = self._enhance_colors(image)
        
        # Noise reduction
        image = cv2.bilateralFilter(image, 9, 75, 75)
        
        # Optional: Remove background (if car detection is needed)
        # image = self._remove_background(image)
        
        return image
    
    def _enhance_colors(self, image: np.ndarray) -> np.ndarray:
        """Enhance color visibility"""
        # Convert to PIL for enhancement
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        # Enhance saturation
        enhancer = ImageEnhance.Color(pil_image)
        pil_image = enhancer.enhance(1.2)
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(1.1)
        
        # Convert back to OpenCV
        return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    
    def _kmeans_extraction(self, image: np.ndarray) -> List[Dict]:
        """Extract colors using K-means clustering"""
        # Reshape image to pixel array
        pixels = image.reshape(-1, 3).astype(np.float32)
        
        # Remove very dark and very bright pixels (likely shadows/highlights)
        brightness = np.mean(pixels, axis=1)
        mask = (brightness > 20) & (brightness < 235)
        filtered_pixels = pixels[mask]
        
        if len(filtered_pixels) < 100:
            filtered_pixels = pixels
        
        # K-means clustering
        k = min(15, len(filtered_pixels) // 100)  # Adaptive K
        if k < 2:
            return []
        
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(filtered_pixels)
        
        # Calculate color statistics
        colors = []
        total_pixels = len(filtered_pixels)
        
        for i in range(k):
            cluster_mask = labels == i
            cluster_size = np.sum(cluster_mask)
            percentage = cluster_size / total_pixels
            
            if percentage >= self.min_color_percentage:
                center = kmeans.cluster_centers_[i]
                b, g, r = center.astype(int)
                
                # Convert to HSV for better analysis
                h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
                
                colors.append({
                    'r': int(r), 'g': int(g), 'b': int(b),
                    'h': h, 's': s, 'v': v,
                    'percentage': percentage,
                    'count': int(cluster_size),
                    'method': 'kmeans'
                })
        
        return sorted(colors, key=lambda x: x['percentage'], reverse=True)
    
    def _histogram_analysis(self, image: np.ndarray) -> List[Dict]:
        """Extract colors using histogram analysis"""
        # Convert to HSV for better color separation
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Create 3D histogram
        hist = cv2.calcHist([hsv], [0, 1, 2], None, [30, 32, 32])
        
        # Find peaks in histogram
        colors = []
        total_pixels = image.shape[0] * image.shape[1]
        
        # Get top histogram bins
        flat_hist = hist.flatten()
        top_indices = np.argsort(flat_hist)[-20:]  # Top 20 bins
        
        for idx in reversed(top_indices):
            count = flat_hist[idx]
            percentage = count / total_pixels
            
            if percentage >= self.min_color_percentage:
                # Convert flat index back to 3D coordinates
                h_idx = idx // (32 * 32)
                s_idx = (idx % (32 * 32)) // 32
                v_idx = idx % 32
                
                # Convert bin indices to actual HSV values
                h = (h_idx * 180) // 30
                s = (s_idx * 255) // 32
                v = (v_idx * 255) // 32
                
                # Convert to RGB
                r, g, b = colorsys.hsv_to_rgb(h/180, s/255, v/255)
                r, g, b = int(r*255), int(g*255), int(b*255)
                
                colors.append({
                    'r': r, 'g': g, 'b': b,
                    'h': h/180, 's': s/255, 'v': v/255,
                    'percentage': percentage,
                    'count': int(count),
                    'method': 'histogram'
                })
        
        return colors
    
    def _edge_based_extraction(self, image: np.ndarray) -> List[Dict]:
        """Extract colors from edge regions (often car body colors)"""
        # Edge detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # Dilate edges to get regions around edges
        kernel = np.ones((5, 5), np.uint8)
        edge_regions = cv2.dilate(edges, kernel, iterations=2)
        
        # Extract colors from edge regions
        edge_pixels = image[edge_regions > 0]
        
        if len(edge_pixels) < 50:
            return []
        
        # Cluster edge colors
        kmeans = KMeans(n_clusters=min(8, len(edge_pixels)//20), random_state=42)
        labels = kmeans.fit_predict(edge_pixels)
        
        colors = []
        total_pixels = len(edge_pixels)
        
        for i in range(kmeans.n_clusters):
            cluster_mask = labels == i
            cluster_size = np.sum(cluster_mask)
            percentage = cluster_size / total_pixels
            
            if percentage >= 0.05:  # Lower threshold for edge colors
                center = kmeans.cluster_centers_[i]
                b, g, r = center.astype(int)
                h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
                
                colors.append({
                    'r': int(r), 'g': int(g), 'b': int(b),
                    'h': h, 's': s, 'v': v,
                    'percentage': percentage,
                    'count': int(cluster_size),
                    'method': 'edge'
                })
        
        return colors
    
    def _merge_color_results(self, *color_lists) -> List[Dict]:
        """Merge and deduplicate colors from different extraction methods"""
        all_colors = []
        for color_list in color_lists:
            all_colors.extend(color_list)
        
        if not all_colors:
            return []
        
        # Group similar colors
        merged_colors = []
        used_colors = set()
        
        for color in sorted(all_colors, key=lambda x: x['percentage'], reverse=True):
            if id(color) in used_colors:
                continue
            
            # Find similar colors
            similar_colors = [color]
            for other_color in all_colors:
                if id(other_color) in used_colors or other_color == color:
                    continue
                
                # Check color similarity
                if self._colors_similar(color, other_color):
                    similar_colors.append(other_color)
                    used_colors.add(id(other_color))
            
            # Merge similar colors
            if similar_colors:
                merged_color = self._merge_similar_colors(similar_colors)
                merged_colors.append(merged_color)
                used_colors.add(id(color))
        
        return sorted(merged_colors, key=lambda x: x['percentage'], reverse=True)
    
    def _colors_similar(self, color1: Dict, color2: Dict, threshold: float = 0.15) -> bool:
        """Check if two colors are similar"""
        # Calculate Euclidean distance in HSV space
        h_diff = min(abs(color1['h'] - color2['h']), 1 - abs(color1['h'] - color2['h']))
        s_diff = abs(color1['s'] - color2['s'])
        v_diff = abs(color1['v'] - color2['v'])
        
        distance = np.sqrt(h_diff**2 + s_diff**2 + v_diff**2)
        return distance < threshold
    
    def _merge_similar_colors(self, colors: List[Dict]) -> Dict:
        """Merge similar colors into one representative color"""
        if len(colors) == 1:
            return colors[0]
        
        # Weight by percentage
        total_weight = sum(c['percentage'] for c in colors)
        
        # Weighted average of RGB values
        r = sum(c['r'] * c['percentage'] for c in colors) / total_weight
        g = sum(c['g'] * c['percentage'] for c in colors) / total_weight
        b = sum(c['b'] * c['percentage'] for c in colors) / total_weight
        
        # Convert back to HSV
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        
        return {
            'r': int(r), 'g': int(g), 'b': int(b),
            'h': h, 's': s, 'v': v,
            'percentage': total_weight,
            'count': sum(c['count'] for c in colors),
            'method': 'merged',
            'source_methods': list(set(c['method'] for c in colors))
        }
    
    def _filter_automotive_colors(self, colors: List[Dict]) -> List[Dict]:
        """Filter colors to focus on automotive-relevant colors"""
        filtered = []
        
        for color in colors:
            # Skip very desaturated colors (likely gray/white/black)
            if color['s'] < 0.1 and color['v'] > 0.9:  # Very light grays/whites
                continue
            if color['s'] < 0.1 and color['v'] < 0.2:  # Very dark grays/blacks
                continue
            
            # Skip colors that are too small
            if color['percentage'] < self.min_color_percentage:
                continue
            
            # Add automotive relevance score
            color['automotive_score'] = self._calculate_automotive_relevance(color)
            filtered.append(color)
        
        # Sort by automotive relevance and percentage
        return sorted(filtered, 
                     key=lambda x: (x['automotive_score'], x['percentage']), 
                     reverse=True)
    
    def _calculate_automotive_relevance(self, color: Dict) -> float:
        """Calculate how relevant a color is for automotive applications"""
        h, s, v = color['h'], color['s'], color['v']
        score = 0.5  # Base score
        
        # Boost common automotive colors
        if 0.0 <= h <= 0.1 or 0.9 <= h <= 1.0:  # Reds
            score += 0.3
        elif 0.1 <= h <= 0.2:  # Oranges/Yellows
            score += 0.2
        elif 0.55 <= h <= 0.75:  # Blues
            score += 0.3
        elif 0.25 <= h <= 0.4:  # Greens
            score += 0.2
        
        # Boost metallic-looking colors (medium to high saturation)
        if 0.3 <= s <= 0.8:
            score += 0.2
        
        # Boost colors with good visibility (not too dark, not too light)
        if 0.2 <= v <= 0.9:
            score += 0.1
        
        return min(1.0, score)