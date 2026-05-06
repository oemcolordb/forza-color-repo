#!/usr/bin/env python3
"""
Aggregate all FH5 maps into a single composite image with layered overlays.
Creates a visually pleasing composition with multiple map layers.
"""

from PIL import Image, ImageEnhance, ImageFilter, ImageOps
import os
import sys

def load_image(path, target_size=None):
    """Load an image and optionally resize it."""
    try:
        img = Image.open(path)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        if target_size:
            img = img.resize(target_size, Image.Resampling.LANCZOS)
        return img
    except Exception as e:
        print(f"Error loading {path}: {e}")
        return None

def create_map_composite():
    """Create a composite of all FH5 maps."""
    
    # Base directory
    base_dir = "f:/New folder/forza-color-repo/public"
    images_dir = f"{base_dir}/assets/images"
    maps_dir = f"{base_dir}/maps"
    output_dir = f"{base_dir}/assets/images"
    
    # Map files to composite (in order of layering)
    map_files = [
        # Base layer - main map
        (f"{maps_dir}/fh5-mexico.jpg", 1.0, "base"),
        
        # Biome overlay
        (f"{images_dir}/Forza-Horizon-5-Biome-Map.jpg", 0.35, "biome"),
        
        # XP boards overlay
        (f"{images_dir}/Forza-Horizon-5-XP-Boards-Map.jpg", 0.25, "xp"),
        
        # Fast travel boards
        (f"{images_dir}/forza-horizon-5-fast-travel-boards-locations-treasure-map-scaled.jpg", 0.30, "fasttravel"),
        
        # Additional map variant
        (f"{images_dir}/forza-horizon-5-map-1628536784401-1.jpg", 0.20, "variant"),
        
        # Jenny Brewer map
        (f"{images_dir}/ForzaHorizon5_JennyBrewer_Map01.jpg", 0.15, "jennybrewer"),
    ]
    
    # Find the base image dimensions
    base_img = None
    base_path = None
    for path, opacity, name in map_files:
        if name == "base":
            base_img = load_image(path)
            base_path = path
            break
    
    if not base_img:
        print("Error: Could not load base map image")
        return
    
    # Target size - use base map size but scaled down for web performance
    # Keep aspect ratio but max dimension 1920
    base_width, base_height = base_img.size
    max_dimension = 1920
    
    if base_width > max_dimension or base_height > max_dimension:
        scale = max_dimension / max(base_width, base_height)
        new_width = int(base_width * scale)
        new_height = int(base_height * scale)
        target_size = (new_width, new_height)
    else:
        target_size = (base_width, base_height)
    
    print(f"Creating composite at size: {target_size}")
    
    # Reload base at target size
    base_img = load_image(base_path, target_size)
    
    # Create composite canvas
    composite = Image.new('RGBA', target_size, (0, 0, 0, 255))
    
    # Process each layer
    for path, opacity, name in map_files:
        print(f"Processing {name} layer...")
        
        if not os.path.exists(path):
            print(f"  Warning: {path} not found, skipping...")
            continue
        
        img = load_image(path, target_size)
        if not img:
            continue
        
        if name == "base":
            # Base layer - full opacity
            composite = Image.alpha_composite(composite, img)
        else:
            # Overlay layers with reduced opacity
            # Create a copy with adjusted alpha
            overlay = img.copy()
            
            # Apply opacity to alpha channel
            if overlay.mode == 'RGBA':
                r, g, b, a = overlay.split()
                a = a.point(lambda x: int(x * opacity))
                overlay = Image.merge('RGBA', (r, g, b, a))
            else:
                overlay = overlay.convert('RGBA')
                r, g, b, a = overlay.split()
                a = a.point(lambda x: int(x * opacity))
                overlay = Image.merge('RGBA', (r, g, b, a))
            
            # Apply slight blur to overlays for better blending
            if name in ["biome", "xp"]:
                overlay = overlay.filter(ImageFilter.GaussianBlur(radius=1))
            
            # Composite the overlay
            composite = Image.alpha_composite(composite, overlay)
    
    # Post-processing for visual enhancement
    print("Applying final enhancements...")
    
    # Convert to RGB for saving
    final = composite.convert('RGB')
    
    # Slight contrast enhancement
    enhancer = ImageEnhance.Contrast(final)
    final = enhancer.enhance(1.1)
    
    # Slight color saturation boost
    enhancer = ImageEnhance.Color(final)
    final = enhancer.enhance(1.15)
    
    # Sharpen
    final = final.filter(ImageFilter.SHARPEN)
    
    # Save the composite
    output_path = f"{output_dir}/fh5-master-map-composite.jpg"
    final.save(output_path, 'JPEG', quality=90, optimize=True)
    print(f"\nComposite saved to: {output_path}")
    print(f"Final dimensions: {final.size}")
    print(f"File size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
    
    # Also create a PNG version for transparency support if needed
    output_path_png = f"{output_dir}/fh5-master-map-composite.png"
    composite.save(output_path_png, 'PNG', optimize=True)
    print(f"PNG version saved to: {output_path_png}")
    print(f"PNG size: {os.path.getsize(output_path_png) / 1024 / 1024:.2f} MB")
    
    return output_path

if __name__ == "__main__":
    try:
        from PIL import Image, ImageEnhance, ImageFilter
    except ImportError:
        print("PIL/Pillow not installed. Installing...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageEnhance, ImageFilter
    
    result = create_map_composite()
    if result:
        print("\n✓ Map aggregation complete!")
    else:
        print("\n✗ Failed to create composite")
        sys.exit(1)
