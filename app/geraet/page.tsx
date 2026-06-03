'use client';

export default function GeraetePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-5xl font-extrabold text-slate-950">
          Geräteverwaltung
        </h1>

        <p className="mt-3 text-xl font-extrabold text-slate-700">
          Werkzeuge, Maschinen und QR-Codes verwalten
        </p>

        <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-extrabold text-slate-950">
            Geräteübersicht
          </h2>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">

            <table className="w-full">

              <thead className="bg-slate-100">
                <tr>

                  <th className="p-4 text-left text-lg font-extrabold">
                    Inventar
                  </th>

                  <th className="p-4 text-left text-lg font-extrabold">
                    Gerät
                  </th>

                  <th className="p-4 text-left text-lg font-extrabold">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                <tr className="border-t border-slate-200">

                  <td className="p-4 text-lg font-bold">
                    G-1001
                  </td>

                  <td className="p-4 text-lg font-bold">
                    Hilti TE70
                  </td>

                  <td className="p-4">
                    <span className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-extrabold text-emerald-700">
                      Verfügbar
                    </span>
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </main>
  );
}