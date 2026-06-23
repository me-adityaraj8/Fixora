"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Senior Dev Pattern: Role Interception Gate
  useEffect(() => {
    if (!authLoading && user?.role === "vendor") {
      // Vendors have no business booking items; push them to their workspace center
      router.push("/vendor/dashboard");
    }
  }, [user, authLoading, router]);

  // Fetch marketplace catalog data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/service/all");
        setServices(response.data.services || []);
      } catch (err) {
        console.error("Failed to load marketplace services", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Show a neutral state while checking authorization routing
  if (authLoading || (user?.role === "vendor")) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] text-slate-500">
        Routing to your workspace portal...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Quality Repairs, Delivered.
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Book trusted professionals for all your home and device repair needs.
        </p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400">Loading repair catalog...</div>
      ) : services.length === 0 ? (
        <div className="text-center text-slate-400 border border-dashed rounded-xl p-12 bg-slate-50">
          No services are currently active in the marketplace directory.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{service.description}</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-lg font-bold text-slate-900">₹{service.basePrice}</span>
                <Link href={`/book/${service._id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
