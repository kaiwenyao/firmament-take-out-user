import { useState, useEffect } from "react";
import { NavBar, Card, Button, InfiniteScroll, Skeleton } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  getOrderPageAPI,
  repetitionOrderAPI,
  delShoppingCartAPI,
  reminderOrderAPI,
  type Order,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const HistoryOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 请求数据对象
  const [reqData, setReqData] = useState({
    page: 1,
    pageSize: 10,
  });

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
      await delShoppingCartAPI();
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

  const orderCardBackgrounds = ["#f6f7f9", "#eef2f5"];

  return (
    <div>
      <NavBar 
        onBack={() => navigate(-1)}
        style={{
          backgroundColor: "#f5f5f5",
          color: "#333",
          fontSize: 20,
          fontWeight: "bold",
          padding: "12px 16px",
        }}
      >
        历史订单
      </NavBar>

      {!hasLoaded && loading ? (
        <Card style={{ margin: 12 }}>
          <Skeleton animated style={{ "--width": "60%" }} />
          <Skeleton.Paragraph animated lineCount={3} />
        </Card>
      ) : orders.length === 0 ? (
        <Card style={{ margin: 12 }}>
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
            暂无订单
          </div>
        </Card>
      ) : (
        <>
          {orders.map((order, index) => (
            <Card
              key={order.number}
              style={{
                margin: 12,
                backgroundColor:
                  orderCardBackgrounds[index % orderCardBackgrounds.length],
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div style={{ fontWeight: "bold" }}>订单号：{order.number}</div>
                <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
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
                <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
                  ¥{order.amount?.toFixed(2)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {/* 待支付状态显示支付按钮 */}
                  {order.status === 1 && (
                    <Button
                      size="small"
                      color="danger"
                      onClick={() => navigate(`/pay?orderNumber=${order.number}`)}
                    >
                      去支付
                    </Button>
                  )}
                  {order.status === 5 && (
                    <Button
                      size="small"
                      onClick={() => handleOneMoreOrder(order.number)}
                    >
                      再来一单
                    </Button>
                  )}
                  {order.status === 2 && (
                    <Button
                      size="small"
                      onClick={() => handleReminder(order.number)}
                    >
                      催单
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/order/detail/${order.number}`)}
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
  );
};

export default HistoryOrder;
