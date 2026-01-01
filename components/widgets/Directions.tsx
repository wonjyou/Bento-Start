
import React, { useState } from 'react';
import { MapPin, Navigation, Home, ExternalLink } from 'lucide-react';

interface DirectionsProps {
  userAddress?: string;
  onOpenSettings?: () => void;
}

export const Directions: React.FC<DirectionsProps> = ({ userAddress, onOpenSettings }) => {
  const [destination, setDestination] = useState('');

  const getDirections = () => {
    if (!destination.trim()) return;
    const origin = userAddress ? `&origin=${encodeURIComponent(userAddress)}` : '';
    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <Home size={10} /> {userAddress ? `Starting from ${userAddress}` : 'No start address'}
          </div>
          <button 
            onClick={onOpenSettings}
            className="text-[10px] text-blue-500 hover:underline font-medium"
          >
            {userAddress ? 'Change' : 'Set Start'}
          </button>
        </div>
        
        <div className="relative">
          <input 
            type="text"
            className="w-full bg-white/50 border border-slate-200 rounded-lg py-3 px-4 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all text-slate-800 text-sm"
            placeholder="Where to?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getDirections()}
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>
        <button 
          onClick={getDirections}
          className="w-full py-2 px-4 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Navigation size={16} />
          Go
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <a 
          href="https://maps.google.com" 
          target="_blank" 
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors"
        >
          <ExternalLink size={12} />
          Google Maps
        </a>
      </div>
    </div>
  );
};
