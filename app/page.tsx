'use client';

export default function HomePage() {
  const modules = [
    {
      title: 'Mitarbeiterverwaltung',
      text: 'Personal, Arbeitszeiten, Erste Hilfe und Arbeitssicherheit',
      href: '/employees',
    },
    {
      title: 'Geräteverwaltung',
      text: 'Werkzeuge, Maschinen, QR-Codes, Ausgabe und Rückgabe',
      href: '/geraet',
    },
    {
      title: 'Angebot und Rechnungsverwaltung',
      text: 'Angebote, Rechnungen, Aufträge und Zahlungsstatus',
      href: '/angebote',
    },
    {
      title: 'Bautagebuch / Dokumentation',
      text: 'Baustellenberichte, Fotos, Notizen und Tagesleistung',
      href: '/bautagebuch',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-4xl space-y-6">

        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-4xl font-black">
            BauWerkzeug QR
          </h1>

          <p className="mt-2 text-lg font-bold text-slate-700">
            Digitale Verwaltung für Bauunternehmen
          </p>
        </header>

        <section className="space-y-4">
          {modules.map((module) => (
            <a
              key={module.title}
              href={module.href}
              className="block rounded-3xl bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black">
                    {module.title}
                  </h2>

                  <p className="mt-2 text-base font-bold text-slate-700">
                    {module.text}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
                  Öffnen
                </div>
              </div>
            </a>
          ))}
        </section>

      </div>
    </main>
  );
}