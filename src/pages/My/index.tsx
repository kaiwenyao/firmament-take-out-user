import { useState, useEffect } from "react";
import {
  NavBar,
  Card,
  List,
  Avatar,
  Button,
  InfiniteScroll,
  Skeleton,
} from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  getOrderPageAPI,
  repetitionOrderAPI,
  delShoppingCartAPI,
  reminderOrderAPI,
  getUserInfoAPI,
  type Order,
  type UserInfo,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { maskPhone } from "@/lib/format";

const My = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);

  // Request data object
  const [reqData, setReqData] = useState({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Get user info
    const fetchUserInfo = async () => {
      setUserInfoLoading(true);
      try {
        const res = await getUserInfoAPI();
        if (res && res.code === 1 && res.data) {
          setUserInfo(res.data);
        } else {
          toast.error(res?.msg || "Failed to load user info");
          setUserInfo(null);
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "Failed to load user info");
        // If 401 error, response interceptor already handled redirect, no extra handling needed
        if (!errorMessage.includes("sign in")) {
          toast.error(errorMessage);
        }
        setUserInfo(null);
      } finally {
        setUserInfoLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await getOrderPageAPI(reqData);
        if (res && res.code === 1) {
          const newOrders = res.data?.records || [];
          if (reqData.page === 1) {
            setOrders(newOrders);
          } else {
            setOrders((prev) => [...prev, ...newOrders]);
          }
          setHasMore(newOrders.length === reqData.pageSize);
          setHasLoaded(true);
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load orders"));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reqData]);

  const loadMore = async () => {
    if (hasMore && !loading) {
      setReqData((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleOneMoreOrder = async (orderNumber: string) => {
    try {
      // Clear cart first
      await delShoppingCartAPI();
      // Order again
      await repetitionOrderAPI(orderNumber);
      toast.success("Added to cart");
      navigate("/home");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Operation failed"));
    }
  };

  const handleReminder = async (orderNumber: string) => {
    try {
      await reminderOrderAPI(orderNumber);
      toast.success("Rush order sent");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to rush order"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const getStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
      1: "Pending Payment",
      2: "Awaiting Acceptance",
      3: "Accepted",
      4: "In Delivery",
      5: "Completed",
      6: "Cancelled",
      7: "Refunded",
    };
    return statusMap[status] || "Unknown";
  };

  const getStatusColor = (status: number) => {
    const colorMap: Record<number, string> = {
      1: "#ff6b35",
      2: "#1890ff",
      3: "#52c41a",
      4: "#722ed1",
      5: "#52c41a",
      6: "#999",
      7: "#ff4d4f",
    };
    return colorMap[status] || "#999";
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", backgroundColor: "#f5f5f5", paddingBottom: 60 }}>
      <NavBar 
        back={null}
        style={{
          backgroundColor: "#f5f5f5",
          color: "#333",
          fontSize: 20,
          fontWeight: "bold",
          padding: "12px 16px",
        }}
      >
        Profile
      </NavBar>

      {/* User info card */}
      <Card style={{ margin: 12, marginBottom: 12 }}>
        {userInfoLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton animated style={{ "--width": "60px", "--height": "60px", "--border-radius": "50%" }} />
            <div style={{ flex: 1 }}>
              <Skeleton animated style={{ "--width": "60%" }} />
              <Skeleton.Paragraph animated lineCount={1} style={{ marginTop: 8 }} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar
              src={userInfo?.avatar || "https://images.unsplash.com/photo-1548532928-b34e3be62fc6?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"}
              style={{ "--size": "60px" }}
            />
            <div>
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                {userInfo?.name || "User"}
              </div>
              <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                {userInfo?.phone ? maskPhone(userInfo.phone) : "No phone number bound"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Function menu */}
      <List style={{ marginBottom: 12 }}>
        <List.Item
          arrow
          onClick={() => navigate("/address")}
          prefix={<span style={{ fontSize: 20 }}>📍</span>}
        >
          Manage Addresses
        </List.Item>
        <List.Item
          arrow
          onClick={() => navigate("/history-order")}
          prefix={<span style={{ fontSize: 20 }}>📋</span>}
        >
          Order History
        </List.Item>
        <List.Item
          onClick={handleLogout}
          prefix={<span style={{ fontSize: 20 }}>🚪</span>}
        >
          Sign Out
        </List.Item>
      </List>

      {/* Recent orders */}
      <div style={{ padding: "0 12px 20px" }}>
        <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 16 }}>
          Recent Orders
        </div>
        {!hasLoaded && loading ? (
          <Card>
            <Skeleton animated style={{ "--width": "60%" }} />
            <Skeleton.Paragraph animated lineCount={3} />
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
              No orders yet
            </div>
          </Card>
        ) : (
          <>
            {orders.map((order) => (
              <Card
                key={order.number}
                style={{ marginBottom: 12, cursor: "pointer" }}
                onClick={() => navigate(`/order/detail/${order.number}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: 14 }}>
                    Order #: {order.number}
                  </div>
                  <div
                    style={{
                      color: getStatusColor(order.status),
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  >
                    {getStatusText(order.status)}
                  </div>
                </div>
                <div style={{ color: "#999", fontSize: 12, marginBottom: 8 }}>
                  {order.orderTime}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 16 }}>
                    ¥{order.amount?.toFixed(2)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {/* Show payment button for pending payment status */}
                    {order.status === 1 && (
                      <Button
                        size="small"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pay?orderNumber=${order.number}`);
                        }}
                      >
                        Pay Now
                      </Button>
                    )}
                    {order.status === 5 && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOneMoreOrder(order.number);
                        }}
                      >
                        Reorder
                      </Button>
                    )}
                    {order.status === 2 && (
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReminder(order.number);
                        }}
                      >
                        Rush Order
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/detail/${order.number}`);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
          </>
        )}
      </div>
    </div>
  );
};

export default My;
