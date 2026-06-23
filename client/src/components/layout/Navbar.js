"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Senior Dev Pattern: Compute the correct dashboard destination dynamically based on security role
  const getDashboardLink = () => {
    if (!user) return "/login";
    return user.role === "vendor" ? "/vendor/dashboard" : "/dashboard";
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight hover:opacity-90 transition-opacity">
          Fixora
        </Link>

        {/* Dynamic Auth Links */}
        <div className="flex items-center gap-5">
          {user ? (
            <>
              <div className="text-sm text-slate-600 font-medium hidden sm:block">
                Hi, <span className="text-slate-900">{user.name}</span> 
                <span className="ml-1.5 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-md uppercase font-semibold tracking-wider">
                  {user.role}
                </span>
              </div>
              
              <Link 
                href={getDashboardLink()} 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleLogout}
                className="h-9 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-medium border border-red-200/40 shadow-none transition-colors"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Login
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 font-medium">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
