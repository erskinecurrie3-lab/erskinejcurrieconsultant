import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-[#F4E2A3] font-semibold mb-4">Erskine J Currie</h3>
            <p className="text-sm text-gray-400">
              Helping churches start, strengthen, and scale healthy worship and leadership systems.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-[#F4E2A3] font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/services" className="hover:text-[#F4E2A3] transition-colors">Church Planting</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#F4E2A3] transition-colors">Church Consulting</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#F4E2A3] transition-colors">Worship Building</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#F4E2A3] transition-colors">Leadership Development</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[#F4E2A3] font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/resources" className="hover:text-[#F4E2A3] transition-colors">Free Downloads</Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#F4E2A3] transition-colors">Upcoming Events</Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-[#F4E2A3] transition-colors">Book Consultation</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#F4E2A3] font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:contact@erskinecurrie.com" className="hover:text-[#F4E2A3] transition-colors">
                  Email Us
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="hover:text-[#F4E2A3] transition-colors">
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Erskine J Currie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}