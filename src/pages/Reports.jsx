import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { formatPrice } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, Wrench, FileText, Users, AlertTriangle, Download, RefreshCw } from 'lucide-react';

const COLORS = ['#38bdf8', '#c084fc', '#fb923c', '#4ade80', '#94a3b8', '#f87171'];
const PIE_COLORS = ['#4ade80', '#f87171'];

const Reports = () => {
  const { user, activeShop } = useAuth();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const getStartOfYearString = () => {
    return `${new Date().getFullYear()}-01-01`;
  };

  const [from, setFrom] = useState(getStartOfYearString());
  const [to, setTo] = useState(getTodayString());

  const loadReport = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      const res = await api.reports.summary({ from, to });
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load reports summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [user, activeShop]);

  const handleFetchReport = (e) => {
    e.preventDefault();
    loadReport();
  };

  if (isLoading || !summary) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Map repairs by status
  const repairStatusData = Object.entries(summary.repairs?.byStatus || {}).map(([status, count]) => ({
    name: status.toUpperCase(),
    tickets: count
  }));

  // Invoice Paid vs Unpaid Pie Chart Data
  const invoiceData = [
    { name: 'Paid', value: summary.invoices?.paid || 0 },
    { name: 'Unpaid', value: summary.invoices?.unpaid || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Shop Reports & Audits
          </h2>
          <p className="text-muted text-sm mt-1">
            Analyze business health, revenue cycles, and ticket lifecycle metrics
          </p>
        </div>
      </div>

      {/* Date filter toolbar */}
      <GlassCard className="!p-4 border-border/80">
        <form onSubmit={handleFetchReport} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="mb-4 sm:w-auto w-full">
            <Button type="submit" variant="primary" className="flex items-center space-x-1.5 h-[46px] w-full justify-center">
              <RefreshCw size={16} />
              <span>Generate Report</span>
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Key Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Repairs */}
        <GlassCard hoverGlow className="flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-status-violet/5 rounded-bl-full" />
          <div>
            <span className="text-[10px] text-muted uppercase font-heading font-semibold">Total Repairs Logs</span>
            <p className="text-3xl font-extrabold text-status-violet mt-1.5 font-heading">
              {summary.repairs?.total || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-violet/10 border border-status-violet/20 flex items-center justify-center text-status-violet">
            <Wrench size={18} />
          </div>
        </GlassCard>

        {/* Revenue */}
        <GlassCard hoverGlow className="flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-status-emerald/5 rounded-bl-full" />
          <div>
            <span className="text-[10px] text-muted uppercase font-heading font-semibold">Billed Revenue</span>
            <p className="text-3xl font-extrabold text-status-emerald mt-1.5 font-heading">
              {formatPrice(summary.invoices?.revenue || 0)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-emerald/10 border border-status-emerald/20 flex items-center justify-center text-status-emerald">
            <FileText size={18} />
          </div>
        </GlassCard>

        {/* Customers count */}
        <GlassCard hoverGlow className="flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-status-amber/5 rounded-bl-full" />
          <div>
            <span className="text-[10px] text-muted uppercase font-heading font-semibold">Registered Clients</span>
            <p className="text-3xl font-extrabold text-status-amber mt-1.5 font-heading">
              {summary.customers?.total || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-amber/10 border border-status-amber/20 flex items-center justify-center text-status-amber">
            <Users size={18} />
          </div>
        </GlassCard>

        {/* Low stock indicators */}
        <GlassCard hoverGlow className="flex justify-between items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-status-rose/5 rounded-bl-full" />
          <div>
            <span className="text-[10px] text-muted uppercase font-heading font-semibold">Low Stock Warnings</span>
            <p className={`text-3xl font-extrabold mt-1.5 font-heading ${
              summary.inventory?.lowStock > 0 ? 'text-status-rose' : 'text-white'
            }`}>
              {summary.inventory?.lowStock || 0}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            summary.inventory?.lowStock > 0 ? 'bg-status-rose/10 border border-status-rose/20 text-status-rose' : 'bg-slate-800 text-muted'
          }`}>
            <AlertTriangle size={18} />
          </div>
        </GlassCard>
      </div>

      {/* Recharts Graphical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repairs status distribution */}
        <GlassCard className="lg:col-span-2 flex flex-col h-[400px]">
          <h4 className="text-lg font-bold font-heading text-white mb-6">Repair Status Lifecycle Analysis</h4>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                    borderRadius: '12px',
                    color: 'hsl(222, 47%, 11%)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Bar dataKey="tickets" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]}>
                  {repairStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Invoice Paid vs Unpaid shares */}
        <GlassCard className="flex flex-col h-[400px]">
          <h4 className="text-lg font-bold font-heading text-white mb-6">Payment Collection Rate</h4>
          <div className="flex-1 flex flex-col justify-center items-center">
            {invoiceData[0].value === 0 && invoiceData[1].value === 0 ? (
              <div className="text-xs text-muted italic">No invoices recorded in this range.</div>
            ) : (
              <div className="w-full h-[220px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={invoiceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {invoiceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: 'rgba(15, 23, 42, 0.08)',
                        borderRadius: '12px',
                        color: 'hsl(222, 47%, 11%)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="w-full text-center text-xs font-semibold text-slate-300 mt-4">
              Paid Billings Rate: {((summary.invoices?.paid / (summary.invoices?.total || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Reports;
