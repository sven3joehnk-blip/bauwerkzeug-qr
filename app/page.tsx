'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeCanvas } from 'qrcode.react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Asset = {
  id: string;
  qr_code: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  storage_location: string | null;
  condition: string | null;
  next_inspection_date: string | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
};

type Employee = {
  id: string;
  name: string;
};

type Assignment = {
  id: string;
  asset_id: string;
  employee_id: string;
  site: string | null;
  issued_at: string;
  returned_at: string | null;
  employee: {
    name: string;
  } | null;
};

export default function BauWerkzeugQRPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('alle');
  const [editingId, setEditingId] = useState<string | null>(null);
const adminEmail = 'sven3joehnk@gmail.com';
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: '',
    site: '',
  });

  const [form, setForm] = useState({
    qr_code: '',
    name: '',
    category: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    storage_location: '',
    condition: 'einsatzbereit',
    next_inspection_date: '',
    notes: '',
  });

  const inputClass =
    'rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400';

  const editInputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400';

  const filteredAssets = assets.filter((asset) => {
    const searchText = `${asset.name} ${asset.qr_code} ${asset.storage_location || ''}`.toLowerCase();
    return (
      searchText.includes(search.toLowerCase()) &&
      (filter === 'alle' || asset.condition === filter)
    );
  });

  function changeAssetField(id: string, field: keyof Asset, value: string) {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === id ? { ...asset, [field]: value || null } : asset
      )
    );
  }

  function generateQrCode() {
    if (form.qr_code) return;
    const nextNumber = String(assets.length + 1).padStart(4, '0');
    setForm((prev) => ({ ...prev, qr_code: `BW-${nextNumber}` }));
  }

  function getQrValue(assetId: string) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/geraet/${assetId}`;
  }

 function getEmployeeName(assignment: Assignment) {
  return assignment.employee?.name || 'Unbekannt';
}
}

  async function loadAssets() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setAssets(data || []);

    setLoading(false);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name')
      .eq('active', true)
      .order('name');

    if (error) setError(error.message);
    else setEmployees(data || []);
  }

async function loadAssignments() {
  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id,
      asset_id,
      employee_id,
      site,
      issued_at,
      returned_at,
      employee:employees(name)
    `)
    .is('returned_at', null);

  if (error) {
    setError(error.message);
  } else {
    setAssignments((data as Assignment[]) || []);
  }
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
      storage_location: form.storage_location || null,
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
        storage_location: '',
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

    if (error) setError(error.message);
    else await loadAssets();
  }

  async function updateAsset(asset: Asset) {
    async function deleteAsset(assetId: string) {
  const confirmDelete = window.confirm(
    'Gerät wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
  );

  if (!confirmDelete) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== adminEmail) {
    setError('Nur der Admin darf Geräte löschen.');
    return;
  }

  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    setError(error.message);
  } else {
    await loadAssets();
  }
}
    const { error } = await supabase
      .from('assets')
      .update({
        name: asset.name,
        category: asset.category || null,
        manufacturer: asset.manufacturer || null,
        model: asset.model || null,
        serial_number: asset.serial_number || null,
        storage_location: asset.storage_location || null,
        condition: asset.condition,
        next_inspection_date: asset.next_inspection_date || null,
        notes: asset.notes || null,
      })
      .eq('id', asset.id);

    if (error) {
      setError(error.message);
    } else {
      setEditingId(null);
      await loadAssets();
    }
  }
async function deleteAsset(assetId: string) {
  const confirmDelete = window.confirm(
    'Gerät wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
  );

  if (!confirmDelete) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== 'sven3joehnk@gmail.com') {
    setError('Nur der Admin darf Geräte löschen.');
    return;
  }

  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) {
    setError(error.message);
  } else {
    await loadAssets();
    await loadAssignments();
  }
}
  async function assignAsset(assetId: string) {
    if (!assignmentForm.employee_id) {
      setError('Bitte Mitarbeiter auswählen.');
      return;
    }

    const { error } = await supabase.from('assignments').insert({
      asset_id: assetId,
      employee_id: assignmentForm.employee_id,
      site: assignmentForm.site || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setAssignmentForm({ employee_id: '', site: '' });
      await loadAssignments();
    }
  }

  async function returnAsset(assignmentId: string) {
    const { error } = await supabase
      .from('assignments')
      .update({ returned_at: new Date().toISOString() })
      .eq('id', assignmentId);

    if (error) setError(error.message);
    else await loadAssignments();
  }

  function cancelEditing() {
    setEditingId(null);
    loadAssets();
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

    if (inspectionStatus === 'expired') return 'border-red-200 bg-red-50';
    if (inspectionStatus === 'warning') return 'border-amber-200 bg-amber-50';
    if (asset.condition === 'defekt') return 'border-rose-200 bg-rose-50';
    if (asset.condition === 'in Wartung') return 'border-yellow-200 bg-yellow-50';
    return 'border-emerald-200 bg-emerald-50';
  }

  function getStatusBadge(condition: string | null) {
    if (condition === 'defekt') return 'bg-rose-100 text-rose-700';
    if (condition === 'in Wartung') return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
  }

  function getInspectionBadge(date: string | null) {
    const status = getInspectionStatus(date);
    if (status === 'expired') return 'bg-rose-300 text-rose-900';
    if (status === 'warning') return 'bg-amber-300 text-amber-900';
    return 'bg-emerald-300 text-emerald-900';
  }

  function getInspectionText(date: string | null) {
    const status = getInspectionStatus(date);
    if (status === 'expired') return 'Prüfung überfällig';
    if (status === 'warning') return 'Prüfung bald fällig';
    return 'Prüfung OK';
  }

  useEffect(() => {
    loadAssets();
    loadEmployees();
    loadAssignments();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">BauWerkzeug QR</h1>
            <p className="mt-2 text-slate-600">
              Maschinen, Werkzeuge und Prüfungen per QR-Code organisieren.
            </p>
          </div>

          <a
            href="/employees"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-center font-semibold text-white hover:bg-slate-700"
          >
            Mitarbeiterverwaltung
          </a>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={saveAsset} className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              Neues Gerät anlegen
            </h2>

            <div className="flex flex-col gap-4">
              <input type="text" placeholder="QR-ID" value={form.qr_code} onFocus={generateQrCode} onChange={(e) => setForm({ ...form, qr_code: e.target.value })} className={`${inputClass} text-base font-medium`} required />
              <input type="text" placeholder="Gerätename" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
              <input type="text" placeholder="Kategorie" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Hersteller" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Modell" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Seriennummer" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} className={inputClass} />
              <input type="text" placeholder="Lagerplatz / Standort" value={form.storage_location} onChange={(e) => setForm({ ...form, storage_location: e.target.value })} className={inputClass} />

              <label className="text-sm font-semibold text-slate-700">
                Nächste Prüfung
              </label>

              <input type="date" value={form.next_inspection_date} onChange={(e) => setForm({ ...form, next_inspection_date: e.target.value })} className={inputClass} />

              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputClass}>
                <option value="einsatzbereit">einsatzbereit</option>
                <option value="defekt">defekt</option>
                <option value="in Wartung">in Wartung</option>
              </select>

              <textarea placeholder="Notizen" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`min-h-24 ${inputClass}`} />
            </div>

            <button type="submit" disabled={saving} className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
              {saving ? 'Speichert...' : 'Gerät speichern'}
            </button>
          </form>

          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              Geräteübersicht
            </h2>

            <div className="mb-6 flex flex-col gap-3 md:flex-row">
              <input type="text" placeholder="Suche nach Gerät, QR-ID oder Lagerplatz..." value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 ${inputClass}`} />

              <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputClass}>
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
                {filteredAssets.map((asset) => {
                  const currentAssignment = assignments.find(
                    (assignment) => assignment.asset_id === asset.id
                  );

                  return (
                    <div key={asset.id} className={`rounded-3xl border p-5 shadow-sm ${getCardColor(asset)}`}>
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <p className="font-mono text-sm text-slate-500">{asset.qr_code}</p>

                          {editingId === asset.id ? (
                            <div className="mt-3 grid gap-3">
                              <input value={asset.name} onChange={(e) => changeAssetField(asset.id, 'name', e.target.value)} className={`${editInputClass} text-xl font-bold`} />
                              <input placeholder="Kategorie" value={asset.category || ''} onChange={(e) => changeAssetField(asset.id, 'category', e.target.value)} className={editInputClass} />
                              <input placeholder="Hersteller" value={asset.manufacturer || ''} onChange={(e) => changeAssetField(asset.id, 'manufacturer', e.target.value)} className={editInputClass} />
                              <input placeholder="Modell" value={asset.model || ''} onChange={(e) => changeAssetField(asset.id, 'model', e.target.value)} className={editInputClass} />
                              <input placeholder="Seriennummer" value={asset.serial_number || ''} onChange={(e) => changeAssetField(asset.id, 'serial_number', e.target.value)} className={editInputClass} />
                              <input placeholder="Lagerplatz / Standort" value={asset.storage_location || ''} onChange={(e) => changeAssetField(asset.id, 'storage_location', e.target.value)} className={editInputClass} />
                              <input type="date" value={asset.next_inspection_date || ''} onChange={(e) => changeAssetField(asset.id, 'next_inspection_date', e.target.value)} className={editInputClass} />
                              <textarea placeholder="Notizen" value={asset.notes || ''} onChange={(e) => changeAssetField(asset.id, 'notes', e.target.value)} className={editInputClass} />
                            </div>
                          ) : (
                            <>
                              <a href={`/geraet/${asset.id}`} className="mt-1 block text-2xl font-bold text-slate-900 hover:underline">
                                {asset.name}
                              </a>

                              <div className="mt-3 space-y-1 text-sm text-slate-700">
                                {asset.category && <p><span className="font-semibold">Kategorie:</span> {asset.category}</p>}
                                {asset.manufacturer && <p><span className="font-semibold">Hersteller:</span> {asset.manufacturer}</p>}
                                {asset.model && <p><span className="font-semibold">Modell:</span> {asset.model}</p>}
                                {asset.serial_number && <p><span className="font-semibold">Seriennummer:</span> {asset.serial_number}</p>}
                                {asset.storage_location && <p><span className="font-semibold">Lagerplatz:</span> {asset.storage_location}</p>}

                                <p>
                                  <span className="font-semibold">Nächste Prüfung:</span>{' '}
                                  {asset.next_inspection_date ? new Date(asset.next_inspection_date).toLocaleDateString('de-DE') : 'Keine Angabe'}
                                </p>

                                {asset.notes && <p><span className="font-semibold">Notizen:</span> {asset.notes}</p>}
                              </div>
                            </>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${getStatusBadge(asset.condition)}`}>
                              {asset.condition || 'einsatzbereit'}
                            </span>

                            <span className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${getInspectionBadge(asset.next_inspection_date)}`}>
                              {getInspectionText(asset.next_inspection_date)}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={() => updateCondition(asset.id, 'einsatzbereit')} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                              OK
                            </button>

                            <button type="button" onClick={() => updateCondition(asset.id, 'in Wartung')} className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400">
                              Wartung
                            </button>

                            <button type="button" onClick={() => updateCondition(asset.id, 'defekt')} className="rounded-xl bg-rose-400 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">
                              Defekt
                            </button>
<button
  type="button"
  onClick={() => deleteAsset(asset.id)}
  className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
>
  Löschen
</button>
                            {editingId === asset.id ? (
                              <>
                                <button type="button" onClick={() => updateAsset(asset)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                  Speichern
                                </button>

                                <button type="button" onClick={cancelEditing} className="rounded-xl bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-400">
                                  Abbrechen
                                </button>
                              </>
                            ) : (
                              <button type="button" onClick={() => setEditingId(asset.id)} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                                Bearbeiten
                              </button>
                            )}
                          </div>

                          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                            <h4 className="mb-3 font-semibold text-slate-900">Geräteausgabe</h4>

{currentAssignment ? (
  <div className="space-y-2 text-sm font-semibold text-slate-700">
    <p><strong>Aktuell bei:</strong> {getEmployeeName(currentAssignment)}</p>
    <p><strong>Baustelle:</strong> {currentAssignment.site || '-'}</p>
    <p><strong>Ausgegeben:</strong> gespeichert</p>

    <button
      type="button"
      onClick={() => returnAsset(currentAssignment.id)}
      className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
    >
      Gerät zurückgeben
    </button>
  </div>
) : (
) : (
  <div className="grid gap-3">
    <select
      value={assignmentForm.employee_id}
      onChange={(e) =>
        setAssignmentForm({
          ...assignmentForm,
          employee_id: e.target.value,
        })
      }
      className={editInputClass}
    >
      <option value="">Mitarbeiter auswählen</option>

      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.name}
        </option>
      ))}
    </select>

    <input
      type="text"
      placeholder="Baustelle / Einsatzort"
      value={assignmentForm.site}
      onChange={(e) =>
        setAssignmentForm({
          ...assignmentForm,
          site: e.target.value,
        })
      }
      className={editInputClass}
    />

    <button
      type="button"
      onClick={() => assignAsset(asset.id)}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
    >
      Gerät ausgeben
    </button>
  </div>
)}
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                          <QRCodeCanvas value={getQrValue(asset.id)} size={120} id={`qr-${asset.id}`} />

                          <p className="mt-2 text-sm font-semibold text-slate-700">
                            {asset.qr_code}
                          </p>

                          <button
                            type="button"
                            onClick={() => {
                              const canvas = document.getElementById(`qr-${asset.id}`) as HTMLCanvasElement;
                              if (!canvas) return;

                              const image = canvas.toDataURL('image/png');
                              const printWindow = window.open('', '_blank');
                              if (!printWindow) return;

                              printWindow.document.write(`
                                <html>
                                  <head><title>${asset.name}</title></head>
                                  <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial;">
                                    <h2>${asset.name}</h2>
                                    <img src="${image}" />
                                    <p style="margin-top:20px;font-size:18px;">${asset.qr_code}</p>
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
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}