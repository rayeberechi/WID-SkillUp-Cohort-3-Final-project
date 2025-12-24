import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreateCampaign() {
  const { publishCampaign, account } = useWeb3();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    goal: '',
    description: '',
    category: 'Education',
    duration: 30,
    image: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };

  const handleSubmit = async () => {
    // 1. Validation
    if (!form.title || !form.goal || !form.description) {
        toast.error("Please fill in Title, Goal, and Description.");
        return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Waiting for approval...");

    try {
      // 2. Handle Optional Image
      const finalForm = {
        ...form,
        image: form.image.trim() === "" 
          ? "https://placehold.co/600x400/1e293b/ffffff?text=FunditWID+Project" 
          : form.image
      };

      await publishCampaign(finalForm);
      
      toast.success("Campaign Launched!", { id: toastId });
      navigate('/dashboard'); 
    } catch (error) {
      console.error(error);
      const errorMessage = error.reason || error.message || "Failed to launch.";
      toast.error(`Error: ${errorMessage}`, { id: toastId });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 text-white fade-in">
      <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 space-y-8">
        
        {/* Title & Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block mb-2 text-sm text-gray-300">Campaign Title *</label>
            <input 
              id="title"
              type="text" placeholder="Enter title" value={form.title}
              className="w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 focus:border-blue-500 outline-none transition"
              onChange={(e) => handleFormFieldChange('title', e)}
            />
          </div>
          <div>
            <label htmlFor="goal" className="block mb-2 text-sm text-gray-300">Funding Goal (USDC) *</label>
            <input 
              id="goal"
              type="number" placeholder="e.g. 500" value={form.goal}
              className="w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 focus:border-blue-500 outline-none transition"
              onChange={(e) => handleFormFieldChange('goal', e)}
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block mb-2 text-sm text-gray-300">Category</label>
          <select 
            id="category"
            className="w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 focus:border-blue-500 outline-none transition"
            onChange={(e) => handleFormFieldChange('category', e)}
            value={form.category}
          >
            <option>Education</option>
            <option>DeFi</option>
            <option>Gaming</option>
            <option>Charity</option>
            <option>Art</option>
          </select>
        </div>

        {/* Description */}
        <div>
            <label htmlFor="description" className="block mb-2 text-sm text-gray-300">Description *</label>
            <textarea 
              id="description"
              rows="5" placeholder="Describe your project..." value={form.description}
              className="w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 focus:border-blue-500 outline-none transition resize-none"
              onChange={(e) => handleFormFieldChange('description', e)}
            />
        </div>

        {/* Image URL (Optional) */}
        <div>
            <label htmlFor="image" className="block mb-2 text-sm text-gray-300">Image URL (Optional)</label>
            <input 
              id="image"
              type="text" placeholder="https://..." value={form.image}
              className="w-full rounded-xl bg-[#020617] border border-white/10 px-4 py-3 focus:border-blue-500 outline-none transition"
              onChange={(e) => handleFormFieldChange('image', e)}
            />
            <p className="text-xs text-slate-500 mt-2">
              Tip: Use a direct link ending in <b>.jpg</b> or <b>.png</b>.
            </p>
        </div>

        {/* Duration Slider */}
        <div>
           {/* FIX IS HERE: Removed 'block', kept 'flex' */}
           <label htmlFor="duration" className="mb-3 text-sm text-gray-300 flex justify-between w-full">
             <span>Duration</span>
             <span className="text-blue-400 font-bold">{form.duration} Days</span>
           </label>
           <input 
             id="duration"
             type="range" min="7" max="90" defaultValue={form.duration}
             className="w-full accent-blue-600 cursor-pointer"
             onChange={(e) => handleFormFieldChange('duration', e)}
           />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSubmit} disabled={isLoading || !account}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/20'}`}
          >
            {isLoading ? "Processing..." : "Launch Campaign!"}
          </button>
        </div>

      </div>
    </div>
  );
}