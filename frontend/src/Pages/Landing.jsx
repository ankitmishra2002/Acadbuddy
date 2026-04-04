import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { BookOpen, Users, Award, Zap, ArrowRight, CheckCircle, Sparkles, BrainCircuit, Rocket, ShieldAlert } from 'lucide-react';
import Footer from '../components/layout/Footer';

const Landing = () => {
  const { isAuthenticated, fetchUser, user } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUser();
    } else {
      useAuthStore.setState({ isAuthenticated: false, user: null });
    }
  }, []);

  const features = [
    {
      icon: <BrainCircuit className="text-blue-500" size={36} />,
      title: 'AI-Powered Study Notes',
      description: 'Generate comprehensive study notes tailored to your syllabus and learning style instantly.'
    },
    {
      icon: <Zap className="text-amber-500" size={36} />,
      title: 'Smart Exam Preparation',
      description: 'Create exam blueprints, revision planners, and smart mock papers with AI assistance.'
    },
    {
      icon: <Users className="text-emerald-500" size={36} />,
      title: 'Community Sharing',
      description: 'Share your smartest study materials and discover genius content from peers worldwide.'
    },
    {
      icon: <Award className="text-indigo-500" size={36} />,
      title: 'Personalized Learning',
      description: 'Customize answer styles entirely and track your progress natively across all subjects.'
    }
  ];

  const benefits = [
    'Generate intelligent study context in seconds',
    'Build and export realistic exam blueprints',
    'Share and discover vibrant community content',
    'Track analytical study progress effortlessly',
    'Adapt and customize your exact learning style',
    'Access resources reliably from anywhere, anytime'
  ];

  // Animation Variants
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-[#fafcff] text-slate-800 selection:bg-blue-100 font-sans overflow-x-hidden">

      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-slate-800">
                AcadBuddy
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-5">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                    >
                      <ShieldAlert size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs md:text-base transform hover:-translate-y-0.5"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:block px-4 py-2 font-medium text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 md:px-5 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-xs md:text-base transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8 shadow-sm"
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>The Next Generation of AI Study Tools is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight"
          >
            Your AI-Powered <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500">
              Study Companion
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Generate comprehensive study notes, intelligent exam blueprints, and tailored revision materials in seconds. Join a fast-growing community of smart learners.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="https://www.youtube.com/watch?v=sMn2lGWTmPs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 text-center flex items-center justify-center"
                >
                  View Demo
                </a>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Go to Dashboard
                <Rocket size={20} />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      {/* <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28 mt-[-2rem] sm:mt-0">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-100 aspect-video ring-4 ring-white"
        >
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/sMn2lGWTmPs?si=Ww7FbM3v7lq9_fbF" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </motion.div>
      </section> */}

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUpVariant}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            A comprehensive suite of tools designed mathematically to increase your retention and reduce study hours.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeUpVariant}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
            >
              <div className="mb-6 inline-flex p-3 bg-slate-50 rounded-2xl border border-slate-100">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Benefits / Workings */}
      <section className="relative z-10 py-24 bg-white/40 backdrop-blur-2xl border-y border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Why Top Students Choose <br />
                <span className="text-blue-600">Academic Help Buddy</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Outperform the curve by leveraging the most advanced study strategies translated directly into a simple, automated application.
              </p>

              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-white/60 p-4 rounded-2xl border border-white hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                      <CheckCircle className="text-blue-600" size={18} />
                    </div>
                    <p className="font-medium text-slate-700">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[2.5rem] bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 p-8 sm:p-12 shadow-[inset_0_2px_20px_rgba(255,255,255,0.8)]"
            >
              <div className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-[2.5rem]"></div>

              <div className="relative z-10 bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
                  <Rocket size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-8">
                  Get Started in 3 Steps
                </h3>

                <ol className="space-y-6">
                  {[
                    ['Create Profile', 'Sign up safely with your academic details'],
                    ['Connect Subjects', 'Define your exact subjects and syllabi patterns'],
                    ['Generate & Learn', 'Create flawless notes and exam material instantly']
                  ].map((step, idx) => (
                    <li key={idx} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold font-mono border border-slate-200 shadow-inner">
                        0{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800 text-lg">
                          {step[0]}
                        </p>
                        <p className="text-slate-500">
                          {step[1]}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-slate-900 shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-900 to-slate-900 mix-blend-multiply" />

          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px]" />

          <div className="relative z-10 px-6 sm:px-12 py-16 sm:py-20 text-center flex flex-col items-center">

            <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <Sparkles className="text-yellow-400" size={32} />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Ready to Transform Your <br className="hidden sm:block" /> Academic Journey?
            </h2>

            <p className="text-lg mb-10 text-blue-100/80 max-w-xl text-center leading-relaxed">
              Join thousands of students globally who are securing higher grades with a fraction of the traditional effort. Get your AI Copilot today.
            </p>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-slate-900 text-lg font-bold rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 transform hover:-translate-y-1"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Start For Free'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
