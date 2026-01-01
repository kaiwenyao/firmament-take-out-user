import { useState } from "react";
import { NavBar, TextArea, Button } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Remark = () => {
  const navigate = useNavigate();
  const [remark, setRemark] = useState("");

  const handleSubmit = () => {
    // 这里应该将备注保存到订单中
    // 暂时只是返回上一页
    toast.success("备注已保存");
    navigate(-1);
  };

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
        订单备注
      </NavBar>

      <div style={{ padding: 16 }}>
        <TextArea
          placeholder="请输入备注信息"
          value={remark}
          onChange={(val) => setRemark(val)}
          rows={8}
          showCount
          maxLength={200}
        />

        <Button
          block
          color="primary"
          onClick={handleSubmit}
          style={{ marginTop: 24 }}
        >
          保存
        </Button>
      </div>
    </div>
  );
};

export default Remark;
