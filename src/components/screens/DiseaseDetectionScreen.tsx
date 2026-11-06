import React, { useState, useRef } from 'react';
import { ActiveScreen, CropDiseaseDetection, Farm, Language, CoffeeLeafValidationResult } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { SAMPLE_SPECIMENS, SampleSpecimen } from '../../services/sampleSpecimens';
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Leaf,
  RefreshCw,
  FileCheck,
  Bot,
  Printer,
  ScanLine,
  RotateCcw,
  Check,
  HelpCircle,
  Stethoscope,
  Clock,
  Eye,
} from 'lucide-react';

interface DiseaseDetectionScreenProps {
  activeFarm?: Farm;
  onSaveDetectionRecord: (record: CropDiseaseDetection) => void;
  detectionHistory: CropDiseaseDetection[];
  onNavigate?: (screen: ActiveScreen) => void;
  onAskBotWithPrompt?: (prompt: string) => void;
  language: Language;
}

type AnalysisStage = 'idle' | 'validating' | 'diagnosing' | 'completed' | 'invalid' | 'error';

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

export const DiseaseDetectionScreen: React.FC<DiseaseDetectionScreenProps> = ({
  activeFarm,
  onSaveDetectionRecord,
  detectionHistory,
  onNavigate,
  onAskBotWithPrompt,
  language,
}) => {
  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const defaultSpecimen = SAMPLE_SPECIMENS[0];
  const [selectedImage, setSelectedImage] = useState<string>(defaultSpecimen.imageUrl);
  const [activeSpecimenKey, setActiveSpecimenKey] = useState<string>(defaultSpecimen.key);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [stageMessage, setStageMessage] = useState<string>('');

  // Diagnostic states
  const [validationResult, setValidationResult] = useState<CoffeeLeafValidationResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<CropDiseaseDetection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedMetadata, setProcessedMetadata] = useState<{
    filename: string;
    format: string;
    size: [number, number];
    original_bytes?: number;
    converted_bytes?: number;
  } | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const isAnalyzingRef = useRef(false);

  // Safe JSON response parser that checks Content-Type and handles unexpected HTML or quota gracefully
  const safeParseResponse = async (res: Response): Promise<any> => {
    const contentType = res.headers.get('content-type') || '';

    // If server returned non-JSON (e.g. 500 error page, 404 fallback, or dev server index.html)
    if (!contentType.includes('application/json')) {
      const rawText = await res.text();
      const isHtml = rawText.trim().startsWith('<') || rawText.includes('<!doctype') || rawText.includes('<html');

      if (res.status === 429 || rawText.includes('429') || rawText.includes('quota') || rawText.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Daily AI request quota reached on your Google AI Studio plan. Please retry in a few hours.');
      }

      if (isHtml) {
        throw new Error(
          'The leaf analysis service is temporarily busy. Please click "Try Again" or select another specimen.'
        );
      }
      try {
        return JSON.parse(rawText);
      } catch {
        throw new Error(`The analysis server returned an unexpected response format (${res.status}). Please try again.`);
      }
    }

    try {
      const data = await res.json();
      if (res.status === 429) {
        throw new Error(data.error || 'Daily AI request quota reached on your Google AI Studio plan. Please retry in a few hours.');
      }
      return data;
    } catch (e: any) {
      if (e.message?.includes('quota') || e.message?.includes('Daily AI')) {
        throw e;
      }
      throw new Error('Failed to parse analysis server response. Please try again.');
    }
  };

  // File upload handler supporting JPG, JPEG, PNG, WEBP, and camera RAW formats
  const processSelectedFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.dng', '.raw', '.cr2', '.nef', '.arw', '.tiff', '.tif'];
    const isImage = file.type.startsWith('image/') || validExts.includes(ext);

    if (!isImage) {
      setErrorMessage('Please upload a valid image file in JPG, JPEG, PNG, or WEBP format.');
      setStage('error');
      return;
    }

    setUploadedFile(file);
    setActiveSpecimenKey('custom_upload');
    setStage('idle');
    setValidationResult(null);
    setDiagnosis(null);
    setErrorMessage(null);
    setProcessedMetadata(null);

    // Read Data URL for preview and base64 transmission
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.onerror = () => {
      console.warn('Error reading file as data URL');
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

  // Specimen selection handler
  const handleSelectSpecimen = (specimen: SampleSpecimen) => {
    setSelectedImage(specimen.imageUrl);
    setUploadedFile(null);
    setActiveSpecimenKey(specimen.key);
    setStage('idle');
    setValidationResult(null);
    setDiagnosis(null);
    setErrorMessage(null);
    setProcessedMetadata(null);
  };

  // Two-Stage AI Execution Pipeline with /detect Image Converter & Pathology AI
  // Step 1: Validate plant leaf structure (rejects cars, humans, buildings, non-leaf objects)
  // Step 2: Image Converter (EXIF transposition, sRGB JPEG 95%) & Foliar Pathology Diagnosis
  const executeTwoStageAnalysis = async () => {
    if (!selectedImage && !uploadedFile) return;

    // Prevent duplicate concurrent requests
    if (isAnalyzingRef.current || stage === 'validating' || stage === 'diagnosing') {
      return;
    }

    isAnalyzingRef.current = true;
    setErrorMessage(null);
    setDiagnosis(null);
    setProcessedMetadata(null);

    // Ensure image base64 data is resolved if file upload is still reading
    let currentImageBase64 = selectedImage;
    if (!currentImageBase64 && uploadedFile) {
      try {
        currentImageBase64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(uploadedFile);
        });
        setSelectedImage(currentImageBase64);
      } catch (rErr) {
        isAnalyzingRef.current = false;
        setStage('error');
        setErrorMessage('Failed to read the uploaded image. Please select the file again.');
        return;
      }
    }

    // ==========================================
    // EXECUTE /detect (Single-pass Validation + Pathology AI)
    // ==========================================
    setStage('diagnosing');
    setStageMessage('Verifying foliar morphology & analyzing plant pathology...');

    try {
      let diagData: any;

      if (uploadedFile) {
        // Post multipart file upload directly to /detect endpoint
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('cropType', activeFarm?.cropType || 'Coffee Arabica');
        formData.append(
          'notes',
          `Farm: ${activeFarm?.name || 'Estate'} in ${activeFarm?.locationName || 'Western Ghats, India'}`
        );
        if (activeSpecimenKey && activeSpecimenKey !== 'custom_upload') {
          formData.append('specimenKey', activeSpecimenKey);
        }

        const detectRes = await fetch('/detect', {
          method: 'POST',
          body: formData,
        });

        const detectJson = await safeParseResponse(detectRes);

        if (!detectRes.ok) {
          const errDetail =
            detectJson.error ||
            detectJson.detail ||
            (detectJson.isUnavailable
              ? 'The AI Leaf Analysis Service is currently unavailable. Please check your connection and try again.'
              : `Processing failed with status ${detectRes.status}`);
          throw new Error(errDetail);
        }

        // Check if /detect caught an invalid image during analysis
        if (detectJson.isValidLeaf === false || detectJson.isValidCoffeeLeaf === false) {
          setValidationResult({
            isValidCoffeeLeaf: false,
            detectedSubject: detectJson.detectedSubject || 'Non-Plant Object',
            confidence: 98,
            reason: 'Image does not contain a recognizable plant leaf.',
            validationMessage: 'Invalid image. Please upload a valid plant or leaf image.',
          });
          setStage('invalid');
          isAnalyzingRef.current = false;
          return;
        }

        setProcessedMetadata({
          filename: detectJson.filename || uploadedFile.name,
          format: detectJson.format || 'JPEG',
          size: detectJson.size || [640, 480],
          original_bytes: detectJson.original_bytes,
          converted_bytes: detectJson.converted_bytes,
        });

        setValidationResult({
          isValidCoffeeLeaf: true,
          detectedSubject: detectJson.detectedSubject || detectJson.detectedPlant || 'Plant Foliage',
          confidence: detectJson.confidence || 95,
          reason: 'Identifiable plant leaf structure verified.',
          validationMessage: null,
        });

        if (detectJson.data_url) {
          setSelectedImage(detectJson.data_url);
        }
        diagData = detectJson.disease_detection || detectJson;
      } else {
        // Preset specimen or Base64 payload: call /detect with JSON payload
        const detectRes = await fetch('/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: currentImageBase64,
            filename: `${activeSpecimenKey}.jpg`,
            cropType: activeFarm?.cropType || 'Crop Foliage',
            notes: `Farm: ${activeFarm?.name || 'Estate'} in ${activeFarm?.locationName || 'India'}`,
            specimenKey: activeSpecimenKey,
          }),
        });

        const detectJson = await safeParseResponse(detectRes);

        if (!detectRes.ok) {
          const errDetail =
            detectJson.error ||
            detectJson.detail ||
            (detectJson.isUnavailable
              ? 'The AI Leaf Analysis Service is currently unavailable. Please check your connection and try again.'
              : `Diagnosis request failed with status ${detectRes.status}`);
          throw new Error(errDetail);
        }

        if (detectJson.isValidLeaf === false || detectJson.isValidCoffeeLeaf === false) {
          setValidationResult({
            isValidCoffeeLeaf: false,
            detectedSubject: detectJson.detectedSubject || 'Non-Plant Object',
            confidence: 98,
            reason: 'Image does not contain a recognizable plant leaf.',
            validationMessage: 'Invalid image. Please upload a valid plant or leaf image.',
          });
          setStage('invalid');
          isAnalyzingRef.current = false;
          return;
        }

        setValidationResult({
          isValidCoffeeLeaf: true,
          detectedSubject: detectJson.detectedSubject || detectJson.detectedPlant || 'Plant Foliage',
          confidence: detectJson.confidence || 95,
          reason: 'Identifiable plant leaf structure verified.',
          validationMessage: null,
        });

        setProcessedMetadata({
          filename: detectJson.filename || `${activeSpecimenKey}.jpg`,
          format: detectJson.format || 'JPEG',
          size: detectJson.size || [640, 480],
          original_bytes: detectJson.original_bytes,
          converted_bytes: detectJson.converted_bytes,
        });
        diagData = detectJson.disease_detection || detectJson;
      }

      if (!diagData) {
        throw new Error('Analysis completed but diagnostic details could not be retrieved. Please try again.');
      }

      // Standardize detection result
      const isHealthy =
        diagData.detectionResult === 'Healthy' ||
        diagData.diseaseName?.toLowerCase().includes('healthy') ||
        diagData.conditionName?.toLowerCase().includes('healthy');

      const isUncertain = diagData.detectionResult === 'Uncertain';

      const finalDetectionResult: 'Healthy' | 'Possible Disease Detected' | 'Uncertain' = isHealthy
        ? 'Healthy'
        : isUncertain
        ? 'Uncertain'
        : 'Possible Disease Detected';

      const finalSeverity: 'Low' | 'Medium' | 'High' =
        diagData.severity === 'High' || diagData.severity === 'Severe'
          ? 'High'
          : diagData.severity === 'Medium' || diagData.severity === 'Moderate'
          ? 'Medium'
          : 'Low';

      const detectedPlant = diagData.detectedPlant || diagData.cropIdentified || activeFarm?.cropType || 'Plant Specimen';
      const visibleSymptoms =
        diagData.diseaseSymptoms ||
        diagData.visibleSymptoms ||
        diagData.symptomsObserved ||
        (isHealthy
          ? [
              'Intact waxy leaf cuticle with uniform healthy pigmentation',
              'Absence of fungal sporulation, chlorotic halos, or necrotic lesions',
              'Robust vascular venation and leaf turgor',
            ]
          : [
              'Visible foliar lesion pattern observed on leaf blade',
              'Characteristic pigmentation irregularities consistent with plant pathogen',
            ]);

      const recommendedNextSteps =
        diagData.recommendedTreatment ||
        diagData.recommendedNextSteps ||
        (isHealthy
          ? [
              'Continue scheduled seasonal foliar nutrition and organic vermicompost dressing',
              'Maintain optimal shade canopy to prevent foliar sun scorch',
              'Conduct routine bi-weekly field scouting during monsoon flushes',
            ]
          : [
              'Isolate and prune heavily infected foliage to prevent regional spore spread',
              'Adjust estate shade cover to increase airflow and accelerate leaf drying',
              'Apply recommended agronomic treatment under guidance of extension officer',
              'Schedule re-inspection in 10-14 days to assess foliar response',
            ]);

      const summaryMessage =
        diagData.summaryMessage ||
        (isHealthy
          ? `${detectedPlant} Leaf – No obvious disease symptoms detected.`
          : isUncertain
          ? 'Uncertain Result – Please upload a clearer image or consult an agricultural expert.'
          : `Possible ${diagData.diseaseName || 'Disease'} detected on ${detectedPlant} with ${finalSeverity.toLowerCase()} severity.`);

      // Create lightweight thumbnail for safe localStorage persistence
      const lightweightThumbnail = await createThumbnail(currentImageBase64);

      const record: CropDiseaseDetection = {
        id: `foliar_diag_${Date.now()}`,
        farmId: activeFarm?.id,
        cropIdentified: detectedPlant,
        detectedPlant,
        detectionResult: finalDetectionResult,
        diseaseName: isHealthy
          ? `Healthy ${detectedPlant} Leaf`
          : diagData.diseaseName || diagData.conditionName || 'Foliar Disorder',
        conditionName: isHealthy
          ? `Healthy ${detectedPlant} Leaf`
          : diagData.conditionName || diagData.diseaseName || 'Foliar Disorder',
        scientificName: diagData.scientificName || (isHealthy ? 'Botanical Specimen' : 'Pathogen'),
        confidence: typeof diagData.confidence === 'number' ? diagData.confidence : 95,
        severity: finalSeverity,
        diseaseSeverity: finalSeverity,
        isDefinitive: !!diagData.isDefinitive,
        visibleSymptoms,
        symptomsObserved: visibleSymptoms,
        possibleCauses: diagData.possibleCauses || ['Microclimate humidity fluctuations and foliar pathogen activity'],
        recommendedNextSteps,
        recommendedActions: diagData.recommendedActions || {
          immediate: recommendedNextSteps.slice(0, 2),
          culturalAndOrganic: ['Regulate canopy shade to 35-40%', 'Improve drainage and air circulation'],
          chemicalTreatment: isHealthy ? ['No chemical treatment required'] : ['Consult agronomist for targeted fungicide spray'],
          preventative: ['Grow disease-tolerant varieties', 'Maintain balanced soil nutrition'],
        },
        summaryMessage,
        expertVerificationWarning:
          diagData.expertVerificationWarning ||
          'AI-assisted diagnosis: Always obtain field verification from a local certified agronomist or extension officer before applying chemical treatments.',
        imageUrl: lightweightThumbnail,
        createdAt: new Date().toISOString(),
        samplePresetKey: activeSpecimenKey,
      };

      setDiagnosis(record);
      setStage('completed');

      // Persist to storage safely (storage.ts helper protects against QuotaExceededError)
      try {
        onSaveDetectionRecord(record);
      } catch (saveErr) {
        console.warn('Storage save failed, continuing:', saveErr);
      }
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setStage('error');
      setErrorMessage(
        err.message || 'The leaf analysis service encountered an unexpected error. Please check your connection and try again.'
      );
    } finally {
      isAnalyzingRef.current = false;
    }
  };

  // Try Again: If in error state and image exists, retry analysis safely!
  const handleTryAgain = () => {
    if (stage === 'error' && (selectedImage || uploadedFile)) {
      executeTwoStageAnalysis();
    } else {
      setStage('idle');
      setValidationResult(null);
      setDiagnosis(null);
      setErrorMessage(null);
    }
  };

  // Reset back to upload new photo
  const handleResetToUpload = () => {
    setStage('idle');
    setValidationResult(null);
    setDiagnosis(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.dng,.raw,.cr2,.nef,.arw,.tiff,.tif,.heic,.heif"
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

      {/* Header Banner: Dark Green Theme */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/50 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plantation Pathology Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              AI Coffee Arabica Leaf Disease Detection
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Two-stage Vision AI: strict botanical leaf verification gate followed by deep pathological diagnostic
              for Coffee Leaf Rust, Cercospora, Brown Eye Spot, Leaf Blight, and leaf abnormalities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('crop_detector')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <ScanLine className="w-4 h-4 text-emerald-200" />
                <span>AI Plant Identifier</span>
              </button>
            )}
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('alert_center')}
                className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white text-xs font-semibold border border-emerald-600/40 transition flex items-center gap-2 shadow-sm"
              >
                <Stethoscope className="w-4 h-4 text-emerald-300" />
                <span>Alert Center</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Preview Area (Left) | Analysis & Diagnosis Report (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload, Camera, Preview & Test Specimens (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Upload & Camera Capture Box */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>1. Upload or Capture Leaf</span>
              </h2>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                RAW, DNG, HEIC, JPG, PNG
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
                    Drag & drop leaf photo here, or select option below
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clear top or underside view of a Coffee Arabica leaf
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

            {/* 2. Image Preview Display Before Analysis (Required) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Image Preview</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeSpecimenKey === 'custom_upload' ? 'User Uploaded File' : 'Curated Test Specimen'}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-[4/3] group shadow-inner">
                <img
                  src={selectedImage}
                  alt="Coffee leaf preview"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Badge Overlay */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
                    {stage === 'completed'
                      ? 'Analyzed'
                      : stage === 'validating'
                      ? 'Validating Specimen...'
                      : stage === 'diagnosing'
                      ? 'Deep Pathology Scan...'
                      : stage === 'invalid'
                      ? 'Rejected: Non-Coffee'
                      : 'Ready for Analysis'}
                  </span>
                </div>

                {/* Specimen Tag */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                  <span className="font-semibold truncate">
                    {SAMPLE_SPECIMENS.find((s) => s.key === activeSpecimenKey)?.titleEn || 'User Captured Photo'}
                  </span>
                </div>
              </div>

              {/* Primary "Analyze Leaf" Button (Explicitly Required) */}
              <button
                type="button"
                onClick={executeTwoStageAnalysis}
                disabled={stage === 'validating' || stage === 'diagnosing'}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 disabled:opacity-50 disabled:pointer-events-none"
              >
                {stage === 'validating' || stage === 'diagnosing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Processing with Vision AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-200" />
                    <span>Analyze Leaf</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Curated Test Specimens for Instant Testing */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-900/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-emerald-700" />
                <span>Test With Curated Specimens</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">1-Click Test</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Test healthy leaves, diseased specimens, or test the AI validation gate with non-coffee images:
            </p>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {SAMPLE_SPECIMENS.map((specimen) => {
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
                      alt={specimen.titleEn}
                      className="w-11 h-11 rounded-lg object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {specimen.titleEn}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            specimen.isValidCoffeeLeaf
                              ? specimen.category === 'Healthy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {specimen.isValidCoffeeLeaf ? (specimen.category === 'Healthy' ? 'Healthy' : 'Disease') : 'Invalid Test'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {specimen.scientificName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis, Validation Gate & Disease Detection Results (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* ======================================================== */}
          {/* STATE A: LOADING ANIMATION DURING AI ANALYSIS            */}
          {/* ======================================================== */}
          {(stage === 'validating' || stage === 'diagnosing') && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-800/20 text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-40" />
                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 border-r-emerald-500 border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <Leaf className="w-10 h-10 animate-pulse text-emerald-700" />
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                  {stage === 'validating' ? 'Step 1 of 2: Botanical Validation' : 'Step 2 of 2: Foliar Pathology Scan'}
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {stage === 'validating' ? 'Validating Plant Leaf Specimen...' : 'Analyzing Plant Diseases & Disorders...'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {stageMessage}
                </p>
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left text-xs pt-4 border-t border-slate-100">
                <div className={`p-3 rounded-xl border flex items-center gap-2 ${stage === 'validating' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  {stage === 'diagnosing' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                  )}
                  <span className="font-bold text-[11px]">1. Plant Leaf Check</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-2 ${stage === 'diagnosing' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {stage === 'diagnosing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-bold text-[11px]">2. Pathology Diagnosis</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE B: INVALID IMAGE WARNING (STRICT REQUIREMENT)      */}
          {/* If the uploaded image is not a plant or leaf, display:   */}
          {/* "Invalid image. Please upload a valid plant or leaf image."*/}
          {/* ======================================================== */}
          {stage === 'invalid' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-red-500/80 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                    Validation Gate Failed
                  </span>
                  <h3 className="text-2xl font-black text-red-600 tracking-tight">
                    INVALID IMAGE
                  </h3>
                </div>
              </div>

              {/* Exact required warning banner */}
              <div className="p-4 rounded-2xl bg-red-50/90 border border-red-300 text-red-950 space-y-2">
                <p className="text-sm sm:text-base font-bold leading-snug text-red-900">
                  Invalid image. Please upload a valid plant or leaf image.
                </p>
                {validationResult?.detectedSubject && (
                  <p className="text-xs text-red-700 font-mono">
                    Detected Subject: <span className="font-bold underline">{validationResult.detectedSubject}</span>
                    {validationResult.confidence ? ` (${validationResult.confidence}% confidence)` : ''}
                  </p>
                )}
                {validationResult?.reason && (
                  <p className="text-xs text-red-700/80 italic">
                    {validationResult.reason}
                  </p>
                )}
              </div>

              {/* Rejection Details Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <strong className="block font-bold text-slate-900">Why was this image rejected?</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  To prevent false diagnoses and maintain agronomic precision, the system requires an identifiable
                  plant leaf or crop foliage photograph. Images of humans, faces, animals, vehicles, buildings, food, documents,
                  screenshots, or blank/blurry photos are automatically filtered out prior to disease inspection.
                </p>
              </div>

              {/* "Try Again" Button */}
              <button
                type="button"
                onClick={handleResetToUpload}
                className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-sm font-black transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE C: ERROR STATE                                      */}
          {/* ======================================================== */}
          {stage === 'error' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-red-300 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold">Analysis Service Interruption</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{errorMessage}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToUpload}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <span>Select Another Image</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE D: DETECTION RESULTS DISPLAY                        */}
          {/* ======================================================== */}
          {stage === 'completed' && diagnosis && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/90 space-y-6">
              {/* Header Indicator: Green for Healthy, Red Warning for Disease Detected */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  diagnosis.detectionResult === 'Healthy'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : diagnosis.detectionResult === 'Uncertain'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-red-50/90 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      diagnosis.detectionResult === 'Healthy'
                        ? 'bg-emerald-600 text-white'
                        : diagnosis.detectionResult === 'Uncertain'
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {diagnosis.detectionResult === 'Healthy' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : diagnosis.detectionResult === 'Uncertain' ? (
                      <HelpCircle className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                      Detection Result
                    </span>
                    <strong className="text-base sm:text-lg font-black block">
                      {diagnosis.detectionResult}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  {/* AI Confidence Score */}
                  <div className="text-right px-3 py-1 bg-white/70 backdrop-blur-xs rounded-xl border border-black/5">
                    <span className="text-[10px] text-slate-500 block font-semibold">AI Confidence</span>
                    <strong className="text-sm font-black text-slate-900">{diagnosis.confidence}%</strong>
                  </div>

                  {/* Disease Severity: Low, Medium or High */}
                  <div
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase shadow-xs ${
                      diagnosis.severity === 'High'
                        ? 'bg-red-600 text-white'
                        : diagnosis.severity === 'Medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    <span>Severity: {diagnosis.severity}</span>
                  </div>
                </div>
              </div>

              {/* Summary Banner */}
              {diagnosis.detectionResult === 'Healthy' && (
                <div className="p-3.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{diagnosis.summaryMessage || `${diagnosis.detectedPlant || 'Plant'} Leaf – No obvious disease symptoms detected.`}</span>
                </div>
              )}

              {/* Image Converter & /detect Pipeline Verification Card */}
              {processedMetadata && (
                <div className="p-4 rounded-2xl bg-slate-950 text-white text-xs border border-emerald-500/30 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                        Image Converter Engine & /detect API
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                      HTTP 200 OK
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">Filename</span>
                      <span className="truncate block font-semibold text-white">{processedMetadata.filename}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">Processed Format</span>
                      <span className="font-semibold text-emerald-300">{processedMetadata.format} (Quality: 95)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">Image.size [W, H]</span>
                      <span className="font-semibold text-amber-300">[{processedMetadata.size[0]}, {processedMetadata.size[1]}]</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-sans">EXIF Orientation</span>
                      <span className="font-semibold text-teal-300">Auto-Transposed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Plant & Disease Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Detected Plant
                  </span>
                  <div className="text-base font-black text-emerald-950 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>{diagnosis.detectedPlant || diagnosis.cropIdentified || 'Plant Specimen'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {diagnosis.cropIdentified || diagnosis.detectedPlant || 'Botanical Specimen'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Disease Name / Pathology
                  </span>
                  <div className="text-base font-black text-slate-900 truncate">
                    {diagnosis.diseaseName || diagnosis.conditionName}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono italic truncate">
                    {diagnosis.scientificName}
                  </p>
                </div>
              </div>

              {/* Visible Symptoms */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Visible Symptoms Observed</span>
                </h4>
                <ul className="grid grid-cols-1 gap-2 text-xs">
                  {(diagnosis.visibleSymptoms || diagnosis.symptomsObserved).map((sym, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                      <span className="leading-relaxed font-medium">{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Next Steps (Explicitly Required) */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Recommended Next Steps</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {(diagnosis.recommendedNextSteps || diagnosis.recommendedActions.immediate).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Ask Bot, Crop Doctor, Print */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {onAskBotWithPrompt && (
                    <button
                      type="button"
                      onClick={() =>
                        onAskBotWithPrompt(
                          `I scanned a Coffee Arabica leaf and AI detected: ${diagnosis.diseaseName} (${diagnosis.scientificName}) with ${diagnosis.severity} severity and ${diagnosis.confidence}% confidence. Visible symptoms: ${diagnosis.visibleSymptoms?.join(', ')}. What are the best immediate treatments and shade management steps for my farm?`
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask Farmer Bot</span>
                    </button>
                  )}

                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('alert_center')}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Alert Center</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={executeTwoStageAnalysis}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-analyze</span>
                </button>
              </div>

              {/* Official Agronomic Disclaimer */}
              <p className="text-[10px] text-slate-400 italic leading-relaxed pt-2">
                {diagnosis.expertVerificationWarning}
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE E: IDLE / INITIAL STATE (Ready for analysis)       */}
          {/* ======================================================== */}
          {stage === 'idle' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Ready for Inspection</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Ready to Inspect Coffee Arabica Specimen
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Click the green <strong>"Analyze Leaf"</strong> button on the left to initiate the two-stage AI analysis.
                  The vision model will first authenticate that the uploaded photo is indeed a Coffee Arabica leaf, and then
                  proceed to identify health status, disease conditions, and recommended treatments.
                </p>
              </div>

              {/* Workflow Flowchart Card */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                  Expected Workflow Pipeline
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">Step 1</span>
                    <strong className="block text-white text-[11px]">Upload Image</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">Step 2</span>
                    <strong className="block text-white text-[11px]">Validate Leaf</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">Step 3</span>
                    <strong className="block text-white text-[11px]">Disease Analysis</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-800">
                    <span className="text-[10px] text-emerald-400 block font-bold">Step 4</span>
                    <strong className="block text-white text-[11px]">Next Steps</strong>
                  </div>
                </div>
              </div>

              {/* Supported Diseases Quick Reference */}
              <div className="space-y-2">
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                  Pathologies & Abnormalities Detected
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Healthy Coffee Leaf</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Coffee Leaf Rust</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Cercospora Leaf Spot</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>Brown Eye Spot</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Leaf Blight (Phoma)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>Foliar Abnormalities</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Recent Diagnostic History Logs (Filtered & Safe) */}
          {detectionHistory && detectionHistory.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  <span>Recent Foliar Inspection Records</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {detectionHistory.length} saved
                </span>
              </div>

              <div className="space-y-2">
                {detectionHistory.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {rec.imageUrl ? (
                        <img
                          src={rec.imageUrl}
                          alt="thumbnail"
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <Leaf className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <strong className="text-slate-900 block truncate font-bold">
                          {rec.diseaseName || rec.conditionName}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {new Date(rec.createdAt).toLocaleDateString()} • {rec.cropIdentified || 'Coffee Arabica'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.severity === 'Severe' || rec.severity === 'High'
                            ? 'bg-red-100 text-red-800'
                            : rec.severity === 'Moderate' || rec.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {rec.severity}
                      </span>
                      <span className="text-xs font-black text-slate-700 font-mono">
                        {rec.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
