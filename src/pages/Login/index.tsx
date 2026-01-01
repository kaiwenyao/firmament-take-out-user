import { useState, useEffect } from "react";
import { Form, Input, Button, Image } from "antd-mobile";
import { EyeInvisibleOutline, EyeOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { userLoginAPI } from "@/api/auth";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    // 如果已登录，直接跳转到首页
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const res = await userLoginAPI({
        phone: values.phone,
        password: values.password,
      });

      if (res && res.code === 1 && res.data) {
        // 保存 token 和 userId
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.id);
        toast.success("登录成功");
        navigate("/home", { replace: true });
      } else {
        toast.error(res?.msg || "登录失败");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "登录失败"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #ff6b35 0%, #ff8c5a 50%, #f5f5f5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Logo 和标题区域 */}
      <div
        style={{
          paddingTop: 80,
          paddingBottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop"
          width={100}
          height={100}
          fit="cover"
          style={{
            borderRadius: 20,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
          }}
        />
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            fontWeight: "bold",
            color: "#fff",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          苍穹外卖
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          美味送到家
        </div>
      </div>

      {/* 登录表单卡片 */}
      <div
        style={{
          width: "calc(100% - 48px)",
          maxWidth: 400,
          backgroundColor: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          padding: "32px 24px",
          margin: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 8,
          }}
        >
          欢迎登录
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#999",
            marginBottom: 32,
          }}
        >
          请输入您的手机号和密码
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button
              block
              type="submit"
              color="danger"
              size="large"
              loading={loading}
              style={{
                borderRadius: 8,
                height: 48,
                fontSize: 16,
                fontWeight: "bold",
                marginTop: 16,
              }}
            >
              登录
            </Button>
          }
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
            ]}
          >
            <Input
              placeholder="请输入手机号"
              clearable
              type="tel"
              maxLength={11}
              style={{
                "--font-size": "16px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                placeholder="请输入密码"
                clearable
                type={passwordVisible ? "text" : "password"}
                style={{
                  "--font-size": "16px",
                  flex: 1,
                }}
              />
              <div
                style={{
                  padding: "0 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeOutline fontSize={20} color="#999" />
                ) : (
                  <EyeInvisibleOutline fontSize={20} color="#999" />
                )}
              </div>
            </div>
          </Form.Item>
        </Form>

        {/* 游客浏览按钮 */}
        <Button
          block
          fill="outline"
          size="large"
          onClick={() => navigate("/home")}
          style={{
            borderRadius: 8,
            height: 48,
            fontSize: 16,
            marginTop: 12,
            borderColor: "#ff6b35",
            color: "#ff6b35",
          }}
        >
          游客浏览
        </Button>
      </div>

      {/* 底部信息 */}
      <div
        style={{
          marginTop: "auto",
          paddingBottom: 40,
          paddingTop: 40,
          textAlign: "center",
          color: "#999",
          fontSize: 12,
        }}
      >
        <div>登录即表示同意《用户协议》和《隐私政策》</div>
        <div style={{ marginTop: 8 }}>© 2024 苍穹外卖</div>
      </div>
    </div>
  );
};

export default Login;
