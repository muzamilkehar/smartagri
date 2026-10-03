  import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
  import Navbar from "./components/Navbar";
  import Home from "./pages/Home";
  import SignIn from "./pages/SignIn";
  import SignUp from "./pages/SignUp";
  import ForgotPassword from "./pages/ForgotPassword"
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



  /* Hide Navbar on auth pages */

  const Layout = ({children}) => {
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

            {/* Protected Dashboard Routes */}

            <Route  path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout><DashboardHome /> </DashboardLayout>
              </ProtectedRoute>
            }/>

            <Route path="/dashboard/fields" element= {
              <ProtectedRoute>
                <DashboardLayout><Fields /></DashboardLayout>
              </ProtectedRoute>
            }/>

             <Route  path="/dashboard/disease" element={
              <ProtectedRoute>
                <DashboardLayout><Disease /> </DashboardLayout>
              </ProtectedRoute>
            }/>

             <Route  path="/dashboard/yield" element={
              <ProtectedRoute>
                <DashboardLayout><Yield /> </DashboardLayout>
              </ProtectedRoute>
            }/>

             <Route  path="/dashboard/soil" element={
              <ProtectedRoute>
                <DashboardLayout><Soil /> </DashboardLayout>
              </ProtectedRoute>
            }/>

             <Route  path="/dashboard/weather" element={
              <ProtectedRoute>
                <DashboardLayout><Weather /> </DashboardLayout>
              </ProtectedRoute>
            }/>

             <Route  path="/dashboard/profile" element={
              <ProtectedRoute>
                <DashboardLayout><Profile /> </DashboardLayout>
              </ProtectedRoute>
            }/>


            {/* Admin Only Route */}
             <Route  path="/dashboard/users" element={
              <ProtectedRoute adminOnly={true}>
                <DashboardLayout><Users /> </DashboardLayout>
              </ProtectedRoute>
            }/>
            


          </Routes>
        </Layout>
        </BrowserRouter>
      </AuthProvider>

    );
  }

  export default App;