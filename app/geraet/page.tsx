'use client';

export default function GeraetePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-950">
              Geräteverwaltung
            </h1>

            <p className="mt-2 text-xl font-extrabold text-slate-800">
              Werkzeuge, Maschinen, QR-Codes und Ausgaben verwalten
            </p>

          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white"
          >
            Startseite
          </a>

        </div>

        <div className="grid gap-6 lg:grid-cols-3"></div>