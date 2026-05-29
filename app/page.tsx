'use client';

export default function HomePage() {
  const modules = [
    {
      title: 'Mitarbeiterverwaltung',
      text: 'Personal, Arbeitszeiten und Führerscheine',
      href: '/employees',
    },
    {
      title: 'Geräteverwaltung',
      text: 'Werkzeuge, Maschinen und QR-Codes',
      href: '/geraet',
    },
    {
      title: 'Angebots- und Rechnungsverwaltung',
      text: 'Angebote, Rechnungen und Zahlungsstatus',
      href: '/angebote',
    },
    {
      title: 'Bautagebuch / Dokumentation',
      text: 'Baustellenberichte und Tagesdokumentation',
      href: '/bautagebuch',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <h1 className="text-6xl font-black text-slate-950">
            BauWerkzeug QR
          </h1>

          <p className="mt-4 text-2xl font-bold text-slate-700">
            Digitale Verwaltung für Bauunternehmen
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {modules.map((module) => (
            <a
              key={module.title}
              href={module.href}
              className="rounded-3xl bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-3xl font-black text-slate-950">
                {module.title}
              </h2>

              <p className="mt-5 text-lg font-bold text-slate-600">
                {module.text}
              </p>

              <div className="mt-8 rounded-2xl bg-slate-950 px-5 py-4 text-center text-lg font-black text-white">
                Öffnen
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}