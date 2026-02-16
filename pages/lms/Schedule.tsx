import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, Users, Video, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CALENDLY_URL = 'https://calendly.com/erskinecurrie3/30min';

export default function Schedule() {
  const navigate = useNavigate();
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Listen for Calendly event_scheduled message
    const handleMessage = (e: MessageEvent) => {
      if (e.data.event === 'calendly.event_scheduled') {
        navigate('/lms/dashboard');
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      // Clean up script if still present
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [navigate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Schedule</h1>
          <p className="text-gray-600">Manage your training schedule and sessions</p>
        </div>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendly CTA Banner */}
      <Card className="mb-6 border-2 border-[#F4E2A3] bg-gradient-to-r from-black to-gray-900 text-white overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Book a 30-Minute Session</h2>
              <p className="text-gray-300 mb-4">
                Schedule a one-on-one session with our team to discuss your worship training journey,
                get personalized guidance, or ask any questions about the program.
              </p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4 text-[#F4E2A3]" />
                  <span className="text-sm">30 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Video className="h-4 w-4 text-[#F4E2A3]" />
                  <span className="text-sm">Video call</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4 text-[#F4E2A3]" />
                  <span className="text-sm">1-on-1 session</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#F4E2A3] text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>After scheduling, you&apos;ll be redirected to your dashboard</span>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="w-32 h-32 bg-[#F4E2A3] bg-opacity-20 rounded-full flex items-center justify-center">
                <Calendar className="h-16 w-16 text-[#F4E2A3]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendly Inline Embed */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Schedule Your Session
          </CardTitle>
          <CardDescription>Select a date and time that works for you below</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={calendlyRef}
            className="calendly-inline-widget"
            data-url={CALENDLY_URL}
            style={{ minWidth: '320px', height: '700px' }}
          />
        </CardContent>
      </Card>

      {/* Training Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#F4E2A3]" />
            Training Calendar
          </CardTitle>
          <CardDescription>View and manage your training schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Your Schedule</p>
            <p className="text-sm">Track sessions, deadlines, and important dates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}