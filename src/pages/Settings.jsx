import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Lock, Store, CheckCircle, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const { user, activeShop } = useAuth();
  
  // Password change form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [isPassLoading, setIsPassLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsPassLoading(true);
    try {
      await api.auth.changePassword(oldPassword, newPassword);
      setPassSuccess('Credentials updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || err.message || 'Failed to update credentials.');
    } finally {
      setIsPassLoading(false);
    }
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
          Account Settings
        </h2>
        <p className="text-muted text-sm mt-1">
          Adjust passwords, security credentials, and company profile configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Profile and Password change */}
        <div className="space-y-6">
          {/* Active Profile Info */}
          <GlassCard className="relative overflow-hidden group">
            <h3 className="text-lg font-bold text-white font-heading border-b border-border pb-3 mb-4 flex items-center">
              <User size={18} className="mr-2 text-primary" /> Active User Profile
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary font-heading text-lg">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-heading">{user?.name}</h4>
                  <p className="text-xs text-muted font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">User Role</span>
                  <p className="text-sm font-semibold text-white mt-0.5 capitalize">{user?.role}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Account Status</span>
                  <p className="text-sm font-semibold text-status-emerald mt-0.5">Active</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Change Password Panel */}
          <GlassCard>
            <h3 className="text-lg font-bold text-white font-heading border-b border-border pb-3 mb-4 flex items-center">
              <Lock size={18} className="mr-2 text-secondary" /> Change Security Password
            </h3>

            {passSuccess && (
              <div className="mb-4 p-3.5 rounded-xl bg-status-emerald/10 border border-status-emerald/30 text-status-emerald text-xs flex items-center space-x-2">
                <CheckCircle size={14} className="shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="mb-4 p-3.5 rounded-xl bg-status-rose/10 border border-status-rose/30 text-status-rose text-xs flex items-center space-x-2">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Old Password"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <Button type="submit" variant="secondary" className="w-full mt-2" isLoading={isPassLoading}>
                Update Security Credentials
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Shop Details Form */}
        <div>
          {isAdmin && activeShop ? (
            <GlassCard>
              <h3 className="text-lg font-bold text-white font-heading border-b border-border pb-3 mb-4 flex items-center">
                <Store size={18} className="mr-2 text-status-amber" /> Shop Franchise Details (Read-only)
              </h3>

              <div className="space-y-4">
                <Input
                  label="Shop Business Name"
                  value={activeShop.name || ''}
                  disabled
                />
                <Input
                  label="Office Location Address"
                  type="textarea"
                  value={activeShop.address || ''}
                  disabled
                />
                <Input
                  label="Franchise Tel Contact"
                  value={activeShop.phone || ''}
                  disabled
                />
                <Input
                  label="Support Email"
                  type="email"
                  value={activeShop.email || ''}
                  disabled
                />
                {activeShop.gstNumber && (
                  <Input
                    label="GST Number"
                    value={activeShop.gstNumber || ''}
                    disabled
                  />
                )}

                <div className="border-t border-border pt-4 mt-6">
                  <h4 className="text-xs font-bold text-muted font-heading uppercase tracking-wider mb-3">
                    Active Features
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                      <span className="text-slate-400">Repair Assignment:</span>
                      <span className={`font-semibold ${activeShop.repairAssignment ? 'text-status-emerald' : 'text-status-rose'}`}>
                        {activeShop.repairAssignment ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                      <span className="text-slate-400">OTP-Based Delivery:</span>
                      <span className={`font-semibold ${activeShop.otpBasedDelivery ? 'text-status-emerald' : 'text-status-rose'}`}>
                        {activeShop.otpBasedDelivery ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-slate-400">WhatsApp Status Updates:</span>
                      <span className={`font-semibold ${activeShop.whatsAppUpdate ? 'text-status-emerald' : 'text-status-rose'}`}>
                        {activeShop.whatsAppUpdate ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ) : (
            <div className="border border-dashed border-border p-8 text-center rounded-2xl text-muted text-sm font-medium">
              {user?.role === 'superAdmin'
                ? 'Global SuperAdmin mode. There is no shop scope active. Go to the Shops section to modify business profiles.'
                : 'Account settings control center.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
