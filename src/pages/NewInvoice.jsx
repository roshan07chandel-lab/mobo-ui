import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, CreditCard, Wrench, Search, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/format';

const NewInvoice = () => {
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data pools
  const [repairs, setRepairs] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Search query inputs
  const [repairSearch, setRepairSearch] = useState('');
  const [partSearch, setPartSearch] = useState('');
  
  // Dropdown visibility
  const [showRepairDropdown, setShowRepairDropdown] = useState(false);
  const [showPartDropdown, setShowPartDropdown] = useState(false);

  // Selected repair / customer details
  const [selectedRepair, setSelectedRepair] = useState(null);
  
  // Invoice state
  const [parts, setParts] = useState([]); // Array of { item: id, name: string, quantity: number, unitPrice: number }
  const [laborCost, setLaborCost] = useState('0');
  const [paymentMode, setPaymentMode] = useState('upi');
  const [isPaid, setIsPaid] = useState(true);
  const [notes, setNotes] = useState('');

  // Selected part buffer state
  const [selectedPart, setSelectedPart] = useState(null);
  const [partQty, setPartQty] = useState(1);
  const [partPrice, setPartPrice] = useState('');

  // Load repairs (status: ready)
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const res = await api.repairs.list({ status: 'ready' });
        setRepairs(res.data);
      } catch (err) {
        console.error('Failed to load ready repairs', err);
      }
    };
    fetchRepairs();
  }, [activeShop]);

  // Handle URL query parameter pre-select
  useEffect(() => {
    const repairId = searchParams.get('repairId');
    if (repairId) {
      const fetchPreselected = async () => {
        try {
          const res = await api.repairs.get(repairId);
          const rep = res.data;
          setSelectedRepair(rep);
          setNotes(`Invoice for repair ticket ${rep.repairId} (${rep.deviceBrand} ${rep.deviceModel})`);
          setStep(2); // Jump directly to parts selection
        } catch (err) {
          console.error('Failed to fetch preselected repair', err);
        }
      };
      fetchPreselected();
    }
  }, [searchParams]);

  // Inventory search debounced query
  useEffect(() => {
    const searchInventory = async () => {
      if (partSearch.trim() === '') {
        setInventory([]);
        return;
      }
      try {
        const res = await api.inventory.list({ search: partSearch });
        setInventory(res.data);
      } catch (err) {
        console.error('Failed to query inventory', err);
      }
    };
    const delayDebounce = setTimeout(searchInventory, 300);
    return () => clearTimeout(delayDebounce);
  }, [partSearch]);

  const handleSelectRepair = (rep) => {
    setSelectedRepair(rep);
    setRepairSearch('');
    setShowRepairDropdown(false);
    setNotes(`Invoice for repair ticket ${rep.repairId} (${rep.deviceBrand} ${rep.deviceModel})`);
    setStep(2);
  };

  const handleSelectPart = (item) => {
    setSelectedPart(item);
    setPartPrice(item.sellPrice.toString());
    setPartQty(1);
    setPartSearch('');
    setShowPartDropdown(false);
  };

  const handleAddPart = () => {
    if (!selectedPart) return;
    if (selectedPart.quantity < partQty) {
      toast.warning(`Insufficient stock! Only ${selectedPart.quantity} units are available.`);
      return;
    }

    const existingIdx = parts.findIndex(p => p.item === selectedPart._id);
    const updated = [...parts];

    if (existingIdx !== -1) {
      const newQty = updated[existingIdx].quantity + Number(partQty);
      if (selectedPart.quantity < newQty) {
        toast.warning(`Insufficient stock! Total requested: ${newQty}, available: ${selectedPart.quantity}`);
        return;
      }
      updated[existingIdx].quantity = newQty;
    } else {
      updated.push({
        item: selectedPart._id,
        name: selectedPart.name,
        quantity: Number(partQty),
        unitPrice: Number(partPrice || 0)
      });
    }

    setParts(updated);
    setSelectedPart(null);
    setPartQty(1);
    setPartPrice('');
  };

  const handleRemovePart = (idx) => {
    setParts(parts.filter((_, i) => i !== idx));
  };

  const partsTotal = parts.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
  const grandTotal = partsTotal + Number(laborCost || 0);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRepair) {
      toast.warning('Please select a repair ticket first.');
      setStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        repair: selectedRepair._id,
        customer: selectedRepair.customer._id,
        parts: parts,
        laborCost: Number(laborCost || 0),
        paymentMode,
        isPaid,
        notes
      };

      const res = await api.invoices.create(payload);
      toast.success('Billing invoice created successfully!');
      navigate(`/invoices/${res.data._id}?justCreated=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit billing invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepairs = repairs.filter(r => {
    const q = repairSearch.toLowerCase();
    return (
      r.repairId.toLowerCase().includes(q) ||
      r.customer?.name.toLowerCase().includes(q) ||
      r.customer?.phone.includes(q)
    );
  });

  const repairIdParam = searchParams.get('repairId');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 3) {
              setStep(2);
            } else if (step === 2) {
              if (repairIdParam) {
                navigate(`/repairs/${repairIdParam}`);
              } else {
                setStep(1);
              }
            } else {
              navigate('/invoices');
            }
          }}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>
            {step === 3
              ? 'Back to Spare Parts'
              : step === 2
              ? repairIdParam
                ? 'Back to Repair'
                : 'Back to Select Repair'
              : 'Back to Invoices'}
          </span>
        </button>

        {/* Step Indicators */}
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider font-heading">
          <span className={step === 1 ? 'text-primary' : 'text-muted'}>1. Repair Ticket</span>
          <span className="text-muted">/</span>
          <span className={step === 2 ? 'text-primary' : 'text-muted'}>2. Spare Parts</span>
          <span className="text-muted">/</span>
          <span className={step === 3 ? 'text-primary' : 'text-muted'}>3. Payments</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main form card */}
        <div className="lg:col-span-2">
          <form onSubmit={handleFormSubmit}>
            {step === 1 && (
              <GlassCard className="space-y-4">
                <h3 className="text-base font-bold text-white font-heading border-b border-border pb-2 flex items-center">
                  <Wrench size={18} className="mr-2 text-primary" /> Step 1: Select Repair Ticket
                </h3>
                
                <div className="relative">
                  <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider mb-1.5">
                    Search Ready Repairs
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <Search size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search ticket ID, customer name or phone..."
                      value={repairSearch}
                      onChange={(e) => {
                        setRepairSearch(e.target.value);
                        setShowRepairDropdown(true);
                      }}
                      onFocus={() => setShowRepairDropdown(true)}
                      className="glass-input w-full !pl-10"
                    />
                  </div>

                  {showRepairDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-border rounded-xl shadow-glass-md max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredRepairs.map((r) => (
                        <div
                          key={r._id}
                          onClick={() => handleSelectRepair(r)}
                          className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-all border-b border-border/40"
                        >
                          <div>
                            <p className="text-sm font-bold text-white">{r.repairId} — {r.deviceBrand} {r.deviceModel}</p>
                            <p className="text-xs text-muted">Client: {r.customer?.name} ({r.customer?.phone})</p>
                          </div>
                          <Badge status={r.status}>{r.status}</Badge>
                        </div>
                      ))}
                      {filteredRepairs.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted italic">
                          No repair tickets in status READY or DELIVERED found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </GlassCard>
            )}

            {step === 2 && (
              <GlassCard className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h3 className="text-base font-bold text-white font-heading flex items-center">
                    <ShoppingBag size={18} className="mr-2 text-secondary" /> Step 2: Billed Spare Parts
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted hover:text-white"
                  >
                    Change Ticket
                  </button>
                </div>

                {/* Part Search */}
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-xs font-semibold text-muted font-heading uppercase tracking-wider mb-1.5">
                      Search Spare Parts Warehouse
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                        <Search size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search part name, SKU..."
                        value={partSearch}
                        onChange={(e) => {
                          setPartSearch(e.target.value);
                          setShowPartDropdown(true);
                        }}
                        onFocus={() => setShowPartDropdown(true)}
                        className="glass-input w-full !pl-10"
                      />
                    </div>

                    {showPartDropdown && partSearch.trim() !== '' && (
                      <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-border rounded-xl shadow-glass-md max-h-60 overflow-y-auto custom-scrollbar">
                        {inventory.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => handleSelectPart(item)}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center transition-all border-b border-border/40"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">{item.name}</p>
                              <p className="text-xs text-muted">SKU: {item.sku} | Price: {formatPrice(item.sellPrice)}</p>
                            </div>
                            <span className={`text-xs font-bold ${item.quantity <= item.lowStockAt ? 'text-status-rose' : 'text-slate-400'}`}>
                              {item.quantity} in stock
                            </span>
                          </div>
                        ))}
                        {inventory.length === 0 && (
                          <div className="p-4 text-center text-xs text-muted italic">
                            No matching parts located.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Part Form Detail */}
                  {selectedPart && (
                    <div className="bg-slate-950/20 p-4 rounded-xl border border-secondary/20 space-y-4">
                      <p className="text-sm font-semibold text-white">Add: {selectedPart.name}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Quantity"
                          type="number"
                          min={1}
                          max={selectedPart.quantity}
                          value={partQty}
                          onChange={(e) => setPartQty(Number(e.target.value))}
                          required
                        />
                        <Input
                          label="Unit Billed Price (₹)"
                          type="number"
                          value={partPrice}
                          onChange={(e) => setPartPrice(e.target.value)}
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="glass" onClick={() => setSelectedPart(null)} className="py-1 px-3 text-xs">
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddPart} variant="secondary" className="py-1 px-3 text-xs">
                          Confirm Part
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Table of added parts */}
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/40 text-muted font-bold border-b border-border uppercase">
                        <th className="px-4 py-3">Part Name</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-slate-300">
                      {parts.map((p, idx) => (
                        <tr key={p.item}>
                          <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
                          <td className="px-4 py-3 text-center">{p.quantity}</td>
                          <td className="px-4 py-3">{formatPrice(p.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-bold text-status-emerald">
                            {formatPrice(p.unitPrice * p.quantity)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePart(idx)}
                              className="text-status-rose hover:text-white transition-all p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {parts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted italic">
                            No spare parts billed. Standard diagnostics/labor only.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Trigger Row */}
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="button" onClick={() => setStep(3)} variant="primary" className="flex items-center space-x-1.5">
                    <span>Continue to payment</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </GlassCard>
            )}

            {step === 3 && (
              <GlassCard className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <h3 className="text-base font-bold text-white font-heading flex items-center">
                    <CreditCard size={18} className="mr-2 text-status-amber" /> Step 3: Labor & Payment
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-muted hover:text-white"
                  >
                    Adjust Parts
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Labor & Diagnostics Cost (₹)"
                    type="number"
                    placeholder="e.g. 500"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    required
                  />
                  <Input
                    label="Payment Channel"
                    type="select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    options={[
                      { value: 'upi', label: 'UPI / Scan code' },
                      { value: 'cash', label: 'Cash Payment' },
                      { value: 'card', label: 'Credit/Debit Card' },
                      { value: 'other', label: 'Other/NetBanking' }
                    ]}
                  />
                </div>

                <div className="flex items-center space-x-2 bg-slate-950/20 p-4 rounded-xl border border-border">
                  <input
                    type="checkbox"
                    id="paidInvoiceCheck"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-slate-900 focus:ring-primary text-primary"
                  />
                  <label htmlFor="paidInvoiceCheck" className="text-sm font-semibold text-white cursor-pointer select-none">
                    Mark invoice paid immediately
                  </label>
                </div>

                <Input
                  label="Warranty Notes / Billing Comments"
                  type="textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                {/* Final controls */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-border">
                  <Button type="button" variant="glass" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isLoading}>
                    Confirm and Billed
                  </Button>
                </div>
              </GlassCard>
            )}
          </form>
        </div>

        {/* Right invoice summary ledger panel */}
        <div>
          <GlassCard className="space-y-6 sticky top-24 border-secondary/20 shadow-glow-secondary">
            <h4 className="text-xs font-bold text-muted font-heading uppercase tracking-wider border-b border-border pb-2">
              Billing Summary
            </h4>

            {selectedRepair ? (
              <div className="space-y-4 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Repair Ticket</span>
                  <p className="font-bold text-white mt-0.5">{selectedRepair.repairId}</p>
                  <p className="text-[11px] mt-0.5">{selectedRepair.deviceBrand} {selectedRepair.deviceModel}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted uppercase font-heading font-semibold">Customer account</span>
                  <p className="font-bold text-white mt-0.5">{selectedRepair.customer?.name}</p>
                  <p className="text-[11px] mt-0.5">{selectedRepair.customer?.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted italic">No repair ticket selected yet.</p>
            )}

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Spare Parts:</span>
                <span>{formatPrice(partsTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Labor Fees:</span>
                <span>{formatPrice(Number(laborCost || 0))}</span>
              </div>
              <div className="flex justify-between text-white font-extrabold font-heading text-base border-t border-border pt-3">
                <span>Grand Total:</span>
                <span className="text-status-emerald">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default NewInvoice;
