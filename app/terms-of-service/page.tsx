'use client';

import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-red-600 text-white rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">
            Please read these terms carefully before using the TPP System.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: December 2024</p>
        </div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-red-600" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using the Talent Pipeline Programme (TPP) System, you agree to be bound by these 
                Terms of Service and all applicable laws and regulations. If you do not agree with any of these 
                terms, you are prohibited from using or accessing this system.
              </p>
            </CardContent>
          </Card>

          {/* System Description */}
          <Card>
            <CardHeader>
              <CardTitle>System Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The TPP System is an academic tracking and student support platform designed for Sol Plaatje University. 
                The system provides:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Student profile management and academic tracking</li>
                <li>Performance monitoring and reporting tools</li>
                <li>Coordinator dashboard for student oversight</li>
                <li>Data analytics and insights</li>
                <li>Communication and support features</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Registration</h3>
                <p className="text-gray-600">
                  You must provide accurate, current, and complete information during registration. You are 
                  responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Authorized Use</h3>
                <p className="text-gray-600">
                  Access is limited to students, coordinators, and authorized personnel of Sol Plaatje University. 
                  You may only access data that you are authorized to view.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Account Security</h3>
                <p className="text-gray-600">
                  You must immediately notify us of any unauthorized use of your account or any other breach of security.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="h-6 w-6 text-red-600" />
                Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You agree NOT to use the system to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Access or attempt to access unauthorized areas or data</li>
                <li>Interfere with or disrupt the system's operation</li>
                <li>Upload or transmit malicious software or harmful content</li>
                <li>Share your account credentials with unauthorized persons</li>
                <li>Use the system for commercial purposes without permission</li>
                <li>Harass, threaten, or impersonate other users</li>
                <li>Attempt to reverse engineer or tamper with the system</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Accuracy</h3>
                <p className="text-gray-600">
                  You are responsible for ensuring the accuracy of any data you enter into the system. 
                  False or misleading information may result in account suspension.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Privacy Protection</h3>
                <p className="text-gray-600">
                  You must respect the privacy of other users and not access, copy, or distribute personal 
                  information without proper authorization.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
                <p className="text-gray-600">
                  Academic and personal data may be retained according to university policies and legal requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The TPP System, including its software, design, content, and trademarks, is owned by 
                Sol Plaatje University. You are granted a limited, non-exclusive license to use the system 
                for its intended educational purposes only.
              </p>
              <p className="text-gray-600">
                You retain ownership of any original content you create within the system, but grant the 
                university necessary rights to operate and improve the platform.
              </p>
            </CardContent>
          </Card>

          {/* System Availability */}
          <Card>
            <CardHeader>
              <CardTitle>System Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We strive to maintain system availability but cannot guarantee uninterrupted access. 
                The system may be unavailable due to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Scheduled maintenance and updates</li>
                <li>Technical difficulties or system failures</li>
                <li>Security incidents or necessary interventions</li>
                <li>Force majeure events beyond our control</li>
              </ul>
              <p className="text-gray-600 mt-4">
                We reserve the right to modify, update, or discontinue features of the system with reasonable notice.
              </p>
            </CardContent>
          </Card>

          {/* Prohibited Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Prohibited Actions and Consequences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Violation of these terms may result in:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Temporary or permanent account suspension</li>
                <li>Removal of access privileges</li>
                <li>Reporting to university authorities</li>
                <li>Legal action if warranted</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                The system is provided "as is" without warranties of any kind. We disclaim all warranties, 
                express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Complete accuracy of all data and information</li>
                <li>Security against all possible threats</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Our liability shall be limited to the maximum extent permitted by applicable law.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may modify these terms at any time. Changes will be posted on this page with an updated 
                effective date. Continued use of the system after changes constitutes acceptance of the new terms. 
                We encourage you to review these terms periodically.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> legal@spu.ac.za</p>
                <p><strong>Phone:</strong> +27 53 491 0000</p>
                <p><strong>Address:</strong> Sol Plaatje University, Kimberley, South Africa</p>
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/contact-support')}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 