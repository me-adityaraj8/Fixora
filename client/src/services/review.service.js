import api from "./api";

export const createReview = async (data) => {
  const response = await api.post("/review/create", data);
  return response.data;
};
