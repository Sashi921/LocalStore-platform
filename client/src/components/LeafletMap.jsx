import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LeafletMap({ shops = [], center = [28.6328, 77.2197], zoom = 13, onSelectShop }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map instance already exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add Customer Marker (Blue Pulse)
    const customerIcon = L.divIcon({
      className: 'custom-customer-marker',
      html: `
        <div style="background-color: #2563eb; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(37,99,235,0.6); position: relative;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #3b82f6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker(center, { icon: customerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #1e3a8a;">📍 Your Delivery Location</strong>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Nearby stores are shown around you</div>
        </div>
      `);
    markersRef.current.push(userMarker);

    // Add Shop Markers (Emerald Pin)
    shops.forEach(shop => {
      if (!shop.latitude || !shop.longitude) return;

      const shopIcon = L.divIcon({
        className: 'custom-shop-marker',
        html: `
          <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4); border: 2px solid white; cursor: pointer; transform: translate(-50%, -50%);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 10V7"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([shop.latitude, shop.longitude], { icon: shopIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 2px;">${shop.name}</div>
            <div style="color: #059669; font-weight: 600; font-size: 11px;">🏷️ ${shop.category}</div>
            <div style="color: #475569; font-size: 11px; margin-top: 4px;">📍 ${shop.address}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px;">
              <span>⭐ <strong>${shop.rating || 4.8}</strong></span>
              <span style="color: ${shop.is_open_now ? '#059669' : '#dc2626'}; font-weight: bold;">
                ${shop.is_open_now ? '● Open' : '● Closed'}
              </span>
            </div>
            ${shop.distance_km !== null && shop.distance_km !== undefined ? `
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">🚗 ${shop.distance_km} km away</div>
            ` : ''}
            <button id="view-shop-${shop.id}" style="margin-top: 8px; width: 100%; padding: 6px; background-color: #059669; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
              Visit Store
            </button>
          </div>
        `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-shop-${shop.id}`);
        if (btn && onSelectShop) {
          btn.onclick = () => onSelectShop(shop);
        }
      });

      markersRef.current.push(marker);
    });

    // Cleanup
    return () => {
      // Keep map instance mounted for performance
    };
  }, [shops, center, zoom]);

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
    </div>
  );
}
