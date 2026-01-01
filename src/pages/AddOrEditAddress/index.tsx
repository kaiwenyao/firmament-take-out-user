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
            toast.error("地址不存在");
            navigate(-1);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "加载地址失败";
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
          toast.error("地址信息加载失败，请刷新后重试");
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
          toast.success("修改成功");
          navigate(-1);
        } else {
          toast.error(res?.msg || "修改失败");
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
          toast.success("添加成功");
          navigate(-1);
        } else {
          toast.error(res?.msg || "添加失败");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "操作失败";
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
        {id ? "编辑地址" : "新增地址"}
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
            label="收货人"
            rules={[{ required: true, message: "请输入收货人" }]}
          >
            <Input placeholder="请输入收货人" disabled={detailLoading} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
            ]}
          >
            <Input placeholder="请输入手机号" disabled={detailLoading} />
          </Form.Item>

          <Form.Item name="sex" label="性别" initialValue="1">
            <Radio.Group disabled={detailLoading}>
              <Radio value="1">男</Radio>
              <Radio value="0">女</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: "请输入详细地址" }]}
          >
            <Input placeholder="请输入详细地址" disabled={detailLoading} />
          </Form.Item>

          <Form.Item name="label" label="标签">
            <Input placeholder="如：家、公司" disabled={detailLoading} />
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
              保存
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddOrEditAddress;
