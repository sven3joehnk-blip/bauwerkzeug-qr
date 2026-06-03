'use client';

export default function BautagebuchPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-orange-500 p-6 text-white shadow-sm">
          <h1 className="text-4xl font-black">
            Dokumentation / Bautagebuch
          </h1>

          <p className="mt-2 font-bold">
            Tagesberichte, Fotos und Baustellendokumentation
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="font-bold text-slate-700">
            Seite ist repariert. Den Bilder-Upload bauen wir danach sauber neu ein.
          </p>

          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            Startseite
          </a>
        </section>
      </div>
    </main>
  );
}