import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellOff, Calendar, AlertTriangle, CheckCircle, Info, X, 
  MapPin, ShieldAlert, Sparkles, Send, Volume2, VolumeX, Eye
} from 'lucide-react';
import { InspectionItem } from '../types';

interface InspectionNotificationCenterProps {
  inspections: InspectionItem[];
  onTriggerToast: (message: string) => void;
  pushNotificationsEnabled: boolean;
  onTogglePushNotifications: (enabled: boolean) => void;
}

export default function InspectionNotificationCenter({
  inspections,
  onTriggerToast,
  pushNotificationsEnabled,
  onTogglePushNotifications,
}: InspectionNotificationCenterProps) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [dismissedReminders, setDismissedReminders] = useState<string[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<InspectionItem[]>([]);
  const [hasAudio, setHasAudio] = useState<boolean>(true);

  // Check initial Notification API support & status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Compute upcoming reminders based on inspections
  useEffect(() => {
    // Current date reference: 2026-06-28
    const todayStr = 'Jun 28, 2026';
    const today = new Date('2026-06-28T12:00:00');

    const upcoming = inspections.filter(item => {
      if (item.status === 'COMPLETED') return false;
      if (dismissedReminders.includes(item.id)) return false;

      // Parse the date (format: "Jun 28, 2026")
      try {
        const itemDate = new Date(item.date + 'T12:00:00');
        const diffTime = itemDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Return if scheduled for today, tomorrow, or within next 7 days
        return diffDays >= 0 && diffDays <= 7;
      } catch (e) {
        return false;
      }
    });

    setUpcomingReminders(upcoming);
  }, [inspections, dismissedReminders]);

  // Request browser Notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      onTriggerToast('Desktop Notifications are not supported in your current browser. Falling back to in-app toast reminders.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        onTriggerToast('🔔 Desktop notifications successfully enabled! We will alert you of upcoming inspections.');
        onTogglePushNotifications(true);
        triggerNativeNotification('InspectPro Alerts Active', {
          body: 'You will now receive native alerts for field site inspections.',
          icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAbo2K_N_Ec9ACPbwE3mhSiczHJ-PbLOLj7N8ofTbVJesncyYu0cZuImuj3f1clu6Xyo-LWwUD_WOuLF1BxNvsNdPOS-4viE8LbpjT0zC3d_w_ojX1L72O7HjTS_Npz72QrlgBTdtG3Sl3XqWTdDUS2rb9B0Fbnr-oG6VMUEykZ-T0Mu1hdHr7p_7_z8Ij-pwuGDWp72kx73sELA0X8mnsSH77V8eCpFchbjNcRbtkzGjKpV-wGFTaZ2NpvBoAk8G1yYJ60CZ78No',
        });
      } else {
        onTriggerToast('Notification permission denied. Using in-app alerts.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Trigger browser or in-app notification helper
  const triggerNativeNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted' && pushNotificationsEnabled) {
      try {
        const notification = new Notification(title, options);
        if (hasAudio) {
          playNotificationBeep();
        }
        notification.onclick = () => {
          window.focus();
        };
      } catch (err) {
        console.warn('Native notification failed, falling back to in-app sound.', err);
        if (hasAudio) playNotificationBeep();
      }
    }
  };

  // Standard synth beep for sound verification
  const playNotificationBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Simple double-beep high-frequency compliance tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.12); // High sweep
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio context might be blocked by browser policy
    }
  };

  // Test notification helper
  const triggerTestNotification = () => {
    const messageText = "⚠️ DEMO ALERT: Westside Commercial Plaza vetting is scheduled for today!";
    
    // In-app toast fallback
    onTriggerToast(messageText);

    // Native browser pop-up
    if ('Notification' in window && Notification.permission === 'granted' && pushNotificationsEnabled) {
      triggerNativeNotification('InspectPro Site Reminder', {
        body: 'Westside Commercial Plaza: Termite inspection scheduled for today, Jun 28.',
        tag: 'inspectpro-demo',
        requireInteraction: true
      });
    } else {
      if (hasAudio) {
        playNotificationBeep();
      }
    }
  };

  const handleDismissReminder = (id: string, name: string) => {
    setDismissedReminders(prev => [...prev, id]);
    onTriggerToast(`Muted reminder for "${name}"`);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#dde1ff]/60 rounded-xl text-[#00288e] dark:bg-blue-900/40 dark:text-blue-400">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Active Calendar Reminders</h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time alerts for field technicians</p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sound toggle */}
          <button
            onClick={() => setHasAudio(!hasAudio)}
            className={`p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer`}
            title={hasAudio ? "Mute alert beep" : "Unmute alert beep"}
          >
            {hasAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Permission status request */}
          {permissionStatus !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1.5 bg-[#dde1ff]/70 hover:bg-[#dde1ff] text-[#00288e] text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          ) : (
            <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-xl border border-emerald-100 flex items-center gap-1 shrink-0">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>System Native Active</span>
            </span>
          )}

          {/* Test Trigger Button */}
          <button
            onClick={triggerTestNotification}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulate Alarm</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {upcomingReminders.length === 0 ? (
          <div className="text-center py-4 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
            <BellOff className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No critical inspections scheduled in the next 7 days.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">We will notify you here automatically when vettings approach.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <AnimatePresence>
              {upcomingReminders.map((item) => {
                // Check if today: Jun 28, 2026
                const isToday = item.date === 'Jun 28, 2026';
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3.5 rounded-xl border relative flex flex-col justify-between transition-all group ${
                      isToday 
                        ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/40' 
                        : 'bg-indigo-50/40 border-indigo-100 hover:bg-indigo-50/80 dark:bg-slate-900/60 dark:border-slate-800'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
                      {isToday ? (
                        <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider rounded-md animate-pulse">
                          HAPPENING TODAY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded-md">
                          UPCOMING
                        </span>
                      )}
                      
                      {/* Dismiss button */}
                      <button
                        onClick={() => handleDismissReminder(item.id, item.propertyName)}
                        className="p-1 rounded-md hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Dismiss alert"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 pr-20">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#00288e]" />
                        <span>{item.date} • {item.type}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{item.propertyName}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.address}</span>
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 font-medium text-slate-500">
                        <span className="font-extrabold">Status:</span>
                        <span className={`font-bold ${isToday ? 'text-rose-600' : 'text-amber-600'}`}>{item.status}</span>
                      </div>
                      
                      {/* Action trigger native notification */}
                      <button
                        onClick={() => {
                          onTriggerToast(`Manual notice triggered for ${item.propertyName}`);
                          triggerNativeNotification(`Site Visit Required`, {
                            body: `${item.propertyName}: ${item.type} scheduled for ${item.date}.`,
                            tag: item.id
                          });
                        }}
                        className="text-[#00288e] hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Force Ping</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Educational Notice footer */}
      <div className="flex items-start gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-medium">
        <Info className="w-4 h-4 text-[#00288e] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Pro-Inspector Field Work Notice:</strong> Standard guidelines suggest checking compliance targets at least 24 hours prior to dispatch. If browser notification access is blocked, InspectPro falls back automatically to embedded toast announcements.
        </p>
      </div>
    </div>
  );
}
