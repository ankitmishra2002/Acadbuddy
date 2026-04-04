import React from 'react';
import { Github, Twitter, Linkedin, Facebook, Mail, GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-slate-900 text-slate-300 pt-20 pb-10 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Acadbuddy</span>
            </div>
            <p className="text-slate-400 max-w-xs leading-relaxed">
              Empowering students with AI-driven study tools and a collaborative community to excel in their academic journey.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 hover:bg-slate-800 rounded-full transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-2 hover:bg-slate-800 rounded-full transition-colors"><Github size={20} /></a>
              <a href="#" className="p-2 hover:bg-slate-800 rounded-full transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Productivity */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Productivity</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Study Planner</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Notes</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Quiz Master</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Focus Mode</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Community Feed</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Study Groups</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Docs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-white font-bold mb-4 text-lg">Stay Updated</h4>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-100"
              />
              <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                Join Newsletter
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 Acadbuddy AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
