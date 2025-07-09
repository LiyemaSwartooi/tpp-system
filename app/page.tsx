"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GraduationCap, ChevronRight, BarChart, Users, ChevronLeft, ChevronRightIcon } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()

  // Hero slideshow state
  const heroImages = [
    "/kids.jpg",
    "/kid.jpg",
    "/TPP Logo - Red.png"
  ]
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Slideshow auto-advance effect
  useEffect(() => {
    let slideInterval: NodeJS.Timeout

    if (isAutoPlaying) {
      slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length)
      }, 5000) // Change slide every 5 seconds
    }

    return () => {
      if (slideInterval) clearInterval(slideInterval)
    }
  }, [isAutoPlaying, heroImages.length])

  // Slide navigation functions
  const goToNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    setIsAutoPlaying(false) // Pause auto-play when manually navigating

    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [heroImages.length])

  const goToPrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)
    setIsAutoPlaying(false) // Pause auto-play when manually navigating

    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [heroImages.length])

  const handleGetStarted = () => {
    router.push("/access-portal")
  }

  const handleSignIn = () => {
    router.push("/access-portal")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Image
                  src="/TPP Logo - Red.png"
                  alt="TPP Logo"
                  width={180}
                  height={60}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="https://www.spu.ac.za/index.php/talent-pipeline-programme-homepage/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                About TPP
              </a>
              <Button onClick={handleSignIn} className="bg-red-600 hover:bg-red-700 rounded-full">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left Column - Text Content */}
            <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                <span className="text-red-600">Empowering </span>
                <span className="text-orange-500">Future</span>
                <br className="hidden sm:block" />
                <span className="text-red-600">Leaders</span>
              </h1>

              <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8">
                A comprehensive platform for managing learner success at Sol Plaatje University. Track academic
                performance, attendance, and student well-being in one unified system.
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-start sm:items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 sm:mt-0">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Track academic performance and attendance</span>
                </div>

                <div className="flex items-start sm:items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 sm:mt-0">
                    <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Generate comprehensive reports for funders</span>
                </div>

                <div className="flex items-start sm:items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3 mt-0.5 sm:mt-0">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Support student growth and success</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  onClick={handleGetStarted} 
                  className="bg-red-600 hover:bg-red-700 rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base"
                >
                  Get Started <ChevronRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  onClick={() =>
                    window.open("https://www.spu.ac.za/index.php/talent-pipeline-programme-homepage/", "_blank")
                  }
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 rounded-full px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base"
                >
                  Learn More{" "}
                  <span className="ml-1 w-4 h-4 bg-red-600 text-white rounded-full inline-flex items-center justify-center text-xs">
                    i
                  </span>
                </Button>
              </div>
            </div>

            {/* Right Column - Image Slideshow */}
            <div className="w-full lg:w-1/2 relative mt-4 sm:mt-8 lg:mt-0">
              <div className="relative transform lg:-rotate-2 hover:lg:rotate-0 transition-transform duration-300">
                {/* Outer glow effect */}
                <div className="absolute inset-0 bg-pink-100 rounded-[16px] lg:rounded-[40px] blur-xl opacity-70 -z-10"></div>

                {/* Main image container with white border */}
                <div className="relative bg-white rounded-[12px] lg:rounded-[32px] p-1.5 sm:p-2 lg:p-3 shadow-lg overflow-hidden lg:transform lg:skew-y-1">
                  {/* Image slideshow */}
                  <div className="rounded-[8px] lg:rounded-[24px] overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100 h-[220px] xs:h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] relative lg:transform lg:-skew-y-1">
                    {/* Slideshow container */}
                    <div className="absolute inset-0 w-full h-full">
                      {heroImages.map((src, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                        >
                          <Image
                            src={src || "/placeholder.svg"}
                            alt={`TPP Hero Image ${index + 1}`}
                            fill
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                            priority={index === 0}
                            className="transition-transform duration-700"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Slideshow navigation */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between items-center px-2 sm:px-3 lg:px-4 z-10">
                      <button
                        onClick={goToPrevSlide}
                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors touch-action-manipulation"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={goToNextSlide}
                        className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors touch-action-manipulation"
                        aria-label="Next slide"
                      >
                        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </button>
                    </div>

                    {/* Slide indicators */}
                    <div className="absolute bottom-2 sm:bottom-4 inset-x-0 flex justify-center space-x-2">
                      {heroImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentSlide(index)
                            setIsAutoPlaying(false)
                            setTimeout(() => setIsAutoPlaying(true), 10000)
                          }}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all touch-action-manipulation ${index === currentSlide ? "bg-red-600 w-4 sm:w-6" : "bg-white/70"}`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Badge in bottom right */}
                    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white rounded-lg p-1 sm:p-2 shadow-md md:transform md:-skew-x-2 z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-xs">★</span>
                        </div>
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-500 text-xs">↗</span>
                        </div>
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-3 h-3 text-red-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TPP?</h2>
              <p className="text-lg text-gray-600">Comprehensive tools for academic success and student support</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Academic Tracking</h3>
                <p className="text-gray-600">Monitor student progress, grades, and performance metrics in real-time.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Data Analytics</h3>
                <p className="text-gray-600">
                  Generate comprehensive reports and insights for informed decision-making.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Student Support</h3>
                <p className="text-gray-600">Coordinate interventions and support services for student success.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-red-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-red-100 mb-8">Join the TPP community and transform your academic journey</p>
            <Button
              onClick={handleGetStarted}
              className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-8 py-3 text-lg font-semibold"
            >
              Access Portal <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-red-600 text-white font-bold rounded-md p-2 text-lg mr-3">TPP</div>
                <span className="text-xl font-semibold">Talent Pipeline Programme</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering students at Sol Plaatje University through comprehensive academic tracking and support
                systems.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-400 hover:text-white">
                    About TPP
                  </a>
                </li>
                <li>
                  <a href="/access-portal" className="text-gray-400 hover:text-white">
                    Student Portal
                  </a>
                </li>
                <li>
                  <a href="/access-portal" className="text-gray-400 hover:text-white">
                    Coordinator Portal
                  </a>
                </li>
                <li>
                  <a href="/contact-support" className="text-gray-400 hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Sol Plaatje University</li>
                <li>Kimberley, South Africa</li>
                <li>info@spu.ac.za</li>
                <li>+27 53 491 0000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Talent Pipeline Programme, Sol Plaatje University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
