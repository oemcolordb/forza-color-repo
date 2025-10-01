import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - Forza Color Universe',
  description: 'Learn about Forza Color Universe, the comprehensive automotive color database from Forza racing games.',
}

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">About Forza Color Universe</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed mb-6">
              Forza Color Universe is the most comprehensive digital catalog of automotive paint colors 
              extracted from the Forza racing game series. We preserve and make accessible over 10,000 
              official automotive colors for enthusiasts, designers, and developers worldwide.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="space-y-3">
              <li>• 10,000+ official automotive paint colors from Forza games</li>
              <li>• Advanced search and filtering by manufacturer, model, and year</li>
              <li>• Detailed color analytics with HSB values and color types</li>
              <li>• Image color extraction and matching tools</li>
              <li>• Export functionality for design projects</li>
              <li>• Mobile-optimized experience for all devices</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Technology</h2>
            <p className="leading-relaxed mb-4">
              Built with modern web technologies including Next.js, TypeScript, and Tailwind CSS, 
              our platform delivers exceptional performance and accessibility. We utilize advanced 
              optimization techniques like virtual scrolling and lazy loading to handle large datasets efficiently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Acknowledgments</h2>
            <p className="leading-relaxed">
              Special thanks to ResinRonin for the original Forza color data extraction and curation, 
              and to the Forza Motorsport series for providing the source automotive color data that 
              makes this project possible.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}