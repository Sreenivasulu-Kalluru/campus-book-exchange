// src/components/common/Navbar.tsx
import { Bell, BookOpen, LogIn, LogOut, User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore'; // <-- 1. IMPORT

const Navbar = () => {
  // --- Auth State (Correct, performant selectors) ---
  const isAuth = useAuthStore((state) => state.isAuth);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // --- 3. NOTIFICATION STATE (FIXED: Correct, performant selectors) ---
  const hasUnread = useNotificationStore((state) => state.hasUnread);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  // --- UI State (For Modal) ---

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const handleBellClick = () => {
    markAsRead(); // This sets hasUnread to false
    navigate('/profile'); // Go to the profile page to see requests
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 text-dark-text">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Link */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-primary"
          >
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="hidden transition-colors duration-300 sm:inline hover:text-accent">
              CampusBookEx
            </span>
          </Link>

          {/* --- Conditional Navigation --- */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuth ? (
              // --- IF LOGGED IN ---
              <>
                {/* Profile Link (Desktop) */}
                <Link
                  to="/profile"
                  className="items-center hidden font-medium transition-colors duration-300 sm:flex text-dark-text hover:text-primary"
                >
                  <User className="w-5 h-5 mr-2" />
                  Hello, {user?.name?.split(' ')[0]}
                </Link>

                {/* Profile Icon (Mobile) */}
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-10 h-10 transition-colors rounded-full sm:hidden text-dark-text hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                </Link>

                {/* Notification Bell */}
                <button
                  onClick={handleBellClick}
                  className="relative flex items-center justify-center w-10 h-10 transition-colors rounded-full text-dark-text hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full top-1 right-1" />
                  )}
                </button>

                {/* --- 4. ADD INBOX LINK --- */}
                <Link
                  to="/inbox"
                  className="relative flex items-center justify-center w-10 h-10 transition-colors rounded-full text-dark-text hover:bg-gray-100"
                >
                  <Mail className="w-5 h-5" />
                </Link>

                {/* Logout Button (Desktop) */}
                <button
                  onClick={handleLogout}
                  className="items-center hidden px-4 py-2 font-medium text-white transition-all duration-300 bg-red-600 rounded-lg shadow-sm sm:flex hover:bg-red-700 hover:shadow-md"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>

                {/* Logout Icon (Mobile) */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 text-red-600 transition-colors rounded-full sm:hidden hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              // --- IF LOGGED OUT ---
              <>
                {/* Login Button (Desktop) */}
                <Link
                  to="/login"
                  className="items-center hidden px-4 py-2 font-medium text-white transition-all duration-300 rounded-lg shadow-sm sm:flex bg-primary hover:bg-blue-800 hover:scale-105"
                >
                  Login
                </Link>

                {/* Login Icon (Mobile) */}
                <Link
                  to="/login"
                  className="flex items-center justify-center w-10 h-10 transition-colors rounded-full sm:hidden text-primary hover:bg-blue-50"
                >
                  <LogIn className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
