import React from 'react';
import { Metadata } from 'next';
import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  DocumentTextIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'HIPAA Compliance - BloomWell Healthcare',
  description: 'Learn about BloomWell\'s commitment to HIPAA compliance and patient data protection',
};

export default function HIPAACompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center mb-6">
            <ShieldCheckIcon className="h-16 w-16 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">HIPAA Compliance</h1>
          </div>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Your health information is protected. BloomWell is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA).
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* What is HIPAA */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600" />
              What is HIPAA?
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-lg text-gray-700 mb-4">
                The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that sets national standards for protecting sensitive patient health information. HIPAA requires healthcare providers and their business associates to implement appropriate safeguards to protect the privacy and security of protected health information (PHI).
              </p>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="flex items-start">
                  <LockClosedIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Privacy Rule</h3>
                    <p className="text-gray-600">Sets standards for how PHI can be used and disclosed</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Security Rule</h3>
                    <p className="text-gray-600">Requires appropriate administrative, physical, and technical safeguards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckIcon className="h-8 w-8 mr-3 text-blue-600" />
              Our HIPAA Commitment
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Data Encryption</h3>
                    <p className="text-gray-600">All patient data is encrypted using AES-256 encryption both in transit and at rest</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Access Controls</h3>
                    <p className="text-gray-600">Strict authentication and authorization protocols ensure only authorized personnel can access PHI</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Audit Logging</h3>
                    <p className="text-gray-600">Comprehensive audit trails track all access to patient health information</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Employee Training</h3>
                    <p className="text-gray-600">All staff undergo regular HIPAA compliance training and certification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protected Information */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <LockClosedIcon className="h-8 w-8 mr-3 text-blue-600" />
              Protected Health Information (PHI)
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-700 mb-6">
                BloomWell protects all types of Protected Health Information, including:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Name and address</li>
                    <li>• Date of birth</li>
                    <li>• Phone numbers</li>
                    <li>• Email addresses</li>
                    <li>• Social Security numbers</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Medical history</li>
                    <li>• Diagnoses and conditions</li>
                    <li>• Medications and allergies</li>
                    <li>• Treatment records</li>
                    <li>• Consultation notes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-8 w-8 mr-3 text-blue-600" />
              Your Rights Under HIPAA
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Right to Access</h3>
                  <p className="text-gray-600">You can request and obtain copies of your health information</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Right to Amend</h3>
                  <p className="text-gray-600">You can request corrections to your health information</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Right to Privacy</h3>
                  <p className="text-gray-600">You can request restrictions on how your information is used</p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Right to Accountability</h3>
                  <p className="text-gray-600">You will be notified of any breaches of your health information</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 mr-3 text-blue-600" />
              Questions or Concerns?
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-700 mb-6">
                If you have questions about our HIPAA compliance practices or need to exercise your rights under HIPAA, please contact our Privacy Officer:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Privacy Officer</h4>
                    <p className="text-gray-600">BloomWell Healthcare</p>
                    <p className="text-gray-600">Email: privacy@bloomwell.com</p>
                    <p className="text-gray-600">Phone: 1-800-BLOOMWELL</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                    <p className="text-gray-600">We respond to all HIPAA-related inquiries within 30 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">This policy may be updated periodically to reflect changes in our practices or applicable law.</p>
        </div>
      </div>
    </div>
  );
}
