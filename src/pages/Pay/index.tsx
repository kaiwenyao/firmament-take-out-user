import { useState, useEffect } from "react";
import { NavBar, Card, Radio, Button, Skeleton } from "antd-mobile";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  paymentOrderAPI,
  getOrderDetailAPI,
  type Order,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const Pay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string | null>(
    searchParams.get("orderNumber")
  );
  const [payMethod, setPayMethod] = useState<number>(1); // 1:微信 2:支付宝
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // 加载订单详情
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderNumber) {
        toast.error("订单信息不存在");
        navigate(-1);
        return;
      }

      setOrderLoading(true);
      try {
        const res = await getOrderDetailAPI(orderNumber);
        if (res && res.code === 1 && res.data) {
          setOrder(res.data);
          if (res.data.number && res.data.number !== orderNumber) {
            setOrderNumber(res.data.number);
          }
        } else {
          toast.error("订单不存在");
          navigate(-1);
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "加载订单失败"));
        navigate(-1);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderNumber, navigate]);

  // 处理支付成功后的延迟跳转
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (paymentSuccess) {
      timer = setTimeout(() => {
        navigate(`/success?orderNumber=${paymentSuccess}`);
      }, 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [paymentSuccess, navigate]);

  const handlePay = async () => {
    if (!orderNumber) {
      toast.error("订单号不存在");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentOrderAPI({
        orderNumber: orderNumber,
        payMethod: payMethod,
      });
      if (res && res.code === 1) {
        toast.success("支付成功");
        setPaymentSuccess(orderNumber);
      } else {
        toast.error((res as { msg?: string })?.msg || "支付失败");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "支付失败"));
    } finally {
      setLoading(false);
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

  return (
    <div style={{ paddingBottom: 100 }}>
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
        支付订单
      </NavBar>

      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12 }}>订单信息</div>
        {orderLoading ? (
          <>
            <Skeleton animated style={{ "--width": "60%", marginBottom: 8 }} />
            <Skeleton animated style={{ "--width": "40%" }} />
          </>
        ) : (
          <>
            <div style={{ color: "#666", marginBottom: 8 }}>
              订单号：{orderNumber || "-"}
            </div>
            {order && (
              <div style={{ color: "#666", marginBottom: 8 }}>
                订单状态：
                <span style={{ color: order.status === 1 ? "#ff6b35" : "#52c41a" }}>
                  {getStatusText(order.status)}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ color: "#666" }}>订单金额</div>
              <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 20 }}>
                ¥{order?.amount?.toFixed(2) || "0.00"}
              </div>
            </div>
          </>
        )}
      </Card>

      {order?.status === 1 && (
        <Card style={{ margin: 12 }}>
          <div style={{ fontWeight: "bold", marginBottom: 12 }}>支付方式</div>
          <Radio.Group
            value={payMethod}
            onChange={(val) => setPayMethod(val as number)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Radio value={1}>
                <span style={{ marginLeft: 8 }}>💚 微信支付</span>
              </Radio>
              <Radio value={2}>
                <span style={{ marginLeft: 8 }}>💙 支付宝</span>
              </Radio>
            </div>
          </Radio.Group>
        </Card>
      )}

      <Card style={{ margin: 12 }}>
        <div style={{ textAlign: "center", color: "#999" }}>
          {order?.status === 1 ? "请在15分钟内完成支付" : "订单已支付或已取消"}
        </div>
      </Card>

      {order?.status === 1 && (
        <div
          style={{
            position: "fixed",
            bottom: 50,
            left: 0,
            right: 0,
            padding: "12px 16px",
            backgroundColor: "#fff",
            borderTop: "1px solid #eee",
            boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
            zIndex: 1001,
          }}
        >
          <Button
            block
            color="primary"
            size="large"
            onClick={handlePay}
            loading={loading}
            disabled={loading || orderLoading}
            style={{
              height: 44,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            立即支付 ¥{order?.amount?.toFixed(2) || "0.00"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pay;
