'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface LineItem {
  [key: string]: string | number;
}

interface Table {
  title: string;
  columns: string[];
  items: LineItem[];
}

interface Note {
  description: string;
}

const CreateQuotePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/get-current-user');
        if (!res.ok) {
          toast.error('You must be logged in to create a quote');
          return;
        }
        const data = await res.json();
        setCurrentUser(data.data);
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
    const updatedTables = [...tables];
    updatedTables[tableIndex].columns = updatedTables[tableIndex].columns.filter(col => col !== column);
    updatedTables[tableIndex].items = updatedTables[tableIndex].items.map(item => {
      const { [column]: _, ...rest } = item;
      return rest;
    });
    setTables(updatedTables);
  };

  const addItemToTable = (tableIndex: number) => {
    const newItem: LineItem = {};
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
    setTables(updatedTables);
  };

  const addNotes = () => {
    setNotes([...notes, { description: '' }]);
  };

  const subtotal = tables.reduce((sum, table) => {
    return sum + table.items.reduce((itemSum, item) => {
      const qty = Number(item['Quantity']) || 0;
      const price = Number(item['Unit Price']) || 0;
      return itemSum + qty * price;
    }, 0);
  }, 0);

  const handleSubmit = async () => {
    const quoteData = {
      customer,
      company,
      notes,
      tables,
      subtotal,
      userId: currentUser?.id
    };

    try {
      const res = await fetch('/api/create-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      if (res.ok) {
        toast.success('Quote created successfully!');
        router.push("/my-quotes")
        
      } else {
        toast.error('Failed to create quote.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 p-10 space-y-10">
      <h1 className="text-4xl font-bold text-white text-center">Create Quote</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-white text-2xl font-semibold">From</h2>
          {Object.entries(company).map(([key, val]) => (
            <input key={key} className="w-full p-2 rounded shadow border" placeholder={key} value={val} onChange={(e) => setCompany({ ...company, [key]: e.target.value })} />
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-white text-2xl font-semibold">To</h2>
          {Object.entries(customer).map(([key, val]) => (
            <input key={key} className="w-full p-2 rounded shadow border" placeholder={key} value={val} onChange={(e) => setCustomer({ ...customer, [key]: e.target.value })} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {notes.map((note, index) => (
          <div key={index} className="flex gap-3">
            <textarea className="w-full p-2 rounded shadow border" placeholder="Note" value={note.description} onChange={(e) => {
              const updatedNotes = [...notes];
              updatedNotes[index].description = e.target.value;
              setNotes(updatedNotes);
            }} />
            <button onClick={() => setNotes(notes.filter((_, i) => i !== index))} className="text-red-600 font-bold">✕</button>
          </div>
        ))}
        <button onClick={addNotes} className="text-blue-800 underline font-semibold">+ Add Note</button>
      </div>

      <button onClick={addTable} className="bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-800">+ Add Table</button>

      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="bg-white p-6 rounded-xl shadow space-y-4 overflow-x-auto">
          <input className="text-xl font-semibold w-full border-b p-2 mb-2" value={table.title} onChange={(e) => {
            const updatedTables = [...tables];
            updatedTables[tableIndex].title = e.target.value;
            setTables(updatedTables);
          }} />

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
                          updatedColumns[colIndex] = newCol;
                          const updatedItems = table.items.map(item => {
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
                      <button onClick={() => removeColumn(tableIndex, col)} className="text-red-500">✕</button>
                    </div>
                  </th>
                ))}
                <th className="border px-4 py-2 bg-gray-100 text-center"></th>
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
                        onChange={(e) => updateItem(tableIndex, itemIndex, col, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => removeItemFromTable(tableIndex, itemIndex)}
                      className="text-red-600 font-bold"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-4">
            <button onClick={() => addItemToTable(tableIndex)} className="bg-green-600 text-white px-4 py-2 rounded">+ Add Line Item</button>
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
      ))}

      <div className="text-right font-bold text-xl text-white">
        Subtotal: €{subtotal.toFixed(2)}
      </div>

      <div className="text-center">
        <button onClick={handleSubmit} className="bg-purple-700 text-white px-8 py-3 rounded hover:bg-purple-800">
          Create Quote
        </button>
      </div>
    </div>
  );
};

export default CreateQuotePage;
