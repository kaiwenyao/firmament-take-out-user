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
        支付成功
      </NavBar>

      <Result
        status="success"
        title="支付成功"
        description="您的订单已支付成功，我们会尽快为您配送"
      />

      <Card style={{ margin: 12 }}>
        {orderNumber && (
          <div style={{ color: "#666", marginBottom: 8 }}>
            订单号：{orderNumber}
          </div>
        )}
        <div style={{ color: "#666" }}>
          感谢您的购买，祝您用餐愉快！
        </div>
      </Card>

      <div style={{ padding: 16 }}>
        <Button
          block
          color="primary"
          onClick={() => navigate("/home")}
          style={{ marginBottom: 12 }}
        >
          返回首页
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
          查看订单
        </Button>
      </div>
    </div>
  );
};

export default Success;
