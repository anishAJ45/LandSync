import React, { useState } from 'react';
import { PropertyTaxRecord } from '../../types';
import { civicService } from '../../services/civicService';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  CreditCard,
  History,
  FileCheck,
  Download,
  Check
} from 'lucide-react';

interface PropertyTaxCardProps {
  taxRecord: PropertyTaxRecord | null;
  parcelId: string;
  onPaymentSuccess?: (updated: PropertyTaxRecord) => void;
}

export const PropertyTaxCard: React.FC<PropertyTaxCardProps> = ({
  taxRecord,
  parcelId,
  onPaymentSuccess
}) => {
  const [paying, setPaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);

  if (!taxRecord) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Municipal Property Tax Record</h3>
            <p className="text-xs text-slate-500">ULPIN & Local Body Assessment Register</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>No active municipal property tax assessment found for this parcel ID.</span>
        </div>
      </div>
    );
  }

  const isPaid = taxRecord.payment_status === 'PAID';
  const isOverdue = taxRecord.payment_status === 'OVERDUE' || taxRecord.arrears > 0;
  const isPartiallyPaid = taxRecord.payment_status === 'PARTIALLY_PAID';

  const handleSimulatePayment = async () => {
    try {
      setPaying(true);
      const updated = await civicService.payPropertyTaxSimulated(parcelId, taxRecord.amount_due || taxRecord.annual_tax);
      if (onPaymentSuccess) onPaymentSuccess(updated);
    } catch (err) {
      console.error('Failed to process simulated tax payment:', err);
    } finally {
      setPaying(false);
    }
  };

  const handleDownloadReceipt = () => {
    setReceiptDownloaded(true);
    setTimeout(() => setReceiptDownloaded(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">Municipal Property Tax</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isOverdue
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                    : isPartiallyPaid
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {taxRecord.payment_status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Ref: {taxRecord.property_reference} • Local Body: {taxRecord.local_body}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {taxRecord.amount_due > 0 ? (
            <button
              id="pay-tax-btn"
              onClick={handleSimulatePayment}
              disabled={paying}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{paying ? 'Processing...' : `Pay ₹${taxRecord.amount_due.toLocaleString('en-IN')}`}</span>
            </button>
          ) : (
            <button
              id="tax-receipt-btn"
              onClick={handleDownloadReceipt}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {receiptDownloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              <span>{receiptDownloaded ? 'Receipt Saved' : 'Tax Receipt'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Key Tax Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Assessment Year</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{taxRecord.assessment_year}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Assessed Value</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">₹{taxRecord.assessed_value.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Annual Tax Demand</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">₹{taxRecord.annual_tax.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Outstanding Due</div>
          <div className={`text-sm font-bold mt-0.5 ${taxRecord.amount_due > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{taxRecord.amount_due.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Tax Payer & Due Date Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
          <span className="text-slate-500 font-medium">Assessed Payer:</span>
          <span className="font-bold text-slate-900">{taxRecord.tax_payer_name || 'Owner On Record'}</span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
          <span className="text-slate-500 font-medium">Due Date:</span>
          <span className="font-bold text-slate-900">
            {new Date(taxRecord.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
          <span className="text-slate-500 font-medium">Last Payment Date:</span>
          <span className="font-semibold text-slate-800">
            {taxRecord.last_payment_date
              ? new Date(taxRecord.last_payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
          <span className="text-slate-500 font-medium">Arrears / Penalties:</span>
          <span className={`font-bold ${taxRecord.arrears > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            ₹{taxRecord.arrears.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* History Toggle */}
      {taxRecord.history && taxRecord.history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showHistory ? 'Hide Payment History' : `View Payment History (${taxRecord.history.length} years)`}</span>
          </button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {taxRecord.history.map((hist, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-200"
                >
                  <div>
                    <span className="font-bold text-slate-800">FY {hist.assessment_year}</span>
                    <span className="text-slate-400 mx-2">•</span>
                    <span className="font-mono text-slate-500">{hist.receipt_no}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">₹{hist.paid_amount.toLocaleString('en-IN')}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {hist.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
