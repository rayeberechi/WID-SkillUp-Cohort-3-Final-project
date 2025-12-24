import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Heart, Calendar, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyDonations = () => {
  const { account, crowdContract } = useWeb3(); 
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null); // Track copied Item ID

  useEffect(() => {
    let isMounted = true; 

    const fetchDonations = async () => {
      if (!crowdContract || !account) {
        setTimeout(() => { if (isMounted) setIsLoading(false); }, 1000);
        return;
      }

      try {
        const currentBlock = await crowdContract.runner.provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 10000); 

        const filter = crowdContract.filters.ContributionReceived();
        const events = await crowdContract.queryFilter(filter, fromBlock, currentBlock);

        const myEvents = events.filter(e => e.args[1].toLowerCase() === account.toLowerCase());

        const parsedDonations = myEvents.map((event) => {
          return {
            id: Number(event.args[0]),
            amount: ethers.formatUnits(event.args[2], 18),
            hash: event.transactionHash,
            date: "Recent"
          };
        });

        if (isMounted) {
          setDonations(parsedDonations.reverse());
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDonations();
    return () => { isMounted = false; };
  }, [crowdContract, account]);

  const handleCopyTx = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(hash);
    toast.success("Transaction Hash Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-white fade-in pb-20">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Heart className="text-red-500" /> My Donations
      </h2>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Scanning blockchain history...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
          <AlertCircle className="mx-auto text-slate-500 mb-2" size={32} />
          <p className="text-slate-400">You haven't made any donations yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {donations.map((don) => (
            <div key={don.hash} className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center justify-between hover:border-blue-500/30 transition">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900/30 p-3 rounded-full text-blue-400 font-bold">
                  #{don.id}
                </div>
                <div>
                  <h4 className="font-bold text-lg">Donated to Campaign #{don.id}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar size={12} /> {don.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xl font-bold text-green-400">{don.amount} USDC</span>
                
                {/* ✅ DYNAMIC BUTTON */}
                <button 
                  onClick={() => handleCopyTx(don.hash)}
                  className={`text-xs flex items-center justify-end gap-1 mt-1 transition-all ${
                    copiedId === don.hash ? 'text-green-400' : 'text-blue-500 hover:text-blue-400 hover:underline'
                  }`}
                >
                  {copiedId === don.hash ? (
                    <><Check size={12} /> Copied</>
                  ) : (
                    <><Copy size={10} /> Copy Tx</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDonations;