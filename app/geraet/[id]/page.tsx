'use client';

import { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

type Status = 'Verfügbar' | 'Ausgegeben' | 'Defekt';

type Geraet = {
  id: number;
  inventar: string;
  bezeichnung: string;
  kategorie: string;
  hersteller: string;
  seriennummer: string;
  lagerort: string;
  status: Status;
  mitarbeiter: string;
};

export default function GeraetePage() {
  const [search, setSearch] = useState('');
  const [geraete, setGeraete] = useState<Geraet[]>([]);
  const [form, setForm] = useState({
    inventar: '',
    bezeichnung: '',
    kategorie: '',
    hersteller: '',
    seriennummer: '',
    lagerort: '',
  });

  function saveGeraet() {
    if (!form.bezeichnung) {
      alert('Bitte Gerätebezeichnung eintragen.');
      return;
    }

    const neuesGeraet: Geraet = {
      id: Date.now(),
      inventar: form.inventar || `G-${1000 + geraete.length + 1}`,
      bezeichnung: form.bezeichnung,
      kategorie: form.kategorie || '-',
      hersteller: form.hersteller || '-',
      seriennummer: form.seriennummer || '-',
      lagerort: form.lagerort || '-',
      status: 'Verfügbar',
      mitarbeiter: '-',
    };

    setGeraete([neuesGeraet, ...geraete]);

    setForm({
      inventar: '',
      bezeichnung: '',
      kategorie: '',
      hersteller: '',
      seriennummer: '',
      lagerort: '',
    });
  }

  function ausgeben(id: number) {
    const name = prompt('An welchen Mitarbeiter ausgeben?');
    if (!name) return;

    setGeraete(
      geraete.map((g) =>
        g.id === id ? { ...g, status: 'Ausgegeben', mitarbeiter: name } : g
      )
    );
  }

  function rueckgabe(id: number) {
    setGeraete(
      geraete.map((g) =>
        g.id === id ? { ...g, status: 'Verfügbar', mitarbeiter: '-' } : g
      )
    );
  }

  function defekt(id: number) {
    setGeraete(
      geraete.map((g) =>
        g.id === id ? { ...g, status: 'Defekt' } : g
      )
    );
  }

  function printQr(g: Geraet) {
    const canvas = document.getElementById(`qr-${g.id}`) as HTMLCanvasElement | null;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <body style="font-family:Arial;text-align:center;padding:30px;">
          <h2>BauWerkzeug QR</h2>
          <h3>${g.inventar}</h3>
          <p>${g.bezeichnung}</p>
          <img src="${image}" style="width:180px;height:180px;" />
          <script>window.onload = function(){ window.print(); }</script>
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
          <h1 className="text-4xl font-black">Geräteverwaltung</h1>
          <p className="mt-1 font-bold">Geräte anlegen, QR-Code drucken, Ausgabe und Rückgabe</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Gerät anlegen</h2>

            <div className="mt-5 space-y-3">
              {[
                ['Inventarnummer', 'inventar'],
                ['Gerätebezeichnung', 'bezeichnung'],
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

              <button
                type="button"
                onClick={saveGeraet}
                className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-black text-white"
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
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Mitarbeiter</th>
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
                      <tr key={g.id} className="border-t border-slate-200">
                        <td className="p-3">
                          <a href={`/geraet/${g.inventar}`}>
                            <QRCodeCanvas id={`qr-${g.id}`} value={qrUrl} size={70} />
                          </a>
                        </td>
                        <td className="p-3 font-black">{g.inventar}</td>
                        <td className="p-3 font-black">{g.bezeichnung}</td>
                        <td className="p-3 font-bold">{g.lagerort}</td>
                        <td className="p-3 font-bold">{g.status}</td>
                        <td className="p-3 font-bold">{g.mitarbeiter}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => ausgeben(g.id)} className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-white">Ausgabe</button>
                            <button onClick={() => rueckgabe(g.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white">Rückgabe</button>
                            <button onClick={() => defekt(g.id)} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white">Defekt</button>
                            <button onClick={() => printQr(g)} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">QR drucken</button>
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