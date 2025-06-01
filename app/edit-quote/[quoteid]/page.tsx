'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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

interface QuoteData {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  company: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    county: string;
    email: string;
    phone: string;
  };
  notes: Note[];
  tables: Table[];
}

const EditQuotePage = () => {
  const params = useParams();
  const quoteId = params?.quoteid as string
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quote data states
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [company, setCompany] = useState({ name: '', address: '', city: '', postalCode: '', county: '', email: '', phone: '' });
  const [notes, setNotes] = useState<Note[]>([]);
  const [tables, setTables] = useState<Table[]>([]);

  // Fetch current user and quote on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user
        const userRes = await fetch('/api/get-current-user');
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        setCurrentUser(userData.data);

        // Fetch existing quote by id
        const quoteRes = await fetch(`/api/get-quote-by-id/${quoteId}`);
        if (!quoteRes.ok) throw new Error('Failed to fetch quote');
        const quoteData = await quoteRes.json();
        // Set states with fetched quote data
        setCustomer({
          name: quoteData.customerName,
          email: quoteData.customerEmail,
          phone: quoteData.customerPhone,
        });
        setCompany({
          name: quoteData.companyName,
          address: quoteData.companyAddress,
          city: quoteData.companyCity,
          postalCode: quoteData.companyPostalCode,
          county: quoteData.companyCounty,
          email: quoteData.companyEmail,
          phone: quoteData.companyPhone,
        });

        setNotes(quoteData.notes);
        setTables(
          (quoteData.tables || []).map((table: any) => ({
            ...table,
            items: (table.items || []).map((item: any) => ({
              ...item.data,
              total: item.data.total || 0,
              _id: item.id,
              tableId: item.tableId,
            })),
          }))
        );

        console.log("tables", tables)
      } catch (error) {
        toast.error('Failed to load quote or user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quoteId]);

  // Functions for notes
  const addNotes = () => setNotes([...notes, { description: '' }]);
  const removeNote = (index: number) => setNotes(notes.filter((_, i) => i !== index));
  const updateNote = (index: number, value: string) => {
    const updatedNotes = [...notes];
    updatedNotes[index].description = value;
    setNotes(updatedNotes);
  };

  // Functions for tables (same as create)
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
    const product = updatedTables[tableIndex].multiplierColumns.reduce((acc, col) => {
      const num = parseFloat(item[col] as string) || 0;
      return acc * num;
    }, 1);
    item.total = product;

    setTables(updatedTables);
  };

  // Calculate subtotal
  const subtotal = tables.reduce((sum, table) => {
    return sum + table.items.reduce((itemSum, item) => itemSum + (Number(item.total) || 0), 0);
  }, 0);

  // Handle update quote submit
  const handleSubmit = async () => {
    const updatedQuote = {
      customer,
      company,
      notes,
      tables,
      subtotal,
      userId: currentUser?.id,
      id: quoteId, // Include quote ID for update
    };

    try {
      const res = await fetch(`/api/update-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuote),
      });

      if (res.ok) {
        toast.success('Quote updated successfully!');
        router.push('/my-quotes');
      } else {
        toast.error('Failed to update quote.');
      }
    } catch (error) {
      toast.error('An error occurred while updating the quote.');
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

  if (!currentUser) {
    return (
      <div className="text-xl font-serif text-center">
        You must be logged in to edit a quote.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 p-12 space-y-12">
      <h1 className="text-5xl font-extrabold text-white text-center mb-8 drop-shadow-lg">Edit Quote</h1>

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
              onChange={(e) => updateNote(index, e.target.value)}
            />
            <button
              onClick={() => removeNote(index)}
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
            {/* Table Title */}
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
            {isTitleEmpty && <p className="text-red-500 text-sm mb-2">Table title is required</p>}

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

            <table className="min-w-full table-auto border">
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
                            if (!newCol.trim()) return;
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
                          onClick={() => removeColumn(tableIndex, col)}
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

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => addItemToTable(tableIndex)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                type="button"
              >
                + Add Row
              </button>
              <button
                onClick={() => {
                  const newCol = prompt('Enter new column name');
                  if (newCol && newCol.trim()) {
                    addColumn(tableIndex, newCol.trim());
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                type="button"
              >
                + Add Column
              </button>
            </div>
          </div>
        );
      })}
      <div className="text-right font-extrabold text-2xl text-white drop-shadow-lg">
        Subtotal: €{subtotal.toFixed(2)}
      </div>

      <button
        onClick={handleSubmit}
        className="bg-purple-900 text-white text-xl rounded-xl py-4 px-8 mt-12 mx-auto block shadow-lg hover:bg-purple-800 transition"
      >
        Update Quote
      </button>
    </div>
  );
};

export default EditQuotePage;
