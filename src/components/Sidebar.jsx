import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  FileText,
  Store,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  BarChart3,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role;

  // Build navigation items depending on the user role
  const getNavItems = () => {
    const allItems = [
      {
        path: '/super/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['superAdmin']
      },
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'staff']
      },
      {
        path: '/repairs',
        label: 'Repairs',
        icon: Wrench,
        roles: ['admin', 'staff']
      },
      {
        path: '/inventory',
        label: 'Inventory',
        icon: Package,
        roles: ['admin', 'staff']
      },
      {
        path: '/customers',
        label: 'Customers',
        icon: Users,
        roles: ['admin', 'staff']
      },
      {
        path: '/invoices',
        label: 'Invoices',
        icon: FileText,
        roles: ['admin', 'staff']
      },
      {
        path: '/reports',
        label: 'Reports',
        icon: BarChart3,
        roles: ['admin']
      },
      {
        path: '/staff',
        label: 'Staff Directory',
        icon: UserCheck,
        roles: ['admin']
      },
      {
        path: '/settings',
        label: 'Settings',
        icon: Settings,
        roles: ['superAdmin', 'admin', 'staff']
      }
    ];

    return allItems.filter(item => item.roles.includes(role));
  };

  const navItems = getNavItems();

  return (
    <div
      className={`relative h-screen bg-slate-950/40 border-r border-border backdrop-blur-md flex flex-col justify-between transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div>
        <div className="flex items-center px-4 py-6 border-b border-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary shadow-glow-primary">
            <Smartphone className="text-white" size={22} />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold font-heading tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Mobo-Care
              </h1>
              <p className="text-xs text-muted font-heading uppercase tracking-wider font-semibold">
                {role === 'superAdmin' ? 'Super Admin' : role}
              </p>
            </div>
          )}
        </div>

        {/* Navigation items list */}
        <nav className="mt-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'text-white bg-primary/20 border-l-4 border-primary shadow-[inset_4px_0_12px_rgba(250,89,65,0.05)] font-semibold'
                      : 'text-muted hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="ml-3 font-heading text-sm">{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-900 border border-border text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-glass-sm z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer options */}
      <div className="p-3 border-t border-border">
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2.5 mb-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <div className="flex items-center text-xs"><ChevronLeft size={18} className="mr-2"/>Collapse Sidebar</div>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-xl text-status-rose hover:bg-status-rose/10 transition-all group relative"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="ml-3 font-heading text-sm font-semibold">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-900 border border-border text-status-rose text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-glass-sm z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
