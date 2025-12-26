import Link from "next/link";
import Image from "next/image";

export default function Header() {
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
              <div className="relative">
                <button className="text-gray-700 hover:text-gray-900 flex items-center">
                  Register Now
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <Link href="/login" className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </nav>
  );
}
