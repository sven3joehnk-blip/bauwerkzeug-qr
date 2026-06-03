'use client';

import { useState } from 'react';

type Eintrag = {
  datum: string;
  baustellennummer: string;
  baustelle: string;
  wetter: string;
  personal: string;
  taetigkeiten: string;
  besonderheiten: string;
};

export default function BautagebuchPage() {
  const [search, setSearch] = useState('');
  const [eintraege, setEintraege] = useState<Eintrag[]>([]);
  const [form, setForm] = useState<Eintrag>({
    datum: '',
    baustellennummer: '',
    baustelle: '',
    wetter: '',
    personal: '',
    taetigkeiten: '',
    besonderheiten: '',
  });

  const filtered = eintraege.filter((e) =>
    `${e.datum} ${e.baustellennummer} ${e.baustelle}`.toLowerCase().includes(search.toLowerCase())
  );

  function saveEntry() {
    if (!form.datum || !form.baustellennummer) return;

    setEintraege([form, ...eintraege]);

    setForm({
      datum: '',
      baustellennummer: '',
      baustelle: '',
      wetter: '',
      personal: '',
      taetigkeiten: '',
      besonderheiten: '',
    });
  }

  function printEntry(e: Eintrag) {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Bautagebuch ${e.baustellennummer}</title>
          <style>
            body { font-family: Arial; padding: 40px; }
            h1 { font-size: 28px; }
            .box { border: 1px solid #333; padding: 14px; margin-top: 14px; }
          </style>
        </head>
        <body>
          <h1>Bautagebuch / Tagesdokumentation</h1>
          <p><b>Datum:</b> ${e.datum}</p>
          <p><b>Baustellen-Nr.:</b> ${e.baustellennummer}</p>
          <p><b>Baustelle:</b> ${e.baustelle}</p>
          <div class="box"><b>Wetter:</b><br>${e.wetter}</div>
          <div class="box"><b>Personal / Firmen:</b><br>${e.personal}</div>
          <div class="box"><b>Tätigkeiten:</b><br>${e.taetigkeiten}</div>
          <div class="box"><b>Besonderheiten / Mängel / Hinweise:</b><br>${e.besonderheiten}</div>
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
            <h1 className="text-4xl font-black">Bautagebuch / Dokumentation</h1>
            <p className="mt-1 font-bold text-slate-700">Baustellenberichte, Tagesleistung und Hinweise erfassen</p>
          </div>
          <a href="/" className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white">Startseite</a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">Tagesbericht erfassen</h2>

            <div className="mt-5 space-y-3">
              <input type="date" value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold" />
              <input placeholder="Baustellen-Nr." value={form.baustellennummer} onChange={(e) => setForm({ ...form, baustellennummer: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
              <input placeholder="Baustelle / Bauvorhaben" value={form.baustelle} onChange={(e) => setForm({ ...form, baustelle: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
              <input placeholder="Wetter" value={form.wetter} onChange={(e) => setForm({ ...form, wetter: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />

              <textarea placeholder="Personal / Firmen" value={form.personal} onChange={(e) => setForm({ ...form, personal: e.target.value })} className="h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
              <textarea placeholder="Ausgeführte Tätigkeiten" value={form.taetigkeiten} onChange={(e) => setForm({ ...form, taetigkeiten: e.target.value })} className="h-32 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
              <textarea placeholder="Besonderheiten / Mängel / Behinderung / Hinweise" value={form.besonderheiten} onChange={(e) => setForm({ ...form, besonderheiten: e.target.value })} className="h-32 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />

              <button onClick={saveEntry} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white">
                Tagesbericht speichern
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">Dokumentation</h2>
              <input placeholder="Suchen..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-72 rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500" />
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-black">Datum</th>
                    <th className="p-3 font-black">Baustellen-Nr.</th>
                    <th className="p-3 font-black">Baustelle</th>
                    <th className="p-3 font-black">Wetter</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, index) => (
                    <tr key={`${e.datum}-${index}`} className="border-t border-slate-200">
                      <td className="p-3 font-bold">{e.datum}</td>
                      <td className="p-3 font-black">{e.baustellennummer}</td>
                      <td className="p-3 font-bold">{e.baustelle}</td>
                      <td className="p-3 font-bold">{e.wetter}</td>
                      <td className="p-3">
                        <button onClick={() => printEntry(e)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white">
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