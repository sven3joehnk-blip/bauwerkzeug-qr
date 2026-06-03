'use client';

import { useMemo, useState } from 'react';

type Position = {
  text: string;
  menge: number;
  einheit: string;
  epNetto: number;
};

type Dokument = {
  nummer: string;
  typ: 'Angebot' | 'Rechnung';
  kunde: string;
  bauvorhaben: string;
  datum: string;
  positionen: Position[];
};

export default function AngebotePage() {
  const [search, setSearch] = useState('');

  const [dokumente, setDokumente] = useState<Dokument[]>([]);

  const [form, setForm] = useState({
    typ: 'Angebot',
    nummer: '',
    kunde: '',
    bauvorhaben: '',
    datum: '',
    text: '',
    menge: '1',
    einheit: 'Stk',
    epNetto: '0',
  });

  const filtered = useMemo(() => {
    return dokumente.filter((d) =>
      `${d.nummer} ${d.kunde} ${d.bauvorhaben}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [dokumente, search]);

  function netto(d: Dokument) {
    return d.positionen.reduce(
      (sum, p) => sum + p.menge * p.epNetto,
      0
    );
  }

  function mwst(d: Dokument) {
    return netto(d) * 0.19;
  }

  function brutto(d: Dokument) {
    return netto(d) + mwst(d);
  }

  function saveDokument() {
    if (!form.kunde || !form.text) {
      alert('Bitte Kunde und Position eintragen.');
      return;
    }

    const nummer =
      form.nummer ||
      `${form.typ === 'Angebot' ? 'ANG' : 'RE'}-${String(
        dokumente.length + 1
      ).padStart(4, '0')}`;

    const dokument: Dokument = {
      nummer,
      typ: form.typ as 'Angebot' | 'Rechnung',
      kunde: form.kunde,
      bauvorhaben: form.bauvorhaben,
      datum: form.datum || new Date().toISOString().slice(0, 10),

      positionen: [
        {
          text: form.text,
          menge: Number(form.menge),
          einheit: form.einheit,
          epNetto: Number(form.epNetto),
        },
      ],
    };

    setDokumente([dokument, ...dokumente]);

    setForm({
      typ: 'Angebot',
      nummer: '',
      kunde: '',
      bauvorhaben: '',
      datum: '',
      text: '',
      menge: '1',
      einheit: 'Stk',
      epNetto: '0',
    });
  }

  function printDokument(d: Dokument) {
    const win = window.open('', '_blank');

    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>${d.typ} ${d.nummer}</title>

          <style>
            body {
              font-family: Arial;
              padding: 40px;
              color: #111;
            }

            h1 {
              font-size: 34px;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 30px;
            }

            th, td {
              border: 1px solid #444;
              padding: 10px;
              text-align: left;
            }

            .right {
              text-align: right;
            }

            .summe {
              margin-top: 30px;
              width: 320px;
              margin-left: auto;
            }

            .summe p {
              display: flex;
              justify-content: space-between;
              font-size: 18px;
              margin: 8px 0;
            }

            .gross {
              font-size: 24px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>

          <h1>${d.typ} ${d.nummer}</h1>

          <p><b>Kunde:</b> ${d.kunde}</p>
          <p><b>Bauvorhaben:</b> ${d.bauvorhaben}</p>
          <p><b>Datum:</b> ${d.datum}</p>

          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Leistung</th>
                <th>Menge</th>
                <th>Einheit</th>
                <th>EP Netto</th>
                <th>GP Netto</th>
              </tr>
            </thead>

            <tbody>

              ${d.positionen
                .map(
                  (p, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${p.text}</td>
                      <td>${p.menge}</td>
                      <td>${p.einheit}</td>
                      <td class="right">${p.epNetto.toFixed(2)} €</td>
                      <td class="right">${(
                        p.menge * p.epNetto
                      ).toFixed(2)} €</td>
                    </tr>
                  `
                )
                .join('')}

            </tbody>
          </table>

          <div class="summe">
            <p>
              <span>Netto:</span>
              <span>${netto(d).toFixed(2)} €</span>
            </p>

            <p>
              <span>MwSt. 19%:</span>
              <span>${mwst(d).toFixed(2)} €</span>
            </p>

            <p class="gross">
              <span>Brutto:</span>
              <span>${brutto(d).toFixed(2)} €</span>
            </p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>

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
            <h1 className="text-4xl font-black">
              Angebote & Rechnungen
            </h1>

            <p className="mt-1 text-base font-bold text-slate-700">
              Angebote, Rechnungen und Netto-/Bruttoberechnung
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            Startseite
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-black">
              Dokument erstellen
            </h2>

            <div className="mt-5 space-y-3">

              <select
                value={form.typ}
                onChange={(e) =>
                  setForm({ ...form, typ: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              >
                <option>Angebot</option>
                <option>Rechnung</option>
              </select>

              <input
                placeholder="Nummer"
                value={form.nummer}
                onChange={(e) =>
                  setForm({ ...form, nummer: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Kunde"
                value={form.kunde}
                onChange={(e) =>
                  setForm({ ...form, kunde: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Bauvorhaben"
                value={form.bauvorhaben}
                onChange={(e) =>
                  setForm({ ...form, bauvorhaben: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                type="date"
                value={form.datum}
                onChange={(e) =>
                  setForm({ ...form, datum: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <textarea
                placeholder="Leistung / Positionstext"
                value={form.text}
                onChange={(e) =>
                  setForm({ ...form, text: e.target.value })
                }
                className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <div className="grid grid-cols-3 gap-2">

                <input
                  placeholder="Menge"
                  value={form.menge}
                  onChange={(e) =>
                    setForm({ ...form, menge: e.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 font-bold"
                />

                <input
                  placeholder="Einheit"
                  value={form.einheit}
                  onChange={(e) =>
                    setForm({ ...form, einheit: e.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 font-bold"
                />

                <input
                  placeholder="EP Netto"
                  value={form.epNetto}
                  onChange={(e) =>
                    setForm({ ...form, epNetto: e.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-4 py-3 font-bold"
                />

              </div>

              <button
                onClick={saveDokument}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                Speichern
              </button>

            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-2xl font-black">
                Übersicht
              </h2>

              <input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-black">Typ</th>
                    <th className="p-3 font-black">Nr.</th>
                    <th className="p-3 font-black">Kunde</th>
                    <th className="p-3 font-black">Bauvorhaben</th>
                    <th className="p-3 text-right font-black">Netto</th>
                    <th className="p-3 text-right font-black">Brutto</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((d) => (
                    <tr
                      key={d.nummer}
                      className="border-t border-slate-200"
                    >

                      <td className="p-3 font-black">
                        {d.typ}
                      </td>

                      <td className="p-3 font-black">
                        {d.nummer}
                      </td>

                      <td className="p-3 font-bold">
                        {d.kunde}
                      </td>

                      <td className="p-3 font-bold">
                        {d.bauvorhaben}
                      </td>

                      <td className="p-3 text-right font-black text-blue-700">
                        {netto(d).toFixed(2)} €
                      </td>

                      <td className="p-3 text-right font-black text-emerald-700">
                        {brutto(d).toFixed(2)} €
                      </td>

                      <td className="p-3">

                        <button
                          onClick={() => printDokument(d)}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                        >
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