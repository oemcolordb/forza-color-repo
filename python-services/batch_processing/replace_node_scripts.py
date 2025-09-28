#!/usr/bin/env python3
"""
Python replacement for Node.js scripts in /scripts directory
Provides enhanced functionality with better color science and ML capabilities
"""

import asyncio
import json
import sys
import os
from pathlib import Path
from typing import List, Dict, Any
import argparse

# Add parent directory for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from color_analysis.analyzer import AdvancedColorAnalyzer
from batch_processing.color_processor import BatchColorProcessor

class ScriptReplacements:
    def __init__(self):
        self.analyzer = AdvancedColorAnalyzer()
        self.processor = BatchColorProcessor()
        
        # Path to the original colorData.ts file
        self.color_data_path = Path(__file__).parent.parent.parent / 'services' / 'colorData.ts'
    
    async def add_new_colors_to_database(self, new_colors: List[Dict]):
        """
        Enhanced replacement for addNewColorsToDatabase.js
        Adds intelligent duplicate detection and color validation
        """
        print("🎨 Adding new colors to database with advanced processing...")
        
        try:
            # Load existing colors
            existing_colors = self._load_existing_colors()
            print(f"📊 Loaded {len(existing_colors)} existing colors")
            
            # Process new colors
            processed_new = await self._process_new_colors(new_colors)
            print(f"✨ Processed {len(processed_new)} new colors")
            
            # Merge with existing colors
            all_colors = existing_colors + processed_new
            
            # Remove duplicates using advanced similarity detection
            deduplicated = self.processor._remove_duplicates(all_colors)
            print(f"🔄 Removed duplicates: {len(all_colors)} → {len(deduplicated)}")
            
            # Save updated database
            self._save_color_database(deduplicated)
            
            # Generate statistics
            stats = self._generate_addition_stats(existing_colors, processed_new, deduplicated)
            
            print("✅ Database update complete!")
            print(f"📈 Added {stats['net_new_colors']} new colors")
            print(f"📊 Total colors: {stats['total_colors']}")
            
            return stats
            
        except Exception as e:
            print(f"❌ Failed to add colors: {e}")
            raise
    
    async def analyze_color_types(self):
        """
        Enhanced replacement for analyzeColorTypes.js
        Provides detailed color type analysis with ML insights
        """
        print("🔍 Analyzing color types with advanced analytics...")
        
        try:
            # Load color data
            colors = self._load_existing_colors()
            
            # Perform comprehensive analysis
            analysis = self.analyzer.analyze_color_distribution(colors)
            
            # Enhanced color type analysis
            type_analysis = self._enhanced_type_analysis(colors)
            
            # Generate recommendations for missing types
            recommendations = self._generate_type_recommendations(type_analysis)
            
            # Save analysis results
            analysis_file = Path(__file__).parent / 'color_type_analysis.json'
            with open(analysis_file, 'w') as f:
                json.dump({
                    'analysis': analysis,
                    'type_analysis': type_analysis,
                    'recommendations': recommendations,
                    'timestamp': asyncio.get_event_loop().time()
                }, f, indent=2)
            
            print("📊 Color type analysis complete!")
            print(f"🎯 Found {len(type_analysis)} color types")
            print(f"💡 Generated {len(recommendations)} recommendations")
            
            return {
                'analysis': analysis,
                'type_analysis': type_analysis,
                'recommendations': recommendations
            }
            
        except Exception as e:
            print(f"❌ Analysis failed: {e}")
            raise
    
    async def match_colors_to_models(self):
        """
        Enhanced replacement for matchColorToModels.js
        Uses ML to improve color-to-model associations
        """
        print("🚗 Matching colors to models with ML enhancement...")
        
        try:
            colors = self._load_existing_colors()
            
            # Group colors by make and model
            model_groups = self._group_by_model(colors)
            
            # Analyze color patterns for each model
            model_analysis = {}
            for key, model_colors in model_groups.items():
                if len(model_colors) > 1:
                    analysis = self.analyzer.analyze_color_distribution(model_colors)
                    model_analysis[key] = {
                        'color_count': len(model_colors),
                        'analysis': analysis,
                        'dominant_types': self._get_dominant_types(model_colors),
                        'color_diversity': analysis.get('perceptual_stats', {})
                    }
            
            # Find models with unusual color patterns
            unusual_patterns = self._find_unusual_patterns(model_analysis)
            
            # Generate matching improvements
            improvements = self._suggest_matching_improvements(colors, model_analysis)
            
            print("🎯 Color-to-model matching analysis complete!")
            print(f"🚗 Analyzed {len(model_analysis)} model groups")
            print(f"⚠️ Found {len(unusual_patterns)} unusual patterns")
            
            return {
                'model_analysis': model_analysis,
                'unusual_patterns': unusual_patterns,
                'improvements': improvements
            }
            
        except Exception as e:
            print(f"❌ Matching analysis failed: {e}")
            raise
    
    async def remove_duplicate_colors(self):
        """
        Enhanced replacement for removeDuplicateColors.js
        Uses perceptual color distance for better duplicate detection
        """
        print("🔄 Removing duplicate colors with perceptual analysis...")
        
        try:
            colors = self._load_existing_colors()
            original_count = len(colors)
            
            print(f"📊 Starting with {original_count} colors")
            
            # Advanced duplicate removal
            deduplicated = self.processor._remove_duplicates(colors)
            
            # Additional validation pass
            validated = self.processor._validate_colors(deduplicated)
            
            # Save cleaned database
            self._save_color_database(validated)
            
            removed_count = original_count - len(validated)
            
            print("✅ Duplicate removal complete!")
            print(f"🗑️ Removed {removed_count} duplicates")
            print(f"📊 Final count: {len(validated)} colors")
            
            return {
                'original_count': original_count,
                'final_count': len(validated),
                'removed_count': removed_count,
                'removal_percentage': (removed_count / original_count) * 100
            }
            
        except Exception as e:
            print(f"❌ Duplicate removal failed: {e}")
            raise
    
    async def update_color_data(self, source_file: str = None):
        """
        Enhanced replacement for updateColorData.js
        Comprehensive database update with validation and enhancement
        """
        print("🔄 Updating color database with comprehensive processing...")
        
        try:
            if source_file:
                # Load from external source
                with open(source_file, 'r') as f:
                    new_data = json.load(f)
            else:
                # Use existing database
                new_data = self._load_existing_colors()
            
            # Process through full pipeline
            processed_data = await self.processor.process_color_database(
                input_file=str(self.color_data_path),
                output_file=None
            )
            
            # Save updated database
            self._save_color_database(processed_data)
            
            # Generate update report
            report = self._generate_update_report(processed_data)
            
            print("✅ Color database update complete!")
            print(f"📊 Processed {len(processed_data)} colors")
            
            return report
            
        except Exception as e:
            print(f"❌ Database update failed: {e}")
            raise
    
    def _load_existing_colors(self) -> List[Dict]:
        """Load existing color data from TypeScript file"""
        if not self.color_data_path.exists():
            return []
        
        return self.processor._parse_typescript_colors(self.color_data_path)
    
    def _save_color_database(self, colors: List[Dict]):
        """Save color database back to TypeScript file"""
        self.processor._save_typescript_colors(colors, self.color_data_path)
    
    async def _process_new_colors(self, new_colors: List[Dict]) -> List[Dict]:
        """Process new colors with validation and enhancement"""
        # Validate new colors
        validated = self.processor._validate_colors(new_colors)
        
        # Enhance with metadata
        enhanced = self.processor._enhance_color_data(validated)
        
        return enhanced
    
    def _generate_addition_stats(self, existing: List[Dict], new: List[Dict], final: List[Dict]) -> Dict:
        """Generate statistics for color addition"""
        return {
            'original_count': len(existing),
            'new_colors_provided': len(new),
            'total_colors': len(final),
            'net_new_colors': len(final) - len(existing),
            'duplicate_rate': (len(existing) + len(new) - len(final)) / (len(existing) + len(new)) * 100
        }
    
    def _enhanced_type_analysis(self, colors: List[Dict]) -> Dict:
        """Enhanced color type analysis"""
        type_stats = {}
        
        for color in colors:
            color_type = color.get('colorType', 'Unknown')
            if color_type not in type_stats:
                type_stats[color_type] = {
                    'count': 0,
                    'makes': set(),
                    'years': set(),
                    'colors': []
                }
            
            type_stats[color_type]['count'] += 1
            type_stats[color_type]['makes'].add(color.get('make', ''))
            if color.get('year'):
                type_stats[color_type]['years'].add(color['year'])
            type_stats[color_type]['colors'].append(color)
        
        # Convert sets to lists for JSON serialization
        for type_name, stats in type_stats.items():
            stats['makes'] = list(stats['makes'])
            stats['years'] = list(stats['years'])
            stats['unique_makes'] = len(stats['makes'])
            stats['year_range'] = [min(stats['years']), max(stats['years'])] if stats['years'] else None
            # Remove colors list to reduce size
            del stats['colors']
        
        return type_stats
    
    def _generate_type_recommendations(self, type_analysis: Dict) -> List[Dict]:
        """Generate recommendations for color types that need more colors"""
        recommendations = []
        
        for type_name, stats in type_analysis.items():
            if stats['count'] < 100:  # Threshold for "needs more colors"
                recommendations.append({
                    'color_type': type_name,
                    'current_count': stats['count'],
                    'recommended_additions': 100 - stats['count'],
                    'priority': 'high' if stats['count'] < 50 else 'medium',
                    'unique_makes': stats['unique_makes']
                })
        
        return sorted(recommendations, key=lambda x: x['current_count'])
    
    def _group_by_model(self, colors: List[Dict]) -> Dict[str, List[Dict]]:
        """Group colors by make and model"""
        groups = {}
        
        for color in colors:
            make = color.get('make', '')
            model = color.get('model', '')
            key = f"{make}_{model}" if model else make
            
            if key not in groups:
                groups[key] = []
            groups[key].append(color)
        
        return groups
    
    def _get_dominant_types(self, colors: List[Dict]) -> List[str]:
        """Get dominant color types for a group of colors"""
        type_counts = {}
        for color in colors:
            color_type = color.get('colorType', '')
            type_counts[color_type] = type_counts.get(color_type, 0) + 1
        
        return sorted(type_counts.keys(), key=lambda x: type_counts[x], reverse=True)[:3]
    
    def _find_unusual_patterns(self, model_analysis: Dict) -> List[Dict]:
        """Find models with unusual color patterns"""
        unusual = []
        
        for model_key, analysis in model_analysis.items():
            # Check for unusual patterns
            color_count = analysis['color_count']
            dominant_types = analysis['dominant_types']
            
            # Flag models with very few colors
            if color_count < 3:
                unusual.append({
                    'model': model_key,
                    'issue': 'too_few_colors',
                    'color_count': color_count
                })
            
            # Flag models with only one color type
            if len(dominant_types) == 1 and color_count > 5:
                unusual.append({
                    'model': model_key,
                    'issue': 'limited_color_variety',
                    'dominant_type': dominant_types[0],
                    'color_count': color_count
                })
        
        return unusual
    
    def _suggest_matching_improvements(self, colors: List[Dict], model_analysis: Dict) -> List[Dict]:
        """Suggest improvements for color-to-model matching"""
        improvements = []
        
        # Find colors without models
        no_model_colors = [c for c in colors if not c.get('model')]
        
        if no_model_colors:
            improvements.append({
                'type': 'missing_models',
                'count': len(no_model_colors),
                'suggestion': 'Add model information to colors without model data'
            })
        
        # Find makes with very few models
        make_model_counts = {}
        for model_key in model_analysis.keys():
            make = model_key.split('_')[0]
            make_model_counts[make] = make_model_counts.get(make, 0) + 1
        
        for make, model_count in make_model_counts.items():
            if model_count < 3:
                improvements.append({
                    'type': 'few_models_per_make',
                    'make': make,
                    'model_count': model_count,
                    'suggestion': f'Consider adding more model variants for {make}'
                })
        
        return improvements
    
    def _generate_update_report(self, processed_data: List[Dict]) -> Dict:
        """Generate comprehensive update report"""
        # Analyze the processed data
        analysis = self.analyzer.analyze_color_distribution(processed_data)
        
        return {
            'total_colors': len(processed_data),
            'analysis_summary': {
                'total_manufacturers': len(analysis.get('manufacturer_analysis', {})),
                'color_types': len(analysis.get('color_type_distribution', {})),
                'harmony_score': analysis.get('harmony_analysis', {}).get('harmony_score', 0)
            },
            'top_manufacturers': list(analysis.get('manufacturer_analysis', {}).keys())[:10],
            'color_type_distribution': analysis.get('color_type_distribution', {}),
            'processing_timestamp': asyncio.get_event_loop().time()
        }

async def main():
    """Main CLI interface for script replacements"""
    parser = argparse.ArgumentParser(description='Enhanced Python replacements for Node.js color scripts')
    parser.add_argument('command', choices=[
        'add-colors', 'analyze-types', 'match-models', 'remove-duplicates', 'update-database'
    ], help='Command to execute')
    parser.add_argument('--input', help='Input file path')
    parser.add_argument('--colors', help='JSON string of new colors to add')
    
    args = parser.parse_args()
    
    replacements = ScriptReplacements()
    
    try:
        if args.command == 'add-colors':
            if args.colors:
                new_colors = json.loads(args.colors)
            elif args.input:
                with open(args.input, 'r') as f:
                    new_colors = json.load(f)
            else:
                print("❌ Please provide --colors JSON or --input file")
                return
            
            result = await replacements.add_new_colors_to_database(new_colors)
            
        elif args.command == 'analyze-types':
            result = await replacements.analyze_color_types()
            
        elif args.command == 'match-models':
            result = await replacements.match_colors_to_models()
            
        elif args.command == 'remove-duplicates':
            result = await replacements.remove_duplicate_colors()
            
        elif args.command == 'update-database':
            result = await replacements.update_color_data(args.input)
        
        print(f"\n🎉 Command '{args.command}' completed successfully!")
        
    except Exception as e:
        print(f"💥 Command failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())