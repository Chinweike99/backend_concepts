export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">BrandName</h3>
            <p className="text-gray-400">
              Providing exceptional services and products to our valued customers.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="/stories" className="hover:text-white transition-colors">Client Stories</a></li>
              <li><a href="/bookings" className="hover:text-white transition-colors">Book a Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <address className="not-italic text-gray-400">
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>info@brandname.com</p>
              <p>(555) 123-4567</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BrandName. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}