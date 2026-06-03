'use client';

export default function GeraetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm">

        <h1 className="text-4xl font-black">
          Gerätedetails
        </h1>

        <p className="mt-6 text-2xl font-black text-slate-800">
          Inventarnummer: {params.id}
        </p>

        <a
          href="/geraet"
          className="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 font-black text-white"
        >
          Zur Geräteverwaltung
        </a>

      </div>
    </main>
  );
}