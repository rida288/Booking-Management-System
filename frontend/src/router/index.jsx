import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginForm /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterForm /></PublicLayout>} />
      <Route path="/profile" element={<ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST, ROLES.ADMIN]}><Profile /></ProtectedRoute>} />
      <Route path="/hotels" element={<PublicLayout><HotelsPage /></PublicLayout>} />
      <Route path="/bookings" element={<ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><BookingPage /></ProtectedRoute>} />
      <Route path="/bookings/history" element={<ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><BookingPage /></ProtectedRoute>} />
      <Route path="/bookings/:id" element={<ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST, ROLES.ADMIN]}><BookingDetailPage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute roles={[ROLES.GUEST, ROLES.HOST]}><PaymentPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;