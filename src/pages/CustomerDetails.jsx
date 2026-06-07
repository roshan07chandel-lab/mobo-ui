import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, User, Phone, Mail, MapPin, Wrench, Trash2, Edit } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/format';

const CustomerDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [customer, setCustomer] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [custRes, repairsRes] = await Promise.all([
        api.customers.get(id),
        api.repairs.list()
      ]);
      const cust = custRes.data;
      setCustomer(cust);
      setName(cust.name || '');
      setPhone(cust.phone || '');
      setEmail(cust.email || '');
      setAddress(cust.address || '');

      // Filter repairs client-side by customer ID
      const custReps = repairsRes.data.filter(r => (r.customer?._id || r.customer) === id);
      setRepairs(custReps);
    } catch (err) {
      console.error('Failed to load customer profile details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.customers.update(id, { name, phone, email, address });
      setCustomer(res.data);
      toast.success('Customer profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update customer account');
    } finally {
      setIsSaving(false);
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-base font-semibold">Customer account not found.</p>
        <Button onClick={() => navigate('/customers')} variant="glass" className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/customers')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Client profile form */}
        <div className="lg:col-span-2">
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-bold text-white font-heading border-b border-border pb-3 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary" /> Edit Customer Profile
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Home / Shipping Address"
                type="textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Repairs History List */}
        <div>
          <GlassCard className="space-y-4 flex flex-col h-[500px]">
            <h4 className="text-sm font-bold text-muted font-heading uppercase tracking-wider border-b border-border pb-2 flex items-center">
              <Wrench size={16} className="mr-2 text-primary" /> Repairs History ({repairs.length})
            </h4>

            <div className="divide-y divide-border/60 flex-1 overflow-y-auto custom-scrollbar pr-1">
              {repairs.map((rep) => (
                <div
                  key={rep._id}
                  onClick={() => navigate(`/repairs/${rep._id}`)}
                  className="py-3 bg-slate-900/40 border border-border/40 rounded-xl px-3 my-2 space-y-2 text-xs hover:bg-slate-900/60 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary font-mono">{rep.repairId}</span>
                    <Badge status={rep.status}>{rep.status}</Badge>
                  </div>
                  <p className="font-semibold text-white">
                    {rep.deviceBrand} {rep.deviceModel}
                  </p>
                  <p className="text-muted leading-relaxed italic truncate">
                    {rep.issue}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-border/40 text-[10px] text-muted">
                    <span>{formatDate(rep.createdAt)}</span>
                    <span className="font-bold text-status-emerald">
                      {formatPrice(rep.estimatedCost)}
                    </span>
                  </div>
                </div>
              ))}

              {repairs.length === 0 && (
                <p className="text-xs text-muted py-12 text-center italic leading-relaxed">
                  No repair logs logged for this customer.
                </p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
