import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, PlusCircle, Heart, LogOut, Menu, X } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

const Sidebar = () => {
  const { disconnectWallet } = useWeb3();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Explore', icon: <Compass size={20} />, path: '/explore' },
    { name: 'Create Campaign', icon: <PlusCircle size={20} />, path: '/create' },
    { name: 'My Donations', icon: <Heart size={20} />, path: '/donations' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg md:hidden text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          
          {/* Logo Section - MATCHING HOMEPAGE BRANDING */}
          <div className="flex items-center gap-3 px-4 mb-8 mt-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20 text-sm tracking-tighter">
              FiW
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-green-400">Fund</span>
              <span className="text-white">it</span>
              <span className="text-blue-500">WID</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive(item.path) 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Disconnect Button */}
          <button 
            onClick={disconnectWallet}
            className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-auto font-medium"
          >
            <LogOut size={20} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        ></div>
      )}
    </>
  );
};

export default Sidebar;