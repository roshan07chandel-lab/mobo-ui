import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Store, Plus, Search, MapPin, Phone, Mail, ToggleLeft, ToggleRight, ShieldAlert, TrendingUp } from 'lucide-react';

const Shops = () => {
  const { user, refreshShops } = useAuth();
  const [shopsList, setShopsList] = useState([]);
  const [repairsList, setRepairsList] = useState([]);
  const [invoicesList, setInvoicesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newShop, setNewShop] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const shopsRes = await api.shops.list();
      setShopsList(shopsRes.data);

      // Fetch global data blocks to calculate aggregate metrics per tenant
      const rep = JSON.parse(localStorage.getItem('mobocare_repairs') || '[]');
      const inv = JSON.parse(localStorage.getItem('mobocare_invoices') || '[]');
      setRepairsList(rep);
      setInvoicesList(inv);
    } catch (err) {
      console.error('Failed to load global tenant configurations', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegisterShop = async (e) => {
    e.preventDefault();
    try {
      await api.shops.create(newShop);
      setIsAddModalOpen(false);
      setNewShop({ name: '', address: '', phone: '', email: '' });
      loadData();
      refreshShops(); // Refresh context list
    } catch (err) {
      alert('Failed to register new tenant shop');
    }
  };

  const handleToggleStatus = async (shopId, currentStatus) => {
    try {
      await api.shops.update(shopId, { isActive: !currentStatus });
      loadData();
      refreshShops();
    } catch (err) {
      alert('Failed to update shop status');
    }
  };

  const getShopStats = (shopId) => {
    const shopRepairs = repairsList.filter(r => r.shop === shopId);
    const shopInvoices = invoicesList.filter(i => i.shop === shopId && i.isPaid);
    const totalRevenue = shopInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

    return {
      repairsCount: shopRepairs.length,
      revenue: totalRevenue
    };
  };

  const filteredShops = shopsList.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            Global management portal for shops, database status and licensing control
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>Register New Shop</span>
        </Button>
      </div>

      {/* Toolbar filters */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Filter shops by business name..."
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
          {filteredShops.map((shop) => {
            const stats = getShopStats(shop._id);
            return (
              <GlassCard
                key={shop._id}
                hoverGlow
                className={`border-white/5 relative overflow-hidden flex flex-col justify-between ${
                  !shop.isActive ? 'border-status-rose/20 bg-status-rose/[0.01]' : ''
                }`}
              >
                {/* Shop general details */}
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
                    
                    <button
                      onClick={() => handleToggleStatus(shop._id, shop.isActive)}
                      className="focus:outline-none"
                      title={shop.isActive ? 'Suspend Shop' : 'Activate Shop'}
                    >
                      {shop.isActive ? (
                        <Badge status="ready" className="cursor-pointer">Active</Badge>
                      ) : (
                        <Badge status="cancelled" className="cursor-pointer">Suspended</Badge>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 mb-6 border-b border-border pb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin size={12} className="text-muted shrink-0" />
                      <span className="truncate">{shop.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={12} className="text-muted shrink-0" />
                      <span>{shop.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail size={12} className="text-muted shrink-0" />
                      <span className="truncate">{shop.email}</span>
                    </div>
                  </div>
                </div>

                {/* Aggregate stats per shop */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/30 p-3 rounded-xl border border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] text-muted uppercase font-heading font-semibold">Repairs Completed</span>
                      <p className="text-base font-extrabold text-white mt-1">{stats.repairsCount}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted uppercase font-heading font-semibold">Total Sales Revenue</span>
                      <p className="text-base font-extrabold text-status-emerald mt-1">
                        ${stats.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Toggle actions */}
                  <button
                    onClick={() => handleToggleStatus(shop._id, shop.isActive)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      shop.isActive
                        ? 'bg-status-rose/10 border-status-rose/20 text-status-rose hover:bg-status-rose/20'
                        : 'bg-status-emerald/10 border-status-emerald/20 text-status-emerald hover:bg-status-emerald/20'
                    }`}
                  >
                    {shop.isActive ? (
                      <>
                        <ShieldAlert size={14} />
                        <span>Suspend Shop Operations</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp size={14} />
                        <span>Re-Activate Operations</span>
                      </>
                    )}
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Shop Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Shop / Tenant Franchise"
        size="sm"
      >
        <form onSubmit={handleRegisterShop} className="space-y-4">
          <Input
            label="Shop Name"
            placeholder="e.g. iRepair Pro Downtown"
            value={newShop.name}
            onChange={(e) => setNewShop(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Street Address"
            placeholder="e.g. 101 Broadway Ave, New York"
            value={newShop.address}
            onChange={(e) => setNewShop(prev => ({ ...prev, address: e.target.value }))}
            required
          />
          <Input
            label="Contact Phone"
            placeholder="e.g. +1 555-0199"
            value={newShop.phone}
            onChange={(e) => setNewShop(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
          <Input
            label="Contact Email"
            type="email"
            placeholder="e.g. downtown@irepairpro.com"
            value={newShop.email}
            onChange={(e) => setNewShop(prev => ({ ...prev, email: e.target.value }))}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="glass" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Tenant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shops;
