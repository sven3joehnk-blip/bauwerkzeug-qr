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
    'w-full rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 text-lg font-bold text-slate-950 shadow-sm focus:border-blue-700 focus:outline-none';

  async function loadData() {
    setError('');

    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('personnel_number');

    if (employeeError) {
      setError(employeeError.message);
      return;
    }

    const { data: workData, error: workError } = await supabase
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
    const exists = form.driver_license_classes.includes(value);

    if (exists) {
      setForm({
        ...form,
        driver_license_classes: form.driver_license_classes.filter(
          (x) => x !== value
        ),
      });
    } else {
      setForm({
        ...form,
        driver_license_classes: [...form.driver_license_classes, value],
      });
    }
  }

  async function saveEmployee(e: any) {
    e.preventDefault();

    const payload = {
      personnel_number: form.personnel_number,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      has_driver_license: form.driver_license_classes.length > 0,
      driver_license_classes: form.driver_license_classes.join(', '),
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

  function editEmployee(employee: any) {
    setEditingId(employee.id);

    setForm({
      personnel_number: employee.personnel_number || '',
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || '',
      driver_license_classes: employee.driver_license_classes
        ? employee.driver_license_classes.split(',').map((x: string) => x.trim())
        : [],
    });
  }

  async function archiveEmployee(id: string) {
    const confirmed = window.confirm(
      'Mitarbeiter wirklich archivieren?'
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
      Number(timeForm.breakfast_break_minutes || 0) +
      Number(timeForm.lunch_break_minutes || 0) +
      Number(timeForm.other_break_minutes || 0)
    );
  }

  function calculateHours() {
    if (!timeForm.start_time || !timeForm.end_time) {
      return { hours: 0, overtime: 0 };
    }

    const start = new Date(`2000-01-01T${timeForm.start_time}`);
    const end = new Date(`2000-01-01T${timeForm.end_time}`);

    const diff =
      (end.getTime() - start.getTime()) / 1000 / 60 / 60;

    const netto = diff - calculateBreak() / 60;

    return {
      hours: Math.max(0, Number(netto.toFixed(2))),
      overtime: Math.max(0, Number((netto - 8).toFixed(2))),
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
          Number(timeForm.breakfast_break_minutes),
        lunch_break_minutes:
          Number(timeForm.lunch_break_minutes),
        other_break_minutes:
          Number(timeForm.other_break_minutes),
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
      (sum, x) => sum + Number(x.overtime_hours || 0),
      0
    );

    return {
      hours: hours.toFixed(2),
      overtime: overtime.toFixed(2),
    };
  }

  const preview = calculateHours();

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-950">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black">
              Mitarbeiterverwaltung
            </h1>

            <p className="mt-3 text-xl font-bold text-slate-700">
              Personal, Führerscheine, Arbeitszeiten und Archivierung
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
          <div className="mb-6 rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-lg font-black text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">

          <div className="space-y-8">

            <form
              onSubmit={saveEmployee}
              className="rounded-3xl bg-white p-7 shadow-sm"
            >
              <h2 className="mb-6 text-3xl font-black">
                {editingId
                  ? 'Mitarbeiter bearbeiten'
                  : 'Neuen Mitarbeiter anlegen'}
              </h2>

              <div className="space-y-4">

                <div>
                  <label className="mb-2 block text-lg font-black">
                    Personalnummer
                  </label>

                  <input
                    className={inputClass}
                    value={form.personnel_number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        personnel_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-black">
                    Name
                  </label>

                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-black">
                    E-Mail
                  </label>

                  <input
                    className={inputClass}
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-black">
                    Telefon
                  </label>

                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-lg font-black">
                    Rolle / Position
                  </label>

                  <input
                    className={inputClass}
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
                  <p className="mb-4 text-xl font-black">
                    Führerscheinklassen
                  </p>

                  <div className="grid grid-cols-4 gap-3">
                    {licenseOptions.map((license) => (
                      <label
                        key={license}
                        className="flex items-center gap-2 rounded-xl bg-white p-3 text-lg font-black shadow-sm"
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
                  {editingId
                    ? 'Mitarbeiter aktualisieren'
                    : 'Mitarbeiter speichern'}
                </button>
              </div>
            </form>

            <form
              onSubmit={saveWorkTime}
              className="rounded-3xl bg-white p-7 shadow-sm"
            >
              <h2 className="mb-6 text-3xl font-black">
                Arbeitszeit erfassen
              </h2>

              <div className="space-y-4">

                <select
                  className={inputClass}
                  value={timeForm.employee_id}
                  onChange={(e) =>
                    setTimeForm({
                      ...timeForm,
                      employee_id: e.target.value,
                    })
                  }
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

                <input
                  className={inputClass}
                  type="date"
                  value={timeForm.work_date}
                  onChange={(e) =>
                    setTimeForm({
                      ...timeForm,
                      work_date: e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Baustellennummer"
                  value={timeForm.construction_site_number}
                  onChange={(e) =>
                    setTimeForm({
                      ...timeForm,
                      construction_site_number:
                        e.target.value,
                    })
                  }
                />

                <input
                  className={inputClass}
                  placeholder="Tätigkeit"
                  value={timeForm.activity}
                  onChange={(e) =>
                    setTimeForm({
                      ...timeForm,
                      activity: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    className={inputClass}
                    type="time"
                    value={timeForm.start_time}
                    onChange={(e) =>
                      setTimeForm({
                        ...timeForm,
                        start_time: e.target.value,
                      })
                    }
                  />

                  <input
                    className={inputClass}
                    type="time"
                    value={timeForm.end_time}
                    onChange={(e) =>
                      setTimeForm({
                        ...timeForm,
                        end_time: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 text-2xl font-black">
                    Pausenzeiten
                  </h3>

                  <div className="grid gap-4">

                    <div>
                      <label className="mb-2 block text-lg font-black">
                        Frühstückspause (Minuten)
                      </label>

                      <input
                        className={inputClass}
                        type="number"
                        value={
                          timeForm.breakfast_break_minutes
                        }
                        onChange={(e) =>
                          setTimeForm({
                            ...timeForm,
                            breakfast_break_minutes:
                              e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-lg font-black">
                        Mittagspause (Minuten)
                      </label>

                      <input
                        className={inputClass}
                        type="number"
                        value={
                          timeForm.lunch_break_minutes
                        }
                        onChange={(e) =>
                          setTimeForm({
                            ...timeForm,
                            lunch_break_minutes:
                              e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-lg font-black">
                        Sonstige Pause (Minuten)
                      </label>

                      <input
                        className={inputClass}
                        type="number"
                        value={
                          timeForm.other_break_minutes
                        }
                        onChange={(e) =>
                          setTimeForm({
                            ...timeForm,
                            other_break_minutes:
                              e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl bg-blue-50 p-5 text-center">
                    <p className="text-lg font-black text-slate-700">
                      Nettoarbeitszeit
                    </p>

                    <p className="mt-2 text-4xl font-black text-blue-800">
                      {preview.hours.toFixed(2)} h
                    </p>
                  </div>

                  <div className="rounded-2xl bg-red-50 p-5 text-center">
                    <p className="text-lg font-black text-slate-700">
                      Überstunden
                    </p>

                    <p className="mt-2 text-4xl font-black text-red-700">
                      {preview.overtime.toFixed(2)} h
                    </p>
                  </div>
                </div>

                <button className="w-full rounded-2xl bg-blue-700 px-6 py-4 text-xl font-black text-white">
                  Arbeitszeit speichern
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">

            <section className="rounded-3xl bg-white p-7 shadow-sm">
              <h2 className="mb-6 text-3xl font-black">
                Aktive Mitarbeiter
              </h2>

              <div className="grid gap-5 xl:grid-cols-2">
                {employees.map((employee) => {
                  const summary = getSummary(employee.id);

                  return (
                    <div
                      key={employee.id}
                      className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6"
                    >
                      <h3 className="text-3xl font-black">
                        {employee.name}
                      </h3>

                      <div className="mt-5 space-y-2 text-lg font-bold">
                        <p>
                          Personalnummer:{' '}
                          {employee.personnel_number}
                        </p>

                        <p>
                          Rolle:{' '}
                          {employee.role || '-'}
                        </p>

                        <p>
                          E-Mail:{' '}
                          {employee.email || '-'}
                        </p>

                        <p>
                          Telefon:{' '}
                          {employee.phone || '-'}
                        </p>

                        <p>
                          Führerschein:{' '}
                          {employee.has_driver_license
                            ? 'Ja'
                            : 'Nein'}
                        </p>

                        <p>
                          Klassen:{' '}
                          {employee.driver_license_classes ||
                            '-'}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">

                        <div className="rounded-2xl bg-blue-50 p-4 text-center">
                          <p className="text-sm font-black text-slate-700">
                            Gesamtstunden
                          </p>

                          <p className="mt-2 text-3xl font-black text-blue-800">
                            {summary.hours}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-red-50 p-4 text-center">
                          <p className="text-sm font-black text-slate-700">
                            Überstunden
                          </p>

                          <p className="mt-2 text-3xl font-black text-red-700">
                            {summary.overtime}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            editEmployee(employee)
                          }
                          className="rounded-2xl bg-blue-700 px-5 py-3 text-lg font-black text-white"
                        >
                          Bearbeiten
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            archiveEmployee(employee.id)
                          }
                          className="rounded-2xl bg-yellow-600 px-5 py-3 text-lg font-black text-white"
                        >
                          Archivieren
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}