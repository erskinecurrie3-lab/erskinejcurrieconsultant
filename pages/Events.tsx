import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { client } from '@/lib/api';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await client.entities.events.query({
        sort: 'date',
        limit: 50
      });
      setEvents(response.data.items);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const upcomingEvents = filteredEvents.filter(e => new Date(e.date) >= new Date());
  const pastEvents = filteredEvents.filter(e => new Date(e.date) < new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Upcoming Events & Training
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join workshops, cohorts, and webinars designed to strengthen your ministry 
              and grow your leadership skills.
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' : 'hover:border-[#F4E2A3]'}
              >
                All Events ({events.length})
              </Button>
              <Button
                variant={filter === 'workshop' ? 'default' : 'outline'}
                onClick={() => setFilter('workshop')}
                className={filter === 'workshop' ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' : 'hover:border-[#F4E2A3]'}
              >
                Workshops ({events.filter(e => e.type === 'workshop').length})
              </Button>
              <Button
                variant={filter === 'cohort' ? 'default' : 'outline'}
                onClick={() => setFilter('cohort')}
                className={filter === 'cohort' ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' : 'hover:border-[#F4E2A3]'}
              >
                Cohorts ({events.filter(e => e.type === 'cohort').length})
              </Button>
              <Button
                variant={filter === 'webinar' ? 'default' : 'outline'}
                onClick={() => setFilter('webinar')}
                className={filter === 'webinar' ? 'bg-[#F4E2A3] text-black hover:bg-[#E6D08C]' : 'hover:border-[#F4E2A3]'}
              >
                Webinars ({events.filter(e => e.type === 'webinar').length})
              </Button>
            </div>
          </div>
        </section>

        {/* Events List */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="Check back soon for new workshops, cohorts, and webinars."
              />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black mb-8">Upcoming Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const spotsLeft = event.capacity - event.registered;
                    
                    return (
                      <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow border-2 hover:border-[#F4E2A3]">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C] capitalize">
                              {event.type}
                            </Badge>
                            {spotsLeft <= 5 && spotsLeft > 0 && (
                              <Badge variant="outline" className="border-orange-400 text-orange-600 text-xs">
                                {spotsLeft} left
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl text-black line-clamp-2">
                            {event.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {event.description || 'Join us for this transformative ministry experience'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                          <div className="space-y-3 mb-4 flex-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                              {format(eventDate, 'MMM d, yyyy • h:mm a')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                              {event.location || 'Online via Zoom'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2 text-[#F4E2A3]" />
                              {event.registered} / {event.capacity} registered
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-2xl font-bold text-[#F4E2A3]">
                              {event.price === 0 ? 'Free' : `$${event.price}`}
                            </span>
                            <Button asChild className="bg-black text-[#F4E2A3] hover:bg-gray-900">
                              <Link to={`/events/${event.id}`}>
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {pastEvents.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold text-black mb-8 mt-12">Past Events</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pastEvents.map((event) => {
                        const eventDate = new Date(event.date);
                        
                        return (
                          <Card key={event.id} className="opacity-75">
                            <CardHeader>
                              <Badge variant="outline" className="w-fit mb-2 border-gray-400 text-gray-600">
                                Past Event
                              </Badge>
                              <CardTitle className="text-xl text-black">{event.title}</CardTitle>
                              <CardDescription>
                                {format(eventDate, 'MMM d, yyyy')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Button asChild variant="outline" className="w-full">
                                <Link to={`/events/${event.id}`}>View Details</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}