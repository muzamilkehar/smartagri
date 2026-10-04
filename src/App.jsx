import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import DashboardLayout from "./dashboard/DashboardLayout";
import DashboardHome from "./dashboard/DashboardHome";
import Fields from "./dashboard/Fields";
import Disease from "./dashboard/Disease";
import Yield from "./dashboard/Yield";
import Soil from "./dashboard/Soil";
import Weather from "./dashboard/Weather";
import Profile from "./dashboard/Profile";
import Users from "./dashboard/Users";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/resetPassword";
import AdminAnalytics from "./dashboard/AdminAnalytics";
import SystemSettings from "./dashboard/SystemSettings";

/* Hide Navbar on auth pages */
const Layout = ({ children }) => {
    const location = useLocation();

    const hideNavbar = location.pathname === "/signup" ||
                      location.pathname === "/signin" ||
                      location.pathname === "/forgot-password" ||
                      location.pathname.startsWith("/dashboard");

    return (
        <>
            {!hideNavbar && <Navbar />}
            {children}
        </>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardLayout><DashboardHome /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/fields" element={
                            <ProtectedRoute farmerOnly>
                                <DashboardLayout><Fields /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/disease" element={
                            <ProtectedRoute farmerOnly>
                                <DashboardLayout><Disease /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/yield" element={
                            <ProtectedRoute farmerOnly>
                                <DashboardLayout><Yield /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/soil" element={
                            <ProtectedRoute farmerOnly>
                                <DashboardLayout><Soil /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/weather" element={
                            <ProtectedRoute farmerOnly>
                                <DashboardLayout><Weather /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/profile" element={
                            <ProtectedRoute>
                                <DashboardLayout><Profile /></DashboardLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/dashboard/users" element={
                            <ProtectedRoute adminOnly={true}>
                                <DashboardLayout><Users /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/admin-analytics" element={
                            <ProtectedRoute adminOnly>
                                <DashboardLayout><AdminAnalytics /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/dashboard/settings" element={
                            <ProtectedRoute adminOnly>
                                <DashboardLayout><SystemSettings /></DashboardLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Layout>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;