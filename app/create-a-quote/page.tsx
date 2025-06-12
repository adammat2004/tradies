'use client';

import useServiceModel from '../hooks/useServiceModel';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useLoginModel from '../hooks/useLoginModel';
import { set } from 'react-hook-form';

interface LineItem {
  [key: string]: string | number | boolean | undefined;
  total?: number;
}

interface Table {
  title: string;
  columns: string[];
  items: LineItem[];
  multiplierColumns: string[];
}

interface Note {
  description: string;
}

const CreateQuotePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const serviceModel = useServiceModel();
  const loginModel = useLoginModel();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/get-current-user');
        if (!res.ok){
          setLoading(false);
          return
        };
        const data = await res.json();
        setCurrentUser(data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch current user');
      }
    };
    fetchCurrentUser();
  }, []);

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [company, setCompany] = useState({ name: '', address: '', city: '', postalCode: '', county: '', email: '', phone: '' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  const addTable = () => {
    const newTable: Table = {
      title: `Table ${tables.length + 1}`,
      columns: ['Description', 'Quantity', 'Unit Price'],
      items: [],
      multiplierColumns: ['Quantity', 'Unit Price'],
    };
    setTables([...tables, newTable]);
  };

  const addColumn = (tableIndex: number, newColumn: string) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].columns.push(newColumn);
    updatedTables[tableIndex].items.forEach(item => {
      item[newColumn] = '';
    });
    setTables(updatedTables);
  };

  const removeColumn = (tableIndex: number, column: string) => {
    if (!confirm(`Are you sure you want to remove column "${column}"? This cannot be undone.`)) return;
    const updatedTables = [...tables];
    updatedTables[tableIndex].columns = updatedTables[tableIndex].columns.filter(col => col !== column);
    updatedTables[tableIndex].items = updatedTables[tableIndex].items.map(item => {
      const { [column]: _, ...rest } = item;
      return rest;
    });
    updatedTables[tableIndex].multiplierColumns = updatedTables[tableIndex].multiplierColumns.filter(col => col !== column);
    setTables(updatedTables);
  };

  const addItemToTable = (tableIndex: number) => {
    const newItem: LineItem = { total: 0 };
    tables[tableIndex].columns.forEach(col => (newItem[col] = ''));
    const updatedTables = [...tables];
    updatedTables[tableIndex].items.push(newItem);
    setTables(updatedTables);
  };

  const removeItemFromTable = (tableIndex: number, itemIndex: number) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].items.splice(itemIndex, 1);
    setTables(updatedTables);
  };

  const updateItem = (tableIndex: number, itemIndex: number, column: string, value: string | number) => {
    const updatedTables = [...tables];
    updatedTables[tableIndex].items[itemIndex][column] = value;

    // Recalculate total based on multiplier columns
    const item = updatedTables[tableIndex].items[itemIndex];
    const product = tables[tableIndex].multiplierColumns.reduce((acc, col) => {
      const num = parseFloat(item[col] as string) || 0;
      return acc * num;
    }, 1);
    item.total = product;

    setTables(updatedTables);
  };

  const addNotes = () => {
    setNotes([...notes, { description: '' }]);
  };

  const subtotal = tables.reduce((sum, table) => {
    return sum + table.items.reduce((itemSum, item) => {
      return itemSum + (Number(item.total) || 0);
    }, 0);
  }, 0);

  const handleSubmit = async () => {
    const quoteData = {
      customer,
      company,
      notes,
      tables,
      subtotal,
      userId: currentUser?.id,
    };

    try {
      const res = await fetch('/api/create-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      if (res.ok) {
        toast.success('Quote created successfully!');
        router.push('/my-quotes');
      } else {
        toast.error('Failed to create quote.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div>
        <div className="text-xl font-serif text-center">
          You must have a service listed to create a quote.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-12 space-y-12">
      <h1 className="text-5xl font-extrabold text-white text-center mb-8 drop-shadow-lg">Create Quote</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-white text-3xl font-semibold border-b border-white pb-2">From</h2>
          {Object.entries(company).map(([key, val]) => (
            <input
              key={key}
              className="w-full p-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={val}
              onChange={(e) => setCompany({ ...company, [key]: e.target.value })}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-white text-3xl font-semibold border-b border-white pb-2">To</h2>
          {Object.entries(customer).map(([key, val]) => (
            <input
              key={key}
              className="w-full p-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={val}
              onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })}
            />
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {notes.map((note, index) => (
          <div key={index} className="flex gap-3 items-start">
            <textarea
              className="w-full p-3 rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Note"
              value={note.description}
              onChange={(e) => {
                const updatedNotes = [...notes];
                updatedNotes[index].description = e.target.value;
                setNotes(updatedNotes);
              }}
            />
            <button
              onClick={() => setNotes(notes.filter((_, i) => i !== index))}
              className="text-red-600 font-bold text-2xl hover:text-red-800 transition"
              aria-label="Remove note"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addNotes}
          className="text-blue-900 underline font-semibold hover:text-blue-700 transition"
        >
          + Add Note
        </button>
      </div>

      <button
        onClick={addTable}
        className="bg-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-blue-900 transition"
      >
        + Add Table
      </button>

      {tables.map((table, tableIndex) => {
        const isTitleEmpty = table.title.trim() === '';
        return (
          <div key={tableIndex} className="bg-white p-6 rounded-xl shadow space-y-4 overflow-x-auto relative">
            {/* Table Title with required styling */}
            <input
              className={`text-xl font-semibold w-full border-b p-2 mb-2 focus:outline-none ${
                isTitleEmpty ? 'border-red-500' : 'border-gray-300'
              }`}
              value={table.title}
              placeholder="Enter table title *"
              onChange={(e) => {
                const updatedTables = [...tables];
                updatedTables[tableIndex].title = e.target.value;
                setTables(updatedTables);
              }}
            />
            {isTitleEmpty && (
              <p className="text-red-500 text-sm mb-2">Table title is required</p>
            )}

            {/* Remove Table Button */}
            <button
              onClick={() => {
                const updatedTables = [...tables];
                updatedTables.splice(tableIndex, 1);
                setTables(updatedTables);
              }}
              className="absolute top-4 right-4 text-red-600 font-bold px-3 py-1 rounded hover:bg-red-100"
              type="button"
              title="Remove Table"
            >
              Remove Table
            </button>

            {/* Multiply Columns Section with remove button */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <label className="font-semibold">Multiply Columns:</label>
              {table.multiplierColumns.map((col, i) => (
                <div key={i} className="flex items-center gap-1">
                  <select
                    value={col}
                    onChange={(e) => {
                      const updated = [...table.multiplierColumns];
                      updated[i] = e.target.value;
                      const updatedTables = [...tables];
                      updatedTables[tableIndex].multiplierColumns = updated;
                      setTables(updatedTables);
                    }}
                    className="border p-1 rounded"
                  >
                    {table.columns.map((colOpt, index) => (
                      <option key={index} value={colOpt}>
                        {colOpt}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const updatedTables = [...tables];
                      updatedTables[tableIndex].multiplierColumns.splice(i, 1);
                      setTables(updatedTables);
                    }}
                    className="text-red-500 font-bold px-1 rounded hover:bg-red-100"
                    title="Remove multiplier column"
                    type="button"
                  >
                    ✕
                  </button>
                  {i < table.multiplierColumns.length - 1 && (
                    <span className="font-bold">×</span>
                  )}
                </div>
              ))}
              <button
                className="px-2 py-1 bg-gray-200 rounded"
                onClick={() => {
                  const updatedTables = [...tables];
                  updatedTables[tableIndex].multiplierColumns.push('');
                  setTables(updatedTables);
                }}
                type="button"
              >
                + Add
              </button>
            </div>

            {/* Table Content */}
            <div className='overflow-x-auto'>
              <table className="min-w-[800px] table-auto border">
                <thead>
                  <tr>
                    {table.columns.map((col, colIndex) => (
                      <th key={colIndex} className="border px-4 py-2 bg-gray-100">
                        <div className="flex items-center gap-2">
                          <input
                            className="font-semibold text-sm w-full border-none bg-transparent outline-none"
                            value={col}
                            onChange={(e) => {
                              const updatedColumns = [...table.columns];
                              const oldCol = updatedColumns[colIndex];
                              const newCol = e.target.value;
                              if (!newCol.trim()) return; // Prevent empty column name
                              updatedColumns[colIndex] = newCol;
                              const updatedItems = table.items.map((item) => {
                                const updatedItem = { ...item, [newCol]: item[oldCol] };
                                delete updatedItem[oldCol];
                                return updatedItem;
                              });
                              const updatedTables = [...tables];
                              updatedTables[tableIndex].columns = updatedColumns;
                              updatedTables[tableIndex].items = updatedItems;
                              setTables(updatedTables);
                            }}
                          />
                          <button
                            onClick={() => {
                              // Remove column silently (no alert)
                              removeColumn(tableIndex, col);
                            }}
                            className="text-red-500"
                            type="button"
                            title="Remove column"
                          >
                            ✕
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="border px-4 py-2 bg-gray-100">Total</th>
                    <th className="border px-4 py-2 bg-gray-100"></th>
                  </tr>
                </thead>
                <tbody>
                  {table.items.map((item, itemIndex) => (
                    <tr key={itemIndex}>
                      {table.columns.map((col, colIndex) => (
                        <td key={colIndex} className="border px-4 py-2">
                          <input
                            className="w-full outline-none bg-transparent"
                            value={item[col] as string | number}
                            onChange={(e) =>
                              updateItem(tableIndex, itemIndex, col, e.target.value)
                            }
                          />
                        </td>
                      ))}
                      <td className="border px-4 py-2 text-right">
                        <span>€{(item.total || 0).toFixed(2)}</span>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => removeItemFromTable(tableIndex, itemIndex)}
                          className="text-red-600 font-bold"
                          type="button"
                          title="Remove line item"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => addItemToTable(tableIndex)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                type="button"
              >
                + Add Row
              </button>
              <input
                type="text"
                placeholder="New column name"
                className="border rounded px-2 py-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      addColumn(tableIndex, input.value.trim());
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      })}


      <div className="text-right font-extrabold text-2xl text-white drop-shadow-lg">
        Subtotal: €{subtotal.toFixed(2)}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-purple-700 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-purple-800 transition text-lg font-semibold"
        >
          Save Quote
        </button>
      </div>
    </div>
  );
};

export default CreateQuotePage;