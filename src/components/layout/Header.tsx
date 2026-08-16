import { Bell, Search, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 ml-64 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search users, tickets, settings..."
            className="w-full bg-background border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-background rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-surface"></span>
        </button>

        <div className="h-8 w-px bg-border"></div>

        <button className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-text-primary leading-tight">Admin User</p>
            <p className="text-xs text-text-secondary">Superadmin</p>
          </div>
          <UserCircle className="h-9 w-9 text-text-secondary" />
        </button>
      </div>
    </header>
  );
}
