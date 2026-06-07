import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, UserPlus } from 'lucide-react';

const NewUser = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [shopsList, setShopsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [shopId, setShopId] = useState('');

  // Fetch shops for selection list
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await api.shops.list();
        setShopsList(res.data);
        if (res.data.length > 0) {
          setShopId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load shops list', err);
      }
    };
    fetchShops();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        shopId: role === 'superAdmin' ? undefined : shopId
      };

      await api.auth.createUser(payload);
      toast.success('User credentials created successfully!');
 
      navigate('/super/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate('/super/dashboard')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider mb-4"
        >
          <ArrowLeft size={16} />
          <span>Back to Control Dashboard</span>
        </button>

        <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
          Register User Account
        </h2>
        <p className="text-muted text-sm mt-1">
          Create login credentials for SuperAdmins, Shop Admins, and Franchise Staff
        </p>
      </div>

      <GlassCard>
        <h3 className="text-base font-bold text-white font-heading border-b border-border pb-2 flex items-center mb-4">
          <UserPlus size={18} className="mr-2 text-primary" /> User Credentials Setup
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Username)"
            type="email"
            placeholder="e.g. john@mobocare.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="System User Role"
              type="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'staff', label: 'Franchise Staff User' },
                { value: 'admin', label: 'Franchise Shop Admin' },
                { value: 'superAdmin', label: 'Global Super Administrator' }
              ]}
            />

            {role !== 'superAdmin' && (
              <Input
                label="Assign to Shop Franchise"
                type="select"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                options={shopsList.map(s => ({
                  value: s._id,
                  label: s.name
                }))}
              />
            )}
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
              Generate User Profile
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default NewUser;
