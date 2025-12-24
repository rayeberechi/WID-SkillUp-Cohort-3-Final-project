import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CrowdfundingArtifact from '../contracts/Crowdfunding.json';
import MockTokenArtifact from '../contracts/MockToken.json';
import ContractAddress from '../contracts/contract-address.json'; 
import toast from 'react-hot-toast';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [crowdContract, setCrowdContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(true);

  // 1. DUAL PROVIDER SETUP: Read from Public Node, Write via Wallet
  const connectWallet = async () => {
    if (!window.ethereum) return toast.error("Please install MetaMask!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await setupContracts(accounts[0], provider);
        toast.success("Wallet Connected!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Connection failed");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setCrowdContract(null);
    setTokenContract(null);
    toast.success("Disconnected");
  };

  const setupContracts = async (userAddress, provider) => {
    try {
      const signer = await provider.getSigner();
      
      // Use a robust Public RPC for reading data to avoid congestion
      const readProvider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

      if (ContractAddress.Crowdfunding) {
        // Contract connected to Signer (for writing)
        const crowd = new ethers.Contract(ContractAddress.Crowdfunding, CrowdfundingArtifact.abi, signer);
        // We attach the readProvider to a new instance if we needed heavy reading, 
        // but for now, we just ensure the signer is valid.
        setCrowdContract(crowd);
      }
      
      if (ContractAddress.MockToken) {
        const token = new ethers.Contract(ContractAddress.MockToken, MockTokenArtifact.abi, signer);
        setTokenContract(token);
        
        // Fetch Token Balance
        const tokBal = await token.balanceOf(userAddress);
        setTokenBalance(ethers.formatUnits(tokBal, 18));
      }

      const ethBal = await provider.getBalance(userAddress);
      setBalance(ethers.formatEther(ethBal));

    } catch (err) {
      console.error("Setup Error:", err);
    }
  };

  const updateBalances = async () => {
    if(tokenContract && account) {
        const tokBal = await tokenContract.balanceOf(account);
        setTokenBalance(ethers.formatUnits(tokBal, 18));
    }
  }

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await setupContracts(accounts[0], provider);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const publishCampaign = async (form) => {
    if (!crowdContract) throw new Error("Wallet not connected");
    const metadata = JSON.stringify({
      title: form.title,
      description: form.description,
      image: form.image || "https://placehold.co/600x400/1e293b/ffffff?text=FunditWID",
      category: form.category
    });
    const goalUnits = ethers.parseUnits(form.goal, 18); 
    const durationSeconds = Math.floor(form.duration * 24 * 60 * 60);
    const tx = await crowdContract.createCampaign(goalUnits, durationSeconds, metadata);
    await tx.wait();
  };

  const getCampaigns = async () => {
    if (!crowdContract) return [];
    try {
      // Use the Contract's runner (which is the wallet) OR fallback to readProvider if we set it up
      // For stability, we just limit the block range
      const currentBlock = await crowdContract.runner.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 5000); // Reduced range to prevent timeouts
      
      const filter = crowdContract.filters.CampaignCreated();
      const events = await crowdContract.queryFilter(filter, fromBlock, currentBlock);

      const allCampaigns = await Promise.all(events.map(async (event) => {
        const id = event.args[0];
        const metadataRaw = event.args[5]; 
        let meta = { title: "Untitled", description: "", image: "", category: "Other" };
        try { if(metadataRaw) meta = JSON.parse(metadataRaw); } catch(e) {}
        const details = await crowdContract.getCampaign(id);
        return {
          id: id,
          owner: details.creator,
          title: meta.title,
          description: meta.description,
          category: meta.category,
          image: meta.image,
          goal: ethers.formatUnits(details.goal, 18),
          raised: ethers.formatUnits(details.raised, 18),
          deadline: Number(details.deadline) * 1000,
          withdrawn: details.withdrawn
        };
      }));
      return allCampaigns.reverse();
    } catch (error) {
      console.error("Fetch Error:", error);
      return [];
    }
  };

  const donateToCampaign = async (id, amount) => {
    if (!crowdContract || !tokenContract) throw new Error("Contracts not ready");
    const amountWei = ethers.parseUnits(amount, 18);
    const toastId = toast.loading("Checking Allowance...");

    try {
      const allowance = await tokenContract.allowance(account, ContractAddress.Crowdfunding);
      if (allowance < amountWei) {
        toast.loading("Step 1/2: Approving Token...", { id: toastId });
        const approveTx = await tokenContract.approve(ContractAddress.Crowdfunding, amountWei);
        await approveTx.wait();
      }

      toast.loading("Step 2/2: Confirming Donation...", { id: toastId });
      const tx = await crowdContract.contribute(id, amountWei);
      await tx.wait();
      
      await updateBalances(); 
      toast.success("Donation Successful!", { id: toastId });
    } catch (error) {
      console.error(error);
      let msg = "Transaction Failed";
      if (error.reason) msg = error.reason;
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <Web3Context.Provider value={{ 
      account, balance, tokenBalance, crowdContract, tokenContract,
      connectWallet, disconnectWallet, 
      publishCampaign, getCampaigns, donateToCampaign, 
      isLoading
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);