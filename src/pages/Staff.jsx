import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { Users, UserPlus, Trash2 } from 'lucide-react';

const Staff = () => {
  const { user, activeShop } = useAuth();
  const toast = useToast();

  // Staff Directory states
  const [staffList, setStaffList] = useState([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('staff');
  const [isStaffSaving, setIsStaffSaving] = useState(false);

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const loadStaffList = async () => {
    setIsLoading(true);
    try {
      const res = await api.auth.getUsers();
      const activeShopId = typeof activeShop === 'object' ? activeShop?._id : activeShop;
      
      // Filter users belonging to this shop
      const shopStaff = res.data.filter(u => {
        const uShopId = typeof u.shop === 'object' ? u.shop?._id : u.shop;
        return !activeShopId || uShopId === activeShopId;
      });
      setStaffList(shopStaff);
    } catch (err) {
      console.error('Failed to load staff list', err);
      toast.error('Failed to load staff list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, [activeShop]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPassword) {
      toast.warning('Please fill in all fields.');
      return;
    }

    setIsStaffSaving(true);
    try {
      const activeShopId = typeof activeShop === 'object' ? activeShop?._id : activeShop;
      
      const payload = {
        name: newStaffName,
        email: newStaffEmail,
        password: newStaffPassword,
        role: newStaffRole,
        shopId: activeShopId
      };

      // Create user on backend
      await api.auth.createUser(payload);

      toast.success(`${newStaffRole === 'admin' ? 'Admin' : 'Staff'} registered successfully!`);
      
      // Reset form & reload
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffRole('staff');
      setIsStaffModalOpen(false);
      await loadStaffList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user credentials.');
    } finally {
      setIsStaffSaving(false);
    }
  };

  const handleDeleteStaff = (targetUser) => {
    if (targetUser.email === user?.email) {
      toast.error('You cannot delete your own admin account.');
      return;
    }
    setStaffToDelete(targetUser);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    const targetUserId = staffToDelete._id;
    setIsDeleteModalOpen(false);
    setStaffToDelete(null);
    setIsDeleting(true);
    try {
      await api.auth.deleteUser(targetUserId);
      toast.success('User credentials deleted successfully.');
      await loadStaffList();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Staff Management
          </h2>
          <p className="text-muted text-sm mt-1">
            Configure system access, passwords, and permissions for technicians and shop administrators
          </p>
        </div>
        <Button
          onClick={() => setIsStaffModalOpen(true)}
          variant="primary"
          className="flex items-center space-x-1.5 text-xs py-2 shrink-0"
        >
          <UserPlus size={16} />
          <span>Register New User</span>
        </Button>
      </div>

      <GlassCard className="relative z-10">
        <div className="flex items-center space-x-2.5 border-b border-border pb-3 mb-4">
          <Users size={22} className="text-secondary" />
          <h3 className="text-lg font-bold text-white font-heading">
            Shop Staff Directory
          </h3>
        </div>

        {isLoading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-slate-400 font-semibold text-xs">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Modified By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-slate-200">
                {staffList.map((s) => (
                  <tr key={s._id || s.email} className="hover:bg-white/[0.02] transition-all">
                    <td className="py-3.5 px-4 font-medium text-white">{s.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{s.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.role === 'admin' ? 'diagnosing' : 'ready'}>
                        {s.role === 'admin' ? 'Shop Admin' : 'Technician Staff'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center text-xs text-status-emerald font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-emerald mr-1.5 animate-pulse" />
                        Active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.updatedBy?.name || 'System'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteStaff(s)}
                        disabled={s.email === user?.email}
                        className={`p-1.5 rounded-lg border transition-all ${
                          s.email === user?.email
                            ? 'opacity-40 border-border text-muted cursor-not-allowed'
                            : 'border-status-rose/20 text-status-rose hover:bg-status-rose/25 hover:border-status-rose/40'
                        }`}
                        title={s.email === user?.email ? "You cannot delete yourself" : "Delete user credentials"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted italic">
                      No staff users registered for this shop yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Register New User Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setNewStaffName('');
          setNewStaffEmail('');
          setNewStaffPassword('');
          setNewStaffRole('staff');
        }}
        title="Register Shop User Account"
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newStaffName}
            onChange={(e) => setNewStaffName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@mobocare.com"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={newStaffPassword}
            onChange={(e) => setNewStaffPassword(e.target.value)}
            required
          />
          <Input
            label="User Access Role"
            type="select"
            value={newStaffRole}
            onChange={(e) => setNewStaffRole(e.target.value)}
            options={[
              { value: 'staff', label: 'Technician Staff (Read/Write repairs & inventory)' },
              { value: 'admin', label: 'Shop Administrator (Full access + manage settings)' }
            ]}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="glass"
              onClick={() => {
                setIsStaffModalOpen(false);
                setNewStaffName('');
                setNewStaffEmail('');
                setNewStaffPassword('');
                setNewStaffRole('staff');
              }}
              disabled={isStaffSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isStaffSaving}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStaffToDelete(null);
        }}
        title="Delete Shop User Account"
        message={`Are you sure you want to delete ${staffToDelete?.name} from the staff directory?`}
        onConfirm={confirmDeleteStaff}
        isLoading={isDeleting}
        confirmText="Delete Account"
      />
    </div>
  );
};

export default Staff;
