'use client';

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Geraet = {
  id: number;
  inventar: string;
  bezeichnung: string;
  lagerort: string;
  status: string;
};

export default function GeraetePage() {
  const [geraete, setGeraete] = useState<Geraet[]>([
    {
      id: 1,
      inventar: 'G-1001',
      bezeichnung: 'Hilti TE70',
      lagerort: 'Container',
      status: 'Verfügbar',
    },
  ]);

  const [inventar, setInventar] = useState('');
  const [bezeichnung, setBezeichnung] = useState('');
  const [lagerort, setLagerort] = useState('');

  function saveGeraet() {
    if (!bezeichnung) {
      alert('Bezeichnung fehlt');
      return;
    }

    const neu: Geraet = {
      id: Date.now(),
      inventar: inventar || `G-${1000 + geraete.length + 1}`,
      bezeichnung,
      lagerort,
      status: 'Verfügbar',
    };

    setGeraete([neu, ...geraete]);

    setInventar('');
    setBezeichnung('');
    setLagerort('');
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

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">

      <header className="rounded-3xl bg-emerald-600 p-6 text-white shadow-sm">
          <h1 className="text-4xl font-black">
            Geräteverwaltung
          </h1>

          <p className="mt-2 font-bold">
            Geräte anlegen und QR-Codes verwalten
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
                value={inventar}
                onChange={(e) => setInventar(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Bezeichnung"
                value={bezeichnung}
                onChange={(e) => setBezeichnung(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Lagerort"
                value={lagerort}
                onChange={(e) => setLagerort(e.target.value)}
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

            <h2 className="mb-5 text-2xl font-black">
              Geräteübersicht
            </h2>

            <div className="overflow-auto rounded-2xl border border-slate-200">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-100">

                  <tr>
                    <th className="p-3 font-black">QR</th>
                    <th className="p-3 font-black">Inventar</th>
                    <th className="p-3 font-black">Gerät</th>
                    <th className="p-3 font-black">Lagerort</th>
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>

                </thead>

                <tbody>

                  {geraete.map((g) => (

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

                      <td className="p-3 font-black">
                        {g.bezeichnung}
                      </td>

                      <td className="p-3 font-bold">
                        {g.lagerort}
                      </td>

                      <td className="p-3 font-bold">
                        {g.status}
                      </td>

                      <td className="p-3">

                        <button
                          onClick={() => printQR(g.id)}
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                        >
                          QR drucken
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