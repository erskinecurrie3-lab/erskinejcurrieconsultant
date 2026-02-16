import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    Koalendar: any;
  }
}

export default function Booking() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    church_name: '',
    role: '',
    service_interest: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoaded) return;

    try {
      // Check if Koalendar is already loaded
      if (window.Koalendar) {
        setScriptLoaded(true);
        return;
      }

      // Load Koalendar link widget script
      const script1 = document.createElement('script');
      script1.innerHTML = 'window.Koalendar=window.Koalendar||function(){(Koalendar.props=Koalendar.props||[]).push(arguments)};';
      script1.id = 'koalendar-init';
      
      const script2 = document.createElement('script');
      script2.src = 'https://koalendar.com/assets/widget.js';
      script2.async = true;
      script2.id = 'koalendar-widget';
      
      // Only add scripts if they don't exist
      if (!document.getElementById('koalendar-init')) {
        document.head.appendChild(script1);
      }
      
      if (!document.getElementById('koalendar-widget')) {
        document.head.appendChild(script2);
        
        // Initialize after widget script loads
        script2.onload = () => {
          try {
            if (window.Koalendar) {
              window.Koalendar('init');
              setScriptLoaded(true);
            }
          } catch (error) {
            console.warn('Koalendar initialization warning:', error);
          }
        };

        script2.onerror = () => {
          console.warn('Failed to load Koalendar widget script');
        };
      } else {
        setScriptLoaded(true);
      }
    } catch (error) {
      console.warn('Koalendar setup warning:', error);
    }

    // No cleanup needed for link widget - scripts can persist
  }, [scriptLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.service_interest) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Here we would send the booking request
      // For now, we'll simulate success
      setSubmitted(true);
      toast.success('Thank you! Please click the "Schedule a Meeting" button below to choose your time.');
      
      // In production, you would:
      // 1. Save the inquiry to the database
      // 2. Send confirmation email via Resend
      // 3. User can then click the Koalendar link to book
      
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-white py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#F4E2A3] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-black" />
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">Thank You!</h1>
              <p className="text-gray-600 mb-6">
                Your information has been received. Please click the button below to schedule your free 30-minute consultation.
              </p>
              
              {/* Koalendar Link Widget */}
              <div className="mb-8">
                <a 
                  href="https://koalendar.com/e/meet-with-erskine-currie" 
                  data-koalendar-widget 
                  data-koa-type="link"
                  className="inline-block bg-[#F4E2A3] text-black font-semibold px-8 py-4 rounded-lg hover:bg-[#E6D08C] transition-colors text-lg shadow-lg"
                >
                  📅 Schedule a Meeting
                </a>
              </div>
              
              <div className="bg-gray-50 border-2 border-[#F4E2A3] rounded-lg p-6 max-w-md mx-auto">
                <p className="text-black font-semibold mb-2">
                  Click the button above to choose your preferred time
                </p>
                <p className="text-gray-700 text-sm">
                  You'll be able to select from available time slots that work best for your schedule.
                </p>
              </div>
            </div>

            <Card className="border-2 border-gray-200 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-black">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-black font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Click "Schedule a Meeting"</p>
                    <p className="text-sm text-gray-600">Use the button above to select your preferred time slot</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-black font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Receive confirmation</p>
                    <p className="text-sm text-gray-600">You'll get an email with calendar details and Zoom link</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-black font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Join the call</p>
                    <p className="text-sm text-gray-600">We'll discuss your ministry needs and how we can help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                onClick={() => setSubmitted(false)}
                className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
              >
                Go Back
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Book Your Free Consultation</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Let's discuss how we can help strengthen your ministry. No obligation, just a conversation.
            </p>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-[#F4E2A3]">
                <CardHeader className="text-center">
                  <Calendar className="h-8 w-8 text-[#F4E2A3] mx-auto mb-2" />
                  <CardTitle className="text-lg">Free Consultation</CardTitle>
                  <CardDescription>30-minute discovery call</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-[#F4E2A3]">
                <CardHeader className="text-center">
                  <Clock className="h-8 w-8 text-[#F4E2A3] mx-auto mb-2" />
                  <CardTitle className="text-lg">Flexible Scheduling</CardTitle>
                  <CardDescription>Choose a time that works for you</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-[#F4E2A3]">
                <CardHeader className="text-center">
                  <CheckCircle className="h-8 w-8 text-[#F4E2A3] mx-auto mb-2" />
                  <CardTitle className="text-lg">No Obligation</CardTitle>
                  <CardDescription>Just a friendly conversation</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-black">Tell Us About Your Ministry</CardTitle>
                <CardDescription>
                  Fill out this quick form and we'll help you schedule a time to connect.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@church.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="church_name">Church Name</Label>
                      <Input
                        id="church_name"
                        value={formData.church_name}
                        onChange={(e) => handleChange('church_name', e.target.value)}
                        placeholder="Grace Community Church"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior_pastor">Senior Pastor</SelectItem>
                          <SelectItem value="worship_pastor">Worship Pastor</SelectItem>
                          <SelectItem value="church_planter">Church Planter</SelectItem>
                          <SelectItem value="executive_pastor">Executive Pastor</SelectItem>
                          <SelectItem value="other">Other Leadership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="service_interest">Service Interest *</Label>
                      <Select value={formData.service_interest} onValueChange={(value) => handleChange('service_interest', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="What are you interested in?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="church_planting">Church Planting</SelectItem>
                          <SelectItem value="church_consulting">Church Consulting</SelectItem>
                          <SelectItem value="worship_building">Worship Building</SelectItem>
                          <SelectItem value="not_sure">Not Sure Yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Tell Us About Your Needs</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Share any specific challenges or questions you'd like to discuss..."
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                    >
                      Continue to Schedule
                    </Button>
                    {!user && (
                      <Button 
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={login}
                        className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
                      >
                        Sign In to Save Info
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 text-center">
                    By submitting this form, you agree to receive emails about your consultation. 
                    We respect your privacy and won't share your information.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens during the consultation?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    We'll spend 30 minutes getting to know your ministry, understanding your challenges, 
                    and discussing how we might be able to help. No pressure, no sales pitch—just a genuine conversation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there really no cost?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes! The initial consultation is completely free with no obligation. We want to make sure 
                    we're a good fit before moving forward with any paid services.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How quickly can we get started?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    After your consultation, if we decide to work together, we can typically begin within 1-2 weeks. 
                    For urgent situations, we can often accommodate faster timelines.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}