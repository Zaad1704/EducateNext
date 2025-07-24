'use client';

import { useState } from 'react';
import QRScanner from '../../../components/qr/QRScanner';

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (data: string) => {
    try {
      setScanResult(data);
      setIsScanning(false);
      
      // Here you would typically validate the QR code with your API
      console.log('Scanned QR data:', data);
      
      // Example API call (uncomment when backend is ready)
      // const response = await fetch(`/api/qr/validate/${encodeURIComponent(data)}`);
      // const result = await response.json();
      
    } catch (err) {
      setError('Failed to process QR code');
    }
  };

  const handleError = (error: string) => {
    setError(error);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            QR Code Scanner
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Scan student or teacher QR codes for attendance
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <QRScanner
            onScan={handleScan}
            onError={handleError}
            isActive={isScanning}
          />

          <div className="flex justify-center">
            <button
              onClick={() => {
                setIsScanning(!isScanning);
                setError(null);
                setScanResult(null);
              }}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                isScanning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isScanning ? 'Stop Scanning' : 'Start Scanning'}
            </button>
          </div>

          {scanResult && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <h3 className="font-medium">Scan Result:</h3>
              <p className="mt-1 text-sm break-all">{scanResult}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <h3 className="font-medium">Error:</h3>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}