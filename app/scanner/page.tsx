'use client';

import { useState } from 'react';

type Baustelle = {
  id: number;
  nummer: string;
  name: string;
  adresse: string;
  kunde: string;
  ansprechpartner: string;
  telefon: string;
  status: string;
};

export default function HomePage() {

  const [search, setSearch] = useState('');

  const [baustellen, setBaustellen] = useState<Baustelle[]>([
    {
      id: 1,
      nummer: 'BS-1001',
      name: 'Neubau Mehrfamilienhaus',
      adresse: 'Musterstraße 12, Kiel',
      kunde: 'Muster GmbH',
      ansprechpartner: 'Herr Meyer',
      telefon: '0431 / 123456',
      status: 'Aktiv',
    },
  ]);

  const [form, setForm] = useState({
    nummer: '',
    name: '',
    adresse: '',
    kunde: '',
    ansprechpartner: '',
    telefon: '',
    status: 'Aktiv',
  });

  function saveBaustelle() {

    if (!form.nummer || !form.name) {
      alert('Bitte Baustellen-Nr. und Name eintragen.');
      return;
    }

    const neueBaustelle: Baustelle = {
      id: Date.now(),
      ...form,
    };

    setBaustellen([neueBaustelle, ...baustellen]);

    setForm({
      nummer: '',
      name: '',
      adresse: '',
      kunde: '',
      ansprechpartner: '',
      telefon: '',
      status: 'Aktiv',
    });
  }

  const filtered = baustellen.filter((b) =>
    `${b.nummer} ${b.name} ${b.kunde}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">

      <div className="mx-auto max-w-7xl space-y-6">

        <header className="rounded-3xl bg-white p-6 shadow-sm">

          <h1 className="text-5xl font-black">
            BauWerkzeug QR
          </h1>

          <p className="mt-2 text-lg font-bold text-slate-700">
            Baustellen-, Geräte- und Mitarbeiterverwaltung
          </p>

        </header>
                <section className="grid gap-6 lg:grid-cols-[380px_1fr]">

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-2xl font-black">
              Baustelle anlegen
            </h2>

            <div className="mt-5 space-y-3">

              <input
                placeholder="Baustellen-Nr. z. B. BS-1002"
                value={form.nummer}
                onChange={(e) => setForm({ ...form, nummer: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Bauvorhaben / Baustelle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Adresse"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Kunde / Bauherr"
                value={form.kunde}
                onChange={(e) => setForm({ ...form, kunde: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Ansprechpartner"
                value={form.ansprechpartner}
                onChange={(e) => setForm({ ...form, ansprechpartner: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <input
                placeholder="Telefon"
                value={form.telefon}
                onChange={(e) => setForm({ ...form, telefon: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold"
              >
                <option>Aktiv</option>
                <option>In Vorbereitung</option>
                <option>Abgeschlossen</option>
                <option>Pausiert</option>
              </select>

              <button
                type="button"
                onClick={saveBaustelle}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 font-black text-white"
              >
                Baustelle speichern
              </button>

            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between gap-4">

              <div>
                <h2 className="text-2xl font-black">
                  Baustellenübersicht
                </h2>

                <p className="text-sm font-bold text-slate-600">
                  Baustellen suchen, öffnen und dokumentieren
                </p>
              </div>

              <input
                placeholder="Suche Baustelle, Kunde, Nummer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 rounded-xl border border-slate-300 px-4 py-3 font-bold placeholder:text-slate-500"
              />

            </div>
                        <div className="overflow-auto rounded-2xl border border-slate-200">

              <table className="w-full text-left text-sm">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 font-black">Nr.</th>
                    <th className="p-3 font-black">Baustelle</th>
                    <th className="p-3 font-black">Kunde</th>
                    <th className="p-3 font-black">Status</th>
                    <th className="p-3 font-black">Aktionen</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((b) => (

                    <tr
                      key={b.id}
                      className="border-t border-slate-200"
                    >

                      <td className="p-3 font-black">
                        {b.nummer}
                      </td>

                      <td className="p-3">

                        <div className="font-black">
                          {b.name}
                        </div>

                        <div className="text-xs font-bold text-slate-500">
                          {b.adresse}
                        </div>

                      </td>

                      <td className="p-3 font-bold">
                        <div>{b.kunde}</div>

                        <div className="text-xs text-slate-500">
                          {b.ansprechpartner}
                        </div>

                        <div className="text-xs text-slate-500">
                          {b.telefon}
                        </div>
                      </td>

                      <td className="p-3">

                        <span className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                          {b.status}
                        </span>

                      </td>

                      <td className="p-3">

                        <div className="flex flex-wrap gap-2">

                          <a
                            href="/bautagebuch"
                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-black text-white"
                          >
                            Bautagebuch
                          </a>

                          <a
                            href="/angebote"
                            className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-black text-white"
                          >
                            Angebote
                          </a>

                          <a
                            href="/geraet"
                            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white"
                          >
                            Geräte
                          </a>

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