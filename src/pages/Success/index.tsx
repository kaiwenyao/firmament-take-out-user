import { NavBar, Card, Button, Result } from "antd-mobile";
import { useNavigate, useSearchParams } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div>
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
        Payment Successful
      </NavBar>

      <Result
        status="success"
        title="Payment Successful"
        description="Your order has been paid. We will deliver it as soon as possible."
      />

      <Card style={{ margin: 12 }}>
        {orderNumber && (
          <div style={{ color: "#666", marginBottom: 8 }}>
            Order #: {orderNumber}
          </div>
        )}
        <div style={{ color: "#666" }}>
          Thank you for your purchase. Enjoy your meal!
        </div>
      </Card>

      <div style={{ padding: 16 }}>
        <Button
          block
          color="primary"
          onClick={() => navigate("/home")}
          style={{ marginBottom: 12 }}
        >
          Back to Home
        </Button>
        <Button
          block
          onClick={() => {
            if (orderNumber) {
              navigate(`/order/detail/${orderNumber}`);
            }
          }}
          disabled={!orderNumber}
        >
          View Order
        </Button>
      </div>
    </div>
  );
};

export default Success;
