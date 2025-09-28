#!/usr/bin/env python3
import json
import sys
import numpy as np
from sklearn.cluster import KMeans
from colorsys import rgb_to_hsv, hsv_to_rgb

def enhance_colors(colors):
    """Enhance color extraction using ML clustering and color theory"""
    try:
        if not colors:
            return colors
        
        # Convert to numpy array for processing
        rgb_values = np.array([color['rgb'] for color in colors])
        
        # Normalize RGB values
        rgb_normalized = rgb_values / 255.0
        
        # Apply K-means clustering to group similar colors
        n_clusters = min(len(colors), 8)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(rgb_normalized)
        
        enhanced_colors = []
        
        for i, cluster_id in enumerate(clusters):
            color = colors[i].copy()
            
            # Get cluster center (dominant color)
            center = kmeans.cluster_centers_[cluster_id]
            center_rgb = (center * 255).astype(int)
            
            # Update RGB with cluster center
            color['rgb'] = center_rgb.tolist()
            
            # Recalculate HSB
            r, g, b = center_rgb / 255.0
            h, s, v = rgb_to_hsv(r, g, b)
            color['hsb'] = {
                'h': round(h, 3),
                's': round(s, 3),
                'b': round(v, 3)
            }
            
            # Add color name prediction
            color['name'] = predict_color_name(center_rgb)
            
            enhanced_colors.append(color)
        
        # Remove duplicates and sort by percentage
        unique_colors = []
        seen_colors = set()
        
        for color in enhanced_colors:
            color_key = tuple(color['rgb'])
            if color_key not in seen_colors:
                seen_colors.add(color_key)
                unique_colors.append(color)
        
        return sorted(unique_colors, key=lambda x: x['percentage'], reverse=True)
        
    except Exception as e:
        print(f"Enhancement error: {e}", file=sys.stderr)
        return colors

def predict_color_name(rgb):
    """Simple color name prediction based on HSV values"""
    r, g, b = rgb / 255.0
    h, s, v = rgb_to_hsv(r, g, b)
    
    # Convert hue to degrees
    h_deg = h * 360
    
    # Basic color name mapping
    if s < 0.1:  # Low saturation (grayscale)
        if v < 0.2:
            return "Black"
        elif v < 0.5:
            return "Gray"
        else:
            return "White"
    
    # Color hue ranges
    if h_deg < 15 or h_deg >= 345:
        return "Red"
    elif h_deg < 45:
        return "Orange"
    elif h_deg < 75:
        return "Yellow"
    elif h_deg < 150:
        return "Green"
    elif h_deg < 210:
        return "Cyan"
    elif h_deg < 270:
        return "Blue"
    elif h_deg < 330:
        return "Magenta"
    else:
        return "Red"

def main():
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        colors = input_data.get('colors', [])
        
        # Enhance colors
        enhanced = enhance_colors(colors)
        
        # Output result
        result = {'colors': enhanced}
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Script error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()