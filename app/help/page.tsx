import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help - Forza Color Universe',
  description: 'Get help using Forza Color Universe. Find answers to common questions and learn how to use our features.',
}

export default function Help() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Help & Support</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Browsing Colors</h3>
                <p className="leading-relaxed">Use the search bar to find colors by name, manufacturer, or model. Click on any color card to view detailed information including HSB values and color type.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Filtering Results</h3>
                <p className="leading-relaxed">Use the filter controls to narrow down results by manufacturer, color type, or other criteria. Filters can be combined for more precise searches.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">How many colors are in the database?</h3>
                <p className="leading-relaxed">Our database contains over 10,000 official automotive paint colors extracted from Forza racing games.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Can I use these colors for commercial projects?</h3>
                <p className="leading-relaxed">The color data is provided for reference purposes. Please check with the original manufacturers for commercial usage rights.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">How do I save my favorite colors?</h3>
                <p className="leading-relaxed">Click the heart icon on any color card to add it to your favorites. Your favorites are saved locally in your browser.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Can I export color data?</h3>
                <p className="leading-relaxed">Yes, use the export functionality to download color information in various formats for use in design applications.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Is the site mobile-friendly?</h3>
                <p className="leading-relaxed">Absolutely! The site is fully responsive and optimized for mobile devices with touch-friendly controls.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Technical Support</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Browser Compatibility</h3>
                <p className="leading-relaxed">We support all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, please use the latest version of your browser.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Performance Issues</h3>
                <p className="leading-relaxed">If you experience slow loading, try clearing your browser cache or switching to a less resource-intensive view mode.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
            <p className="leading-relaxed mb-4">
              Need additional help? We're here to assist you:
            </p>
            <ul className="space-y-2">
              <li>• Email: support@forza-colors.com</li>
              <li>• GitHub Issues: Report bugs and feature requests</li>
              <li>• GitHub Discussions: Community support and questions</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}