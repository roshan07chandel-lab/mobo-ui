import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { formatPrice, formatDate } from '../utils/format';
import {
  Wrench,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  PackageCheck,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [readyCount, setReadyCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [reports, setReports] = useState(null); // admin only
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      // Fetch shop-scoped items that both admin and staff can access
      const [pendingRes, readyRes, lowStockRes, repairsRes] = await Promise.all([
        api.repairs.list({ status: 'received' }),
        api.repairs.list({ status: 'ready' }),
        api.inventory.list({ lowStock: true }),
        api.repairs.list()
      ]);

      setPendingCount(pendingRes.data.length);
      setReadyCount(readyRes.data.length);
      setLowStockCount(lowStockRes.data.length);
      setLowStockItems(lowStockRes.data);
      
      // Sort repairs by createdAt descending and take last 5
      const sortedRepairs = repairsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentRepairs(sortedRepairs.slice(0, 5));

      if (user.role === 'admin') {
        const dailyRes = await api.reports.daily();
        setReports(dailyRes.data);
        setTodayRevenue(dailyRes.data?.revenue || dailyRes.data?.totalRevenue || 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, activeShop]);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Pie chart colors
  const PIE_COLORS = [
    'hsl(250, 89%, 65%)', // Vibrant Indigo
    'hsl(280, 80%, 60%)', // Electric Violet
    'hsl(38, 92%, 50%)',  // Amber
    'hsl(142, 71%, 45%)',  // Emerald
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Control Dashboard
          </h2>
          <p className="text-muted text-sm mt-1">
            Analyzing statistics for <span className="text-white font-medium">{activeShop?.name || 'Mobo-Care global'}</span>
          </p>
        </div>
        
        {/* Date scope indicator */}
        <Badge status="ready" className="py-1.5 px-4 font-heading font-medium tracking-wide">
          Terminal Status: Online
        </Badge>
      </div>

      {/* Grid of Key Analytics Metric Cards */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        {/* Card 1: Pending Repairs */}
        <GlassCard hoverGlow className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
                Pending Repairs
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-heading">
                {pendingCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Wrench size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-status-amber">
            <Clock size={14} className="mr-1" />
            <span>Repairs received and awaiting queue</span>
          </div>
        </GlassCard>

        {/* Card 2: Ready for Pickup */}
        <GlassCard hoverGlow className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-emerald/5 rounded-bl-full group-hover:bg-status-emerald/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
                Ready for Pickup
              </p>
              <h3 className="text-3xl font-extrabold text-status-emerald mt-2 font-heading">
                {readyCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-status-emerald/10 border border-status-emerald/20 flex items-center justify-center text-status-emerald">
              <PackageCheck size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-status-emerald">
            <TrendingUp size={14} className="mr-1" />
            <span>Completed repairs awaiting delivery</span>
          </div>
        </GlassCard>

        {/* Card 3: Today's Revenue (Admin only) */}
        {isAdmin && (
          <GlassCard hoverGlow className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-status-emerald/5 rounded-bl-full group-hover:bg-status-emerald/10 transition-all duration-300" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
                  Today's Revenue
                </p>
                <h3 className="text-3xl font-extrabold text-status-emerald mt-2 font-heading">
                  {formatPrice(todayRevenue)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-emerald/10 border border-status-emerald/20 flex items-center justify-center text-status-emerald">
                <DollarSign size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-status-emerald">
              <TrendingUp size={14} className="mr-1" />
              <span>Payments completed today</span>
            </div>
          </GlassCard>
        )}

        {/* Card 4: Low Stock Alerts */}
        <GlassCard
          hoverGlow
          className={`relative overflow-hidden group ${
            lowStockCount > 0 ? 'border-status-rose/30 bg-status-rose/5' : ''
          }`}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-rose/5 rounded-bl-full group-hover:bg-status-rose/10 transition-all duration-300" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted font-heading uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <h3 className={`text-3xl font-extrabold mt-2 font-heading ${
                lowStockCount > 0 ? 'text-status-rose' : 'text-white'
              }`}>
                {lowStockCount}
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              lowStockCount > 0 
                ? 'bg-status-rose/20 border border-status-rose/30 text-status-rose' 
                : 'bg-slate-800 text-muted'
            }`}>
              <AlertTriangle size={22} className={lowStockCount > 0 ? 'animate-bounce' : ''} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs">
            {lowStockCount > 0 ? (
              <span className="text-status-rose font-medium pulsing-rose px-2 py-0.5 rounded-md border border-status-rose/20">
                Action required: Stock depleted
              </span>
            ) : (
              <span className="text-status-emerald flex items-center">
                <PackageCheck size={14} className="mr-1" /> All inventory healthy
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Interactive Charts Section (Admin Only) */}
      {isAdmin && reports && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Trend Chart */}
          <GlassCard className="lg:col-span-2 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold font-heading text-white">Daily Revenue Trend</h4>
              <span className="text-xs text-muted flex items-center">
                <span className="w-2 h-2 rounded-full bg-primary mr-1.5" /> Settled Daily Sales
              </span>
            </div>
            <div className="flex-1 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reports.dailyData || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.3)" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted))" />
                  <YAxis stroke="hsl(var(--muted))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'hsla(var(--border), 0.8)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontFamily: 'Inter',
                    }}
                    formatter={(val) => formatPrice(val)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Repair category distribution (Pie Chart) */}
          <GlassCard className="flex flex-col h-[400px]">
            <h4 className="text-lg font-bold font-heading text-white mb-6">Repair Shares</h4>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-full h-[220px] text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reports.categoryData || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(reports.categoryData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderColor: 'hsla(var(--border), 0.8)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Pie Legend */}
              <div className="grid grid-cols-2 gap-4 mt-4 w-full px-4">
                {(reports.categoryData || []).map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-xs">
                    <span
                      className="w-3 h-3 rounded-full mr-2 shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-300 font-medium truncate">{entry.name} ({entry.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Critical Stock Alerts and Recent Repairs grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Repairs List */}
        <GlassCard className="flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h4 className="text-lg font-bold font-heading text-white">Recent Repair Tickets</h4>
            <button
              onClick={() => navigate('/repairs')}
              className="text-xs text-primary hover:text-white flex items-center font-medium font-heading transition-all"
            >
              View All <ChevronRight size={14} className="ml-0.5" />
            </button>
          </div>
          
          <div className="divide-y divide-border/60 flex-1 overflow-y-auto max-h-[350px]">
            {recentRepairs.map((rep) => (
              <div
                key={rep._id}
                onClick={() => navigate(`/repairs/${rep._id}`)}
                className="py-3 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer px-2 rounded-xl transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-primary font-mono">{rep.repairId}</span>
                    <span className="text-xs text-slate-300 font-semibold">{rep.deviceBrand} {rep.deviceModel}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Client: {rep.customer?.name} | {formatDate(rep.createdAt)}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <Badge status={rep.status}>{rep.status}</Badge>
                  <span className="text-xs font-bold text-status-emerald mt-1">{formatPrice(rep.estimatedCost)}</span>
                </div>
              </div>
            ))}

            {recentRepairs.length === 0 && (
              <div className="py-12 text-center text-muted text-sm italic">
                No recent repair tickets logged.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Low Stock Warnings */}
        <GlassCard className="flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h4 className="text-lg font-bold font-heading text-white flex items-center">
              <AlertTriangle className="text-status-rose mr-2 shrink-0 animate-bounce" size={20} />
              Low Stock Warnings
            </h4>
            <Badge status="low-stock">{lowStockItems.length} Alerts</Badge>
          </div>
          
          <div className="divide-y divide-border/60 flex-1 overflow-y-auto max-h-[350px]">
            {lowStockItems.map((item) => (
              <div key={item._id} className="py-3 flex items-center justify-between px-2 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-muted">SKU: {item.sku} | Category: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-status-rose">{item.quantity} in stock</p>
                  <p className="text-xs text-muted">Threshold: {item.lowStockAt}</p>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <div className="py-12 text-center text-muted text-sm italic">
                ✨ All parts stock and accessory volumes are healthy!
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
