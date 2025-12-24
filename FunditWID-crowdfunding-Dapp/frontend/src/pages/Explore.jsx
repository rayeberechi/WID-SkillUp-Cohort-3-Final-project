import React, { useState, useEffect } from 'react'; // ✅ CRITICAL FIX
import { Search } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import DonationModal from '../components/DonationModal';
import toast from 'react-hot-toast';

const Explore = () => {
  const { getCampaigns, donateToCampaign, account } = useWeb3();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const data = await getCampaigns();
        if (isMounted) {
          setCampaigns(data);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Explore fetch error:", e);
        if (isMounted) setIsLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [getCampaigns]);

  const openDonateModal = (camp) => {
    if (!account) return toast.error("Please connect wallet first");
    setSelectedCampaign(camp);
    setIsModalOpen(true);
  };

  const handleDonate = async (amount) => {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Invalid amount");
    setIsDonating(true);
    const toastId = toast.loading("Waiting for approval...");
    try {
      await donateToCampaign(selectedCampaign.id, amount);
      toast.success("Donation Successful!", { id: toastId });
      setIsModalOpen(false);
      const updated = await getCampaigns();
      setCampaigns(updated);
    } catch (error) {
      console.error(error);
      const msg = error.reason || error.message || "Transaction failed";
      toast.error(msg.slice(0, 50) + "...", { id: toastId });
    }
    setIsDonating(false);
  };

  // FILTERING LOGIC
  const filteredCampaigns = campaigns.filter(camp => {
    const titleMatch = (camp.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const now = Date.now();
    const isExpired = now > camp.deadline;
    const isCompleted = parseFloat(camp.raised) >= parseFloat(camp.goal);
    
    if (filter === 'Active') return titleMatch && !isExpired && !isCompleted;
    if (filter === 'Completed') return titleMatch && (isCompleted || isExpired);
    return titleMatch;
  });

  return (
    <div className="space-y-8 text-white fade-in relative">
      <DonationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onDonate={handleDonate}
        campaignTitle={selectedCampaign?.title}
        isLoading={isDonating}
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold">Explore Campaigns</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:border-blue-500 outline-none w-64"
            />
          </div>
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex">
            {['All', 'Active', 'Completed'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Loading campaigns...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCampaigns.map((camp) => (
            <div key={camp.id} className="bg-[#0f172a] rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500/30 transition-all shadow-xl flex flex-col h-[480px] group">
              <div className="h-48 w-full relative bg-slate-800 overflow-hidden">
                 <img 
                   src={camp.image} 
                   alt={camp.title} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                   onError={(e) => { e.target.src = "https://placehold.co/600x400/1e293b/ffffff?text=FunditWID+Project"; }}
                 />
                 <div className="absolute top-4 right-4 bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide backdrop-blur-md">
                   {camp.category}
                 </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-white mb-2 line-clamp-1">{camp.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{camp.description}</p>
                <div className="mt-auto space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-white font-bold">{camp.raised} USDC</span>
                      <span className="text-slate-500">of {camp.goal} USDC</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((camp.raised / camp.goal) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/campaign/${camp.id}`, { state: camp })}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm py-3 rounded-xl font-semibold transition"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => openDonateModal(camp)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-900/20"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;