import React, { useState, useEffect } from 'react'; 
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, Target, ArrowLeft, Share2, ShieldCheck } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import DonationModal from '../components/DonationModal';
import toast from 'react-hot-toast';

export default function CampaignDetails() {
  const { id } = useParams();
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const { donateToCampaign, account } = useWeb3();

  const [campaign, setCampaign] = useState(state || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    if (!campaign) {
      navigate('/explore');
    }
  }, [campaign, navigate]);

  if (!campaign) return null;

  const handleDonate = async (amount) => {
    if (!account) return toast.error("Connect Wallet first!");
    setIsDonating(true);
    const toastId = toast.loading("Processing Donation...");
    
    try {
      await donateToCampaign(campaign.id, amount);
      toast.success("Donation Successful!", { id: toastId });
      setIsModalOpen(false);
    } catch (error) {
        console.error(error);
        const msg = error.reason || error.message || "Failed";
        toast.error(msg, { id: toastId });
    }
    setIsDonating(false);
  };

  // Share Logic
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Campaign Link Copied!");
  };

  const progress = Math.min((parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((campaign.deadline - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-6xl mx-auto pb-10 text-white fade-in">
      <DonationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDonate={handleDonate}
        campaignTitle={campaign.title}
        isLoading={isDonating}
      />

      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src = "https://placehold.co/800x450/1e293b/ffffff?text=Project+Image"} 
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10">
              {campaign.category}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full"><ShieldCheck size={14} className="text-green-400"/> Verified</span>
              <span>Created by {campaign.owner.substring(0,6)}...{campaign.owner.substring(38)}</span>
            </div>
            
            <div className="bg-[#111827] p-8 rounded-3xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4">About this campaign</h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl p-6 sticky top-6 shadow-2xl">
            
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-bold text-white">{campaign.raised} <span className="text-lg text-slate-500">USDC</span></span>
                <span className="text-sm text-slate-400">Target: {campaign.goal} USDC</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-right text-xs text-blue-400 font-bold">{progress.toFixed(1)}% Funded</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <Users className="text-slate-400 mb-2" size={20} />
                <p className="text-xl font-bold text-white">0</p>
                <p className="text-xs text-slate-500">Backers</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <Clock className="text-slate-400 mb-2" size={20} />
                <p className="text-xl font-bold text-white">{daysLeft}</p>
                <p className="text-xs text-slate-500">Days Left</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
              >
                Back this Project
              </button>
              
              {/* ✅ UPDATED SHARE BUTTON */}
              <button 
                onClick={handleShare}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share Campaign
              </button>
            </div>

            <p className="text-xs text-center text-slate-500 mt-6">
              All funds are securely held in the smart contract until withdrawn by the creator.
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}