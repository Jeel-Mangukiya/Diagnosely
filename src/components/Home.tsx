import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Activity, Upload, MessageSquare, Shield, Star, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Upload,
      title: 'Smart Receipt Analysis',
      description: 'Upload medical receipts and get instant AI-powered insights about your medications and treatments.',
    },
    {
      icon: MessageSquare,
      title: 'AI Medical Chat',
      description: 'Chat directly with our AI for personalized medical advice and health recommendations.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and protected with enterprise-grade security standards.',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Jeel Mangukiya',
      role: 'General Practitioner',
      content: 'Diagnosely has revolutionized how I help patients understand their prescriptions and medical bills.',
      rating: 5,
    },
    {
      name: 'Akshat Patel',
      role: 'Patient',
      content: 'The AI chat feature helped me understand my medication side effects better than any website.',
      rating: 5,
    },
    {
      name: 'Het Tala',
      role: 'Healthcare Administrator',
      content: 'Finally, a tool that makes medical information accessible to everyone. Highly recommended!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="pt-40 pb-24 px-8 md:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-fade-in space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              <span className="text-foreground">Your AI-Powered</span>{' '}
              <span className="text-primary">Medical Assistant</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed px-4 md:px-0">
              Upload medical receipts, get instant AI analysis, and chat with our intelligent system for personalized healthcare guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="rounded-xl px-8 py-5 sm:px-10 sm:py-6 text-base sm:text-lg bg-primary hover:bg-primary/90 shadow-lg animate-float w-full">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/chat" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="rounded-xl px-8 py-5 sm:px-10 sm:py-6 text-base sm:text-lg shadow-lg w-full">
                  Try AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-8 md:px-12 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Powerful Features for Better Healthcare
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Experience the future of medical assistance with our AI-powered platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-card animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="bg-muted rounded-xl p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-8 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              See what doctors and patients are saying about Diagnosely
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="rounded-xl shadow-lg border-0 bg-card animate-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 px-8 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-primary rounded-lg p-1.5">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Diagnosely</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Empowering healthcare decisions through AI-powered medical assistance and analysis.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Product</h3>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/upload" className="text-muted-foreground hover:text-foreground transition-colors">Upload Receipt</Link></li>
                <li><Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors">AI Chat</Link></li>
                <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Company</h3>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Support</h3>
              <ul className="space-y-1.5 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-xs text-muted-foreground">&copy; 2025 Diagnosely. All rights reserved. Built with care for better healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
