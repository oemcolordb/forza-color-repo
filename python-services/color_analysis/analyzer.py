import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from colorspacious import cspace_convert
import colorsys
from typing import List, Dict, Tuple, Optional
import json

class AdvancedColorAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        
    def hsb_to_lab(self, h: float, s: float, b: float) -> Tuple[float, float, float]:
        """Convert HSB to LAB color space for perceptual analysis"""
        # HSB to RGB
        r, g, b_rgb = colorsys.hsv_to_rgb(h, s, b)
        rgb = [r, g, b_rgb]
        
        # RGB to LAB using colorspacious
        try:
            lab = cspace_convert(rgb, "sRGB1", "CIELab")
            return tuple(lab)
        except:
            # Fallback to simple conversion
            return (r * 100, (g - 0.5) * 200, (b_rgb - 0.5) * 200)
    
    def analyze_color_distribution(self, colors_data: List[Dict]) -> Dict:
        """Advanced color distribution analysis"""
        if not colors_data:
            return {"error": "No color data provided"}
        
        # Convert to LAB color space
        lab_colors = []
        color_info = []
        
        for color in colors_data:
            try:
                h = color.get('color1', {}).get('h', 0)
                s = color.get('color1', {}).get('s', 0)
                b = color.get('color1', {}).get('b', 0)
                
                lab = self.hsb_to_lab(h, s, b)
                lab_colors.append(lab)
                color_info.append({
                    'make': color.get('make', ''),
                    'colorName': color.get('colorName', ''),
                    'colorType': color.get('colorType', ''),
                    'lab': lab
                })
            except Exception as e:
                continue
        
        if not lab_colors:
            return {"error": "No valid colors to analyze"}
        
        lab_array = np.array(lab_colors)
        
        # Cluster analysis
        kmeans = KMeans(n_clusters=min(20, len(lab_colors)), random_state=42)
        clusters = kmeans.fit_predict(lab_array)
        
        # Color harmony analysis
        harmony_scores = self._calculate_harmony_scores(lab_array)
        
        # Manufacturer analysis
        make_analysis = self._analyze_by_manufacturer(color_info)
        
        # Color type distribution
        type_distribution = self._analyze_color_types(color_info)
        
        return {
            "total_colors": len(lab_colors),
            "dominant_clusters": self._analyze_clusters(lab_array, clusters, kmeans),
            "harmony_analysis": harmony_scores,
            "manufacturer_analysis": make_analysis,
            "color_type_distribution": type_distribution,
            "perceptual_stats": self._calculate_perceptual_stats(lab_array)
        }
    
    def _calculate_harmony_scores(self, lab_colors: np.ndarray) -> Dict:
        """Calculate color harmony metrics"""
        if len(lab_colors) < 2:
            return {"harmony_score": 0, "contrast_score": 0}
        
        # Calculate average color distances
        distances = []
        for i in range(len(lab_colors)):
            for j in range(i + 1, len(lab_colors)):
                dist = np.linalg.norm(lab_colors[i] - lab_colors[j])
                distances.append(dist)
        
        avg_distance = np.mean(distances)
        contrast_score = np.std(distances)
        
        # Harmony score (lower distance = more harmonious)
        harmony_score = max(0, 100 - avg_distance)
        
        return {
            "harmony_score": float(harmony_score),
            "contrast_score": float(contrast_score),
            "average_distance": float(avg_distance)
        }
    
    def _analyze_clusters(self, lab_colors: np.ndarray, clusters: np.ndarray, kmeans) -> List[Dict]:
        """Analyze color clusters"""
        cluster_info = []
        
        for i in range(kmeans.n_clusters):
            cluster_mask = clusters == i
            cluster_colors = lab_colors[cluster_mask]
            
            if len(cluster_colors) > 0:
                centroid = kmeans.cluster_centers_[i]
                cluster_info.append({
                    "cluster_id": int(i),
                    "size": int(np.sum(cluster_mask)),
                    "percentage": float(np.sum(cluster_mask) / len(clusters) * 100),
                    "centroid_lab": centroid.tolist(),
                    "variance": float(np.var(cluster_colors))
                })
        
        return sorted(cluster_info, key=lambda x: x['size'], reverse=True)
    
    def _analyze_by_manufacturer(self, color_info: List[Dict]) -> Dict:
        """Analyze color distribution by manufacturer"""
        make_counts = {}
        make_colors = {}
        
        for color in color_info:
            make = color['make']
            if make:
                make_counts[make] = make_counts.get(make, 0) + 1
                if make not in make_colors:
                    make_colors[make] = []
                make_colors[make].append(color['lab'])
        
        # Calculate diversity for each manufacturer
        make_analysis = {}
        for make, colors in make_colors.items():
            if len(colors) > 1:
                colors_array = np.array(colors)
                diversity = np.mean([np.linalg.norm(colors_array[i] - colors_array[j]) 
                                   for i in range(len(colors)) 
                                   for j in range(i + 1, len(colors))])
            else:
                diversity = 0
            
            make_analysis[make] = {
                "count": make_counts[make],
                "diversity_score": float(diversity)
            }
        
        return dict(sorted(make_analysis.items(), key=lambda x: x[1]['count'], reverse=True)[:20])
    
    def _analyze_color_types(self, color_info: List[Dict]) -> Dict:
        """Analyze distribution of color types"""
        type_counts = {}
        for color in color_info:
            color_type = color['colorType']
            type_counts[color_type] = type_counts.get(color_type, 0) + 1
        
        total = sum(type_counts.values())
        return {
            color_type: {
                "count": count,
                "percentage": round(count / total * 100, 2)
            }
            for color_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
        }
    
    def _calculate_perceptual_stats(self, lab_colors: np.ndarray) -> Dict:
        """Calculate perceptual color statistics"""
        if len(lab_colors) == 0:
            return {}
        
        l_values = lab_colors[:, 0]  # Lightness
        a_values = lab_colors[:, 1]  # Green-Red
        b_values = lab_colors[:, 2]  # Blue-Yellow
        
        return {
            "lightness": {
                "mean": float(np.mean(l_values)),
                "std": float(np.std(l_values)),
                "range": [float(np.min(l_values)), float(np.max(l_values))]
            },
            "green_red_axis": {
                "mean": float(np.mean(a_values)),
                "std": float(np.std(a_values)),
                "range": [float(np.min(a_values)), float(np.max(a_values))]
            },
            "blue_yellow_axis": {
                "mean": float(np.mean(b_values)),
                "std": float(np.std(b_values)),
                "range": [float(np.min(b_values)), float(np.max(b_values))]
            }
        }

    def find_color_trends(self, colors_data: List[Dict], timeframe: str = "year") -> Dict:
        """Analyze color trends over time"""
        # Group by year if available
        yearly_data = {}
        for color in colors_data:
            year = color.get('year')
            if year:
                if year not in yearly_data:
                    yearly_data[year] = []
                yearly_data[year].append(color)
        
        if not yearly_data:
            return {"error": "No temporal data available"}
        
        trends = {}
        for year, year_colors in yearly_data.items():
            analysis = self.analyze_color_distribution(year_colors)
            trends[year] = {
                "total_colors": analysis.get("total_colors", 0),
                "top_manufacturers": list(analysis.get("manufacturer_analysis", {}).keys())[:5],
                "dominant_types": list(analysis.get("color_type_distribution", {}).keys())[:3]
            }
        
        return trends