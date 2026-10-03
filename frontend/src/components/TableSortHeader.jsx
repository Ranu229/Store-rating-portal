import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const TableSortHeader = ({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  className = '',
}) => {
  const isActive = currentSort === field;

  const handleClick = () => {
    if (isActive) {
      onSort(field, currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  return (
    <th
      scope="col"
      onClick={handleClick}
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-900 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-slate-400">
          {isActive ? (
            currentOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
};

export default TableSortHeader;
