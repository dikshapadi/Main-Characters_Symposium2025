'use client';

import { useState, useEffect } from 'react';

export default function ServerConnectionTest() {
  const [serverStatus, setServerStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  const checkServerConnection = async () => {
    try {
      setServerStatus('checking');
      setError(null);
      
      console.log('Checking Flask server connection...');
      const response = await fetch('http://127.0.0.1:5000/health', {
        method: 'GET',
        mode: 'cors',
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server responded:', data);
        setServerStatus('connected');
        setDetails(data);
      } else {
        console.error('Server returned error:', response.status);
        setServerStatus('error');
        setError(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setServerStatus('error');
      setError(err.message || 'Failed to connect to server');
    }
  };

  useEffect(() => {
    checkServerConnection();
  }, []);

  return (
    <div className="mb-6 p-4 border rounded-md">
      <h2 className="text-lg font-medium mb-2">Server Connection Status</h2>
      
      <div className="flex items-center gap-2 mb-2">
        <div 
          className={`w-3 h-3 rounded-full ${
            serverStatus === 'checking' ? 'bg-yellow-500' :
            serverStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="font-medium">
          {serverStatus === 'checking' ? 'Checking connection...' :
           serverStatus === 'connected' ? 'Connected to Flask server' : 'Connection failed'}
        </span>
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}
      
      {details && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Device: {details.device}</p>
          <p>Model: {details.model}</p>
        </div>
      )}
      
      <button
        onClick={checkServerConnection}
        className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
      >
        Test Connection Again
      </button>
    </div>
  );
}