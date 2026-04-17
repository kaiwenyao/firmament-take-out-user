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

  // Early path check: if not on /home page, return null to prevent any side effects
  // This is a safeguard - route config should ensure Home only renders at /home
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
  const [shopStatus, setShopStatus] = useState<number>(1); // 1: Open, 0: Closed
  const dishRequestIdRef = useRef(0);
  const setmealRequestIdRef = useRef(0);
  const [loginPromptVisible, setLoginPromptVisible] = useState(false);
  const isShopOpen = shopStatus === 1;

  // Request data object
  const [categoryReqData] = useState({ type: 1 }); // Only load dish categories, set meal categories loaded via type=2
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
        // Handle non-JSON strings as comma-separated values
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

  // Load category list (load both dish categories and set meal categories)
  useEffect(() => {
    if (!canBrowse) return;
    if (categories.length > 0) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        // Load both dish categories (type=1) and set meal categories (type=2)
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
        
        // Sort by sort order
        allCategories.sort((a, b) => a.sort - b.sort);
        setCategories(allCategories);
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "Failed to load categories"));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [canBrowse, categories.length, categoryReqData]);

  // Load dish list (only when category type=1)
  useEffect(() => {
    if (!canBrowse) return;

    // Check if current category is a dish category
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
            // Only set dish data, cart quantities are updated via separate useEffect
            setDishes(nextDishes);
          }
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "Failed to load dishes"));
        } finally {
          if (dishRequestIdRef.current === requestId) {
            setLoadingDishes(false);
          }
        }
      };
      fetchDishes();
    } else {
      // If not a dish category, clear the dish list
      dishRequestIdRef.current += 1;
      setDishes([]);
      setLoadingDishes(false);
    }
    // Remove categories and activeCategory dependencies since their changes are reflected via dishReqData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBrowse, dishReqData]);

  // Load set meal list (only when category type=2)
  useEffect(() => {
    if (!canBrowse) return;

    // Check if current category is a set meal category
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
          toast.error(getErrorMessage(error, "Failed to load set meals"));
        } finally {
          if (setmealRequestIdRef.current === requestId) {
            setLoadingSetmeals(false);
          }
        }
      };
      fetchSetmeals();
    } else {
      // If not a set meal category, clear the set meal list
      setmealRequestIdRef.current += 1;
      setSetmeals([]);
      setLoadingSetmeals(false);
    }
    // Remove categories and activeCategory dependencies since their changes are reflected via setmealReqData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBrowse, setmealReqData]);

  // Load cart
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
      } catch {
        // Cart may be empty, don't show error
      }
    };
    fetchCart();
  }, [canBrowse, hasToken, cartReqData]);

  // When cart changes, merge cart quantities to dish list
  useEffect(() => {
    if (dishes.length > 0) {
      setDishes((prev) => updateDishesWithCart(prev, cartItems));
    }
    // Only depend on cartItems to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // When cart changes, merge cart quantities to set meal list
  useEffect(() => {
    if (setmeals.length > 0) {
      setSetmeals((prev) => updateSetmealsWithCart(prev, cartItems));
    }
    // Only depend on cartItems to avoid circular dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Load shop info
  useEffect(() => {
    if (!canBrowse) return;
    const fetchShopInfo = async () => {
      try {
        const res = await getShopInfoAPI();
        if (res && res.code === 1) {
          const nextStatus = typeof res.data === "number" ? res.data : 1;
          setShopStatus(nextStatus);
        }
      } catch {
        // Ignore error
      }
    };
    fetchShopInfo();
  }, [canBrowse, shopReqData]);

  // When category changes, update dish and set meal request data
  useEffect(() => {
    if (categories.length > 0) {
      const categoryId = categories[activeCategory]?.id;
      // Only update when categoryId actually changes to avoid duplicate requests from new object creation
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

  // When route changes, refresh cart
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
      // Only set dishNumber when dish is in cart and quantity > 0
      if (count !== undefined && count > 0) {
        return {
          ...dish,
          dishNumber: count,
        };
      }
      // If dish is not in cart, clear the quantity display
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
      // Only set setmealNumber when set meal is in cart and quantity > 0
      if (count !== undefined && count > 0) {
        return {
          ...setmeal,
          setmealNumber: count,
        };
      }
      // If set meal is not in cart, clear the quantity display
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
    return parts.join(", ");
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
      toast.error("Store is closed, cannot add to cart");
      return;
    }
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    try {
      await addShoppingCartAPI(buildCartPayload(params));
      toast.success("Added to cart");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to add"));
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
      toast.success("Removed");
      reloadCart();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Operation failed"));
    }
  };

  const handleClearCart = async () => {
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    try {
      await delShoppingCartAPI();
      toast.success("Cart cleared");
      setCartItems([]);
      setDishes((prev) => updateDishesWithCart(prev, []));
      setSetmeals((prev) => updateSetmealsWithCart(prev, []));
      setCartVisible(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to clear cart"));
    }
  };

  const handleGoOrder = () => {
    if (!hasToken) {
      openLoginPrompt();
      return;
    }
    if (!isShopOpen) {
      toast.error("Store is closed, cannot place order");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/order");
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.amount * item.number;
  }, 0);

  const totalCount = cartItems.reduce((sum, item) => sum + item.number, 0);

  // Safety guard: if not on /home page, don't render anything
  // This prevents side effects when component is accidentally rendered at wrong route
  if (!isHomePage) {
    return null;
  }

  return (
    <div style={{ paddingBottom: 60, paddingTop: 52 }}>
      <NavBar
        back={null}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          backgroundColor: "#f5f5f5",
          color: "#333",
          fontSize: 20,
          fontWeight: "bold",
          padding: "12px 16px",
        }}
      >
        Firmament Takeout
      </NavBar>

      {/* Shop info */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>
              Firmament Takeout
              {shopStatus === 1 ? (
                <span style={{ color: "#00b96b", marginLeft: 8 }}>Open</span>
              ) : (
                <span style={{ color: "#999", marginLeft: 8 }}>Closed</span>
              )}
            </div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
              8F, Building 1, Xinjie Avenue, Chaoyang, Beijing
            </div>
          </div>
        </div>
      </Card>

      {/* Categories and dishes */}
      <div style={{ display: "flex", height: "calc(100vh - 200px)" }}>
        {/* Left sidebar categories */}
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

        {/* Right side product list (dishes + set meals) */}
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
            <Empty description="No items in this category" />
          ) : (
            <>
              {/* Dish list */}
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
                      Monthly sales: 0
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
                          fill="none"
                          color="primary"
                          style={{ fontSize: 12, padding: "2px 4px", height: "auto" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDish(dish);
                            setDetailVisible(true);
                          }}
                        >
                          Select Options
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

              {/* Set meal list */}
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
                          Set Meal
                        </span>
                      </div>
                      <div
                        style={{ color: "#999", fontSize: 12, marginBottom: 4 }}
                      >
                        {setmeal.description || setmeal.name}
                      </div>
                      <div style={{ color: "#999", fontSize: 12 }}>
                        Monthly sales: 0
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

      {/* Bottom cart bar */}
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
          Checkout
        </Button>
      </div>

      {/* Cart popup */}
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
            <div style={{ fontWeight: "bold" }}>Cart</div>
            <Button size="small" onClick={handleClearCart}>
              Clear
            </Button>
          </div>
          {cartItems.length === 0 ? (
            <Empty description="Your cart is empty" />
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

      {/* Dish detail popup */}
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
                    Select Options
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
                Add to Cart
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
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Please sign in first</div>
          <div style={{ color: "#666", marginBottom: 16 }}>
            Sign in to add items to cart and place orders
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button block onClick={() => setLoginPromptVisible(false)}>
              Cancel
            </Button>
            <Button block color="primary" onClick={handleLoginRedirect}>
              Sign In
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Home;
