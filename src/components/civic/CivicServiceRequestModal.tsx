import React, { useState } from 'react';
import { civicService } from '../../services/civicService';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Droplet,
  Zap,
  Navigation,
  Receipt,
  FileText
} from 'lucide-react';

interface CivicServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelId: string;
  ulpin: string;
  defaultServiceType?: string;
  onSuccess?: () => void;
}

export const CivicServiceRequestModal: React.FC<CivicServiceRequestModalProps> = ({
  isOpen,
  onClose,
  parcelId,
  ulpin,
  defaultServiceType = 'WATER_CONNECTION',
  onSuccess
}) => {
  const [serviceType, setServiceType] = useState<string>(defaultServiceType);
  const [applicantName, setApplicantName] = useState<string>('Suresh Kumar');
  const [applicantContact, setApplicantContact] = useState<string>('+91 98401 23456');
  const [remarks, setRemarks] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await civicService.submitServiceRequest({
        parcel_id: parcelId,
        service_category: serviceType,
        description: remarks ? `${remarks} (Applicant: ${applicantName}, Phone: ${applicantContact})` : `Application for ${serviceType.replace(/_/g, ' ')} on parcel ${ulpin} by ${applicantName} (${applicantContact})`,
        priority: 'MEDIUM'
      });
      setSubmittedId(res.request_id);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to submit civic service request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-50 text-teal-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Civic & Utility Service Request</h3>
              <p className="text-xs text-slate-500 font-mono">Parcel ULPIN: {ulpin}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedId ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Application Submitted Successfully</h4>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Tracking ID: <span className="font-bold text-slate-800">{submittedId}</span>
              </p>
              <p className="text-xs text-slate-600 mt-2 px-6">
                Your request has been routed to the relevant nodal department with geometric cadastral coordinates.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Service / Civic Work
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
              >
                <option value="WATER_CONNECTION">New Drinking Water Supply Pipeline</option>
                <option value="ELECTRICITY_SANCTION">Electricity Meter / Load Sanction</option>
                <option value="SEWERAGE_CONNECTION">Underground Sewerage (UGD) Hookup</option>
                <option value="ROAD_ACCESS_NOC">Road Access NOC / Culvert Approval</option>
                <option value="TAX_ASSESSMENT_REVIEW">Property Tax Assessment Grievance / Review</option>
                <option value="DRAINAGE_CLEARANCE">Stormwater Drain Desilt / Clearance</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Contact Mobile
                </label>
                <input
                  type="text"
                  required
                  value={applicantContact}
                  onChange={(e) => setApplicantContact(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Application Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specify specific requirements or boundary access points..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
