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

  // Request data object
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
      await delShoppingCartAPI();
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
        Order History
      </NavBar>

      {!hasLoaded && loading ? (
        <Card style={{ margin: 12 }}>
          <Skeleton animated style={{ "--width": "60%" }} />
          <Skeleton.Paragraph animated lineCount={3} />
        </Card>
      ) : orders.length === 0 ? (
        <Card style={{ margin: 12 }}>
          <div style={{ textAlign: "center", color: "#999", padding: 40 }}>
            No orders yet
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
                <div style={{ fontWeight: "bold" }}>Order #: {order.number}</div>
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
                  {/* Show payment button for pending payment status */}
                  {order.status === 1 && (
                    <Button
                      size="small"
                      color="danger"
                      onClick={() => navigate(`/pay?orderNumber=${order.number}`)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {order.status === 5 && (
                    <Button
                      size="small"
                      onClick={() => handleOneMoreOrder(order.number)}
                    >
                      Reorder
                    </Button>
                  )}
                  {order.status === 2 && (
                    <Button
                      size="small"
                      onClick={() => handleReminder(order.number)}
                    >
                      Rush Order
                    </Button>
                  )}
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/order/detail/${order.number}`)}
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
  );
};

export default HistoryOrder;
