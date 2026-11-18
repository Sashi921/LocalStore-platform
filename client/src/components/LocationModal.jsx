import React, { useState } from 'react';
import { MapPin, X, Navigation, Check } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

export default function LocationModal() {
  const { location, setLocation, isModalOpen, setIsModalOpen, presetLocations, detectCurrentLocation } = useLocation();
  const { showToast } = useToast();

  const [pincodeInput, setPincodeInput] = useState(location.pincode || '');
  const [areaInput, setAreaInput] = useState(location.name || '');
  const [detecting, setDetecting] = useState(false);

  if (!isModalOpen) return null;

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      showToast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }

    setLocation({
      pincode: pincodeInput.trim(),
      name: areaInput.trim() || `PIN ${pincodeInput.trim()}, New Delhi`,
      lat: 28.6328, // Default central anchor
      lng: 77.2197
    });

    showToast(`Location updated to ${pincodeInput.trim()}`, 'success');
    setIsModalOpen(false);
  };

  const handleSelectPreset = (preset) => {
    setLocation(preset);
    showToast(`Delivering to ${preset.name}`, 'success');
    setIsModalOpen(false);
  };

  const handleDetectGPS = async () => {
    try {
      setDetecting(true);
      await detectCurrentLocation();
      showToast('Current GPS location detected successfully!', 'success');
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Could not fetch GPS location', 'error');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Select Your Neighborhood</h3>
              <p className="text-xs text-slate-500">Discover shops delivering to your exact doorstep</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Detect Button */}
        <div className="mt-5">
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors border border-brand-200"
          >
            <Navigation className={`w-4 h-4 text-brand-600 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting GPS coordinates...' : 'Use Current Device Location (GPS)'}</span>
          </button>
        </div>

        {/* Custom PIN Code Form */}
        <form onSubmit={handleCustomSubmit} className="mt-5 space-y-3">
          <div className="text-xs font-semibold text-slate-600">Enter PIN Code</div>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 110001"
              value={pincodeInput}
              onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
              className="w-32 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
            />
            <input
              type="text"
              placeholder="Locality / Landmark name"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Presets List */}
        <div className="mt-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Popular Neighborhoods
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {presetLocations.map((preset) => {
              const isSelected = location.pincode === preset.pincode;
              return (
                <button
                  key={preset.pincode}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors ${
                    isSelected 
                      ? 'bg-brand-50 text-brand-900 font-bold border border-brand-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{preset.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">PIN {preset.pincode}</span>
                    {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
