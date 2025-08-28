import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Shield, Clock, Globe, CheckCircle, Menu } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-primary" data-testid="text-bank-title">
                Secure Professional Bank
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">Personal Banking</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Business</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Support</a>
              <Link href="/signin">
                <Button variant="secondary" data-testid="button-signin">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button data-testid="button-get-started">Get Started</Button>
              </Link>
            </nav>
            
            <Button className="md:hidden" variant="ghost" size="sm" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Banking Made Simple & Secure
            </h2>
            <p className="text-xl mb-8 text-blue-100" data-testid="text-hero-subtitle">
              Experience international banking with enterprise-grade security, instant approvals, and 24/7 customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100" data-testid="button-open-account">
                  Open Account
                </Button>
              </Link>
              <Link href="/signin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900" data-testid="button-signin-hero">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-16" data-testid="text-features-title">
            Why Choose SPB?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6" data-testid="card-security-feature">
              <CardContent className="pt-6">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Bank-Grade Security</h4>
                <p className="text-muted-foreground">256-bit encryption, multi-factor authentication, and real-time fraud monitoring.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6" data-testid="card-approval-feature">
              <CardContent className="pt-6">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Instant Approvals</h4>
                <p className="text-muted-foreground">Get approved within 24 hours with our streamlined verification process.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6" data-testid="card-global-feature">
              <CardContent className="pt-6">
                <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-semibold mb-3">Global Access</h4>
                <p className="text-muted-foreground">Access your account from anywhere in the world with international support.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4" data-testid="text-trust-title">
              Trusted by Customers Worldwide
            </h3>
            <div className="flex justify-center items-center space-x-8 text-muted-foreground">
              <div className="flex items-center" data-testid="badge-fdic">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>FDIC Insured</span>
              </div>
              <div className="flex items-center" data-testid="badge-ssl">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center" data-testid="badge-iso">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold" data-testid="text-footer-title">
              Secure Professional Bank
            </h3>
          </div>
          <p className="text-gray-400 mb-4" data-testid="text-footer-subtitle">
            Your trusted partner in international banking
          </p>
          <div className="text-center">
            <Link href="/admin-login">
              <Button variant="link" className="text-gray-500 hover:text-gray-400 text-sm" data-testid="link-admin">
                Admin Access
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
