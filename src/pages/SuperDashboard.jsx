import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Store, Plus, Search, MapPin, Phone, Mail, ChevronRight, UserPlus } from 'lucide-react';

const SuperDashboard = () => {
  const { user, refreshShops } = useAuth();
  const navigate = useNavigate();
  const [shopsList, setShopsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const res = await api.shops.list();
      setShopsList(res.data);
    } catch (err) {
      console.error('Failed to load global tenant shops list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const filteredShops = shopsList.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shop.ownerName && shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Tenant Shops Directory
          </h2>
          <p className="text-muted text-sm mt-1">
            Global control terminal to activate franchises and register administrators
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/super/users/new')} variant="glass" className="flex items-center space-x-1.5 text-xs py-2">
            <UserPlus size={16} />
            <span>Create User Account</span>
          </Button>
          <Button onClick={() => navigate('/super/shops/new')} variant="primary" className="flex items-center space-x-1.5 text-xs py-2">
            <Plus size={16} />
            <span>Register New Shop</span>
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search shops by name or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full pl-10"
        />
      </div>

      {/* Grid of registered shops */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <GlassCard
              key={shop._id}
              hoverGlow
              onClick={() => navigate(`/super/shops/${shop._id}`)}
              className={`border-white/5 relative overflow-hidden flex flex-col justify-between cursor-pointer transition-all ${
                !shop.isActive ? 'border-status-rose/20 bg-status-rose/[0.01]' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Store size={20} />
                    </div>
                    <h4 className="text-base font-bold text-white font-heading truncate max-w-[150px]">
                      {shop.name}
                    </h4>
                  </div>
                  
                  <Badge status={shop.isActive ? 'ready' : 'cancelled'}>
                    {shop.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin size={12} className="text-muted shrink-0" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={12} className="text-muted shrink-0" />
                    <span>{shop.phone}</span>
                  </div>
                  {shop.email && (
                    <div className="flex items-center space-x-2">
                      <Mail size={12} className="text-muted shrink-0" />
                      <span className="truncate">{shop.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Owner Profile</span>
                  <p className="text-white font-semibold mt-0.5">{shop.ownerName || 'Not specified'}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/super/shops/${shop._id}`);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 border border-border text-muted hover:text-white transition-all hover:bg-white/10"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </GlassCard>
          ))}

          {filteredShops.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted font-medium bg-slate-900/10 border border-dashed border-border rounded-2xl">
              No registered tenant franchise shops matching search keywords.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperDashboard;
