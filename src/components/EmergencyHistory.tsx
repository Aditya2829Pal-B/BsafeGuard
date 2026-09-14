import { Clock, AlertCircle } from 'lucide-react';
import { EmergencyEvent } from '../types';

interface EmergencyHistoryProps {
  history: EmergencyEvent[];
}

export function EmergencyHistory({ history }: EmergencyHistoryProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mt-8">
      <div className="p-4 border-b border-neutral-100 flex items-center bg-neutral-50/50">
        <Clock size={18} className="mr-2 text-neutral-600" />
        <h3 className="font-semibold text-neutral-800">Emergency History</h3>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">No emergencies logged.</p>
        ) : (
          <div className="space-y-4">
            {history.map(event => (
              <div key={event.id} className="flex flex-col border-l-2 border-red-500 pl-3">
                <span className="text-xs text-neutral-500 font-medium mb-1">{event.timestamp}</span>
                <ul className="text-sm text-neutral-800 space-y-1">
                  {event.actions.map((act, i) => (
                    <li key={i} className="flex items-center">
                      <AlertCircle size={14} className="mr-1.5 text-red-500" />
                      {act}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
