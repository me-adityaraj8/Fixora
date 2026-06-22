import api from "./api";

export const getServices = async () => {
  const response = await api.get("/service");
  return response.data;
};

export const getServiceById = async (id) => {
  const response = await api.get(`/service/${id}`);
  return response.data;
};
