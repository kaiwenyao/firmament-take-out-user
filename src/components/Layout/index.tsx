import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TabBar from "../TabBar";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Assume token is stored in localStorage, modify as needed
  const token = localStorage.getItem("token");   // or useAuthStore()

  // TabBar is always shown, but bottom padding is only added on main pages
  const showPadding = ["/home", "/order", "/my"].includes(location.pathname);

  // Calculate authorization: has token or visiting /home page
  const isAuthorized = useMemo(() => {
    return !!token || location.pathname === "/home";
  }, [token, location.pathname]);

  useEffect(() => {
    // If no token and not on /home, redirect to login
    if (!token && location.pathname !== "/home") {
      navigate("/login", { replace: true });
    }
  }, [token, navigate, location.pathname]);

  // Key fix!!!
  // If unauthorized (isAuthorized is false), return null.
  // This way <Outlet /> won't be mounted by React, and Home component code won't execute at all!
  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className={showPadding ? "pb-[50px]" : ""}>
      <Outlet />
      {/* TabBar is always shown */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200">
        <TabBar />
      </div>
    </div>
  );
};

export default Layout;