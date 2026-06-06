import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Phone, Mail, MapPin, Wrench, Search, Plus, Trash2 } from 'lucide-react';

const NewRepair = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();

  // Search customer state
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // New customer registration inline fields
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Repair fields
  const [deviceType, setDeviceType] = useState('Mobile');
  const [deviceBrand, setDeviceBrand] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [issue, setIssue] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [notes, setNotes] = useState('');

  const [staffUsers, setStaffUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch staff and customers
  useEffect(() => {
    // Staff list fallback from localStorage seeded users
    const allUsers = JSON.parse(localStorage.getItem('mobocare_users') || '[]');
    const shopStaff = allUsers.filter(u => u.shop === activeShop?._id && u.role !== 'superAdmin');
    setStaffUsers(shopStaff);
  }, [activeShop]);

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

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setIsNewCustomer(false);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleStartNewCustomer = () => {
    setIsNewCustomer(true);
    setSelectedCustomer(null);
    setShowDropdown(false);
    setCustName(searchQuery);
    setCustPhone('');
    setCustEmail('');
    setCustAddress('');
  };

  const handleRemoveSelectedCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer && !isNewCustomer) {
      alert('Please select an existing customer or register a new one.');
      return;
    }

    setIsSaving(true);
    try {
      let customerPayload = null;

      if (isNewCustomer) {
        // First register the new customer
        const customerRes = await api.customers.create({
          name: custName,
          phone: custPhone,
          email: custEmail,
          address: custAddress
        });
        const savedCustomer = customerRes.data;
        customerPayload = {
          _id: savedCustomer._id,
          name: savedCustomer.name,
          phone: savedCustomer.phone
        };
      } else {
        customerPayload = {
          _id: selectedCustomer._id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone
        };
      }

      // Selected staff member details
      const selectedStaff = staffUsers.find(s => s._id === assignedToId);

      const repairPayload = {
        customer: customerPayload,
        deviceType,
        deviceBrand,
        deviceModel,
        issue,
        estimatedCost: Number(estimatedCost || 0),
        assignedTo: selectedStaff ? { _id: selectedStaff._id, name: selectedStaff.name } : null,
        notes
      };

      const repairRes = await api.repairs.create(repairPayload);
      navigate(`/repairs/${repairRes.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit repair ticket');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
          Record New Repair Ticket
        </h2>
        <p className="text-muted text-sm mt-1">
          Register client device issues, diagnostic logs, and dispatch tickets
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Customer Relationship Section */}
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white font-heading border-b border-border pb-2 flex items-center">
            <User size={18} className="mr-2 text-primary" /> Customer Context
          </h3>

          {!selectedCustomer && !isNewCustomer && (
            <div className="relative">
              <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider mb-1.5">
                Search Customer (CRM Lookup)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Type customer name or phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="glass-input w-full pl-10"
                />
              </div>

              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-border rounded-xl shadow-glass-md max-h-60 overflow-y-auto custom-scrollbar">
                  {customers.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleSelectCustomer(c)}
                      className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-all border-b border-border/40"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-xs text-muted">Tel: {c.phone} {c.email ? `| ${c.email}` : ''}</p>
                      </div>
                      <Plus size={16} className="text-primary" />
                    </div>
                  ))}
                  <div
                    onClick={handleStartNewCustomer}
                    className="px-4 py-3 hover:bg-primary/20 bg-primary/10 text-primary cursor-pointer text-sm font-semibold flex items-center space-x-2 transition-all"
                  >
                    <Plus size={16} />
                    <span>Create Customer: "{searchQuery}"</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedCustomer && (
            <div className="flex items-center justify-between p-4 bg-slate-950/30 rounded-xl border border-border">
              <div>
                <p className="text-sm font-bold text-white">{selectedCustomer.name}</p>
                <p className="text-xs text-muted mt-1 flex items-center">
                  <Phone size={12} className="mr-1 shrink-0" /> {selectedCustomer.phone}
                  {selectedCustomer.email && (
                    <>
                      <span className="mx-2">|</span>
                      <Mail size={12} className="mr-1 shrink-0" /> {selectedCustomer.email}
                    </>
                  )}
                </p>
                {selectedCustomer.address && (
                  <p className="text-xs text-muted mt-1 flex items-center">
                    <MapPin size={12} className="mr-1 shrink-0" /> {selectedCustomer.address}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveSelectedCustomer}
                className="p-2 rounded-lg bg-status-rose/10 border border-status-rose/20 text-status-rose hover:bg-status-rose/25 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {isNewCustomer && (
            <div className="bg-slate-950/20 p-4 rounded-xl border border-primary/20 space-y-4">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-sm font-bold text-primary font-heading">New Customer Account Form</span>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(false)}
                  className="text-xs text-muted hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  placeholder="Full name"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address (Optional)"
                  type="email"
                  placeholder="name@email.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                />
                <Input
                  label="Office / Home Address"
                  type="textarea"
                  placeholder="City, State, Zip details..."
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Device & Issue Specifications */}
        <GlassCard className="space-y-4">
          <h3 className="text-base font-bold text-white font-heading border-b border-border pb-2 flex items-center">
            <Wrench size={18} className="mr-2 text-secondary" /> Device & Job Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Device Type"
              type="select"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
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
              placeholder="e.g. 3500"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Brand Manufacturer"
              placeholder="e.g. Apple, Samsung, Xiaomi"
              value={deviceBrand}
              onChange={(e) => setDeviceBrand(e.target.value)}
              required
            />
            <Input
              label="Device Model"
              placeholder="e.g. iPhone 13, Galaxy S22"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              required
            />
          </div>

          <Input
            label="Assigned Technician"
            type="select"
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            options={[
              { value: '', label: 'Unassigned (Queue)' },
              ...staffUsers.map((s) => ({ value: s._id, label: s.name }))
            ]}
          />

          <Input
            label="Reported Issue / Diagnostic Symptoms"
            type="textarea"
            placeholder="Describe screen cracks, water spills, charging dropouts..."
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />

          <Input
            label="Internal Workspace / Parts Notes"
            type="textarea"
            placeholder="Add internal logs, required components, customer specifics..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </GlassCard>

        {/* Action triggers */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="glass"
            onClick={() => navigate('/repairs')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
          >
            Generate Ticket
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRepair;
