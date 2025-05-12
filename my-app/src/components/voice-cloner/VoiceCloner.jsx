'use client';

import { useState, useRef } from 'react';
import ServerConnectionTest from './ServerConnectionTest';

export default function VoiceCloner() {
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const formRef = useRef(null);

  // Validate file type
  const validateFileType = (file) => {
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (!file || !validTypes.includes(file.type)) {
      return false;
    }
    return true;
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file)) {
      setError(`Invalid file type. Please upload WAV or MP3 audio files.`);
      e.target.value = null; // Reset input
      return;
    }

    if (fileType === 'source') {
      setSourceFile(file);
    } else {
      setTargetFile(file);
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(10); // Start progress

    if (!sourceFile || !targetFile) {
      setError('Please select both source and target audio files');
      setLoading(false);
      setProgress(0);
      return;
    }

    const formData = new FormData();
    formData.append('source', sourceFile);
    formData.append('target', targetFile);
    
    // Debug FormData contents
    console.log('Source file:', sourceFile.name, sourceFile.type, sourceFile.size);
    console.log('Target file:', targetFile.name, targetFile.type, targetFile.size);

    try {
      console.log('Attempting to connect to Flask server at http://127.0.0.1:5000/voice-clone');
      setProgress(20); // Update progress
      
      // First check if server is reachable
      try {
        const healthCheck = await fetch('http://127.0.0.1:5000/health', { 
          method: 'GET',
          mode: 'cors'
        });
        if (healthCheck.ok) {
          const healthData = await healthCheck.json();
          console.log('Server health check passed:', healthData);
        } else {
          console.warn('Server health check failed');
        }
      } catch (healthError) {
        console.error('Cannot reach Flask server:', healthError);
        setError('Cannot connect to the server. Make sure the Flask server is running on port 5000');
        setLoading(false);
        return;
      }

      setProgress(30); // Update progress
      
      // Now send the actual request
      console.log('Sending voice clone request...');
      const response = await fetch('http://127.0.0.1:5000/voice-clone', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'audio/*',
        },
        // Explicitly set CORS mode
        mode: 'cors',
      });

      console.log('Response received:', response.status, response.statusText);
      setProgress(70); // Processing nearly complete

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (!contentType?.includes('audio/')) {
        throw new Error('Invalid response format from server');
      }

      const blob = await response.blob();
      console.log('Received blob:', blob.type, blob.size);

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setProgress(100);
      console.log('Successfully created audio URL:', url);
    } catch (err) {
      console.error('Error during voice cloning:', err);
      setError(err.message || 'Failed to clone voice');
      setAudioUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setSourceFile(null);
    setTargetFile(null);
    setError(null);
    setProgress(0);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Voice Cloning Tool</h1>
      
      <ServerConnectionTest />
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h2 className="font-semibold text-blue-800 mb-2">How it works:</h2>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Upload a <strong>source voice</strong> audio file (the voice you want to clone)</li>
          <li>Upload a <strong>target voice</strong> audio file (the voice that will be transformed)</li>
          <li>Click "Clone Voice" and wait for processing</li>
          <li>Listen to the result - the target's speech with the source's voice!</li>
        </ol>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Voice (voice to clone)
          </label>
          <input
            type="file"
            name="source"
            accept="audio/wav,audio/mp3,audio/mpeg"
            required
            className="w-full border-2 border-gray-300 rounded-md p-2"
            disabled={loading}
            onChange={(e) => handleFileChange(e, 'source')}
          />
          {sourceFile && (
            <p className="mt-1 text-sm text-green-600">
              Selected: {sourceFile.name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Voice (voice to transform)
          </label>
          <input
            type="file"
            name="target"
            accept="audio/wav,audio/mp3,audio/mpeg"
            required
            className="w-full border-2 border-gray-300 rounded-md p-2"
            disabled={loading}
            onChange={(e) => handleFileChange(e, 'target')}
          />
          {targetFile && (
            <p className="mt-1 text-sm text-green-600">
              Selected: {targetFile.name}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading || !sourceFile || !targetFile}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium
              ${loading || !sourceFile || !targetFile ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              transition duration-150 ease-in-out`}
          >
            {loading ? 'Processing...' : 'Clone Voice'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="py-2 px-4 rounded-md text-gray-700 font-medium bg-gray-200 hover:bg-gray-300 transition duration-150 ease-in-out"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {progress < 30 ? 'Uploading files...' : 
             progress < 70 ? 'Processing voice conversion...' : 
             'Finalizing output...'}
          </p>
          <div className="h-2 bg-blue-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {audioUrl && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h2 className="font-semibold mb-2 text-green-800">Voice Cloning Result:</h2>
          <audio 
            controls 
            className="w-full"
            src={audioUrl}
            onError={(e) => {
              console.error('Audio playback error:', e);
              setError('Failed to play audio');
            }}
          />
          <div className="mt-2 flex justify-between">
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = 'cloned-voice.wav';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Download Audio
            </button>
            <button
              onClick={handleReset}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Clear & Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}