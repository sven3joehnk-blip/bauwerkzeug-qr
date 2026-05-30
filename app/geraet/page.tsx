'use client';

export default function GeraetePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black text-slate-950">
          Geräteverwaltung
        </h1>

        <p className="mt-4 text-xl font-bold text-slate-700">
          Werkzeuge, Maschinen, QR-Codes und Ausgaben verwalten.
        </p>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-2xl font-black text-green-700">
            Route /geraet funktioniert.
          </p>
        </div>
      </div>
    </main>
  );
}
