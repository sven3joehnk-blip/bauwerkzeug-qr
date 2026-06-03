'use client';

import { useState } from 'react';

export default function GeraetePage() {
  const [search, setSearch] = useState('');

  const geraete = [
    {
      inventar: 'G-1001',
      name: 'Hilti TE70',
      kategorie: 'Bohrhammer',
      hersteller: 'Hilti',
      status: 'Verfügbar',
      lagerort: 'Lager Kiel',
      pruefung: '12.08.2026',
      mitarbeiter: '-',
    },
    {
      inventar: 'G-1002',
      name: 'Makita Flex',
      kategorie: 'Flex',
      hersteller: 'Makita',
      status: 'Ausgegeben',
      lagerort: 'Baustelle',
      pruefung: '03.09.2026',
      mitarbeiter: 'Sven Jöhnk',
    },
  ];

  const filtered = geraete.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.inventar.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-extrabold text-slate-950">
              Geräteverwaltung
            </h1>

            <p className="mt-3 text-xl font-extrabold text-slate-700">
              Werkzeuge, Maschinen, QR-Codes und Ausgaben verwalten
            </p>

          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white"
          >
            Startseite
          </a>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-3xl font-extrabold text-slate-950">
              Gerät anlegen
            </h2>

            <div className="mt-8 space-y-4">

              <input
                placeholder="Inventarnummer"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                placeholder="Gerätebezeichnung"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                placeholder="Kategorie"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                placeholder="Hersteller"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                placeholder="Seriennummer"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                placeholder="Lagerort"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <input
                type="date"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

              <button
                className="w-full rounded-2xl bg-slate-950 py-5 text-xl font-black text-white"
              >
                Gerät speichern
              </button>

            </div>

          </div>

          <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

            <div className="mb-8 flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-extrabold text-slate-950">
                  Geräteübersicht
                </h2>

                <p className="mt-2 text-lg font-extrabold text-slate-600">
                  Alle Maschinen und Werkzeuge
                </p>

              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Gerät suchen..."
                className="rounded-2xl border border-slate-300 px-5 py-4 text-lg font-extrabold"
              />

            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-5 text-left text-lg font-black">
                      Inventar
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Gerät
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Kategorie
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Status
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Mitarbeiter
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Prüfung
                    </th>

                    <th className="p-5 text-left text-lg font-black">
                      Aktionen
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map((geraet) => (

                    <tr
                      key={geraet.inventar}
                      className="border-t border-slate-200"
                    >

                      <td className="p-5 text-lg font-extrabold">
                        {geraet.inventar}
                      </td>

                      <td className="p-5 text-lg font-extrabold">
                        {geraet.name}
                      </td>

                      <td className="p-5 text-lg font-extrabold">
                        {geraet.kategorie}
                      </td>

                      <td className="p-5">

                        <span
                          className={`rounded-xl px-4 py-2 text-sm font-black ${
                            geraet.status === 'Verfügbar'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {geraet.status}
                        </span>

                      </td>

                      <td className="p-5 text-lg font-extrabold">
                        {geraet.mitarbeiter}
                      </td>

                      <td className="p-5 text-lg font-extrabold">
                        {geraet.pruefung}
                      </td>

                      <td className="p-5">

                        <div className="flex gap-2">

                          <button className="rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white">
                            Bearbeiten
                          </button>

                          <button className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white">
                            Ausgabe
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}