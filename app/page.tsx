'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

type Asset = {
  id: string;
  qr_code: string;
  name: string;
  condition: string | null;
};

type Employee = {
  id: string;
  name: string;
};

type Assignment = {
  id: string;
  asset_id: string;
  employee_id: string;
  returned_at: string | null;
  employee: {
    name: string;
  } | null;
};

export default function Page() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [name, setName] = useState('');
  const [qr, setQr] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState('');

  async function loadData() {
    const { data: assetData } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: employeeData } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    const { data: assignmentData } = await supabase
      .from('assignments')
      .select('*, employee:employees(name)')
      .is('returned_at', null);

    setAssets(assetData || []);
    setEmployees(employeeData || []);
    setAssignments(assignmentData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveAsset() {
    if (!name || !qr) return;

    await supabase.from('assets').insert({
      name,
      qr_code: qr,
      condition: 'einsatzbereit',
    });

    setName('');
    setQr('');

    loadData();
  }

  async function assignAsset(assetId: string) {
    if (!selectedEmployee) return;

    await supabase.from('assignments').insert({
      asset_id: assetId,
      employee_id: selectedEmployee,
    });

    setSelectedEmployee('');

    loadData();
  }

  async function returnAsset(id: string) {
    await supabase
      .from('assignments')
      .update({
        returned_at: new Date().toISOString(),
      })
      .eq('id', id);

    loadData();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl font-extrabold text-slate-900">
          BauWerkzeug QR
        </h1>
<div className="mt-4">
  <a
    href="/employees"
    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700"
  >
    Mitarbeiterverwaltung
  </a>
</div>
        <div className="mt-8 rounded-3xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-extrabold">
            Gerät anlegen
          </h2>

          <div className="grid gap-4">
            <input
              placeholder="QR-Code"
              value={qr}
              onChange={(e) => setQr(e.target.value)}
              className="rounded-2xl border p-4 text-lg font-bold"
            />

            <input
              placeholder="Gerätename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border p-4 text-lg font-bold"
            />

            <button
              onClick={saveAsset}
              className="rounded-2xl bg-slate-900 p-4 text-lg font-extrabold text-white"
            >
              Gerät speichern
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {assets.map((asset) => {
            const currentAssignment = assignments.find(
              (a) => a.asset_id === asset.id
            );

            return (
              <div
                key={asset.id}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-500">
                      {asset.qr_code}
                    </p>

                    <h2 className="text-2xl font-extrabold text-slate-900">
                      {asset.name}
                    </h2>
                  </div>
                </div>

                {currentAssignment ? (
                  <div className="mt-4 rounded-2xl bg-emerald-100 p-4">
                    <p className="text-lg font-extrabold">
                      Aktuell bei:
                    </p>

                    <p className="text-xl font-bold">
                      {currentAssignment.employee?.name || 'Unbekannt'}
                    </p>

                    <button
                      onClick={() =>
                        returnAsset(currentAssignment.id)
                      }
                      className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-lg font-extrabold text-white"
                    >
                      Gerät zurückgeben
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    <select
                      value={selectedEmployee}
                      onChange={(e) =>
                        setSelectedEmployee(e.target.value)
                      }
                      className="rounded-2xl border p-4 text-lg font-bold"
                    >
                      <option value="">
                        Mitarbeiter auswählen
                      </option>

                      {employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => assignAsset(asset.id)}
                      className="rounded-2xl bg-blue-600 px-4 py-3 text-lg font-extrabold text-white"
                    >
                      Gerät ausgeben
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}