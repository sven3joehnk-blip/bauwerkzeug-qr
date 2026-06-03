'use client';

export default function BautagebuchPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-black">
          Bautagebuch / Dokumentation
        </h1>

        <p className="mt-2 font-bold text-slate-700">
          Seite repariert. Bilder-Upload bauen wir danach sauber neu ein.
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
        >
          Startseite
        </a>
      </div>
    </main>
  );
}