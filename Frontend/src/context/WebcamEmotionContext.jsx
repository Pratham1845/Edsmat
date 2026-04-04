import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

const STORAGE_KEY = 'edu-webcam-emotion-history-v1';
const DETECTION_INTERVAL = 800;
const CONFIDENCE_THRESHOLD = 0.4;
const FRESH_SIGNAL_MS = 7000;

export const EMOTION_META = {
  happy: { emoji: '\u{1F604}', color: '#f0c040' },
  sad: { emoji: '\u{1F622}', color: '#6096d8' },
  angry: { emoji: '\u{1F620}', color: '#e05555' },
  neutral: { emoji: '\u{1F610}', color: '#78909c' },
  surprised: { emoji: '\u{1F632}', color: '#a070e0' },
  fearful: { emoji: '\u{1F628}', color: '#50b8b8' },
  disgusted: { emoji: '\u{1F922}', color: '#70b870' }
};

export const DEFAULT_COUNTS = {
  happy: 0,
  sad: 0,
  angry: 0,
  neutral: 0,
  surprised: 0,
  fearful: 0,
  disgusted: 0
};

const WebcamEmotionContext = createContext(null);

function loadStoredHistory() {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function buildCounts(history) {
  return history.reduce((counts, entry) => {
    const emotion = entry?.emotion;
    if (emotion && counts[emotion] !== undefined) counts[emotion] += 1;
    return counts;
  }, { ...DEFAULT_COUNTS });
}

function getDominantEmotion(expressions) {
  return Object.entries(expressions || {}).reduce(
    (best, [emotion, score]) => (score > best.score ? { emotion, score } : best),
    { emotion: 'neutral', score: 0 }
  );
}

function createEmotionEntry(emotion, confidence) {
  const meta = EMOTION_META[emotion] || EMOTION_META.neutral;

  return {
    emotion,
    confidence,
    emoji: meta.emoji,
    color: meta.color,
    timestamp: new Date().toISOString(),
    updatedAt: Date.now()
  };
}

export function WebcamEmotionProvider({ children }) {
  const processingVideoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const modelsLoadedRef = useRef(false);

  const [cameraStream, setCameraStream] = useState(null);
  const [emotionLog, setEmotionLog] = useState(loadStoredHistory);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState('Camera off');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(emotionLog));
    } catch (_error) {
      // Ignore storage failures.
    }
  }, [emotionLog]);

  const stopDetection = useCallback((keepStatus = false) => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (processingVideoRef.current) {
      processingVideoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setIsDetecting(false);
    setCurrentEmotion(null);
    if (!keepStatus) setStatus('Camera off');
  }, []);

  useEffect(() => {
    return () => stopDetection(true);
  }, [stopDetection]);

  const emotionCounts = useMemo(() => buildCounts(emotionLog), [emotionLog]);

  const loadModels = useCallback(async () => {
    if (modelsLoadedRef.current) return true;

    try {
      setIsLoading(true);
      setStatus('Loading models...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      modelsLoadedRef.current = true;
      setStatus('Ready');
      return true;
    } catch (error) {
      console.error('Model load failed:', error);
      setStatus('Error loading models');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!processingVideoRef.current || processingVideoRef.current.readyState < 2) return;

    try {
      const detection = await faceapi
        .detectSingleFace(
          processingVideoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        )
        .withFaceExpressions();

      if (!detection?.expressions) return;

      const dominant = getDominantEmotion(detection.expressions);
      if (dominant.score < CONFIDENCE_THRESHOLD) return;

      const emotionEntry = createEmotionEntry(dominant.emotion, dominant.score);
      setCurrentEmotion(emotionEntry);
      setEmotionLog((prev) => [...prev, emotionEntry].slice(-500));
      setStatus(`Detecting: ${dominant.emotion}`);
    } catch (error) {
      console.error('Emotion detection failed:', error);
    }
  }, []);

  const startDetection = useCallback(async () => {
    if (isDetecting) return true;

    const modelsLoaded = await loadModels();
    if (!modelsLoaded) return false;

    try {
      setStatus('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraStream(stream);

      if (processingVideoRef.current) {
        processingVideoRef.current.srcObject = stream;
        await processingVideoRef.current.play();
      }

      setIsDetecting(true);
      setStatus('Detecting...');
      detectionIntervalRef.current = window.setInterval(analyzeFrame, DETECTION_INTERVAL);
      analyzeFrame();
      return true;
    } catch (error) {
      console.error('Camera error:', error);
      setStatus('Camera access denied');
      stopDetection(false);
      return false;
    }
  }, [analyzeFrame, isDetecting, loadModels, stopDetection]);

  const clearHistory = useCallback(() => {
    setEmotionLog([]);
    setCurrentEmotion(null);
  }, []);

  const getPromptEmotion = useCallback(() => {
    if (!isDetecting || !currentEmotion?.emotion) return '';
    if (Date.now() - currentEmotion.updatedAt > FRESH_SIGNAL_MS) return '';
    return currentEmotion.emotion;
  }, [currentEmotion, isDetecting]);

  const value = useMemo(
    () => ({
      cameraStream,
      isDetecting,
      isLoading,
      status,
      currentEmotion,
      emotionLog,
      emotionCounts,
      startDetection,
      stopDetection,
      clearHistory,
      getPromptEmotion,
      freshSignalMs: FRESH_SIGNAL_MS
    }),
    [cameraStream, clearHistory, currentEmotion, emotionCounts, emotionLog, getPromptEmotion, isDetecting, isLoading, startDetection, status, stopDetection]
  );

  return (
    <WebcamEmotionContext.Provider value={value}>
      {children}
      <video ref={processingVideoRef} className="hidden" muted playsInline aria-hidden="true" />
    </WebcamEmotionContext.Provider>
  );
}

export function useWebcamEmotion() {
  const context = useContext(WebcamEmotionContext);
  if (!context) throw new Error('useWebcamEmotion must be used within a WebcamEmotionProvider');
  return context;
}



