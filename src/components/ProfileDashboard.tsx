import { useState, useEffect } from 'react';
import { User, Activity, Save } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileDashboardProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export function ProfileDashboard({ profile, setProfile }: ProfileDashboardProps) {
  const [formData, setFormData] = useState<UserProfile>({
    fullName: '',
    phone: '',
    address: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    medications: '',
    height: '',
    weight: '',
    dailySteps: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSave = () => {
    setProfile(formData);
    localStorage.setItem('bsafeguard_profile', JSON.stringify(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
          <User size={24} className="mr-3 text-red-600" />
          Personal & Medical Dashboard
        </h2>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
        >
          <Save size={16} className="mr-2" />
          {isSaved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-800 flex items-center border-b border-neutral-100 pb-2">
            <User size={18} className="mr-2 text-neutral-500" />
            Personal Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Full Name</label>
              <input 
                type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Phone Number</label>
              <input 
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Home Address</label>
              <textarea 
                name="address" value={formData.address} onChange={handleChange} rows={3}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                placeholder="123 Safety St, City, State, Zip"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Height</label>
                <input 
                  type="text" name="height" value={formData.height} onChange={handleChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="5'5&quot; / 165cm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Weight</label>
                <input 
                  type="text" name="weight" value={formData.weight} onChange={handleChange}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  placeholder="130 lbs / 59kg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-800 flex items-center border-b border-neutral-100 pb-2">
            <Activity size={18} className="mr-2 text-neutral-500" />
            Medical Information
          </h3>
          <p className="text-xs text-neutral-500 mb-2">This information will be included in your emergency SOS emails to assist first responders.</p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Blood Type</label>
              <input 
                type="text" name="bloodType" value={formData.bloodType} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="O+, A-, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Allergies</label>
              <input 
                type="text" name="allergies" value={formData.allergies} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Peanuts, Penicillin, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Medical Conditions</label>
              <input 
                type="text" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Asthma, Diabetes, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Current Medications</label>
              <input 
                type="text" name="medications" value={formData.medications} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="Inhaler, Insulin, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-1">Daily Step Goal (Activity)</label>
              <input 
                type="text" name="dailySteps" value={formData.dailySteps} onChange={handleChange}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                placeholder="e.g., 10000 steps"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
