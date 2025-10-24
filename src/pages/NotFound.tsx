import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion"; // For animations

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <motion.div
        className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          404
        </motion.h1>
        <p className="text-2xl text-gray-700 mb-6 font-medium">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-gray-500 mb-8">
          It seems you've wandered off the path. Let's get you back home!
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors duration-300 font-semibold"
        >
          Return to Home
        </a>
      </motion.div>
    </div>
  );
};

export default NotFound;
