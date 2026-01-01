import { useState, useEffect, useRef } from "react";
import {
  NavBar,
  Card,
  Image,
  Button,
  Popup,
  Empty,
  Skeleton,
} from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getCategoryListAPI,
  dishListByCategoryIdAPI,
  addShoppingCartAPI,
  getShoppingCartAPI,
  delShoppingCartAPI,
  subShoppingCartAPI,
  getShopInfoAPI,
  getSetmealListByCategoryIdAPI,
  type Category,
  type Dish,
  type ShoppingCartItem,
  type Setmeal,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 提前检查路径，如果不是 /home 页面，直接返回 null，避免执行任何副作用
  // 这是一个保护措施，正常情况下路由配置应该确保 Home 组件只在 /home 路径下渲染
  const isHomePage = location.pathname === "/home";

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [setmeals, setSetmeals] = useState<Setmeal[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [loadingSetmeals, setLoadingSetmeals] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedFlavorMap, setSelectedFlavorMap] = useState<Record<string, string>>({});
  const [shopStatus, setShopStatus] = useState<number>(1); // 1:营业中 0:休息中
  const dishRequestIdRef = useRef(0);
  const setmealRequestIdRef = useRef(0);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const isShopOpen = shopStatus === 1;

  // 请求数据对象
  const [categoryReqData] = useState({ type: 1 }); // 只加载菜品分类，套餐分类通过type=2加载
  const [dishReqData, setDishReqData] = useState<{ categoryId?: string }>({});
  const [setmealReqData, setSetmealReqData] = useState<{ categoryId?: string }>({});
  const [cartReqData, setCartReqData] = useState({});
  const [shopReqData] = useState({});

  const normalizeFlavorValues = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string") as string[];
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => typeof item === "string") as string[];
        }
      } catch {
        // 非 JSON 字符串时按分隔符处理
      }
      if (trimmed.includes(",")) {
        return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
      }
      return [trimmed];
    }
    return [];
  };

  const hasToken = !!localStorage.getItem("token");
  const canBrowse = isHomePage;

  // 加载分类列表（同时加载菜品分类和套餐分类）
  useEffect(() => {
    if (!canBrowse) return;
    if (categories.length > 0) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        // 同时加载菜品分类（type=1）和套餐分类（type=2）
        const [dishRes, setmealRes] = await Promise.all([
          getCategoryListAPI({ type: 1 }),
          getCategoryListAPI({ type: 2 }),
        ]);
        
        const allCategories: Category[] = [];
        if (dishRes && dishRes.code === 1 && dishRes.data) {
          allCategories.push(...dishRes.data);
        }
        if (setmealRes && setmealRes.code === 1 && setmealRes.data) {
          allCategories.push(...setmealRes.data);
        }
        
        // 按sort排序
        allCategories.sort((a, b) => a.sort - b.sort);
        setCategories(allCategories);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "加载分类失败"));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [canBrowse, categories.length, categoryReqData]);

  // 加载菜品列表（仅当分类type=1时）
  useEffect(() => {
    if (!canBrowse) return;

    // 检查当前分类是否是菜品分类
    const currentCategory = categories[activeCategory];
    const isFoodCategory = currentCategory && currentCategory.type === 1;
    const hasCategoryId = dishReqData.categoryId !== undefined;

    if (isFoodCategory && hasCategoryId) {
      const requestId = ++dishRequestIdRef.current;
      const fetchDishes = async () => {
        setLoadingDishes(true);
        try {
          const res = await dishListByCategoryIdAPI(dishReqData);
          if (res && res.code === 1) {
            if (dishRequestIdRef.current !== requestId) {
              return;
            }
            const nextDishes = res.data || [];
            // 只设置菜品数据，购物车数量通过单独的 useEffect 更新
            setDishes(nextDishes);
          }
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "加载菜品失败"));
        } finally {
          if (dishRequestIdRef.current === requestId) {
            setLoadingDishes(false);
          }
        }
      };
      fetchDishes();
    } else {
      // 如果不是菜品分类，清空菜品列表
      dishRequestIdRef.current += 1;
      setDishes([]);
      setLoadingDishes(false);
    }
    // 移除 categories 和 activeCategory 依赖，因为它们的变化已经通过 dishReqData 体现
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBrowse, dishReqData]);

  // 加载套餐列表（仅当分类type=2时）
  useEffect(() => {
    if (!canBrowse) return;

    // 检查当前分类是否是套餐分类
    const currentCategory = categories[activeCategory];
    const isSetmealCategory = currentCategory && currentCategory.type === 2;
    const hasCategoryId = setmealReqData.categoryId !== undefined;

    if (isSetmealCategory && hasCategoryId) {
      const requestId = ++setmealRequestIdRef.current;
      const fetchSetmeals = async () => {
        setLoadingSetmeals(true);
        try {
          const res = await getSetmealListByCategoryIdAPI(setmealReqData);
          if (res && res.code === 1) {
            if (setmealRequestIdRef.current !== requestId) {
              return;
            }
            const nextSetmeals = res.data || [];
            setSetmeals(nextSetmeals);
          }
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "加载套餐失败"));
        } finally {
          if (setmealRequestIdRef.current === requestId) {
            setLoadingSetmeals(false);
          }
        }
      };
      fetchSetmeals();
    } else {
      // 如果不是套餐分类，清空套餐列表
      setmealRequestIdRef.current += 1;
      setSetmeals([]);
      setLoadingSetmeals(false);
    }
    // 移除 categories 和 activeCategory 依赖，因为它们的变化已经通过 setmealReqData 体现
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBrowse, setmealReqData]);

  // 加载购物车
  useEffect(() => {
    if (!canBrowse) return;
    if (!hasToken) {
      setCartItems([]);
      return;
    }
    const fetchCart = async () => {
      try {
        const res = await getShoppingCartAPI();
        if (res && res.code === 1) {
          const nextItems = (res.data || []).filter(
            (item: ShoppingCartItem) => item.number > 0
          );
          setCartItems(nextItems);
        }
      } catch (error: unknown) {
        // 购物车可能为空，不显示错误
      }
    };
    fetchCart();
  }, [canBrowse, hasToken, cartReqData]);

  // 当购物车变化时，合并购物车数量到菜品列表
  useEffect(() => {
    if (dishes.length > 0) {
      setDishes((prev) => updateDishesWithCart(prev, cartItems));
    }
    // 只依赖 cartItems，避免循环依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // 当购物车变化时，合并购物车数量到套餐列表
  useEffect(() => {
    if (setmeals.length > 0) {
      setSetmeals((prev) => updateSetmealsWithCart(prev, cartItems));
    }
    // 只依赖 cartItems，避免循环依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // 加载店铺信息
  useEffect(() => {
    if (!canBrowse) return;
    const fetchShopInfo = async () => {
      try {
        const res = await getShopInfoAPI();
        if (res && res.code === 1) {
          const nextStatus = typeof res.data === "number" ? res.data : 1;
          setShopStatus(nextStatus);
        }
      } catch (error: unknown) {
        // 忽略错误
      }
    };
    fetchShopInfo();
  }, [canBrowse, shopReqData]);

  // 当分类变化时，更新菜品和套餐请求数据
  useEffect(() => {
    if (categories.length > 0) {
      const categoryId = categories[activeCategory]?.id;
      // 只在 categoryId 真正变化时才更新，避免创建新对象导致的重复请求
      setDishReqData((prev) => {
        if (prev.categoryId === categoryId) return prev;
        return { categoryId };
      });
      setSetmealReqData((prev) => {
        if (prev.categoryId === categoryId) return prev;
        return { categoryId };
      });
    }
  }, [categories, activeCategory]);

  // 当路由变化时，刷新购物车
  useEffect(() => {
    if (location.pathname === "/home") {
      setCartReqData((prev) => ({ ...prev }));
    }
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (!selectedDish) return;
    const nextMap: Record<string, string> = {};
    selectedDish.flavors?.forEach((flavor) => {
      const values = normalizeFlavorValues(flavor.value);
      if (values.length > 0) {
        nextMap[flavor.name] = values[0];
      }
    });
    setSelectedFlavorMap(nextMap);
  }, [selectedDish]);

  const updateDishesWithCart = (
    list: Dish[],
    items: ShoppingCartItem[]
  ) => {
    const countMap = new Map<string, number>();
    items.forEach((item) => {
      if (item.dishId) {
        countMap.set(item.dishId, (countMap.get(item.dishId) || 0) + item.number);
      }
    });
    return list.map((dish) => {
      const count = countMap.get(dish.id);
      // 只有当菜品在购物车中且数量大于0时才设置 dishNumber
      if (count !== undefined && count > 0) {
        return {
          ...dish,
          dishNumber: count,
        };
      }
      // 如果菜品不在购物车中，清空数量显示
      return {
        ...dish,
        dishNumber: undefined,
      };
    });
  };

  const updateSetmealsWithCart = (
    list: Setmeal[],
    items: ShoppingCartItem[]
  ) => {
    const countMap = new Map<string, number>();
    items.forEach((item) => {
      if (item.setmealId) {
        countMap.set(item.setmealId, (countMap.get(item.setmealId) || 0) + item.number);
      }
    });
    return list.map((setmeal) => {
      const count = countMap.get(setmeal.id);
      // 只有当套餐在购物车中且数量大于0时才设置 setmealNumber
      if (count !== undefined && count > 0) {
        return {
          ...setmeal,
          setmealNumber: count,
        };
      }
      // 如果套餐不在购物车中，清空数量显示
      return {
        ...setmeal,
        setmealNumber: undefined,
      };
    });
  };

  const getSelectedFlavorText = (dish: Dish | null) => {
    if (!dish || !dish.flavors || dish.flavors.length === 0) {
      return "";
    }
    const parts = dish.flavors
      .map((flavor) => {
        const values = normalizeFlavorValues(flavor.value);
        const selected = selectedFlavorMap[flavor.name] || values[0];
        return selected ? `${flavor.name}:${selected}` : "";
      })
      .filter(Boolean);
    return parts.join("、");
  };

  const reloadCart = () => {
    setCartReqData((prev) => ({ ...prev }));
  };

  const openLoginPrompt = () => {
    setLoginPromptVisible(true);
  };

  const handleLoginRedirect = () => {
    setLoginPromptVisible(false);
    navigate("/login");
  };

  const buildCartPayload = (params: {
    dishId?: string;
    setmealId?: string;
    dishFlavor?: string;
  }) => {
    const payload: {
      dishId?: string;
      setmealId?: string;
      dishFlavor?: string;
    } = {
      dishId: params.dishId,
      setmealId: params.setmealId,
    };

    if (params.setmealId) {
      if (params.dishFlavor) {
        payload.dishFlavor = params.dishFlavor;
      }
    } else {
      payload.dishFlavor = params.dishFlavor ?? "";
    }

    return payload;
  };

  const handleAddDish = async (params: {
    dishId?: string;
    setmealId?: string;
    dishFlavor?: string;
  }) => {
    if (!isShopOpen) {
      toast.error("店铺已打烊，暂不支持加购");
      return;
    }
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    try {
      await addShoppingCartAPI(buildCartPayload(params));
      toast.success("已加入购物车");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "添加失败"));
    }
  };

  const handleDecreaseDish = async (params: {
    dishId?: string;
    setmealId?: string;
    dishFlavor?: string;
  }) => {
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    try {
      await subShoppingCartAPI(buildCartPayload(params));
      toast.success("已减少");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "操作失败"));
    }
  };

  const handleClearCart = async () => {
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    try {
      await delShoppingCartAPI();
      toast.success("已清空购物车");
      setCartItems([]);
      setDishes((prev) => updateDishesWithCart(prev, []));
      setSetmeals((prev) => updateSetmealsWithCart(prev, []));
      setCartVisible(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "清空失败"));
    }
  };

  const handleGoOrder = () => {
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    if (!isShopOpen) {
      toast.error("店铺已打烊，暂不支持下单");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("购物车为空");
      return;
    }
    navigate("/order");
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.amount * item.number;
  }, 0);

  const totalCount = cartItems.reduce((sum, item) => sum + item.number, 0);

  // 安全保护：如果不是 /home 页面，不渲染任何内容
  // 这可以防止组件在错误的路由下被意外渲染时产生副作用
  if (!isHomePage) {
    return null;
  }

  return (
    <div style={{ paddingBottom: 60 }}>
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
        苍穹外卖
      </NavBar>

      {/* 店铺信息 */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              苍穹外卖
              {shopStatus === 1 ? (
                <span style={{ color: "#00b96b", marginLeft: 8 }}>营业中</span>
              ) : (
                <span style={{ color: "#999", marginLeft: 8 }}>休息中</span>
              )}
            </div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
              北京市朝阳区新街大道一号楼8层
            </div>
          </div>
        </div>
      </Card>

      {/* 分类和菜品 */}
      <div style={{ display: "flex", height: "calc(100vh - 200px)" }}>
        {/* 左侧分类 */}
        <div
          style={{
            width: 100,
            borderRight: "1px solid #eee",
            overflowY: "auto",
          }}
        >
          {loadingCategories ? (
            <div style={{ padding: 12 }}>
              <Skeleton.Title animated style={{ width: "80%" }} />
              <Skeleton.Paragraph animated lineCount={5} />
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setActiveCategory(index)}
                style={{
                  padding: "16px 8px",
                  textAlign: "center",
                  backgroundColor:
                    activeCategory === index ? "#fff7e6" : "transparent",
                  borderLeft:
                    activeCategory === index ? "3px solid #ff6b35" : "none",
                  cursor: "pointer",
                }}
              >
                {category.name}
              </div>
            ))
          )}
        </div>

        {/* 右侧商品列表（菜品+套餐） */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px" }}>
          {loadingDishes || loadingSetmeals ? (
            <div style={{ paddingTop: 12 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Skeleton animated style={{ width: 80, height: 80 }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton.Title animated />
                      <Skeleton.Paragraph animated lineCount={2} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : dishes.length === 0 && setmeals.length === 0 ? (
            <Empty description="该分类下暂无商品" />
          ) : (
            <>
              {/* 菜品列表 */}
              {dishes.map((dish) => (
              <Card
                key={dish.id}
                style={{ marginBottom: 12 }}
                onClick={() => {
                  setSelectedDish(dish);
                  setDetailVisible(true);
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <Image
                    src={dish.image}
                    width={80}
                    height={80}
                    fit="cover"
                    style={{ borderRadius: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                      {dish.name}
                    </div>
                    <div
                      style={{ color: "#999", fontSize: 12, marginBottom: 4 }}
                    >
                      {dish.description || dish.name}
                    </div>
                    <div style={{ color: "#999", fontSize: 12 }}>
                      月销量0
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
                        ¥{dish.price?.toFixed(2)}
                      </div>
                      {Array.isArray(dish.flavors) && dish.flavors.length > 0 ? (
                        <Button
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDish(dish);
                            setDetailVisible(true);
                          }}
                        >
                          选择规格
                        </Button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {dish.dishNumber && dish.dishNumber > 0 && (
                            <>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecreaseDish({ dishId: dish.id });
                                }}
                              >
                                -
                              </Button>
                              <span style={{ margin: "0 8px" }}>
                                {dish.dishNumber}
                              </span>
                            </>
                          )}
                          <Button
                            size="small"
                            color="primary"
                            disabled={!isShopOpen}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddDish({
                                dishId: dish.id,
                                dishFlavor: "",
                              });
                            }}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              ))}

              {/* 套餐列表 */}
              {setmeals.map((setmeal) => (
                <Card
                  key={setmeal.id}
                  style={{ marginBottom: 12 }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <Image
                      src={setmeal.image}
                      width={80}
                      height={80}
                      fit="cover"
                      style={{ borderRadius: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontWeight: "bold" }}>
                          {setmeal.name}
                        </div>
                        <span
                          style={{
                            backgroundColor: "#ff6b35",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 10,
                          }}
                        >
                          套餐
                        </span>
                      </div>
                      <div
                        style={{ color: "#999", fontSize: 12, marginBottom: 4 }}
                      >
                        {setmeal.description || setmeal.name}
                      </div>
                      <div style={{ color: "#999", fontSize: 12 }}>
                        月销量0
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 8,
                        }}
                      >
                        <div style={{ color: "#ff6b35", fontWeight: "bold" }}>
                          ¥{setmeal.price?.toFixed(2)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {setmeal.setmealNumber && setmeal.setmealNumber > 0 && (
                            <>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDecreaseDish({ setmealId: setmeal.id });
                                }}
                              >
                                -
                              </Button>
                              <span style={{ margin: "0 8px" }}>
                                {setmeal.setmealNumber}
                              </span>
                            </>
                          )}
                          <Button
                            size="small"
                            color="primary"
                            disabled={!isShopOpen}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddDish({
                                setmealId: setmeal.id,
                              });
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* 底部购物车栏 */}
      <div
        style={{
          position: "fixed",
          bottom: 50,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #eee",
          padding: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <div
          onClick={() => setCartVisible(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{ fontSize: 24 }}>🛒</div>
          {totalCount > 0 && (
            <div
              style={{
                backgroundColor: "#ff6b35",
                color: "#fff",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
              }}
            >
              {totalCount}
            </div>
          )}
        </div>
        <div style={{ fontWeight: "bold" }}>¥{totalPrice.toFixed(2)}</div>
        <Button
          color="primary"
          onClick={handleGoOrder}
          disabled={totalCount === 0 || !isShopOpen}
        >
          去结算
        </Button>
      </div>

      {/* 购物车弹窗 */}
      <Popup
        visible={cartVisible}
        onMaskClick={() => setCartVisible(false)}
        bodyStyle={{ height: "60vh" }}
      >
        <div style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ fontWeight: "bold" }}>购物车</div>
            <Button size="small" onClick={handleClearCart}>
              清空
            </Button>
          </div>
          {cartItems.length === 0 ? (
            <Empty description="购物车为空" />
          ) : (
            <div>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={item.image}
                    width={60}
                    height={60}
                    fit="cover"
                    style={{ borderRadius: 4 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    {item.dishFlavor && (
                      <div style={{ color: "#999", fontSize: 12 }}>
                        {item.dishFlavor}
                      </div>
                    )}
                    <div style={{ color: "#ff6b35", marginTop: 4 }}>
                      ¥{item.amount?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Button
                      size="small"
                      onClick={() =>
                        handleDecreaseDish({
                          dishId: item.dishId || undefined,
                          setmealId: item.setmealId || undefined,
                          dishFlavor: item.dishFlavor ?? undefined,
                        })
                      }
                    >
                      -
                    </Button>
                    {item.number > 0 && (
                      <span style={{ margin: "0 8px" }}>{item.number}</span>
                    )}
                    <Button
                      size="small"
                      disabled={!isShopOpen}
                      onClick={() =>
                        handleAddDish({
                          dishId: item.dishId || undefined,
                          setmealId: item.setmealId || undefined,
                          dishFlavor: item.dishFlavor ?? undefined,
                        })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Popup>

      {/* 菜品详情弹窗 */}
      <Popup
        visible={detailVisible}
        onMaskClick={() => setDetailVisible(false)}
        bodyStyle={{ height: "70vh" }}
      >
        {selectedDish && (
          <div style={{ padding: 16 }}>
            <Image
              src={selectedDish.image}
              width="100%"
              height={200}
              fit="cover"
              style={{ borderRadius: 8, marginBottom: 16 }}
            />
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8 }}>
              {selectedDish.name}
            </div>
            <div style={{ color: "#666", marginBottom: 16 }}>
              {selectedDish.description}
            </div>
            {Array.isArray(selectedDish.flavors) &&
              selectedDish.flavors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                    选择规格
                  </div>
                  {selectedDish.flavors.map((flavor) => {
                    const values = normalizeFlavorValues(flavor.value);
                    return (
                      <div key={flavor.name} style={{ marginBottom: 12 }}>
                        <div style={{ color: "#666", marginBottom: 6 }}>
                          {flavor.name}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {values.map((value) => {
                            const isActive =
                              selectedFlavorMap[flavor.name] === value;
                            return (
                              <Button
                                key={value}
                                size="small"
                                color={isActive ? "primary" : "default"}
                                onClick={() =>
                                  setSelectedFlavorMap((prev) => ({
                                    ...prev,
                                    [flavor.name]: value,
                                  }))
                                }
                              >
                                {value}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ color: "#ff6b35", fontWeight: "bold", fontSize: 20 }}>
                ¥{selectedDish.price?.toFixed(2)}
              </div>
              <Button
                color="primary"
                disabled={!isShopOpen}
                onClick={() => {
                  handleAddDish({
                    dishId: selectedDish.id,
                    dishFlavor: getSelectedFlavorText(selectedDish),
                  });
                  setDetailVisible(false);
                }}
              >
                加入购物车
              </Button>
            </div>
          </div>
        )}
      </Popup>

      <Popup
        visible={loginPromptVisible}
        onMaskClick={() => setLoginPromptVisible(false)}
        bodyStyle={{ padding: 16 }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>请先登录</div>
          <div style={{ color: "#666", marginBottom: 16 }}>
            登录后即可加入购物车并下单
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button block onClick={() => setLoginPromptVisible(false)}>
              取消
            </Button>
            <Button block color="primary" onClick={handleLoginRedirect}>
              去登录
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Home;
