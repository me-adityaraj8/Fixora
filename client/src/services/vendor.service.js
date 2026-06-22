import api from "./api";

export const getAllVendors = async () => {
  const response = await api.get("/vendor/all");
  return response.data;
};
