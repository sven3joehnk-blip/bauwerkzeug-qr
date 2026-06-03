'use client';

import { useState } from 'react';

export default function GeraetePage() {
  const [search, setSearch] = useState('');

  const geraete = [
    {
      inventar: 'G-1001',
      name: 'Hilti TE70',
      status: 'Verfügbar',
      mitarbeiter: '-',
    },
    {
      inventar: 'G-1002',
      name: 'Makita Flex',
      status: 'Ausgegeben',
      mitarbeiter: 'Sven Jöhnk',
    },
  ];

  const filtered = geraete.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.inventar.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white p-10">

      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">

          <div>

            <h1 className="text-6xl font-black text-black">
              Geräteverwaltung
            </h1>

            <p className="mt-3 text-2xl font-bold text-slate-700">
              Maschinen, Werkzeuge und QR-Codes verwalten
            </p>

          </div>

          <a
            href="/"
            className="rounded-2xl bg-black px-8 py-5 text-xl font-black text-white"
          >
            Startseite
          </a>

        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-4">

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-6">

            <p className="text-lg font-bold text-slate-500">
              Geräte gesamt
            </p>

            <h2 className="mt-2 text-5xl font-black text-black">
              24
            </h2>

          </div>

          <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-6">

            <p className="text-lg font-bold text-emerald-700">
              Verfügbar
            </p>

            <h2 className="mt-2 text-5xl font-black text-emerald-700">
              18
            </h2>

          </div>

          <div className="rounded-3xl border-2 border-orange-200 bg-orange-50 p-6">

            <p className="text-lg font-bold text-orange-700">
              Ausgegeben
            </p>

            <h2 className="mt-2 text-5xl font-black text-orange-700">
              4
            </h2>

          </div>

          <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-6">

            <p className="text-lg font-bold text-red-700">
              Prüfung fällig
            </p>

            <h2 className="mt-2 text-5xl font-black text-red-700">
              2
            </h2>

          </div>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8">

            <h2 className="text-4xl font-black text-black">
              Gerät anlegen
            </h2>

            <div className="mt-8 space-y-5">

              <input
                placeholder="Inventarnummer"
                className="w-full rounded-2xl border-2 border-slate-300 px-5 py-5 text-xl font-bold"
              />

              <input
                placeholder="Gerätebezeichnung"
                className="w-full rounded-2xl border-2 border-slate-300 px-5 py-5 text-xl font-bold"
              />

              <input
                placeholder="Kategorie"
                className="w-full rounded-2xl border-2 border-slate-300 px-5 py-5 text-xl font-bold"
              />

              <input
                placeholder="Hersteller"
                className="w-full rounded-2xl border-2 border-slate-300 px-5 py-5 text-xl font-bold"
              />

              <button className="w-full rounded-2xl bg-black py-5 text-2xl font-black text-white">
                Gerät speichern
              </button>

            </div>

          </div>

          <div className="lg:col-span-2 rounded-3xl border-2 border-slate-200 bg-white p-8">

            <div className="mb-8 flex items-center justify-between">

              <h2 className="text-4xl font-black text-black">
                Geräteübersicht
              </h2>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Gerät suchen..."
                className="rounded-2xl border-2 border-slate-300 px-5 py-4 text-xl font-bold"
              />

            </div>

            <div className="overflow-hidden rounded-3xl border-2 border-slate-200">

              <table className="w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-6 text-left text-xl font-black text-black">
                      Inventar
                    </th>

                    <th className="p-6 text-left text-xl font-black text-black">
                      Gerät
                    </th>

                    <th className="p-6 text-left text-xl font-black text-black">
                      Status
                    </th>

                    <th className="p-6 text-left text-xl font-black text-black">
                      Mitarbeiter
                    </th>

                    <th className="p-6 text-left text-xl font-black text-black">
                      Aktionen
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filtered.map((geraet) => (

                    <tr
                      key={geraet.inventar}
                      className="border-t-2 border-slate-200"
                    >

                      <td className="p-6 text-xl font-black text-black">
                        {geraet.inventar}
                      </td>

                      <td className="p-6 text-xl font-black text-black">
                        {geraet.name}
                      </td>

                      <td className="p-6">

                        <span
                          className={`rounded-2xl px-5 py-3 text-lg font-black ${
                            geraet.status === 'Verfügbar'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {geraet.status}
                        </span>

                      </td>

                      <td className="p-6 text-xl font-bold text-black">
                        {geraet.mitarbeiter}
                      </td>

                      <td className="p-6">

                        <div className="flex gap-3">

                          <button className="rounded-2xl bg-blue-700 px-5 py-3 text-lg font-black text-white">
                            Bearbeiten
                          </button>

                          <button className="rounded-2xl bg-orange-500 px-5 py-3 text-lg font-black text-white">
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