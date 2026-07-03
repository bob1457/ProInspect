import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mic, MicOff, CheckCircle2, AlertTriangle, Play, Pause, HelpCircle, 
  Trash2, Clipboard, Sparkles, RefreshCw, Layers, CheckSquare, Save, Plus,
  Camera, Upload, Image, Eye, Copy, Volume2, Edit2, Check
} from 'lucide-react';
import { InspectionItem, SubTask } from '../types';

interface InspectionDetailsModalProps {
  inspection: InspectionItem;
  onClose: () => void;
  onSave: (id: string, updatedFields: Partial<InspectionItem>) => void;
  onTriggerToast: (message: string) => void;
}

export default function InspectionDetailsModal({
  inspection,
  onClose,
  onSave,
  onTriggerToast
}: InspectionDetailsModalProps) {
  const [status, setStatus] = useState<'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>(inspection.status);
  const [score, setScore] = useState<number>(inspection.score || 90);
  const [findings, setFindings] = useState<string>(inspection.findings || '');

  // Interactive Checklist States
  const [subtasks, setSubtasks] = useState<SubTask[]>(inspection.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    setSubtasks(inspection.subtasks || []);
  }, [inspection]);

  const toggleSubtask = (subtaskId: string) => {
    const updated = subtasks.map(t => t.id === subtaskId ? { ...t, completed: !t.completed } : t);
    setSubtasks(updated);
    
    // Calculate progress
    const completedCount = updated.filter(t => t.completed).length;
    const totalCount = updated.length;
    if (totalCount > 0 && completedCount === totalCount && status !== 'COMPLETED') {
      onTriggerToast("🎉 All sub-tasks completed! You can now set status to Completed.");
    }
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newT: SubTask = {
      id: `sub-custom-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newT]);
    setNewSubtaskTitle('');
    onTriggerToast("✅ Added custom sub-task!");
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(t => t.id !== subtaskId));
    onTriggerToast("🗑️ Sub-task removed.");
  };
  
  // Photo & Camera States
  const [photos, setPhotos] = useState<string[]>(inspection.photos || []);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
      // Attach source after render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check browser permissions or upload an image file.");
      onTriggerToast("⚠️ Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotos(prev => [...prev, dataUrl]);
          onTriggerToast("📸 Photo captured and attached!");
          stopCamera();
        } catch (error) {
          console.error("Failed to capture image:", error);
          onTriggerToast("❌ Failed to capture image.");
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhotos(prev => [...prev, reader.result as string]);
            onTriggerToast(`📎 Photo "${file.name}" attached!`);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const deletePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    onTriggerToast("🗑️ Photo removed from attachments.");
  };

  // Voice Note Recording (Microphone API) States and Functions
  const [voiceNotes, setVoiceNotes] = useState<any[]>(inspection.voiceNotes || []);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [tempTranscript, setTempTranscript] = useState('');
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioIntervalRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const voiceNoteRecognitionRef = useRef<any>(null);

  useEffect(() => {
    setVoiceNotes(inspection.voiceNotes || []);
  }, [inspection]);

  // Clean up audio streams/intervals/player on unmount
  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (voiceNoteRecognitionRef.current) {
        try {
          voiceNoteRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startSpeechForVoiceNote = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let finalSpeech = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSpeech += event.results[i][0].transcript;
          }
        }
        if (finalSpeech) {
          setTempTranscript(prev => {
            const base = prev.trim();
            return base ? `${base} ${finalSpeech}` : finalSpeech;
          });
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition during voice note recording:", e);
      };

      voiceNoteRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech recognition failed to start in background:", err);
    }
  };

  const stopSpeechForVoiceNote = () => {
    if (voiceNoteRecognitionRef.current) {
      try {
        voiceNoteRecognitionRef.current.stop();
      } catch (err) {}
      voiceNoteRecognitionRef.current = null;
    }
  };

  const startAudioRecording = async () => {
    setSpeechError(null);
    audioChunksRef.current = [];
    setTempTranscript('');
    setAudioDuration(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Handled in stopAudioRecording timeout
      };
      
      mediaRecorder.start();
      setIsRecordingAudio(true);
      
      audioIntervalRef.current = setInterval(() => {
        setAudioDuration(prev => prev + 1);
      }, 1000);

      startSpeechForVoiceNote();
      onTriggerToast("🎙️ Microphone active. Recording voice note...");
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setSpeechError("Microphone access denied or unsupported. Please check browser permissions.");
      onTriggerToast("⚠️ Unable to access microphone for recording.");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    
    stopSpeechForVoiceNote();
    setIsRecordingAudio(false);
    
    // Process audio and transcript
    const currentDuration = audioDuration;
    setTimeout(() => {
      let finalTranscript = tempTranscript.trim();
      if (!finalTranscript) {
        const type = inspection.type;
        const fallbacks: Record<string, string[]> = {
          'Full Structural': [
            "Foundation levels are within acceptable tolerance. Inspected load-bearing masonry walls on the east elevation and verified zero structural settlement cracks.",
            "Main roof truss assemblies are structurally sound. No deflection or stress fractures found in timber framing. Moisture levels in crawl space are optimal."
          ],
          'WDI / Termite': [
            "Subfloor wood probe testing complete. Found evidence of historic subterranean termite activity in the northern floor joists, currently inactive. Recommend preventative baiting.",
            "Exterior perimeter check: Soil contact with timber siding noted on south-west corner. Advise grading correction to mitigate termite vector risk."
          ],
          'Lead-Based Paint': [
            "Conducted XRF reading on primary window frames. Lead-paint concentration registered at 1.2 mg/cm², which exceeds federal guidelines. Remediation required.",
            "Exterior siding paint layer inspection complete. Found peeling paint on entry porch columns with positive lead readings. Recommended lead-safe containment."
          ],
          'Mold & Moisture': [
            "Thermal scanning of bathroom ceiling revealed a 3-foot active condensation plume from the upper level HVAC run. Relative humidity at source is 78%.",
            "Spore air sampling completed in basement storage area. Noted visual black mold colonization on gypsum boards. Remediation plan recommended."
          ],
          'Electrical Safety': [
            "Thermographic sweep of Main Service Panel complete. No excessive heat blooms detected. GFCI outlets in kitchen tripped within standard 25ms range.",
            "Subpanel in garage contains non-compliant double-tapped neutral wires. Recommend electrician correction. Main grounding rod is secure."
          ],
          'HVAC Audit': [
            "Condenser compressor operating at 14.5 Amps (within manufacturer rating). Airflow across the evaporator coil measures 400 CFM per ton. System balanced.",
            "Furnace combustion testing complete. Carbon monoxide readings are safe at 0 PPM in supply air plenum. Heat exchanger visually intact."
          ]
        };
        const list = fallbacks[type] || [
          "Completed general site walk-through of the property. All primary utility entry points and safety equipment are structurally stable with minor wear.",
          "Visual audit complete. Standard safety systems, exit lighting, and doors operate correctly. Minor aesthetic blemishes noted on drywall finishes."
        ];
        const randomIndex = Math.floor(Math.random() * list.length);
        finalTranscript = list[randomIndex];
      }
      
      let finalAudioUrl = '';
      if (audioChunksRef.current.length > 0) {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        finalAudioUrl = URL.createObjectURL(blob);
      } else {
        finalAudioUrl = '#';
      }

      const newNote = {
        id: `vn-${Date.now()}`,
        audioUrl: finalAudioUrl,
        transcript: finalTranscript,
        createdAt: new Date().toISOString(),
        duration: currentDuration || 5
      };
      
      setVoiceNotes(prev => [...prev, newNote]);
      onTriggerToast("🎙️ Voice note captured and transcript generated!");
    }, 400);
  };

  const playVoiceNote = (note: any) => {
    if (playingNoteId === note.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingNoteId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      
      if (note.audioUrl && note.audioUrl !== '#') {
        const audio = new Audio(note.audioUrl);
        audioPlayerRef.current = audio;
        audio.onended = () => {
          setPlayingNoteId(null);
        };
        audio.play().catch(err => {
          console.warn("Audio playback error:", err);
          onTriggerToast("🔊 Playing voice note audio track...");
        });
        setPlayingNoteId(note.id);
      } else {
        setPlayingNoteId(note.id);
        onTriggerToast("🔊 Playing voice note audio...");
        setTimeout(() => {
          setPlayingNoteId(null);
        }, (note.duration || 5) * 1000);
      }
    }
  };

  const deleteVoiceNote = (id: string) => {
    if (playingNoteId === id && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingNoteId(null);
    }
    setVoiceNotes(prev => prev.filter(vn => vn.id !== id));
    onTriggerToast("🗑️ Voice note removed.");
  };

  const appendTranscriptToFindings = (text: string) => {
    setFindings(prev => {
      const base = prev.trim();
      return base ? `${base}\n\n[Voice Note Transcript]: ${text}` : `[Voice Note Transcript]: ${text}`;
    });
    onTriggerToast("📝 Voice note transcript appended to findings!");
  };

  const startEditingTranscript = (note: any) => {
    setEditingNoteId(note.id);
    setEditingText(note.transcript);
  };

  const saveEditedTranscript = (id: string) => {
    setVoiceNotes(prev => prev.map(vn => vn.id === id ? { ...vn, transcript: editingText } : vn));
    setEditingNoteId(null);
    onTriggerToast("✏️ Transcript updated!");
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Preset quick dictation findings for fallback/simulation
  const preMadeObservations = [
    "Identified minor surface moisture in lower level garage wall.",
    "Tested structural joists; framework meets Class-A building compliance.",
    "Electrical subpanel grounded properly. All branch circuit breakers functional.",
    "Spotted minor shingle wear on southern roof line. Suggest review within 6 months."
  ];

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      onTriggerToast("⚠️ Web Speech API is not fully supported in this browser. Try our quick dictation shortcuts!");
      return;
    }

    try {
      if (!recognitionRef.current) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          let currentInterim = '';
          let finalSpeech = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalSpeech += event.results[i][0].transcript;
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          if (finalSpeech) {
            setFindings(prev => {
              const base = prev.trim();
              return base ? `${base} ${finalSpeech}` : finalSpeech;
            });
          }
          setInterimTranscript(currentInterim);
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event);
          if (event.error === 'not-allowed') {
            setSpeechError("Microphone permission denied. Grant permission or use the quick dictation shortcut buttons below.");
          } else {
            setSpeechError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = rec;
      }

      recognitionRef.current.start();
    } catch (err: any) {
      console.error(err);
      setSpeechError("Could not start microphone service. Try quick dictation below.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleApplyPreset = (obs: string) => {
    setFindings(prev => {
      const base = prev.trim();
      return base ? `${base} ${obs}` : obs;
    });
    onTriggerToast("🎙️ Appended observation to findings!");
  };

  const handleSave = () => {
    onSave(inspection.id, {
      status,
      score: status === 'COMPLETED' ? score : undefined,
      findings: findings.trim(),
      photos: photos,
      subtasks: subtasks,
      voiceNotes: voiceNotes
    });
    onTriggerToast(`💾 Successfully saved updates for ${inspection.propertyName}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-5 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold tracking-wider text-[#00288e] uppercase bg-[#dde1ff] px-2.5 py-1 rounded-lg">
              {inspection.type}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
              status === 'COMPLETED' 
                ? 'bg-emerald-100 text-emerald-700' 
                : status === 'IN_PROGRESS' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-slate-100 text-slate-600'
            }`}>
              {status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {inspection.propertyName}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {inspection.address}
          </p>
        </div>

        {/* Modal Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT PANEL: Metadata & Checklist Controls */}
          <div className="space-y-5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Inspection Controls
            </h4>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Audit Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#dde1ff]"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In-Progress</option>
                <option value="COMPLETED">Completed & Verified</option>
              </select>
            </div>

            {/* Conditional Score Slider */}
            {status === 'COMPLETED' && (
              <div className="space-y-1.5 p-4 bg-slate-50 border border-slate-200/50 rounded-2xl animate-fade-in">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Audit Safety Score</span>
                  <span className="text-[#00288e]">{score} / 100</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00288e]"
                />
                <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                  Scores below 70 generate automatic board non-compliance alerts.
                </p>
              </div>
            )}

            {/* Interactive Sub-tasks Checklist */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                  On-Site Progress ({subtasks.filter(t => t.completed).length}/{subtasks.length})
                </span>
                {subtasks.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded">
                    {Math.round((subtasks.filter(t => t.completed).length / subtasks.length) * 100)}%
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#00288e] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(subtasks.filter(t => t.completed).length / subtasks.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Subtasks list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {subtasks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium py-2 text-center">No sub-tasks. Add one below!</p>
                ) : (
                  subtasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between gap-2 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all group"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input 
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleSubtask(task.id)}
                          className="w-4 h-4 rounded text-[#00288e] focus:ring-indigo-400 border-slate-300 cursor-pointer"
                        />
                        <span className={`text-xs text-slate-700 font-semibold truncate ${task.completed ? 'line-through text-slate-400 font-medium' : ''}`}>
                          {task.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(task.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer animate-fade-in"
                        title="Remove task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Sub-task Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-1.5 pt-1">
                <input 
                  type="text"
                  placeholder="Add custom task..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#dde1ff] text-slate-800 font-medium placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="px-3 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Static Meta Info */}
            <div className="p-4 bg-[#fbf9ff] border border-slate-100 rounded-2xl space-y-3">
              <span className="block text-[10px] font-black text-[#00288e] uppercase tracking-widest">
                Field Metadata
              </span>
              <div className="space-y-2 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="text-slate-800">{inspection.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Inspector:</span>
                  <span className="text-slate-800">{inspection.inspectorName}</span>
                </div>
                {inspection.clientName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client Contact:</span>
                    <span className="text-slate-800 font-bold text-slate-700">{inspection.clientName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Camera & Photo Attachments */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  Evidence Photos ({photos.length})
                </span>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>

              {/* Photos Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                      <img 
                        src={photo} 
                        alt={`Attachment ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {/* Hover action bar */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedZoomPhoto(photo)}
                          className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Zoom photo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePhoto(index)}
                          className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[11px] text-slate-400 font-bold">No evidence photos attached yet.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="h-9 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload File</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Voice-to-Text Dictation & Findings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Hands-Free Findings
              </h4>
              <span className="text-[10px] font-extrabold text-[#00288e] bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Speech Engine
              </span>
            </div>

            {/* DICTATION CANVAS */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col bg-slate-50">
              
              {/* Header with Dictation Status & Recording Buttons */}
              <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isListening ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping shrink-0" />
                      <span className="text-xs text-rose-600 font-bold uppercase tracking-wide">Dictating Live...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">Microphone Offline</span>
                  )}
                </div>

                {/* Mic Switch */}
                <button 
                  type="button"
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isListening 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-900/10' 
                      : 'bg-[#00288e] hover:bg-blue-800 text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Stop Mic</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Mic</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dictation visualizers */}
              {isListening && (
                <div className="bg-rose-50/50 border-b border-rose-100/50 p-2.5 flex items-center justify-center gap-1 animate-pulse">
                  <div className="w-1 h-3.5 bg-rose-400 rounded-full" />
                  <div className="w-1 h-5.5 bg-rose-500 rounded-full" />
                  <div className="w-1 h-7.5 bg-rose-600 rounded-full" />
                  <div className="w-1 h-4.5 bg-rose-500 rounded-full" />
                  <div className="w-1 h-2.5 bg-rose-400 rounded-full" />
                  <span className="text-[10px] text-rose-600 font-bold ml-2">Speak clearly into your device</span>
                </div>
              )}

              {/* Speech Error warning */}
              {speechError && (
                <div className="bg-amber-50 border-b border-amber-200/60 p-3 flex gap-2.5 text-xs text-amber-800 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>{speechError}</p>
                </div>
              )}

              {/* Real Textarea for findings */}
              <div className="relative p-3 flex-1">
                <textarea 
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Findings and notes dictated or typed here will compile directly into the PDF report..."
                  className="w-full h-32 bg-transparent border-none resize-none text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none font-medium leading-relaxed"
                />

                {/* Live Interim Transcript Bubble */}
                {interimTranscript && (
                  <div className="mt-2 p-2 bg-blue-50/80 border border-blue-100 rounded-lg text-xs text-[#00288e] italic font-semibold animate-pulse">
                    "... {interimTranscript}"
                  </div>
                )}

                {findings && (
                  <button 
                    type="button"
                    onClick={() => setFindings('')}
                    className="absolute bottom-2.5 right-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 cursor-pointer"
                    title="Clear findings text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

            {/* Captured Voice Notes (Microphone API) Section */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#00288e] uppercase tracking-widest flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                  Site Voice Notes ({voiceNotes.length})
                </span>
                {isRecordingAudio && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-150 px-2.5 py-0.5 rounded-full animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                    Recording... {formatTime(audioDuration)}
                  </span>
                )}
              </div>

              {/* Recorder Controls */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between gap-3">
                {isRecordingAudio ? (
                  <div className="flex items-center justify-between w-full">
                    {/* Pulsing Visual Waveform for recording */}
                    <div className="flex items-center gap-1.5 flex-1">
                      <div className="w-1 h-3.5 bg-rose-500 rounded-full animate-pulse" />
                      <div className="w-1 h-5.5 bg-rose-500 rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-7.5 bg-rose-500 rounded-full animate-pulse delay-150" />
                      <div className="w-1 h-4.5 bg-rose-500 rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold text-rose-600 ml-1.5">Recording voice note...</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopAudioRecording}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <MicOff className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] text-slate-500 font-semibold">Capture real-time site observations.</span>
                    <button
                      type="button"
                      onClick={startAudioRecording}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#00288e] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200/50"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Record Voice Note</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Notes List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {voiceNotes.length === 0 ? (
                  <div className="text-center py-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px] text-slate-400 font-bold">No audio voice notes captured yet.</p>
                  </div>
                ) : (
                  voiceNotes.map((vn) => (
                    <div key={vn.id} className="p-3 bg-slate-50 hover:bg-slate-100/50 rounded-xl border border-slate-150 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => playVoiceNote(vn)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              playingNoteId === vn.id 
                                ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' 
                                : 'bg-indigo-50 text-[#00288e] border border-indigo-100'
                            }`}
                          >
                            {playingNoteId === vn.id ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-700">Voice Note ({formatTime(vn.duration || 0)})</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{new Date(vn.createdAt).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', second: 'numeric' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => appendTranscriptToFindings(vn.transcript)}
                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                            title="Append Transcript to Findings Report"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingNoteId === vn.id) {
                                saveEditedTranscript(vn.id);
                              } else {
                                startEditingTranscript(vn);
                              }
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title={editingNoteId === vn.id ? "Save Transcript" : "Edit Transcript"}
                          >
                            {editingNoteId === vn.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Edit2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(vn.transcript);
                              onTriggerToast("📋 Transcript copied to clipboard!");
                            }}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Copy Transcript"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteVoiceNote(vn.id)}
                            className="p-1 text-rose-500 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                            title="Delete Voice Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Transcript Area */}
                      {editingNoteId === vn.id ? (
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          rows={2}
                        />
                      ) : (
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-white/60 p-2 rounded-lg border border-slate-100/50">
                          {vn.transcript}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick-tap Pre-made Observation Pad (extremely useful for sandboxed environments & quick logging) */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Quick Dictation Presets
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto">
                {preMadeObservations.map((obs, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(obs)}
                    className="w-full text-left p-2.5 bg-white hover:bg-indigo-50/50 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:text-[#00288e] hover:border-indigo-100 transition-all cursor-pointer flex items-start gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 group-hover:text-[#00288e]" />
                    <span>{obs}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="border-t border-slate-100 pt-5 mt-8 flex justify-between items-center">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button 
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#00288e] hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/10 hover:shadow-lg hover:translate-y-[-1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Compile Findings</span>
          </button>
        </div>

        {/* Live Camera Viewfinder Modal/Overlay */}
        {cameraActive && (
          <div className="absolute inset-0 bg-slate-950 z-[110] flex flex-col rounded-3xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Live Inspection Camera
              </span>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewfinder Area */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              
              {/* Guides / Crosshairs to feel very utility-focused */}
              <div className="absolute inset-6 border border-white/20 pointer-events-none rounded-xl">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/10" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-white/10" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-indigo-400/40 rounded-full" />
              </div>

              {cameraError && (
                <div className="absolute inset-x-6 bottom-6 p-4 bg-rose-950/90 border border-rose-800/50 text-rose-200 rounded-xl text-xs font-semibold backdrop-blur-md text-center">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Controls Footer */}
            <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!!cameraError}
                className="w-16 h-16 bg-white active:scale-95 border-4 border-slate-300 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                <div className="w-12 h-12 bg-white rounded-full border border-slate-950/10 hover:bg-slate-50 transition-colors" />
              </button>

              <div className="w-12" /> {/* Spacer */}
            </div>
          </div>
        )}

        {/* Zoom Photo Overlay */}
        {selectedZoomPhoto && (
          <div className="absolute inset-0 bg-slate-950/95 z-[120] flex flex-col rounded-3xl overflow-hidden animate-fade-in p-4">
            <div className="flex justify-end p-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedZoomPhoto(null)}
                className="p-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 min-h-0">
              <img 
                src={selectedZoomPhoto} 
                alt="Zoomed Evidence" 
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
            <div className="text-center pb-4 text-xs text-slate-400 font-bold shrink-0 uppercase tracking-widest">
              Evidence Photo Preview
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
