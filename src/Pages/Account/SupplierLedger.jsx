

// import axios from "axios";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { useEffect, useState } from "react";
// import { Toaster } from "react-hot-toast";
// import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
// import { MdOutlineArrowDropDown } from "react-icons/md";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { FaFilter } from "react-icons/fa6";
// import { Button } from "antd";
// import DatePicker from "react-datepicker";
// import { tableFormatDate } from "../../components/Shared/formatDate";
// import api from "../../utils/axiosConfig";

// const SupplierLedger = () => {
//   const [supplier, setSupplier] = useState([]);
//   const [supplierLedger, setSupplierLedger] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSupplier, setSelectedSupplier] = useState("");
//   const [openingBalance, setOpeningBalance] = useState(0);
//   const [showFilter, setShowFilter] = useState(false);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     api
//       .get(`/supplier`)
//       .then((res) => {
//         if (res.data.status === "Success") {
//           setSupplier(res.data.data);
//         }
//       })
//       .catch((err) => console.error("সরবরাহকারীর তথ্য লোডে ত্রুটি:", err));
//   }, []);

//   useEffect(() => {
//     if (selectedSupplier) {
//       const match = supplier.find(s => s.business_name === selectedSupplier);
//       setOpeningBalance(parseFloat(match?.due_amount || 0));
//     } else {
//       setOpeningBalance(0);
//     }
//   }, [selectedSupplier, supplier]);

//   const processLedgerData = (data) => {
//     let runningBalance = openingBalance;
//     let totalPurchase = 0;
//     let totalPayment = 0;

//     const processed = data.map((dt) => {
//       const purchase = parseFloat(dt.purchase_amount) || 0;
//       const payment = parseFloat(dt.pay_amount) || 0;
//       runningBalance += purchase - payment;
//       totalPurchase += purchase;
//       totalPayment += payment;

//       return {
//         ...dt,
//         balance: runningBalance,
//         purchase_amount: purchase,
//         pay_amount: payment
//       };
//     });

//     return {
//       processedLedger: processed,
//       totalPurchase,
//       totalPayment,
//       closingBalance: runningBalance
//     };
//   };

//   useEffect(() => {
//     setLoading(true);
//     api
//       .get(`/supplierLedger`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           const rawData = response.data.data;
//           const filteredData = rawData.filter((item) => {
//             const supplierMatch = selectedSupplier ? item.supplier_name === selectedSupplier : true;

//             if (!startDate && !endDate) return supplierMatch;

//             const itemDate = new Date(item.date);
//             itemDate.setHours(0, 0, 0, 0);

//             if (startDate && !endDate) {
//               const filterDate = new Date(startDate);
//               filterDate.setHours(0, 0, 0, 0);
//               return supplierMatch && itemDate.getTime() === filterDate.getTime();
//             }

//             if (startDate && endDate) {
//               const start = new Date(startDate);
//               start.setHours(0, 0, 0, 0);
//               const end = new Date(endDate);
//               end.setHours(23, 59, 59, 999);
//               return supplierMatch && itemDate >= start && itemDate <= end;
//             }

//             return supplierMatch;
//           });

//           setSupplierLedger(filteredData);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("লেজার ডাটা লোডে ত্রুটি:", error);
//         setLoading(false);
//       });
//   }, [selectedSupplier, startDate, endDate]);

//   const { processedLedger, totalPurchase, totalPayment, closingBalance } = processLedgerData(supplierLedger);

//   const supplierNames = [...new Set(supplier.map(item => item.business_name).filter(Boolean))];

//   const exportSuppliersToExcel = () => {
//     const dataToExport = processedLedger.map((item, index) => ({
//       ক্রম: index + 1,
//       তারিখ: item.date || "",
//       বিবরণ: item.remarks || "",
//       পদ্ধতি: item.mode || "",
//       ক্রয়: item.purchase_amount || 0,
//       পেমেন্ট: item.pay_amount || 0,
//       ব্যালেন্স: item.balance || 0
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Ledger");

//     const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, `Supplier_Ledger_${selectedSupplier || "All"}.xlsx`);
//   };

//   const exportSuppliersToPDF = () => {
//     const doc = new jsPDF();
//     const tableColumn = ["ক্রম", "তারিখ", "সরবরাহকারীর নাম", "বিবরণ", "পদ্ধতি", "ক্রয়", "পেমেন্ট", "ব্যালেন্স"];
//     const pdfRows = processedLedger.map((item, index) => [
//       index + 1,
//       item.date || "",
//       item.supplier_name,
//       item.remarks || "",
//       item.mode || "",
//       item.purchase_amount,
//       item.pay_amount,
//       item.balance,
//     ]);

//     autoTable(doc, {
//       head: [tableColumn],
//       body: pdfRows,
//       startY: 20,
//       styles: { fontSize: 8, cellPadding: 2 },
//       headStyles: { fillColor: [17, 55, 91], textColor: [255, 255, 255] },
//       theme: "striped",
//     });

//     doc.save(`Supplier_Ledger_${selectedSupplier || "All"}.pdf`);
//   };

//   const printTable = () => {
//     const content = document.getElementById("supplier-ledger-table").innerHTML;
//     const printWindow = window.open("", "", "width=900,height=700");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>সরবরাহকারী লেজার প্রিন্ট</title>
//           <style>
//             table, th, td { border: 1px solid black; border-collapse: collapse; }
//             th, td { padding: 4px; font-size: 12px; }
//             table { width: 100%; }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   if (loading) return <p className="text-center mt-16">ডাটা লোড হচ্ছে...</p>;

//   return (
//     <main className="overflow-hidden">
//       <Toaster />
//       <div className="w-xs md:w-full overflow-hidden  mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
//             সাপ্লায়ার লেজার
//           </h1>
//         </div>

//         <div className="md:flex items-center justify-between mb-4">
//           <div className="flex gap-1 md:gap-3 flex-wrap">
//             <button onClick={exportSuppliersToExcel} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaFileExcel /> এক্সেল
//             </button>
//             <button onClick={exportSuppliersToPDF} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaFilePdf /> পিডিএফ
//             </button>
//             <button onClick={printTable} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaPrint /> প্রিন্ট
//             </button>
//           </div>
//           <div className="flex gap-2">
//             <button onClick={() => setShowFilter((prev) => !prev)} className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300">
//               <FaFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>

//         {showFilter && (
//           <div className="md:flex items-center gap-4 border border-gray-300 rounded-md p-5 mb-4">
//             <DatePicker
//               selected={startDate}
//               onChange={(date) => setStartDate(date)}
//               selectsStart
//               startDate={startDate}
//               endDate={endDate}
//               dateFormat="dd/MM/yyyy"
//               placeholderText="শুরুর তারিখ"
//               locale="en-GB"
//               className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//               isClearable
//             />

//             <DatePicker
//               selected={endDate}
//               onChange={(date) => setEndDate(date)}
//               selectsEnd
//               startDate={startDate}
//               endDate={endDate}
//               minDate={startDate}
//               dateFormat="dd/MM/yyyy"
//               placeholderText="শেষ তারিখ"
//               locale="en-GB"
//               className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//               isClearable
//             />

//             <div className="w-full">
//               <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full text-gray-700 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none">
//                 <option value="">সকল সাপ্লায়ার</option>
//                 {supplierNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
//               </select>
//               <MdOutlineArrowDropDown className="absolute top-9 right-2 pointer-events-none text-xl text-gray-500" />
//             </div>
//             <Button
//               type="primary"
//               onClick={() => {
//                 setStartDate("");
//                 setEndDate("");
//                 setShowFilter(false);
//                 setCurrentPage(1);
//               }}
//               icon={<FaFilter />}
//               className="!bg-primary !text-white"
//             >
//               মুছে ফেলুন
//             </Button>
//           </div>

//         )}

//         <div id="supplier-ledger-table" className="w-full mt-5 overflow-x-auto border border-gray-200">
//           <table className="w-full text-sm text-left">
//             <thead className="text-black capitalize font-bold">
//               <tr className="bg-gray-100 text-right">
//                 <td colSpan="5" className="border px-2 py-1 text-center">মোট</td>
//                 <td className="border px-2 py-1">৳{totalPurchase}</td>
//                 <td className="border px-2 py-1">৳{totalPayment}</td>
//                 <td className="border px-2 py-1">৳{closingBalance}</td>
//               </tr>
//               <tr>
//                 <th className="border border-gray-700 px-2 py-1">ক্রম</th>
//                 <th className="border border-gray-700 px-2 py-1">তারিখ</th>
//                 <th className="border border-gray-700 px-2 py-1">সাপ্লায়ার নাম</th>
//                 <th className="border border-gray-700 px-2 py-1">বিবরণ</th>
//                 <th className="border border-gray-700 px-2 py-1">পদ্ধতি</th>
//                 <th className="border border-gray-700 px-2 py-1">ক্রয়</th>
//                 <th className="border border-gray-700 px-2 py-1">পেমেন্ট</th>
//                 <th className="border border-gray-700 py-1 text-center">
//                   <p className="border-b">প্রারম্ভিক ব্যালেন্স ৳{openingBalance}</p>
//                   ব্যালেন্স
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="text-black font-semibold">
//               {processedLedger.length > 0 ? (
//                 processedLedger.map((dt, index) => (
//                   <tr key={index} className="hover:bg-gray-50 transition-all">
//                     <td className="border border-gray-700 px-2 py-1 font-bold">{index + 1}.</td>
//                     <td className="border border-gray-700 px-2 py-1">{tableFormatDate(dt.date)}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt.supplier_name}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt.remarks}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt.mode}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt?.purchase_amount}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt?.pay_amount}</td>
//                     <td className="border border-gray-700 px-2 py-1">{dt?.balance}</td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" className="text-center py-4">নির্বাচিত ফিল্টারের জন্য কোন ডাটা পাওয়া যায়নি</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default SupplierLedger;



import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../utils/axiosConfig";
import { FaFilter } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import { Button } from "antd";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { toNumber } from "../../hooks/toNumber";


const SupplierLedger = () => {
  const [supplies, setSupplies] = useState([]); // Supplier dropdown options
  const [supplierLedger, setSupplierLedger] = useState([]); // Ledger data for table
  const [loading, setLoading] = useState(true); // Loading state
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
const [filteredLedger, setFilteredLedger] = useState([]);
const toDate = (d) => {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed) ? null : parsed;
};


  // Fetch supplies list
  useEffect(() => {
    api.get(`/supplier`)
      .then((response) => {
        if (response.data.success) {
          setSupplies(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching supplies:", error);
      });
  }, []);

  // Fetch full ledger on mount
  useEffect(() => {
    setLoading(true);
    api.get(`/supplierLedger`)
      .then((response) => {
        if (response.data.status === "Success") {
          setSupplierLedger(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching ledger data:", error);
        setLoading(false);
      });
  }, []);

//  filter ledger data based on selected supplier and date range
  useEffect(() => {
  const filtered = supplierLedger.filter((item) => {
    const supplierMatch = selectedSupplier
      ? item.supplier_name === selectedSupplier
      : true;

    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);

    // No date filter
    if (!startDate && !endDate) return supplierMatch;

    // Only start date
    if (startDate && !endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      return supplierMatch && itemDate.getTime() === start.getTime();
    }

    // Range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      return supplierMatch && itemDate >= start && itemDate <= end;
    }

    return supplierMatch;
  });

  setFilteredLedger(filtered);
}, [supplierLedger, selectedSupplier, startDate, endDate]);

  
  useEffect(() => {
    if (selectedSupplier) {
      // Find the selected supplier to get their due_amount
      const selectedSupply = supplies.find(
        (supply) => supply.supplier_name === selectedSupplier
      );

      if (selectedSupply) {
        // Set opening balance from supplier's due_amount
        const newOpeningBalance = parseFloat(selectedSupply.due_amount) || 0;
        setOpeningBalance(newOpeningBalance);
        setCurrentBalance(newOpeningBalance);
      }

      // Filter ledger data by selected supplier
      api.get(`/supplierLedger`)
        .then((response) => {
          if (response.data.status === "Success") {
            const filtered = response.data.data.filter(
              (item) => item.supplier_name === selectedSupplier
            );
            setSupplierLedger(filtered);
          }
        })
        .catch((error) => {
          console.error("Error fetching ledger data:", error);
        });
    } else {
      // Reset to show all ledger data when no supplier is selected
      setOpeningBalance(0);
      setCurrentBalance(0);
      api.get(`/supplierLedger`)
        .then((response) => {
          if (response.data.status === "Success") {
            setSupplierLedger(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching ledger data:", error);
        });
    }
  }, [selectedSupplier, supplies]);

  const totalPurchase = filteredLedger.reduce(
  (sum, item) => sum + (toNumber(item.purchase_amount) || 0),
  0
);

const totalPayment = filteredLedger.reduce(
  (sum, item) => sum + (toNumber(item.pay_amount) || 0),
  0
);

  //  Excel Export
  const exportExcel = () => {
    const tableData = ledgerWithBalance.map((item, index) => ({
      SL: index + 1,
      Date: item?.date,
      Supplier: item?.supplier_name,
      Particulars: item?.remarks || "",
      Mode: item?.mode || "",
      PurchaseAmount: toNumber(item?.purchase_amount) || "",
      PaymentAmount: toNumber(item?.pay_amount) || "",
      Balance: toNumber(item?.runningBalance) || "",
    }));

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier Ledger");
    XLSX.writeFile(wb, "Supplier_Ledger.xlsx");

    toast.success("Excel file downloaded!");
  };

  //  PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Supplier Ledger", 14, 15);

    autoTable(doc, {
      head: [["SL", "Date", "Particulars", "Mode", "Purchase", "Payment", "Balance"]],
      body: ledgerWithBalance.map((item, index) => [
        index + 1,
        item.date,
        item.remarks || "",
        item.mode || "",
        item?.purchase_amount || 0,
        item?.pay_amount || 0,
        item?.runningBalance || 0,
      ]),
      startY: 25,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 55, 91], textColor: 255 },
    });

    doc.save("Supplier_Ledger.pdf");
    toast.success("PDF downloaded!");
  };

  //  Print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; color: #11375B; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #333; padding: 6px; font-size: 12px; }
            thead { background: #11375B; color: white; }
            tr:nth-child(even) { background: #f9f9f9; }
            tr:hover { background: #f1f5f9; }
            .footer { margin-top: 20px; text-align: right; font-size: 12px; }
            thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
          </style>
        </head>
        <body>
          <h2>Supplier Ledger</h2>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Particulars</th>
                <th>Mode</th>
                <th>Purchase</th>
                <th>Payment</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerWithBalance
        .map(
          (item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item?.date}</td>
                  <td>${item?.supplier_name}</td>
                  <td>${item?.remarks || "--"}</td>
                  <td>${item?.mode || "--"}</td>
                  <td>${item?.purchase_amount || 0}</td>
                  <td>${item?.pay_amount || 0}</td>
                  <td>${item?.runningBalance || 0}</td>
                </tr>`
        )
        .join("")}
            </tbody>
          </table>
          <div class="footer">
            Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  // Calculate running balance
  const calculateRunningBalance = () => {
    let balance = openingBalance;
    return filteredLedger.map((item) => {
      const purchase = toNumber(item.purchase_amount) || 0;
      const payment = toNumber(item.pay_amount) || 0;
      balance += purchase - payment;
      return {
        ...item,
        runningBalance: balance
      };
    });
  };

  const ledgerWithBalance = calculateRunningBalance();

  // Closing balance 
  const closingBalance =
    ledgerWithBalance.length > 0
      ? ledgerWithBalance[ledgerWithBalance.length - 1].runningBalance
      : openingBalance;

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  return (
    <main className="p-2 overflow-hidden">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-3">
            সাপ্লায়ার লেজার
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2"></div>
        </div>

        {/* Export and Supplier Filter */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 text-gray-700 md:gap-3 flex-wrap">
            <button onClick={exportExcel} className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer">
              এক্সেল
            </button>
            {/* <button onClick={exportPDF} className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer">
              PDF
            </button> */}
            <button onClick={printTable} className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer">
              প্রিন্ট
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowFilter((prev) => !prev)} className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300">
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="md:flex items-center gap-4 border border-gray-300 rounded-md p-5 mb-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="শুরুর তারিখ"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />

            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="শেষ তারিখ"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />

            <div className="mt-3 md:mt-0 w-full relative">
              {/* <label className="text-gray-700 text-sm font-semibold">
              Select Supplier Ledger
            </label> */}
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className=" w-full text-gray-700 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">সকল সাপ্লায়ার</option>
                {supplies.map((supply, idx) => (
                  <option key={idx} value={supply.supplier_name}>
                    {supply.supplier_name}
                    {/* (Due: {supply.due_amount}) */}
                  </option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[14px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
            <Button
              type="primary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setShowFilter(false);
                setCurrentPage(1);
              }}
              icon={<FaFilter />}
              className="!bg-primary !text-white"
            >
              মুছে ফেলুন
            </Button>
          </div>

        )}

        {/* Table */}
        <div className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr>

                <td colSpan="5" className="border px-2 py-1 text-center">মোট</td>
                <td className="border px-2 py-1">৳{totalPurchase}</td>
                <td className="border px-2 py-1">৳{totalPayment}</td>
                <td className="border border-gray-700 px-2 py-2">
                  {closingBalance < 0 ? `(${Math.abs(closingBalance)})` : closingBalance}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">ক্রম</th>
                <th className="border border-gray-700 px-2 py-1">তারিখ</th>
                <th className="border border-gray-700 px-2 py-1">সাপ্লায়ার নাম</th>
                <th className="border border-gray-700 px-2 py-1">বিবরণ</th>
                <th className="border border-gray-700 px-2 py-1">পদ্ধতি</th>
                <th className="border border-gray-700 px-2 py-1">ক্রয়</th>
                <th className="border border-gray-700 px-2 py-1">পেমেন্ট</th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b">প্রারম্ভিক ব্যালেন্স ৳{openingBalance}</p>
                  ব্যালেন্স
                </th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {ledgerWithBalance.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 px-2 py-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {tableFormatDate(dt.date)}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.supplier_name}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.remarks}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.mode}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.purchase_amount}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.pay_amount}
                  </td>
                  <td className="border border-gray-700 px-2 py-1">
                    {dt.runningBalance < 0
                      ? `(${Math.abs(dt.runningBalance)})`
                      : dt.runningBalance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default SupplierLedger;
