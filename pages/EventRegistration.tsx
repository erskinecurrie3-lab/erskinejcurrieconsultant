import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { client } from '@/lib/api';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EventRegistration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    church_name: '',
    role: '',
    dietary_restrictions: '',
    agree_terms: false
  });

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await client.entities.events.get({ id: id! });
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to load event:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agree_terms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    if (!event) return;

    setSubmitting(true);

    try {
      // Create registration record
      const registration = await client.entities.registrations.create({
        data: {
          event_id: parseInt(id!),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          church_name: formData.church_name,
          role: formData.role,
          dietary_restrictions: formData.dietary_restrictions,
          status: event.price === 0 ? 'confirmed' : 'pending',
          payment_status: event.price === 0 ? 'free' : 'pending'
        }
      });

      // If free event, redirect to confirmation
      if (event.price === 0) {
        toast.success('Registration confirmed!');
        navigate(`/events/${id}/confirmation`);
        return;
      }

      // For paid events, initiate Stripe checkout
      const paymentResponse = await client.apiCall.invoke({
        url: '/api/v1/payment/create_payment_session',
        method: 'POST',
        data: {
          event_id: parseInt(id!),
          registration_id: registration.data.id,
          amount: event.price,
          success_url: `${window.location.origin}/events/${id}/confirmation`,
          cancel_url: `${window.location.origin}/events/${id}/register`
        }
      });

      // Redirect to Stripe checkout
      if (paymentResponse.data?.url) {
        client.utils.openUrl(paymentResponse.data.url);
      } else {
        throw new Error('Payment session URL not received');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMsg = error?.data?.detail || error?.response?.data?.detail || error?.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Event Not Found</CardTitle>
              <CardDescription>The event you're trying to register for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                <Link to="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const spotsLeft = event.capacity - event.registered;
  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/events/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event Details
          </Link>
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-black">Event Registration</CardTitle>
                <CardDescription>
                  Complete the form below to register for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
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
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="church_name">Church Name *</Label>
                      <Input
                        id="church_name"
                        value={formData.church_name}
                        onChange={(e) => handleChange('church_name', e.target.value)}
                        placeholder="Grace Community Church"
                        required
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
                          <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietary_restrictions"
                        value={formData.dietary_restrictions}
                        onChange={(e) => handleChange('dietary_restrictions', e.target.value)}
                        placeholder="None"
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-4 border-t">
                    <Checkbox
                      id="terms"
                      checked={formData.agree_terms}
                      onCheckedChange={(checked) => handleChange('agree_terms', checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                      I agree to the terms and conditions and understand the cancellation policy. 
                      I will receive confirmation and reminder emails about this event.
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting || !formData.agree_terms}
                    className="w-full bg-[#F4E2A3] text-black hover:bg-[#E6D08C]"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Processing...
                      </>
                    ) : event.price === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Registration
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Event Summary */}
          <div className="space-y-6">
            <Card className="border-2 border-[#F4E2A3]">
              <CardHeader>
                <CardTitle className="text-lg text-black">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-black mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 capitalize">{event.type}</p>
                </div>

                <div className="space-y-2 text-sm pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-black">
                      {format(eventDate, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-black">
                      {format(eventDate, 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-black text-right">
                      {event.location || 'Online'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spots Left:</span>
                    <span className="font-medium text-black">{spotsLeft}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-black">Total:</span>
                    <span className="text-2xl font-bold text-[#F4E2A3]">
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-black">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-[#F4E2A3] mr-2 flex-shrink-0 mt-0.5" />
                    All event materials
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-[#F4E2A3] mr-2 flex-shrink-0 mt-0.5" />
                    Refreshments provided
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-[#F4E2A3] mr-2 flex-shrink-0 mt-0.5" />
                    Certificate of completion
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-[#F4E2A3] mr-2 flex-shrink-0 mt-0.5" />
                    Follow-up resources
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}