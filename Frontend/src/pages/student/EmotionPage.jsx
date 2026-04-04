import { useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import { DEFAULT_COUNTS, EMOTION_META, useWebcamEmotion } from '../../context/WebcamEmotionContext';

const EmotionPage = () => {
  const {
    cameraStream,
    isDetecting,
    isLoading,
    status,
    currentEmotion,
    emotionLog,
    emotionCounts,
    startDetection,
    stopDetection,
    clearHistory
  } = useWebcamEmotion();

  const previewVideoRef = useRef(null);
  const EMOTIONS = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful', 'disgusted'];

  useEffect(() => {
    const video = previewVideoRef.current;
    if (!video) return;

    if (cameraStream) {
      video.srcObject = cameraStream;
      video.play().catch(() => {
        // Ignore autoplay play failures.
      });
    } else {
      video.srcObject = null;
    }
  }, [cameraStream]);

  const getDominantEmotion = () => {
    const entries = Object.entries(emotionCounts || DEFAULT_COUNTS);
    if (entries.length === 0) return null;

    return entries.reduce(
      (best, [emotion, count]) => (count > best.count ? { emotion, count } : best),
      { emotion: 'neutral', count: 0 }
    );
  };

  const dominant = getDominantEmotion();

  const handleClear = () => {
    if (window.confirm('Clear all session data?')) {
      clearHistory();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wellbeing Check-ins</h1>
          <p className="text-gray-600">
            Optional webcam support can help you reflect on your mood trend. This page shows your live check-ins and recent wellbeing snapshots.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                ref={previewVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ display: isDetecting ? 'block' : 'none' }}
              />

              {!isDetecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-300 px-6">
                    <span className="text-5xl mb-4 block">CAM</span>
                    <p className="font-semibold">Camera is off</p>
                    <p className="text-xs mt-2 text-gray-400">Start check-ins when you want extra reflection support.</p>
                  </div>
                </div>
              )}

              {currentEmotion && isDetecting && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-semibold">{currentEmotion.emoji}</span>
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
                  {isLoading ? 'Loading Models...' : 'Start Background Detection'}
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
                  onClick={handleClear}
                  className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Session Statistics</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{emotionLog.length}</div>
                  <div className="text-sm text-gray-600">Total Detections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dominant ? `${dominant.emotion} ${dominant.count}` : '-'}
                  </div>
                  <div className="text-sm text-gray-600">Dominant Emotion</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Emotion Distribution</h3>
                {EMOTIONS.map((emotion) => {
                  const count = emotionCounts?.[emotion] || 0;
                  const percentage = emotionLog.length > 0 ? (count / emotionLog.length) * 100 : 0;
                  const meta = EMOTION_META[emotion];

                  return (
                    <div key={emotion} className="flex items-center space-x-3">
                      <span className="text-sm font-semibold w-10">{meta.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-700">{emotion}</span>
                          <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%`, backgroundColor: meta.color }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {emotionLog.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Emotions</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {emotionLog.slice(-10).reverse().map((entry, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">{entry.emoji}</span>
                        <span className="capitalize text-sm font-medium text-gray-900">{entry.emotion}</span>
                      </div>
                      <div className="text-xs text-gray-500">{(entry.confidence * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Study Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>- Take a 5-minute break every 25 minutes</li>
                <li>- Stay hydrated during study sessions</li>
                <li>- Maintain good posture for better focus</li>
                <li>- Use active learning techniques</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmotionPage;


