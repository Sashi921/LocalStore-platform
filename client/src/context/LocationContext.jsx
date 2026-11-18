import React, { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_LOCATION = {
  pincode: '110001',
  name: 'Connaught Place, New Delhi',
  lat: 28.6328,
  lng: 77.2197
};

export const PRESET_LOCATIONS = [
  { pincode: '110001', name: 'Connaught Place / Central Delhi', lat: 28.6328, lng: 77.2197 },
  { pincode: '110005', name: 'Karol Bagh & Patel Nagar', lat: 28.6517, lng: 77.1906 },
  { pincode: '110016', name: 'Hauz Khas / Green Park', lat: 28.5494, lng: 77.2001 },
  { pincode: '110006', name: 'Old Delhi / Chandni Chowk', lat: 28.6506, lng: 77.2303 },
  { pincode: '110017', name: 'Panchsheel / Malviya Nagar', lat: 28.5355, lng: 77.2100 }
];

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocationState] = useState(() => {
    const saved = localStorage.getItem('localstore_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const setLocation = (newLoc) => {
    setLocationState(newLoc);
    localStorage.setItem('localstore_location', JSON.stringify(newLoc));
  };

  const detectCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const detected = {
            pincode: '110001',
            name: 'Current GPS Location',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(detected);
          resolve(detected);
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isModalOpen,
        setIsModalOpen,
        detectCurrentLocation,
        presetLocations: PRESET_LOCATIONS
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
