'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
};

export default function GeraetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAsset();
  }, []);

  async function loadAsset() {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) {
      setAsset(data);
    }
  }
async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];

  if (!file || !asset) return;

  const fileExt = file.name.split('.').pop();

  const fileName = `${asset.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('asset-photos')
    .upload(fileName, file);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data } = supabase.storage
    .from('asset-photos')
    .getPublicUrl(fileName);

  const publicUrl = data.publicUrl;

  const { error: updateError } = await supabase
    .from('assets')
    .update({ photo_url: publicUrl })
    .eq('id', asset.id);

  if (updateError) {
    alert(updateError.message);
    return;
  }

  setAsset({
    ...asset,
    photo_url: publicUrl,
  });
}
  if (!asset) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          Lade Gerät...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {asset.name}
        </h1>
<div className="mt-6">
  {asset.photo_url ? (
    <img
      src={asset.photo_url}
      alt={asset.name}
      className="max-h-80 w-full rounded-2xl object-cover"
    />
  ) : (
    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
      Noch kein Foto vorhanden
    </div>
  )}

  <label className="mt-4 inline-block cursor-pointer rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-700">
    Foto hochladen

    <input
      type="file"
      accept="image/*"
      onChange={uploadPhoto}
      className="hidden"
    />
  </label>
</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">QR-Code</p>
            <p className="font-medium">{asset.qr_code}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Kategorie</p>
            <p className="font-medium">
              {asset.category || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Hersteller</p>
            <p className="font-medium">
              {asset.manufacturer || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Modell</p>
            <p className="font-medium">
              {asset.model || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Seriennummer</p>
            <p className="font-medium">
              {asset.serial_number || '-'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Zustand</p>
            <p className="font-medium">
              {asset.condition || '-'}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-slate-500">Notizen</p>
          <div className="mt-2 rounded-2xl bg-slate-100 p-4">
            {asset.notes || 'Keine Notizen vorhanden'}
          </div>
        </div>
      </div>
    </main>
  );
}
