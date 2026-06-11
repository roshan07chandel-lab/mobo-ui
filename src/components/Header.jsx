import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bell, Store, User, Search, RefreshCw } from 'lucide-react';
import Badge from './ui/Badge';

const Header = () => {
  const { user, activeShop, shops, selectShop } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const activeShopId = activeShop?._id || (typeof activeShop === 'string' ? activeShop : '');
  const userId = user?._id || '';

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user || user.role === 'superAdmin') return;
      try {
        const res = await api.inventory.list();
        const items = res.data;
        const lowItems = items.filter(item => item.quantity <= item.lowStockAt);
        setLowStockCount(lowItems.length);
      } catch (err) {
        console.error('Failed to load low-stock stats for header', err);
      }
    };

    fetchAlerts();
    
    // Poll every 60 seconds to keep low stock counts fresh
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [userId, activeShopId]);

  if (!user) return null;

  return (
    <header className="h-20 bg-slate-900 border-b border-border px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Shop Selector Context */}
      <div className="flex items-center space-x-3">
        <Store className="text-primary" size={20} />
        {user.role === 'superAdmin' ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-muted font-heading uppercase tracking-wide">Shop Scope:</span>
            <select
              value={activeShop?._id || ''}
              onChange={(e) => {
                const newShopId = e.target.value;
                selectShop(newShopId);
                if (location.pathname.startsWith('/super/shops/')) {
                  const parts = location.pathname.split('/');
                  const lastPart = parts[parts.length - 1];
                  if (lastPart !== 'new') {
                    navigate(`/super/shops/${newShopId}`);
                  }
                }
              }}
              className="bg-slate-950 border border-border rounded-lg text-slate-50 font-medium px-3 py-1 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
            >
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name} {shop.isActive ? '' : '(Suspended)'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-50 font-heading">{activeShop?.name || 'Loading Shop...'}</span>
            <span className="text-[10px] text-muted tracking-wider uppercase font-semibold">{activeShop?.phone}</span>
          </div>
        )}
      </div>

      {/* Action utilities & User context */}
      <div className="flex items-center space-x-6">
        {/* Alerts Center */}
        {user.role !== 'superAdmin' && (
          <button
            onClick={() => navigate('/inventory')}
            className={`relative p-2 rounded-xl border border-border text-muted hover:text-slate-50 hover:bg-slate-800/60 transition-all ${
              lowStockCount > 0 ? 'pulsing-rose !text-status-rose' : ''
            }`}
          >
            <Bell size={18} className={lowStockCount > 0 ? 'animate-bounce' : ''} />
            {lowStockCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-status-rose text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-slate-950 shadow-sm">
                {lowStockCount}
              </span>
            )}
          </button>
        )}

        {/* User profile card */}
        <div className="flex items-center space-x-3 border-l border-border pl-6">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-slate-50 font-heading">{user.name}</span>
            <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">{user.role}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-border flex items-center justify-center text-primary font-bold font-heading">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
