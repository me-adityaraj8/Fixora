"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { getServiceById } from "@/services/service.service";
import { getAllVendors } from "@/services/vendor.service";
import { createBooking } from "@/services/booking.service";

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  
  const [service, setService] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    vendorId: "",
    bookingType: "home_service",
    scheduledAt: "",
    notes: "",
    address: { street: "", city: "", state: "", pincode: "" }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceData, vendorData] = await Promise.all([
          getServiceById(params.id),
          getAllVendors()
        ]);
        setService(serviceData.service);
        setVendors(vendorData.vendors);
      } catch (err) {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "pincode"].includes(name)) {
      setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createBooking({ ...formData, serviceId: params.id });
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!service) return <div className="text-center mt-20 text-red-500">Service not found</div>;

  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Book {service.name}</h1>
        <p className="text-gray-600 mb-8">Base Price: ₹{service.basePrice}</p>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-6">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow border border-gray-100">
          <div>
            <label className="block text-sm font-medium mb-1">Select Professional</label>
            <select name="vendorId" required value={formData.vendorId} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>Choose a vendor...</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>{v.businessName} (Rating: {v.rating})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date & Time</label>
              <input type="datetime-local" name="scheduledAt" required value={formData.scheduledAt} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Booking Type</label>
              <select name="bookingType" value={formData.bookingType} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="home_service">Home Service</option>
                <option value="pickup_repair">Pickup & Repair</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium border-b pb-2">Address Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="street" placeholder="Street" required value={formData.address.street} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="city" placeholder="City" required value={formData.address.city} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="state" placeholder="State" required value={formData.address.state} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="pincode" placeholder="Pincode" required value={formData.address.pincode} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Issue Details (Optional)</label>
            <textarea name="notes" rows="3" placeholder="Describe the problem..." value={formData.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {submitting ? "Confirming Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
