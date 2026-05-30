'use client';

export default function GeraetePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-950">
              Geräteverwaltung
            </h1>

            <p className="mt-2 text-lg font-bold text-slate-600">
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

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Gerät anlegen
            </h2>

            <div className="mt-6 space-y-4">

              <input
                placeholder="Inventarnummer"
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 font-bold"
              />

              <input
                placeholder="Gerätebezeichnung"
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 font-bold"
              />

              <input
                placeholder="Hersteller"
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 font-bold"
              />

              <input
                placeholder="Seriennummer"
                className="w-full rounded-2xl border border-slate-300 px-4 py-4 font-bold"
              />

              <button
                className="w-full rounded-2xl bg-slate-950 py-4 text-lg font-black text-white"
              >
                Gerät speichern
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Geräteübersicht
                </h2>

                <p className="mt-1 text-sm font-bold text-slate-500">
                  Aktive Maschinen und Werkzeuge
                </p>
              </div>

              <input
                placeholder="Gerät suchen..."
                className="rounded-2xl border border-slate-300 px-4 py-3 font-bold"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">

              <table className="w-full">

                <thead className="bg-slate-100">
                  <tr className="text-left text-sm text-slate-700">

                    <th className="p-4 font-black">
                      Inventar
                    </th>

                    <th className="p-4 font-black">
                      Gerät
                    </th>

                    <th className="p-4 font-black">
                      Status
                    </th>

                    <th className="p-4 font-black">
                      Ausgabe
                    </th>

                    <th className="p-4 font-black">
                      Aktionen
                    </th>

                  </tr>
                </thead>

                <tbody>

                  <tr className="border-t border-slate-200">

                    <td className="p-4 font-bold">
                      G-1001
                    </td>

                    <td className="p-4 font-bold">
                      Hilti TE70
                    </td>

                    <td className="p-4">
                      <span className="rounded-xl bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-700">
                        Verfügbar
                      </span>
                    </td>

                    <td className="p-4 font-bold">
                      Nicht ausgegeben
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">

                        <button className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">
                          Bearbeiten
                        </button>

                        <button className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-black text-white">
                          Ausgabe
                        </button>

                      </div>
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}