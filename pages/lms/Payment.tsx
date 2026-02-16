import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import PricingPlans from '@/components/billing/PricingPlans';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { client } from '@/lib/api';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    if (success) {
      toast.success('Subscription successful! Welcome to your new plan.');
      // Clear the query params
      navigate('/lms/payment', { replace: true });
    } else if (canceled) {
      toast.error('Subscription canceled. You can try again anytime.');
      navigate('/lms/payment', { replace: true });
    }
  }, [success, canceled, navigate]);

  const handleManageSubscription = async () => {
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/stripe/create-portal-session',
        method: 'POST',
        data: {
          return_url: window.location.origin + '/lms/payment'
        }
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Portal session error:', error);
      toast.error(error?.data?.detail || 'Failed to open billing portal');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Subscription Plans</h1>
        <p className="text-gray-600">Choose the plan that's right for you</p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <Card className="mb-6 border-2 border-green-500 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-green-900">Subscription Activated!</p>
                <p className="text-sm text-green-700">Your payment was successful. You now have access to all premium features.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canceled && (
        <Card className="mb-6 border-2 border-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <p className="font-semibold text-red-900">Subscription Canceled</p>
                <p className="text-sm text-red-700">Your subscription was not completed. You can try again anytime.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Subscription Status */}
      <Card className="mb-8 border-2 border-[#F4E2A3]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Current Subscription
          </CardTitle>
          <CardDescription>Manage your billing and subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-black">Free Plan</p>
              <p className="text-sm text-gray-500">Basic access to community features</p>
            </div>
            <Button 
              variant="outline" 
              className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
              onClick={handleManageSubscription}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black mb-4">Available Plans</h2>
        <PricingPlans />
      </div>

      {/* Additional Revenue Streams */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Digital Courses</CardTitle>
            <CardDescription>Self-paced learning modules</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Access specialized courses on worship leadership, team building, and ministry development.
            </p>
            <Button variant="outline" className="w-full">Browse Courses</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Tickets</CardTitle>
            <CardDescription>Join our workshops and conferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Register for upcoming events, workshops, and training sessions.
            </p>
            <Button variant="outline" className="w-full">View Events</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource Library</CardTitle>
            <CardDescription>Templates and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Download worship planning templates, setlists, and ministry resources.
            </p>
            <Button variant="outline" className="w-full">Explore Resources</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support Our Mission</CardTitle>
            <CardDescription>Make a donation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Help us continue providing quality training and resources to worship leaders.
            </p>
            <Button variant="outline" className="w-full">Donate</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}