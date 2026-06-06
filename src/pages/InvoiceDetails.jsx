import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { ArrowLeft, Printer, Trash2, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/format';

const InvoiceDetails = () => {
  const { id } = useParams();
  const { user, activeShop } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mark Paid modal state
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [payMode, setPayMode] = useState('upi');

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const res = await api.invoices.get(id);
      setInvoice(res.data);
    } catch (err) {
      console.error('Failed to load invoice details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.invoices.markPaid(id, payMode);
      setIsPaidModalOpen(false);
      loadInvoice();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update payment status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this invoice entry permanently?')) return;
    try {
      await api.invoices.delete(id);
      navigate('/invoices');
    } catch (err) {
      alert('Failed to delete invoice');
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-base font-semibold">Invoice record not found.</p>
        <Button onClick={() => navigate('/invoices')} variant="glass" className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const shopToDisplay = invoice.shop || activeShop;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls Row */}
      <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate('/invoices')}
          className="text-xs text-muted hover:text-white flex items-center space-x-1.5 transition-all font-heading uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          <span>Back to Invoices</span>
        </button>

        <div className="flex space-x-3">
          {invoice.isPaid ? null : (
            <Button
              onClick={() => setIsPaidModalOpen(true)}
              variant="secondary"
              className="text-xs py-1.5 px-3"
            >
              Mark as Paid
            </Button>
          )}

          <Button
            onClick={handlePrint}
            variant="glass"
            className="flex items-center space-x-2 text-xs py-1.5 px-3"
          >
            <Printer size={14} />
            <span>Print Receipt</span>
          </Button>

          {isAdmin && (
            <Button
              onClick={handleDelete}
              variant="danger"
              className="flex items-center space-x-2 text-xs py-1.5 px-3 bg-status-rose/10 border border-status-rose/20 text-status-rose hover:bg-status-rose/20"
            >
              <Trash2 size={14} />
              <span>Delete Invoice</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tax Invoice Receipt Sheet */}
      <GlassCard className="relative overflow-hidden bg-white text-slate-950 !p-8 shadow-2xl border-none">
        {/* Print Styling CSS Injection */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-receipt-sheet, #printable-receipt-sheet * {
              visibility: visible;
            }
            #printable-receipt-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
              padding: 0 !important;
            }
          }
        `}} />

        {/* Receipt Wrapper for Printing */}
        <div id="printable-receipt-sheet" className="font-body space-y-6">
          {/* Header row */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-wide uppercase font-heading text-slate-900">
                {shopToDisplay?.name || 'Mobo-Care Repairs'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">{shopToDisplay?.address || 'Franchise address'}</p>
              <p className="text-xs text-slate-500">Tel: {shopToDisplay?.phone || 'FRN contact'}</p>
              {shopToDisplay?.gstNumber && (
                <p className="text-xs text-slate-500 font-semibold mt-0.5">GSTIN: {shopToDisplay.gstNumber}</p>
              )}
            </div>

            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                invoice.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {invoice.isPaid ? 'PAID RECEIPT' : 'PENDING PAYMENT'}
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono mt-3">ID: {invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Date: {formatDate(invoice.createdAt)}</p>
            </div>
          </div>

          {/* Customer and repair references */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-slate-200 pb-6">
            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bill To Client</h5>
              <p className="text-sm font-bold text-slate-900 mt-1">{invoice.customer?.name}</p>
              <p className="text-slate-600 mt-0.5">Phone: {invoice.customer?.phone}</p>
              {invoice.customer?.address && <p className="text-slate-600 mt-0.5">Address: {invoice.customer.address}</p>}
            </div>

            <div>
              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Job Ticket Reference</h5>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {invoice.repair?.repairId || invoice.repairId || 'Unlinked ticket'}
              </p>
              {invoice.repair && (
                <p className="text-slate-600 mt-0.5">
                  Device: {invoice.repair.deviceBrand} {invoice.repair.deviceModel} ({invoice.repair.deviceType})
                </p>
              )}
            </div>
          </div>

          {/* Parts Billed */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5">Unit Price</th>
                  <th className="py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {invoice.parts && invoice.parts.map((p) => (
                  <tr key={p.item}>
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td className="py-3 text-center">{p.quantity}</td>
                    <td className="py-3">{formatPrice(p.unitPrice)}</td>
                    <td className="py-3 text-right font-bold">{formatPrice(p.unitPrice * p.quantity)}</td>
                  </tr>
                ))}

                {/* Labor row */}
                {invoice.laborCost > 0 && (
                  <tr>
                    <td className="py-3 font-semibold" colSpan={3}>
                      Labor Fees & Diagnostics Work
                    </td>
                    <td className="py-3 text-right font-bold">
                      {formatPrice(invoice.laborCost)}
                    </td>
                  </tr>
                )}

                {(!invoice.parts || invoice.parts.length === 0) && invoice.laborCost === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No billed item entries recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="border-t border-slate-200 pt-6 mt-6 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-800 font-extrabold text-base border-t border-slate-300 pt-2">
                <span>Grand Total:</span>
                <span>{formatPrice(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Bottom sign-off */}
          <div className="border-t border-slate-200 pt-8 mt-12 text-center text-[10px] text-slate-400 space-y-2">
            <p>Payment Mode: <span className="font-bold text-slate-600 uppercase">{invoice.paymentMode}</span></p>
            {invoice.notes && <p className="italic mt-2">Notes: "{invoice.notes}"</p>}
            <p className="mt-4 font-semibold text-slate-500">Thank you for business with {shopToDisplay?.name || 'Mobo-Care'}!</p>
          </div>
        </div>
      </GlassCard>

      {/* Complete Payment Modal */}
      {invoice && (
        <Modal
          isOpen={isPaidModalOpen}
          onClose={() => setIsPaidModalOpen(false)}
          title="Mark Invoice as Paid"
          size="sm"
        >
          <form onSubmit={handleMarkPaid} className="space-y-4">
            <div className="p-3 bg-slate-900/40 border border-border rounded-xl">
              <span className="text-[10px] text-muted uppercase font-heading font-semibold">Billed Total Due</span>
              <p className="text-lg font-bold text-status-emerald mt-0.5">{formatPrice(invoice.totalAmount)}</p>
            </div>

            <Input
              label="Select Payment Channel"
              type="select"
              value={payMode}
              onChange={(e) => setPayMode(e.target.value)}
              options={[
                { value: 'upi', label: 'UPI / Scan code' },
                { value: 'cash', label: 'Cash Payment' },
                { value: 'card', label: 'Credit/Debit Card' },
                { value: 'other', label: 'Other/NetBanking' }
              ]}
            />

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button type="button" variant="glass" onClick={() => setIsPaidModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Mark Paid
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceDetails;
