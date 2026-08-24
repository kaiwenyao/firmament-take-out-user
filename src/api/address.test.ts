import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./request", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import request from "./request";
import {
  getAddressListAPI,
  getAddressByIdAPI,
  addAddressAPI,
  updateAddressAPI,
  deleteAddressAPI,
  getDefaultAddressAPI,
  setDefaultAddressAPI,
  getFullAddress,
  type Address,
} from "./address";

const mockGet = vi.mocked(request.get);
const mockPost = vi.mocked(request.post);
const mockPut = vi.mocked(request.put);
const mockDelete = vi.mocked(request.delete);

afterEach(() => {
  vi.clearAllMocks();
});

const sampleAddress: Address = {
  id: "a1",
  userId: "u1",
  consignee: "Bob",
  phone: "13812345678",
  sex: "1",
  provinceCode: "11",
  provinceName: "Beijing",
  cityCode: "1101",
  cityName: "Beijing",
  districtCode: "110101",
  districtName: "Dongcheng",
  detail: "No.1 Street",
  label: "Home",
  isDefault: 1,
};

describe("address API", () => {
  it("getAddressListAPI GETs the address list", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: [sampleAddress] });

    await getAddressListAPI();

    expect(mockGet).toHaveBeenCalledWith("/addressBook/list");
  });

  it("getAddressByIdAPI GETs an address by id", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleAddress });

    await getAddressByIdAPI("a1");

    expect(mockGet).toHaveBeenCalledWith("/addressBook/a1");
  });

  it("addAddressAPI POSTs the address", async () => {
    mockPost.mockResolvedValue({ code: 1, msg: "success" });

    await addAddressAPI({ consignee: "Bob" });

    expect(mockPost).toHaveBeenCalledWith("/addressBook", { consignee: "Bob" });
  });

  it("updateAddressAPI PUTs the address", async () => {
    mockPut.mockResolvedValue({ code: 1, msg: "success" });

    await updateAddressAPI({ id: "a1", consignee: "Alice" });

    expect(mockPut).toHaveBeenCalledWith("/addressBook", { id: "a1", consignee: "Alice" });
  });

  it("deleteAddressAPI DELETEs the address with params", async () => {
    mockDelete.mockResolvedValue({ code: 1, msg: "success" });

    await deleteAddressAPI("a1");

    expect(mockDelete).toHaveBeenCalledWith("/addressBook", { params: { id: "a1" } });
  });

  it("getDefaultAddressAPI GETs the default address", async () => {
    mockGet.mockResolvedValue({ code: 1, msg: "success", data: sampleAddress });

    await getDefaultAddressAPI();

    expect(mockGet).toHaveBeenCalledWith("/addressBook/default");
  });

  it("setDefaultAddressAPI PUTs the default id", async () => {
    mockPut.mockResolvedValue({ code: 1, msg: "success" });

    await setDefaultAddressAPI("a1");

    expect(mockPut).toHaveBeenCalledWith("/addressBook/default", { id: "a1" });
  });

  describe("getFullAddress", () => {
    it("concatenates province, city, district and detail", () => {
      expect(getFullAddress(sampleAddress)).toBe("BeijingBeijingDongchengNo.1 Street");
    });

    it("handles empty optional fields", () => {
      const addr: Address = { ...sampleAddress, provinceName: "", cityName: "", districtName: "", detail: "" };
      expect(getFullAddress(addr)).toBe("");
    });
  });
});