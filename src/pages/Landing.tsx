import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, CheckCircle2, BarChart3, FileText, Users, Shield, Zap, TrendingUp, Clock, DollarSign, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import LendenLedgerIcon from "@/assets/LenDenledgericon1.png";
import { motion, useScroll, useTransform, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const Landing = () => {
  const { scrollYProgress } = useScroll();
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Header */}
      <motion.header 
        ref={headerRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.img 
                src={LendenLedgerIcon} 
                alt="Lenden Ledger" 
                className="h-9 w-9 rounded-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
              <span className="text-xl font-bold">Lenden Ledger</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-6">
              {["Features", "Benefits", "Pricing", "Contact"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" className="hidden sm:inline-flex gap-2" asChild>
                  <a href="https://play.google.com/store/apps/details?id=com.lendenledger.app&hl=en_IN" target="_blank" rel="noopener noreferrer" aria-label="Download App from Google Play Store">
                    <GooglePlayIcon className="w-4 h-4" />
                    Download App
                  </a>
                </Button>
              </motion.div>
              <Link to="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button>
                    Login
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Premium Animations */}
      <motion.section 
        ref={heroRef}
        className="py-20 sm:py-32 relative overflow-hidden"
        style={{ opacity, scale }}
      >
        {/* Static Background Elements */}
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Manage Your Business{" "}
                <motion.span 
                  className="gradient-text inline-block"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  Finances Effortlessly
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                The complete accounting solution for small businesses. Track customers, manage invoices, handle cash flow - all in one place.
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="hero" size="xl" className="group relative overflow-hidden shadow-2xl shadow-primary/25">
                    {/* Animated gradient shimmer */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Apple-inspired icon with premium styling */}
                    <motion.div 
                      className="relative z-10 flex items-center justify-center w-5 h-5 mr-1"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: "easeInOut"
                      }}
                    >
                      <Rocket className="w-5 h-5" />
                    </motion.div>
                    
                    <span className="relative z-10 font-semibold">Get Started</span>
                    
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  </Button>
                </motion.div>
              </Link>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="xl" className="shadow-lg">
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-24 sm:pt-28 lg:pt-32 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { icon: CheckCircle2, text: "Free forever plan" },
                { icon: CheckCircle2, text: "No credit card required" },
                { icon: CheckCircle2, text: "Setup in 2 minutes" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section with Counter Animation */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10k+", label: "Customers", delay: 0 },
              { value: "₹2.7Cr+", label: "Processed", delay: 0.1 },
              { value: "38k+", label: "Invoices", delay: 0.2 },
              { value: "99.9%", label: "Uptime", delay: 0.3 }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: stat.delay,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div 
                  className="text-4xl font-bold gradient-text mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: stat.delay + 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: stat.delay + 0.4 }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Clean doodle-style with Stagger Animation */}
      <section id="features" className="py-24" ref={featuresRef}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Simple tools that make you <span className="gradient-text">smile</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mt-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              A calm, focused toolkit. No clutter. Only what helps you feel in control.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📄", title: "Smart Invoicing", desc: "Beautiful invoices in seconds, with taxes and totals handled for you.", delay: 0 },
              { icon: "👥", title: "Customer Hub", desc: "One clean place for customers, suppliers and every interaction.", delay: 0.1 },
              { icon: "📊", title: "Live Reports", desc: "See the truth at a glance. Profit, dues and growth trends.", delay: 0.2 },
              { icon: "💰", title: "Cash Book", desc: "Crystal clear daily cash flow with zero manual math.", delay: 0.3 },
              { icon: "🛡️", title: "Secure by Design", desc: "Bank‑level protection and automatic backups keep you safe.", delay: 0.4 },
              { icon: "⚡", title: "Blazing Fast", desc: "Feels instant. Works offline. Syncs when you're back.", delay: 0.5 }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: feature.delay,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <FeatureCard
                  icon={<DoodleIcon>{feature.icon}</DoodleIcon>}
                  title={feature.title}
                  desc={feature.desc}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section with Parallax */}
      <section id="benefits" className="py-24 bg-muted/30 relative overflow-hidden">
        {/* Static background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-l-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <motion.h2 
                className="text-4xl sm:text-5xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Save time. Make more{" "}
                <span className="gradient-text">money.</span>
              </motion.h2>
              
              <motion.p 
                className="text-xl text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Lenden Ledger automates your accounting workflow so you can focus on growing your business.
              </motion.p>
              
              <div className="space-y-4">
                {[
                  { icon: Clock, title: "Save 10+ hours every week", desc: "Automate repetitive tasks and eliminate manual data entry", delay: 0.1 },
                  { icon: TrendingUp, title: "Get paid 2x faster", desc: "Send instant invoices and payment reminders to customers", delay: 0.2 },
                  { icon: BarChart3, title: "Make data-driven decisions", desc: "Access real-time insights and financial reports anytime", delay: 0.3 }
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: benefit.delay }}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 360,
                        backgroundColor: "rgba(59, 130, 246, 0.2)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-3xl blur-3xl" />
              
              <motion.div 
                className="relative bg-card border rounded-3xl p-8 shadow-xl"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="space-y-6">
                  {[
                    { icon: FileText, title: "Invoices Created", subtitle: "This month", value: "2,847", gradient: "gradient-accent", delay: 0 },
                    { icon: TrendingUp, title: "Revenue Growth", subtitle: "vs last month", value: "+23%", gradient: "gradient-primary", delay: 0.2 },
                    { icon: Clock, title: "Time Saved", subtitle: "Per week", value: "12 hrs", gradient: "gradient-accent", delay: 0.4 }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: item.delay }}
                      whileHover={{ 
                        scale: 1.03,
                        backgroundColor: "rgba(var(--muted), 0.7)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={`h-12 w-12 rounded-lg bg-${item.gradient} flex items-center justify-center`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <item.icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div>
                          <div className="font-semibold">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </div>
                      <motion.div 
                        className="text-2xl font-bold gradient-text"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          type: "spring",
                          stiffness: 200,
                          delay: item.delay + 0.3
                        }}
                      >
                        {item.value}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials/Trust Section with Fade & Scale */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Trusted by businesses{" "}
              <span className="gradient-text">worldwide</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join millions of businesses that trust Lenden Ledger for their accounting needs
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Rajesh Kumar", 
                role: "Retail Business Owner",
                text: "Lenden Ledger has transformed how we manage our finances. It's intuitive, fast, and has saved us countless hours.",
                gradient: "gradient-primary",
                delay: 0
              },
              { 
                name: "Priya Sharma", 
                role: "E-commerce Entrepreneur",
                text: "The best accounting app I've used. Simple enough for beginners but powerful enough for growing businesses.",
                gradient: "gradient-accent",
                delay: 0.2
              },
              { 
                name: "Amit Patel", 
                role: "Restaurant Owner",
                text: "Finally, an accounting solution that doesn't require a finance degree. Highly recommended for small businesses!",
                gradient: "gradient-primary",
                delay: 0.4
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                className="p-6 rounded-2xl border bg-card relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: testimonial.delay,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.03,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 }
                }}
              >
                {/* Hover effect background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className="flex gap-1 mb-4"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: testimonial.delay + 0.3,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {[...Array(5)].map((_, starIndex) => (
                      <motion.svg 
                        key={starIndex} 
                        className="w-5 h-5 text-yellow-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.3, 
                          delay: testimonial.delay + 0.4 + starIndex * 0.05,
                          type: "spring"
                        }}
                        whileHover={{ 
                          scale: 1.3, 
                          rotate: 360,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </motion.svg>
                    ))}
                  </motion.div>
                  
                  <motion.p 
                    className="text-muted-foreground mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: testimonial.delay + 0.5 }}
                  >
                    "{testimonial.text}"
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: testimonial.delay + 0.6 }}
                  >
                    <motion.div 
                      className={`h-10 w-10 rounded-full bg-${testimonial.gradient}`}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section with Dynamic Animations */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Ready to transform your{" "}
              <motion.span 
                className="gradient-text inline-block"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                business finances?
              </motion.span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Join millions of businesses already using Lenden Ledger to manage their finances smarter and get paid faster.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button variant="hero" size="xl" className="group relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/30 to-primary/0"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <Smartphone className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Download App</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  </Button>
                </motion.div>
              </Link>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="xl">
                  Schedule Demo
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {[
                { text: "Free forever plan" },
                { text: "No credit card required" },
                { text: "Cancel anytime" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.8 + i * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.1, x: 5 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer with Fade-in Animation */}
      <motion.footer 
        className="border-t bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <motion.div 
              className="col-span-2 md:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.img 
                  src={LendenLedgerIcon} 
                  alt="Lenden Ledger" 
                  className="h-9 w-9 rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                <span className="text-xl font-bold">Lenden Ledger</span>
              </motion.div>
              <p className="text-sm text-muted-foreground mb-4">
                The complete accounting solution for small businesses across India and the world.
              </p>
              <div className="flex gap-4">
                {[0, 1, 2].map((i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  >
                    {i === 0 && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {i === 1 && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    )}
                    {i === 2 && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
              { title: "Resources", links: ["Help Center", "Documentation", "API Reference", "Community"] }
            ].map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (sectionIndex + 1) }}
              >
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * (sectionIndex + 1) + 0.05 * linkIndex }}
                    >
                      <motion.a
                        href="#"
                        className="hover:text-foreground transition-colors inline-block"
                        whileHover={{ x: 5, color: "var(--foreground)" }}
                        transition={{ duration: 0.2 }}
                      >
                        {link}
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-sm text-muted-foreground">
              © 2025 Lenden Ledger. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link, i) => (
                <motion.a
                  key={link}
                  href="#"
                  className="hover:text-foreground transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;

// Animated Doodle UI helpers
function DoodleIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div 
      className="h-12 w-12 rounded-2xl glass grid place-items-center text-xl"
      whileHover={{ 
        scale: 1.1, 
        rotate: [0, -10, 10, -10, 0],
        transition: { duration: 0.5 }
      }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="select-none">{children}</span>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div 
      className="doodle-card relative overflow-hidden"
      whileHover={{ 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <div className="flex items-start gap-4 relative z-10">
        {icon}
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
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

