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
        { fps: 10, qrbox: { width: 250, height: 250 } },
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
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-black">QR-Scanner</h1>

        <button
          onClick={startScanner}
          className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-4 font-black text-white"
        >
          Kamera starten
        </button>

        {error && (
          <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm"></header>
            {error}
          </div>
        )}

        <div id="reader" className="mt-6 overflow-hidden rounded-2xl" />

        <a href="/" className="mt-6 inline-block rounded-xl bg-slate-200 px-5 py-3 font-black">
          Zur Startseite
        </a>
      </div>
    </main>
  );
}