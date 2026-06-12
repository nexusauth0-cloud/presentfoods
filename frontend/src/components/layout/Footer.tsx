import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiMail } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <MdRestaurant className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
              <span className="text-lg sm:text-xl font-bold">Present Foods</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-xs">Bringing the authentic taste of Nigerian cuisine to your doorstep. Fresh, delicious, and made with love.</p>
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-secondary text-xs sm:text-sm transition-colors">Home</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-secondary text-xs sm:text-sm transition-colors">Menu</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-secondary text-xs sm:text-sm transition-colors">About Us</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-secondary text-xs sm:text-sm transition-colors">Blog</Link></li>
              <li><Link to="/login" className="text-gray-400 hover:text-secondary text-xs sm:text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Working Hours</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-gray-400">
                <FiClock className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div><p className="font-medium text-white">Mon - Fri</p><p>8:00 AM - 10:00 PM</p></div>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <FiClock className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                <div><p className="font-medium text-white">Sat - Sun</p><p>9:00 AM - 11:00 PM</p></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 text-gray-400"><FiMapPin className="w-4 h-4 text-secondary shrink-0 mt-0.5" /><p>Kwara, Nigeria</p></div>
              <div className="flex items-center gap-3 text-gray-400"><FiMail className="w-4 h-4 text-secondary shrink-0" /><a href="mailto:hello@presentfoods.ng" className="hover:text-secondary transition-colors">hello@presentfoods.ng</a></div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center text-gray-500 text-[11px] sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Present Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
