import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Shield, 
  Clock, 
  Globe, 
  CheckCircle, 
  Menu,
  X, 
  Smartphone, 
  CreditCard, 
  TrendingUp,
  Star,
  ArrowRight,
  Users,
  Award,
  Lock,
  Zap,
  HeadphonesIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Owner",
      content: "SPB has transformed how I manage my international business. The security and speed are unmatched.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Tech Executive", 
      content: "Finally, a bank that understands modern business needs. The dashboard is incredibly intuitive.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Freelancer",
      content: "As a digital nomad, SPB's global accessibility has been a game-changer for my work.",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Modern Header with Glass Effect */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white p-3 rounded-xl shadow-xl">
                  <Shield className="h-7 w-7" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Secure Professional Bank
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Next-Gen Banking Solutions</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-8">
              <a href="#personal" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">Personal</a>
              <a href="#business" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">Business</a>
              <a href="#support" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">Support</a>
              <Link href="/signin">
                <Button variant="ghost" className="font-medium hover:bg-blue-50">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </nav>
            
            <Button 
              className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-200">
              <a href="#personal" className="block py-2 text-gray-600 hover:text-blue-600">Personal Banking</a>
              <a href="#business" className="block py-2 text-gray-600 hover:text-blue-600">Business Solutions</a>
              <a href="#support" className="block py-2 text-gray-600 hover:text-blue-600">24/7 Support</a>
              <div className="flex space-x-3 pt-2">
                <Link href="/signin" className="flex-1">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 pt-12 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white text-center lg:text-left">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Rated #1 Digital Bank 2024</span>
                </div>
                
                <h2 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    Banking
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Reimagined
                  </span>
                </h2>
                
                <p className="text-xl lg:text-2xl text-blue-100 max-w-xl leading-relaxed">
                  Experience the future of banking with AI-powered insights, instant global transfers, and military-grade security.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group">
                    Start Banking Today
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500K+</div>
                  <div className="text-blue-200 text-sm">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">$2.5B+</div>
                  <div className="text-blue-200 text-sm">Assets Secured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-blue-200 text-sm">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Modern Banking Dashboard Mockup */}
              <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Account Overview</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6">
                      <div className="text-white/80 text-sm">Total Balance</div>
                      <div className="text-white text-3xl font-bold">$52,847.92</div>
                      <div className="flex items-center space-x-2 text-green-300 text-sm mt-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>+12.5% this month</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-white/60 text-xs">Checking</div>
                        <div className="text-white font-semibold">$12,450.00</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-white/60 text-xs">Savings</div>
                        <div className="text-white font-semibold">$40,397.92</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 shadow-xl animate-bounce">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-4 shadow-xl animate-pulse">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why 500,000+ Choose SPB
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience banking that adapts to your lifestyle with cutting-edge technology and personalized service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Security Feature */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900">Military-Grade Security</h4>
                <p className="text-gray-600 leading-relaxed">
                  Advanced encryption, biometric authentication, and AI-powered fraud detection protect your assets 24/7.
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Lock className="h-4 w-4" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>Biometric Auth</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Speed Feature */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-10 w-10" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900">Lightning Fast</h4>
                <p className="text-gray-600 leading-relaxed">
                  Instant transfers, real-time notifications, and sub-second transaction processing worldwide.
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>&lt;1 Second</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>Global Network</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Support Feature */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <HeadphonesIcon className="h-10 w-10" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900">24/7 Expert Support</h4>
                <p className="text-gray-600 leading-relaxed">
                  Dedicated relationship managers and AI-powered assistance available around the clock.
                </p>
                <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Human Experts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>Award Winning</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-24 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Loved by Customers Worldwide
            </h3>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="text-white ml-2 text-lg">4.9/5 from 50,000+ reviews</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
              <CardContent className="p-12 text-center">
                <div className="flex items-center justify-center space-x-1 mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl lg:text-3xl font-light leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div>
                  <div className="font-bold text-xl">{testimonials[currentTestimonial].name}</div>
                  <div className="text-blue-200">{testimonials[currentTestimonial].role}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
                onClick={() => setCurrentTestimonial(currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1)}
              >
                <ArrowRight className="h-4 w-4 text-white rotate-180" />
              </button>
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
              <button
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
                onClick={() => setCurrentTestimonial((currentTestimonial + 1) % testimonials.length)}
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted & Secure
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bank with confidence knowing your money is protected by industry-leading security measures and regulatory compliance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 items-center justify-center">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="font-bold text-lg text-gray-900">FDIC Insured</div>
              <div className="text-gray-600 text-sm">Up to $250,000</div>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Lock className="h-10 w-10" />
              </div>
              <div className="font-bold text-lg text-gray-900">256-bit SSL</div>
              <div className="text-gray-600 text-sm">Bank-level encryption</div>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Award className="h-10 w-10" />
              </div>
              <div className="font-bold text-lg text-gray-900">ISO 27001</div>
              <div className="text-gray-600 text-sm">Certified secure</div>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10" />
              </div>
              <div className="font-bold text-lg text-gray-900">PCI DSS</div>
              <div className="text-gray-600 text-sm">Level 1 compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Banking?
          </h3>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join over 500,000 customers who've already made the switch to smarter, faster, more secure banking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-white/25 transition-all duration-300 group">
                Open Your Account
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="text-white/80 text-sm">
              ✓ No monthly fees  ✓ $0 minimum balance  ✓ Instant approval
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-xl">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">SPB</h3>
                  <p className="text-gray-400 text-sm">Secure Professional Bank</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The future of banking is here. Experience next-generation financial services designed for the modern world.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/signup" className="hover:text-white transition-colors">Open Account</Link></li>
                <li><Link href="/signin" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><a href="#support" className="hover:text-white transition-colors">24/7 Support</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400">
                <li><span className="text-gray-500">Privacy Policy</span></li>
                <li><span className="text-gray-500">Terms of Service</span></li>
                <li><span className="text-gray-500">FDIC Information</span></li>
                <li><span className="text-gray-500">Accessibility</span></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>1-800-SPB-BANK</li>
                <li>support@spb.com</li>
                <li>24/7 Live Chat</li>
                <li>Secure Messaging</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Secure Professional Bank. All rights reserved. FDIC Insured.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}