import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Wrench, Plus, Search, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/format';

const TABS = [
  { id: 'all', name: 'All' },
  { id: 'received', name: 'Received' },
  { id: 'diagnosing', name: 'Diagnosing' },
  { id: 'repairing', name: 'Repairing' },
  { id: 'ready', name: 'Ready' },
  { id: 'delivered', name: 'Delivered' },
  { id: 'cancelled', name: 'Cancelled' }
];

const Repairs = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadRepairs = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      const res = await api.repairs.list(params);
      setRepairs(res.data);
    } catch (err) {
      console.error('Failed to load repairs board', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadRepairs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [user, activeShop, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">Repairs Tracker</h2>
          <p className="text-muted text-sm mt-1">
            Browse registered device repairs, filter status stages, and manage tickets
          </p>
        </div>
        <Button onClick={() => navigate('/repairs/new')} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>New Repair Ticket</span>
        </Button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search ID, brand, model or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full !pl-10"
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

      {/* List / Table */}
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
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-900/30 text-xs font-bold text-muted uppercase tracking-wider font-heading">
                  <th className="px-6 py-4">Repair ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Device Details</th>
                  <th className="px-6 py-4">Estimated Cost</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {repairs.map((rep) => (
                  <tr
                    key={rep._id}
                    onClick={() => navigate(`/repairs/${rep._id}`)}
                    className="hover:bg-white/5 cursor-pointer transition-all"
                  >
                    {/* Ticket ID */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-primary">
                      {rep.repairId}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{rep.customer?.name}</span>
                        <span className="text-xs text-muted mt-0.5">{rep.customer?.phone}</span>
                      </div>
                    </td>

                    {/* Device Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {rep.deviceBrand} {rep.deviceModel}
                        </span>
                        <span className="text-xs text-muted mt-0.5">
                          {rep.deviceType} | {rep.issue ? (rep.issue.substring(0, 40) + (rep.issue.length > 40 ? '...' : '')) : ''}
                        </span>
                      </div>
                    </td>

                    {/* Cost */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-status-emerald">
                      {formatPrice(rep.estimatedCost)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {formatDate(rep.createdAt)}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge status={rep.status}>{rep.status}</Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/repairs/${rep._id}`);
                        }}
                        className="p-2 rounded-lg bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {repairs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted italic">
                      No repairs matching selected filters were located.
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

export default Repairs;
