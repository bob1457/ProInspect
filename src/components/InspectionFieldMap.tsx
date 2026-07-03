import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { InspectionItem } from '../types';
import { MapPin, Calendar, Clock, ClipboardList, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

interface InspectionFieldMapProps {
  inspections: InspectionItem[];
  onSelectInspection: (item: InspectionItem) => void;
}

// Map inspection items to Austin, TX coordinates deterministically
const getInspectionCoords = (item: InspectionItem) => {
  const name = item.propertyName.toLowerCase();
  if (name.includes('oakwood')) return { lat: 30.2872, lng: -97.7431 };
  if (name.includes('westside')) return { lat: 30.2750, lng: -97.7750 };
  if (name.includes('summit')) return { lat: 30.3450, lng: -97.7200 };
  if (name.includes('canyon')) return { lat: 30.3012, lng: -97.7543 };
  if (name.includes('north loop')) return { lat: 30.3188, lng: -97.7221 };
  if (name.includes('barton springs')) return { lat: 30.2580, lng: -97.7712 };
  
  // Deterministic fallback based on id hash so it stays consistent on re-renders
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = item.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) / 1500) - 0.03; // ~ -0.03 to +0.03
  const lngOffset = (((Math.abs(hash) >> 8) % 100) / 1500) - 0.03;
  return { lat: 30.2672 + latOffset, lng: -97.7431 + lngOffset };
};

// Sub-component to manage marker state and InfoWindow
function InspectionMarker({ 
  item, 
  onSelect 
}: { 
  key?: string;
  item: InspectionItem; 
  onSelect: (item: InspectionItem) => void;
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);
  const coords = getInspectionCoords(item);

  // Status-based pin customization
  let pinBgColor = '#6366f1'; // Default
  let statusLabel = 'Scheduled';
  
  if (item.status === 'COMPLETED') {
    pinBgColor = '#10b981'; // Green
    statusLabel = 'Completed';
  } else if (item.status === 'IN_PROGRESS') {
    pinBgColor = '#f59e0b'; // Amber
    statusLabel = 'In Progress';
  }

  return (
    <>
      <AdvancedMarker 
        ref={markerRef} 
        position={coords} 
        onClick={() => setIsOpen(true)}
        title={item.propertyName}
      >
        <Pin background={pinBgColor} glyphColor="#ffffff" scale={1.1} />
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow anchor={marker} onCloseClick={() => setIsOpen(false)}>
          <div className="p-2.5 max-w-xs font-sans text-slate-800 space-y-2">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-sm text-slate-900 leading-tight">{item.propertyName}</h4>
              <span 
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0"
                style={{
                  backgroundColor: item.status === 'COMPLETED' ? '#ecfdf5' : item.status === 'IN_PROGRESS' ? '#fffbp2' : '#f0f2fe',
                  color: item.status === 'COMPLETED' ? '#047857' : item.status === 'IN_PROGRESS' ? '#b45309' : '#4338ca'
                }}
              >
                {statusLabel}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#00288e]" />
                <span className="truncate">{item.address}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <ClipboardList className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>Type: <strong className="font-semibold text-slate-700">{item.type}</strong></span>
              </div>
              {item.score && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                  <span>Score: <strong className="font-bold text-emerald-600">{item.score}%</strong></span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className="w-full mt-2 py-1.5 bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              Open Inspection Details
            </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function InspectionFieldMap({ inspections, onSelectInspection }: InspectionFieldMapProps) {
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // Austin, TX Center coordinates
  const defaultCenter = { lat: 30.2850, lng: -97.7431 };

  if (!hasValidKey) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 flex items-center justify-center min-h-[480px] shadow-xs">
        <div className="text-center max-w-lg space-y-5">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 text-[#00288e] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Key className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Google Maps Platform Key Required</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              To enable interactive field inspection tracking maps, please configure your Google Maps API Key in AI Studio secrets.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 text-left space-y-3 shadow-xs">
            <p className="text-xs font-bold text-[#00288e] uppercase tracking-wider flex items-center gap-1.5">
              <span>Setup Steps</span>
            </p>
            <ol className="text-xs text-slate-600 list-decimal pl-4 space-y-2 font-medium">
              <li>
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-bold"
                >
                  Get an API Key
                </a> from Google Cloud Console.
              </li>
              <li>
                When the <strong>"Enter your environment variable to continue"</strong> popup appears, paste your key.
              </li>
              <li>
                Or manually: Click the <strong>Settings (⚙️ gear icon, top-right)</strong> &rarr; <strong>Secrets</strong> &rarr; add <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name and paste your key.
              </li>
            </ol>
          </div>

          <div className="text-xs font-bold text-slate-400 bg-slate-100/80 px-4 py-2.5 rounded-xl border border-slate-200/50">
            Once added, the application builds automatically and unlocks the dynamic mapping visualizer!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Map Header / Legend */}
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500">
        <span className="text-slate-800">Field Activity Map ({inspections.length} Locations plotted)</span>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Actual Google Map */}
      <div className="h-[460px] w-full relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={11.5}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            {inspections.map(item => (
              <InspectionMarker 
                key={item.id} 
                item={item} 
                onSelect={onSelectInspection} 
              />
            ))}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
