

import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFilter } from "react-icons/fa6";

const SupplierLedger = () => {
  const [supplier, setSupplier] = useState([]);
  const [supplierLedger, setSupplierLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch supplier list on mount
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          setSupplier(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching suppliers:", err));
  }, []);

  // Update opening balance when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      const match = supplier.find(s => s.business_name === selectedSupplier);
      setOpeningBalance(parseFloat(match?.due_amount || 0));
    } else {
      setOpeningBalance(0);
    }
  }, [selectedSupplier, supplier]);

  // Process ledger data with running balance
  const processLedgerData = (data) => {
    let runningBalance = openingBalance;
    let totalPurchase = 0;
    let totalPayment = 0;

    const processed = data.map((dt) => {
      const purchase = parseFloat(dt.purchase_amount) || 0;
      const payment = parseFloat(dt.pay_amount) || 0;
      runningBalance += purchase - payment;
      totalPurchase += purchase;
      totalPayment += payment;

      return { 
        ...dt, 
        balance: runningBalance,
        purchase_amount: purchase,
        pay_amount: payment
      };
    });

    return {
      processedLedger: processed,
      totalPurchase,
      totalPayment,
      closingBalance: runningBalance
    };
  };

  // Fetch ledger data with date filtering
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/supplierLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const rawData = response.data.data;

          const filteredData = rawData.filter((item) => {
            // Filter by supplier
            const supplierMatch = selectedSupplier
              ? item.supplier_name === selectedSupplier
              : true;

            // Filter by date
            if (!startDate && !endDate) {
              return supplierMatch;
            }

            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0); // Normalize time to midnight

            // Single date filter
            if (startDate && !endDate) {
              const filterDate = new Date(startDate);
              filterDate.setHours(0, 0, 0, 0);
              return supplierMatch && itemDate.getTime() === filterDate.getTime();
            }

            // Date range filter
            if (startDate && endDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999); // Include entire end day
              return supplierMatch && itemDate >= start && itemDate <= end;
            }

            return supplierMatch;
          });

          setSupplierLedger(filteredData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ledger data:", error);
        setLoading(false);
      });
  }, [selectedSupplier, startDate, endDate]);

  const { processedLedger, totalPurchase, totalPayment, closingBalance } = processLedgerData(supplierLedger);

  const supplierNames = [...new Set(supplier.map(item => item.business_name).filter(Boolean))];

  // Excel export
  const exportSuppliersToExcel = () => {
    const dataToExport = processedLedger.map((item, index) => ({
      SL: index + 1,
      Date: item.date || "",
      Particulars: item.remarks || "",
      Mode: item.mode || "",
      PurchaseAmount: item.purchase_amount || 0,
      PaymentAmount: item.payment_amount || 0,
      Balance: item.balance || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Ledger");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Supplier_Ledger_${selectedSupplier || "All"}.xlsx`);
  };

  // PDF export
  const exportSuppliersToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "SL.",
      "Date",
      "Particulars",
      "Mode",
      "Purchase",
      "Payment",
      "Balance",
    ];

    const pdfRows = processedLedger.map((item, index) => [
      index + 1,
      item.date || "",
      item.remarks || "",
      item.mode || "",
      item.purchase_amount?.toFixed(2),
      item.pay_amount?.toFixed(2),
      item.balance?.toFixed(2),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: pdfRows,
      startY: 20,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
      },
      theme: "striped",
    });

    doc.save(`Supplier_Ledger_${selectedSupplier || "All"}.pdf`);
  };

  const printTable = () => {
    const content = document.getElementById("supplier-ledger-table").innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Supplier Ledger</title>
          <style>
            table, th, td { border: 1px solid black; border-collapse: collapse; }
            th, td { padding: 4px; font-size: 12px; }
            table { width: 100%; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  return (
    <main className="overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            Supplier ledger
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2"></div>
        </div>

        {/* Export and Supplier Filter */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportSuppliersToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
          
            <button
              onClick={exportSuppliersToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>
          
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap gap-4 border border-gray-300 rounded-md p-5 mb-4">
            <div className="relative w-full md:w-auto flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {startDate && (
                <button
                  onClick={() => setStartDate("")}
                  className="absolute right-8 top-[1.8rem] text-gray-600 hover:text-gray-900"
                  aria-label="Clear start date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="relative w-full md:w-auto flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {endDate && (
                <button
                  onClick={() => setEndDate("")}
                  className="absolute right-8 top-[1.8rem] text-gray-600 hover:text-gray-900"
                  aria-label="Clear end date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="relative w-full md:w-auto flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full text-gray-700 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">All Suppliers</option>
                {supplierNames.map((name, idx) => (
                  <option key={idx} value={name}>{name}</option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-9 right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>
        )}

        {/* Table */}
        <div id="supplier-ledger-table" className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr className="bg-gray-100 text-right">
                  <td colSpan="5" className="border px-2 py-1 text-center">Total</td>
                  <td className="border px-2 py-1">৳{totalPurchase.toFixed(2)}</td>
                  <td className="border px-2 py-1">৳{totalPayment.toFixed(2)}</td>
                  <td className="border px-2 py-1">৳{closingBalance.toFixed(2)}</td>
                </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Supplier Name</th>
                <th className="border border-gray-700 px-2 py-1">Particulars</th>
                <th className="border border-gray-700 px-2 py-1">Mode</th>
                <th className="border border-gray-700 px-2 py-1">Purchase</th>
                <th className="border border-gray-700 px-2 py-1">Payment</th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b">Opening Balance ৳{openingBalance.toFixed(2)}</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {processedLedger.length > 0 ? (
                processedLedger.map((dt, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 px-2 py-1 font-bold">{index + 1}.</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.date}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.supplier_name}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.remarks}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.mode}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt?.purchase_amount?.toFixed(2)}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt?.pay_amount?.toFixed(2)}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt?.balance?.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">No data found for the selected filters</td>
                </tr>
              )}
            </tbody>
            {processedLedger.length > 0 && (
              <tfoot className="font-bold text-right">
                {/* <tr className="bg-gray-100">
                  <td colSpan="5" className="border px-2 py-1 text-center">Total</td>
                  <td className="border px-2 py-1">৳{totalPurchase.toFixed(2)}</td>
                  <td className="border px-2 py-1">৳{totalPayment.toFixed(2)}</td>
                  <td className="border px-2 py-1">৳{closingBalance.toFixed(2)}</td>
                </tr> */}
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </main>
  );
};

export default SupplierLedger;