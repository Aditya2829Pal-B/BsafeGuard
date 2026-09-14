import { useState } from 'react';
import { Users, LogIn, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Contact } from '../types';

interface ContactSelectorProps {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  selectedContacts: Contact[];
  setSelectedContacts: (contacts: Contact[]) => void;
}

export function ContactSelector({ accessToken, setAccessToken, selectedContacts, setSelectedContacts }: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    // @ts-ignore
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events',
      callback: (response: any) => {
        if (response.error !== undefined) {
          console.error("Auth error", response);
          return;
        }
        setAccessToken(response.access_token);
        fetchContacts(response.access_token);
      },
    });
    client.requestAccessToken();
  };

  const fetchContacts = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.connections) {
        // Filter out contacts without emails, since we rely on email for SOS right now.
        const validContacts = data.connections.filter((c: Contact) => c.emailAddresses && c.emailAddresses.length > 0);
        setContacts(validContacts);
      }
    } catch (e) {
      console.error("Error fetching contacts", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleContact = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.resourceName === contact.resourceName);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.resourceName !== contact.resourceName));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  if (!accessToken) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 flex flex-col items-center text-center space-y-4">
        <div className="bg-red-50 p-3 rounded-full text-red-600">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Authorize Security Services</h3>
          <p className="text-sm text-neutral-500 mt-1">Connect your Google account to enable emergency emails and select trusted contacts.</p>
        </div>
        <button 
          onClick={handleLogin}
          className="flex items-center px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
        >
          <LogIn size={18} className="mr-2" />
          Connect Google Account
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <h3 className="font-semibold text-neutral-800 flex items-center">
          <Users size={18} className="mr-2 text-red-600" />
          Emergency Contacts
        </h3>
        <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
          {selectedContacts.length} Selected
        </span>
      </div>

      <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-4 text-center text-sm text-neutral-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-500">No contacts with email addresses found.</div>
        ) : (
          <div className="space-y-1">
            {contacts.map((contact) => {
              const isSelected = selectedContacts.some(c => c.resourceName === contact.resourceName);
              const name = contact.names?.[0]?.displayName || 'Unknown';
              const email = contact.emailAddresses?.[0]?.value || '';
              
              return (
                <button
                  key={contact.resourceName}
                  onClick={() => toggleContact(contact)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-red-50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${isSelected ? 'text-red-900' : 'text-neutral-900'}`}>{name}</p>
                    <p className={`text-xs ${isSelected ? 'text-red-700/70' : 'text-neutral-500'}`}>{email}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={20} className="text-red-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
