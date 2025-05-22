'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

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
}

enum Steps {
  Temp1 = 0,
  Temp2 = 1,
  Temp3 = 2,
}

const Page = () => {
  const params = useParams();
  const quoteId = params?.quoteid as string;
  const [step, setStep] = useState(Steps.Temp1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quoteId) return;

    const fetchQuote = async () => {
      try {
        const res = await fetch(`/api/get-quote-by-id/${quoteId}`);
        if (!res.ok) throw new Error('Failed to fetch quote');
        const data: Quote = await res.json();
        setQuote(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`quote-${quote?.id}.pdf`);
  };

  const sendEmail = async () => {
    if (!quote?.customerEmail || !quote?.id) return;

    try {
      const response = await fetch('/api/send-quote-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: quote.customerEmail, quoteId: quote.id, template: step, companyEmail: quote.companyEmail }),
      });

      const data = await response.json();
      alert(data.success ? 'Email sent successfully' : 'Failed to send email');
    } catch (error) {
      console.error('Email send error:', error);
      alert('An error occurred while sending the email');
    }
  };

  const bodyContent = useMemo(() => {
    if (!quote) return null;

    switch (step) {
      case Steps.Temp1:
        return (
          <div ref={pdfRef} className="bg-white shadow-xl pt-12 p-8 space-y-8 border border-gray-100">
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

            <div>
              {quote.tables.length > 0 && (
                <>
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
                </>
              )}
            </div>


          </div>
        );
      case Steps.Temp2:
        return (
          <div ref={pdfRef} className="bg-white rounded-xl border border-gray-200 p-10 shadow-md space-y-10">
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
            {quote.notes.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2">Notes</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {quote.notes.map(note => <li key={note.id}>{note.description}</li>)}
                </ul>
              </div>
            )}

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

          </div>
        );
      case Steps.Temp3:
        return (
          <div ref={pdfRef} className="bg-white rounded-xl p-10 border-2 border-blue-100 shadow-sm space-y-6">
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
              {quote.notes.length > 0 && (
                <div className='pt-6 pb-6'>  
                  <h4 className="font-semibold pb-1 text-gray-700">Notes</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {quote.notes.map(note => (
                      <li key={note.id}>{note.description}</li>
                    ))}
                  </ul>
                </div>
              )}

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

            </div>
          </div>
        );
      default:
        return null;
    }
  }, [step, quote]);

  if (!quoteId) return <p className="text-center text-red-600">Invalid quote ID</p>;
  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;
  if (!quote) return <p className="text-center">No quote found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <div>
        <h1 className="font-serif text-2xl">Choose Template</h1>
        <div className="flex sm:flex-row font-serif flex-col gap-4 mb-4">
          {Object.values(Steps).filter((v) => typeof v === 'number').map((value) => (
            <button
              key={value}
              onClick={() => setStep(value as Steps)}
              className={`${
                step === value ? 'bg-blue-600 text-white shadow hover:bg-blue-700' : 'bg-white'
              } px-4 py-2 rounded-lg`}
            >
              Template {Number(value) + 1}
            </button>
          ))}
        </div>
      </div>

      {bodyContent}

      <div className="flex gap-4 justify-end mb-4 pt-6">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          Save as PDF
        </button>
        <button
          onClick={sendEmail}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          Send Via Email
        </button>
      </div>
    </div>
  );
};

export default Page;
