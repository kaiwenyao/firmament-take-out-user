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
      toast.error(getErrorMessage(error, "加载订单详情失败"));
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

  const handleReminder = async () => {
    if (!order) return;
    try {
      await reminderOrderAPI(order.number);
      toast.success("催单成功");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "催单失败"));
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    try {
      await cancelOrderAPI(order.number);
      toast.success("订单已取消");
      await fetchOrderDetail(order.number);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "取消失败"));
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
          订单详情
        </NavBar>
        <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
          {loading ? "加载中..." : "暂无数据"}
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
        订单详情
      </NavBar>

      <Card style={{ margin: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "#999", fontSize: 12 }}>订单号</div>
          <div style={{ fontWeight: "bold", marginTop: 4 }}>{order.number}</div>
        </div>
        <div>
          <div style={{ color: "#999", fontSize: 12 }}>订单状态</div>
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
                催单
              </Button>
            )}
            {(order.status === 1 || order.status === 2) && (
              <Button
                size="small"
                color="danger"
                onClick={handleCancel}
              >
                取消订单
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12 }}>订单信息</div>
        <div style={{ color: "#666", marginBottom: 8 }}>
          下单时间：{order.orderTime}
        </div>
        {order.checkoutTime && (
          <div style={{ color: "#666", marginBottom: 8 }}>
            结账时间：{order.checkoutTime}
          </div>
        )}
        <div style={{ color: "#666", marginBottom: 8 }}>
          收货人：{order.consignee}
        </div>
        <div style={{ color: "#666", marginBottom: 8 }}>
          联系电话：{order.phone}
        </div>
        <div style={{ color: "#666" }}>收货地址：{order.address}</div>
      </Card>

      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12 }}>商品清单</div>
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
          <div style={{ fontWeight: "bold" }}>合计</div>
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
            <div style={{ color: "#999", fontSize: 12 }}>待支付</div>
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
            立即支付
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
