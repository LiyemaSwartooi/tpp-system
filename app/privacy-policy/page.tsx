'use client';

import { ArrowLeft, Shield, Eye, Lock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">Last updated: December 2024</p>
        </div>

        <div className="space-y-8">
          {/* Information Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-red-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-600">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                  <li>Name, email address, and contact information</li>
                  <li>Student number and academic information</li>
                  <li>Profile information and academic records</li>
                  <li>Communication preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                <p className="text-gray-600">
                  When you use our service, we may automatically collect:
                </p>
                <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                  <li>Device information and IP address</li>
                  <li>Usage patterns and interaction data</li>
                  <li>Browser type and operating system</li>
                  <li>Access times and referring websites</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCheck className="h-6 w-6 text-red-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Track academic progress and generate reports</li>
                <li>Communicate with you about your account and our services</li>
                <li>Personalize your experience and provide relevant content</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations and institutional requirements</li>
                <li>Analyze usage patterns to improve our services</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-red-600" />
                Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">With Your Consent</h3>
                <p className="text-gray-600">
                  We may share your information with third parties when you give us explicit consent to do so.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Academic Institution</h3>
                <p className="text-gray-600">
                  We may share academic information with Sol Plaatje University and authorized educational personnel for legitimate educational purposes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
                <p className="text-gray-600">
                  We may disclose information when required by law or to protect the rights, property, or safety of our users or others.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-red-600" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting and backup procedures</li>
                <li>Staff training on data protection practices</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of certain communications</li>
                <li>Export your data in a portable format</li>
                <li>File a complaint with relevant authorities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We retain your personal information for as long as necessary to provide our services and fulfill 
                the purposes outlined in this policy, unless a longer retention period is required by law or 
                institutional policy. Academic records may be retained according to university guidelines.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We may update this privacy policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the "Last updated" date. We encourage you 
                to review this policy periodically for any changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Email:</strong> privacy@spu.ac.za</p>
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