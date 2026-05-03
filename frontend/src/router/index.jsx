import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/shared/Navbar';
import Home from '../pages/home';
import BookingPage from '../pages/booking/booking';
import BookingDetailPage from '../pages/booking/bookingdetail';
import PaymentPage from '../pages/payment/payment';
import LoginForm from '../pages/auth/login';
import RegisterForm from '../pages/auth/RegisterForm';
import Profile from '../pages/user/Profile';
import HotelsPage from '../pages/hotel/hotels';
import MyReviewsPage from '../pages/review/reviews';
import HostReviewsPage from '../pages/review/hostreviews';
import ManageBookings from '../pages/admin/managebookings';
import ManagePayments from '../pages/admin/managepayments';
import ManageReviews from '../pages/admin/managereviews';
import { ROLES } from '../utils/constants';

const Layout = ({ children }) => (
  <div style={{ minHeight:'100vh', background:'#f0f2f5' }}>
    <Navbar />
    <main>{children}</main>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
};

const PublicLayout = ({ children }) => <Layout>{children}</Layout>;

const router = createBrowserRouter([
  { path: '/', element: <PublicLayout><Home /></PublicLayout> },
  { path: '/login', element: <PublicLayout><LoginForm /></PublicLayout> },
  { path: '/register', element: <PublicLayout><RegisterForm /></PublicLayout> },
  { path: '/profile', element: <ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST, ROLES.ADMIN]}><Profile /></ProtectedRoute> },
  { path: '/hotels', element: <PublicLayout><HotelsPage /></PublicLayout> },
  { path: '/bookings', element: <ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><BookingPage /></ProtectedRoute> },
  { path: '/bookings/history', element: <ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><BookingPage /></ProtectedRoute> },
  { path: '/bookings/:id', element: <ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST, ROLES.ADMIN]}><BookingDetailPage /></ProtectedRoute> },
  { path: '/payments', element: <ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><PaymentPage /></ProtectedRoute> },
  { path: '/reviews', element: <ProtectedRoute roles={[ROLES.GUEST]}><MyReviewsPage /></ProtectedRoute> },
  { path: '/host/reviews', element: <ProtectedRoute roles={[ROLES.HOST]}><HostReviewsPage /></ProtectedRoute> },
  { path: '/admin/bookings', element: <ProtectedRoute roles={[ROLES.ADMIN]}><ManageBookings /></ProtectedRoute> },
  { path: '/admin/payments', element: <ProtectedRoute roles={[ROLES.ADMIN]}><ManagePayments /></ProtectedRoute> },
  { path: '/admin/reviews', element: <ProtectedRoute roles={[ROLES.ADMIN]}><ManageReviews /></ProtectedRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;