import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuperDashboard from './pages/SuperDashboard';
import NewShop from './pages/NewShop';
import ShopDetails from './pages/ShopDetails';
import NewUser from './pages/NewUser';
import Repairs from './pages/Repairs';
import NewRepair from './pages/NewRepair';
import RepairDetails from './pages/RepairDetails';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Inventory from './pages/Inventory';
import Invoices from './pages/Invoices';
import NewInvoice from './pages/NewInvoice';
import InvoiceDetails from './pages/InvoiceDetails';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Staff from './pages/Staff';

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'superAdmin') {
    return <Navigate to="/super/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public login portal */}
            <Route path="/login" element={<Login />} />

          {/* Secure authenticated layout dashboard routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Root redirect depending on role */}
            <Route index element={<RootRedirect />} />

            {/* Shop Dashboard: admin and staff */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin Dashboard: superAdmin only */}
            <Route
              path="super/dashboard"
              element={
                <ProtectedRoute allowedRoles={['superAdmin']}>
                  <SuperDashboard />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin create franchise shops */}
            <Route
              path="super/shops/new"
              element={
                <ProtectedRoute allowedRoles={['superAdmin']}>
                  <NewShop />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin inspect/modify/suspend shops */}
            <Route
              path="super/shops/:id"
              element={
                <ProtectedRoute allowedRoles={['superAdmin']}>
                  <ShopDetails />
                </ProtectedRoute>
              }
            />

            {/* SuperAdmin create other superAdmins or shop users */}
            <Route
              path="super/users/new"
              element={
                <ProtectedRoute allowedRoles={['superAdmin']}>
                  <NewUser />
                </ProtectedRoute>
              }
            />

            {/* Repair Tracker: admin and staff */}
            <Route
              path="repairs"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Repairs />
                </ProtectedRoute>
              }
            />

            <Route
              path="repairs/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <NewRepair />
                </ProtectedRoute>
              }
            />

            <Route
              path="repairs/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <RepairDetails />
                </ProtectedRoute>
              }
            />

            {/* Parts Inventory: admin and staff */}
            <Route
              path="inventory"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />

            {/* Customer Relationship (CRM): admin and staff */}
            <Route
              path="customers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Customers />
                </ProtectedRoute>
              }
            />

            <Route
              path="customers/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <CustomerDetails />
                </ProtectedRoute>
              }
            />

            {/* Invoices and Billing logs: admin and staff */}
            <Route
              path="invoices"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />

            <Route
              path="invoices/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <NewInvoice />
                </ProtectedRoute>
              }
            />

            <Route
              path="invoices/:id"
              element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <InvoiceDetails />
                </ProtectedRoute>
              }
            />

            {/* Reports audit section: admin only */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Shop Staff Directory: admin only */}
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Staff />
                </ProtectedRoute>
              }
            />

            {/* Settings Profile configuration */}
            <Route path="settings" element={<Settings />} />

            {/* Catch-all unmatched dashboard child paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Root absolute catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
     </ToastProvider>
    </Router>
  );
}

export default App;
