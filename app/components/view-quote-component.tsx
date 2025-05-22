'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  data: {
    [key: string]: string | number;
  };
}

interface Table {
  id: string;
  title: string;
  columns: string[];
  items: Item[];
}

interface Note {
  id: string;
  description: string;
}

interface Quote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyCounty: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  tables: Table[];
  notes: Note[];
  template: number;
}

const ViewQuoteClient = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!searchParams) return;

    const token = searchParams.get("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/get-quote-by-token?token=${token}`);
        if (!res.ok) throw new Error("Failed to fetch quote");
        const data = await res.json();
        setQuote(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [searchParams]);

  if (loading) return <div>Loading ...</div>;
  if (!quote) return <div><h1>No Quote Found</h1></div>;

  let bodyContent = (
    <div className="bg-white shadow-xl pt-12 p-8 space-y-8 border border-gray-100 h-screen">
      <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 text-sm text-gray-700">
        <div>
          <h2 className="font-semibold text-lg mb-2">Customer Info</h2>
          <p><strong>Name:</strong> {quote.customerName}</p>
          <p><strong>Email:</strong> {quote.customerEmail}</p>
          <p><strong>Phone:</strong> {quote.customerPhone}</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg mb-2">Company Info</h2>
          <p><strong>{quote.companyName}</strong></p>
          <p>{quote.companyAddress}</p>
          <p>{quote.companyCity}, {quote.companyPostalCode}, {quote.companyCounty}</p>
          <p><strong>Email:</strong> {quote.companyEmail}</p>
          <p><strong>Phone:</strong> {quote.companyPhone}</p>
        </div>
      </div>

      <div className="text-sm text-gray-700">
        <p><strong>Total:</strong> ${quote.total.toFixed(2)}</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tables & Items</h2>
        {quote.tables.map((table) => (
          <div key={table.id} className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <h3 className="bg-gray-100 px-4 py-2 text-md font-semibold">{table.title}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {table.columns.map((column) => (
                      <th key={column} className="px-4 py-2 text-left border">{column}</th>
                    ))}
                    <th className="px-4 py-2 text-left border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {table.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      {table.columns.map((column) => (
                        <td key={column} className="px-4 py-2 border">
                          {item.data[column] || ''}
                        </td>
                      ))}
                      <td className="px-4 py-2 border">
                        {item.data['Quantity'] && item.data['Unit Price']
                          ? (Number(item.data['Quantity']) * Number(item.data['Unit Price'])).toFixed(2)
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {quote.notes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {quote.notes.map((note) => (
              <li key={note.id}>{note.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (quote.template === 1) {
    bodyContent = (
      <div className="bg-white border h-screen border-gray-200 p-10 shadow-md space-y-10">
        <div className="flex justify-between flex-col md:flex-row gap-6 md:gap-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{quote.companyName}</h2>
            <p className="text-sm text-gray-600">{quote.companyAddress}</p>
            <p className="text-sm text-gray-600">{quote.companyCity}, {quote.companyPostalCode}</p>
            <p className="text-sm text-gray-600">{quote.companyCounty}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p><strong>Quote ID:</strong> {quote.id}</p>
            <p><strong>Date:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-8 text-sm text-gray-700">
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer</h3>
            <p><strong>{quote.customerName}</strong></p>
            <p>{quote.customerEmail}</p>
            <p>{quote.customerPhone}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Company Contact</h3>
            <p>{quote.companyEmail}</p>
            <p>{quote.companyPhone}</p>
          </div>
        </div>

        {quote.tables.map((table) => (
          <div key={table.id}>
            <h4 className="font-semibold text-md mb-2">{table.title}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    {table.columns.map((col) => (
                      <th key={col} className="px-3 py-2 border border-gray-300 text-left">{col}</th>
                    ))}
                    <th className="px-3 py-2 border border-gray-300 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {table.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200">
                      {table.columns.map((col) => (
                        <td key={col} className="px-3 py-2 border border-gray-200">{item.data[col] || ''}</td>
                      ))}
                      <td className="px-3 py-2 border border-gray-200">
                        {item.data["Quantity"] && item.data["Unit Price"]
                          ? (Number(item.data["Quantity"]) * Number(item.data["Unit Price"])).toFixed(2)
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="text-right text-xl font-bold text-gray-700">
          Total: ${quote.total.toFixed(2)}
        </div>

        {quote.notes.length > 0 && (
          <div>
            <h3 className="text-md font-semibold mb-2">Notes</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {quote.notes.map(note => <li key={note.id}>{note.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (quote.template === 2) {
    bodyContent = (
      <div className="bg-white p-10 h-screen border-2 border-blue-100 shadow-sm space-y-6">
        <div className="lg:mx-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-blue-700">{quote.companyName}</h2>
            <p className="text-sm text-gray-500">{quote.companyEmail} | {quote.companyPhone}</p>
            <p className="text-sm text-gray-500">{quote.companyAddress}, {quote.companyCity}</p>
          </div>

          <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Customer Info</h3>
              <p>{quote.customerName}</p>
              <p>{quote.customerEmail}</p>
              <p>{quote.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Quote Info</h3>
              <p><strong>ID:</strong> {quote.id}</p>
              <p><strong>Date:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {quote.tables.map((table) => (
            <div key={table.id} className="space-y-2">
              <h4 className="text-md font-semibold text-blue-600">{table.title}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border border-blue-200">
                  <thead className="bg-blue-50 text-blue-800 font-semibold">
                    <tr>
                      {table.columns.map(col => (
                        <th key={col} className="p-2 border border-blue-200 text-left">{col}</th>
                      ))}
                      <th className="p-2 border border-blue-200 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.items.map((item) => (
                      <tr key={item.id} className="border-t border-blue-100">
                        {table.columns.map((col) => (
                          <td key={col} className="p-2 border border-blue-100">{item.data[col] || ''}</td>
                        ))}
                        <td className="p-2 border border-blue-100">
                          {item.data["Quantity"] && item.data["Unit Price"]
                            ? (Number(item.data["Quantity"]) * Number(item.data["Unit Price"])).toFixed(2)
                            : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="text-right text-lg font-semibold text-blue-700">
            Total Due: ${quote.total.toFixed(2)}
          </div>

          {quote.notes.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700">Notes</h4>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {quote.notes.map(note => (
                  <li key={note.id}>{note.description}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>{bodyContent}</div>;
};

export default ViewQuoteClient;
