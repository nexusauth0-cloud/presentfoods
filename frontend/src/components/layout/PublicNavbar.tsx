import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart } from 'react-icons/fi';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Menu', path: '/login' },
  { name: 'About', path: '/login' },
  { name: 'Blog', path: '/login' },
  { name: 'Contact', path: '/login' },
];

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="text-2xl lg:text-3xl font-bold text-primary">Present Foods</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-full hover:bg-primary-dark transition-all shadow-md">
              Sign In
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${menuOpen ? 'bg-primary text-white shadow-md' : 'text-neutral-800 hover:bg-warm border border-gray-200'}`}>
              {menuOpen ? <><FiX className="w-5 h-5" /><span className="hidden lg:inline text-sm font-medium">Close</span></> : <><FiMenu className="w-5 h-5" /><span className="hidden lg:inline text-sm font-medium">Menu</span></>}
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="bg-white border-t shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
              <div className="flex flex-wrap gap-2">
                {navLinks.map(link => (
                  <Link key={link.name} to={link.path} onClick={() => setMenuOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 hover:bg-gray-50 hover:text-primary border border-transparent hover:border-gray-200 transition-all">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
              <p>Contact: hello@presentfoods.ng</p>
              <p>Mon - Fri: 8AM - 10PM &middot; Sat - Sun: 9AM - 11PM</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
