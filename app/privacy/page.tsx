export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">HIPAA Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold text-red-800 mb-2">HIPAA Notice of Privacy Practices</h2>
                <p className="text-red-700">
                  This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Protected Health Information (PHI)</h2>
              <p className="text-gray-600 mb-6">
                We are required by law to maintain the privacy of your Protected Health Information (PHI) and to provide you with this notice of our legal duties and privacy practices with respect to your PHI.
              </p>
              <p className="text-gray-600 mb-6">
                PHI includes information that may identify you and that relates to your past, present, or future physical or mental health or condition and related health care services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We May Use and Disclose Your PHI</h2>
              <p className="text-gray-600 mb-6">
                We may use and disclose your PHI for treatment, payment, and health care operations without your written authorization.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">For Treatment:</h3>
              <p className="text-gray-600 mb-6">
                We may use your PHI to provide, coordinate, or manage your health care and any related services.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">For Payment:</h3>
              <p className="text-gray-600 mb-6">
                We may use and disclose your PHI to bill and collect payment from you, your insurance company, or a third party.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">For Health Care Operations:</h3>
              <p className="text-gray-600 mb-6">
                We may use and disclose your PHI to support our business operations including quality assessment, licensing, and conducting training programs.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Other Permitted and Required Uses Without Authorization</h2>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li><strong>Public Health:</strong> As required by law for communicable disease reporting</li>
                <li><strong>Health Oversight:</strong> For audits, investigations, inspections, and licensure</li>
                <li><strong>Abuse/Neglect:</strong> To report suspected abuse or neglect</li>
                <li><strong>Legal Proceedings:</strong> In response to court orders or subpoenas</li>
                <li><strong>Law Enforcement:</strong> To identify or locate a suspect, fugitive, or missing person</li>
                <li><strong>Coroners/Medical Examiners:</strong> To identify a deceased person or determine cause of death</li>
                <li><strong>Organ/Tissue Donation:</strong> To organizations that handle organ procurement</li>
                <li><strong>Research:</strong> For research when approved by institutional review board</li>
                <li><strong>To Avert a Serious Threat:</strong> To prevent a serious threat to health or safety</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Uses and Disclosures Requiring Your Written Authorization</h2>
              <p className="text-gray-600 mb-6">
                Other uses and disclosures of your PHI not covered by this notice or the laws that apply to us will be made only with your written authorization.
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li>Marketing purposes</li>
                <li>Sale of PHI</li>
                <li>Psychotherapy notes</li>
                <li>Most other uses and disclosures not described above</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights Regarding Your PHI</h2>
              <p className="text-gray-600 mb-6">
                You have the following rights regarding the PHI we maintain about you:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li><strong>Right to Inspect and Copy:</strong> You have the right to inspect and obtain a copy of your PHI</li>
                <li><strong>Right to Amend:</strong> You have the right to request an amendment to your PHI</li>
                <li><strong>Right to an Accounting of Disclosures:</strong> You have the right to request an accounting of disclosures</li>
                <li><strong>Right to Request Restrictions:</strong> You have the right to request restrictions on certain uses and disclosures</li>
                <li><strong>Right to Request Confidential Communications:</strong> You have the right to request confidential communications</li>
                <li><strong>Right to a Paper Copy of This Notice:</strong> You have the right to a paper copy of this notice</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Security Measures</h2>
              <p className="text-gray-600 mb-6">
                We maintain appropriate administrative, physical, and technical safeguards to protect your PHI against unauthorized access, use, or disclosure.
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-6">
                <li><strong>Administrative Safeguards:</strong> Privacy policies, training programs, and security officer</li>
                <li><strong>Physical Safeguards:</strong> Secure facilities, access controls, and device security</li>
                <li><strong>Technical Safeguards:</strong> Encryption, access controls, audit logging, and secure transmission</li>
                <li><strong>Session Security:</strong> 15-minute automatic session timeout for all user sessions</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Breach Notification</h2>
              <p className="text-gray-600 mb-6">
                In the event of a breach of your unsecured PHI, we will notify you without unreasonable delay and no later than 60 days after the discovery of the breach.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to This Notice</h2>
              <p className="text-gray-600 mb-6">
                We reserve the right to change our privacy practices and to make the new provisions effective for all PHI we maintain. We will post the revised notice in our office and on our website.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Complaints</h2>
              <p className="text-gray-600 mb-6">
                If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of Health and Human Services.
              </p>
              <p className="text-gray-600 mb-6">
                All complaints must be submitted in writing. You will not be penalized or retaliated against for filing a complaint.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Information</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about this notice or wish to exercise your rights, please contact our Privacy Officer:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  <strong>BloomWell Privacy Officer</strong><br />
                  Email: privacy@bloomwell.com<br />
                  Phone: 1-800-800-8000<br />
                  Address: 123 Healthcare Ave, Medical City, MC 12345<br />
                  Hours: Monday-Friday, 9:00 AM - 5:00 PM EST
                </p>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Effective Date</h2>
              <p className="text-gray-600 mb-6">
                This privacy notice is effective as of {new Date().toLocaleDateString()} and applies to all PHI we maintain.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> This is a HIPAA-compliant privacy policy. By using our services, you acknowledge that you have read and understood this privacy notice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
