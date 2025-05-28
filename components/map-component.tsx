"use client";

import { useEffect, useState, useRef } from 'react';
import { DeliverySession, Location } from '@/types';
import { MapPinIcon, TruckIcon } from 'lucide-react';

interface MapComponentProps {
  deliverySession?: DeliverySession | null;
  initialLocation?: Location;
  destination?: Location;
  className?: string;
}

export default function MapComponent({
  deliverySession,
  initialLocation,
  destination,
  className,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default locations (New York)
  const defaultLocation = { lat: 40.7128, lng: -74.006, timestamp: Date.now() };
  const currentLocation = deliverySession?.currentLocation || initialLocation || defaultLocation;
  const destinationLocation = destination || { lat: currentLocation.lat + 0.01, lng: currentLocation.lng + 0.01, timestamp: 0 };

  // Load Leaflet and initialize map
  useEffect(() => {
    // Skip if map is already loaded or if we're in a server-side environment
    if (mapLoaded || typeof window === 'undefined') return;

    // Dynamically load Leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);

    // Dynamically load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up
      document.head.removeChild(linkElement);
      document.head.removeChild(script);
    };
  }, [mapLoaded]);

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([currentLocation.lat, currentLocation.lng], 15);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom icon for delivery partner
    const deliveryIcon = L.divIcon({
      html: `<div class="p-1 bg-blue-600 rounded-full text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12 22s-8-4.5-8-11.8a8 8 0 0 1 16 0c0 7.3-8 11.8-8 11.8z"/></svg>
            </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Custom icon for destination
    const destinationIcon = L.divIcon({
      html: `<div class="p-1 bg-orange-600 rounded-full text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    // Add delivery partner marker
    markerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon: deliveryIcon }).addTo(map);
    
    // Add destination marker
    L.marker([destinationLocation.lat, destinationLocation.lng], { icon: destinationIcon })
      .addTo(map)
      .bindPopup('Delivery Destination')
      .openPopup();

    // Add polyline for route if available
    if (deliverySession?.route && deliverySession.route.length > 1) {
      const routePoints = deliverySession.route.map(loc => [loc.lat, loc.lng]);
      polylineRef.current = L.polyline(routePoints, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(map);
    }

    // Add route from current location to destination
    L.polyline([
      [currentLocation.lat, currentLocation.lng],
      [destinationLocation.lat, destinationLocation.lng]
    ], { color: 'gray', weight: 2, dashArray: '5, 10', opacity: 0.6 }).addTo(map);

    // Store map instance for later use
    mapInstanceRef.current = map;

    return () => {
      // Clean up map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [mapLoaded, currentLocation, destinationLocation, deliverySession]);

  // Update marker position and route when location changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markerRef.current) return;
    
    const L = (window as any).L;
    if (!L) return;

    // Update marker position
    markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
    
    // Update route if available
    if (deliverySession?.route && deliverySession.route.length > 1) {
      if (polylineRef.current) {
        mapInstanceRef.current.removeLayer(polylineRef.current);
      }
      
      const routePoints = deliverySession.route.map(loc => [loc.lat, loc.lng]);
      polylineRef.current = L.polyline(routePoints, { color: 'blue', weight: 3, opacity: 0.7 }).addTo(mapInstanceRef.current);
    }
    
    // Center map on current location with animation
    mapInstanceRef.current.panTo([currentLocation.lat, currentLocation.lng], { animate: true, duration: 1 });
  }, [mapLoaded, currentLocation, deliverySession]);

  return (
    <div className={`relative rounded-lg overflow-hidden border shadow-sm ${className || 'h-96'}`}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500 flex flex-col items-center">
            <MapPinIcon className="h-10 w-10 animate-bounce" />
            <p>Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}