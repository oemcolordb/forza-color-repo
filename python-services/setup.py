#!/usr/bin/env python3
"""
Setup script for Forza Color Universe Python Services
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")

def install_requirements():
    """Install Python requirements"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    # Upgrade pip first
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip")
    
    # Install requirements
    result = run_command(
        f"{sys.executable} -m pip install -r {requirements_file}",
        "Installing Python dependencies"
    )
    
    return result is not None

def setup_redis():
    """Setup Redis (optional)"""
    print("🔄 Checking Redis availability...")
    
    try:
        import redis
        client = redis.Redis(host='localhost', port=6379, db=0)
        client.ping()
        print("✅ Redis is available and running")
        return True
    except ImportError:
        print("⚠️ Redis Python client not installed")
        return False
    except Exception:
        print("⚠️ Redis server not running (optional - caching will be disabled)")
        return False

def create_directories():
    """Create necessary directories"""
    base_dir = Path(__file__).parent
    directories = [
        base_dir / "logs",
        base_dir / "models",
        base_dir / "cache",
        base_dir / "temp"
    ]
    
    for directory in directories:
        directory.mkdir(exist_ok=True)
        print(f"📁 Created directory: {directory}")

def test_services():
    """Test that all services can be imported"""
    print("🧪 Testing service imports...")
    
    try:
        from color_analysis.analyzer import AdvancedColorAnalyzer
        print("✅ Color analyzer import successful")
        
        from ml_services.color_matcher import AdvancedColorMatcher
        print("✅ Color matcher import successful")
        
        from ml_services.image_processor import AdvancedImageProcessor
        print("✅ Image processor import successful")
        
        # Test basic functionality
        analyzer = AdvancedColorAnalyzer()
        test_colors = [{
            'make': 'Test',
            'model': 'Test',
            'year': 2024,
            'colorName': 'Test Red',
            'colorType': 'Normal',
            'color1': {'h': 0.0, 's': 1.0, 'b': 1.0},
            'color2': {'h': 0.0, 's': 1.0, 'b': 1.0}
        }]
        
        result = analyzer.analyze_color_distribution(test_colors)
        if result and 'total_colors' in result:
            print("✅ Color analysis test successful")
        else:
            print("⚠️ Color analysis test returned unexpected result")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Service test failed: {e}")
        return False

def create_startup_scripts():
    """Create startup scripts for the API"""
    base_dir = Path(__file__).parent
    
    # Windows batch file
    batch_content = f"""@echo off
echo Starting Forza Color Universe Python API...
cd /d "{base_dir}"
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
pause
"""
    
    batch_file = base_dir / "start_api.bat"
    with open(batch_file, 'w') as f:
        f.write(batch_content)
    
    print(f"📝 Created startup script: {batch_file}")
    
    # Shell script for Unix systems
    shell_content = f"""#!/bin/bash
echo "Starting Forza Color Universe Python API..."
cd "{base_dir}"
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
"""
    
    shell_file = base_dir / "start_api.sh"
    with open(shell_file, 'w') as f:
        f.write(shell_content)
    
    # Make shell script executable
    try:
        os.chmod(shell_file, 0o755)
    except:
        pass
    
    print(f"📝 Created startup script: {shell_file}")

def create_config_file():
    """Create configuration file"""
    config_content = """{
  "api": {
    "host": "0.0.0.0",
    "port": 8000,
    "reload": true
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0,
    "enabled": false
  },
  "ml": {
    "max_workers": null,
    "batch_size": 1000,
    "cache_models": true
  },
  "image_processing": {
    "max_image_size": 800,
    "min_color_percentage": 0.02,
    "max_colors": 12
  }
}"""
    
    config_file = Path(__file__).parent / "config.json"
    if not config_file.exists():
        with open(config_file, 'w') as f:
            f.write(config_content)
        print(f"📝 Created configuration file: {config_file}")

def main():
    """Main setup function"""
    print("🚀 Setting up Forza Color Universe Python Services")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Install requirements
    if not install_requirements():
        print("❌ Failed to install requirements")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Setup Redis (optional)
    setup_redis()
    
    # Test services
    if not test_services():
        print("❌ Service tests failed")
        sys.exit(1)
    
    # Create startup scripts
    create_startup_scripts()
    
    # Create config file
    create_config_file()
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the API server:")
    print("   - Windows: double-click start_api.bat")
    print("   - Unix/Linux/Mac: ./start_api.sh")
    print("   - Manual: python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload")
    print("\n2. Test the API:")
    print("   - Open http://localhost:8000 in your browser")
    print("   - Check http://localhost:8000/docs for API documentation")
    print("\n3. Update your Next.js app to use the Python API:")
    print("   - API endpoint: http://localhost:8000/api/")
    print("   - See integration examples in the documentation")
    
    if not setup_redis():
        print("\n⚠️ Note: Redis is not available. Caching will be disabled.")
        print("   To enable caching, install and start Redis server.")

if __name__ == "__main__":
    main()