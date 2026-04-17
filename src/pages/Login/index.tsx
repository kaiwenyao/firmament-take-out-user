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
    // If already logged in, redirect to home
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
        // Save token and userId
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.id);
        toast.success("Login successful");
        navigate("/home", { replace: true });
      } else {
        toast.error(res?.msg || "Login failed");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Login failed"));
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
      {/* Logo and title area */}
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
          Firmament Takeout
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Delicious food delivered to your door
        </div>
      </div>

      {/* Login form card */}
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
          Welcome Back
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#999",
            marginBottom: 32,
          }}
        >
          Please enter your phone number and password
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
              Sign In
            </Button>
          }
        >
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter your phone number" },
              { pattern: /^1[3-9]\d{9}$/, message: "Please enter a valid phone number" },
            ]}
          >
            <Input
              placeholder="Enter your phone number"
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
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Input
                placeholder="Enter your password"
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

        {/* Guest browse button */}
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
          Browse as Guest
        </Button>
      </div>

      {/* Footer info */}
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
        <div>By signing in, you agree to our Terms of Service and Privacy Policy</div>
        <div style={{ marginTop: 8 }}>© 2024 Firmament Takeout</div>
      </div>
    </div>
  );
};

export default Login;
