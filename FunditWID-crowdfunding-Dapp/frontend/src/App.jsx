import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar'; 
import { useWeb3 } from './context/Web3Context';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Explore from './pages/Explore';
import MyDonations from './pages/MyDonations';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar />
      <div className="flex-1 md:ml-64 p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default function App() {
  const { account } = useWeb3();
  
  return (
    <>
      {/* UPDATED TOAST CONFIGURATION */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        
        <Route element={<Layout />}> 
          <Route path="/dashboard" element={account ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/create" element={account ? <CreateCampaign /> : <Navigate to="/" />} />
          <Route path="/campaign/:id" element={<CampaignDetails />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/donations" element={account ? <MyDonations /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
}