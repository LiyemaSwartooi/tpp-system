'use client';

import { useState } from 'react';
import { MessageCircle, Phone, Copy, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ContactSupport() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const whatsappNumber = '0694654988';
  const formattedNumber = '+27 69 465 4988';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(whatsappNumber);
      setCopied(true);
      toast.success('Phone number copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy number');
    }
  };

  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/27${whatsappNumber.substring(1)}?text=Hi,%20I%20need%20support%20with%20the%20TPP%20System`;
    window.open(whatsappUrl, '_blank');
  };

  const callNumber = () => {
    window.location.href = `tel:${formattedNumber}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Contact Support
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Need help with the TPP System? We're here to assist you!
          </p>
        </div>

        {/* Main Contact Card */}
        <Card className="bg-white shadow-lg border-0 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center">
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  Get in Touch via WhatsApp
                </h2>
                <p className="text-sm text-gray-600">
                  Chat with our support team for quick assistance
                </p>
              </div>

              {/* Phone Number Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-4">
                <div className="flex items-center justify-center mb-3">
                  <Phone className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {formattedNumber}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Available during business hours (Monday - Friday, 8AM - 5PM)
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 justify-center">
                  <Button
                    onClick={openWhatsApp}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium w-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Open WhatsApp
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={callNumber}
                      variant="outline"
                      className="border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium flex-1"
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </Button>
                    
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  When contacting support, please include:
                </h3>
                <ul className="text-xs sm:text-sm text-gray-600 text-left space-y-1">
                  <li>• Your email address</li>
                  <li>• A detailed description of the issue</li>
                  <li>• Screenshots if applicable</li>
                  <li>• The page where you encountered the problem</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
} 