import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Search, Plus, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/format';

const TABS = [
  { id: 'all', name: 'All Invoices' },
  { id: 'paid', name: 'Paid' },
  { id: 'unpaid', name: 'Unpaid' }
];

const Invoices = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoices = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      const params = {};
      if (activeTab === 'paid') {
        params.isPaid = 'true';
      } else if (activeTab === 'unpaid') {
        params.isPaid = 'false';
      }
      const res = await api.invoices.list(params);
      
      // Sort by invoiceNumber descending
      const sorted = res.data.sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber));
      
      // Filter search client-side
      const filtered = sorted.filter(inv => {
        const q = searchTerm.toLowerCase();
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer?.name.toLowerCase().includes(q) ||
          inv.customer?.phone.includes(q) ||
          (inv.repair?.repairId && inv.repair.repairId.toLowerCase().includes(q))
        );
      });

      setInvoices(filtered);
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadInvoices();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, activeShop, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Billing & Invoices
          </h2>
          <p className="text-muted text-sm mt-1">
            Manage transactions, billing receipts, and payments
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create New Invoice</span>
        </Button>
      </div>

      {/* Toolbar filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search invoice, customer or ticket..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-10"
          />
        </div>

        {/* Status Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-4 rounded-xl text-xs font-semibold font-heading transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Table listing */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-900/30 text-xs font-bold text-muted uppercase tracking-wider font-heading">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Repair ID</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-center">Payment Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {invoices.map((inv) => (
                  <tr
                    key={inv._id}
                    onClick={() => navigate(`/invoices/${inv._id}`)}
                    className="hover:bg-white/5 cursor-pointer transition-all"
                  >
                    {/* Invoice ID */}
                    <td className="px-6 py-4 font-mono font-bold text-primary">
                      {inv.invoiceNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{inv.customer?.name}</span>
                        <span className="text-xs text-muted">{inv.customer?.phone}</span>
                      </div>
                    </td>

                    {/* Repair ID Link */}
                    <td className="px-6 py-4 font-semibold text-slate-300 font-mono">
                      {inv.repair?.repairId || inv.repairId || <span className="text-muted italic text-xs">Unlinked</span>}
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-bold text-status-emerald">
                      {formatPrice(inv.totalAmount)}
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4 uppercase font-semibold text-xs text-muted">
                      {inv.paymentMode}
                    </td>

                    {/* Paid status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge status={inv.isPaid ? 'ready' : 'received'}>
                        {inv.isPaid ? (
                          <span className="flex items-center"><CheckCircle size={10} className="mr-1 shrink-0" /> Paid</span>
                        ) : (
                          <span className="flex items-center"><Clock size={10} className="mr-1 shrink-0" /> Outstanding</span>
                        )}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${inv._id}`);
                        }}
                        className="p-2 rounded-lg bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted italic">
                      No invoices located.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
