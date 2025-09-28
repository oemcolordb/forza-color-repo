import asyncio
import json
import os
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from typing import List, Dict, Tuple
import multiprocessing as mp
import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from color_analysis.analyzer import AdvancedColorAnalyzer

class BatchColorProcessor:
    def __init__(self, max_workers: int = None):
        self.max_workers = max_workers or mp.cpu_count()
        self.analyzer = AdvancedColorAnalyzer()
        
    async def process_color_database(self, input_file: str, output_file: str = None):
        """Process large color datasets efficiently"""
        print(f"🔄 Processing color database: {input_file}")
        
        try:
            # Load color data
            colors_data = self._load_color_data(input_file)
            print(f"📊 Loaded {len(colors_data)} colors")
            
            # Process in batches
            batch_size = 1000
            batches = [colors_data[i:i + batch_size] for i in range(0, len(colors_data), batch_size)]
            
            print(f"🔀 Processing {len(batches)} batches with {self.max_workers} workers")
            
            with ProcessPoolExecutor(max_workers=self.max_workers) as executor:
                tasks = []
                for i, batch in enumerate(batches):
                    task = asyncio.get_event_loop().run_in_executor(
                        executor, self._process_batch, batch, i
                    )
                    tasks.append(task)
                
                results = await asyncio.gather(*tasks)
            
            # Merge results
            processed_data = self._merge_batch_results(results)
            
            # Save processed data
            if output_file:
                self._save_processed_data(processed_data, output_file)
            
            print(f"✅ Processing complete: {len(processed_data)} colors processed")
            return processed_data
            
        except Exception as e:
            print(f"❌ Processing failed: {e}")
            raise
    
    def _load_color_data(self, input_file: str) -> List[Dict]:
        """Load color data from various formats"""
        file_path = Path(input_file)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_file}")
        
        if file_path.suffix == '.json':
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        elif file_path.suffix == '.ts':
            # Parse TypeScript color data file
            return self._parse_typescript_colors(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
    
    def _parse_typescript_colors(self, file_path: Path) -> List[Dict]:
        """Parse TypeScript colorData.ts file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract JSON array from TypeScript file
        start_marker = 'const colorData: CarColor[] = ['
        end_marker = '];'
        
        start_idx = content.find(start_marker)
        if start_idx == -1:
            raise ValueError("Could not find color data array in TypeScript file")
        
        start_idx += len(start_marker)
        end_idx = content.find(end_marker, start_idx)
        
        if end_idx == -1:
            raise ValueError("Could not find end of color data array")
        
        json_content = '[' + content[start_idx:end_idx] + ']'
        
        try:
            return json.loads(json_content)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in TypeScript file: {e}")
    
    def _process_batch(self, batch: List[Dict], batch_id: int) -> Dict:
        """Process a single batch of colors"""
        print(f"🔄 Processing batch {batch_id} ({len(batch)} colors)")
        
        try:
            # Remove duplicates within batch
            deduplicated = self._remove_duplicates(batch)
            
            # Validate color data
            validated = self._validate_colors(deduplicated)
            
            # Enhance with metadata
            enhanced = self._enhance_color_data(validated)
            
            # Analyze batch
            analyzer = AdvancedColorAnalyzer()
            analysis = analyzer.analyze_color_distribution(enhanced)
            
            return {
                'batch_id': batch_id,
                'colors': enhanced,
                'analysis': analysis,
                'stats': {
                    'original_count': len(batch),
                    'deduplicated_count': len(deduplicated),
                    'validated_count': len(validated),
                    'final_count': len(enhanced)
                }
            }
            
        except Exception as e:
            print(f"❌ Batch {batch_id} failed: {e}")
            return {
                'batch_id': batch_id,
                'colors': [],
                'error': str(e),
                'stats': {'original_count': len(batch), 'final_count': 0}
            }
    
    def _remove_duplicates(self, colors: List[Dict]) -> List[Dict]:
        """Advanced duplicate detection using color similarity"""
        if len(colors) <= 1:
            return colors
        
        # Convert colors to feature vectors for clustering
        features = []
        for color in colors:
            try:
                h1 = color.get('color1', {}).get('h', 0)
                s1 = color.get('color1', {}).get('s', 0)
                b1 = color.get('color1', {}).get('b', 0)
                
                # Create feature vector
                features.append([h1, s1, b1])
            except:
                features.append([0, 0, 0])
        
        # Use DBSCAN to find similar colors
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(features)
        
        clustering = DBSCAN(eps=0.1, min_samples=1)
        clusters = clustering.fit_predict(scaled_features)
        
        # Keep one representative from each cluster
        unique_colors = []
        seen_clusters = set()
        
        for i, cluster_id in enumerate(clusters):
            if cluster_id not in seen_clusters:
                unique_colors.append(colors[i])
                seen_clusters.add(cluster_id)
        
        return unique_colors
    
    def _validate_colors(self, colors: List[Dict]) -> List[Dict]:
        """Validate color data structure and values"""
        validated = []
        
        for color in colors:
            try:
                # Check required fields
                required_fields = ['make', 'colorName', 'colorType', 'color1', 'color2']
                if not all(field in color for field in required_fields):
                    continue
                
                # Validate color values
                for color_key in ['color1', 'color2']:
                    color_obj = color[color_key]
                    if not isinstance(color_obj, dict):
                        continue
                    
                    # Check HSB values are in valid ranges
                    h = color_obj.get('h', 0)
                    s = color_obj.get('s', 0)
                    b = color_obj.get('b', 0)
                    
                    if not (0 <= h <= 1 and 0 <= s <= 1 and 0 <= b <= 1):
                        continue
                
                # Clean up data
                cleaned_color = {
                    'make': str(color['make']).strip(),
                    'model': str(color.get('model', '')).strip(),
                    'year': color.get('year'),
                    'colorName': str(color['colorName']).strip(),
                    'colorType': str(color['colorType']).strip(),
                    'color1': color['color1'],
                    'color2': color['color2']
                }
                
                validated.append(cleaned_color)
                
            except Exception:
                continue
        
        return validated
    
    def _enhance_color_data(self, colors: List[Dict]) -> List[Dict]:
        """Enhance color data with additional metadata"""
        enhanced = []
        
        for color in colors:
            try:
                # Add computed properties
                enhanced_color = color.copy()
                
                # Calculate color temperature
                h1 = color['color1']['h']
                s1 = color['color1']['s']
                b1 = color['color1']['b']
                
                enhanced_color['metadata'] = {
                    'color_temperature': self._calculate_color_temperature(h1, s1, b1),
                    'vibrancy': s1 * b1,
                    'is_metallic': 'Metal' in color['colorType'],
                    'is_two_tone': 'Two-Tone' in color['colorType'],
                    'brightness_category': self._categorize_brightness(b1),
                    'saturation_category': self._categorize_saturation(s1)
                }
                
                enhanced.append(enhanced_color)
                
            except Exception:
                enhanced.append(color)
        
        return enhanced
    
    def _calculate_color_temperature(self, h: float, s: float, b: float) -> str:
        """Calculate color temperature category"""
        if h < 0.17 or h > 0.83:  # Red range
            return 'warm'
        elif 0.17 <= h <= 0.33:  # Yellow range
            return 'warm'
        elif 0.33 <= h <= 0.67:  # Green/Cyan range
            return 'cool'
        else:  # Blue/Purple range
            return 'cool'
    
    def _categorize_brightness(self, brightness: float) -> str:
        """Categorize brightness level"""
        if brightness < 0.3:
            return 'dark'
        elif brightness < 0.7:
            return 'medium'
        else:
            return 'light'
    
    def _categorize_saturation(self, saturation: float) -> str:
        """Categorize saturation level"""
        if saturation < 0.3:
            return 'muted'
        elif saturation < 0.7:
            return 'moderate'
        else:
            return 'vibrant'
    
    def _merge_batch_results(self, results: List[Dict]) -> List[Dict]:
        """Merge results from all batches"""
        all_colors = []
        total_stats = {
            'total_batches': len(results),
            'successful_batches': 0,
            'failed_batches': 0,
            'total_original': 0,
            'total_final': 0
        }
        
        for result in results:
            if 'error' not in result:
                all_colors.extend(result['colors'])
                total_stats['successful_batches'] += 1
            else:
                total_stats['failed_batches'] += 1
            
            stats = result.get('stats', {})
            total_stats['total_original'] += stats.get('original_count', 0)
            total_stats['total_final'] += stats.get('final_count', 0)
        
        print(f"📊 Batch processing stats: {total_stats}")
        return all_colors
    
    def _save_processed_data(self, data: List[Dict], output_file: str):
        """Save processed data to file"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        if output_path.suffix == '.json':
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        elif output_path.suffix == '.ts':
            self._save_typescript_colors(data, output_path)
        else:
            raise ValueError(f"Unsupported output format: {output_path.suffix}")
        
        print(f"💾 Saved processed data to: {output_file}")
    
    def _save_typescript_colors(self, data: List[Dict], output_path: Path):
        """Save data as TypeScript file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("import type { CarColor } from '../app/types/color'\n\n")
            f.write("// @ts-ignore - Large array causes TypeScript complexity issues\n")
            f.write("const colorData: CarColor[] = ")
            f.write(json.dumps(data, indent=2))
            f.write("\n\nexport default colorData\n")

async def main():
    """Main function for batch processing"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch process Forza color database')
    parser.add_argument('input_file', help='Input color data file (.json or .ts)')
    parser.add_argument('-o', '--output', help='Output file path')
    parser.add_argument('-w', '--workers', type=int, help='Number of worker processes')
    
    args = parser.parse_args()
    
    processor = BatchColorProcessor(max_workers=args.workers)
    
    try:
        await processor.process_color_database(
            input_file=args.input_file,
            output_file=args.output
        )
        print("🎉 Batch processing completed successfully!")
        
    except Exception as e:
        print(f"💥 Batch processing failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())