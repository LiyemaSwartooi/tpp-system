'use client';

import { ArrowLeft, GraduationCap, Users, BarChart, Target, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AboutTPP() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="bg-red-600 text-white font-bold rounded-full p-4 text-2xl mx-auto w-16 h-16 flex items-center justify-center mb-6">
            TPP
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About the Talent Pipeline Programme
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering the next generation of leaders through comprehensive academic tracking, 
            personalized support, and data-driven insights at Sol Plaatje University.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To provide comprehensive academic tracking and support systems that enable students 
                at Sol Plaatje University to reach their full potential and become future leaders 
                in their communities and chosen fields.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Star className="h-8 w-8 text-red-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                To create a world-class talent pipeline that transforms lives, strengthens 
                communities, and contributes to the development of South Africa through 
                education, mentorship, and opportunity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Do */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Academic Tracking</h3>
              <p className="text-gray-600">
                Monitor student progress, grades, and performance metrics in real-time to 
                identify areas for improvement and celebrate achievements.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Data Analytics</h3>
              <p className="text-gray-600">
                Generate comprehensive reports and insights that enable informed 
                decision-making for both students and coordinators.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-red-100 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Student Support</h3>
              <p className="text-gray-600">
                Coordinate personalized interventions and support services to help 
                students overcome challenges and achieve academic success.
              </p>
            </div>
          </div>
        </div>

        {/* Our Impact */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Impact</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Students Supported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">85%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Schools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">10+</div>
              <div className="text-gray-600">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-sm text-gray-600">Striving for the highest standards in everything we do</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-sm text-gray-600">Working together to achieve common goals</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-sm text-gray-600">Embracing new ideas and approaches</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="text-sm text-gray-600">Acting with honesty and transparency</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the TPP Community</h2>
          <p className="text-xl text-gray-600 mb-8">
            Ready to transform your academic journey?
          </p>
          <Button
            onClick={() => router.push('/access-portal')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
          >
            Get Started Today
          </Button>
        </div>
      </div>
    </div>
  );
} 