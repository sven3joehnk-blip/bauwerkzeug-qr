'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const licenseOptions = [
  'AM',
  'A1',
  'A2',
  'A',
  'B',
  'BE',
  'C1',
  'C1E',
  'C',
  'CE',
  'D1',
  'D1E',
  'D',
  'DE',
  'L',
  'T',
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [workTimes, setWorkTimes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    personnel_number: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    driver_license_classes: [] as string[],
  });

  const [timeForm, setTimeForm] = useState({
    employee_id: '',
    work_date: '',
    construction_site_number: '',
    activity: '',
    start_time: '',
    end_time: '',
    breakfast_break_minutes: '0',
    lunch_break_minutes: '30',
    other_break_minutes: '0',
  });

  const inputClass =
    'w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-900 focus:border-blue-700 focus:outline-none';

  async function loadData() {
    const { data: employeeData, error: employeeError } =
      await supabase
        .from('employees')
        .select('*')
        .eq('archived', false)
        .order('personnel_number');

    if (employeeError) {
      setError(employeeError.message);
      return;
    }

    const { data: workData, error: workError } =
      await supabase
        .from('work_times')
        .select('*')
        .order('work_date', { ascending: false });

    if (workError) {
      setError(workError.message);
      return;
    }

    setEmployees(employeeData || []);
    setWorkTimes(workData || []);

    if (!editingId) {
      generatePersonnelNumber(employeeData || []);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function generatePersonnelNumber(list: any[]) {
    const max =
      list.reduce((highest, employee) => {
        const nr = Number(employee.personnel_number || 0);
        return nr > highest ? nr : highest;
      }, 0) + 1;

    setForm((prev) => ({
      ...prev,
      personnel_number: String(max).padStart(3, '0'),
    }));
  }

  function toggleLicense(value: string) {
    const exists =
      form.driver_license_classes.includes(value);

    if (exists) {
      setForm({
        ...form,
        driver_license_classes:
          form.driver_license_classes.filter(
            (x) => x !== value
          ),
      });
    } else {
      setForm({
        ...form,
        driver_license_classes: [
          ...form.driver_license_classes,
          value,
        ],
      });
    }
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      personnel_number: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      driver_license_classes: [],
    });

    generatePersonnelNumber(employees);
  }

  async function saveEmployee(e: any) {
    e.preventDefault();

    const payload = {
      personnel_number: form.personnel_number,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      has_driver_license:
        form.driver_license_classes.length > 0,
      driver_license_classes:
        form.driver_license_classes.join(', '),
      archived: false,
    };

    if (editingId) {
      const { error } = await supabase
        .from('employees')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('employees')
        .insert(payload);

      if (error) {
        setError(error.message);
        return;
      }
    }

    resetForm();
    loadData();
  }

  function editEmployee(employee: any) {
    setEditingId(employee.id);

    setForm({
      personnel_number:
        employee.personnel_number || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      driver_license_classes:
        employee.driver_license_classes
          ? employee.driver_license_classes
              .split(',')
              .map((x: string) => x.trim())
          : [],
    });
  }

  async function archiveEmployee(id: string) {
    const confirmed = window.confirm(
      'Mitarbeiter archivieren?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('employees')
      .update({ archived: true })
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    loadData();
  }

  function calculateBreak() {
    return (
      Number(timeForm.breakfast_break_minutes) +
      Number(timeForm.lunch_break_minutes) +
      Number(timeForm.other_break_minutes)
    );
  }

  function calculateHours() {
    if (
      !timeForm.start_time ||
      !timeForm.end_time
    ) {
      return {
        hours: 0,
        overtime: 0,
      };
    }

    const start = new Date(
      `2000-01-01T${timeForm.start_time}`
    );

    const end = new Date(
      `2000-01-01T${timeForm.end_time}`
    );

    const diff =
      (end.getTime() - start.getTime()) /
      1000 /
      60 /
      60;

    const netto =
      diff - calculateBreak() / 60;

    return {
      hours: Math.max(
        0,
        Number(netto.toFixed(2))
      ),
      overtime: Math.max(
        0,
        Number((netto - 8).toFixed(2))
      ),
    };
  }

  async function saveWorkTime(e: any) {
    e.preventDefault();

    const calc = calculateHours();

    const { error } = await supabase
      .from('work_times')
      .insert({
        employee_id: timeForm.employee_id,
        work_date: timeForm.work_date,
        construction_site_number:
          timeForm.construction_site_number,
        activity: timeForm.activity,
        start_time: timeForm.start_time,
        end_time: timeForm.end_time,
        breakfast_break_minutes:
          Number(
            timeForm.breakfast_break_minutes
          ),
        lunch_break_minutes:
          Number(
            timeForm.lunch_break_minutes
          ),
        other_break_minutes:
          Number(
            timeForm.other_break_minutes
          ),
        break_minutes: calculateBreak(),
        hours: calc.hours,
        overtime_hours: calc.overtime,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setTimeForm({
      employee_id: '',
      work_date: '',
      construction_site_number: '',
      activity: '',
      start_time: '',
      end_time: '',
      breakfast_break_minutes: '0',
      lunch_break_minutes: '30',
      other_break_minutes: '0',
    });

    loadData();
  }

  function getSummary(employeeId: string) {
    const rows = workTimes.filter(
      (x) => x.employee_id === employeeId
    );

    const hours = rows.reduce(
      (sum, x) => sum + Number(x.hours || 0),
      0
    );

    const overtime = rows.reduce(
      (sum, x) =>
        sum + Number(x.overtime_hours || 0),
      0
    );

    return {
      hours: hours.toFixed(2),
      overtime: overtime.toFixed(2),
    };
  }

  const preview = calculateHours();

  const totalHours = workTimes.reduce(
    (sum, x) => sum + Number(x.hours || 0),
    0
  );

  const totalOvertime = workTimes.reduce(
    (sum, x) =>
      sum + Number(x.overtime_hours || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-950">
              Mitarbeiterverwaltung
            </h1>

            <p className="mt-3 text-xl font-bold text-slate-700">
              Personal, Arbeitszeiten und Führerscheine
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl bg-slate-950 px-6 py-4 text-lg font-black text-white"
          >
            Startseite
          </a>
        </div>

        {error && (
          <div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-lg font-black text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-black text-slate-600">
              Aktive Mitarbeiter
            </p>

            <p className="mt-3 text-5xl font-black text-slate-950">
              {employees.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-black text-slate-600">
              Gesamtstunden
            </p>

            <p className="mt-3 text-5xl font-black text-blue-700">
              {totalHours.toFixed(1)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-black text-slate-600">
              Überstunden
            </p>

            <p className="mt-3 text-5xl font-black text-red-700">
              {totalOvertime.toFixed(1)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-black text-slate-600">
              Arbeitszeitnachweise
            </p>

            <p className="mt-3 text-5xl font-black text-slate-950">
              {workTimes.length}
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">

          <div className="space-y-8">

            <form
              onSubmit={saveEmployee}
              className="rounded-3xl bg-white p-7 shadow-sm"
            >
              <h2 className="mb-6 text-3xl font-black">
                {editingId
                  ? 'Mitarbeiter bearbeiten'
                  : 'Mitarbeiter anlegen'}
              </h2>

              <div className="space-y-4">

                <input
                  className={inputClass}
                  placeholder="Personalnummer"
                  value={form.personnel_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      personnel_number:
                        e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="E-Mail"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Telefon"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Rolle"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value,
                    })
                  }
                />

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
                  <p className="mb-4 text-xl font-black">
                    Führerscheinklassen
                  </p>

                  <div className="grid grid-cols-4 gap-2">
                    {licenseOptions.map((license) => (
                      <label
                        key={license}
                        className="flex items-center gap-2 rounded-xl bg-white p-3 font-black"
                      >
                        <input
                          type="checkbox"
                          checked={form.driver_license_classes.includes(
                            license
                          )}
                          onChange={() =>
                            toggleLicense(license)
                          }
                        />

                        {license}
                      </label>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-xl font-black text-white">
                  Speichern
                </button>
              </div>
            </form>

          </div>

          <div className="space-y-8">

            <section className="rounded-3xl bg-white p-7 shadow-sm overflow-auto">

              <h2 className="mb-6 text-3xl font-black">
                Mitarbeiterübersicht
              </h2>

              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b-2 border-slate-200 text-left">
                    <th className="p-4 text-lg font-black">
                      Nr.
                    </th>

                    <th className="p-4 text-lg font-black">
                      Name
                    </th>

                    <th className="p-4 text-lg font-black">
                      Rolle
                    </th>

                    <th className="p-4 text-lg font-black">
                      Führerschein
                    </th>

                    <th className="p-4 text-lg font-black">
                      Stunden
                    </th>

                    <th className="p-4 text-lg font-black">
                      Aktionen
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => {
                    const summary = getSummary(
                      employee.id
                    );

                    return (
                      <tr
                        key={employee.id}
                        className="border-b border-slate-100"
                      >
                        <td className="p-4 text-lg font-bold">
                          {
                            employee.personnel_number
                          }
                        </td>

                        <td className="p-4 text-lg font-bold">
                          {employee.name}
                        </td>

                        <td className="p-4 text-lg font-bold">
                          {employee.role}
                        </td>

                        <td className="p-4 text-lg font-bold">
                          {
                            employee.driver_license_classes
                          }
                        </td>

                        <td className="p-4 text-lg font-black text-blue-700">
                          {summary.hours}
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">

                            <button
                              onClick={() =>
                                editEmployee(
                                  employee
                                )
                              }
                              className="rounded-xl bg-blue-700 px-4 py-2 font-black text-white"
                            >
                              Bearbeiten
                            </button>

                            <button
                              onClick={() =>
                                archiveEmployee(
                                  employee.id
                                )
                              }
                              className="rounded-xl bg-yellow-600 px-4 py-2 font-black text-white"
                            >
                              Archivieren
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}