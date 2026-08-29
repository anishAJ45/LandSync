import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  id: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  id,
  columns,
  data,
  emptyMessage = 'No records found.'
}: DataTableProps<T>) {
  return (
    <div id={id} className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-500 italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.className || ''}`}>
                      {col.render
                        ? col.render(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
