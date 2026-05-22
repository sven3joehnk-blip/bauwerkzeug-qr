'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  async function startScanner() {
    try {
      setError('');

      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          window.location.href = decodedText;
        },
        () => {}
      );
    } catch (err: any) {
      setError(err?.message || 'Kamera konnte nicht gestartet werden.');
    }
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          QR-Code Scanner
        </h1>

        <button
          onClick={startScanner}
          className="mb-6 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          Kamera starten
        </button>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div id="reader" className="overflow-hidden rounded-2xl" />
      </div>
    </main>
  );
}