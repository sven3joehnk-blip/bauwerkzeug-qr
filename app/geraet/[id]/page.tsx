'use client';

import { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Geraet = {
  id: number;
  inventar: string;
  bezeichnung: string;
  kategorie: string;
  lagerort: string;
  status: string;
  pruefung: string;
};

export default function GeraetePage() {
  const [search, setSearch] = useState('');

  const [geraete, setGeraete] = useState<Geraet[]>([
    {
      id: 1,
      inventar: 'G-1001',
      bezeichnung: 'Hilti TE70',
      kategorie: 'Bohrhammer',
      lagerort: 'Container Kiel',
      status: 'Verfügbar',
      pruefung: '2026-07-15',
    },
  ]);

  const [form, setForm] = useState({
    inventar: '',
    bezeichnung: '',
    kategorie: '',
    lagerort: '',
    pruefung: '',
  });

  function saveGeraet() {
    if (!form.bezeichnung) {
      alert('Bezeichnung fehlt');
      return;
    }

    const neu: Geraet = {
      id: Date.now(),
      inventar: form.inventar || `G-${1000 + geraete.length + 1}`,
      bezeichnung: form.bezeichnung,
      kategorie: form.kategorie || '-',
      lagerort: form.lagerort || '-',
      status: 'Verfügbar',
      pruefung: form.pruefung || '-',
    };

    setGeraete([neu, ...geraete]);

    setForm({
      inventar: '',
      bezeichnung: '',
      kategorie: '',
      lagerort: '',
      pruefung: '',
    });
  }

  function toggleStatus(id: number) {
    setGeraete(
      geraete.map((g) =>
        g.id === id
          ? {
              ...g,
              status:
                g.status === 'Verfügbar'
                  ? 'Ausgegeben'
                  : 'Verfügbar',
            }
          : g
      )
    );
  }

  function printQR(id: number) {
    const canvas = document.getElementById(
      `qr-${id}`
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const image = canvas.toDataURL('image/png');

    const win = window.open('', '_blank');

    if (!win) return;

    win.document.write(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:30px;">
          <img src="${image}" />
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

  const filtered = useMemo(() => {
    return geraete.filter((g) =>
      `${g.inventar} ${g.bezeichnung} ${g.kategorie} ${g.lagerort}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [geraete, search]);

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">

        <header className="rounded-3xl bg-emerald-600 p-6 text-white shadow-sm">
          <h1 className="text-4xl font-black">
            DigiDokuBau Geräteverwaltung
          </h1>

          <p className="mt-2 font-bold">
            Geräte, QR-Codes und Prüfungen verwalten
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-black">
              Gerät anlegen
            </h2>

            <div className="mt-5 space-y-3">

              <input
                placeholder="Inventarnummer"
                value={form.inventar}
                onChange={(e) =>
                  setForm({ ...form, inventar: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Bezeichnung"
                value={form.bezeichnung}
                onChange={(e) =>
                  setForm({ ...form, bezeichnung: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Kategorie"
                value={form.kategorie}
                onChange={(e) =>
                  setForm({ ...form, kategorie: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Lagerort"
                value={form.lagerort}
                onChange={(e) =>
                  setForm({ ...form, lagerort: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                type="date"
                value={form.pruefung}
                onChange={(e) =>
                  setForm({ ...form, pruefung: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <button
                onClick={saveGeraet}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-black text-white"
              >
                Gerät speichern
              </button>

            </div>

          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black">
                  Geräteübersicht
                </h2>

                <p className="text-sm font-bold text-slate-600">
                  Geräte suchen und QR-Codes drucken
                </p>
              </div>

              <input
                placeholder="Gerät suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-100">

                  <tr>
                    <th className="p-3 font-black">QR</th>
                    <th className="p-3 font-black">Inventar</th>
                    <th className="p-3 font-black">Gerät</th>
                    <th className="p-3 font-black">Lagerort</th>
                    <th className="p-3 font-black">Prüfung</th>
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>

                </thead>

                <tbody>

                  {filtered.map((g) => (

                    <tr
                      key={g.id}
                      className="border-t border-slate-200"
                    >

                      <td className="p-3">

                        <a href={`/geraet/${g.inventar}`}>

                          <QRCodeCanvas
                            id={`qr-${g.id}`}
                            value={`/geraet/${g.inventar}`}
                            size={70}
                          />

                        </a>

                      </td>

                      <td className="p-3 font-black">
                        {g.inventar}
                      </td>

                      <td className="p-3">

                        <div className="font-black">
                          {g.bezeichnung}
                        </div>

                        <div className="text-xs font-bold text-slate-500">
                          {g.kategorie}
                        </div>

                      </td>

                      <td className="p-3 font-bold">
                        {g.lagerort}
                      </td>

                      <td className="p-3 font-bold">
                        {g.pruefung}
                      </td>

                      <td className="p-3">

                        <span
                          className={`rounded-lg px-3 py-2 text-xs font-black ${
                            g.status === 'Verfügbar'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {g.status}
                        </span>

                      </td>

                      <td className="p-3">

                        <div className="flex flex-col gap-2">

                          <button
                            onClick={() => toggleStatus(g.id)}
                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white"
                          >
                            {g.status === 'Verfügbar'
                              ? 'Ausgeben'
                              : 'Rückgabe'}
                          </button>

                          <button
                            onClick={() => printQR(g.id)}
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                          >
                            QR drucken
                          </button>

                        </div>

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