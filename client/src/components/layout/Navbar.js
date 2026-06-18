"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">Fixora</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.name}</span>
              {user.role === "customer" && (
                <Link href="/dashboard" className="text-sm text-gray-700 hover:text-blue-600">Dashboard</Link>
              )}
              {user.role === "vendor" && (
                <Link href="/vendor/dashboard" className="text-sm text-gray-700 hover:text-blue-600">Dashboard</Link>
              )}
              <button onClick={logout} className="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
