import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'User Management', icon: Users, path: '/users' },
    { name: 'Support / Feedback', icon: MessageSquare, path: '/support' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <img src="/logo.png" alt="Food Doctor" className="h-8 w-8 mr-3 rounded-lg" />
        <span className="font-bold text-lg text-text-primary tracking-tight">Food Doctor</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Main Menu
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" strokeWidth={2} />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <button className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
