import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatPrice, formatDate } from '../utils/format';
import { Wrench, Calendar, User, Phone, DollarSign, ArrowLeft, ArrowRight, Trash2, FileText, Edit, Search } from 'lucide-react';

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

  // Edit details states
  const [isEditing, setIsEditing] = useState(false);
  const [editDeviceType, setEditDeviceType] = useState('Mobile');
  const [editDeviceBrand, setEditDeviceBrand] = useState('');
  const [editDeviceModel, setEditDeviceModel] = useState('');
  const [editEstimatedCost, setEditEstimatedCost] = useState('');
  const [editIssue, setEditIssue] = useState('');

  // Customer search state
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
      const activeShopId = typeof activeShop === 'object' ? activeShop?._id : activeShop;
      
      const shopStaff = allUsers.filter(u => {
        const uShopId = typeof u.shop === 'object' ? u.shop?._id : u.shop;
        return uShopId === activeShopId && u.role !== 'superAdmin';
      });

      // Include active user if not present but belongs to this shop
      if (user && user.role !== 'superAdmin') {
        const userShopId = typeof user.shop === 'object' ? user.shop?._id : user.shop;
        if (userShopId === activeShopId && !shopStaff.some(s => s._id === user._id)) {
          shopStaff.push({
            _id: user._id,
            name: user.name,
            role: user.role,
            shop: userShopId
          });
        }
      }

      setStaffUsers(shopStaff);
    } catch (err) {
      console.error('Failed to load repair detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, activeShop, user]);

  // Search customer debouncer
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setCustomers([]);
      return;
    }
    const searchCustomers = async () => {
      try {
        const res = await api.customers.list(searchQuery);
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to search customers', err);
      }
    };
    const delayDebounce = setTimeout(searchCustomers, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const startEditing = () => {
    if (!repair) return;
    setEditDeviceType(repair.deviceType || 'Mobile');
    setEditDeviceBrand(repair.deviceBrand || '');
    setEditDeviceModel(repair.deviceModel || '');
    setEditEstimatedCost(repair.estimatedCost || 0);
    setEditIssue(repair.issue || '');
    setSelectedCustomer(repair.customer || null);
    setSearchQuery('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select or link a valid customer profile.');
      return;
    }
    setIsSaving(true);
    try {
      const updatedFields = {
        customer: {
          _id: selectedCustomer._id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone
        },
        deviceType: editDeviceType,
        deviceBrand: editDeviceBrand,
        deviceModel: editDeviceModel,
        estimatedCost: Number(editEstimatedCost || 0),
        issue: editIssue,
      };
      const res = await api.repairs.update(id, updatedFields);
      setRepair(res.data);
      setIsEditing(false);
      alert('Repair ticket details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update repair ticket details');
    } finally {
      setIsSaving(false);
    }
  };

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
        
        <div className="flex items-center space-x-3">
          {!isEditing && (
            <Button
              onClick={startEditing}
              variant="secondary"
              className="flex items-center space-x-2 text-xs py-1.5 px-3 bg-white/5 border border-border text-slate-300 hover:text-white hover:bg-white/10"
            >
              <Edit size={14} />
              <span>Edit Details</span>
            </Button>
          )}

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
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="space-y-4 relative z-20">
            {isEditing ? (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h3 className="text-lg font-bold text-white font-heading flex items-center">
                    <Wrench size={18} className="mr-2 text-primary" /> Edit Repair Details
                  </h3>
                  <span className="text-xs font-bold text-primary font-mono">{repair.repairId}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Device Type"
                    type="select"
                    value={editDeviceType}
                    onChange={(e) => setEditDeviceType(e.target.value)}
                    options={[
                      { value: 'Mobile', label: 'Mobile Phone' },
                      { value: 'Tablet', label: 'Tablet / iPad' },
                      { value: 'Laptop', label: 'Laptop / MacBook' },
                      { value: 'Other', label: 'Other Smart Appliance' }
                    ]}
                  />
                  <Input
                    label="Estimated Cost (₹)"
                    type="number"
                    value={editEstimatedCost}
                    onChange={(e) => setEditEstimatedCost(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Brand Manufacturer"
                    value={editDeviceBrand}
                    onChange={(e) => setEditDeviceBrand(e.target.value)}
                    required
                  />
                  <Input
                    label="Device Model"
                    value={editDeviceModel}
                    onChange={(e) => setEditDeviceModel(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Reported Issue / Diagnostic Symptoms"
                  type="textarea"
                  value={editIssue}
                  onChange={(e) => setEditIssue(e.target.value)}
                  required
                />

                {/* Customer Account linkage */}
                <div className="space-y-2 border-t border-border pt-4">
                  <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider">
                    Customer Account (CRM Link)
                  </label>
                  
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/30 rounded-xl border border-border">
                      <div>
                        <p className="text-sm font-bold text-white">{selectedCustomer.name}</p>
                        <p className="text-xs text-muted mt-1">Tel: {selectedCustomer.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="glass"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-xs py-1.5 px-3 bg-status-rose/10 border border-status-rose/20 text-status-rose hover:bg-status-rose/20"
                      >
                        Change Customer
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Search size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search CRM by customer name or phone..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(true);
                        }}
                        className="glass-input w-full !pl-10"
                      />

                      {showDropdown && searchQuery.trim() !== '' && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-border rounded-xl shadow-glass-md max-h-60 overflow-y-auto custom-scrollbar">
                          {customers.map((c) => (
                            <div
                              key={c._id}
                              onClick={() => {
                                setSelectedCustomer({
                                  _id: c._id,
                                  name: c.name,
                                  phone: c.phone
                                });
                                setShowDropdown(false);
                                setSearchQuery('');
                              }}
                              className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-all border-b border-border/40"
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{c.name}</p>
                                <p className="text-xs text-muted">Tel: {c.phone}</p>
                              </div>
                              <span className="text-xs text-primary font-semibold">Select</span>
                            </div>
                          ))}
                          {customers.length === 0 && (
                            <div className="px-4 py-3 text-xs text-muted italic">
                              No customer accounts match your search.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button type="button" variant="glass" onClick={cancelEditing} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSaving}>
                    Save Details
                  </Button>
                </div>
              </form>
            ) : (
              <>
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
                    {repair.issue}
                  </p>
                </div>
              </>
            )}
          </GlassCard>

          {/* Diagnostic logs */}
          <GlassCard className="space-y-4 relative z-10">
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
