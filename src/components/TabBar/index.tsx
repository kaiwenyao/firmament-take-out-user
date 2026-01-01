import { useNavigate, useLocation } from "react-router-dom";
import { TabBar } from "antd-mobile";
import {
  AppOutline,
  FileOutline,
  UserOutline,
} from "antd-mobile-icons";

const TabBarComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  // 如果路径不在已知路径列表中，默认选中 /home
  const knownPaths = ["/home", "/order", "/my"];
  let activeKey = pathname;

  if (pathname.startsWith("/my")) {
    activeKey = "/my";
  } else if (!knownPaths.includes(pathname)) {
    activeKey = "/home";
  }

  const tabs = [
    {
      key: "/home",
      title: "首页",
      icon: <AppOutline />,
    },
    {
      key: "/order",
      title: "订单",
      icon: <FileOutline />,
    },
    {
      key: "/my",
      title: "我的",
      icon: <UserOutline />,
    },
  ];

  const tabKeys = tabs.map((item) => item.key);

  const setRouteActive = (value?: string | null) => {
    // 严格验证：只允许导航到预定义的 tab 路径
    if (!value || typeof value !== 'string') {
      console.warn('TabBar: Invalid navigation value:', value);
      return;
    }

    if (!tabKeys.includes(value)) {
      console.warn('TabBar: Navigation value not in allowed paths:', value, 'Allowed:', tabKeys);
      return;
    }

    navigate(value);
  };

  return (
    <TabBar activeKey={activeKey} onChange={setRouteActive}>
      {tabs.map((item) => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};

export default TabBarComponent;
