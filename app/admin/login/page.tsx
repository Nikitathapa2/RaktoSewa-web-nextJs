import AdminLoginForm from "../_components/AdminLoginForm";

export const metadata = {
  title: 'Admin Login | Rakto Sewa',
  description: 'Admin login for Rakto Sewa platform',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <AdminLoginForm />
    </div>
  );
}
