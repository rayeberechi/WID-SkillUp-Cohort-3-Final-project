import React, { useState } from 'react';
import { X, Heart, AlertCircle } from 'lucide-react';

const DonationModal = ({ isOpen, onClose, onDonate, campaignTitle, isLoading }) => {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onDonate(amount);
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm fade-in">
      <div className="bg-[#1e293b] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#0f172a] p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={20} />
            Back Project
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">You are donating to:</p>
            <p className="font-bold text-white text-lg truncate">{campaignTitle}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-200">
              Funds will be transferred directly to the campaign creator's wallet. This action cannot be undone.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Donation Amount (USDC)</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  placeholder="e.g. 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white font-bold text-lg focus:border-blue-500 outline-none transition"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">USDC</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !amount}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                isLoading 
                  ? 'bg-slate-700 text-slate-400 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
              }`}
            >
              {isLoading ? "Processing..." : "Confirm Donation"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default DonationModal;