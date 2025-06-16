'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginRegisterModal from '../navbar/loginregistermodal';
import { authService } from '@/services/auth.service';

export default function Hero() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleTrackClick = () => {
    if (authService.isAuthenticated()) {
      router.push('/track-package');
    } else {
      setShowModal(true);
    }
  };

  return (
    <section
      className="relative w-full h-screen bg-fixed bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('/hero/bg-img.jpeg')",
      }}
    >
      {/* Darker overlay */}
      <div className="bg-black/75 w-full h-full absolute top-0 left-0 z-0" />

      <div className="relative z-10 container mx-auto px-6 md:px-16">
        {/* Main Content */}
        <div className="flex flex-col items-center text-center text-white font-sans">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            {/* Website Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-wider drop-shadow-lg">
                <span className="text-yellow-400">PRIME</span> DISPATCHER
              </h2>
              <div className="w-32 h-1 bg-yellow-400 mx-auto mt-3 shadow-lg"></div>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 drop-shadow-lg">
              Excellence in <span className="text-yellow-400">Logistics</span>
            </h1>
            <p className="text-xl md:text-2xl leading-relaxed font-medium mb-8 text-white drop-shadow-lg">
              Your trusted partner for seamless logistics. Track shipments in real-time, receive instant updates, and experience complete visibility of your deliveries worldwide.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleTrackClick}
                className="w-full sm:w-auto px-8 py-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Track Your Package
              </button>
              <Link href="/services">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-semibold text-lg border border-white/20">
                  Explore Services
                </button>
              </Link>
            </div>
            {showModal && (
              <LoginRegisterModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onLoginSuccess={() => setShowModal(false)}
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
