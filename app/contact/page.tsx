import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Forza Color Universe',
  description: 'Get in touch with the Forza Color Universe team. Find support, report issues, or share feedback.',
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="leading-relaxed mb-8">
              We'd love to hear from you! Whether you have questions, feedback, or need support, 
              we're here to help make your experience with Forza Color Universe the best it can be.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Email Support</h3>
                <p className="text-blue-600 dark:text-blue-400">support@forza-colors.com</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  We typically respond within 24 hours
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">GitHub Repository</h3>
                <p className="leading-relaxed mb-2">
                  For bug reports, feature requests, and technical discussions:
                </p>
                <a 
                  href="https://github.com/xblackxscars123/forza-color-repo" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/xblackxscars123/forza-color-repo
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Community Discussions</h3>
                <p className="leading-relaxed mb-2">
                  Join our community for questions and discussions:
                </p>
                <a 
                  href="https://github.com/xblackxscars123/forza-color-repo/discussions" 
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Discussions
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-6">What We Can Help With</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Technical Support</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Website functionality issues</li>
                  <li>• Performance problems</li>
                  <li>• Browser compatibility</li>
                  <li>• Mobile app concerns</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Color Data</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Missing or incorrect color information</li>
                  <li>• Data export questions</li>
                  <li>• Color matching assistance</li>
                  <li>• API usage inquiries</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">General Inquiries</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Feature suggestions</li>
                  <li>• Partnership opportunities</li>
                  <li>• Media and press inquiries</li>
                  <li>• General feedback</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Response Times</h3>
              <ul className="space-y-1 text-sm">
                <li>• Email: Within 24 hours</li>
                <li>• GitHub Issues: 1-3 business days</li>
                <li>• Community Discussions: Community-driven</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}