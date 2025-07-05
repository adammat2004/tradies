"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { useRouter } from "next/navigation";

/**
 * =============================
 * Types & Interfaces
 * =============================
 */
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
  multiplierColumns: string[];
  items: Item[];
}

interface Note {
  id: string;
  description: string;
}

interface Invoice {
  id: string;
  invoiceNumber?: string;
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
  dueDate?: string;
  tables: Table[];
  notes: Note[];
}

enum Steps {
  Temp1 = 0,
  Temp2 = 1,
  Temp3 = 2,
}

/**
 * =============================
 * Component
 * =============================
 */
const Page = () => {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params?.invoiceid as string;

  const [step, setStep] = useState<Steps>(Steps.Temp1);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pdfRef = useRef<HTMLDivElement>(null);

  /**
   * -----------------------------
   * Fetch Invoice by ID
   * -----------------------------
   */
  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/get-invoice-by-id/${invoiceId}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data: Invoice = await res.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  /**
   * -----------------------------
   * Download as PDF
   * -----------------------------
   */
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const data = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoice?.id}.pdf`);
  };

  /**
   * -----------------------------
   * Send Invoice via Email
   * -----------------------------
   */
  const sendEmail = async () => {
    if (!invoice?.customerEmail || !invoice?.id) return;

    try {
      const response = await fetch("/api/send-invoice-by-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invoice.customerEmail,
          invoiceId: invoice.id,
          template: step,
          companyEmail: invoice.companyEmail,
        }),
      });

      const data = await response.json();
      alert(data.success ? "Email sent successfully" : "Failed to send email");
    } catch (error) {
      console.error("Email send error:", error);
      alert("An error occurred while sending the email");
    }
  };

  /**
   * -----------------------------
   * Memoised content for PDF area
   * -----------------------------
   */
  const bodyContent = useMemo(() => {
    if (!invoice) return null;

    const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString();

    switch (step) {
      /**
       * =====================================
       * Template 1
       * =====================================
       */
      case Steps.Temp1:
        return (
          <div
            ref={pdfRef}
            className="bg-white shadow-xl pt-12 p-8 space-y-8 border border-gray-100"
          >
            {/* Customer & Company Info */}
            <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 text-sm text-gray-700">
              {/* Customer */}
              <div>
                <h2 className="font-semibold text-lg mb-2">Customer Info</h2>
                <p>
                  <strong>Name:</strong> {invoice.customerName}
                </p>
                <p>
                  <strong>Email:</strong> {invoice.customerEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {invoice.customerPhone}
                </p>
              </div>

              {/* Company */}
              <div>
                <h2 className="font-semibold text-lg mb-2">Company Info</h2>
                <p className="font-semibold">{invoice.companyName}</p>
                <p>{invoice.companyAddress}</p>
                <p>
                  {invoice.companyCity}, {invoice.companyPostalCode}, {invoice.companyCounty}
                </p>
                <p>
                  <strong>Email:</strong> {invoice.companyEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {invoice.companyPhone}
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-sm text-gray-700 space-y-1">
              {invoice.invoiceNumber && (
                <p>
                  <strong>Invoice #:</strong> {invoice.invoiceNumber}
                </p>
              )}
              <p>
                <strong>Date:</strong> {formatDate(invoice.createdAt)}
              </p>
              {invoice.dueDate && (
                <p>
                  <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
                </p>
              )}
              <p>
                <strong>Total:</strong> €{invoice.total.toFixed(2)}
              </p>
            </div>

            {/* Notes */}
            {invoice.notes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {invoice.notes.map((note) => (
                    <li key={note.id}>{note.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tables */}
            {invoice.tables.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Tables & Items
                </h2>
                {invoice.tables.map((table) => (
                  <div
                    key={table.id}
                    className="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    <h3 className="bg-gray-100 px-4 py-2 text-md font-semibold">
                      {table.title}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {table.columns.map((column) => (
                              <th
                                key={column}
                                className="px-4 py-2 text-left border"
                              >
                                {column}
                              </th>
                            ))}
                            <th className="px-4 py-2 text-left border">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.items.map((item) => (
                            <tr key={item.id} className="border-t">
                              {table.columns.map((column) => (
                                <td key={column} className="px-4 py-2 border">
                                  {item.data[column] || ""}
                                </td>
                              ))}
                              <td className="px-4 py-2 border">
                                {item.data["total"] || ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /**
       * =====================================
       * Template 2
       * =====================================
       */
      case Steps.Temp2:
        return (
          <div
            ref={pdfRef}
            className="bg-white rounded-xl border border-gray-200 p-6 md:p-10 shadow-md space-y-8 md:space-y-10"
          >
            {/* Company & Invoice Info */}
            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-0">
              {/* Company */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {invoice.companyName}
                </h2>
                <p className="text-sm text-gray-600">{invoice.companyAddress}</p>
                <p className="text-sm text-gray-600">
                  {invoice.companyCity}, {invoice.companyPostalCode}
                </p>
                <p className="text-sm text-gray-600">{invoice.companyCounty}</p>
              </div>

              {/* Invoice meta */}
              <div className="text-sm text-gray-600 md:text-right space-y-1">
                {invoice.invoiceNumber && (
                  <p>
                    <strong>Invoice #:</strong> {invoice.invoiceNumber}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {formatDate(invoice.createdAt)}
                </p>
                {invoice.dueDate && (
                  <p>
                    <strong>Due:</strong> {formatDate(invoice.dueDate)}
                  </p>
                )}

              </div>
            </div>

            {/* Customer & Company Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-1">Customer</h3>
                <p className="font-medium">{invoice.customerName}</p>
                <p>{invoice.customerEmail}</p>
                <p>{invoice.customerPhone}</p>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-1">Company Contact</h3>
                <p>{invoice.companyEmail}</p>
                <p>{invoice.companyPhone}</p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes.length > 0 && (
              <div>
                <h3 className="text-base font-semibold mb-2">Notes</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {invoice.notes.map((note) => (
                    <li key={note.id}>{note.description}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tables */}
            {invoice.tables.map((table) => (
              <div key={table.id}>
                <h4 className="font-semibold text-base mb-2">{table.title}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        {table.columns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 border border-gray-300 text-left whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                        <th className="px-3 py-2 border border-gray-300 text-left whitespace-nowrap">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          {table.columns.map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 border border-gray-200 whitespace-nowrap"
                            >
                              {item.data[col] || ""}
                            </td>
                          ))}
                          <td className="px-3 py-2 border border-gray-200 whitespace-nowrap">
                            {item.data["total"] || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="text-right text-lg md:text-xl font-bold text-gray-700">
              Total: €{invoice.total.toFixed(2)}
            </div>
          </div>
        );

      /**
       * =====================================
       * Template 3
       * =====================================
       */
      case Steps.Temp3:
        return (
          <div
            ref={pdfRef}
            className="bg-white rounded-xl p-10 border-2 border-blue-100 shadow-sm space-y-6"
          >
            <div className="lg:mx-12 space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold text-blue-700">
                  {invoice.companyName}
                </h2>
                <p className="text-sm text-gray-500">
                  {invoice.companyEmail} | {invoice.companyPhone}
                </p>
                <p className="text-sm text-gray-500">
                  {invoice.companyAddress}, {invoice.companyCity}
                </p>
              </div>

              {/* Customer & Invoice Info */}
              <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-6 text-sm">
                {/* Customer */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Customer Info</h3>
                  <p>{invoice.customerName}</p>
                  <p>{invoice.customerEmail}</p>
                  <p>{invoice.customerPhone}</p>
                </div>

                {/* Invoice Meta */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Invoice Info</h3>
                  {invoice.invoiceNumber && (
                    <p>
                      <strong>#</strong> {invoice.invoiceNumber}
                    </p>
                  )}
                  <p>
                    <strong>ID:</strong> {invoice.id}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(invoice.createdAt)}
                  </p>
                  {invoice.dueDate && (
                    <p>
                      <strong>Due:</strong> {formatDate(invoice.dueDate)}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes.length > 0 && (
                <div className="pt-6 pb-6">
                  <h4 className="font-semibold pb-1 text-gray-700">Notes</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {invoice.notes.map((note) => (
                      <li key={note.id}>{note.description}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tables */}
              {invoice.tables.map((table) => (
                <div key={table.id} className="space-y-2">
                  <h4 className="text-md font-semibold text-blue-600">
                    {table.title}
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border border-blue-200">
                      <thead className="bg-blue-50 text-blue-800 font-semibold">
                        <tr>
                          {table.columns.map((col) => (
                            <th key={col} className="p-2 border border-blue-200 text-left">
                              {col}
                            </th>
                          ))}
                          <th className="p-2 border border-blue-200 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.items.map((item) => (
                          <tr key={item.id} className="border-t border-blue-100">
                            {table.columns.map((col) => (
                              <td key={col} className="p-2 border border-blue-100">
                                {item.data[col] || ""}
                              </td>
                            ))}
                            <td className="p-2 border border-blue-100">
                              {item.data["total"] || ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="text-right text-lg font-semibold text-blue-700">
                Total Due: €{invoice.total.toFixed(2)}
              </div>
            </div>
          </div>
        );

      /** Default (should never hit) */
      default:
        return null;
    }
  }, [step, invoice]);

  /**
   * -----------------------------
   * Render States
   * -----------------------------
   */
  if (!invoiceId) return <p className="text-center text-red-600">Invalid invoice ID</p>;
  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;
  if (!invoice) return <p className="text-center">No invoice found.</p>;

  /**
   * -----------------------------
   * Main Return
   * -----------------------------
   */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      {/* Template chooser */}
      <div>
        <h1 className="font-serif text-2xl">Choose Template</h1>
        <div className="flex sm:flex-row font-serif flex-col gap-4 mb-4">
          {Object.values(Steps)
            .filter((v) => typeof v === "number")
            .map((value) => (
              <button
                key={value as number}
                onClick={() => setStep(value as Steps)}
                className={`${
                  step === value
                    ? "bg-blue-600 text-white shadow hover:bg-blue-700"
                    : "bg-white"
                } px-4 py-2 rounded-lg`}
              >
                Template {(value as number) + 1}
              </button>
            ))}
        </div>
      </div>

      {/* PDF Content */}
      {bodyContent}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end mb-4 pt-6">
        <button
          onClick={() => router.push(`/edit-invoice/${invoice.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
        >
          Edit Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md"
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
