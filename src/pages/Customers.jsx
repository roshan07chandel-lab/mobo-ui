import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Search, Plus, User, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/format';

const Customers = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const loadCustomers = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      const res = await api.customers.list();
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load CRM database', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user, activeShop]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter client-side based on name, email, and phone
  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term))
    );
  });

  // Sort and paginate
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
    if (dateA && dateB && dateB - dateA !== 0) {
      return dateB - dateA;
    }
    const idA = a._id || '';
    const idB = b._id || '';
    return idB.localeCompare(idA);
  });

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.customers.create(newCustomer);
      setIsAddModalOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      toast.success('Customer registered successfully!');
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register customer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Customer Directory (CRM)
          </h2>
          <p className="text-muted text-sm mt-1">
            Browse registered client accounts and inspect historical repair tickets
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
          <Plus size={18} />
          <span>Register New Customer</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Filter by name, phone or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-input w-full !pl-10"
        />
      </div>

      {/* Grid: CRM Directory */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          </div>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-slate-900/30 text-xs font-bold text-muted uppercase tracking-wider font-heading">
                  <th className="px-6 py-4">Customer Name</th>
                  <th className="px-6 py-4">Phone Contact</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Street Address</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Modified By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {currentItems.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/customers/${c._id}`)}
                    className="hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-white">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {c.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {c.email || <span className="text-muted italic text-xs">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300 max-w-[200px] truncate">
                      {c.address || <span className="text-muted italic text-xs">Not provided</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {c.updatedBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customers/${c._id}`);
                        }}
                        className="p-2 rounded-lg bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}

                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted italic">
                      No customer accounts found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900/10 border border-border p-4 rounded-xl gap-4">
          <span className="text-xs text-muted">
            Showing <span className="font-semibold text-white">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-semibold text-white">
              {Math.min(indexOfLastItem, sortedCustomers.length)}
            </span>{' '}
            of <span className="font-semibold text-white">{sortedCustomers.length}</span> clients
          </span>
          <div className="flex space-x-1.5 overflow-x-auto max-w-full py-1">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="!py-1.5 !px-3 text-xs"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'glass'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`!py-1.5 !px-3 text-xs font-semibold ${
                  currentPage === page ? 'shadow-glow-primary' : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="glass"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="!py-1.5 !px-3 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Register Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Customer (CRM Setup)"
        size="sm"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="e.g. Alice Johnson"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Phone Contact"
            type="tel"
            placeholder="e.g. 555-123-4567"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="e.g. alice@gmail.com"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            label="Home / Shipping Address"
            type="textarea"
            placeholder="e.g. 123 Elm St, New York, NY"
            value={newCustomer.address}
            onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="glass" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
