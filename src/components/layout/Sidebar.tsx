import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronDown, ChevronRight, Database, Users, MessageSquare, Settings } from 'lucide-react';
import { useSchema } from '../../context/SchemaContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { schema, loading } = useSchema();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <img src="/logo.png" alt="Food Doctor" className="h-8 w-8 mr-3 rounded-lg" />
        <span className="font-bold text-lg text-text-primary tracking-tight">Food Doctor</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Main Menu
        </p>
        
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`
          }
        >
          <LayoutDashboard className="mr-3 h-5 w-5" strokeWidth={2} />
          Dashboard
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`
          }
        >
          <Users className="mr-3 h-5 w-5" strokeWidth={2} />
          User Management
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`
          }
        >
          <MessageSquare className="mr-3 h-5 w-5" strokeWidth={2} />
          Support / Feedback
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-text-secondary hover:bg-background hover:text-text-primary'
            }`
          }
        >
          <Settings className="mr-3 h-5 w-5" strokeWidth={2} />
          Settings
        </NavLink>

        <div className="pt-4 mt-4 border-t border-border">
          <p className="px-2 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Dynamic Models
          </p>
        </div>

        {loading ? (
          <div className="px-3 py-4 text-xs text-text-secondary text-center">Loading modules...</div>
        ) : schema ? (
          Object.entries(schema).map(([appLabel, appData]: [string, any]) => (
            <div key={appLabel} className="pt-2">
              <button
                onClick={() => toggleMenu(appLabel)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-background hover:text-text-primary transition-all duration-200"
              >
                <div className="flex items-center uppercase text-xs tracking-wider">
                  <Database className="mr-3 h-4 w-4" strokeWidth={2} />
                  {appData.app_name}
                </div>
                {openMenus[appLabel] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {openMenus[appLabel] && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  {appData.models.map((model: any) => (
                    <NavLink
                      key={model.model_name}
                      to={`/admin/${appLabel}/${model.model_name}`}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-text-secondary hover:bg-background hover:text-text-primary'
                        }`
                      }
                    >
                      {model.verbose_name_plural}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : null}
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
