import { useState, useEffect } from 'react';
import { SOSButton } from './components/SOSButton';
import { ContactSelector } from './components/ContactSelector';
import { SafetyChatbot } from './components/SafetyChatbot';
import { ProfileDashboard } from './components/ProfileDashboard';
import { EmergencyHistory } from './components/EmergencyHistory';
import { Contact, UserProfile, EmergencyEvent } from './types';
import { Shield, Home, User } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyEvent[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bsafeguard_profile');
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved profile");
      }
    }
    
    const savedHistory = localStorage.getItem('bsafeguard_history');
    if (savedHistory) {
      try {
        setEmergencyHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse saved history");
      }
    }
  }, []);

  const handleLogEvent = (event: EmergencyEvent) => {
    setEmergencyHistory(prev => {
      const newHistory = [event, ...prev];
      localStorage.setItem('bsafeguard_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-neutral-900 font-sans selection:bg-red-200 selection:text-red-900">
      
      {/* Header */}
      <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 z-50">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shadow-sm">
              <Shield size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">BsafeGuard</h1>
          </div>
          
          <div className="flex items-center space-x-1 bg-neutral-100 p-1 rounded-full">
            <button 
              onClick={() => setActiveTab('home')}
              className={cn(
                "flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === 'home' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Home size={16} className="mr-2" />
              Home
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={cn(
                "flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === 'profile' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <User size={16} className="mr-2" />
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        {activeTab === 'home' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: SOS & Controls */}
            <div className="md:col-span-7 flex flex-col space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 flex flex-col items-center">
                <h2 className="text-xl font-semibold mb-6 text-neutral-800">Emergency Trigger</h2>
                <SOSButton 
                  accessToken={accessToken} 
                  selectedContacts={selectedContacts} 
                  userProfile={userProfile}
                  onLogEvent={handleLogEvent}
                />
              </div>

              <ContactSelector 
                accessToken={accessToken}
                setAccessToken={setAccessToken}
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
              />

              <EmergencyHistory history={emergencyHistory} />
            </div>

            {/* Right Column: Assistant */}
            <div className="md:col-span-5">
              <div className="sticky top-24">
                <SafetyChatbot />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <ProfileDashboard profile={userProfile} setProfile={setUserProfile} />
          </div>
        )}
      </main>
      
    </div>
  );
}
