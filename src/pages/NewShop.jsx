import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, Store } from 'lucide-react';

const NewShop = () => {
  const navigate = useNavigate();
  const { refreshShops } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name,
        address,
        phone,
        ownerName,
        ownerContact,
        email: email || undefined,
        gstNumber: gstNumber || undefined
      };
      await api.shops.create(payload);
      await refreshShops(); // Refresh context list
      navigate('/super/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to register shop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back to dashboard */}
      <div>
        <button
          onClick={() => navigate('/super/dashboard')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>

        <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
          Register New Shop
        </h2>
        <p className="text-muted text-sm mt-1">
          Create new tenant database spaces for franchise shops
        </p>
      </div>

      <GlassCard>
        <h3 className="text-base font-bold text-white font-heading border-b border-border pb-2 flex items-center mb-4">
          <Store size={18} className="mr-2 text-primary" /> Shop Profile Context
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Shop Name"
              placeholder="e.g. MoboCare - Pune"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Street Address"
            type="textarea"
            placeholder="e.g. 123, MG Road, Pune"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Owner Name"
              placeholder="e.g. Roshan Sharma"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
            <Input
              label="Owner Contact Phone"
              placeholder="e.g. 9876543210"
              value={ownerContact}
              onChange={(e) => setOwnerContact(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Email Address (Optional)"
              type="email"
              placeholder="pune@mobocare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="GST Registration Number (Optional)"
              placeholder="e.g. 27AABCU9603R1ZX"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-border mt-6">
            <Button
              type="button"
              variant="glass"
              onClick={() => navigate('/super/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Register Shop Space
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default NewShop;
