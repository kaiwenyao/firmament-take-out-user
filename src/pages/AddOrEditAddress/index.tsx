import { useState, useEffect } from "react";
import {
  NavBar,
  Form,
  Input,
  Button,
  Radio,
  Skeleton,
  Card,
} from "antd-mobile";
import { useNavigate, useParams } from "react-router-dom";
import {
  addAddressAPI,
  updateAddressAPI,
  getAddressByIdAPI,
  type Address,
} from "@/api";
import { toast } from "sonner";

const AddOrEditAddress = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  // 请求数据对象
  const [reqData, setReqData] = useState<{ addressId?: string }>({});

  useEffect(() => {
    if (id) {
      setReqData({ addressId: id });
    }
  }, [id]);

  // 加载地址详情
  useEffect(() => {
    if (reqData.addressId) {
      const fetchAddress = async () => {
        setDetailLoading(true);
        try {
          const res = await getAddressByIdAPI(reqData.addressId!);
          if (res && res.code === 1 && res.data) {
            const address = res.data;
            setCurrentAddress(address);
            // 回显所有字段到表单，包括省市区信息
            form.setFieldsValue({
              consignee: address.consignee || "",
              phone: address.phone || "",
              sex: address.sex || "1",
              detail: address.detail || "",
              label: address.label || "",
              provinceName: address.provinceName || "",
              cityName: address.cityName || "",
              districtName: address.districtName || "",
            });
          } else {
            toast.error("Address not found");
            navigate(-1);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Failed to load address";
          toast.error(errorMessage);
          navigate(-1);
        } finally {
          setDetailLoading(false);
        }
      };
      fetchAddress();
    }
  }, [reqData, form, navigate]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      if (id) {
        // 编辑模式：使用完整的地址信息
        if (!currentAddress) {
          toast.error("Failed to load address, please refresh and try again");
          setLoading(false);
          return;
        }
        
        const params: Partial<Address> = {
          ...values,
          id: id,
          // 保留原有的省市区编码和名称
          provinceCode: currentAddress.provinceCode || "",
          provinceName: currentAddress.provinceName || "",
          cityCode: currentAddress.cityCode || "",
          cityName: currentAddress.cityName || "",
          districtCode: currentAddress.districtCode || "",
          districtName: currentAddress.districtName || "",
        };
        
        const res = await updateAddressAPI(params);
        if (res && res.code === 1) {
          toast.success("Updated successfully");
          navigate(-1);
        } else {
          toast.error(res?.msg || "Failed to update");
        }
      } else {
        // 新增模式：使用空值
        const params: Partial<Address> = {
          ...values,
          provinceCode: "",
          provinceName: "",
          cityCode: "",
          cityName: "",
          districtCode: "",
          districtName: "",
        };
        
        const res = await addAddressAPI(params);
        if (res && res.code === 1) {
          toast.success("Added successfully");
          navigate(-1);
        } else {
          toast.error(res?.msg || "Failed to add");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Operation failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      // 先验证表单
      const values = await form.validateFields();
      // 验证通过后提交
      await handleSubmit(values);
    } catch (error: unknown) {
      // 验证失败时，antd-mobile 会抛出错误，这里不需要额外处理
      if (error && typeof error === 'object' && 'errorFields' in error) {
        const formError = error as { errorFields?: Array<{ errors?: string[] }> };
        if (formError.errorFields) {
          // 表单验证失败
          const firstError = formError.errorFields[0];
          if (firstError?.errors?.[0]) {
            toast.error(firstError.errors[0]);
          }
        }
      }
    }
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
        {id ? "Edit Address" : "Add Address"}
      </NavBar>

      {detailLoading ? (
        <div style={{ padding: 16 }}>
          <Card>
            <Skeleton animated style={{ "--width": "60%" }} />
            <Skeleton.Paragraph animated lineCount={5} />
          </Card>
        </div>
      ) : (
        <>
          <Form
            form={form}
            onFinish={handleSubmit}
          >
          <Form.Item
            name="consignee"
            label="Recipient"
            rules={[{ required: true, message: "Please enter recipient name" }]}
          >
            <Input placeholder="Enter recipient name" disabled={detailLoading} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Please enter phone number" },
              { pattern: /^1[3-9]\d{9}$/, message: "Please enter a valid phone number" },
            ]}
          >
            <Input placeholder="Enter phone number" disabled={detailLoading} />
          </Form.Item>

          <Form.Item name="sex" label="Gender" initialValue="1">
            <Radio.Group disabled={detailLoading}>
              <Radio value="1">Male</Radio>
              <Radio value="0">Female</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="detail"
            label="Address Details"
            rules={[{ required: true, message: "Please enter address details" }]}
          >
            <Input placeholder="Enter address details" disabled={detailLoading} />
          </Form.Item>

          <Form.Item name="label" label="Label">
            <Input placeholder="e.g., Home, Office" disabled={detailLoading} />
          </Form.Item>
          </Form>
          
          <div style={{ padding: "16px", paddingTop: 0 }}>
            <Button
              block
              color="primary"
              loading={loading}
              disabled={loading || detailLoading}
              onClick={handleFormSubmit}
              size="large"
            >
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddOrEditAddress;
