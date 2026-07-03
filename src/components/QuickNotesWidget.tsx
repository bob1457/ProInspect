import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pin, Plus, Trash2, ClipboardCopy, Check, FileText, Sparkles, 
  Search, Filter, Clock, ArrowRight, Notebook, StickyNote, AlertTriangle,
  Lightbulb, Info
} from 'lucide-react';
import { QuickNote } from '../types';

interface QuickNotesWidgetProps {
  onConvertNoteToInspection: (noteTitle: string, noteContent: string) => void;
  onTriggerToast: (message: string) => void;
}

// Initial demo notes so the interface is instantly populated with helpful contextual guidelines
const INITIAL_DEMO_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    title: 'Water pressure fluctuation at North Tower',
    content: 'Tenant reported slight rattling sounds in walls during high usage periods. Need to check pressure reducing valves (PRV) on floors 12-15 during next site visit.',
    createdAt: 'Jun 28, 2026, 11:30 AM',
    category: 'Observation',
    color: 'indigo',
    isPinned: true
  },
  {
    id: 'note-2',
    title: 'Cracked concrete on South ramp entrance',
    content: 'Hairline fractures widening near the expansion joint of the lower level parking deck. Monitor during seasonal review and flag for seal repair.',
    createdAt: 'Jun 28, 2026, 09:15 AM',
    category: 'Urgent',
    color: 'rose',
    isPinned: true
  },
  {
    id: 'note-3',
    title: 'Update checklist with new 2026 fire regulations',
    content: 'Refer to newly published Austin municipal code Sec 402.1 regarding emergency battery backups for secondary stairwell exits. Draft checklist questions.',
    createdAt: 'Jun 27, 2026, 04:45 PM',
    category: 'Reminder',
    color: 'amber',
    isPinned: false
  }
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; ring: string; pill: string }> = {
  indigo: {
    bg: 'bg-indigo-50/70',
    border: 'border-indigo-100',
    text: 'text-indigo-800',
    ring: 'focus:ring-indigo-300',
    pill: 'bg-indigo-100/70 text-indigo-700'
  },
  rose: {
    bg: 'bg-rose-50/70',
    border: 'border-rose-100',
    text: 'text-rose-800',
    ring: 'focus:ring-rose-300',
    pill: 'bg-rose-100/70 text-rose-700'
  },
  amber: {
    bg: 'bg-amber-50/70',
    border: 'border-amber-100',
    text: 'text-amber-800',
    ring: 'focus:ring-amber-300',
    pill: 'bg-amber-100/70 text-amber-700'
  },
  emerald: {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-100',
    text: 'text-emerald-800',
    ring: 'focus:ring-emerald-300',
    pill: 'bg-emerald-100/70 text-emerald-700'
  },
  slate: {
    bg: 'bg-slate-50/80',
    border: 'border-slate-200',
    text: 'text-slate-800',
    ring: 'focus:ring-slate-300',
    pill: 'bg-slate-200/70 text-slate-700'
  }
};

const CATEGORIES: QuickNote['category'][] = ['Urgent', 'Observation', 'Reminder', 'Draft'];
const COLORS = ['indigo', 'rose', 'amber', 'emerald', 'slate'];

export default function QuickNotesWidget({ onConvertNoteToInspection, onTriggerToast }: QuickNotesWidgetProps) {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Note Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<QuickNote['category']>('Reminder');
  const [newColor, setNewColor] = useState('indigo');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load notes from local storage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('inspectpro_quick_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes(INITIAL_DEMO_NOTES);
      }
    } else {
      setNotes(INITIAL_DEMO_NOTES);
      localStorage.setItem('inspectpro_quick_notes', JSON.stringify(INITIAL_DEMO_NOTES));
    }
  }, []);

  // Sync to local storage
  const syncNotesToLocalStorage = (updatedNotes: QuickNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('inspectpro_quick_notes', JSON.stringify(updatedNotes));
  };

  // Add Note Handler
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      onTriggerToast('Please enter both a title and details for the note.');
      return;
    }

    const noteToAdd: QuickNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      createdAt: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      category: newCategory,
      color: newColor,
      isPinned: false
    };

    const updated = [noteToAdd, ...notes];
    syncNotesToLocalStorage(updated);
    
    // Clear fields
    setNewTitle('');
    setNewContent('');
    setNewCategory('Reminder');
    setNewColor('indigo');

    onTriggerToast('📝 Quick note saved successfully!');
  };

  // Delete Note Handler
  const handleDeleteNote = (id: string, title: string) => {
    const updated = notes.filter(n => n.id !== id);
    syncNotesToLocalStorage(updated);
    onTriggerToast(`Deleted note: "${title}"`);
  };

  // Toggle Pin Handler
  const handleTogglePin = (id: string) => {
    const updated = notes.map(n => {
      if (n.id === id) {
        const nextState = !n.isPinned;
        onTriggerToast(nextState ? `📌 Pinned note to the top` : `Unpinned note`);
        return { ...n, isPinned: nextState };
      }
      return n;
    });
    syncNotesToLocalStorage(updated);
  };

  // Copy Note Text to Clipboard
  const handleCopyNote = (note: QuickNote) => {
    const formattedText = `[${note.category.toUpperCase()}] ${note.title}\nDate: ${note.createdAt}\nDetails: ${note.content}`;
    navigator.clipboard.writeText(formattedText);
    setCopiedId(note.id);
    onTriggerToast('Copied note details to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Sort notes: pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.id.localeCompare(a.id); // Reverse chronological
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 animate-fade-in">
      
      {/* Widget Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl dark:bg-slate-100 dark:text-slate-800">
            <Notebook className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Inspector Quick Notes</h3>
            <p className="text-[11px] text-slate-500 font-medium">Jot down offline observations, issues, or future inspection reminders</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          <StickyNote className="w-3.5 h-3.5 text-indigo-500" />
          <span>{notes.length} Active Snippets</span>
        </div>
      </div>

      {/* Grid Layout: Input Form on Left (or top) & Notes Directory on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create a Note Form (5 columns) */}
        <form onSubmit={handleAddNote} className="lg:col-span-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 uppercase tracking-wider pb-1.5 border-b border-slate-200">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>New Scratchpad Note</span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Note Title</label>
            <input 
              type="text"
              placeholder="e.g. Elevators checklist revision"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              required
            />
          </div>

          {/* Details / Content */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Observations / Details</label>
            <textarea
              placeholder="Enter your field observation here... Not yet tied to a specific scheduled asset."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
              required
            />
          </div>

          {/* Category & Color selector rows in tight layout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Tag Type</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Card Accent</label>
              <div className="flex items-center gap-2 h-10 px-1 bg-white border border-slate-200 rounded-xl justify-around">
                {COLORS.map(colorName => {
                  const isSelected = newColor === colorName;
                  let dotColor = 'bg-slate-400';
                  if (colorName === 'indigo') dotColor = 'bg-indigo-500';
                  if (colorName === 'rose') dotColor = 'bg-rose-500';
                  if (colorName === 'amber') dotColor = 'bg-amber-500';
                  if (colorName === 'emerald') dotColor = 'bg-emerald-500';
                  
                  return (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => setNewColor(colorName)}
                      className={`w-4 h-4 rounded-full ${dotColor} relative transition-transform hover:scale-125 cursor-pointer`}
                      title={colorName}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="block w-1.5 h-1.5 bg-white rounded-full" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-[#00288e] hover:bg-[#1e40af] text-white p-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Pin Note to Scratchpad</span>
          </button>
        </form>

        {/* Right Side: Search, Filter, and Notes Grid (8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          
          {/* Controls: Search and Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:max-w-xs shadow-inner">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-slate-800 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold">
                  Clear
                </button>
              )}
            </div>

            {/* Category selection tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-black uppercase tracking-wider pr-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter:</span>
              </div>
              {['All', ...CATEGORIES].map(cat => {
                const isSelected = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#00288e] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Notes Directory Container */}
          <div className="min-h-[290px] max-h-[360px] overflow-y-auto pr-1 space-y-3">
            {sortedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                <StickyNote className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No scratchpad notes matches criteria</p>
                <p className="text-[10px] text-slate-400 mt-1">Try refining search parameters or jot down a new reminder on the left.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <AnimatePresence>
                  {sortedNotes.map((note) => {
                    const cProps = COLOR_MAP[note.color] || COLOR_MAP.slate;
                    
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-3.5 rounded-2xl border ${cProps.bg} ${cProps.border} relative flex flex-col justify-between group hover:shadow-md transition-all`}
                      >
                        {/* Upper row: Pins & controls */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {/* Category indicator pill */}
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${cProps.pill}`}>
                                {note.category}
                              </span>
                              
                              {/* Title */}
                              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#00288e] transition-colors leading-tight line-clamp-1">
                                {note.title}
                              </h4>
                            </div>

                            {/* Timestamp */}
                            <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>{note.createdAt}</span>
                            </p>
                          </div>

                          {/* Controls (Pin, Copy, Delete) */}
                          <div className="flex items-center gap-1 bg-white/60 group-hover:bg-white/90 p-0.5 rounded-lg border border-slate-100 shadow-xs transition-colors shrink-0">
                            
                            {/* Pin Button */}
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              className={`p-1 rounded-md transition-all cursor-pointer ${
                                note.isPinned 
                                  ? 'text-indigo-600 bg-indigo-50/50' 
                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title={note.isPinned ? "Unpin Note" : "Pin Note to top"}
                            >
                              <Pin className="w-3.5 h-3.5" style={{ transform: note.isPinned ? 'none' : 'rotate(45deg)' }} />
                            </button>

                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyNote(note)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Copy text summary"
                            >
                              {copiedId === note.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <ClipboardCopy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteNote(note.id, note.title)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </div>

                        {/* Body content */}
                        <div className="my-3 flex-1">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line line-clamp-3">
                            {note.content}
                          </p>
                        </div>

                        {/* Bottom action bar: convert note into a formal scheduled property inspection */}
                        <div className="pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
                          <span className="text-[9px] text-slate-400 font-bold italic">Unassigned target</span>
                          
                          <button
                            onClick={() => onConvertNoteToInspection(note.title, note.content)}
                            className="text-[#00288e] hover:text-[#1e40af] font-extrabold flex items-center gap-1 group/btn cursor-pointer"
                          >
                            <span>Convert to Formal Inspection</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                          </button>
                        </div>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Guidelines disclaimer */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold leading-normal">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              <strong>Converting to formal vetting:</strong> Clicking "Convert to Formal Inspection" pre-fills the official scheduler layout with this note's parameters, allowing you to quickly dispatch checking staff to the site.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
