// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './components/shared/protectedroute';
// import Navbar from './components/shared/navbar';

// // Public pages
// import Home          from './pages/home';
// import Login         from './pages/auth/login';
// import Register      from './pages/auth/RegisterForm';
// import HotelList     from './pages/hotel/hotels';
// import HotelDetail   from './pages/hotel/hoteldetail';

// // Guest protected pages
// import Booking       from './pages/booking/booking';
// import BookingDetail from './pages/booking/bookingdetail';
// import Payment       from './pages/payment/payment';
// import Reviews       from './pages/review/reviews';
// //import EventSpaces   from './pages/event/eventspaces';
// //import EventBooking  from './pages/event/eventbooking';

// // Host protected pages
// import Defects       from './pages/defect/defects';
// import HostReviews   from './pages/review/hostreviews';

// // User profile
// import Profile       from './pages/user/profile';

// // Admin pages
// import ManageBookings from './pages/admin/managebookings';
// //import ManageHotels   from './pages/admin/managehotels';
// import ManagePayments from './pages/admin/managepayments';
// import ManageReviews  from './pages/admin/managereviews';
// import ManageUsers    from './pages/admin/manageusers';

// const AppRouter = () => {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>

//         {/* ── Public ── */}
//         <Route path="/"           element={<Home />} />
//         <Route path="/login"      element={<Login />} />
//         <Route path="/register"   element={<Register />} />
//         <Route path="/hotels"     element={<HotelList />} />
//         <Route path="/hotels/:id" element={<HotelDetail />} />
//         <Route path="/events"     element={<EventSpaces />} />

//         {/* ── Any logged-in user ── */}
//         <Route path="/profile" element={
//           <ProtectedRoute><Profile /></ProtectedRoute>
//         } />

//         {/* ── Guest routes ── */}
//         <Route path="/bookings" element={
//           <ProtectedRoute roles={['GUEST']}><Booking /></ProtectedRoute>
//         } />
//         <Route path="/bookings/:id" element={
//           <ProtectedRoute roles={['GUEST']}><BookingDetail /></ProtectedRoute>
//         } />
//         <Route path="/payments" element={
//           <ProtectedRoute roles={['GUEST']}><Payment /></ProtectedRoute>
//         } />
//         <Route path="/reviews" element={
//           <ProtectedRoute roles={['GUEST']}><Reviews /></ProtectedRoute>
//         } />
//         <Route path="/events/:id/book" element={
//           <ProtectedRoute roles={['GUEST']}><EventBooking /></ProtectedRoute>
//         } />

//         {/* ── Host routes ── */}
//         <Route path="/defects" element={
//           <ProtectedRoute roles={['HOST', 'ADMIN']}><Defects /></ProtectedRoute>
//         } />
//         <Route path="/host/reviews" element={
//           <ProtectedRoute roles={['HOST', 'ADMIN']}><HostReviews /></ProtectedRoute>
//         } />

//         {/* ── Admin routes ── */}
//         <Route path="/admin/bookings" element={
//           <ProtectedRoute roles={['ADMIN']}><ManageBookings /></ProtectedRoute>
//         } />
//         <Route path="/admin/hotels" element={
//           <ProtectedRoute roles={['ADMIN']}><ManageHotels /></ProtectedRoute>
//         } />
//         <Route path="/admin/payments" element={
//           <ProtectedRoute roles={['ADMIN']}><ManagePayments /></ProtectedRoute>
//         } />
//         <Route path="/admin/reviews" element={
//           <ProtectedRoute roles={['ADMIN']}><ManageReviews /></ProtectedRoute>
//         } />
//         <Route path="/admin/users" element={
//           <ProtectedRoute roles={['ADMIN']}><ManageUsers /></ProtectedRoute>
//         } />

//         {/* ── 404 fallback ── */}
//         <Route path="*" element={
//           <div style={{ textAlign: 'center', padding: '80px' }}>
//             <h2>404 — Page not found</h2>
//           </div>
//         } />

//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default AppRouter;
