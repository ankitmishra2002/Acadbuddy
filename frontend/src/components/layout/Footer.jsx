import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Linkedin, Heart, Code, Users, GraduationCap, FileText, Palette } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-xl font-bold">Academic Help Buddy</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              AI-powered study companion for university students. Generate notes, create exam blueprints, and share content with your community.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/ankitmishra2002/Acadbuddy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
              <a 
                href="https://x.com/Amritanshutwt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="https://www.linkedin.com/in/avoy-sasmal/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors text-sm">Dashboard</Link>
              </li>
              <li>
                <Link to="/subjects" className="text-gray-300 hover:text-white transition-colors text-sm">Subjects</Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-300 hover:text-white transition-colors text-sm">Community</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Login</Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-blue-400 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Features
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300 text-sm">AI Study Notes</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Exam Blueprints</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Revision Planners</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Mock Papers</span>
              </li>
              <li>
                <span className="text-gray-300 text-sm">Community Sharing</span>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Code className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-lg font-semibold text-blue-400">Help this project</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              If you want to support this project by becoming a sponsor or want to contribute, just ping us on{' '}
              <a 
                href="https://x.com/Amritanshutwt" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-white transition-colors font-bold"
              >
                Twitter/X
              </a>
              . Want to make this project better or advance its features?{' '}
              <a 
                href="https://github.com/ankitmishra2002/Acadbuddy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-white transition-colors font-bold"
              >
                Contribute here.
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Academic Help Buddy. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center text-gray-400 text-sm">
            <span>Built with</span>
            <Heart className="h-4 w-4 text-red-500 mx-1" />
            <span>for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

