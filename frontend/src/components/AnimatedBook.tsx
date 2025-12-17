import { motion } from 'framer-motion';

const AnimatedBook = () => {
  return (
    <div className="relative flex items-center justify-center w-full h-full bg-linear-to-br from-blue-50 to-indigo-100 rounded-2xl">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {/* Book Cover */}
        <motion.path
          d="M40 160 C 40 160, 40 40, 40 40 C 40 40, 90 30, 100 40 C 110 30, 160 40, 160 40 C 160 40, 160 160, 160 160 C 160 160, 110 150, 100 160 C 90 150, 40 160, 40 160 Z"
          fill="#3b82f6"
          stroke="#1e3a8a"
          strokeWidth="4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            transition: { duration: 1.5, ease: 'easeInOut' },
          }}
        />

        {/* Left Page Pages */}
        <motion.path
          d="M45 155 C 45 155, 45 45, 45 45 C 45 45, 90 38, 98 46 L 98 156 C 90 148, 45 155, 45 155 Z"
          fill="#fff"
          opacity="0.8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { delay: 0.5, duration: 0.8 } }}
          style={{ originX: 0.5 }} // Approximate hinge
        />

        {/* Right Page Pages */}
        <motion.path
          d="M155 155 C 155 155, 155 45, 155 45 C 155 45, 110 38, 102 46 L 102 156 C 110 148, 155 155, 155 155 Z"
          fill="#fff"
          opacity="0.8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { delay: 0.5, duration: 0.8 } }}
          style={{ originX: 0.5 }}
        />

        {/* Spine */}
        <motion.line
          x1="100"
          y1="40"
          x2="100"
          y2="160"
          stroke="#1e3a8a"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, transition: { delay: 1, duration: 0.5 } }}
        />

        {/* Floating Elements/Stars */}
        <motion.circle
          cx="170"
          cy="30"
          r="5"
          fill="#fbbf24"
          animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.circle
          cx="30"
          cy="170"
          r="3"
          fill="#fbbf24"
          animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
        />
        <motion.circle
          cx="160"
          cy="180"
          r="4"
          fill="#fbbf24"
          animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3, delay: 1 }}
        />
      </motion.svg>
      <div className="absolute bottom-10 text-center">
        <motion.h3
          className="text-xl font-bold text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          CampusBookEx
        </motion.h3>
        <motion.p
          className="text-sm text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          Exchange books, expand knowledge.
        </motion.p>
      </div>
    </div>
  );
};

export default AnimatedBook;
