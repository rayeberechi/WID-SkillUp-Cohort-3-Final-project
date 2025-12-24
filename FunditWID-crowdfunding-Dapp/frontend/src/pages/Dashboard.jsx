import React, { useState, useEffect } from "react";
import { useWeb3 } from '../context/Web3Context';
import { Activity, Wallet, Copy, Check, RefreshCw, ChevronUp, ChevronDown, PlusCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { account, tokenBalance, getCampaigns, crowdContract } = useWeb3();
  const navigate = useNavigate();
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Copy States
  const [copied, setCopied] = useState(false); // For Address
  const [copiedTx, setCopiedTx] = useState(null); // For Transaction Hash
  
  const [prices, setPrices] = useState({ usd: 1, ngn: 1650 });
  const [loadingPrices, setLoadingPrices] = useState(true);

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    if (account && crowdContract) {
      try {
        const all = await getCampaigns();
        const mine = all.filter(c => c.owner.toLowerCase() === account.toLowerCase());
        setMyCampaigns(mine);

        const currentBlock = await crowdContract.runner.provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); 

        const createdFilter = crowdContract.filters.CampaignCreated();
        const donatedFilter = crowdContract.filters.ContributionReceived();
        
        const [createdEvents, donatedEvents] = await Promise.all([
          crowdContract.queryFilter(createdFilter, fromBlock, currentBlock),
          crowdContract.queryFilter(donatedFilter, fromBlock, currentBlock)
        ]);

        const activity = [
          ...createdEvents.map(e => ({
            type: 'New Campaign',
            actor: e.args[1].toLowerCase() === account.toLowerCase() ? "You" : `${e.args[1].substring(0,6)}...`,
            desc: `Campaign #${Number(e.args[0])} Created`,
            block: e.blockNumber,
            hash: e.transactionHash,
            icon: "rocket"
          })),
          ...donatedEvents.map(e => ({
            type: 'New Donation',
            actor: e.args[1].toLowerCase() === account.toLowerCase() ? "You" : `${e.args[1].substring(0,6)}...`,
            desc: `Donated ${ethers.formatUnits(e.args[2], 18)} USDC`,
            block: e.blockNumber,
            hash: e.transactionHash,
            icon: "heart"
          }))
        ].sort((a, b) => b.block - a.block).slice(0, 5); 

        setRecentActivity(activity);

      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [account, getCampaigns, crowdContract]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=ngn');
        const data = await response.json();
        if (data['usd-coin'] && data['usd-coin'].ngn) {
          setPrices({ usd: 1, ngn: data['usd-coin'].ngn });
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchPrices();
  }, []); 

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // New Logic for TX Copy
  const handleTxClick = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(hash); 
    toast.success("Tx Hash Copied!");
    setTimeout(() => setCopiedTx(null), 2000); 
  };

  const shortAddress = account 
    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
    : "";

  const balanceVal = parseFloat(tokenBalance || "0");
  const ngnValue = (balanceVal * prices.ngn).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

  return (
    <div className="space-y-8 text-white fade-in">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="text-slate-400 mt-2 flex items-center gap-2">
            <span>Welcome back,</span>
            <button 
              onClick={copyToClipboard}
              className="group bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full font-mono text-sm border border-blue-600/30 flex items-center gap-2 transition-all"
              title="Copy Address"
            >
              {shortAddress}
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="opacity-50 group-hover:opacity-100" />}
            </button>
          </div>
        </div>
        
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6 rounded-3xl border border-slate-700 shadow-xl min-w-[350px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
            <div className="flex items-center gap-2"><Wallet size={14} /> USDC Balance</div>
            {loadingPrices && <RefreshCw size={12} className="animate-spin" />}
          </div>
          <p className="text-4xl font-bold text-white tracking-tight mb-6">
             {balanceVal.toFixed(2)} <span className="text-lg text-slate-500">USDC</span>
          </p>
          <div className="h-px bg-slate-700/50 mb-4"></div>
          <div className="flex justify-between items-end">
             <div>
               <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Portfolio Value (NGN)</p>
               <p className="text-2xl font-bold text-green-400 flex items-center gap-1">₦{ngnValue}</p>
             </div>
             <div className="text-right">
               <div className="bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-600/50 inline-flex items-center gap-1">
                 <span className="text-xs text-slate-300 font-mono">1 USDC = ₦{prices.ngn.toLocaleString()}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. My Campaigns Section */}
      <div>
        <div className="flex justify-between items-center mb-5">
           <h3 className="text-xl font-bold flex items-center gap-2">
             <Activity className="text-blue-500" size={20}/> My Active Campaigns
           </h3>
           <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-full transition" title="Refresh List">
             <RefreshCw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
           </button>
        </div>
        
        {loading ? (
           <p className="text-slate-500 text-center py-10">Loading blockchain data...</p>
        ) : myCampaigns.length === 0 ? (
           <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
               <Activity size={32} />
             </div>
             <div>
               <p className="text-lg font-medium text-slate-300">No campaigns found</p>
               <button 
                 onClick={() => navigate('/create')}
                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 mx-auto transition-all mt-4"
               >
                 <PlusCircle size={18} /> Create Your First Campaign
               </button>
             </div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {myCampaigns.map((camp) => (
               <div 
                 key={camp.id} 
                 onClick={() => navigate(`/campaign/${camp.id}`, { state: camp })}
                 className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/30 transition-all shadow-lg cursor-pointer group"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 className="font-bold text-xl text-white mb-1 truncate pr-4 group-hover:text-blue-400 transition">{camp.title}</h4>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">{camp.category}</span>
                   </div>
                   <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/20">Active</span>
                 </div>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-blue-400 font-bold">{camp.raised} USDC</span>
                     <span className="text-slate-500">of {camp.goal} USDC</span>
                   </div>
                   <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700/50">
                     <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((camp.raised/camp.goal)*100, 100)}%` }}></div>
                   </div>
                   <div className="flex justify-between text-xs text-slate-500 pt-1">
                     <span>0 Backers</span>
                     <span>{Math.max(0, Math.ceil((camp.deadline - Date.now()) / (1000 * 60 * 60 * 24)))} days left</span>
                   </div>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* 3. Recent Platform Activity */}
      <div>
        <h3 className="text-xl font-bold mb-4">Recent Platform Activity</h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((act) => (
              <div key={act.hash} className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 flex justify-between items-center transition hover:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    act.icon === 'heart' ? 'bg-green-500/20 text-green-400' : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {act.icon === 'heart' ? <Heart size={18}/> : <PlusCircle size={18}/>}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{act.actor}</span>
                        <span className="text-xs text-slate-500">Block #{act.block}</span>
                    </div>
                    <p className="text-sm text-slate-300">{act.desc}</p>
                  </div>
                </div>
                
                <div className="text-right">
                   {/* DYNAMIC BUTTON: Shows Check if this specific item is copied */}
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTxClick(act.hash);
                    }}
                    className={`text-xs flex items-center gap-1 transition-all ${
                      copiedTx === act.hash ? 'text-green-400' : 'text-blue-500 hover:text-blue-400 hover:underline'
                    }`}
                   >
                    {copiedTx === act.hash ? (
                      <><Check size={12} /> Copied</>
                    ) : (
                      <><Copy size={10} /> Copy Tx</>
                    )}
                   </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center text-slate-500 text-sm">
            <Activity className="mx-auto mb-2 opacity-50" size={32}/>
            No recent activity found on the blockchain.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;