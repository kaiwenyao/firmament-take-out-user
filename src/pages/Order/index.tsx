import { useState, useEffect } from "react";
import {
  NavBar,
  Button,
  List,
  Image,
  Card,
  Popup,
  Radio,
  Skeleton,
} from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  getShoppingCartAPI,
  addShoppingCartAPI,
  subShoppingCartAPI,
  getAddressListAPI,
  getDefaultAddressAPI,
  getShopInfoAPI,
  submitOrderAPI,
  getFullAddress,
  type ShoppingCartItem,
  type Address,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const Order = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [addressPopupVisible, setAddressPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [shopStatus, setShopStatus] = useState<number>(1); // 1:营业中 0:休息中
  const isShopOpen = shopStatus === 1;

  // 请求数据对象
  const [cartReqData, setCartReqData] = useState({});

  // 加载购物车
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getShoppingCartAPI();
        if (res && res.code === 1) {
          setCartItems(
            (res.data || []).filter(
              (item: ShoppingCartItem) => item.number > 0
            )
          );
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "加载购物车失败"));
      }
    };
    fetchCart();
  }, [cartReqData]);

  // 加载默认地址
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      setAddressLoading(true);
      try {
        const res = await getDefaultAddressAPI();
        if (res && res.code === 1 && res.data) {
          setSelectedAddress(res.data);
        }
      } catch {
        // 没有默认地址，静默处理
      } finally {
        setAddressLoading(false);
      }
    };
    fetchDefaultAddress();
  }, []);

  // 加载店铺状态
  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const res = await getShopInfoAPI();
        if (res && res.code === 1) {
          const nextStatus = typeof res.data === "number" ? res.data : 1;
          setShopStatus(nextStatus);
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "获取店铺状态失败"));
      }
    };
    fetchShopInfo();
  }, []);

  // 加载地址列表（打开选择弹窗时）
  const loadAddressList = async () => {
    try {
      const res = await getAddressListAPI();
      if (res && res.code === 1) {
        setAddressList(res.data || []);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "加载地址失败"));
    }
  };

  const reloadCart = () => {
    setCartReqData((prev) => ({ ...prev }));
  };

  const buildCartPayload = (item: ShoppingCartItem) => {
    const payload: {
      dishId?: string;
      setmealId?: string;
      dishFlavor?: string;
    } = {
      dishId: item.dishId || undefined,
      setmealId: item.setmealId || undefined,
    };

    if (item.setmealId) {
      if (item.dishFlavor) {
        payload.dishFlavor = item.dishFlavor;
      }
    } else {
      payload.dishFlavor = item.dishFlavor ?? "";
    }

    return payload;
  };

  const handleAdd = async (item: ShoppingCartItem) => {
    if (!isShopOpen) {
      toast.error("店铺已打烊，暂不支持加购");
      return;
    }
    try {
      await addShoppingCartAPI(buildCartPayload(item));
      toast.success("已添加");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "操作失败"));
    }
  };

  const handleDecrease = async (item: ShoppingCartItem) => {
    try {
      await subShoppingCartAPI(buildCartPayload(item));
      toast.success("已减少");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "操作失败"));
    }
  };

  const handleOpenAddressPopup = async () => {
    setAddressPopupVisible(true);
    await loadAddressList();
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setAddressPopupVisible(false);
  };

  const handleSubmit = async () => {
    if (!isShopOpen) {
      toast.error("店铺已打烊，暂不支持下单");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("购物车为空");
      return;
    }

    if (!selectedAddress) {
      toast.error("请选择收货地址");
      return;
    }

    setLoading(true);
    try {
      const res = await submitOrderAPI({
        addressBookId: selectedAddress.id,
        payMethod: 1, // 默认微信支付
        deliveryStatus: 1, // 立即送出
        tablewareStatus: 1, // 按餐量提供
        tablewareNumber: 0,
        packAmount: 0,
        amount: totalPrice,
      });

      if (res && res.code === 1) {
        toast.success("订单创建成功");
        // 跳转到支付页面，传递订单信息
        const orderData = res.data as { orderNumber?: string };
        navigate(`/pay?orderNumber=${orderData?.orderNumber || ""}`);
      } else {
        toast.error((res as { msg?: string })?.msg || "订单创建失败");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "订单创建失败"));
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.amount * item.number;
  }, 0);

  return (
    <div style={{ paddingBottom: 120 }}>
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
        确认订单
      </NavBar>

      {/* 收货地址 */}
      <Card
        style={{ margin: 12, cursor: "pointer" }}
        onClick={handleOpenAddressPopup}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <span style={{ fontWeight: "bold", fontSize: 16 }}>收货地址</span>
            </div>
            {addressLoading ? (
              <Skeleton animated style={{ "--width": "80%" }} />
            ) : selectedAddress ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: "bold" }}>{selectedAddress.consignee}</span>
                  <span style={{ color: "#666" }}>{selectedAddress.phone}</span>
                  {selectedAddress.isDefault === 1 && (
                    <span
                      style={{
                        backgroundColor: "#ff6b35",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                      }}
                    >
                      默认
                    </span>
                  )}
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {getFullAddress(selectedAddress)}
                </div>
              </>
            ) : (
              <div style={{ color: "#ff6b35" }}>请选择收货地址</div>
            )}
          </div>
          <div style={{ color: "#999", fontSize: 20 }}>›</div>
        </div>
      </Card>

      {/* 商品列表 */}
      <Card style={{ margin: 12 }}>
        <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 16 }}>商品清单</div>
        <List style={{ "--border-top": "none", "--border-bottom": "none" }}>
          {cartItems.map((item) => (
            <List.Item
              key={item.id}
              prefix={
                <Image
                  src={item.image}
                  width={60}
                  height={60}
                  fit="cover"
                  style={{ borderRadius: 4 }}
                />
              }
              extra={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDecrease(item);
                    }}
                  >
                    -
                  </Button>
                  {item.number > 0 && <span>{item.number}</span>}
                  <Button
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(item);
                    }}
                    disabled={!isShopOpen}
                  >
                    +
                  </Button>
                </div>
              }
            >
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                  {item.name}
                </div>
                {item.dishFlavor && (
                  <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
                    {item.dishFlavor}
                  </div>
                )}
                <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
                  ¥{item.amount?.toFixed(2)}
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      {/* 底部提交栏 */}
      <div
        style={{
          position: "fixed",
          bottom: 50,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #eee",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 999,
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div>
          <div style={{ color: "#999", fontSize: 12 }}>合计</div>
          <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 20 }}>
            ¥{totalPrice.toFixed(2)}
          </div>
        </div>
        <Button
          color="primary"
          size="large"
          onClick={handleSubmit}
          loading={loading}
          disabled={cartItems.length === 0 || loading || !isShopOpen}
          style={{ minWidth: 120 }}
        >
          提交订单
        </Button>
      </div>

      {/* 地址选择弹窗 */}
      <Popup
        visible={addressPopupVisible}
        onMaskClick={() => setAddressPopupVisible(false)}
        position="bottom"
        bodyStyle={{ height: "60vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <div style={{ padding: 16, height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontWeight: "bold", fontSize: 18 }}>选择收货地址</span>
            <Button
              size="small"
              color="primary"
              fill="none"
              onClick={() => {
                setAddressPopupVisible(false);
                navigate("/address/add");
              }}
            >
              新增地址
            </Button>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            {addressList.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#999" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                <div>暂无地址，请先添加</div>
                <Button
                  color="primary"
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    setAddressPopupVisible(false);
                    navigate("/address/add");
                  }}
                >
                  添加地址
                </Button>
              </div>
            ) : (
              <Radio.Group
                value={selectedAddress?.id}
                onChange={(val) => {
                  const address = addressList.find((a) => a.id === val);
                  if (address) {
                    handleSelectAddress(address);
                  }
                }}
              >
                {addressList.map((address) => (
                  <div
                    key={address.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Radio
                      value={address.id}
                      style={{
                        "--icon-size": "20px",
                        "--font-size": "14px",
                      }}
                    >
                      <div style={{ marginLeft: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: "bold" }}>{address.consignee}</span>
                          <span style={{ color: "#666" }}>{address.phone}</span>
                          {address.isDefault === 1 && (
                            <span
                              style={{
                                backgroundColor: "#ff6b35",
                                color: "#fff",
                                padding: "2px 6px",
                                borderRadius: 4,
                                fontSize: 10,
                              }}
                            >
                              默认
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#666", fontSize: 13 }}>
                          {getFullAddress(address)}
                        </div>
                      </div>
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Order;
