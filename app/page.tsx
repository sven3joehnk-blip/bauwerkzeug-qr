'use client';

export default function HomePage() {
  const cards = [
    {
      title: 'Mitarbeiterverwaltung',
      text: 'Personal, Führerscheine, Archivierung und Arbeitszeiten',
      href: '/employees',
    },
    {
      title: 'Geräteverwaltung',
      text: 'Werkzeuge, Maschinen, QR-Codes und Ausgaben',
      href: '/',
    },
    {
      title: 'Angebot und Rechnungsverwaltung',
      text: 'Angebote, Aufträge, Rechnungen und Zahlungsstatus',
      href: '/angebote',
    },
    {
      title: 'Bautagebuch / Dokumentation',
      text: 'Baustellenberichte, Fotos, Notizen und Tagesleistung',
      href: '/bautagebuch',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight">
            BauWerkzeug QR
          </h1>
          <p className="mt-3 text-xl font-bold text-slate-700">
            Firmenverwaltung für Geräte, Mitarbeiter, Angebote und Baustellendokumentation
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-2xl font-black text-slate-950">
                {card.title}
              </h2>
              <p className="mt-4 text-lg font-bold text-slate-700">
                {card.text}
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