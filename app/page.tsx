'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeCanvas } from 'qrcode.react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Asset = {
  id: string;
  qr_code: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  condition: string | null;
  next_inspection_date: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
};

export default function BauWerkzeugQRPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    qr_code: '',
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    condition: 'einsatzbereit',
    next_inspection_date: '',
    notes: '',
  });

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('alle');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.qr_code.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = filter === 'alle' || asset.condition === filter;

    return matchesSearch && matchesFilter;
  });

  function generateQrCode() {
    if (form.qr_code) return;

    const nextNumber = String(assets.length + 1).padStart(4, '0');

    setForm((prev) => ({
      ...prev,
      qr_code: `BW-${nextNumber}`,
    }));
  }

  async function loadAssets() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setAssets(data || []);
    }

    setLoading(false);
  }

  async function saveAsset(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error } = await supabase.from('assets').insert({
      qr_code: form.qr_code,
      name: form.name,
      category: form.category || null,
      manufacturer: form.manufacturer || null,
      model: form.model || null,
      serial_number: form.serial_number || null,
      condition: form.condition,
      next_inspection_date: form.next_inspection_date || null,
      notes: form.notes || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setForm({
        qr_code: '',
        name: '',
        category: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        condition: 'einsatzbereit',
        next_inspection_date: '',
        notes: '',
      });

      await loadAssets();
    }

    setSaving(false);
  }

  async function updateCondition(id: string, condition: string) {
    const { error } = await supabase
      .from('assets')
      .update({ condition })
      .eq('id', id);

    if (error) {
      setError(error.message);
    } else {
      await loadAssets();
    }
  }

  function getInspectionStatus(date: string | null) {
    if (!date) return 'ok';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inspection = new Date(date);
    inspection.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (inspection.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return 'expired';
    if (diffDays <= 30) return 'warning';
    return 'ok';
  }

  function getCardColor(asset: Asset) {
  const inspectionStatus = getInspectionStatus(asset.next_inspection_date);

  if (inspectionStatus === 'expired') {
    return 'border-red-200 bg-red-50';
  }

  if (inspectionStatus === 'warning') {
    return 'border-amber-200 bg-amber-50';
  }

  if (asset.condition === 'defekt') {
    return 'border-rose-200 bg-rose-50';
  }

  if (asset.condition === 'in Wartung') {
    return 'border-yellow-200 bg-yellow-50';
  }

  return 'border-emerald-200 bg-emerald-50';
}

  function getStatusBadge(condition: string | null) {
    if (condition === 'defekt') return 'bg-red-200 text-red-900';
    if (condition === 'in Wartung') return 'bg-yellow-200 text-yellow-900';
    return 'bg-green-200 text-green-900';
  }

  function getInspectionBadge(date: string | null) {
    const status = getInspectionStatus(date);

    if (status === 'expired') {
      return 'bg-red-600 text-white';
    }

    if (status === 'warning') {
      return 'bg-yellow-500 text-white';
    }

    return 'bg-green-600 text-white';
  }

  function getInspectionText(date: string | null) {
    const status = getInspectionStatus(date);

    if (status === 'expired') return 'Prüfung überfällig';
    if (status === 'warning') return 'Prüfung bald fällig';
    return 'Prüfung OK';
  }

  useEffect(() => {
    loadAssets();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-slate-900">BauWerkzeug QR</h1>

        <p className="mt-2 text-slate-600">
          Maschinen, Werkzeuge und Prüfungen per QR-Code organisieren.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={saveAsset}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              Neues Gerät anlegen
            </h2>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="QR-ID"
                value={form.qr_code}
                onFocus={generateQrCode}
                onChange={(e) =>
                  setForm({ ...form, qr_code: e.target.value })
                }
                
                requiredclassName="rounded-2xl border border-slate-300 px-4 py-3 text-base font-medium text-slate-900 placeholder:text-slate-400"
              />

              <input
                type="text"
                placeholder="Gerätename"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                required
              />

              <input
                type="text"
                placeholder="Kategorie"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Hersteller"
                value={form.manufacturer}
                onChange={(e) =>
                  setForm({ ...form, manufacturer: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Modell"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <input
                type="text"
                placeholder="Seriennummer"
                value={form.serial_number}
                onChange={(e) =>
                  setForm({ ...form, serial_number: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <label className="text-sm font-semibold text-slate-700">
                Nächste Prüfung
              </label>

              <input
                type="date"
                value={form.next_inspection_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    next_inspection_date: e.target.value,
                  })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              />

              <select
                value={form.condition}
                onChange={(e) =>
                  setForm({ ...form, condition: e.target.value })
                }
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="einsatzbereit">einsatzbereit</option>
                <option value="defekt">defekt</option>
                <option value="in Wartung">in Wartung</option>
              </select>

              <textarea
                placeholder="Notizen"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-24 rounded-2xl border border-slate-300 px-4 py-3"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Speichert...' : 'Gerät speichern'}
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              Geräteübersicht
            </h2>

            <div className="mb-6 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                placeholder="Suche nach Gerät oder QR-ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-300 px-4 py-3"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="alle">Alle</option>
                <option value="einsatzbereit">Einsatzbereit</option>
                <option value="in Wartung">In Wartung</option>
                <option value="defekt">Defekt</option>
              </select>
            </div>

            {loading ? (
              <p className="text-slate-500">Lade Geräte...</p>
            ) : filteredAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Noch keine passenden Geräte vorhanden.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`rounded-3xl border p-5 shadow-sm ${getCardColor(
                      asset
                    )}`}
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm text-slate-500">
                          {asset.qr_code}
                        </p>

                        <a
                          href={`/geraet/${asset.id}`}
                          className="mt-1 block text-2xl font-bold text-slate-900 hover:underline"
                        >
                          {asset.name}
                        </a>

                        <div className="mt-3 space-y-1 text-sm text-slate-700">
                          {asset.category && (
                            <p>
                              <span className="font-semibold">Kategorie:</span>{' '}
                              {asset.category}
                            </p>
                          )}

                          {asset.manufacturer && (
                            <p>
                              <span className="font-semibold">Hersteller:</span>{' '}
                              {asset.manufacturer}
                            </p>
                          )}

                          {asset.model && (
                            <p>
                              <span className="font-semibold">Modell:</span>{' '}
                              {asset.model}
                            </p>
                          )}

                          {asset.serial_number && (
                            <p>
                              <span className="font-semibold">
                                Seriennummer:
                              </span>{' '}
                              {asset.serial_number}
                            </p>
                          )}

                          <p>
                            <span className="font-semibold">
                              Nächste Prüfung:
                            </span>{' '}
                            {asset.next_inspection_date
                              ? new Date(
                                  asset.next_inspection_date
                                ).toLocaleDateString('de-DE')
                              : 'Keine Angabe'}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${getStatusBadge(
                              asset.condition
                            )}`}
                          >
                            {asset.condition || 'einsatzbereit'}
                          </span>

                          <span
                            className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${getInspectionBadge(
                              asset.next_inspection_date
                            )}`}
                          >
                            {getInspectionText(asset.next_inspection_date)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateCondition(asset.id, 'einsatzbereit')
                            }
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            OK
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateCondition(asset.id, 'in Wartung')
                            }
                            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                          >
                            Wartung
                          </button>

                          <button
                            type="button"
                            onClick={() => updateCondition(asset.id, 'defekt')}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Defekt
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                        <QRCodeCanvas
                          value={`https://bauwerkzeug-qr-live-sven.vercel.app/geraet/${asset.id}`}
                          size={120}
                          id={`qr-${asset.id}`}
                        />

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {asset.qr_code}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            const canvas = document.getElementById(
                              `qr-${asset.id}`
                            ) as HTMLCanvasElement;

                            if (!canvas) return;

                            const image = canvas.toDataURL('image/png');
                            const printWindow = window.open('', '_blank');

                            if (!printWindow) return;

                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>${asset.name}</title>
                                </head>
                                <body style="
                                  display:flex;
                                  flex-direction:column;
                                  align-items:center;
                                  justify-content:center;
                                  height:100vh;
                                  font-family:Arial;
                                ">
                                  <h2>${asset.name}</h2>
                                  <img src="${image}" />
                                  <p style="margin-top:20px;font-size:18px;">
                                    ${asset.qr_code}
                                  </p>
                                </body>
                              </html>
                            `);

                            printWindow.document.close();

                            setTimeout(() => {
                              printWindow.focus();
                              printWindow.print();
                            }, 500);
                          }}
                          className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                          QR Drucken
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
            </div>
    </main>
  );
}