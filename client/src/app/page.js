"use client";
import { useEffect, useState } from "react";
import { getServices } from "@/services/service.service";
import Link from "next/link";

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data.services);
      } catch (err) {
        console.error("Failed to fetch services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Quality Repairs, Delivered.</h1>
      <p className="text-gray-600 text-center mb-12">Book trusted professionals for all your repair needs.</p>
      {loading ? (
        <p className="text-center text-gray-500">Loading services...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-600">₹{service.basePrice}</span>
                <Link href={`/book/${service._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
