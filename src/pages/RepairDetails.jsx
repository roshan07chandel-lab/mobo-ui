import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatPrice, formatDate } from '../utils/format';
import { Wrench, Calendar, User, Phone, DollarSign, ArrowLeft, ArrowRight, Trash2, FileText } from 'lucide-react';

const STATUSES = ['received', 'diagnosing', 'repairing', 'ready', 'delivered', 'cancelled'];

const RepairDetails = () => {
  const { id } = useParams();
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();

  const [repair, setRepair] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [repairRes, invoiceRes] = await Promise.all([
        api.repairs.get(id),
        api.invoices.list()
      ]);

      setRepair(repairRes.data);
      setInvoices(invoiceRes.data);

      const allUsers = JSON.parse(localStorage.getItem('mobocare_users') || '[]');
      const shopStaff = allUsers.filter(u => u.shop === activeShop?._id && u.role !== 'superAdmin');
      setStaffUsers(shopStaff);
    } catch (err) {
      console.error('Failed to load repair detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, activeShop]);

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    setIsSaving(true);
    try {
      await api.repairs.update(id, { status: nextStatus });
      setRepair(prev => ({ ...prev, status: nextStatus }));
      // Reload list of invoices just in case status change triggered any invoice side effects
      const invoiceRes = await api.invoices.list();
      setInvoices(invoiceRes.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const userId = e.target.value;
    setIsSaving(true);
    try {
      const selectedStaff = staffUsers.find(s => s._id === userId);
      const assignedTo = selectedStaff ? { _id: selectedStaff._id, name: selectedStaff.name } : null;
      await api.repairs.update(id, { assignedTo });
      setRepair(prev => ({ ...prev, assignedTo }));
    } catch (err) {
      alert('Failed to reassign technician');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotesUpdate = async (e) => {
    const nextNotes = e.target.value;
    setRepair(prev => ({ ...prev, notes: nextNotes }));
  };

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      await api.repairs.update(id, { notes: repair.notes });
      alert('Diagnostic notes saved successfully!');
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this repair ticket permanently?')) return;
    try {
      await api.repairs.delete(id);
      navigate('/repairs');
    } catch (err) {
      alert('Failed to delete repair ticket');
    }
  };

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

  if (!repair) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-base font-semibold">Repair ticket not found.</p>
        <Button onClick={() => navigate('/repairs')} variant="glass" className="mt-4">
          Back to Repairs
        </Button>
      </div>
    );
  }

  // Check if an invoice has already been created for this repair
  const linkedInvoice = invoices.find(inv => {
    const repId = inv.repair?._id || inv.repair;
    return repId === id;
  });

  const invoiceExists = !!linkedInvoice;
  const isInvoiceEligible = ['ready', 'delivered'].includes(repair.status);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/repairs')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>Back to Repairs</span>
        </button>
        
        {isAdmin && (
          <Button
            onClick={handleDelete}
            variant="danger"
            className="flex items-center space-x-2 text-xs py-1.5 px-3 bg-status-rose/10 border border-status-rose/20 text-status-rose hover:bg-status-rose/20"
          >
            <Trash2 size={14} />
            <span>Delete Ticket</span>
          </Button>
        )}
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <span className="text-xs font-bold text-primary font-mono">{repair.repairId}</span>
                <h3 className="text-2xl font-bold text-white font-heading mt-0.5">
                  {repair.deviceBrand} {repair.deviceModel}
                </h3>
                <p className="text-xs text-muted mt-0.5">Category: {repair.deviceType}</p>
              </div>
              <Badge status={repair.status} pulsing={['repairing', 'diagnosing'].includes(repair.status)}>
                {repair.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Registered Date</span>
                  <p className="text-sm font-semibold text-white mt-0.5 flex items-center">
                    <Calendar size={14} className="mr-1.5 text-muted" /> {formatDate(repair.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Estimated Billing</span>
                  <p className="text-sm font-bold text-status-emerald mt-0.5 flex items-center">
                    <DollarSign size={14} className="mr-1.5 text-muted" /> {formatPrice(repair.estimatedCost)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Customer Account</span>
                  <p className="text-sm font-semibold text-white mt-0.5 flex items-center">
                    <User size={14} className="mr-1.5 text-muted" /> {repair.customer?.name}
                  </p>
                  <p className="text-xs text-muted mt-0.5 flex items-center">
                    <Phone size={12} className="mr-1.5 text-muted" /> {repair.customer?.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-2">
              <span className="text-[10px] text-muted uppercase font-heading font-semibold">Reported Defect</span>
              <p className="text-sm text-slate-200 bg-slate-950/20 p-3.5 rounded-xl border border-border italic leading-relaxed">
                "{repair.issue}"
              </p>
            </div>
          </GlassCard>

          {/* Diagnostic logs */}
          <GlassCard className="space-y-4">
            <h4 className="text-base font-bold text-white font-heading">Diagnostic Progress Logs</h4>
            <textarea
              value={repair.notes || ''}
              onChange={handleNotesUpdate}
              placeholder="Describe what parts are needed or current diagnostic status..."
              className="glass-input w-full h-32 text-sm font-body custom-scrollbar resize-none"
            />
            <div className="flex justify-end">
              <Button onClick={saveNotes} variant="secondary" className="text-xs py-2" disabled={isSaving}>
                Save Workspace Logs
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Operational Sidebar Widgets */}
        <div className="space-y-6">
          {/* Status Transitions */}
          <GlassCard className="space-y-4">
            <h4 className="text-sm font-bold text-muted font-heading uppercase tracking-wider border-b border-border pb-2">
              Workflow Control
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider mb-1.5">
                  Update Stage
                </label>
                <select
                  value={repair.status}
                  onChange={handleStatusChange}
                  disabled={isSaving}
                  className="bg-slate-900 border border-border rounded-xl text-white font-medium w-full px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider mb-1.5">
                  Allocate Technician
                </label>
                <select
                  value={repair.assignedTo?._id || ''}
                  onChange={handleAssigneeChange}
                  disabled={isSaving}
                  className="bg-slate-900 border border-border rounded-xl text-white font-medium w-full px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Unassigned (Queue)</option>
                  {staffUsers.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Invoice action */}
          <GlassCard className="space-y-4">
            <h4 className="text-sm font-bold text-muted font-heading uppercase tracking-wider border-b border-border pb-2">
              Billing Status
            </h4>

            {invoiceExists ? (
              <div className="space-y-3">
                <div className="flex items-center text-status-emerald space-x-2 text-xs font-semibold">
                  <Badge status={linkedInvoice.isPaid ? 'ready' : 'received'}>
                    {linkedInvoice.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                  <span className="text-white font-mono font-bold">Ref: {linkedInvoice.invoiceNumber}</span>
                </div>
                <Button
                  onClick={() => navigate(`/invoices/${linkedInvoice._id}`)}
                  variant="glass"
                  className="w-full flex items-center justify-center space-x-2 text-xs"
                >
                  <FileText size={14} />
                  <span>Inspect Invoice Details</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted leading-relaxed">
                  No billing invoice has been generated for this repair ticket yet.
                </p>
                {isInvoiceEligible ? (
                  <Button
                    onClick={() => navigate(`/invoices/new?repairId=${repair._id}`)}
                    variant="primary"
                    className="w-full flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>Generate Invoice</span>
                    <ArrowRight size={14} />
                  </Button>
                ) : (
                  <p className="text-[11px] text-status-amber font-semibold">
                    ⚠️ Stage must be READY or DELIVERED to invoice.
                  </p>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default RepairDetails;
