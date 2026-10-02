import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      content: 'jeel09896@gmail.com',
      description: 'We typically respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 95586 38795 ',
      description: 'Mon-Fri 9AM-6PM IST',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Ahmedabad',
      description: 'Gujarat 380001',
    },
    {
      icon: Clock,
      title: 'Support Hours',
      content: '24/7 AI Support',
      description: 'Human support Mon-Fri 9AM-6PM EST',
    },
  ];

  const faqs = [
    {
      question: 'How accurate is the AI medical analysis?',
      answer: 'Our AI is trained on extensive medical databases and provides high-accuracy analysis. However, it should complement, not replace, professional medical advice.',
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we use enterprise-grade encryption and comply with HIPAA regulations to ensure your medical information is completely secure.',
    },
    {
      question: 'Can I use Diagnosely for emergency situations?',
      answer: 'No, Diagnosely is not designed for medical emergencies. For urgent medical situations, please contact emergency services immediately.',
    },
    {
      question: 'What file formats are supported for receipt uploads?',
      answer: 'We support JPG, PNG, and PDF formats up to 10MB in size for optimal processing accuracy.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about Diagnosely? We're here to help you make the most of your healthcare journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="animate-slide-up">
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-foreground">
                  {isSubmitted ? 'Message Sent!' : 'Send us a Message'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Thank you for contacting us!
                    </h3>
                    <p className="text-muted-foreground">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-foreground">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          placeholder="enter your name"
                          value={formData.name}
                          onChange={handleChange}
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-foreground">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="email@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us more about your question or concern..."
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 rounded-xl p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                      <info.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                    <p className="text-foreground font-medium mb-1">{info.content}</p>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <Card className="rounded-2xl shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-slide-up">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Notice */}
            <Card className="rounded-2xl shadow-lg border-0 bg-red-50 border-red-200 animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="bg-red-100 rounded-xl p-3 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="font-semibold text-red-800 mb-2">Medical Emergency?</h3>
                <p className="text-sm text-red-700 mb-4">
                  For urgent medical situations, please call emergency services immediately.
                </p>
                <Button variant="destructive" className="rounded-xl">
                  Call 911
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
