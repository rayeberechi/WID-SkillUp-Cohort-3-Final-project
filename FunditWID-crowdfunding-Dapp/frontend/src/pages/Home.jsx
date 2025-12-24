import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { Wallet, CheckCircle } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { connectWallet, account } = useWeb3();
  const [isSuccess, setIsSuccess] = useState(false);

  // Watch for connection
  useEffect(() => {
    if (account) {
      setIsSuccess(true);
      // Wait 3 seconds then redirect
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [account, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Navbar (Logo Only) */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-center items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">FiW</div>
          <h1 className="text-xl font-bold text-green-500">Fund<span className="text-white">it</span><span className="text-blue-500">WID</span></h1>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="z-10 text-center max-w-3xl px-6 space-y-8">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
          Fund the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Future</span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed">
          FunditWID is a decentralized crowdfunding platform empowering community projects through the blockchain.
        </p>

        <div className="flex justify-center pt-8">
          {/* THE CTA BUTTON */}
          <button 
            onClick={connectWallet}
            disabled={isSuccess}
            className={`
              px-10 py-5 rounded-2xl font-bold text-xl transition-all flex items-center gap-3 shadow-lg hover:scale-105
              ${isSuccess 
                ? 'bg-green-600 text-white cursor-default' // Success State
                : 'bg-red-600 text-white animate-pulse hover:bg-red-700' // Default State
              }
            `}
          >
            {isSuccess ? (
              <>
                <CheckCircle size={24} />
                Wallet Connected! Redirecting...
              </>
            ) : (
              <>
                <Wallet size={24} />
                Connect Wallet to Enter
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="absolute bottom-10 flex gap-12 text-center text-slate-500 text-sm">
         <div><span className="block text-xl font-bold text-white">100%</span>Decentralized</div>
         <div><span className="block text-xl font-bold text-white">0%</span>Hidden Fees</div>
         <div><span className="block text-xl font-bold text-white">24/7</span>Global Access</div>
      </div>

    </div>
  );
};

export default Home;