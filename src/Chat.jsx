import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, User } from 'lucide-react';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 60000); // Check server status every minute
    return () => clearInterval(intervalId);
  }, []);

  const uri = 'https://f8e6-35-247-154-77.ngrok-free.app/';

  const checkServerStatus = async () => {
    const url = `${uri}/health-check`;
    try {
      const response = await fetch(url, { method: 'GET' });
      setIsServerOnline(response.ok);
    } catch (error) {
      setIsServerOnline(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== '') {
      setIsLoading(true);
      setShowWelcome(false);
      setMessages((prevMessages) => [...prevMessages, { text: inputMessage, sender: 'user' }]);

      const url = `${uri}/process-question`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: inputMessage }),
        });

        if (!response.ok) {
          throw new Error('Server responded with an error');
        }

        const data = await response.json(); // Ensure to await the response JSON first

        // Create the structured output after fetching data
        const structuredOutput = {
          query: data.query, // Extracts the query from the data
          answer: data.answer, // Extracts the answer from the data
          question_type: data.question_type, // Static string as specified
          evidence_list: data.evidence_list.map(chunk => ({
            title: chunk.title, // Gets the title from each chunk
            author: chunk.author, // Gets the author from each chunk
            url: chunk.url, // Gets the URL from each chunk
            source: chunk.source, // Gets the source from each chunk
            category: chunk.category, // Gets the category from each chunk
            published_at: chunk.published_at, // Gets the publication date from each chunk
            fact: chunk.chunk // Wraps the fact text from each chunk
          }))
        };

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: JSON.stringify(structuredOutput, null, 2), sender: 'bot' }, // Format the JSON for readability
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        handleRequestFailure('Failed to connect to the server. Please try again later.');
      } finally {
        setIsLoading(false);
      }

      setInputMessage(''); // Clear input field
    }
  };

  const handleRequestFailure = (errorMessage) => {
    setMessages((prevMessages) => [...prevMessages, { text: errorMessage, sender: 'bot' }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <header className="bg-black text-white py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rag Pekka</h1>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${isServerOnline ? 'bg-green-500' : 'bg-red-500'} px-3 py-1 rounded-full`}>
            {isServerOnline ? 'Online' : 'Offline'}
          </span>
          <User size={24} />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {showWelcome && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-600 bg-white p-8 rounded-xl shadow-md">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Rag Pekka!</h2>
                <p>Start a conversation to explore the possibilities.</p>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${message.sender === 'user' ? 'bg-black text-white' : 'bg-white text-black shadow-md'} animate-slideIn`}>
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
      </div>
      <div className="border-t border-gray-300 p-4 bg-gray-200">
        <div className="flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && inputMessage.trim() !== '' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 border-none rounded-l-full py-3 px-6 focus:outline-none focus:ring-2 border-black border-2 hover:ring-black transition duration-300 ease-in-out"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
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
