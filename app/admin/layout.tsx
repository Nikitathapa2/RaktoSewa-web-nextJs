/**
 * Admin Layout
 * Provides admin-specific layout with Navbar
 * All admin routes are protected by middleware
 */

import Header from "../(public)/_components/Header";

export const metadata = {
  title: 'Admin Panel | Rakto Sewa',
  description: 'Admin dashboard for managing users',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    

        {/* Main content */}
          {children}
    </>
  );
}
