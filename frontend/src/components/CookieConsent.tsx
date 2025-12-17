import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Small delay to make the entrance feel more deliberate
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto overflow-hidden bg-white border border-gray-200 shadow-2xl rounded-2xl md:flex md:items-center md:justify-between">
            <div className="p-4 md:p-6 md:flex-1">
              <div className="flex items-center gap-3 mb-2 md:mb-1">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  We use cookies
                </h3>
              </div>
              <p className="text-sm text-gray-600 md:text-base">
                We use cookies to enhance your browsing experience, serve
                personalized content, and analyze our traffic. By clicking
                "Accept", you consent to our use of cookies.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-4 bg-gray-50 md:flex-row md:items-center md:p-6 md:bg-transparent">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-semibold text-gray-600 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
