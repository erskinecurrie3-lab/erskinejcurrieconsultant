import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { client } from '@/lib/api';
import { toast } from 'sonner';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51T0WCuPXfLAPdXx1RTznCl1QexcSiT8sWYrH10mo4DmZ1AMTpWrzulXQLTNpotYPlACAO7RMk3XEN2gDSjqyqEMa00t6emNgLR');

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  priceId: string;
  features: string[];
  recommended?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    priceId: '',
    features: [
      'Community access',
      'Basic chat',
      'Limited resources',
      'Public forums'
    ]
  },
  {
    id: 'church',
    name: 'Church Plan',
    price: 29,
    interval: 'month',
    priceId: 'price_church_monthly', // Replace with actual Stripe price ID
    recommended: true,
    features: [
      'Everything in Free',
      'Assessments',
      'Team workspace',
      'Training library',
      'Reports & analytics',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro/Consulting',
    price: 199,
    interval: 'month',
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    features: [
      'Everything in Church Plan',
      'Personal coaching',
      'Certifications',
      'Priority support',
      'Done-for-you templates',
      'Advanced analytics',
      'Custom integrations'
    ]
  }
];

export default function PricingPlans() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    setLoading(plan.id);
    try {
      const response = await client.apiCall.invoke({
        url: '/api/v1/stripe/create-checkout-session',
        method: 'POST',
        data: {
          price_id: plan.priceId,
          success_url: '/lms/payment?success=true',
          cancel_url: '/lms/payment?canceled=true'
        }
      });

      const stripe = await stripePromise;
      if (stripe && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error?.data?.detail || error?.message || 'Failed to start subscription');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative ${plan.recommended ? 'border-2 border-[#F4E2A3] shadow-lg' : 'border-2 border-gray-200'}`}
        >
          {plan.recommended && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#F4E2A3] text-black px-4 py-1 rounded-full text-xs font-semibold">
                RECOMMENDED
              </span>
            </div>
          )}
          
          <CardHeader>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>
              {plan.id === 'free' && 'Get started for free'}
              {plan.id === 'church' && 'Perfect for church teams'}
              {plan.id === 'pro' && 'Advanced features & support'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-black">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-gray-500 ml-2">/{plan.interval}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full ${
                plan.recommended 
                  ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.id || plan.id === 'free'}
            >
              {loading === plan.id ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : plan.id === 'free' ? (
                'Current Plan'
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}