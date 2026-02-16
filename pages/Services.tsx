import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, Target, BookOpen, Lightbulb } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Services() {
  const services = [
    {
      title: 'Church Planting',
      icon: Users,
      description: 'Strategic guidance for launching healthy, sustainable churches from vision to launch day.',
      features: [
        'Vision and mission development',
        'Launch strategy and timeline',
        'Core team building',
        'Financial planning and fundraising',
        'Community assessment',
        'First 90 days implementation'
      ],
      ideal: 'Church planters preparing to launch or in their first year'
    },
    {
      title: 'Church Consulting',
      icon: TrendingUp,
      description: 'Expert consultation to strengthen existing ministries and overcome growth barriers.',
      features: [
        'Comprehensive church assessment',
        'Leadership development',
        'Systems and structure optimization',
        'Growth strategy planning',
        'Conflict resolution',
        'Revitalization roadmap'
      ],
      ideal: 'Senior pastors of churches 50-800 attendees seeking breakthrough'
    },
    {
      title: 'Worship Building',
      icon: Award,
      description: 'Develop vibrant worship teams and create engaging worship experiences.',
      features: [
        'Worship team development',
        'Song selection and flow',
        'Technical excellence training',
        'Spiritual leadership for worship',
        'Team culture building',
        'Service planning systems'
      ],
      ideal: 'Worship pastors wanting to elevate their ministry impact'
    }
  ];

  const process = [
    {
      step: '1',
      title: 'Discovery Consultation',
      description: 'Free 30-minute call to understand your ministry needs and challenges.',
      icon: Target
    },
    {
      step: '2',
      title: 'Assessment & Planning',
      description: 'Comprehensive evaluation and custom strategy development.',
      icon: BookOpen
    },
    {
      step: '3',
      title: 'Implementation & Support',
      description: 'Hands-on guidance, coaching, and accountability for lasting results.',
      icon: Lightbulb
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ministry Consulting Services
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              We don't just offer advice—we deliver clarity, structure, and implementation 
              that transforms your ministry. Choose the service that fits your needs.
            </p>
            <Button asChild size="lg" className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
              <Link to="/booking">Schedule Free Consultation</Link>
            </Button>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="border-2 hover:border-[#F4E2A3] transition-all hover:shadow-xl">
                    <CardHeader>
                      <div className="w-16 h-16 bg-[#F4E2A3] rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-black" />
                      </div>
                      <CardTitle className="text-2xl text-black">{service.title}</CardTitle>
                      <CardDescription className="text-gray-600 text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-black mb-3">What's Included:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                              <span className="text-[#F4E2A3] mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600 mb-4">
                          <strong className="text-black">Ideal for:</strong> {service.ideal}
                        </p>
                        <Button asChild className="w-full bg-black text-[#F4E2A3] hover:bg-gray-900">
                          <Link to="/booking">Get Started</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">How We Work Together</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A simple, proven process that delivers real results for your ministry
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {process.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-[#F4E2A3] rounded-full flex items-center justify-center mx-auto border-4 border-black">
                        <span className="text-3xl font-bold text-black">{item.step}</span>
                      </div>
                      <Icon className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-3 h-8 w-8 text-black" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-black text-white p-12 rounded-lg border-4 border-[#F4E2A3]">
              <blockquote className="text-xl italic mb-6">
                "Erskine helped us move from chaos to clarity. His practical approach and hands-on support 
                transformed our worship ministry. We now have systems that work and a team that's thriving."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#F4E2A3] rounded-full flex items-center justify-center mr-4">
                  <span className="text-black font-bold text-lg">JM</span>
                </div>
                <div>
                  <p className="font-semibold text-[#F4E2A3]">Pastor James Mitchell</p>
                  <p className="text-gray-400 text-sm">Grace Community Church, Nashville</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#F4E2A3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-black mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="text-xl text-gray-800 mb-8">
              Schedule a free 30-minute discovery consultation to discuss your ministry needs.
            </p>
            <Button asChild size="lg" className="bg-black text-[#F4E2A3] hover:bg-gray-900">
              <Link to="/booking">Book Your Free Consultation</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}