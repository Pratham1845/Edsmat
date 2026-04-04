import { useState, useRef } from 'react';
import Sidebar from '../../components/Sidebar';

const EmotionPage = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const videoRef = useRef(null);

  const startDetection = () => {
    // TODO: Integrate with face-api.js or similar library
    setIsDetecting(true);
    setCurrentEmotion({
      emotion: 'Happy',
      confidence: 87,
      emoji: '😊'
    });
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setCurrentEmotion(null);
  };

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
            <h2 className="text-lg font-bold text-gray-900 mb-4">Live Camera Feed</h2>
            
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
              {!isDetecting ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <span className="text-6xl mb-4 block">📷</span>
                    <p>Camera is off</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
                  <div className="text-center text-white">
                    <span className="text-6xl mb-4 block animate-pulse">🎥</span>
                    <p className="font-semibold">Detection Active</p>
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
                        <p className="text-lg font-bold text-gray-900">{currentEmotion.emotion}</p>
                        <p className="text-sm text-gray-600">{currentEmotion.confidence}% confidence</p>
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
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Start Detection
                </button>
              ) : (
                <button
                  onClick={stopDetection}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop Detection
                </button>
              )}
            </div>
          </div>

          {/* Engagement Indicator */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Engagement Level</h2>
              
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4">
                  <span className="text-4xl font-bold text-white">85%</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">Highly Engaged</p>
                <p className="text-sm text-gray-600 mt-2">You're doing great! Keep it up.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Focus</span>
                  <span className="font-semibold text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Interest</span>
                  <span className="font-semibold text-gray-900">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Confusion</span>
                  <span className="font-semibold text-gray-900">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>

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
