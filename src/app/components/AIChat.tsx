
'use client';

import { useState } from 'react';

export default function AIChat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const { response } = await res.json();
    setResponse(response);
  };

  return (
    <div className="w-full max-w-lg p-4 border border-gray-200 rounded-lg mt-4">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Chat with your AI"
          className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="ml-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Send
        </button>
      </form>
      {response && <div className="mt-4 p-4 bg-gray-100 rounded-md">{response}</div>}
    </div>
  );
}
