'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

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

  const [employeeForm, setEmployeeForm] = useState({
    personal_number: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    licenses: [] as string[],
  });

  const [timeForm, setTimeForm] = useState({
    employee_id: '',
    construction_number: '',
    construction_name: '',
    date: '',
    start: '07:00',
    end: '16:00',
    breakfast: 15,
    lunch: 30,
    other_break: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!supabase) return;

    const { data: employeeData } = await supabase
      .from('employees')
      .select('*')
      .eq('archived', false)
      .order('name');

    const { data: workData } = await supabase
      .from('work_times')
      .select('*')
      .order('work_date', { ascending: false });

    setEmployees(employeeData || []);
    setWorkTimes(workData || []);
  }

  async function saveEmployee() {
    if (!supabase) return;

    const nextNumber =
      employees.length > 0
        ? String(
            Math.max(
              ...employees.map((e) =>
                Number(e.personal_number || 0)
              )
            ) + 1
          ).padStart(3, '0')
        : '001';

    const finalNumber =
      employeeForm.personal_number || nextNumber;

    const { error } = await supabase
      .from('employees')
      .insert({
        personal_number: finalNumber,
        name: employeeForm.name,
        email: employeeForm.email,
        phone: employeeForm.phone,
        role: employeeForm.role,
        has_driver_license:
          employeeForm.licenses.length > 0,
        driver_license_classes:
          employeeForm.licenses.join(', '),
        archived: false,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setEmployeeForm({
      personal_number: '',
      name: '',
      email: '',
      phone: '',
      role: '',
      licenses: [],
    });

    loadData();
  }

  async function saveWorkTime() {
    if (!supabase) return;

    const start = new Date(
      `2026-01-01T${timeForm.start}`
    );

    const end = new Date(
      `2026-01-01T${timeForm.end}`
    );

    const diff =
      (end.getTime() - start.getTime()) /
      1000 /
      60 /
      60;

    const breaks =
      (Number(timeForm.breakfast) +
        Number(timeForm.lunch) +
        Number(timeForm.other_break)) /
      60;

    const hours = diff - breaks;

    const overtime = hours > 8 ? hours - 8 : 0;

    const { error } = await supabase
      .from('work_times')
      .insert({
        employee_id: timeForm.employee_id,
        construction_number:
          timeForm.construction_number,
        construction_name:
          timeForm.construction_name,
        work_date: timeForm.date,
        start_time: timeForm.start,
        end_time: timeForm.end,
        breakfast_break: timeForm.breakfast,
        lunch_break: timeForm.lunch,
        other_break: timeForm.other_break,
        hours,
        overtime_hours: overtime,
      });

    if (error) {
      setError(error.message);
      return;
    }

    loadData();
  }

  async function archiveEmployee(id: number) {
    if (!supabase) return;

    await supabase
      .from('employees')
      .update({ archived: true })
      .eq('id', id);

    loadData();
  }

  const totalHours = useMemo(() => {
    return workTimes.reduce(
      (sum, item) => sum + Number(item.hours || 0),
      0
    );
  }, [workTimes]);

  const totalOvertime = useMemo(() => {
    return workTimes.reduce(
      (sum, item) =>
        sum + Number(item.overtime_hours || 0),
      0
    );
  }, [workTimes]);

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-slate-950">
              Mitarbeiterverwaltung
            </h1>

            <p className="mt-2 text-xl font-bold text-slate-600">
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
          <div className="mb-8 rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-lg font-black text-red-700">
            Fehler: {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-4">

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-500">
              Mitarbeiter
            </p>

            <p className="mt-3 text-5xl font-black text-slate-950">
              {employees.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-500">
              Stunden Gesamt
            </p>

            <p className="mt-3 text-5xl font-black text-slate-950">
              {totalHours.toFixed(1)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-500">
              Überstunden
            </p>

            <p className="mt-3 text-5xl font-black text-orange-600">
              {totalOvertime.toFixed(1)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-lg font-bold text-slate-500">
              Arbeitszeiteinträge
            </p>

            <p className="mt-3 text-5xl font-black text-slate-950">
              {workTimes.length}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-3">

          <div className="rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-3xl font-black text-slate-950">
              Mitarbeiter anlegen
            </h2>

            <div className="mt-8 space-y-4">

              <input
                placeholder="Personalnummer"
                value={employeeForm.personal_number}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    personal_number: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
              />

              <input
                placeholder="Name"
                value={employeeForm.name}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
              />

              <input
                placeholder="E-Mail"
                value={employeeForm.email}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
              />

              <input
                placeholder="Telefon"
                value={employeeForm.phone}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
              />

              <input
                placeholder="Position"
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm({
                    ...employeeForm,
                    role: e.target.value,
                  })
                }
                className="w-full rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
              />

              <div>
                <p className="mb-4 text-xl font-black text-slate-950">
                  Führerscheinklassen
                </p>

                <div className="grid grid-cols-4 gap-3">

                  {licenseOptions.map((license) => (
                    <label
                      key={license}
                      className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 p-3 font-black"
                    >
                      <input
                        type="checkbox"
                        checked={employeeForm.licenses.includes(
                          license
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEmployeeForm({
                              ...employeeForm,
                              licenses: [
                                ...employeeForm.licenses,
                                license,
                              ],
                            });
                          } else {
                            setEmployeeForm({
                              ...employeeForm,
                              licenses:
                                employeeForm.licenses.filter(
                                  (l) => l !== license
                                ),
                            });
                          }
                        }}
                      />

                      {license}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={saveEmployee}
                className="w-full rounded-2xl bg-slate-950 p-5 text-xl font-black text-white"
              >
                Mitarbeiter speichern
              </button>
            </div>
          </div>

          <div className="xl:col-span-2 rounded-3xl bg-white p-8 shadow-sm">

            <h2 className="text-3xl font-black text-slate-950">
              Mitarbeiterübersicht
            </h2>

            <div className="mt-8 overflow-auto">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b-2 border-slate-200 text-left">
                    <th className="p-4 text-lg font-black">
                      Personalnr.
                    </th>

                    <th className="p-4 text-lg font-black">
                      Name
                    </th>

                    <th className="p-4 text-lg font-black">
                      Position
                    </th>

                    <th className="p-4 text-lg font-black">
                      Führerschein
                    </th>

                    <th className="p-4 text-lg font-black">
                      Stunden
                    </th>

                    <th className="p-4 text-lg font-black">
                      Überstunden
                    </th>

                    <th className="p-4 text-lg font-black">
                      Aktion
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {employees.map((employee) => {

                    const employeeTimes =
                      workTimes.filter(
                        (w) =>
                          String(w.employee_id) ===
                          String(employee.id)
                      );

                    const hours =
                      employeeTimes.reduce(
                        (sum, item) =>
                          sum +
                          Number(item.hours || 0),
                        0
                      );

                    const overtime =
                      employeeTimes.reduce(
                        (sum, item) =>
                          sum +
                          Number(
                            item.overtime_hours || 0
                          ),
                        0
                      );

                    return (
                      <tr
                        key={employee.id}
                        className="border-b border-slate-100"
                      >
                        <td className="p-4 text-lg font-bold">
                          {employee.personal_number}
                        </td>

                        <td className="p-4 text-lg font-black">
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

                        <td className="p-4 text-lg font-bold">
                          {hours.toFixed(1)}
                        </td>

                        <td className="p-4 text-lg font-bold text-orange-600">
                          {overtime.toFixed(1)}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() =>
                              archiveEmployee(
                                employee.id
                              )
                            }
                            className="rounded-xl bg-orange-500 px-4 py-3 font-black text-white"
                          >
                            Archivieren
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-black text-slate-950">
            Arbeitszeiterfassung
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">

            <select
              value={timeForm.employee_id}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  employee_id: e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            >
              <option value="">
                Mitarbeiter wählen
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
              placeholder="Baustellen-Nr."
              value={timeForm.construction_number}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  construction_number:
                    e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              placeholder="Baustelle"
              value={timeForm.construction_name}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  construction_name:
                    e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="date"
              value={timeForm.date}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  date: e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="time"
              value={timeForm.start}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  start: e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="time"
              value={timeForm.end}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  end: e.target.value,
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="number"
              placeholder="Frühstückspause"
              value={timeForm.breakfast}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  breakfast:
                    Number(e.target.value),
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="number"
              placeholder="Mittagspause"
              value={timeForm.lunch}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  lunch:
                    Number(e.target.value),
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />

            <input
              type="number"
              placeholder="Sonstige Pause"
              value={timeForm.other_break}
              onChange={(e) =>
                setTimeForm({
                  ...timeForm,
                  other_break:
                    Number(e.target.value),
                })
              }
              className="rounded-2xl border-2 border-slate-200 p-4 text-lg font-bold"
            />
          </div>

          <button
            onClick={saveWorkTime}
            className="mt-6 rounded-2xl bg-slate-950 px-8 py-5 text-xl font-black text-white"
          >
            Arbeitszeit speichern
          </button>
        </div>
      </div>
    </main>
  );
}