'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function GeraetPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  async function loadAsset() {
    if (!id) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError(error.message);
      setAsset(null);
    } else {
      setAsset(data);
      setPreviewUrl(data?.photo_url || '');
    }

    setLoading(false);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file || !asset) return;

    setUploading(true);
    setError(null);

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${asset.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('geraete-fotos')
      .upload(fileName, file, {
        cacheControl: '0',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('geraete-fotos')
      .getPublicUrl(fileName);

    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('assets')
      .update({ photo_url: publicUrl })
      .eq('id', asset.id);

    if (updateError) {
      setError(updateError.message);
      setUploading(false);
      return;
    }

    setAsset({
      ...asset,
      photo_url: publicUrl,
    });

    setPreviewUrl(publicUrl);
    setUploading(false);

    e.target.value = '';
  }

  useEffect(() => {
    loadAsset();
  }, [id]);

  if (loading) {
    return <main className="p-8">Lade Gerät...</main>;
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">
            Fehler
          </h1>

          <p className="mt-4 text-slate-700">{error}</p>

          <a
            href="/"
            className="mt-6 inline-block rounded-2xl bg-slate-900 px-5 py-3 text-white"
          >
            Zurück zur Übersicht
          </a>
        </div>
      </main>
    );
  }

  if (!asset) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
          Gerät nicht gefunden.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <a href="/" className="mb-6 inline-block text-sm font-semibold text-blue-700">
          ← Zurück zur Übersicht
        </a>

        <h1 className="text-3xl font-bold text-slate-900">
          {asset.name}
        </h1>

        <div className="mt-6 space-y-2 text-slate-700">
          <p><strong>QR-ID:</strong> {asset.qr_code}</p>
          <p><strong>Kategorie:</strong> {asset.category || '-'}</p>
          <p><strong>Hersteller:</strong> {asset.manufacturer || '-'}</p>
          <p><strong>Modell:</strong> {asset.model || '-'}</p>
          <p><strong>Seriennummer:</strong> {asset.serial_number || '-'}</p>
          <p><strong>Lagerplatz:</strong> {asset.storage_location || '-'}</p>
          <p><strong>Zustand:</strong> {asset.condition || '-'}</p>
          <p><strong>Nächste Prüfung:</strong> {asset.next_inspection_date || '-'}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-3 block text-lg font-semibold text-slate-900">
            Foto aufnehmen / hochladen
          </label>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={uploadPhoto}
            className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
          />

          {uploading && (
            <p className="mt-3 font-semibold text-slate-500">
              Bild wird hochgeladen...
            </p>
          )}
        </div>

        {previewUrl ? (
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-bold text-slate-900">
              Gerätefoto
            </h2>

            <img
              src={previewUrl}
              alt={asset.name}
              className="w-full rounded-2xl border bg-white object-contain shadow-sm"
            />

            <a
              href={previewUrl}
              target="_blank"
              className="mt-3 inline-block text-sm font-semibold text-blue-700"
            >
              Foto in voller Größe öffnen
            </a>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            Noch kein Foto gespeichert.
          </div>
        )}
      </div>
    </main>
  );
}