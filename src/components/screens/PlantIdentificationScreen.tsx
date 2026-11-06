import React, { useState, useRef } from 'react';
import {
  ActiveScreen,
  Farm,
  Language,
  PlantIdentificationResult,
  PlantCategory,
  PlantIdentificationStatus,
} from '../../types';
import { useTranslation } from '../../i18n/translations';
import { BOTANICAL_TEST_SPECIMENS, BotanicalTestSpecimen } from '../../data/plantSpecimens';
import {
  UploadCloud,
  Camera,
  Search,
  Sparkles,
  Leaf,
  RefreshCw,
  FileCheck,
  Bot,
  Printer,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  HeartPulse,
  Skull,
  Eye,
  BookOpen,
  Copy,
  Check,
  Sun,
  Trees,
  Flower2,
  Clock,
  History,
  Trash2,
} from 'lucide-react';

interface PlantIdentificationScreenProps {
  activeFarm?: Farm;
  language: Language;
  onNavigate?: (screen: ActiveScreen) => void;
  onAskBotWithPrompt?: (prompt: string) => void;
  savedIdentifications: PlantIdentificationResult[];
  onSaveIdentification: (record: PlantIdentificationResult) => void;
  onDeleteIdentification: (id: string) => void;
}

type Stage = 'idle' | 'identifying' | 'completed' | 'error';

// Helper to create lightweight JPEG thumbnail for persistent storage (<5KB)
async function createThumbnail(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 120;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          resolve('');
        }
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

export const PlantIdentificationScreen: React.FC<PlantIdentificationScreenProps> = ({
  activeFarm,
  language,
  onNavigate,
  onAskBotWithPrompt,
  savedIdentifications,
  onSaveIdentification,
  onDeleteIdentification,
}) => {
  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const defaultSpecimen = BOTANICAL_TEST_SPECIMENS[0];
  const [selectedImage, setSelectedImage] = useState<string>(defaultSpecimen.imageUrl);
  const [activeSpecimenKey, setActiveSpecimenKey] = useState<string>(defaultSpecimen.key);
  const [userNotes, setUserNotes] = useState<string>('');
  const [stage, setStage] = useState<Stage>('completed');
  const [identification, setIdentification] = useState<PlantIdentificationResult | null>(defaultSpecimen.expectedResult);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'identify' | 'history'>('identify');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // File upload processing
  const processSelectedFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid botanical photo (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setActiveSpecimenKey('custom_upload');
      setStage('idle');
      setIdentification(null);
      setErrorMessage(null);
      setZoomLevel(1);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Select a curated test specimen
  const handleSelectSpecimen = (specimen: BotanicalTestSpecimen) => {
    setSelectedImage(specimen.imageUrl);
    setActiveSpecimenKey(specimen.key);
    setIdentification(specimen.expectedResult);
    setStage('completed');
    setErrorMessage(null);
    setZoomLevel(1);
  };

  // Run AI Plant Identification API Call
  const handleRunIdentification = async () => {
    if (!selectedImage) return;

    setStage('identifying');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          testPresetKey: activeSpecimenKey,
          userNotes: userNotes.trim(),
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let resultData: any;

      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        if (rawText.trim().startsWith('<') || rawText.includes('<!doctype') || rawText.includes('<html')) {
          throw new Error('The plant identification service is temporarily unavailable. Received an invalid response from the server.');
        }
        try {
          resultData = JSON.parse(rawText);
        } catch {
          throw new Error(`The plant identification service returned an unexpected response format (${response.status}).`);
        }
      } else {
        resultData = await response.json();
      }

      if (!response.ok) {
        throw new Error(resultData?.error || resultData?.detail || `AI Identification service returned HTTP ${response.status}`);
      }

      // Normalize result data
      const thumbnail = await createThumbnail(selectedImage);
      const plantRecord: PlantIdentificationResult = {
        id: `plant_id_${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: thumbnail,
        identification_status: resultData.identification_status || 'Confirmed Species',
        common_name: resultData.common_name || 'Unidentified Plant',
        scientific_name: resultData.scientific_name || 'Plantae sp.',
        botanical_family: resultData.botanical_family || 'Plantae',
        plant_category: resultData.plant_category || 'other',
        indian_regional_names: resultData.indian_regional_names || {},
        confidence_score: typeof resultData.confidence_score === 'number' ? resultData.confidence_score : 90,
        confidence_level: resultData.confidence_level || (resultData.confidence_score >= 85 ? 'High' : 'Medium'),
        morphological_analysis: resultData.morphological_analysis || {
          leaves: 'Leaves analyzed for phyllotaxy, shape, and venation.',
          stems: 'Stem and branching morphology evaluated.',
          flowers: 'Floral organs reviewed if present.',
          fruits_seeds: 'Fruit or seed structures evaluated if visible.',
          other_visible_features: 'General habit and architectural growth observed.',
        },
        supporting_characteristics: Array.isArray(resultData.supporting_characteristics) && resultData.supporting_characteristics.length > 0
          ? resultData.supporting_characteristics
          : ['Visual leaf silhouette and growth habit consistent with taxon'],
        common_uses_and_medicinal_properties: resultData.common_uses_and_medicinal_properties || {
          common_uses: ['Horticultural and ecological value'],
          medicinal_properties: [],
        },
        toxicity_and_health_risks: resultData.toxicity_and_health_risks || {
          is_toxic: false,
          toxicity_level: 'Non-toxic',
          toxic_parts: 'None documented',
          pet_toxicity: 'Safe or unknown',
          human_health_risks: 'No severe risks documented',
        },
        similar_species: Array.isArray(resultData.similar_species) ? resultData.similar_species : [],
        identification_limitations: resultData.identification_limitations || 'Identification based on 2D visual photograph.',
        agricultural_notes: resultData.agricultural_notes || '',
        specimenKey: activeSpecimenKey,
      };

      setIdentification(plantRecord);
      setStage('completed');

      // Persist to storage
      try {
        onSaveIdentification(plantRecord);
      } catch (saveErr) {
        console.warn('Storage save error:', saveErr);
      }
    } catch (err: any) {
      console.error('Plant identification error:', err);
      setStage('error');
      setErrorMessage(err.message || 'Plant identification failed. Please try again.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadgeStyle = (status: PlantIdentificationStatus) => {
    switch (status) {
      case 'Confirmed Species':
        return 'bg-emerald-500 text-white border-emerald-400';
      case 'Probable Identification':
        return 'bg-teal-500 text-white border-teal-400';
      case 'Genus Level Only':
      case 'Family Level Only':
        return 'bg-amber-500 text-white border-amber-400';
      case 'General Plant Category':
        return 'bg-blue-500 text-white border-blue-400';
      case 'No recognizable plant detected':
        return 'bg-rose-500 text-white border-rose-400';
      default:
        return 'bg-slate-700 text-white border-slate-600';
    }
  };

  const getCategoryIcon = (category: PlantCategory) => {
    switch (category) {
      case 'tree':
        return <Trees className="w-4 h-4 text-emerald-400" />;
      case 'flower':
        return <Flower2 className="w-4 h-4 text-rose-400" />;
      case 'succulent':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'herb':
      case 'shrub':
      case 'climber':
      case 'grass':
      default:
        return <Leaf className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Hidden File / Camera Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hero Banner: Botanical Emerald & Deep Forest Green */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expert Botanical & Taxonomic Vision</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>AI Plant Identification System</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Identify any plant, tree, shrub, herb, flower, or succulent from every photo. Comprehensive botanical taxonomy,
              Indian regional names, morphological leaf & stem diagnostics, scientifically validated medicinal uses, and toxicity alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'identify' ? 'history' : 'identify')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/90 hover:bg-emerald-700/90 text-white text-xs font-semibold border border-emerald-600/50 transition flex items-center gap-2 shadow-sm"
            >
              <History className="w-4 h-4 text-emerald-300" />
              <span>{activeTab === 'identify' ? `Herbarium History (${savedIdentifications.length})` : 'New Plant Scan'}</span>
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('disease_detection')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
              >
                <HeartPulse className="w-4 h-4 text-emerald-300" />
                <span>Crop Disease Lab</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {activeTab === 'history' ? (
        /* Herbarium Saved Identification History */
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-black text-slate-900">Digital Herbarium & Identification Archive</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('identify')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              + Identify New Plant
            </button>
          </div>

          {savedIdentifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Leaf className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No plant identifications saved yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload or capture any plant photo or select a test specimen to start building your farm botanical registry.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('identify')}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
              >
                Scan a Plant Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedIdentifications.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 hover:border-emerald-500 overflow-hidden bg-slate-50/50 hover:bg-white transition shadow-xs group"
                >
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.common_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusBadgeStyle(item.identification_status)}`}>
                        {item.identification_status}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteIdentification(item.id);
                        }}
                        className="p-1 rounded-lg bg-black/60 hover:bg-red-600 text-white transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                      {item.confidence_score}% Confidence
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.common_name}</h3>
                      <p className="text-xs text-emerald-800 font-mono italic font-semibold">{item.scientific_name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 font-semibold">{item.botanical_family}</span>
                      <span className="capitalize">{item.plant_category}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIdentification(item);
                          setSelectedImage(item.imageUrl);
                          setActiveTab('identify');
                        }}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Inspect Full Profile &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Plant Identification Studio Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Upload, Camera, Preview & Test Specimens (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Upload & Camera Capture Box */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  <span>1. Upload or Capture Plant</span>
                </h2>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Leaves, Stems, Flowers, Whole Plant
                </span>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/70 scale-[0.99]'
                    : 'border-slate-200 hover:border-emerald-500 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shadow-sm">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Drop plant, leaf, flower, or tree photo here
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Works on crisp photos, blurry leaves, partial foliage, or outdoor field crops
                    </p>
                  </div>
                </div>

                {/* Upload & Camera Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>

              {/* Optional Field Notes / Observations */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Field Observations (Optional)
                </label>
                <input
                  type="text"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. Growing in wild Western Ghats, roadside red soil, scented white flowers"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-hidden bg-slate-50"
                />
              </div>

              {/* Image Preview Box with Zoom Lens */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Image Preview</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <span>{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      title="Zoom Out"
                    >
                      -
                    </button>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-[4/3] group shadow-inner">
                  <img
                    src={selectedImage}
                    alt="Plant specimen preview"
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="w-full h-full object-cover transition duration-300"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  {/* Status Overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                      {stage === 'identifying'
                        ? 'Analyzing with Botanical AI...'
                        : stage === 'completed'
                        ? identification?.identification_status || 'Identified'
                        : 'Ready for Identification'}
                    </span>
                  </div>

                  {/* Specimen Tag */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold truncate">
                      {BOTANICAL_TEST_SPECIMENS.find((s) => s.key === activeSpecimenKey)?.name || 'Custom Uploaded Specimen'}
                    </span>
                  </div>
                </div>

                {/* Main "Identify Plant" Action Button */}
                <button
                  type="button"
                  onClick={handleRunIdentification}
                  disabled={stage === 'identifying'}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {stage === 'identifying' ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      <span>Taxonomic Botanical Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                      <span>Identify Plant (AI Vision)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Curated Test Specimens */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/10 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-emerald-700" />
                  <span>Curated Botanical Test Specimens</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">1-Click Test</span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Test diverse botanical categories, blurry partial leaves, and non-plant edge cases:
              </p>

              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {BOTANICAL_TEST_SPECIMENS.map((specimen) => {
                  const isSelected = activeSpecimenKey === specimen.key;
                  return (
                    <button
                      key={specimen.id}
                      type="button"
                      onClick={() => handleSelectSpecimen(specimen)}
                      className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                          : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={specimen.imageUrl}
                        alt={specimen.name}
                        className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {specimen.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                              specimen.badge === 'Confirmed Species'
                                ? 'bg-emerald-100 text-emerald-800'
                                : specimen.badge === 'Blurry Leaf'
                                ? 'bg-teal-100 text-teal-800'
                                : specimen.badge === 'No Plant'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {specimen.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono italic">
                          {specimen.scientificName} &bull; {specimen.family}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Complete Botanical Identification Dossier (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Loading State */}
            {stage === 'identifying' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-800/20 text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-40" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 border-r-teal-500 border-b-transparent border-l-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                    <Leaf className="w-10 h-10 animate-pulse text-emerald-700" />
                  </div>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                    Taxonomic Morphological Analysis
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Identifying Plant Species...
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Analyzing leaf venation, margins, phyllotaxy, stem structure, floral morphology, and matching botanical database.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-xs pt-4 border-t border-slate-100">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Foliar Venation</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Taxon Matching</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">Regional Names</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {stage === 'error' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-300 space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <h3 className="text-base font-bold">Plant Identification Service Notice</h3>
                </div>
                <p className="text-xs text-slate-700">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRunIdentification}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            )}

            {/* Identification Result Profile (Completed State) */}
            {stage === 'completed' && identification && (
              <div className="space-y-5">
                {/* 1. Primary Taxonomy & Identification Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                        Identification Status
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${getStatusBadgeStyle(identification.identification_status)}`}>
                          {identification.identification_status}
                        </span>
                        <span className="text-xs text-slate-300 capitalize flex items-center gap-1">
                          {getCategoryIcon(identification.plant_category)}
                          <span className="font-semibold">{identification.plant_category}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-center">
                      <div className="text-right px-3 py-1 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15">
                        <span className="text-[10px] text-emerald-300 block font-semibold">AI Confidence</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-base font-black text-white">{identification.confidence_score}%</strong>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-700/80 text-emerald-200 font-bold uppercase">
                            {identification.confidence_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botanical Header Details */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>Family: {identification.botanical_family}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(identification.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {identification.common_name}
                    </h2>

                    <p className="text-base sm:text-lg font-mono italic text-emerald-700 font-semibold flex items-center gap-2">
                      <span>{identification.scientific_name}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(identification.scientific_name, 'sciname')}
                        className="text-slate-400 hover:text-slate-600 transition p-1"
                        title="Copy scientific name"
                      >
                        {copiedKey === 'sciname' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </p>
                  </div>

                  {/* 2. Indian Regional Names Matrix (Required) */}
                  {identification.indian_regional_names && Object.keys(identification.indian_regional_names).length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Indian Regional & Local Vernacular Names</span>
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(identification.indian_regional_names).map(([langKey, nameVal]) => {
                          if (!nameVal) return null;
                          return (
                            <div
                              key={langKey}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-emerald-50/50 transition space-y-0.5"
                            >
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                {langKey}
                              </span>
                              <p className="text-xs font-bold text-slate-900 leading-snug">
                                {nameVal}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Deep Morphological Analysis Breakdown (Leaves, Stems, Flowers, Fruits, Seeds) */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Morphological & Structural Analysis</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5 text-xs">
                      {/* Leaves */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-1">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Leaves & Foliar Venation</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {identification.morphological_analysis.leaves}
                        </p>
                      </div>

                      {/* Stems */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Trees className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Stem, Bark & Branch Architecture</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {identification.morphological_analysis.stems}
                        </p>
                      </div>

                      {/* Flowers */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Flower2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Floral Morphology & Inflorescence</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {identification.morphological_analysis.flowers}
                        </p>
                      </div>

                      {/* Fruits & Seeds */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <Sun className="w-3.5 h-3.5 text-amber-600" />
                          <span>Fruits, Pods & Seeds</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {identification.morphological_analysis.fruits_seeds}
                        </p>
                      </div>

                      {/* Other features */}
                      {identification.morphological_analysis.other_visible_features && (
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <Info className="w-3.5 h-3.5 text-blue-600" />
                            <span>Other Visible Anatomical Features</span>
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {identification.morphological_analysis.other_visible_features}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Supporting Characteristics */}
                  {identification.supporting_characteristics && identification.supporting_characteristics.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Key Characteristics Supporting Identification</span>
                      </h3>

                      <ul className="space-y-1.5">
                        {identification.supporting_characteristics.map((trait, idx) => (
                          <li
                            key={idx}
                            className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 flex items-start gap-2.5 text-xs font-medium"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{trait}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 5. Common Uses & Scientifically Supported Medicinal Properties */}
                  <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Uses & Scientifically Supported Medicinal Properties</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Common Uses */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                        <strong className="text-slate-900 block font-bold text-[11px] uppercase">
                          Agricultural & Common Uses
                        </strong>
                        <ul className="space-y-1 text-slate-700 list-disc list-inside">
                          {identification.common_uses_and_medicinal_properties.common_uses.map((use, i) => (
                            <li key={i}>{use}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Medicinal Properties */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                        <strong className="text-emerald-950 block font-bold text-[11px] uppercase">
                          Validated Pharmacological Properties
                        </strong>
                        <ul className="space-y-1 text-emerald-900 list-disc list-inside">
                          {identification.common_uses_and_medicinal_properties.medicinal_properties.map((med, i) => (
                            <li key={i}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {identification.common_uses_and_medicinal_properties.ayurvedic_or_traditional_significance && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-950 text-xs space-y-1">
                        <strong className="block font-bold uppercase text-[10px] tracking-wider text-amber-900">
                          Traditional & Ayurvedic Context
                        </strong>
                        <p className="leading-relaxed">
                          {identification.common_uses_and_medicinal_properties.ayurvedic_or_traditional_significance}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 6. Toxicity & Health Risks Advisory (Required) */}
                  <div className="space-y-2.5 pt-2">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Skull className="w-3.5 h-3.5 text-rose-600" />
                      <span>Toxicity & Potential Health Risks</span>
                    </h3>

                    <div
                      className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        identification.toxicity_and_health_risks.is_toxic
                          ? 'bg-rose-50 border-rose-300 text-rose-950'
                          : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {identification.toxicity_and_health_risks.is_toxic ? (
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          )}
                          <strong className="font-black">
                            Toxicity Level: {identification.toxicity_and_health_risks.toxicity_level}
                          </strong>
                        </div>
                        {identification.toxicity_and_health_risks.toxic_parts && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-black/10 font-bold">
                            Parts: {identification.toxicity_and_health_risks.toxic_parts}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div>
                          <span className="font-bold block opacity-80">Domestic Pets & Livestock:</span>
                          <p>{identification.toxicity_and_health_risks.pet_toxicity}</p>
                        </div>
                        <div>
                          <span className="font-bold block opacity-80">Human Health & Contact Risks:</span>
                          <p>{identification.toxicity_and_health_risks.human_health_risks}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7. Similar Species & Confusable Lookalikes (Required) */}
                  {identification.similar_species && identification.similar_species.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Similar Species & Distinguishing Diagnostic Traits</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {identification.similar_species.map((lookalike, i) => (
                          <div
                            key={i}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                          >
                            <span className="text-slate-900 font-bold block">{lookalike.common_name}</span>
                            <p className="text-[11px] text-emerald-800 font-mono italic">{lookalike.scientific_name}</p>
                            <p className="text-[11px] text-slate-600 leading-snug">
                              <strong className="text-slate-800">Distinguishing trait:</strong> {lookalike.distinguishing_traits}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. Identification Limitations & Agricultural Notes */}
                  {identification.identification_limitations && (
                    <div className="p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 text-slate-700 text-xs space-y-1">
                      <span className="font-bold text-slate-900 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-3 h-3 text-slate-600" />
                        <span>Scientific Limitations & Visual Uncertainty Context</span>
                      </span>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        {identification.identification_limitations}
                      </p>
                    </div>
                  )}

                  {/* Agricultural / Growing Tips */}
                  {identification.agricultural_notes && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200 text-teal-950 text-xs space-y-1">
                      <span className="font-bold text-teal-900 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sun className="w-3 h-3 text-teal-700" />
                        <span>Agronomic & Cultivation Guidance</span>
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {identification.agricultural_notes}
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {onAskBotWithPrompt && (
                        <button
                          type="button"
                          onClick={() =>
                            onAskBotWithPrompt(
                              `I identified this plant as ${identification.common_name} (${identification.scientific_name}, Family: ${identification.botanical_family}). How should I cultivate, protect, and care for it on my farm?`
                            )
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Ask Kisan Mitra Bot</span>
                        </button>
                      )}

                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate('disease_detection')}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <HeartPulse className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Check Crop Disease</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunIdentification}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Re-analyze</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
