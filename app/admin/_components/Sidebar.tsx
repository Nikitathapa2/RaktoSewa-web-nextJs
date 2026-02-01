import Link from 'next/link';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';
import Image from 'next/image';
interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  active?: boolean;
}

interface AdminSideBarProps {
  navItems?: NavItem[];
  onLogout?: () => void;
}

export default function AdminSideBar({ navItems = [], onLogout }: AdminSideBarProps) {
  // Default nav items if none provided
  const defaultNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', href: '/admin', active: true },
    { label: 'User Management', icon: '👥', href: '/admin/users' },
    { label: 'Appointments', icon: '📅', href: '/admin/appointments' },
    { label: 'Inventory', icon: '📦', href: '/admin/inventory' },
    { label: 'Reports', icon: '📈', href: '/admin/reports' },
  ];

  const items = navItems.length > 0 ? navItems : defaultNavItems;

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 relative">
                    <Image
                      src="/images/logo.png"
                      alt="Rakto Sewa Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
        <div>
          <h1 className="text-lg font-bold leading-none">Raktosewa</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              item.active
                ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-r-4 border-red-600'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className={`text-sm ${item.active ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-zinc-800">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}