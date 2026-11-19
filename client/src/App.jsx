import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./features/ui/pages/Home";
import Login from "./features/ui/pages/Login";
import Signup from "./features/ui/pages/Signup";
import PlansPage from "./features/ui/pages/Plans";
import PrivacyPolies from "./features/ui/pages/PrivacyPolies";
import TermsConditions from "./features/ui/pages/TermsConditions";
import CustomerMenu from "./features/ui/pages/CustomerMenu";

import AdminLayout from "./features/admin/components/AdminLayout";
import Dashboard from "./features/admin/pages/Dashboard";
import Restaurants from "./features/admin/pages/Restaurants";
import Users from "./features/admin/pages/Users";
import Plans from "./features/admin/pages/Plans";
import Revenue from "./features/admin/pages/Revenue";
import Settings from "./features/admin/pages/Settings";

import RestaurantLayout from "./features/restaurant/components/RestaurantLayout";
import RestaurantDashboard from "./features/restaurant/pages/Dashboard";
import LiveOrder from "./features/restaurant/pages/LiveOrder";
import Menu from "./features/restaurant/pages/Menu";
import Tables from "./features/restaurant/pages/Tables";
import Quiz from "./features/restaurant/pages/Quiz";
import Analytics from "./features/restaurant/pages/Analytics";
import RestaurantSetting from "./features/restaurant/pages/Setting";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute, { PublicOnlyRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Home />} />
        <Route path="/how-it-works" element={<Home />} />
        <Route path="/pricing" element={<Home />} />
        <Route path="/contact" element={<Home />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/choose-plan" element={<PlansPage />} />
        <Route path="/privacy" element={<PrivacyPolies />} />
        <Route path="/privacy-policy" element={<PrivacyPolies />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />

        <Route path="/menu" element={<CustomerMenu />} />
        <Route path="/table/:tableId" element={<CustomerMenu />} />
        <Route path="/table" element={<CustomerMenu />} />
        <Route path="/menu/:tableId" element={<CustomerMenu />} />
        <Route path="/order/:tableId" element={<CustomerMenu />} />
        <Route path="/customer-menu" element={<CustomerMenu />} />

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="users" element={<Users />} />
            <Route path="plans" element={<Plans />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="restaurant" />}>
          <Route path="/restaurant" element={<RestaurantLayout />}>
            <Route index element={<RestaurantDashboard />} />
            <Route path="live-orders" element={<LiveOrder />} />
            <Route path="menu" element={<Menu />} />
            <Route path="tables" element={<Tables />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="quizs" element={<Quiz />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="settings" element={<RestaurantSetting />} />
            <Route path="setting" element={<RestaurantSetting />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
