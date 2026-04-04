import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import Sidebar from '../../components/Sidebar';

const EmotionPage = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [emotionLog, setEmotionLog] = useState([]);
  const [emotionCounts, setEmotionCounts] = useState({
    happy: 0, sad: 0, angry: 0, neutral: 0, surprised: 0, fearful: 0, disgusted: 0
  });

  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];
  const EMOTION_META = {
    happy: { emoji: '😄', color: '#f0c040' },
    sad: { emoji: '😢', color: '#6096d8' },
    angry: { emoji: '😠', color: '#e05555' },
    neutral: { emoji: '😐', color: '#78909c' },
    surprised: { emoji: '😲', color: '#a070e0' },
    fearful: { emoji: '😨', color: '#50b8b8' },
    disgusted: { emoji: '🤢', color: '#70b870' }
  };

  const CONFIDENCE_THRESHOLD = 0.4;
  const DETECTION_INTERVAL = 800;

  useEffect(() => {
    // Component mounted - models will be loaded when detection starts
    return () => {
      // Cleanup on unmount
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const loadModels = async () => {
    try {
      setStatus('Loading models...');
      setIsLoading(true);

      const tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5
      });

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);

      console.log('✅ Models loaded successfully');
      setStatus('Ready');
      return true;
    } catch (error) {
      console.error('Model load failed:', error);
      setStatus('Error loading models');
      alert('Model load failed — check /models folder');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startVideo = async () => {
    try {
      setStatus('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('🎥 Camera started');
        setStatus('Detecting...');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setStatus('Camera access denied');
      alert('Please allow camera access to use emotion detection');
    }
  };

  const getDominant = (expressions) => {
    return Object.entries(expressions).reduce(
      (best, [e, p]) => p > best.p ? { e, p } : best,
      { e: 'neutral', p: 0 }
    );
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.5
        }))
        .withFaceExpressions();

      if (!detections.length) return;

      const { e, p } = getDominant(detections[0].expressions);
      const meta = EMOTION_META[e];

      if (p >= CONFIDENCE_THRESHOLD) {
        const newEmotion = {
          emotion: e,
          confidence: p,
          emoji: meta.emoji,
          color: meta.color,
          timestamp: new Date()
        };

        setCurrentEmotion(newEmotion);

        // Update emotion log and counts
        setEmotionLog(prev => [...prev, newEmotion]);
        setEmotionCounts(prev => ({
          ...prev,
          [e]: prev[e] + 1
        }));
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  };

  const startDetection = async () => {
    const modelsLoaded = await loadModels();
    if (!modelsLoaded) return;

    await startVideo();
    setIsDetecting(true);

    // Start detection interval
    detectionIntervalRef.current = setInterval(analyzeFrame, DETECTION_INTERVAL);
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setCurrentEmotion(null);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setStatus('Stopped');
  };

  const clearData = () => {
    if (window.confirm('Clear all session data?')) {
      setEmotionLog([]);
      setEmotionCounts({
        happy: 0, sad: 0, angry: 0, neutral: 0, surprised: 0, fearful: 0, disgusted: 0
      });
      setCurrentEmotion(null);
    }
  };

  const getDominantEmotion = () => {
    const entries = Object.entries(emotionCounts);
    if (entries.length === 0) return null;

    return entries.reduce((best, [emotion, count]) => count > best.count ? { emotion, count } : best, { emotion: 'neutral', count: 0 });
  };

  const dominant = getDominantEmotion();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emotion Detection</h1>
          <p className="text-gray-600">Track your emotions in real-time during study sessions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Webcam Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Live Camera Feed</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">{status}</span>
              </div>
            </div>

            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ display: isDetecting ? 'block' : 'none' }}
              />

              {!isDetecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <span className="text-6xl mb-4 block">📷</span>
                    <p>Camera is off</p>
                    <p className="text-xs mt-2">Click "Start Detection" to begin</p>
                  </div>
                </div>
              )}

              {/* Overlay for detected emotion */}
              {currentEmotion && isDetecting && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{currentEmotion.emoji}</span>
                      <div>
                        <p className="text-lg font-bold text-gray-900 capitalize">{currentEmotion.emotion}</p>
                        <p className="text-sm text-gray-600">{(currentEmotion.confidence * 100).toFixed(1)}% confidence</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${currentEmotion.confidence * 100}%`,
                            backgroundColor: currentEmotion.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              {!isDetecting ? (
                <button
                  onClick={startDetection}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading Models...' : 'Start Detection'}
                </button>
              ) : (
                <button
                  onClick={stopDetection}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Detection
                </button>
              )}
              {emotionLog.length > 0 && (
                <button
                  onClick={clearData}
                  className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Emotion Statistics */}
          <div className="space-y-6">
            {/* Current Session Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Session Statistics</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{emotionLog.length}</div>
                  <div className="text-sm text-gray-600">Total Detections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dominant ? `${dominant.emotion} ${dominant.count}` : '—'}
                  </div>
                  <div className="text-sm text-gray-600">Dominant Emotion</div>
                </div>
              </div>

              {/* Emotion Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Emotion Distribution</h3>
                {EMOTIONS.map(emotion => {
                  const count = emotionCounts[emotion] || 0;
                  const percentage = emotionLog.length > 0 ? (count / emotionLog.length) * 100 : 0;
                  const meta = EMOTION_META[emotion];

                  return (
                    <div key={emotion} className="flex items-center space-x-3">
                      <span className="text-lg w-6">{meta.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-700">{emotion}</span>
                          <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: meta.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Emotions */}
            {emotionLog.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Emotions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {emotionLog.slice(-10).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{entry.emoji}</span>
                        <span className="capitalize text-sm font-medium text-gray-900">{entry.emotion}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {(entry.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Study Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Take a 5-minute break every 25 minutes</li>
                <li>• Stay hydrated during study sessions</li>
                <li>• Maintain good posture for better focus</li>
                <li>• Use active learning techniques</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmotionPage;
