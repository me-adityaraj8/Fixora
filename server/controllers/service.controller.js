import Service from "../models/Service.js";

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true });
    res.status(200).json({ services });
  } catch (error) {
    console.error('SERVER_CRASH_LOG:', typeof err !== 'undefined' ? err : typeof error !== 'undefined' ? error : 'Unhandled exception details'); res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.status(200).json({ service });
  } catch (error) {
    console.error('SERVER_CRASH_LOG:', typeof err !== 'undefined' ? err : typeof error !== 'undefined' ? error : 'Unhandled exception details'); res.status(500).json({ message: "Server error", error: error.message });
  }
};
