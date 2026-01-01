import { useState, useEffect } from "react";
import {
  NavBar,
  List,
  Button,
  Dialog,
} from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  getAddressListAPI,
  deleteAddressAPI,
  setDefaultAddressAPI,
  type Address as AddressType,
} from "@/api";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";

const AddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  // 请求数据对象
  const [reqData, setReqData] = useState({});

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await getAddressListAPI();
        if (res && res.code === 1) {
          setAddresses(res.data || []);
        }
      } catch (error: unknown) {
        toast.error(getErrorMessage(error, "加载地址失败"));
      }
    };
    fetchAddresses();
  }, [reqData]);

  const reloadData = () => {
    setReqData((prev) => ({ ...prev }));
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogVisible(false);
    try {
      await deleteAddressAPI(deleteId);
      toast.success("删除成功");
      reloadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "删除失败"));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogVisible(false);
    setDeleteId("");
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddressAPI(id);
      toast.success("设置成功");
      reloadData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "设置失败"));
    }
  };

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
        地址管理
      </NavBar>

      {addresses.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 100,
            color: "#999",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
          <div>暂无地址，快去添加吧</div>
        </div>
      ) : (
        <List>
          {addresses.map((address) => (
            <List.Item
              key={address.id}
              extra={
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/address/edit/${address.id}`)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="small"
                    color="danger"
                    onClick={() => handleDeleteClick(address.id)}
                  >
                    删除
                  </Button>
                </div>
              }
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: "bold", fontSize: 16 }}>{address.consignee}</div>
                  <div style={{ color: "#666" }}>{address.phone}</div>
                  {address.isDefault === 1 && (
                    <span
                      style={{
                        backgroundColor: "#ff6b35",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: "normal",
                      }}
                    >
                      默认
                    </span>
                  )}
                </div>
                <div style={{ color: "#666", marginBottom: 8, lineHeight: 1.5 }}>
                  {address.detail}
                </div>
                {address.isDefault !== 1 && (
                  <Button
                    size="small"
                    style={{ marginTop: 4 }}
                    onClick={() => handleSetDefault(address.id)}
                  >
                    设为默认
                  </Button>
                )}
              </div>
            </List.Item>
          ))}
        </List>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 50,
          left: 0,
          right: 0,
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderTop: "1px solid #eee",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
          zIndex: 1001,
        }}
      >
        <Button
          color="primary"
          block
          size="large"
          onClick={() => navigate("/address/add")}
          style={{
            height: 44,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          新增地址
        </Button>
      </div>

      <Dialog
        visible={deleteDialogVisible}
        content="确定要删除这个地址吗？"
        closeOnAction
        onClose={handleDeleteCancel}
        actions={[
          {
            key: "cancel",
            text: "取消",
            onClick: handleDeleteCancel,
          },
          {
            key: "confirm",
            text: "删除",
            bold: true,
            danger: true,
            onClick: handleDeleteConfirm,
          },
        ]}
      />
    </div>
  );
};

export default AddressPage;
