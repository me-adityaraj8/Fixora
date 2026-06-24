import api from "./api";

export const createBooking = async (data) => {
  const response = await api.post("/booking/create", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/booking/my-bookings");
  return response.data;
};

export const getVendorBookings = async () => {
  const response = await api.get("/booking/vendor-bookings");
  return response.data;
};

export const updateBookingStatus = async (id, data) => {
  const response = await api.patch(`/booking/${id}/status`, { status: data });
  return response.data;
};
