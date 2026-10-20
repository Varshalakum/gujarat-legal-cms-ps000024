import React from 'react';

export const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  keyField = 'id',
}) => {
  return (
    <table border="1" cellPadding="6" cellSpacing="0" width="100%">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={col.key || idx} scope="col">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} align="center">
              <em>{emptyMessage}</em>
            </td>
          </tr>
        ) : (
          data.map((row, rIdx) => (
            <tr key={row[keyField] || rIdx}>
              {columns.map((col, cIdx) => (
                <td key={col.key || cIdx}>
                  {col.render ? col.render(row, rIdx) : row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
