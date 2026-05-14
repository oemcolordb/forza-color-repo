import os
import json
import requests
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
try:
    from instagrapi import Client
except ImportError:
    print("instagrapi not installed. Run: pip install instagrapi")
    exit(1)

def generate_brand_image(color_data):
    """Creates a premium Instagram-ready image for a color."""
    width, height = 1080, 1350 # Instagram Portrait
    
    # Create background with the color
    hex_color = color_data.get('hex', '#FFFFFF')
    img = Image.new('RGB', (width, height), hex_color)
    draw = ImageDraw.Draw(img)
    
    # Add a stylish overlay gradient (simple darkening at bottom)
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for i in range(height // 2, height):
        alpha = int((i - height // 2) / (height // 2) * 200)
        overlay_draw.line([(0, i), (width, i)], fill=(0, 0, 0, alpha))
    img.paste(overlay, (0, 0), overlay)
    
    # Load fonts (fallback to default if necessary)
    try:
        font_large = ImageFont.truetype("arial.ttf", 80)
        font_small = ImageFont.truetype("arial.ttf", 40)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
        
    # Text content
    brand_name = "FORZA COLOR UNIVERSE"
    color_name = color_data.get('name', 'OEM COLOR').upper()
    paint_type = color_data.get('type', 'Special').upper()
    
    # Draw texts
    draw.text((width//2, height - 300), color_name, font=font_large, fill="white", anchor="ms")
    draw.text((width//2, height - 200), f"{paint_type} | {hex_color}", font=font_small, fill="white", anchor="ms", opacity=150)
    draw.text((width//2, 100), brand_name, font=font_small, fill="white", anchor="mt")
    
    save_path = f"color_of_the_day_{datetime.now().strftime('%Y%m%d')}.jpg"
    img.convert('RGB').save(save_path, quality=95)
    return save_path

def post_to_instagram():
    # Load credentials from env
    username = os.getenv("IG_USERNAME")
    password = os.getenv("IG_PASSWORD")
    
    if not username or not password:
        print("Error: IG_USERNAME or IG_PASSWORD not set in environment.")
        return

    # Mock color data (In production, fetch from /api/analytics/daily-aggregate)
    # For now, we take a random popular one
    color_data = {
        "name": "Midnight Purple II",
        "hex": "#2D1B36",
        "type": "Pearlescent"
    }
    
    print(f"🎨 Generating image for {color_data['name']}...")
    image_path = generate_brand_image(color_data)
    
    print("🚀 Logging into Instagram...")
    cl = Client()
    try:
        cl.login(username, password)
        
        caption = (
            f"🎨 Color of the Day: {color_data['name']}\n\n"
            f"Exact match for your custom builds in #ForzaHorizon5. "
            f"Get the full paint codes at our link in bio! 🏁\n\n"
            f"#ForzaColorUniverse #FH5 #ForzaMotorsport #CarColors #JDM #MidnightPurple"
        )
        
        print("📸 Uploading post...")
        cl.photo_upload(image_path, caption)
        print("✅ Successfully posted to Instagram!")
        
    except Exception as e:
        print(f"❌ Instagram post failed: {e}")
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

if __name__ == "__main__":
    post_to_instagram()
