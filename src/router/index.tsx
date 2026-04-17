import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";

// Use React Router's lazy property for true route-level lazy loading
// This way components are only loaded when the route is matched, not when the router is created
const router = createBrowserRouter([
  {
    path: "/login",
    lazy: async () => {
      const { default: Login } = await import("@/pages/Login");
      return { Component: Login };
    },
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        lazy: async () => {
          const { default: Home } = await import("@/pages/Home");
          return { Component: Home };
        },
      },
      {
        path: "order",
        lazy: async () => {
          const { default: Order } = await import("@/pages/Order");
          return { Component: Order };
        },
      },
      {
        path: "my",
        lazy: async () => {
          const { default: My } = await import("@/pages/My");
          return { Component: My };
        },
      },
      {
        path: "address",
        lazy: async () => {
          const { default: AddressPage } = await import("@/pages/Address");
          return { Component: AddressPage };
        },
      },
      {
        path: "address/add",
        lazy: async () => {
          const { default: AddOrEditAddress } = await import("@/pages/AddOrEditAddress");
          return { Component: AddOrEditAddress };
        },
      },
      {
        path: "address/edit/:id",
        lazy: async () => {
          const { default: AddOrEditAddress } = await import("@/pages/AddOrEditAddress");
          return { Component: AddOrEditAddress };
        },
      },
      {
        path: "order/detail/:orderNumber",
        lazy: async () => {
          const { default: OrderDetail } = await import("@/pages/OrderDetail");
          return { Component: OrderDetail };
        },
      },
      {
        path: "pay",
        lazy: async () => {
          const { default: Pay } = await import("@/pages/Pay");
          return { Component: Pay };
        },
      },
      {
        path: "success",
        lazy: async () => {
          const { default: Success } = await import("@/pages/Success");
          return { Component: Success };
        },
      },
      {
        path: "history-order",
        lazy: async () => {
          const { default: HistoryOrder } = await import("@/pages/HistoryOrder");
          return { Component: HistoryOrder };
        },
      },
      {
        path: "*",
        element: <Navigate to="/home" replace />,
      },
    ],
  },
]);

export default router;
