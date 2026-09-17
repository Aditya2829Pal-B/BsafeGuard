import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Video, MapPin } from 'lucide-react';
import { Contact, UserProfile, EmergencyEvent } from '../types';

interface SOSButtonProps {
  accessToken: string | null;
  selectedContacts: Contact[];
  userProfile: UserProfile | null;
  onLogEvent: (event: EmergencyEvent) => void;
}

export function SOSButton({ accessToken, selectedContacts, userProfile, onLogEvent }: SOSButtonProps) {
  const [taps, setTaps] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [locationStr, setLocationStr] = useState<string>('');
  const [sosSent, setSosSent] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const eventStartTimeRef = useRef<string | null>(null);

  // Handle multi-tap logic
  useEffect(() => {
    let timer: any;
    if (taps > 0) {
      timer = setTimeout(() => {
        executeActions(taps);
        setTaps(0);
      }, 1200); // 1.2s window to accumulate taps
    }
    return () => clearTimeout(timer);
  }, [taps]);

  const handleTap = () => {
    setTaps(prev => prev + 1);
  };

  const executeActions = async (tapCount: number) => {
    console.log(`Executed SOS actions for ${tapCount} taps`);
    
    const actionsTaken: string[] = [];
    let currentLoc = locationStr;

    // 1 Tap: Start Recording + Location
    if (tapCount >= 1 && !isRecording) {
      await startRecordingAndLocation();
      actionsTaken.push("Location tracked & Media recorded");
    }

    // 2 Taps: Send Email
    if (tapCount >= 2) {
      const emailSent = await sendSosEmail();
      if (emailSent) {
        actionsTaken.push("SOS Email dispatched to contacts");
      }
    }

    // 3 Taps: Emergency Call
    if (tapCount >= 3) {
      callPolice();
      actionsTaken.push("Emergency Services dialled (911)");
    }
    
    if (actionsTaken.length > 0) {
      onLogEvent({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        actions: actionsTaken,
        location: locationStr || currentLoc || "Fetching..."
      });
    }
  };

  const startRecordingAndLocation = async () => {
    try {
      if (!eventStartTimeRef.current) {
        eventStartTimeRef.current = new Date().toLocaleString();
      }

      // Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationStr(`${pos.coords.latitude},${pos.coords.longitude}`);
          },
          (err) => console.error("Geolocation error", err),
          { enableHighAccuracy: true }
        );
      }

      // Media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start(1000); // chunk every 1 second
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start media", e);
    }
  };

  const sendSosEmail = async (): Promise<boolean> => {
    if (!accessToken) {
      alert("Please authorize your Google account first to send emails.");
      return false;
    }
    if (selectedContacts.length === 0) {
      alert("No emergency contacts selected.");
      return false;
    }

    try {
      // Ensure we have a location before sending, give it a moment if missing
      let currentLoc = locationStr;
      if (!currentLoc && navigator.geolocation) {
         const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
             navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
         });
         currentLoc = `${pos.coords.latitude},${pos.coords.longitude}`;
         setLocationStr(currentLoc);
      }

      const emails = selectedContacts
        .map(c => c.emailAddresses?.[0]?.value)
        .filter(Boolean) as string[];

      const [lat, lng] = currentLoc.split(',');

      const res = await fetch('/api/send-sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          emails,
          location: { lat, lng },
          timestamp: new Date().toLocaleString(),
          profile: userProfile
        })
      });

      if (res.ok) {
        setSosSent(true);
        setTimeout(() => setSosSent(false), 5000);
        return true;
      } else {
        const data = await res.json();
        alert(`Failed to send SOS: ${data.error}`);
        return false;
      }
    } catch (e) {
      console.error(e);
      alert("Failed to send SOS email.");
      return false;
    }
  };

  const callPolice = () => {
    window.location.href = "tel:911";
  };

  const concludeEvent = async () => {
    if (!accessToken) {
       alert("Please authorize your Google account first to send reports.");
       return;
    }
    
    setIsConcluding(true);
    
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Wait a brief moment to ensure final chunks are processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let mediaBase64 = '';
    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      mediaBase64 = await new Promise<string>((resolve) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result as string);
         reader.readAsDataURL(blob);
      });
    }

    try {
      const emails = selectedContacts
        .map(c => c.emailAddresses?.[0]?.value)
        .filter(Boolean) as string[];

      const [lat, lng] = locationStr.split(',');

      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          emails,
          location: { lat, lng },
          startTime: eventStartTimeRef.current,
          endTime: new Date().toLocaleString(),
          profile: userProfile,
          mediaBase64
        })
      });

      if (res.ok) {
        alert("Event Concluded. Summary report sent successfully to emergency contacts.");
        onLogEvent({
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          actions: ["Event Concluded & Report Sent"],
          location: locationStr
        });
      } else {
        const data = await res.json();
        alert(`Failed to send report: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to send report email.");
    } finally {
      // Clean up streams
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      setIsRecording(false);
      setLocationStr('');
      setIsConcluding(false);
      eventStartTimeRef.current = null;
      recordedChunksRef.current = [];
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-md mx-auto">
      
      {/* Huge Panic Button */}
      <button 
        onClick={handleTap}
        className="relative flex items-center justify-center w-64 h-64 rounded-full bg-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] active:scale-95 transition-transform overflow-hidden group"
      >
        <div className="absolute inset-0 bg-red-500 opacity-0 group-active:opacity-20 rounded-full transition-opacity"></div>
        <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-30 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="flex flex-col items-center text-white z-10">
          <AlertTriangle size={64} className="mb-2" />
          <span className="text-3xl font-bold tracking-wider">SOS</span>
          {taps > 0 && <span className="absolute bottom-8 text-xl font-bold bg-white text-red-600 px-3 py-1 rounded-full">{taps}</span>}
        </div>
      </button>

      {/* Instructions */}
      <div className="bg-white/10 p-4 rounded-xl text-center w-full shadow-sm border border-neutral-100">
        <ul className="text-sm text-neutral-600 space-y-2">
          <li className="flex items-center justify-center"><span className="font-bold mr-2 w-16 text-right">1 Tap:</span> Record & Track Location</li>
          <li className="flex items-center justify-center"><span className="font-bold mr-2 w-16 text-right">2 Taps:</span> Email Emergency Contacts</li>
          <li className="flex items-center justify-center text-red-600"><span className="font-bold mr-2 w-16 text-right">3 Taps:</span> Call 911 / Police</li>
        </ul>
      </div>

      {/* Status Badges */}
      <div className="flex gap-4">
        {isRecording && (
          <div className="flex items-center text-red-500 bg-red-50 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            <Video size={16} className="mr-1.5" /> Recording
          </div>
        )}
        {locationStr && (
          <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
            <MapPin size={16} className="mr-1.5" /> Location Active
          </div>
        )}
        {sosSent && (
          <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
             SOS Email Sent
          </div>
        )}
      </div>

      {/* Hidden Camera Preview (for recording proof) */}
      <div className={`overflow-hidden rounded-lg shadow-lg border border-neutral-200 transition-all ${isRecording ? 'h-48 w-full opacity-100' : 'h-0 opacity-0'}`}>
         <video ref={videoRef} className="w-full h-full object-cover bg-black" muted playsInline />
      </div>

      {isRecording && (
        <button 
          onClick={concludeEvent}
          disabled={isConcluding}
          className="w-full mt-4 bg-neutral-900 text-white font-semibold py-3 rounded-xl shadow-sm hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          {isConcluding ? 'Sending Report...' : 'Conclude SOS & Send Report'}
        </button>
      )}

    </div>
  );
}
