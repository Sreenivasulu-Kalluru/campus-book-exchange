// src/components/common/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const PrivateRoute = () => {
  // 1. Get the authentication status from our store
  const isAuth = useAuthStore((state) => state.isAuth);

  // 2. Check the status
  return isAuth ? (
    // 3a. If logged in, render the page (the <Outlet />)
    <Outlet />
  ) : (
    // 3b. If not logged in, redirect to the /login page
    <Navigate to="/login" replace />
  );
};

export default PrivateRoute;
