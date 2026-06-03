'use client';

import { useMemo, useState } from 'react';

type Bild = {
  name: string;
  url: string;
};

type Eintrag = {
  id: number;
  datum: string;
  baustellennummer: string;
  baustelle: string;
  wetter: string;
  personal: string;
  taetigkeiten: string;
  besonderheiten: string;
  bilder: Bild[];
};

export default function BautagebuchPage() {
  const [search, setSearch] = useState('');
  const [eintraege, setEintraege] = useState<Eintrag[]>([]);
  const [bilder, setBilder] = useState<Bild[]>([]);

  const [form, setForm] = useState({
    datum: '',
    baustellennummer: '',
    baustelle: '',
    wetter: '',
    personal: '',
    taetigkeiten: '',
    besonderheiten: '',
  });

  const filtered = useMemo(() => {
    return eintraege.filter((e) =>
      `${e.datum} ${e.baustellennummer} ${e.baustelle}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [eintraege, search]);

  function handleImages(files: FileList | null) {
    if (!files) return;

    const nextImages: Bild[] = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setBilder([...bilder, ...nextImages]);
  }

  function removeImage(name: string) {
    setBilder(bilder.filter((bild) => bild.name !== name));
  }

  function saveEntry() {
    if (!form.datum || !form.baustellennummer) {
      alert('Bitte Datum und Baustellen-Nr. eintragen.');
      return;
    }

    const entry: Eintrag = {
      id: Date.now(),
      ...form,
      bilder,
    };

    setEintraege([entry, ...eintraege]);

    setForm({
      datum: '',
      baustellennummer: '',
      baustelle: '',
      wetter: '',
      personal: '',
      taetigkeiten: '',
      besonderheiten: '',
    });

    setBilder([]);
  }

  function printEntry(entry: Eintrag) {
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Bautagebuch ${entry.baustellennummer}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #111;
            }
            h1 {
              font-size: 30px;
              margin-bottom: 20px;
            }
            .kopf {
              border-bottom: 3px solid #111;
              padding-bottom: 14px;
              margin-bottom: 25px;
            }
            .box {
              border: 1px solid #333;
              padding: 12px;
              margin-top: 12px;
            }
            .label {
              font-weight: bold;
              margin-bottom: 6px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            img {
              width: 220px;
              height: auto;
              margin: 10px;
              border: 1px solid #333;
            }
          </style>
        </head>
        <body>
          <div class="kopf">
            <h1>Bautagebuch / Tagesdokumentation</h1>
            <p><b>Datum:</b> ${entry.datum}</p>
            <p><b>Baustellen-Nr.:</b> ${entry.baustellennummer}</p>
            <p><b>Baustelle:</b> ${entry.baustelle}</p>
          </div>

          <div class="grid">
            <div class="box">
              <div class="label">Wetter</div>
              ${entry.wetter || '-'}
            </div>

            <div class="box">
              <div class="label">Personal / Firmen</div>
              ${entry.personal || '-'}
            </div>
          </div>

          <div class="box">
            <div class="label">Ausgeführte Tätigkeiten</div>
            ${entry.taetigkeiten || '-'}
          </div>

          <div class="box">
            <div class="label">Besonderheiten / Mängel / Hinweise</div>
            ${entry.besonderheiten || '-'}
          </div>

          <div class="box">
            <div class="label">Bilder / Fotodokumentation</div>
            ${
              entry.bilder.length > 0
                ? entry.bilder
                    .map(
                      (bild) => `
                        <div>
                          <p><b>${bild.name}</b></p>
                          <img src="${bild.url}" />
                        </div>
                      `
                    )
                    .join('')
                : 'Keine Bilder vorhanden.'
            }
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
              Bautagebuch / Dokumentation
            </h1>

            <p className="mt-1 font-bold text-slate-700">
              Tagesberichte, Baustellen-Nr., Tätigkeiten und Fotodokumentation
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
          >
            Startseite
          </a>
        </header>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              Tagesbericht erfassen
            </h2>

            <div className="mt-5 space-y-3">
              <input
                type="date"
                value={form.datum}
                onChange={(e) => setForm({ ...form, datum: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              />

              <input
                placeholder="Baustellen-Nr."
                value={form.baustellennummer}
                onChange={(e) =>
                  setForm({ ...form, baustellennummer: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Baustelle / Bauvorhaben"
                value={form.baustelle}
                onChange={(e) =>
                  setForm({ ...form, baustelle: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Wetter"
                value={form.wetter}
                onChange={(e) => setForm({ ...form, wetter: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <textarea
                placeholder="Personal / Firmen"
                value={form.personal}
                onChange={(e) =>
                  setForm({ ...form, personal: e.target.value })
                }
                className="h-24 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <textarea
                placeholder="Ausgeführte Tätigkeiten"
                value={form.taetigkeiten}
                onChange={(e) =>
                  setForm({ ...form, taetigkeiten: e.target.value })
                }
                className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <textarea
                placeholder="Besonderheiten / Mängel / Hinweise"
                value={form.besonderheiten}
                onChange={(e) =>
                  setForm({ ...form, besonderheiten: e.target.value })
                }
                className="h-28 w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                <p className="mb-3 font-black">
                  Bilder zur Dokumentation
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImages(e.target.files)}
                  className="w-full rounded-xl bg-white p-3 font-bold"
                />

                {bilder.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {bilder.map((bild) => (
                      <div
                        key={bild.name}
                        className="rounded-xl bg-white p-2 shadow-sm"
                      >
                        <img
                          src={bild.url}
                          alt={bild.name}
                          className="h-28 w-full rounded-lg object-cover"
                        />

                        <p className="mt-1 truncate text-xs font-bold">
                          {bild.name}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeImage(bild.name)}
                          className="mt-2 w-full rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white"
                        >
                          Entfernen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={saveEntry}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                Tagesbericht speichern
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                Dokumentation
              </h2>

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
                    <th className="p-3 font-black">Datum</th>
                    <th className="p-3 font-black">Baustellen-Nr.</th>
                    <th className="p-3 font-black">Baustelle</th>
                    <th className="p-3 font-black">Bilder</th>
                    <th className="p-3 font-black">Aktion</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="border-t border-slate-200">
                      <td className="p-3 font-bold">
                        {entry.datum}
                      </td>

                      <td className="p-3 font-black">
                        {entry.baustellennummer}
                      </td>

                      <td className="p-3 font-bold">
                        {entry.baustelle}
                      </td>

                      <td className="p-3 font-bold">
                        {entry.bilder.length}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => printEntry(entry)}
                          className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white"
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