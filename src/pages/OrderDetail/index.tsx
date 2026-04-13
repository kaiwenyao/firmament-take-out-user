import { useState, useEffect } from "react";
import { NavBar, Card, List, Image, Button } from "antd-mobile";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderDetailAPI, reminderOrderAPI, cancelOrderAPI, type Order } from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // 请求数据对象
  const [reqData, setReqData] = useState<{ orderNumber?: string }>({});

  useEffect(() => {
    if (orderNumber) {
      setReqData({ orderNumber });
    }
  }, [orderNumber]);

  const fetchOrderDetail = async (targetOrderNumber: string) => {
    setLoading(true);
    try {
      const res = await getOrderDetailAPI(targetOrderNumber);
      if (res && res.code === 1) {
        setOrder(res.data ?? null);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to load order details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reqData.orderNumber) {
      fetchOrderDetail(reqData.orderNumber);
    }
  }, [reqData.orderNumber]);

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

  const handleReminder = async () => {
    if (!order) return;
    try {
      await reminderOrderAPI(order.number);
      toast.success("Rush order sent");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to rush order"));
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrderAPI(order.number);
      toast.success("Order cancelled");
      await fetchOrderDetail(order.number);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to cancel"));
    }
  };

  if (!order) {
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
          Order Details
        </NavBar>
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
          {loading ? "Loading..." : "No data"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: order.status === 1 ? 80 : 0 }}>
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
        Order Details
      </NavBar>

      <Card style={{ margin: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#999", fontSize: 12 }}>Order Number</div>
          <div style={{ fontWeight: "bold", marginTop: 4 }}>{order.number}</div>
        </div>
        <div>
          <div style={{ color: "#999", fontSize: 12 }}>Order Status</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div style={{ color: order.status === 1 ? "#ff6b35" : "#52c41a", fontWeight: "bold" }}>
              {getStatusText(order.status)}
            </div>
            {order.status === 2 && (
              <Button size="small" onClick={handleReminder}>
                Rush Order
              </Button>
            )}
            {(order.status === 1 || order.status === 2) && (
              <Button
                size="small"
                color="danger"
                onClick={handleCancel}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12 }}>Order Info</div>
        <div style={{ color: "#666", marginBottom: 8 }}>
          Order Time: {order.orderTime}
        </div>
        {order.checkoutTime && (
          <div style={{ color: "#666", marginBottom: 8 }}>
            Checkout Time: {order.checkoutTime}
          </div>
        )}
        <div style={{ color: "#666", marginBottom: 8 }}>
          Recipient: {order.consignee}
        </div>
        <div style={{ color: "#666", marginBottom: 8 }}>
          Phone: {order.phone}
        </div>
        <div style={{ color: "#666" }}>Address: {order.address}</div>
      </Card>

      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12 }}>Items</div>
        <List>
          {order.orderDetailList?.map((detail) => (
            <List.Item
              key={detail.id}
              prefix={
                <Image
                  src={detail.image}
                  width={60}
                  height={60}
                  fit="cover"
                  style={{ borderRadius: 4 }}
                />
              }
            >
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {detail.name}
                </div>
                {detail.dishFlavor && (
                  <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
                    {detail.dishFlavor}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ color: "#999", fontSize: 12 }}>
                    x{detail.number}
                  </div>
                  <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
                    ¥{detail.amount?.toFixed(2)}
                  </div>
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      <Card style={{ margin: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "bold" }}>Total</div>
          <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 20 }}>
            ¥{order.amount?.toFixed(2)}
          </div>
        </div>
      </Card>

      {/* 待支付订单显示底部支付栏 */}
      {order.status === 1 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 16px",
            backgroundColor: "#fff",
            borderTop: "1px solid #eee",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
            zIndex: 1001,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#999", fontSize: 12 }}>Pending Payment</div>
            <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 18 }}>
              ¥{order.amount?.toFixed(2)}
            </div>
          </div>
          <Button
            color="danger"
            size="large"
            onClick={() => navigate(`/pay?orderNumber=${order.number}`)}
            style={{ minWidth: 120 }}
          >
            Pay Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
