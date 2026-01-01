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

  // 请求数据对象
  const [reqData, setReqData] = useState({
    page: 1,
    pageSize: 10,
  });

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      setUserInfoLoading(true);
      try {
        const res = await getUserInfoAPI();
        if (res && res.code === 1 && res.data) {
          setUserInfo(res.data);
        } else {
          toast.error(res?.msg || "获取用户信息失败");
          setUserInfo(null);
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "获取用户信息失败");
        // 如果是401错误，响应拦截器已经处理了跳转，这里不需要额外处理
        if (!errorMessage.includes("登录")) {
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
        toast.error(getErrorMessage(error, "加载订单失败"));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [reqData]);

  const loadMore = async (_isRetry: boolean) => {
    if (hasMore && !loading) {
      setReqData((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handleOneMoreOrder = async (orderNumber: string) => {
    try {
      // 先清空购物车
      await delShoppingCartAPI();
      // 再来一单
      await repetitionOrderAPI(orderNumber);
      toast.success("已加入购物车");
      navigate("/home");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "操作失败"));
    }
  };

  const handleReminder = async (orderNumber: string) => {
    try {
      await reminderOrderAPI(orderNumber);
      toast.success("催单成功");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "催单失败"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("已退出登录");
    navigate("/login", { replace: true });
  };

  const getStatusText = (status: number) => {
    const statusMap: Record<number, string> = {
      1: "待付款",
      2: "待接单",
      3: "已接单",
      4: "派送中",
      5: "已完成",
      6: "已取消",
      7: "退款",
    };
    return statusMap[status] || "未知";
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
        我的
      </NavBar>

      {/* 用户信息卡片 */}
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
                {userInfo?.name || "用户"}
              </div>
              <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                {userInfo?.phone ? maskPhone(userInfo.phone) : "未绑定手机号"}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 功能菜单 */}
      <List style={{ marginBottom: 12 }}>
        <List.Item
          arrow
          onClick={() => navigate("/address")}
          prefix={<span style={{ fontSize: 20 }}>📍</span>}
        >
          地址管理
        </List.Item>
        <List.Item
          arrow
          onClick={() => navigate("/history-order")}
          prefix={<span style={{ fontSize: 20 }}>📋</span>}
        >
          历史订单
        </List.Item>
        <List.Item
          onClick={handleLogout}
          prefix={<span style={{ fontSize: 20 }}>🚪</span>}
        >
          退出登录
        </List.Item>
      </List>

      {/* 最近订单 */}
      <div style={{ padding: "0 12px 20px" }}>
        <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 16 }}>
          最近订单
        </div>
        {!hasLoaded && loading ? (
          <Card>
            <Skeleton animated style={{ "--width": "60%" }} />
            <Skeleton.Paragraph animated lineCount={3} />
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
              暂无订单
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
                    订单号：{order.number}
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
                    {/* 待支付状态显示支付按钮 */}
                    {order.status === 1 && (
                      <Button
                        size="small"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pay?orderNumber=${order.number}`);
                        }}
                      >
                        去支付
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
                        再来一单
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
                        催单
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
                      查看详情
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
