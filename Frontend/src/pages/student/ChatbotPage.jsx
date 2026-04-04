import { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { useWebcamEmotion } from '../../context/WebcamEmotionContext';

const riskBadgeStyles = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200'
};

const ChatbotPage = () => {
  const { getPromptEmotion, isDetecting, currentEmotion } = useWebcamEmotion();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      message: "Hello! I'm your AI study assistant. How can I help you today?",
      risk_level: 'LOW',
      confidence: 90,
      intent: 'NORMAL',
      webcam_emotion: '',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      message: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_CHAT_API_BASE_URL || 'http://localhost:5502';
      const webcamEmotion = getPromptEmotion();
      const payload = { message: trimmed };

      if (webcamEmotion) {
        payload.webcam_emotion = webcamEmotion;
      }

      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const payloadData = await response.json();
      if (!payloadData?.success || !payloadData?.data) {
        throw new Error('Invalid response format');
      }

      const aiData = payloadData.data;
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        message: aiData.response_message || 'I am here to support you.',
        risk_level: (aiData.risk_level || 'LOW').toUpperCase(),
        confidence: Number.isFinite(Number(aiData.confidence)) ? Number(aiData.confidence) : 50,
        intent: (aiData.intent || 'NORMAL').toUpperCase(),
        webcam_emotion: aiData.webcam_emotion || webcamEmotion || '',
        timestamp: aiData.createdAt || new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: 'ai',
          message: 'Something went wrong, please try again.',
          risk_level: 'LOW',
          confidence: 50,
          intent: 'NORMAL',
          webcam_emotion: '',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="student" />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chatbot</h1>
          <p className="text-gray-600">
            Emotion signals are taken from the background webcam detector when it is active.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Background camera: {isDetecting ? `active (${currentEmotion?.emotion || 'analyzing'})` : 'off'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-linear-to-r from-indigo-600 to-blue-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-base font-bold tracking-wide">AI</span>
                </div>
                <div>
                  <h2 className="text-white font-semibold">AI Study Assistant</h2>
                  <p className="text-indigo-100 text-xs">Structured risk + intent insights</p>
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-350px)] overflow-y-auto p-6 space-y-4">
              {messages.map((entry) => {
                const isUser = entry.role === 'user';
                return (
                  <div key={entry.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{entry.message}</p>

                      {!isUser && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold border rounded-full ${
                              riskBadgeStyles[entry.risk_level] || riskBadgeStyles.LOW
                            }`}
                          >
                            Risk: {entry.risk_level || 'LOW'}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-white text-gray-700 border-gray-300">
                            Confidence: {Math.round(Number(entry.confidence) || 0)}%
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-white text-gray-700 border-gray-300">
                            Intent: {entry.intent || 'NORMAL'}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-white text-gray-700 border-gray-300 capitalize">
                            Webcam: {entry.webcam_emotion || 'not-used'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl rounded-bl-md px-4 py-3 bg-gray-100 border border-gray-200 text-gray-700">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:120ms]"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:240ms]"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;

