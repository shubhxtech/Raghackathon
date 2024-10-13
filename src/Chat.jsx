import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setIsLoading(true);
      setShowWelcome(false);
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sender: 'user' }]);
      
      const url = 'https://b28d-35-185-143-235.ngrok-free.app/process-question';
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: inputMessage }),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setMessages(prevMessages => [
          ...prevMessages,
          { text: JSON.stringify(data, null, 2), sender: 'bot' }
        ]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        handleRequestFailure('Failed to connect to the server. Please try again later.');
      } finally {
        setIsLoading(false);
      }
      
      setInputMessage('');
    }
  };

  const handleRequestFailure = (errorMessage) => {
    setMessages(prevMessages => [...prevMessages, { text: errorMessage, sender: 'bot' }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-black text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Rag Pekka</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {showWelcome && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500 animate-pulse">
              <h2 className="text-2xl font-semibold mb-2">Welcome to the Chat!</h2>
              <p>Start a conversation to begin.</p>
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-[70%] rounded-lg p-4 ${
                message.sender === 'user' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black shadow-md'
              } animate-slideIn`}
            >
              {message.sender === 'bot' ? (
                <pre className="whitespace-pre-wrap break-words">{message.text}</pre>
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white text-black rounded-lg p-4 shadow-md flex items-center space-x-2 animate-slideIn">
              <Loader2 className="animate-spin" size={20} />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4 hover:bg-gray-100 shadow-lg transition-all duration-200 bg-white">
        <div className="flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-full py-3 px-6 focus:outline-none focus:ring-2"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-black text-white rounded-r-full py-3 px-6 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 transition duration-300 ease-in-out"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Send size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;