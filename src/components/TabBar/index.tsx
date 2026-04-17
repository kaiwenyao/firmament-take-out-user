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

  // If path is not in known paths list, default to /home
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
      title: "Home",
      icon: <AppOutline />,
    },
    {
      key: "/order",
      title: "Orders",
      icon: <FileOutline />,
    },
    {
      key: "/my",
      title: "Profile",
      icon: <UserOutline />,
    },
  ];

  const tabKeys = tabs.map((item) => item.key);

  const setRouteActive = (value?: string | null) => {
    // Strict validation: only allow navigation to predefined tab paths
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
