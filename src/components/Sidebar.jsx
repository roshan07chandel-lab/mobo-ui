import React, { useState, useEffect, useRef } from 'react';
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
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isCollapsed && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed]);

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
      ref={sidebarRef}
      className={`relative h-screen bg-slate-950 border-r border-border flex flex-col justify-between transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div>
        <div className="flex items-center px-4 py-6 border-b border-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 shadow-glass-sm">
            <Smartphone className="text-white" size={22} />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <h1 className="text-lg font-bold font-heading tracking-wide text-slate-50">
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
                      ? 'text-white bg-slate-50 font-semibold shadow-glass-sm'
                      : 'text-muted hover:text-slate-50 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span className="ml-3 font-heading text-sm">{item.label}</span>}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-50 border border-border text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-glass-sm z-50">
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
          className="w-full flex items-center justify-center py-2.5 mb-2 rounded-xl text-muted hover:text-slate-50 hover:bg-slate-800/60 transition-all"
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
            <div className="absolute left-full ml-4 px-2 py-1 rounded bg-slate-50 border border-border text-status-rose text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-glass-sm z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
