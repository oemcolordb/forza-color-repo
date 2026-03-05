from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import asyncio
import redis
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from color_analysis.analyzer import AdvancedColorAnalyzer
from ml_services.color_matcher import AdvancedColorMatcher
from ml_services.image_processor import AdvancedImageProcessor

app = FastAPI(
    title="Forza Color Universe API",
    description="Advanced color analysis and matching API for automotive colors",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://forza-colors.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
color_analyzer = AdvancedColorAnalyzer()
color_matcher = AdvancedColorMatcher()
image_processor = AdvancedImageProcessor()

# Redis for caching (optional)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_available = redis_client.ping()
except:
    redis_client = None
    redis_available = False

# Pydantic models
class ColorData(BaseModel):
    make: str
    model: str
    year: Optional[int]
    colorName: str
    colorType: str
    color1: Dict[str, float]
    color2: Dict[str, float]

class ExtractedColor(BaseModel):
    r: int
    g: int
    b: int
    h: float
    s: float
    l: float
    count: int

class ImageColorRequest(BaseModel):
    imageData: str
    colors: List[ColorData]

class ColorAnalysisRequest(BaseModel):
    colors: List[ColorData]
    analysisType: Optional[str] = "full"

class ColorMatchRequest(BaseModel):
    extractedColors: List[Dict]
    colors: List[ColorData]
    maxMatches: Optional[int] = 20

class RecommendationRequest(BaseModel):
    userPreferences: List[ColorData]
    colors: List[ColorData]

# Global color data storage
color_database = []

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Starting Forza Color Universe API...")
    
    # Load color data from Next.js service
    try:
        # In production, load from your colorData.ts file
        print("📊 Color database ready for loading...")
    except Exception as e:
        print(f"⚠️ Warning: Could not load color database: {e}")

@app.get("/")
async def root():
    return {
        "message": "Forza Color Universe API",
        "version": "1.0.0",
        "services": ["color_analysis", "color_matching", "image_processing"],
        "redis_available": redis_available
    }

@app.post("/api/load-colors")
async def load_colors(colors: List[ColorData]):
    """Load color database for analysis and matching"""
    global color_database
    
    try:
        color_database = [color.dict() for color in colors]
        
        # Initialize color matcher with loaded data
        color_matcher.load_colors(color_database)
        
        return {
            "success": True,
            "message": f"Loaded {len(color_database)} colors",
            "total_colors": len(color_database)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load colors: {str(e)}")

@app.post("/api/analyze-colors")
async def analyze_colors(request: ColorAnalysisRequest):
    """Perform advanced color analysis"""
    cache_key = f"analysis:{hash(str(request.colors))}"
    
    # Check cache first
    if redis_available:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
        except:
            pass
    
    try:
        colors_data = [color.dict() for color in request.colors]
        analysis = color_analyzer.analyze_color_distribution(colors_data)
        
        # Add trend analysis if requested
        if request.analysisType == "trends":
            trends = color_analyzer.find_color_trends(colors_data)
            analysis["trends"] = trends
        
        result = {
            "success": True,
            "analysis": analysis,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # Cache result
        if redis_available:
            try:
                redis_client.setex(cache_key, 3600, json.dumps(result))  # Cache for 1 hour
            except:
                pass
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/match-colors")
async def match_colors(request: ColorMatchRequest):
    """Find matching automotive colors using ML"""
    try:
        # Use global color database if not provided
        colors_data = [color.dict() for color in request.colors] if request.colors else color_database
        
        if not colors_data:
            raise HTTPException(status_code=400, detail="No color database available")
        
        # Ensure color matcher is loaded
        if not color_matcher.matcher:
            color_matcher.load_colors(colors_data)
        
        matches = color_matcher.find_matches(
            request.extractedColors, 
            max_matches=request.maxMatches
        )
        
        return {
            "success": True,
            "matches": matches,
            "total_matches": len(matches),
            "extracted_colors_count": len(request.extractedColors)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Color matching failed: {str(e)}")

@app.post("/api/process-image")
async def process_image(request: ImageColorRequest):
    """Process image and extract colors with automotive matching"""
    try:
        # Extract colors from image
        extracted_colors = image_processor.process_image_data(request.imageData)
        
        if not extracted_colors:
            return {
                "success": False,
                "error": "No colors could be extracted from the image"
            }
        
        # Find matching automotive colors
        colors_data = [color.dict() for color in request.colors]
        
        if not color_matcher.matcher:
            color_matcher.load_colors(colors_data)
        
        matches = color_matcher.find_matches(extracted_colors, max_matches=20)
        
        return {
            "success": True,
            "extracted_colors": extracted_colors,
            "matches": matches,
            "extraction_stats": {
                "total_extracted": len(extracted_colors),
                "total_matches": len(matches),
                "processing_method": "advanced_ml"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get ML-powered color recommendations"""
    try:
        colors_data = [color.dict() for color in request.colors]
        user_prefs = [pref.dict() for pref in request.userPreferences]
        
        if not color_matcher.matcher:
            color_matcher.load_colors(colors_data)
        
        recommendations = color_matcher.get_color_recommendations(user_prefs)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "total_recommendations": len(recommendations),
            "based_on_preferences": len(user_prefs)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")

@app.get("/api/color-trends/{timeframe}")
async def get_color_trends(timeframe: str = "year"):
    """Get color trends analysis"""
    if not color_database:
        raise HTTPException(status_code=400, detail="No color database loaded")
    
    cache_key = f"trends:{timeframe}"
    
    # Check cache
    if redis_available:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
        except:
            pass
    
    try:
        trends = color_analyzer.find_color_trends(color_database, timeframe)
        
        result = {
            "success": True,
            "trends": trends,
            "timeframe": timeframe,
            "total_colors_analyzed": len(color_database)
        }
        
        # Cache result
        if redis_available:
            try:
                redis_client.setex(cache_key, 7200, json.dumps(result))  # Cache for 2 hours
            except:
                pass
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trends analysis failed: {str(e)}")


@app.get("/api/color-trends/predict")
async def predict_color_trends():
    """Return a simple forecast of which colors are likely to trend next year"""
    if not color_database:
        raise HTTPException(status_code=400, detail="No color database loaded")
    
    cache_key = "trends:predict"
    if redis_available:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
        except:
            pass
    
    try:
        forecast = color_analyzer.predict_next_year_trends(color_database)
        result = {
            "success": True,
            "forecast": forecast,
            "total_colors_analyzed": len(color_database)
        }
        if redis_available:
            try:
                redis_client.setex(cache_key, 7200, json.dumps(result))
            except:
                pass
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/api/stats")
async def get_api_stats():
    """Get API statistics and health"""
    return {
        "api_version": "1.0.0",
        "services_status": {
            "color_analyzer": "active",
            "color_matcher": "active" if color_matcher.matcher else "not_loaded",
            "image_processor": "active",
            "redis_cache": "active" if redis_available else "disabled"
        },
        "database_stats": {
            "colors_loaded": len(color_database),
            "matcher_trained": color_matcher.matcher is not None
        }
    }

@app.post("/api/batch-analyze")
async def batch_analyze_colors(colors_batch: List[List[ColorData]]):
    """Batch analyze multiple color sets"""
    try:
        results = []
        
        for i, color_set in enumerate(colors_batch):
            colors_data = [color.dict() for color in color_set]
            analysis = color_analyzer.analyze_color_distribution(colors_data)
            
            results.append({
                "batch_id": i,
                "analysis": analysis,
                "color_count": len(colors_data)
            })
        
        return {
            "success": True,
            "batch_results": results,
            "total_batches": len(colors_batch)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )