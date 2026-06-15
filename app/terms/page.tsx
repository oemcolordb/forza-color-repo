'use client'





export default function Terms() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16 rounded-xl bamboo-surface">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Forza Color Universe, you accept and agree to be bound by the
              terms and provision of this agreement. If you do not agree to abide by the above,
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Use License</h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily access Forza Color Universe for personal,
              non-commercial transitory viewing only. This is the grant of a license, not a transfer
              of title, and under this license you may not:
            </p>
            <ul className="space-y-2">
              <li>• Modify or copy the materials</li>
              <li>• Use the materials for any commercial purpose or for any public display</li>
              <li>• Attempt to reverse engineer any software contained on the website</li>
              <li>• Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Color Data Usage</h2>
            <p className="leading-relaxed mb-4">
              The automotive color data provided is extracted from Forza racing games and is
              intended for reference purposes only. Users should:
            </p>
            <ul className="space-y-2">
              <li>• Verify color accuracy for critical applications</li>
              <li>• Respect original manufacturer trademarks and copyrights</li>
              <li>• Not redistribute the complete database without permission</li>
              <li>• Credit Forza Color Universe when sharing individual colors</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
            <p className="leading-relaxed">
              The materials on Forza Color Universe are provided on an 'as is' basis. Forza Color
              Universe makes no warranties, expressed or implied, and hereby disclaims and negates
              all other warranties including without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitations</h2>
            <p className="leading-relaxed">
              In no event shall Forza Color Universe or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on Forza Color
              Universe, even if Forza Color Universe or an authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Accuracy of Materials</h2>
            <p className="leading-relaxed">
              The materials appearing on Forza Color Universe could include technical,
              typographical, or photographic errors. Forza Color Universe does not warrant that any
              of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
            <p className="leading-relaxed">
              Forza Color Universe may revise these terms of service at any time without notice. By
              using this website, you are agreeing to be bound by the then current version of these
              terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at
              support@forza-colors.com or through our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
