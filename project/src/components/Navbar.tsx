import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, ChevronDown, Settings, LogOut, User, Search, Filter, Calendar } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Planned vs Actual', path: '/planned-vs-actual' },
  { name: 'Incident Tracking', path: '/incidents' },
  { name: 'Tiering', path: '/tiering' }
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Brand + Navigation */}
          <div className="flex items-center gap-8">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="relative animate-float">
                <Bus 
                  size={21} 
                  className="text-amber-400" 
                  strokeWidth={2.5}
                />
              </div>
              <span 
                className="font-semibold text-[15px] bg-gradient-to-r from-[#00800F] via-[#007BFF] to-[#8A2BE2] bg-clip-text text-transparent"
                style={{
                  backgroundSize: '200% auto',
                  animation: 'gradient 3s linear infinite'
                }}
              >
                TransAuditor
              </span>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'text-purple-700 bg-purple-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="flex items-center h-9 w-full bg-white border border-gray-200 rounded-lg focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <div className="flex items-center flex-1 px-3">
                  <Search className="text-gray-400 flex-shrink-0" size={16} />
                  <input
                    type="text"
                    placeholder="Search routes, drivers, or issues..."
                    className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2 px-2 border-l border-gray-200">
                  <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900">
                    <Filter size={12} />
                    <span>Filters</span>
                    <ChevronDown size={10} />
                  </button>
                  <button className="flex items-center gap-1 text-[10px] font-medium text-gray-700 hover:text-gray-900">
                    <Calendar size={12} />
                    <span>1W</span>
                    <ChevronDown size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-700">JS</span>
                    </div>
                    <div className="absolute inset-0 border-2 border-purple-400 rounded-full animate-pulse"></div>
                  </div>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="p-2 mb-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">John Smith</p>
                  <p className="text-xs text-gray-500">john.smith@example.com</p>
                </div>
                <div className="space-y-1 p-1">
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 rounded-md">
                    <User size={14} />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-900 rounded-md">
                    <Settings size={14} />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md">
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% center }
            100% { background-position: 200% center }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
        `}
      </style>
    </nav>
  );
}