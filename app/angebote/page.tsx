'use client';

import { useMemo, useState } from 'react';

type Position = {
  text: string;
  menge: number;
  einheit: string;
  preis: number;
};

type Angebot = {
  nummer: string;
  kunde: string;
  bauvorhaben: string;
  datum: string;
  status: string;
  positionen: Position[];
};

export default function AngebotePage() {
  const [search, setSearch] = useState('');
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [form, setForm] = useState({
    nummer: '',
    kunde: '',
    bauvorhaben: '',
    datum: '',
    status: 'Entwurf',
    posText: '',
    menge: '1',
    einheit: 'Stk',
    preis: '0',
  });

  const filtered = angebote.filter((a) =>
    `${a.nummer} ${a.kunde} ${a.bauvorhaben}`.toLowerCase().includes(search.toLowerCase())
  );

  function saveAngebot() {
    if (!form.kunde || !form.bauvorhaben) return;

    const nummer = form.nummer || `ANG-${String(angebote.length + 1).padStart(4, '0')}`;

    const angebot: Angebot = {
      nummer,
      kunde: form.kunde,
      bauvorhaben: form.bauvorhaben,
      datum: form.datum || new Date().toISOString().slice(0, 10),
      status: form.status,
      positionen: [
        {
          text: form.posText || 'Leistungsposition',
          menge: Number(form.menge),
          einheit: form.einheit,
          preis: Number(form.preis),
        },
      ],
    };

    setAngebote([angebot, ...angebote]);

    setForm({
      nummer: '',
      kunde: '',
      bauvorhaben: '',
      datum: '',
      status: 'Entwurf',
      posText: '',
      menge: '1',
      einheit: 'Stk',
      preis: '0',
    });
  }

  function summe(a: Angebot) {
    return a.positionen.reduce((s, p) => s + p.menge * p.preis, 0);
  }

  function printAngebot(a: Angebot) {
    const netto = summe(a);
    const mwst = netto * 0.19;
    const brutto = netto + mwst;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>${a.nummer}</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1 { font-size: 28px; }
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th, td { border: 1px solid #333; padding: 10px; text-align: left; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Angebot ${a.nummer}</h1>
          <p><b>Kunde:</b> ${a.kunde}</p>
          <p><b>Bauvorhaben:</b> ${a.bauvorhaben}</p>
          <p><b>Datum:</b> ${a.datum}</p>

          <table>
            <thead>
              <tr>
                <th>Leistung</th><th>Menge</th><th>Einheit</th><th>EP</th><th>GP</th>
              </tr>
            </thead>
            <tbody>
              ${a.positionen.map(p => `
                <tr>
                  <td>${p.text}</td>
                  <td>${p.menge}</td>
                  <td>${p.einheit}</td>
                  <td class="right">${p.preis.toFixed(2)} €</td>
                  <td class="right">${(p.menge * p.preis).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p class="right"><b>Netto:</b> ${netto.toFixed(2)} €</p>
          <p class="right"><b>MwSt. 19 %:</b> ${mwst.toFixed(2)} €</p>
          <p class="right"><b>Brutto:</b> ${brutto.toFixed(2)} €</p>

          <script>window.print();</script>
        </body>
      </html>
    `);

    win.document.close();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-black">Angebote und Rechnungen</h1>
            <p className="mt-1 font-bold text-slate-700">Angebote erfassen, berechnen und drucken</p>
          </div>
          <a href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Startseite</a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Angebot anlegen</h2>

            <div className="mt-5 space-y-3">
              {[
                ['Angebotsnummer', 'nummer'],
                ['Kunde', 'kunde'],
                ['Bauvorhaben', 'bauvorhaben'],
                ['Leistung / Position', 'posText'],
                ['Menge', 'menge'],
                ['Einheit', 'einheit'],
                ['Einzelpreis netto', 'preis'],
              ].map(([label, key]) => (
                <input
                  key={key}
                  placeholder={label}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
                />
              ))}

              <input
                type="date"
                value={form.datum}
                onChange={(e) => setForm({ ...form, datum: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <button onClick={saveAngebot} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
                Angebot speichern
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Übersicht</h2>
              <input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-black">Nr.</th>
                    <th className="p-3 font-black">Kunde</th>
                    <th className="p-3 font-black">Bauvorhaben</th>
                    <th className="p-3 text-right font-black">Netto</th>
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.nummer} className="border-t border-slate-200">
                      <td className="p-3 font-black">{a.nummer}</td>
                      <td className="p-3 font-bold">{a.kunde}</td>
                      <td className="p-3 font-bold">{a.bauvorhaben}</td>
                      <td className="p-3 text-right font-black">{summe(a).toFixed(2)} €</td>
                      <td className="p-3 font-bold">{a.status}</td>
                      <td className="p-3">
                        <button onClick={() => printAngebot(a)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">
                          Drucken
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}