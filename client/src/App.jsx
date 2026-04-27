import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import MyAccount from './pages/MyAccount';
import LibrarianDashboard from './pages/LibrarianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import PublishedContent from './pages/manager/PublishedContent';
import PaymentApproval from './pages/manager/PaymentApproval';
import MemberDashboard from './pages/MemberDashboard';
import MyPurchases from './pages/MyPurchases';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LibraryAdminDashboard from './pages/LibraryAdminDashboard';
import CatalogerDashboard from './pages/CatalogerDashboard';
import CatalogerHome from './pages/cataloger/CatalogerHome';
import CatalogerBooksPage from './pages/cataloger/CatalogerBooksPage';
import CatalogerCategoriesPage from './pages/cataloger/CatalogerCategoriesPage';
import PhysicalWorkspace from './pages/physical/PhysicalWorkspace';
import IssueBookPage from './pages/physical/IssueBookPage';
import ReturnBookPage from './pages/physical/ReturnBookPage';
import MembersPage from './pages/physical/MembersPage';
import OverdueReturnsPage from './pages/physical/OverdueReturnsPage';
import FeeSettingsPage from './pages/physical/FeeSettingsPage';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/catalog" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/my-account" element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          } />

<Route path="/super-admin/*" element={
  <ProtectedRoute allowedRoles={['super_admin']}>
    <SuperAdminDashboard />
  </ProtectedRoute>
} />

{/* Admin Routes */}
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/librarian/*" element={
  <ProtectedRoute allowedRoles={['librarian', 'admin']}>
    <LibrarianDashboard />
  </ProtectedRoute>
} />

<Route path="/manager/*" element={
  <ProtectedRoute allowedRoles={['manager', 'admin']}>
    <ManagerDashboard />
  </ProtectedRoute>
} />
<Route path="/manager/published" element={
  <ProtectedRoute allowedRoles={['manager', 'admin']}>
    <PublishedContent />
  </ProtectedRoute>
} />

<Route path="/library-admin/*" element={
  <ProtectedRoute allowedRoles={['library_admin', 'physical_librarian', 'physical_manager']}>
    <LibraryAdminDashboard />
  </ProtectedRoute>
} />

<Route path="/physical-librarian/*" element={
  <ProtectedRoute allowedRoles={['physical_librarian', 'physical_manager', 'manager', 'librarian']}>
    <PhysicalWorkspace />
  </ProtectedRoute>
}>
  <Route index element={<Navigate to="issue" replace />} />
  <Route path="issue" element={<IssueBookPage />} />
  <Route path="return" element={<ReturnBookPage />} />
  <Route path="members" element={<MembersPage />} />
  <Route path="overdue" element={<OverdueReturnsPage />} />
  <Route path="settings" element={<FeeSettingsPage />} />
</Route>


<Route path="/cataloger" element={
  <ProtectedRoute allowedRoles={['cataloger']}>
    <CatalogerDashboard />
  </ProtectedRoute>
} />
<Route path="/cataloger/dashboard" element={
  <ProtectedRoute allowedRoles={['cataloger']}>
    <CatalogerHome />
  </ProtectedRoute>
} />
<Route path="/cataloger/books" element={
  <ProtectedRoute allowedRoles={['cataloger']}>
    <CatalogerBooksPage />
  </ProtectedRoute>
} />
<Route path="/cataloger/categories" element={
  <ProtectedRoute allowedRoles={['cataloger']}>
    <CatalogerCategoriesPage />
  </ProtectedRoute>
} />

<Route path="/member" element={
  <ProtectedRoute allowedRoles={['member']}>
    <MemberDashboard />
  </ProtectedRoute>
} />

<Route path="/my-purchases" element={
  <ProtectedRoute allowedRoles={['member', 'admin']}>
    <MyPurchases />
  </ProtectedRoute>
} />

<Route path="/manager/payments" element={
  <ProtectedRoute allowedRoles={['manager', 'admin']}>
    <PaymentApproval />
  </ProtectedRoute>
} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
