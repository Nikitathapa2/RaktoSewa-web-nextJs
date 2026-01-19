"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { handleLogout, getCurrentUser } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const onLogout = async () => {
    try {
      await handleLogout();
    } catch (error: any) {
      // Redirect errors from Next.js are expected, ignore them
      if (error.message?.includes('NEXT_REDIRECT') || error.digest) {
        return;
      }
      toast.error(error.message || "Logout failed");
      console.error("Logout error:", error);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
              {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 relative">
            <Image
              src="/images/logo.png"
              alt="Rakto Sewa Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-semibold">
            Rakto<span className="font-normal">Sewa</span>
          </span>
        </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900">
                About Us
              </Link>
              <Link href="/donate" className="text-gray-700 hover:text-gray-900">
                Donate
              </Link>
              
              {!isLoading && (
                <>
                  {user ? (
                    // Profile Avatar with Dropdown
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center space-x-2 focus:outline-none"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold hover:bg-red-700 transition">
                          {getInitials(user.user?.fullName || user.user?.organizationName || user.user?.name || "User")}
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 min-w-max">
                          <div className="px-4 py-2 border-b">
                            <p className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                              {user.user?.fullName || user.user?.organizationName || user.user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 break-words truncate">{user.user?.email}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                            onClick={() => setShowDropdown(false)}
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate"
                            onClick={() => setShowDropdown(false)}
                          >
                            Profile
                          </Link>
                          <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 truncate"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Login/Register Buttons
                    <>
                      <Link href="/register" className="text-gray-700 hover:text-gray-900">
                        Register Now
                      </Link>
                      <Link href="/login" className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition">
                        Log In
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
}
