import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Search, Plus, Edit, AlertCircle, Trash2, ArrowUpDown, RefreshCw, Settings2 } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';
import { formatPrice } from '../utils/format';

const CATEGORIES = ['All', 'Screens', 'Batteries', 'Charging Ports', 'Accessories'];

const Inventory = () => {
  const { user, activeShop } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const lowStockParam = searchParams.get('lowStock') === 'true';

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(lowStockParam);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add/Edit Item Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Screens',
    quantity: '',
    costPrice: '',
    sellPrice: '',
    lowStockAt: ''
  });

  // Adjust Stock Modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'

  // Delete states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInventory = async () => {
    if (!user || !activeShop?._id) return;
    setIsLoading(true);
    try {
      const res = await api.inventory.list();
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [user, activeShop]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, showLowStockOnly, selectedCategory]);

  useEffect(() => {
    if (lowStockParam) {
      setShowLowStockOnly(true);
    } else {
      setShowLowStockOnly(false);
    }
  }, [lowStockParam]);

  const handleToggleLowStock = (checked) => {
    setShowLowStockOnly(checked);
    if (checked) {
      searchParams.set('lowStock', 'true');
    } else {
      searchParams.delete('lowStock');
    }
    setSearchParams(searchParams);
  };

  // Adjust stock handler
  const handleOpenAdjust = (item) => {
    setAdjustItem(item);
    setAdjustQty('');
    setAdjustType('add');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustItem || !adjustQty) return;
    try {
      await api.inventory.adjustStock(adjustItem._id, Number(adjustQty), adjustType);
      setIsAdjustModalOpen(false);
      setAdjustItem(null);
      toast.success('Stock level updated successfully');
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to adjust stock levels');
    }
  };

  // Add/Edit Item handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: '',
      category: 'Screens',
      quantity: 0,
      costPrice: 0,
      sellPrice: 0,
      lowStockAt: 5
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      costPrice: item.costPrice,
      sellPrice: item.sellPrice,
      lowStockAt: item.lowStockAt
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.inventory.update(editingItem._id, formData);
        toast.success('Inventory item updated successfully');
      } else {
        await api.inventory.create(formData);
        toast.success('Inventory item created successfully');
      }
      setIsModalOpen(false);
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save inventory item');
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
      await api.inventory.delete(itemToDelete._id);
      toast.success('Inventory item deleted successfully');
      setItemToDelete(null);
      loadInventory();
    } catch (err) {
      toast.error('Failed to delete inventory item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter category, low stock and search terms client-side
  const filteredItems = items.filter((item) => {
    // 1. Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    // 2. Low stock filter
    if (showLowStockOnly && item.quantity > item.lowStockAt) {
      return false;
    }
    // 3. Search query filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.sku && item.sku.toLowerCase().includes(term))
    );
  });

  // Sort and paginate
  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
    if (dateA && dateB && dateB - dateA !== 0) {
      return dateB - dateA;
    }
    const idA = a._id || '';
    const idB = b._id || '';
    return idB.localeCompare(idA);
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  const isAdmin = user && user.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-wide">
            Inventory & Stock
          </h2>
          <p className="text-muted text-sm mt-1">
            Manage spare parts, accessories, and threshold alerts
          </p>
        </div>
        
        {isAdmin && (
          <Button onClick={handleOpenAdd} className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Inventory Item</span>
          </Button>
        )}
      </div>

      {/* Toolbar filters and search */}
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:max-w-md">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search items by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input w-full !pl-10"
            />
          </div>
          
          {/* Low stock filter toggle */}
          <div className="flex items-center space-x-2 shrink-0 bg-slate-900/40 p-2.5 rounded-xl border border-border">
            <input
              type="checkbox"
              id="lowStockToggle"
              checked={showLowStockOnly}
              onChange={(e) => handleToggleLowStock(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-slate-900 focus:ring-primary text-primary"
            />
            <label htmlFor="lowStockToggle" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
              Show Low Stock Only
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-4 rounded-xl text-xs font-semibold font-heading transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid of stock items */}
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
                  <th className="px-6 py-4">Part / SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">In Stock</th>
                  <th className="px-6 py-4">Purchase Cost</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Modified By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {currentItems.map((item) => {
                  const isLowStock = item.quantity <= item.lowStockAt;
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-white/5 transition-all ${
                        isLowStock ? 'bg-status-rose/[0.02]' : ''
                      }`}
                    >
                      {/* Name & SKU */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{item.name}</span>
                          <span className="text-xs text-muted tracking-wide font-mono mt-0.5">
                            {item.sku}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      {/* Stock Level Display */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center min-w-[50px]">
                          <span className={`font-bold ${isLowStock ? 'text-status-rose font-heading text-base' : 'text-status-emerald font-heading text-base'}`}>
                            {item.quantity}
                          </span>
                          {isLowStock && (
                            <Badge status="low-stock" className="scale-75 origin-top mt-0.5 !py-0">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Cost Price */}
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-300">
                        {formatPrice(item.costPrice)}
                      </td>

                      {/* Sell Price */}
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-status-emerald">
                        {formatPrice(item.sellPrice)}
                      </td>

                      {/* Modified By */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                        {item.updatedBy?.name || 'System'}
                      </td>

                      {/* Operational Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Adjust Stock Button (both Staff and Admin) */}
                          <Button
                            onClick={() => handleOpenAdjust(item)}
                            variant="glass"
                            className="flex items-center space-x-1 text-xs py-1.5 px-3"
                          >
                            <RefreshCw size={12} />
                            <span>Adjust Stock</span>
                          </Button>

                          {/* Admin Only Actions */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 rounded-lg bg-white/5 border border-border text-muted hover:text-white hover:bg-white/10 transition-all"
                                title="Edit Item"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 rounded-lg bg-status-rose/10 border border-status-rose/20 text-status-rose hover:bg-status-rose/20 hover:text-white transition-all"
                                title="Delete Item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted">
                      No matching parts found in this warehouse sector.
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
              {Math.min(indexOfLastItem, sortedItems.length)}
            </span>{' '}
            of <span className="font-semibold text-white">{sortedItems.length}</span> items
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

      {/* Adjust Stock Modal */}
      {adjustItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock Level: ${adjustItem.name}`}
          size="sm"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-3 bg-slate-900/40 border border-border rounded-xl mb-2">
              <span className="text-[10px] text-muted uppercase font-heading font-semibold">Current Stock Level</span>
              <p className="text-lg font-bold text-white mt-0.5">{adjustItem.quantity} units</p>
            </div>

            <Input
              label="Adjustment Type"
              type="select"
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              options={[
                { value: 'add', label: 'Add Stock (+)' },
                { value: 'subtract', label: 'Subtract Stock (-)' }
              ]}
            />

            <Input
              label="Quantity to Adjust"
              type="number"
              min={1}
              placeholder="e.g. 5"
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              required
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button type="button" variant="glass" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Confirm Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Inventory Item Details' : 'Add New Inventory Spare Part'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Part Name"
            placeholder="e.g. iPad Air 5 USB-C Flex Port"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU Index"
              placeholder="e.g. PRT-IPAD-C"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              required
            />
            <Input
              label="Category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={[
                { value: 'Screens', label: 'Screens' },
                { value: 'Batteries', label: 'Batteries' },
                { value: 'Charging Ports', label: 'Charging Ports' },
                { value: 'Accessories', label: 'Accessories' }
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Starting Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              required
              disabled={!!editingItem} // only edit via adjust stock
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              placeholder="1200"
              value={formData.costPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, costPrice: e.target.value }))}
              required
            />
            <Input
              label="Selling Price (₹)"
              type="number"
              placeholder="3500"
              value={formData.sellPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Low Stock Warning Threshold"
            type="number"
            placeholder="5"
            value={formData.lowStockAt}
            onChange={(e) => setFormData(prev => ({ ...prev, lowStockAt: e.target.value }))}
            required
          />

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="glass" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Item
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title="Delete Inventory Item"
        message={`Are you sure you want to delete ${itemToDelete?.name} from inventory permanently?`}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        confirmText="Delete Item"
      />
    </div>
  );
};

export default Inventory;
