import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Forza Color Universe',
  description: 'Privacy Policy for Forza Color Universe. Learn how we handle your data and protect your privacy.',
}

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              Forza Color Universe is designed with privacy in mind. We collect minimal information to provide our services:
            </p>
            <ul className="space-y-2">
              <li>• Usage analytics (anonymous, aggregated data)</li>
              <li>• Local storage preferences (theme, favorites)</li>
              <li>• Technical information (browser type, device type for optimization)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Use Information</h2>
            <p className="leading-relaxed mb-4">The information we collect is used to:</p>
            <ul className="space-y-2">
              <li>• Improve website performance and user experience</li>
              <li>• Provide personalized features (saved favorites, theme preferences)</li>
              <li>• Analyze usage patterns to enhance our services</li>
              <li>• Ensure technical functionality across different devices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Storage</h2>
            <p className="leading-relaxed mb-4">
              Your preferences and favorites are stored locally in your browser using localStorage. 
              This data never leaves your device and is not transmitted to our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="leading-relaxed mb-4">
              We may use third-party services for analytics and performance monitoring. 
              These services have their own privacy policies and data handling practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
            <p className="leading-relaxed mb-4">
              We use minimal cookies and local storage to remember your preferences such as 
              theme selection and favorite colors. These enhance your user experience and 
              are not used for tracking.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="space-y-2">
              <li>• Clear your local data at any time through browser settings</li>
              <li>• Disable cookies and local storage (may affect functionality)</li>
              <li>• Request information about data we may have collected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="leading-relaxed mb-4">
              We may update this privacy policy from time to time. We will notify users of 
              any material changes by updating the date at the top of this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at 
              support@forza-colors.com or through our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}