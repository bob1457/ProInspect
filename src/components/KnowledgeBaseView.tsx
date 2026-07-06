import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Upload, Search, MessageSquare, Trash2, FileText, Sparkles, 
  Database, Hash, ArrowRight, Loader2, CheckCircle2, AlertCircle, Info, ChevronRight, X,
  Tag, Calendar, ArrowUpRight, HelpCircle, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface KBDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  chunkCount: number;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  tokenCount?: number;
}

export interface KBChunk {
  id: string;
  docId: string;
  docName: string;
  text: string;
  index: number;
  score?: number;
}

export interface RAGMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: KBChunk[];
}

export interface KBArticle {
  id: string;
  title: string;
  category: 'Fire Safety' | 'Plumbing & Water' | 'Structure & Attic' | 'Electrical Standards' | 'Inspection Procedures';
  summary: string;
  content: string;
  lastUpdated: string;
  keyClauses: string[];
}

// Pre-defined high-quality categorized documentation articles
const DEFAULT_ARTICLES: KBArticle[] = [
  {
    id: 'art_1',
    title: 'Roof and Attic Ventilation (Austin Section 101.4)',
    category: 'Structure & Attic',
    summary: 'Specifies ratio requirements for attic floor ventilation and necessary fiberglass insulation clearances.',
    content: 'All residential properties within Austin city limits must maintain a minimum of 1 square foot of free ventilation space for every 150 square feet of attic floor space. Standard clearances of at least 2 inches are strictly required between the underside of roof deck sheathing panels and fiberglass batt or blown insulation to guarantee continuous convective airflow and prevent moisture accumulation.',
    lastUpdated: 'Jan 15, 2026',
    keyClauses: [
      '1 sq ft ventilation per 150 sq ft attic space',
      '2-inch safety gap above insulation batts',
      'Continuous visual pathway check at soffit vents'
    ]
  },
  {
    id: 'art_2',
    title: 'Water Heater Temperature Limits & Thermal Scald Prevention',
    category: 'Plumbing & Water',
    summary: 'Maximum temperature settings at residential fixtures and clearance requirements for water heaters.',
    content: 'To prevent severe thermal scalds and ensure household safety, all domestic gas and electric water heaters must be calibrated to deliver water at a maximum temperature of 120 degrees Fahrenheit (49°C) at any single fixture. In addition, commercial boilers and storage units exceeding 50 gallons capacity must maintain a clear operational workspace of 30 inches on all control panels and 18 inches clearance from combustible partition walls.',
    lastUpdated: 'Apr 02, 2026',
    keyClauses: [
      'Maximum 120°F (49°C) output cap at fixtures',
      '30-inch clear workspace in front of controls',
      '18-inch clearance from any combustible drywall'
    ]
  },
  {
    id: 'art_3',
    title: 'Electrical Panel Access and Spatial Clearances',
    category: 'Electrical Standards',
    summary: 'Mandatory spatial working clearances surrounding residential and commercial electrical distribution panels.',
    content: 'Electrical distribution panels and load centers must remain readily accessible at all times. A minimum safety working clearance of 36 inches in depth in front of the panel, 30 inches in width (or the width of the equipment, whichever is greater), and 78 inches in vertical height is required. Storage of any boxes, tools, or building materials within this dedicated workspace is strictly prohibited.',
    lastUpdated: 'Mar 10, 2026',
    keyClauses: [
      '36-inch deep workspace in front of panel covers',
      '30-inch horizontal workspace width clearance',
      '78-inch minimum vertical head height clearance',
      'Zero storage allowed in the clearance zone'
    ]
  },
  {
    id: 'art_4',
    title: 'Structural Safety Clearance from Single-Wall Chimney Flues',
    category: 'Structure & Attic',
    summary: 'Required margins of safety between building timbers, decking, and combustion gas venting channels.',
    content: 'Single-wall chimney flues and metal vent pipes conducting hot combustion byproducts from fireplaces or furnace systems must maintain a strict clearance of at least 18 inches from all combustible structural timbers, joists, and plywood decking. Under-roof chimneys must extend at least 3 feet vertically above the highest point of roof penetration to prevent spark ignition hazards.',
    lastUpdated: 'Feb 18, 2026',
    keyClauses: [
      '18-inch clearance from raw framing lumber',
      'Chimney extension of 3 feet minimum above roof deck',
      'Visual check for sound firestop collars at ceilings'
    ]
  },
  {
    id: 'art_5',
    title: 'Smoke Alarm Placement and Installation Criteria',
    category: 'Fire Safety',
    summary: 'Texas regional annex guidelines for smoke and carbon monoxide detectors in rental and residential properties.',
    content: 'Approved and listed smoke alarms must be installed in all sleeping rooms, outside each separate sleeping area in the immediate vicinity of the bedrooms, and on each level of the dwelling unit, including finished basements. Alarms must be hardwired with a battery backup system, or be sealed 10-year lithium battery units, and interconnected so that activation of one triggers all alarms.',
    lastUpdated: 'Jun 12, 2026',
    keyClauses: [
      'Placement inside every sleeping room & bedroom corridor',
      'Minimum of one detector per level of the structure',
      '10-year service life validation with interconnectivity'
    ]
  },
  {
    id: 'art_6',
    title: 'Standard Operating Procedure for Safety Audits',
    category: 'Inspection Procedures',
    summary: 'Visual checklist sequence for field inspectors performing turnover or compliance evaluations.',
    content: 'Property audits must document five core elements in sequence: 1) Alarm expirations (must be under 10 years old). 2) Visual balcony guardrail validation (36 inches tall with vertical rails spaced under 4 inches). 3) Water heat thresholds measured at the kitchen tap. 4) Fire extinguisher presence (within 30 feet of travel from range). 5) Attic ventilation visual integrity. All compliance metrics must contain clear photo documentation.',
    lastUpdated: 'May 08, 2026',
    keyClauses: [
      'Check balcony guardrails for a maximum 4-inch gap',
      'Measure and log water tap temperatures in real-time',
      'Attach clear wide-angle photographs of each zone'
    ]
  }
];

export default function KnowledgeBaseView() {
  const [documents, setDocuments] = useState<KBDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KBDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  
  // Tabs: 'browse' for the categorized library catalog, 'upload' for ingestions, 'chat' for RAG agent
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'chat'>('browse');
  
  const [showChunksDoc, setShowChunksDoc] = useState<KBDocument | null>(null);
  const [chunks, setChunks] = useState<KBChunk[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingArticle, setReadingArticle] = useState<KBArticle | null>(null);

  const [chatHistory, setChatHistory] = useState<RAGMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am your Compliance RAG Agent. I can search through your uploaded guidelines, building codes, and standard operating procedures to provide answers grounded in your specific documents. Ask me anything, or upload a code manual to get started!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load existing documents from backend on mount
  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/knowledge/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isQuerying]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate visual progress increments
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 300);

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.ok) {
        await fetchDocuments();
        setActiveTab('upload');
      } else {
        alert('Failed to upload and ingest the document.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Network error while ingesting the document.');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Perform RAG query
  const handleSendQuery = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQuery || query;
    if (!queryToSend.trim() || isQuerying) return;

    const userMessage: RAGMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setIsQuerying(true);

    try {
      const response = await fetch('/api/knowledge/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSend }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: RAGMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || []
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        const errorText = await response.text();
        const assistantMessage: RAGMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Error contacting RAG backend: ${errorText || 'Server error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error querying RAG:', error);
      const assistantMessage: RAGMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I encountered a connection error. Please ensure your backend is compiled and online.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, assistantMessage]);
    } finally {
      setIsQuerying(false);
    }
  };

  // Trigger Gemini-powered summarization
  const handleSummarize = async (docId: string) => {
    setIsSummarizing(docId);
    try {
      const response = await fetch('/api/knowledge/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId }),
      });

      if (response.ok) {
        await fetchDocuments();
      } else {
        alert('Failed to generate summary.');
      }
    } catch (error) {
      console.error('Error summarizing document:', error);
    } finally {
      setIsSummarizing(null);
    }
  };

  // Delete document
  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document and remove all its RAG chunks?')) return;

    try {
      const response = await fetch('/api/knowledge/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId }),
      });

      if (response.ok) {
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null);
        }
        await fetchDocuments();
      } else {
        alert('Failed to delete document.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  // View document chunks
  const handleViewChunks = async (doc: KBDocument) => {
    setShowChunksDoc(doc);
    try {
      const response = await fetch(`/api/knowledge/chunks?docId=${doc.id}`);
      if (response.ok) {
        const data = await response.json();
        setChunks(data.chunks || []);
      }
    } catch (error) {
      console.error('Error fetching document chunks:', error);
    }
  };

  // Get status color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Get Category Tag Style
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Fire Safety':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Plumbing & Water':
        return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Structure & Attic':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Electrical Standards':
        return 'bg-yellow-50 text-yellow-800 border-yellow-100';
      case 'Inspection Procedures':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Filter both articles & uploaded custom documents
  const filteredArticles = DEFAULT_ARTICLES.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.keyClauses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = ['All', 'Fire Safety', 'Plumbing & Water', 'Structure & Attic', 'Electrical Standards', 'Inspection Procedures'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Knowledge Base Header / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-[#00288e] rounded-xl shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{DEFAULT_ARTICLES.length + documents.length}</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Guidelines</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Hash className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {DEFAULT_ARTICLES.length * 3 + documents.reduce((acc, doc) => acc + doc.chunkCount, 0)}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Indexed Clauses</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {documents.filter(d => d.summary).length} / {documents.length || 1}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">File Summaries</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">Austin Standards</p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Categorized Catalog</p>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'browse' ? 'bg-white text-[#00288e] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Browse Library</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'upload' ? 'bg-white text-[#00288e] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Ingest Files</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'chat' ? 'bg-white text-[#00288e] shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Compliance Chat</span>
          </button>
        </div>

        {/* Global Search Bar (Only shown on Browse or Upload tabs) */}
        {activeTab !== 'chat' && (
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categorized regulations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00288e] focus:bg-white transition-all text-slate-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Tab Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TAB 1: BROWSE LIBRARY HUB */}
        {activeTab === 'browse' && (
          <div className="lg:col-span-12 space-y-6 animate-fade-in">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-extrabold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#00288e] text-white border-[#00288e] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles Grid layout */}
            {filteredArticles.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900">No guidelines matching your search</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try adjusting your search keywords, clearing your filter tags, or upload custom policy manuals in the "Ingest Files" tab.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="text-xs font-black text-[#00288e] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((art) => (
                  <motion.div
                    key={art.id}
                    layoutId={art.id}
                    onClick={() => setReadingArticle(art)}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-[#00288e]/40 relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-md border tracking-wider ${getCategoryColor(art.category)}`}>
                          {art.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {art.lastUpdated}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 group-hover:text-[#00288e] transition-colors line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                        {art.summary}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-4 space-y-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {art.keyClauses.slice(0, 2).map((clause, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-600 text-[9px] font-extrabold px-2 py-0.5 rounded-md truncate max-w-[170px]" title={clause}>
                            ✓ {clause}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#00288e] font-black pt-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Read Standard</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Custom Guidelines Section (if any uploaded documents exist) */}
            {documents.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-[#00288e]" />
                  <h3 className="text-sm font-black text-slate-900">Custom Uploaded Guidelines</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setActiveTab('upload');
                      }}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#00288e]/40 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-blue-50 text-[#00288e] text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-blue-100">
                            Custom User Doc
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{doc.uploadDate}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 truncate">{doc.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {doc.summary || 'Click to view the details, generate summaries, or inspect segmented clauses.'}
                        </p>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-[11px] text-[#00288e] font-black">
                        <span>Inspect Custom File ({doc.chunkCount} chunks)</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INGEST & DOCUMENT REGISTRY */}
        {activeTab === 'upload' && (
          <>
            {/* Left Side: Upload Dropzone & List */}
            <div className="lg:col-span-5 space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Ingest New Regulations</h3>
                  <p className="text-xs text-slate-500">Inject codebooks, checklists, or standard guidelines into the grounding model</p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    isDragActive 
                      ? 'border-[#00288e] bg-blue-50/50 scale-[1.01]' 
                      : 'border-slate-200 hover:border-[#00288e]/40 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".txt,.md,.json,.csv,.pdf"
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="w-10 h-10 text-[#00288e] animate-spin mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Vectorizing & Chunking...</p>
                        <p className="text-[10px] text-slate-500 mt-1">Creating semantic index mappings</p>
                      </div>
                      <div className="w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden mx-auto">
                        <div className="bg-[#00288e] h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 text-[#00288e] flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">Drag & drop files or manuals</p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports TXT, MD, JSON, CSV & PDF (Max 10MB)</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold hover:bg-slate-200 transition-colors">
                        Choose Document
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-[10px] text-slate-600 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-[#00288e] mt-0.5" />
                  <p>
                    Uploaded compliance manuals are instantly divided into semantic clusters, indexed into memory, and made available for RAG grounding queries in the AI Chat tab.
                  </p>
                </div>

                {/* List of Custom Files */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Indexed File Registry</h4>
                  
                  {documents.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      No custom documents uploaded. Default Austin regulations are active.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                          className={`border rounded-xl p-3 text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                            selectedDoc?.id === doc.id
                              ? 'border-[#00288e] bg-blue-50/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <FileText className={`w-5 h-5 mt-0.5 shrink-0 ${selectedDoc?.id === doc.id ? 'text-[#00288e]' : 'text-slate-400'}`} />
                          
                          <div className="space-y-1 flex-1 min-w-0 pr-6">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{doc.name}</p>
                            
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium flex-wrap">
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{doc.chunkCount} RAG chunks</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.5 border text-[8px] rounded-md uppercase font-bold ${getStatusBadgeClass(doc.status)}`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleDeleteDoc(doc.id, e)}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 rounded-md transition-colors"
                            title="Remove Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Active Inspector details */}
            <div className="lg:col-span-7 space-y-6 animate-fade-in">
              {selectedDoc ? (
                <div className="bg-white border border-[#00288e]/20 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-[#dde1ff] text-[#00288e] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Indexed Doc Inspector
                      </span>
                      <h3 className="text-base font-black text-slate-900">{selectedDoc.name}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Gemini AI Digest</span>
                      </h4>

                      {!selectedDoc.summary && (
                        <button
                          onClick={() => handleSummarize(selectedDoc.id)}
                          disabled={isSummarizing === selectedDoc.id}
                          className="text-[10px] font-black text-[#00288e] bg-blue-50 hover:bg-[#dde1ff] px-2.5 py-1.5 rounded-lg border border-[#00288e]/10 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSummarizing === selectedDoc.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Summarizing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Generate Summary</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-50/60 border border-slate-200/50 rounded-xl p-4 text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedDoc.summary ? (
                        selectedDoc.summary
                      ) : (
                        <p className="text-slate-400 text-center py-2">
                          No summary compiled. Generate a brief AI-powered digest of this compliance resource for quick reading.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chunks inspector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 font-semibold">
                      <span>Chunks: <strong className="text-slate-800">{selectedDoc.chunkCount}</strong></span>
                      <span>Estimated Tokens: <strong className="text-slate-800">{selectedDoc.tokenCount || 'N/A'}</strong></span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewChunks(selectedDoc)}
                        className="text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Inspect Raw Chunks
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          setQuery(`Based on the uploaded document "${selectedDoc.name}", what are the key requirements?`);
                        }}
                        className="text-[11px] text-white bg-[#00288e] hover:bg-[#1e40af] px-3.5 py-1.5 rounded-lg font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>Query this file</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-50 text-[#00288e] rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Select an Indexed Document</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Click on any custom document in your registry list to inspect its chunks, compile visual Gemini summaries, or initiate custom query grounding.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 3: INTERACTIVE AI CHAT & Q&A CONSOLE */}
        {activeTab === 'chat' && (
          <div className="lg:col-span-12 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[550px]">
              {/* Console Header */}
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Interactive RAG Query Console</span>
                </div>
                <span className="text-[10px] text-slate-500 font-extrabold bg-white border border-slate-200/80 px-2 py-0.5 rounded-md">
                  Grounded Q&A (gemini-3.5-flash)
                </span>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-slate-50/30">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                        msg.role === 'user'
                          ? 'bg-[#00288e] text-white font-medium rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Grounded Citation Sources */}
                      {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="border-t border-slate-100 pt-3 mt-2 space-y-2">
                          <p className="text-[10px] font-bold text-[#00288e] uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-[#00288e]" />
                            <span>Retrieved Grounding Sources ({msg.sources.length})</span>
                          </p>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {msg.sources.map((source, idx) => (
                              <div 
                                key={source.id || idx}
                                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 hover:border-blue-200 transition-colors cursor-help"
                                title={`Chunk Segment ${source.index + 1} from ${source.docName}`}
                              >
                                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase">
                                  <span className="text-slate-600 truncate max-w-[70%]">{source.docName}</span>
                                  <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">
                                    Segment {source.index + 1}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 italic leading-snug line-clamp-2 font-medium">
                                  "{source.text}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <span className={`block text-[9px] mt-1 text-right font-semibold ${msg.role === 'user' ? 'text-blue-200/90' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isQuerying && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-xs max-w-[85%] space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#00288e] animate-spin" />
                        <span className="text-xs font-black text-slate-800">Grounding query with documents...</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug font-medium">
                        Vector matcher querying indexes and preparing safe grounded context for Gemini...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestion Prompts */}
              <div className="bg-white border-t border-slate-150 px-4 py-2 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Suggestions:</span>
                <button
                  onClick={() => handleSendQuery(undefined, "What are the roofing ventilation standards in Austin?")}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer"
                >
                  Roof Ventilation
                </button>
                <button
                  onClick={() => handleSendQuery(undefined, "What are the common water heater scald safety limits?")}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer"
                >
                  Water Temp Caps
                </button>
                <button
                  onClick={() => handleSendQuery(undefined, "What are the working spatial clearances in front of electrical panels?")}
                  className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer"
                >
                  Electrical panel Clearance
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendQuery} className="border-t border-slate-200 p-3 bg-white flex gap-2.5 shrink-0">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isQuerying ? "Please wait..." : "Ask compliance questions grounded in manuals..."}
                  disabled={isQuerying}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:bg-white focus:outline-none focus:border-[#00288e] font-semibold text-slate-800 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isQuerying}
                  className="bg-[#00288e] hover:bg-[#1e40af] text-white rounded-xl px-5 flex items-center justify-center transition-all shadow-md shadow-blue-900/10 hover:scale-102 active:scale-98 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ARTICLE READER MODAL DRAWER */}
      <AnimatePresence>
        {readingArticle && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-150 flex items-start justify-between bg-slate-50/50">
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase rounded-md border tracking-wider ${getCategoryColor(readingArticle.category)}`}>
                    {readingArticle.category}
                  </span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {readingArticle.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Revised: {readingArticle.lastUpdated}
                  </p>
                </div>
                <button
                  onClick={() => setReadingArticle(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Article Body */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Official Code Standard text</h4>
                  <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                    {readingArticle.content}
                  </div>
                </div>

                {/* Key Highlighted Clauses */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#00288e]" />
                    <span>Highlighted Inspection Clauses</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {readingArticle.keyClauses.map((clause, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-blue-50/40 border border-blue-50 p-3 rounded-xl text-xs text-slate-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#00288e] shrink-0 mt-0.5" />
                        <span>{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="p-5 border-t border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                  <HelpCircle className="w-4 h-4 text-[#00288e]" />
                  <span>Unsure about localized safety applications?</span>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => setReadingArticle(null)}
                    className="flex-1 sm:flex-initial text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const topic = readingArticle.title;
                      setReadingArticle(null);
                      setActiveTab('chat');
                      setQuery(`Summarize compliance requirements for "${topic}".`);
                    }}
                    className="flex-1 sm:flex-initial text-xs text-white bg-[#00288e] hover:bg-[#1e40af] px-4.5 py-2.5 rounded-xl font-black transition-all shadow-md shadow-blue-900/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ask AI Agent</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Raw Chunks Modal Viewer */}
      <AnimatePresence>
        {showChunksDoc && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-black text-slate-900 truncate max-w-[400px]">
                    {showChunksDoc.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">Segmented RAG Index Chunks ({chunks.length})</p>
                </div>
                <button
                  onClick={() => setShowChunksDoc(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
                {chunks.map((chunk, idx) => (
                  <div key={chunk.id || idx} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] bg-blue-50 text-[#00288e] font-extrabold px-2 py-0.5 rounded-md">
                        Segment Index: {chunk.index}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Chunk ID: {chunk.id.substring(0, 8)}...
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                      "{chunk.text}"
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
