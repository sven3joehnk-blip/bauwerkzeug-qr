'use client';

import { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Status = 'Verfügbar' | 'Ausgegeben' | 'Defekt';

type Geraet = {
  inventar: string;
  bezeichnung: string;
  kategorie: string;
  hersteller: string;
  seriennummer: string;
  lagerort: string;
  status: Status;
  mitarbeiter: string;
  pruefung: string;
};

export default function GeraetePage() {
  const [search, setSearch] = useState('');
  const [geraete, setGeraete] = useState<Geraet[]>([
    {
      inventar: 'G-1001',
      bezeichnung: 'Hilti TE70 Bohrhammer',
      kategorie: 'Bohrhammer',
      hersteller: 'Hilti',
      seriennummer: 'TE70-001',
      lagerort: 'Lager Kiel',
      status: 'Verfügbar',
      mitarbeiter: '-',
      pruefung: '2026-08-12',
    },
  ]);

  const [form, setForm] = useState<Geraet>({
    inventar: '',
    bezeichnung: '',
    kategorie: '',
    hersteller: '',
    seriennummer: '',
    lagerort: '',
    status: 'Verfügbar',
    mitarbeiter: '-',
    pruefung: '',
  });

  const filtered = useMemo(() => {
    const value = search.toLowerCase();
    return geraete.filter((g) =>
      `${g.inventar} ${g.bezeichnung} ${g.kategorie} ${g.hersteller}`
        .toLowerCase()
        .includes(value)
    );
  }, [geraete, search]);

  function saveGeraet() {
    if (!form.bezeichnung.trim()) return;

    const inventar = form.inventar || `G-${1000 + geraete.length + 1}`;

    setGeraete([
      {
        ...form,
        inventar,
        status: 'Verfügbar',
        mitarbeiter: '-',
      },
      ...geraete,
    ]);

    setForm({
      inventar: '',
      bezeichnung: '',
      kategorie: '',
      hersteller: '',
      seriennummer: '',
      lagerort: '',
      status: 'Verfügbar',
      mitarbeiter: '-',
      pruefung: '',
    });
  }

  function ausgeben(inventar: string) {
    const name = prompt('An welchen Mitarbeiter ausgeben?');
    if (!name) return;

    setGeraete(
      geraete.map((g) =>
        g.inventar === inventar
          ? { ...g, status: 'Ausgegeben', mitarbeiter: name }
          : g
      )
    );
  }

  function rueckgabe(inventar: string) {
    setGeraete(
      geraete.map((g) =>
        g.inventar === inventar
          ? { ...g, status: 'Verfügbar', mitarbeiter: '-' }
          : g
      )
    );
  }

  function printQr(g: Geraet) {
    const qrCanvas = document.getElementById(`qr-${g.inventar}`) as HTMLCanvasElement | null;
    if (!qrCanvas) return;

    const image = qrCanvas.toDataURL('image/png');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR-Code ${g.inventar}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              text-align: center;
            }
            .label {
              width: 260px;
              border: 2px solid #000;
              padding: 18px;
              margin: auto;
            }
            h1 {
              font-size: 22px;
              margin: 0 0 8px 0;
            }
            p {
              font-size: 16px;
              font-weight: bold;
              margin: 6px 0;
            }
            img {
              margin-top: 12px;
              width: 180px;
              height: 180px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <h1>BauWerkzeug QR</h1>
            <p>${g.inventar}</p>
            <p>${g.bezeichnung}</p>
            <img src="${image}" />
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  function statusClass(status: Status) {
    if (status === 'Verfügbar') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Ausgegeben') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-4xl font-black">Geräteverwaltung</h1>
            <p className="mt-1 text-base font-bold text-slate-700">
              Geräte, QR-Codes, Ausgabe, Rückgabe und Druck
            </p>
          </div>

          <a href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">
            Startseite
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Gerät anlegen</h2>

            <div className="mt-5 space-y-3">
              {[
                ['Inventarnummer', 'inventar'],
                ['Gerätebezeichnung / Maschine', 'bezeichnung'],
                ['Kategorie', 'kategorie'],
                ['Hersteller', 'hersteller'],
                ['Seriennummer', 'seriennummer'],
                ['Lagerort', 'lagerort'],
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
                value={form.pruefung}
                onChange={(e) => setForm({ ...form, pruefung: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <button
                type="button"
                onClick={saveGeraet}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                Gerät speichern
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Geräteübersicht</h2>

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
                    <th className="p-3 font-black">QR</th>
                    <th className="p-3 font-black">Inventar</th>
                    <th className="p-3 font-black">Bezeichnung</th>
                    <th className="p-3 font-black">Lagerort</th>
<th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Mitarbeiter</th>
                    <th className="p-3 font-black">Prüfung</th>
                    <th className="p-3 font-black">Aktionen</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((g) => {
                    const qrUrl =
                      typeof window !== 'undefined'
                        ? `${window.location.origin}/geraet/${g.inventar}`
                        : g.inventar;

                    return (
                      <tr key={g.inventar} className="border-t border-slate-200">
                        <td className="p-3">
                          <QRCodeCanvas id={`qr-${g.inventar}`} value={qrUrl} size={72} />
                        </td>
                        <td className="p-3 font-black">{g.inventar}</td>
                        <td className="p-3 font-black">{g.bezeichnung}</td>
                        <td className="p-3">
                       <td className="p-3 font-bold">{g.lagerort || '-'}</td>

<td className="p-3">
  <span className={`rounded-lg px-3 py-2 text-xs font-black ${statusClass(g.status)}`}>
    {g.status}
  </span>
</td>
                        <td className="p-3 font-bold">{g.mitarbeiter}</td>
                        <td className="p-3 font-bold">{g.pruefung || '-'}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => ausgeben(g.inventar)}
                              className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-white"
                            >
                              Ausgabe
                            </button>

                            <button
                              type="button"
                              onClick={() => rueckgabe(g.inventar)}
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                            >
                              Rückgabe
                            </button>

                            <button
                              type="button"
                              onClick={() => printQr(g)}
                              className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                            >
                              QR drucken
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}