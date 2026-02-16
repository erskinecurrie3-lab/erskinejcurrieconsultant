import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, TrendingUp, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const services = [
    {
      title: 'Church Planting',
      description: 'Strategic guidance for launching healthy, sustainable churches from vision to launch day.',
      icon: Users
    },
    {
      title: 'Church Consulting',
      description: 'Expert consultation to strengthen existing ministries and overcome growth barriers.',
      icon: TrendingUp
    },
    {
      title: 'Worship Building',
      description: 'Develop vibrant worship teams and create engaging worship experiences.',
      icon: Award
    }
  ];

  const benefits = [
    'Proven frameworks for church health',
    'Personalized coaching and support',
    'Practical implementation strategies',
    'Ongoing accountability and guidance'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Build Healthy Churches That Last
                </h1>
                <p className="text-xl mb-8 text-gray-300">
                  Expert consulting for church planters, senior pastors, and worship leaders. 
                  Get the clarity, structure, and execution you need to strengthen your ministry.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                    <Link to="/booking">Book a Consultation</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-[#F4E2A3] text-[#F4E2A3] hover:bg-[#F4E2A3] hover:text-black">
                    <Link to="/services">Explore Services</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://mgx-backend-cdn.metadl.com/generate/images/719937/2026-02-12/1fbbd926-6412-4c3e-8b66-29729a3b07be.png"
                  alt="Ministry Consulting"
                  className="rounded-lg shadow-2xl border-2 border-[#F4E2A3]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-black mb-4">
                How We Serve You
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive consulting services designed for churches at every stage
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="hover:shadow-xl transition-shadow border-2 hover:border-[#F4E2A3]">
                    <CardHeader>
                      <div className="w-12 h-12 bg-[#F4E2A3] rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-black" />
                      </div>
                      <CardTitle className="text-black">{service.title}</CardTitle>
                      <CardDescription className="text-gray-600">{service.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img 
                  src="https://mgx-backend-cdn.metadl.com/generate/images/719937/2026-02-12/ff3654bd-cd53-4c69-9ab1-428fd21e588e.png"
                  alt="Church Community"
                  className="rounded-lg shadow-lg border-2 border-[#F4E2A3]"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-black mb-6">
                  Why Churches Choose Us
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  We don't just offer advice—we deliver clarity, structure, and implementation 
                  that transforms your ministry.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[#F4E2A3] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-8 bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
                  <Link to="/booking">Get Started Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Strengthen Your Ministry?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Schedule a consultation and discover how we can help your church thrive.
            </p>
            <Button asChild size="lg" className="bg-[#F4E2A3] text-black hover:bg-[#E6D08C]">
              <Link to="/booking">Book Your Consultation</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}