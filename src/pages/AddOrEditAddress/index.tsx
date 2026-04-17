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

  // Request data object
  const [reqData, setReqData] = useState<{ addressId?: string }>({});

  useEffect(() => {
    if (id) {
      setReqData({ addressId: id });
    }
  }, [id]);

  // Load address details
  useEffect(() => {
    if (reqData.addressId) {
      const fetchAddress = async () => {
        setDetailLoading(true);
        try {
          const res = await getAddressByIdAPI(reqData.addressId!);
          if (res && res.code === 1 && res.data) {
            const address = res.data;
            setCurrentAddress(address);
            // Populate all fields in the form, including province/city/district info
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
        // Edit mode: use complete address info
        if (!currentAddress) {
          toast.error("Failed to load address, please refresh and try again");
          setLoading(false);
          return;
        }
        
        const params: Partial<Address> = {
          ...values,
          id: id,
          // Preserve original province/city/district codes and names
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
        // Add mode: use empty values
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
      // Validate form first
      const values = await form.validateFields();
      // Submit after validation passes
      await handleSubmit(values);
    } catch (error: unknown) {
      // On validation failure, antd-mobile throws an error, no extra handling needed
      if (error && typeof error === 'object' && 'errorFields' in error) {
        const formError = error as { errorFields?: Array<{ errors?: string[] }> };
        if (formError.errorFields) {
          // Form validation failed
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
