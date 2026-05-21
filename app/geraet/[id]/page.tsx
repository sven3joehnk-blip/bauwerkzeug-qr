'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GeraetPage({
  params,
}: {
  params: { id: string };
}) {
  const [asset, setAsset] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  async function loadAsset() {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('id', params.id)
      .single();

    setAsset(data);
  }

  async function uploadPhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file || !asset) return;

    setUploading(true);

    const fileName = `${asset.id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('geraete-fotos')
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from('geraete-fotos')
      .getPublicUrl(fileName);

    await supabase
      .from('assets')
      .update({
        photo_url: publicUrl,
      })
      .eq('id', asset.id);

    await loadAsset();

    setUploading(false);
  }

  useEffect(() => {
    loadAsset();
  }, []);

  if (!asset) {
    return (
      <main className="p-8">
        Lade Gerät...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {asset.name}
        </h1>

        <div className="mt-6 space-y-2 text-slate-700">
          <p>
            <strong>QR-ID:</strong> {asset.qr_code}
          </p>

          <p>
            <strong>Kategorie:</strong>{' '}
            {asset.category || '-'}
          </p>

          <p>
            <strong>Hersteller:</strong>{' '}
            {asset.manufacturer || '-'}
          </p>

          <p>
            <strong>Modell:</strong>{' '}
            {asset.model || '-'}
          </p>

          <p>
            <strong>Seriennummer:</strong>{' '}
            {asset.serial_number || '-'}
          </p>

          <p>
            <strong>Zustand:</strong>{' '}
            {asset.condition || '-'}
          </p>

          <p>
            <strong>Nächste Prüfung:</strong>{' '}
            {asset.next_inspection_date || '-'}
          </p>
        </div>

        <div className="mt-8">
          <label className="mb-3 block text-lg font-semibold text-slate-900">
            Foto aufnehmen
          </label>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={uploadPhoto}
            className="block w-full"
          />

          {uploading && (
            <p className="mt-3 text-slate-500">
              Bild wird hochgeladen...
            </p>
          )}
        </div>

        {asset.photo_url && (
          <div className="mt-8">
            <img
              src={asset.photo_url}
              alt={asset.name}
              className="rounded-2xl border shadow-sm"
            />
          </div>
        )}
      </div>
    </main>
  );
}
