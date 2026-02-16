import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Download,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { client } from '@/lib/api';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCalendar = () => {
    if (!event) return;

    // Generate .ics file content
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || 'Online'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Calendar event downloaded');
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
              <CardDescription>The event you're looking for doesn't exist.</CardDescription>
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

  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();
  const spotsLeft = event.capacity - event.registered;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/events">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>

        {/* Event Header */}
        <Card className="mb-8 border-2 border-[#F4E2A3]">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C] capitalize">
                    {event.type}
                  </Badge>
                  {isPastEvent && (
                    <Badge variant="outline" className="border-gray-400 text-gray-600">
                      Past Event
                    </Badge>
                  )}
                  {!isPastEvent && spotsLeft <= 5 && spotsLeft > 0 && (
                    <Badge variant="outline" className="border-orange-400 text-orange-600">
                      Only {spotsLeft} spots left!
                    </Badge>
                  )}
                  {spotsLeft === 0 && (
                    <Badge variant="outline" className="border-red-400 text-red-600">
                      Sold Out
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl text-black mb-2">{event.title}</CardTitle>
                <CardDescription className="text-base">
                  {event.description || 'Join us for this transformative ministry experience'}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#F4E2A3] mb-1">
                  {event.price === 0 ? 'Free' : `$${event.price}`}
                </div>
                {event.price > 0 && (
                  <p className="text-sm text-gray-600">per person</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-[#F4E2A3]" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-[#F4E2A3]" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm">{format(eventDate, 'h:mm a')}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-[#F4E2A3]" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm">{event.location || 'Online via Zoom'}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-[#F4E2A3]" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm">{event.registered} / {event.capacity} registered</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t">
              {!isPastEvent && spotsLeft > 0 ? (
                <Button asChild className="flex-1 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]" size="lg">
                  <Link to={`/events/${event.id}/register`}>
                    Register Now
                  </Link>
                </Button>
              ) : (
                <Button disabled className="flex-1" size="lg">
                  {isPastEvent ? 'Event Ended' : 'Sold Out'}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleAddToCalendar}
                className="border-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black"
              >
                <Download className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-black">About This Event</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {event.description || 'Detailed event description will be provided here. This event is designed to help church leaders grow in their ministry effectiveness and build stronger, healthier congregations.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-black">What You'll Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Practical strategies you can implement immediately',
                    'Biblical foundations for effective ministry',
                    'Proven frameworks from successful church leaders',
                    'Tools and templates to take home',
                    'Networking with other ministry leaders'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#F4E2A3] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-[#F4E2A3]">
              <CardHeader>
                <CardTitle className="text-lg text-black">Event Highlights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Format</span>
                  <span className="font-medium text-black capitalize">{event.type}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-black">
                    {event.type === 'workshop' ? '3 hours' : event.type === 'cohort' ? '8 weeks' : '1 hour'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium text-black">All Levels</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Materials</span>
                  <span className="font-medium text-black">Included</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black text-white">
              <CardHeader>
                <CardTitle className="text-lg text-[#F4E2A3]">Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4">
                  Have questions about this event? We're here to help!
                </p>
                <Button asChild variant="outline" className="w-full border-[#F4E2A3] text-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                  <Link to="/booking">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}