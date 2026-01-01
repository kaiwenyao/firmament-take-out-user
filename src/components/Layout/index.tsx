import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TabBar from "../TabBar";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 假设 token 存在 localStorage，请根据实际情况修改
  const token = localStorage.getItem("token"); // 或者 useAuthStore()

  // TabBar 始终显示，但只在主要页面显示底部间距
  const showPadding = ["/home", "/order", "/my"].includes(location.pathname);

  // 计算是否授权：有 token 或访问 /home 页面
  const isAuthorized = useMemo(() => {
    return !!token || location.pathname === "/home";
  }, [token, location.pathname]);

  useEffect(() => {
    // 如果没有 token 且不在 /home 页面，跳转到登录页
    if (!token && location.pathname !== "/home") {
      navigate("/login", { replace: true });
    }
  }, [token, navigate, location.pathname]);

  // 关键修复点！！！
  // 如果未授权（isAuthorized 为 false），直接返回 null。
  // 这样 <Outlet /> 根本不会被 React 挂载，Home 组件的代码一行都不会执行！
  if (!isAuthorized) {
    return null; 
  }

  return (
    <div className={showPadding ? "pb-[50px]" : ""}>
      <Outlet />
      {/* TabBar 始终显示 */}
      <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200">
        <TabBar />
      </div>
    </div>
  );
};

export default Layout;