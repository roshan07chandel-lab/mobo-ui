import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, Store, ShieldAlert, Check } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshShops, selectShop } = useAuth();
  const toast = useToast();

  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Edit states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Feature flags
  const [otpBasedDelivery, setOtpBasedDelivery] = useState(false);
  const [repairAssignment, setRepairAssignment] = useState(false);
  const [whatsAppUpdate, setWhatsAppUpdate] = useState(false);

  const loadShop = async () => {
    setIsLoading(true);
    try {
      const res = await api.shops.get(id);
      const data = res.data;
      setShop(data);
      selectShop(data);
      setName(data.name || '');
      setAddress(data.address || '');
      setPhone(data.phone || '');
      setOwnerName(data.ownerName || '');
      setOwnerContact(data.ownerContact || '');
      setEmail(data.email || '');
      setGstNumber(data.gstNumber || '');
      setOtpBasedDelivery(!!data.otpBasedDelivery);
      setRepairAssignment(!!data.repairAssignment);
      setWhatsAppUpdate(!!data.whatsAppUpdate);
    } catch (err) {
      console.error('Failed to load shop details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShop();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        address,
        phone,
        ownerName,
        ownerContact,
        email: email || null,
        gstNumber: gstNumber || null,
        otpBasedDelivery,
        repairAssignment,
        whatsAppUpdate
      };
      await api.shops.update(id, payload);
      toast.success('Shop profile updated successfully!');
      await refreshShops();
      loadShop();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update shop profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSuspend = () => {
    setIsConfirmOpen(true);
  };

  const confirmToggleSuspend = async () => {
    setIsConfirmOpen(false);
    setIsSaving(true);
    try {
      if (shop.isActive) {
        // DELETE soft deactivates shop
        await api.shops.delete(id);
        toast.success('Shop suspended successfully');
      } else {
        // PUT updates isActive back to true
        await api.shops.update(id, { isActive: true });
        toast.success('Shop activated successfully');
      }
      await refreshShops();
      loadShop();
    } catch (err) {
      toast.error(`Failed to change shop status: ${err.message}`);
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

  if (!shop) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-base font-semibold">Shop space record not found.</p>
        <Button onClick={() => navigate('/super/dashboard')} variant="glass" className="mt-4">
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls Row */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/super/dashboard')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>

        <Button
          onClick={handleToggleSuspend}
          variant={shop.isActive ? 'danger' : 'secondary'}
          className="flex items-center space-x-2 text-xs py-1.5 px-3"
          isLoading={isSaving}
        >
          {shop.isActive ? (
            <>
              <ShieldAlert size={14} />
              <span>Suspend Shop</span>
            </>
          ) : (
            <>
              <Check size={14} />
              <span>Activate Shop</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Shop edit form */}
        <div className="lg:col-span-2">
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <Store size={22} className="text-primary" />
                <h3 className="text-lg font-bold text-white font-heading">
                  Franchise Settings
                </h3>
              </div>
              <Badge status={shop.isActive ? 'ready' : 'cancelled'}>
                {shop.isActive ? 'ACTIVE' : 'SUSPENDED'}
              </Badge>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Shop Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Contact Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Street Address"
                type="textarea"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Owner Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
                <Input
                  label="Owner Contact Phone"
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Franchise Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="GSTIN Number"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>

              <div className="border-t border-border pt-4 mt-6">
                <h4 className="text-xs font-bold text-muted font-heading uppercase tracking-wider mb-4">
                  Franchise Feature Flags
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2 bg-slate-950/20 p-3 rounded-xl border border-border">
                    <input
                      type="checkbox"
                      id="repairAssignmentCheck"
                      checked={repairAssignment}
                      onChange={(e) => setRepairAssignment(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-slate-900 focus:ring-primary text-primary cursor-pointer"
                    />
                    <label htmlFor="repairAssignmentCheck" className="text-xs font-semibold text-white cursor-pointer select-none">
                      Enable Repair Assignment
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950/20 p-3 rounded-xl border border-border">
                    <input
                      type="checkbox"
                      id="otpBasedDeliveryCheck"
                      checked={otpBasedDelivery}
                      onChange={(e) => setOtpBasedDelivery(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-slate-900 focus:ring-primary text-primary cursor-pointer"
                    />
                    <label htmlFor="otpBasedDeliveryCheck" className="text-xs font-semibold text-white cursor-pointer select-none">
                      OTP-Based Delivery
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-950/20 p-3 rounded-xl border border-border">
                    <input
                      type="checkbox"
                      id="whatsAppUpdateCheck"
                      checked={whatsAppUpdate}
                      onChange={(e) => setWhatsAppUpdate(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-slate-900 focus:ring-primary text-primary cursor-pointer"
                    />
                    <label htmlFor="whatsAppUpdateCheck" className="text-xs font-semibold text-white cursor-pointer select-none">
                      WhatsApp Status Updates
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Additional Shop Details */}
        <div>
          <GlassCard className="space-y-4 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-muted font-heading uppercase tracking-wider border-b border-border pb-2">
              System Audit Metadata
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-muted uppercase font-heading font-semibold">Franchise ID</span>
                <p className="font-mono font-bold text-white mt-0.5">{shop._id}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted uppercase font-heading font-semibold">Registered At</span>
                <p className="font-semibold text-white mt-0.5">{new Date(shop.createdAt).toLocaleString()}</p>
              </div>
              {shop.updatedAt && (
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Last Configuration Update</span>
                  <p className="font-semibold text-white mt-0.5">{new Date(shop.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={shop?.isActive ? 'Suspend Shop Franchise' : 'Reactivate Shop Franchise'}
        message={
          shop?.isActive
            ? `Are you sure you want to suspend/deactivate ${shop?.name}?`
            : `Are you sure you want to reactivate ${shop?.name}?`
        }
        onConfirm={confirmToggleSuspend}
        isLoading={isSaving}
        confirmText={shop?.isActive ? 'Suspend' : 'Reactivate'}
        variant={shop?.isActive ? 'danger' : 'info'}
      />
    </div>
  );
};

export default ShopDetails;
