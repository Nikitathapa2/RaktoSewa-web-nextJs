import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#181111] text-white py-16 px-4 sm:px-10 border-t border-neutral-800">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Logo and Description */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative">
              <Image
                src="/images/logo.png"
                alt="Rakto Sewa Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h3 className="text-2xl font-bold">Raktosewa</h3>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
            Connecting blood donors with those in need. Join our mission to ensure no life is lost due to a lack of blood.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#ec1313] hover:text-white transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#ec1313] hover:text-white transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-[#ec1313] hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <h4 className="font-bold text-lg">Quick Links</h4>
          <nav className="flex flex-col gap-3 text-neutral-400 text-sm">
            {['Home', 'About Us', 'Donate Blood', 'Camps', 'Contact'].map((link) => (
              <Link key={link} href="#" className="hover:text-[#ec1313] transition-colors flex items-center gap-2">
                ▸ {link}
              </Link>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-6">
          <h4 className="font-bold text-lg">Legal</h4>
          <nav className="flex flex-col gap-3 text-neutral-400 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
              <Link key={link} href="#" className="hover:text-[#ec1313] transition-colors">
                {link}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-6">
          <h4 className="font-bold text-lg">Contact Us</h4>
          <div className="flex flex-col gap-4 text-neutral-400 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={18} />
              <span>Kathmandu,<br />Nepal , 01</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={18} />
              <span>+977-01991990</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>support@raktosewa.org</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto mt-16 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
        © 2025 Raktosewa. All rights reserved.
      </div>
    </footer>
  );
}
