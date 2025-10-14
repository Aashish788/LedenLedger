import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, CheckCircle2, BarChart3, FileText, Users, Shield, Zap, TrendingUp, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import LendenLedgerIcon from "@/assets/LenDenledgericon1.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={LendenLedgerIcon} 
                alt="Lenden Ledger" 
                className="h-9 w-9 rounded-lg"
              />
              <span className="text-xl font-bold">Lenden Ledger</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Benefits
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="secondary" className="hidden sm:inline-flex gap-2" asChild>
                <a href="https://play.google.com/store/apps/details?id=com.lendenledger.app&hl=en_IN" target="_blank" rel="noopener noreferrer" aria-label="Download App from Google Play Store">
                  <GooglePlayIcon className="w-4 h-4" />
                  Download App
                </a>
              </Button>
              <Link to="/login">
                <Button>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Manage Your Business{" "}
                <span className="gradient-text">Finances Effortlessly</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                The complete accounting solution for small businesses. Track customers, manage invoices, handle cash flow - all in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/login">
                <Button variant="hero" size="xl" className="group">
                  <Smartphone className="w-5 h-5" />
                  Login to Web App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-24 sm:pt-28 lg:pt-32 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">10k+</div>
              <div className="text-sm text-muted-foreground">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">₹2.7Cr+</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">38k+</div>
              <div className="text-sm text-muted-foreground">Invoices</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clean doodle-style */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Simple tools that make you <span className="gradient-text">smile</span>
            </h2>
            <p className="text-lg text-muted-foreground mt-3">
              A calm, focused toolkit. No clutter. Only what helps you feel in control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<DoodleIcon>📄</DoodleIcon>}
              title="Smart Invoicing"
              desc="Beautiful invoices in seconds, with taxes and totals handled for you."
            />
            <FeatureCard
              icon={<DoodleIcon>👥</DoodleIcon>}
              title="Customer Hub"
              desc="One clean place for customers, suppliers and every interaction."
            />
            <FeatureCard
              icon={<DoodleIcon>📊</DoodleIcon>}
              title="Live Reports"
              desc="See the truth at a glance. Profit, dues and growth trends."
            />
            <FeatureCard
              icon={<DoodleIcon>💰</DoodleIcon>}
              title="Cash Book"
              desc="Crystal clear daily cash flow with zero manual math."
            />
            <FeatureCard
              icon={<DoodleIcon>🛡️</DoodleIcon>}
              title="Secure by Design"
              desc="Bank‑level protection and automatic backups keep you safe."
            />
            <FeatureCard
              icon={<DoodleIcon>⚡</DoodleIcon>}
              title="Blazing Fast"
              desc="Feels instant. Works offline. Syncs when you're back."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-5xl font-bold">
                Save time. Make more{" "}
                <span className="gradient-text">money.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Lenden Ledger automates your accounting workflow so you can focus on growing your business.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Save 10+ hours every week</h3>
                    <p className="text-muted-foreground">Automate repetitive tasks and eliminate manual data entry</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Get paid 2x faster</h3>
                    <p className="text-muted-foreground">Send instant invoices and payment reminders to customers</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Make data-driven decisions</h3>
                    <p className="text-muted-foreground">Access real-time insights and financial reports anytime</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/login">
                  <Button variant="hero" size="xl" className="group">
                    Login to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-card border rounded-3xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Invoices Created</div>
                        <div className="text-sm text-muted-foreground">This month</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold gradient-text">2,847</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Revenue Growth</div>
                        <div className="text-sm text-muted-foreground">vs last month</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold gradient-text">+23%</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-accent flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Time Saved</div>
                        <div className="text-sm text-muted-foreground">Per week</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold gradient-text">12 hrs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Trusted by businesses{" "}
              <span className="gradient-text">worldwide</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Join millions of businesses that trust Lenden Ledger for their accounting needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Lenden Ledger has transformed how we manage our finances. It's intuitive, fast, and has saved us countless hours."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary"></div>
                <div>
                  <div className="font-semibold">Rajesh Kumar</div>
                  <div className="text-sm text-muted-foreground">Retail Business Owner</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The best accounting app I've used. Simple enough for beginners but powerful enough for growing businesses."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-accent"></div>
                <div>
                  <div className="font-semibold">Priya Sharma</div>
                  <div className="text-sm text-muted-foreground">E-commerce Entrepreneur</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border bg-card">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Finally, an accounting solution that doesn't require a finance degree. Highly recommended for small businesses!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary"></div>
                <div>
                  <div className="font-semibold">Amit Patel</div>
                  <div className="text-sm text-muted-foreground">Restaurant Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              Ready to transform your{" "}
              <span className="gradient-text">business finances?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join millions of businesses already using Lenden Ledger to manage their finances smarter and get paid faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link to="/login">
                <Button variant="hero" size="xl" className="group">
                  <Smartphone className="w-5 h-5" />
                  Download App
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Schedule Demo
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src={LendenLedgerIcon} 
                  alt="Lenden Ledger" 
                  className="h-9 w-9 rounded-lg"
                />
                <span className="text-xl font-bold">Lenden Ledger</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The complete accounting solution for small businesses across India and the world.
              </p>
              <div className="flex gap-4">
                <a href="#" className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Lenden Ledger. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

// Doodle UI helpers
function DoodleIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-12 w-12 rounded-2xl glass grid place-items-center text-xl">
      <span className="select-none">{children}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="doodle-card">
      <div className="flex items-start gap-4">
        {icon}
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

// Google Play Store icon with official brand colors
function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5Z"
        fill="#01875f"
      />
      <path
        d="M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12Z"
        fill="#fbbc04"
      />
      <path
        d="M20.16,10.85C20.5,11.05 20.75,11.35 20.75,12C20.75,12.65 20.5,12.95 20.16,13.15L17.89,14.5L15.39,12L17.89,9.5L20.16,10.85Z"
        fill="#ea4335"
      />
      <path
        d="M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z"
        fill="#4285f4"
      />
    </svg>
  );
}

