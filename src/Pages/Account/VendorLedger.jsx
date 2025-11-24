
{/* <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded bg-green-100 shadow hover:bg-green-600 hover:text-white transition">
              <FaFileExcel /> Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 rounded bg-amber-100 shadow hover:bg-yellow-600 hover:text-white transition">
              <FaFilePdf /> PDF
            </button>
            <button onClick={printTable} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-100 shadow hover:bg-blue-600 hover:text-white transition">
              <FaPrint /> Print
            </button> */}

// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
// import { MdOutlineArrowDropDown } from "react-icons/md";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const VendorLedger = () => {
//   const [vendorData, setVendorData] = useState([]);
//   const [selectedVendor, setSelectedVendor] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Month filter state
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [showFilter, setShowFilter] = useState(false);

//   // Vendor list
//   const [vendorList, setVendorList] = useState([]);

//   useEffect(() => {
//     axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
//       .then((res) => {
//         if (res.data.status === "Success") {
//           setVendorList(res.data.data);
//         }
//       })
//       .catch((err) => console.error("ভেন্ডর তালিকা লোডে ত্রুটি:", err));
//   }, []);

//   const selectedVendorInfo = vendorList.find(v => v.vendor_name === selectedVendor);
//   const openingBalance = selectedVendorInfo ? Number(selectedVendorInfo.opening_balance || 0) : 0;

//   // Vendor ledger
//   useEffect(() => {
//     axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendorLedger/list`)
//       .then((res) => {
//         if (res.data.status === "Success") {
//           const onlyVendorRows = res.data.data.filter((v) => !!v.vendor_name);
//           const vendorsWithDue = onlyVendorRows.map((item, index, array) => {
//             const previousEntries = array.slice(0, index).filter(v => v.vendor_name === item.vendor_name);
//             const previousDue = previousEntries.reduce((sum, entry) => {
//               return sum + (Number(entry.trip_rent || 0) - Number(entry.advance || 0) - Number(entry.pay_amount || 0));
//             }, 0);
//             const currentDue = Number(item.trip_rent || 0) - Number(item.advance || 0) - Number(item.pay_amount || 0);
//             return { ...item, due_amount: previousDue + currentDue };
//           });
//           setVendorData(vendorsWithDue);
//         }
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("ভেন্ডর লেজার লোডে ত্রুটি:", err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p className="text-center mt-16">ভেন্ডর লেজার লোড হচ্ছে...</p>;

//   const availableMonths = [...new Set(vendorData.filter(item => item.date).map(item => {
//     const [year, month] = item.date.split("-");
//     return `${year}-${month}`;
//   }))];

//   const vendorNames = [...new Set(vendorData.map((v) => v.vendor_name))];
//   const filteredVendors = vendorData.filter((v) => {
//     const matchesVendor = selectedVendor ? v.vendor_name === selectedVendor : true;
//     const matchesMonth = selectedMonth ? v.date.startsWith(selectedMonth) : true;
//     return matchesVendor && matchesMonth;
//   });

//   // Calculate totals including opening balance
//   const totals = filteredVendors.reduce((acc, item) => {
//     acc.rent += Number(item.trip_rent || 0);
//     acc.advance += Number(item.advance || 0);
//     acc.pay_amount += Number(item.pay_amount || 0);
//     return acc;
//   }, { rent: 0, advance: 0, pay_amount: 0 });

//   totals.due = totals.rent - totals.advance - totals.pay_amount;
//   const grandDue = totals.due + openingBalance;

//   // Export to Excel
//   const exportToExcel = () => {
//     const data = filteredVendors.map((item) => {
//       const runningBalance = selectedVendor ? openingBalance + (item.due_amount || 0) : item.due_amount;
//       return {
//         তারিখ: item.date,
//         ভেন্ডর: item.vendor_name,
//         লোড: item.load_point || "--",
//         আনলোড: item.unload_point || "--",
//         যানবাহন: item.vehicle_no || "--",
//         ড্রাইভার: item.driver_name || "--",
//         "ট্রিপ ভাড়া": item.trip_rent,
//         অগ্রিম: item.advance || "--",
//         "পেমেন্ট": item.pay_amount || "--",
//         বকেয়া: runningBalance
//       };
//     });

//     if (selectedVendor) {
//       data.unshift({
//         তারিখ: "",
//         ভেন্ডর: "প্রারম্ভিক ব্যালেন্স",
//         লোড: "",
//         আনলোড: "",
//         যানবাহন: "",
//         ড্রাইভার: "",
//         "ট্রিপ ভাড়া": "",
//         অগ্রিম: "",
//         "পেমেন্ট": "",
//         বকেয়া: openingBalance
//       });
//     }

//     data.push({
//       তারিখ: "",
//       ভেন্ডর: "মোট",
//       লোড: "",
//       আনলোড: "",
//       যানবাহন: "",
//       ড্রাইভার: "",
//       "ট্রিপ ভাড়া": totals.rent,
//       অগ্রিম: totals.advance,
//       "পেমেন্ট": totals.pay_amount,
//       বকেয়া: grandDue
//     });

//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Vendor Ledger");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([buffer], { type: "application/octet-stream" });
//     saveAs(blob, `Vendor_Ledger_${selectedVendor || "All"}.xlsx`);
//   };

//   // Export to PDF
//   const exportToPDF = () => {
//     const doc = new jsPDF("landscape");
//     doc.setFontSize(16);
//     doc.text(`ভেন্ডর লেজার: ${selectedVendor || "সকল ভেন্ডর"}`, 14, 15);

//     if (selectedVendor) {
//       doc.setFontSize(10);
//       doc.text(`প্রারম্ভিক ব্যালেন্স: ${openingBalance}`, 14, 22);
//     }

//     const columns = [
//       "ক্রম",
//       "তারিখ",
//       "ভেন্ডর",
//       "লোড",
//       "আনলোড",
//       "যানবাহন",
//       "ড্রাইভার",
//       "ট্রিপ ভাড়া",
//       "অগ্রিম",
//       "পেমেন্ট",
//       "বকেয়া"
//     ];

//     const rows = filteredVendors.map((item, idx) => {
//       const runningBalance = selectedVendor ? openingBalance + (item.due_amount || 0) : item.due_amount;
//       return [
//         idx + 1,
//         item.date,
//         item.vendor_name,
//         item.load_point || "--",
//         item.unload_point || "--",
//         item.vehicle_no || "--",
//         item.driver_name || "--",
//         item.trip_rent ? Number(item.trip_rent) : "--",
//         item.advance ? Number(item.advance) : "--",
//         item.pay_amount ? Number(item.pay_amount) : "--",
//         runningBalance
//       ];
//     });

//     rows.push([
//       "",
//       "",
//       "মোট",
//       "",
//       "",
//       "",
//       "",
//       totals.rent,
//       totals.advance,
//       totals.pay_amount,
//       grandDue
//     ]);

//     autoTable(doc, {
//       head: [columns],
//       body: rows,
//       startY: selectedVendor ? 25 : 20,
//       styles: { fontSize: 9 },
//       headStyles: { fillColor: [17, 55, 91], textColor: [255, 255, 255] },
//     });

//     doc.save(`Vendor_Ledger_${selectedVendor || "All"}.pdf`);
//   };

//   // Print
//   const printTable = () => {
//     const content = document.getElementById("vendor-ledger-table").innerHTML;
//     const style = `<style>
//       table, th, td { border:1px solid black; border-collapse: collapse; }
//       th, td { padding: 4px; font-size:12px; text-align:left; }
//       table { width:100%; margin-bottom:20px; }
//       .print-header { text-align:center; margin-bottom:15px; }
//       .print-title { font-size:18px; font-weight:bold; }
//       .opening-balance { font-size:14px; margin-bottom:10px; }
//       .totals-row { font-weight:bold; background-color:#f2f2f2; }
//     </style>`;

//     const printWindow = window.open("", "", "width=900,height=700");
//     printWindow.document.write(`
//       <html>
//         <head><title>ভেন্ডর লেজার প্রিন্ট</title>${style}</head>
//         <body>
//           <div class="print-header">
//             <div class="print-title">ভেন্ডর লেজার: ${selectedVendor || "সকল ভেন্ডর"}</div>
//             ${selectedVendor ? `<div class="opening-balance">প্রারম্ভিক ব্যালেন্স: ${openingBalance}</div>` : ''}
//           </div>
//           ${content}
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="border border-gray-200 md:p-4 rounded-xl">
//       <div className="overflow-x-auto max-w-5xl mx-auto">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-bold text-[#11375B] capitalize">
//             ভেন্ডর লেজার: {selectedVendor || "সকল ভেন্ডর"}
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button onClick={() => setShowFilter((prev) => !prev)}
//               className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 cursor-pointer">
//               <FaFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>

//         <div className="md:flex items-center justify-between mb-4">
//           <div className="flex gap-2 flex-wrap">
//             <button onClick={exportToExcel} className="flex items-center gap-2 py-2 px-5 bg-gray-50 shadow-md rounded-md hover:bg-primary hover:text-white">
//               <FaFileExcel /> এক্সেল
//             </button>
//             <button onClick={exportToPDF} className="flex items-center gap-2 py-2 px-5 bg-gray-50 shadow-md rounded-md hover:bg-primary hover:text-white">
//               <FaFilePdf /> পিডিএফ
//             </button>
//             <button onClick={printTable} className="flex items-center gap-2 py-2 px-5 bg-gray-50 shadow-md rounded-md hover:bg-primary hover:text-white">
//               <FaPrint /> প্রিন্ট
//             </button>
//           </div>
//         </div>

//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5">
//             <div className="w-[50%]">
//               <label className="text-primary text-sm font-semibold">মাস নির্বাচন করুন</label>
//               <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white">
//                 <option value="">সকল মাস</option>
//                 {availableMonths.map((month, idx) => {
//                   const [year, monthNum] = month.split("-");
//                   const date = new Date(`${month}-01`);
//                   const monthName = date.toLocaleString("default", { month: "long" });
//                   return <option key={idx} value={month}>{`${monthName}-${year}`}</option>;
//                 })}
//               </select>
//             </div>

//             <div className="mt-3 md:mt-0 relative">
//               <label className="text-primary text-sm font-semibold">ভেন্ডর নির্বাচন করুন</label>
//               <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}
//                 className="mt-1 w-full text-gray-600 text-sm border border-gray-300 bg-white p-2 rounded appearance-none">
//                 <option value="">সকল ভেন্ডর</option>
//                 {vendorNames.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
//               </select>
//               <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//             </div>
//           </div>
//         )}

//         <div id="vendor-ledger-table" className="overflow-x-auto">
//           <table className="min-w-full text-sm text-left text-gray-900">
//             <thead className="bg-gray-100">
//               <tr className="font-bold bg-gray-100">
//                 <td colSpan={7} className="border px-2 py-1 text-right">মোট:</td>
//                 <td className="border px-2 py-1">{totals.rent}</td>
//                 <td className="border px-2 py-1">{totals.advance}</td>
//                 <td className="border px-2 py-1">{totals.pay_amount}</td>
//                 <td className="border px-2 py-1">
//                   {grandDue}
//                   {selectedVendor && (<p className="text-xs text-gray-600 font-normal">(প্রারম্ভিক ব্যালেন্স সহ)</p>)}
//                 </td>
//               </tr>
//               <tr>
//                 <th className="border px-2 py-1">ক্রম</th>
//                 <th className="border px-2 py-1">তারিখ</th>
//                 <th className="border px-2 py-1">ভেন্ডর</th>
//                 <th className="border px-2 py-1">লোড</th>
//                 <th className="border px-2 py-1">আনলোড</th>
//                 <th className="border px-2 py-1">যানবাহন</th>
//                 <th className="border px-2 py-1">ড্রাইভার</th>
//                 <th className="border px-2 py-1">ট্রিপ ভাড়া</th>
//                 <th className="border px-2 py-1">অগ্রিম</th>
//                 <th className="border px-2 py-1">পেমেন্ট</th>
//                 <th className="border px-2 py-1">
//                   বকেয়া
//                   {selectedVendor && (<p className="text-xs text-gray-600 font-normal">প্রারম্ভিক ব্যালেন্স: {openingBalance}</p>)}
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredVendors.map((item, idx) => {
//                 const runningBalance = selectedVendor ? openingBalance + (item.due_amount || 0) : item.due_amount;
//                 return (
//                   <tr key={idx}>
//                     <td className="border px-2 py-1">{idx + 1}</td>
//                     <td className="border px-2 py-1">{item.date}</td>
//                     <td className="border px-2 py-1">{item.vendor_name}</td>
//                     <td className="border px-2 py-1">{item.load_point || "--"}</td>
//                     <td className="border px-2 py-1">{item.unload_point || "--"}</td>
//                     <td className="border px-2 py-1">{item.vehicle_no || "--"}</td>
//                     <td className="border px-2 py-1">{item.driver_name || "--"}</td>
//                     <td className="border px-2 py-1">{item.trip_rent ? Number(item.trip_rent) : "--"}</td>
//                     <td className="border px-2 py-1">{item.advance ? Number(item.advance) : "--"}</td>
//                     <td className="border px-2 py-1">{item.pay_amount ? Number(item.pay_amount) : "--"}</td>
//                     <td className="border px-2 py-1">{runningBalance}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorLedger;



import axios from "axios";
import { useEffect, useState } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { tableFormatDate } from "../../components/Shared/formatDate";
import api from "../../utils/axiosConfig";

const VendorLedger = () => {
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [vendorList, setVendorList] = useState([]);

  // Fetch vendor list (for opening balance)
  useEffect(() => {
    api
      .get(`/vendor`)
      .then((res) => {
        if (res.data.success) {
          setVendorList(res.data.data);
        }
      })
      .catch((err) => console.error("Vendor list fetch error:", err));
  }, []);

  // Fetch vendor ledger data
  useEffect(() => {
    api
      .get(`/vendorLedger`)
      .then((res) => {
        if (res.data.status === "Success") {
          // Filter out entries without a vendor name early if needed, or handle nulls in calculations
          setVendorData(res.data.data.filter((v) => !!v.vendor_name));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Vendor ledger error:", err);
        setLoading(false);
      });
  }, []);

  // helper function
  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };


  const selectedVendorInfo = vendorList.find(
    (v) => v.vendor_name === selectedVendor
  );
  const openingBalance = selectedVendorInfo
    ? Number(selectedVendorInfo.opening_balance || 0)
    : 0;

  if (loading)
    return <p className="text-center mt-16">Loading Vendor Ledger...</p>;

  // Get unique months from data for dropdown
  const availableMonths = [
    ...new Set(
      vendorData
        .filter((item) => item.date) // Make sure date exists
        .map((item) => {
          const date = new Date(item.date);
          const monthNum = date.getMonth() + 1;
          // Use slice for padding instead of padStart for broader compatibility
          const paddedMonth = ('0' + monthNum).slice(-2);
          return `${date.getFullYear()}-${paddedMonth}`;
        })
    ),
  ].sort();

  const vendorNames = [...new Set(vendorData.map((v) => v.vendor_name))];

  // Filter data based on selected vendor and month, then sort by date
  const filteredVendors = vendorData.filter((v) => {
    const matchesVendor = selectedVendor ? v.vendor_name === selectedVendor : true;
    const matchesMonth = selectedMonth
      ? v.date && new Date(v.date).toISOString().slice(0, 7) === selectedMonth
      : true;
    return matchesVendor && matchesMonth;
  }).sort((a, b) => {
    // Sort by date to ensure correct running balance calculation
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Calculate running balance for filtered data
  let currentRunningBalance = openingBalance;
  const rowsWithRunningBalance = filteredVendors.map((item) => {
    const tripRent = toNumber(item.trip_rent || 0);
    const advance = toNumber(item.advance || 0);
    const payAmount = toNumber(item.pay_amount || 0);

    // Calculate the net effect of this transaction on the balance
    const transactionEffect = tripRent - advance - payAmount;

    currentRunningBalance += transactionEffect;

    return {
      ...item,
      calculated_transaction_due: transactionEffect, // Due for this specific transaction
      running_balance: currentRunningBalance, // Running balance after this transaction
    };
  });

  // Calculate totals for filtered data
  const totals = rowsWithRunningBalance.reduce(
    (acc, item) => {
      acc.rent += toNumber(item.trip_rent || 0);
      acc.advance += toNumber(item.advance || 0);
      acc.pay_amount += toNumber(item.pay_amount || 0);
      return acc;
    },
    { rent: 0, advance: 0, pay_amount: 0 }
  );

  // The grand total due is the last running balance, or opening balance if no transactions
  const grandDue =
    rowsWithRunningBalance.length > 0
      ? rowsWithRunningBalance[rowsWithRunningBalance.length - 1].running_balance
      : openingBalance;

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = [];

    // Add opening balance row if a specific vendor is selected
    if (selectedVendor) {
      dataToExport.push({
        Date: "",
        Vendor: "Opening Balance",
        Load: "",
        Unload: "",
        Vehicle: "",
        Driver: "",
        "Trip Rent": "",
        Advance: "",
        "Pay Amount": "",
        Due: openingBalance,
      });
    }

    // Add transaction rows
    rowsWithRunningBalance.forEach((item) => {
      dataToExport.push({
        Date: item.date,
        Vendor: item.vendor_name,
        Load: item.load_point || "--",
        Unload: item.unload_point || "--",
        Vehicle: item.vehicle_no || "--",
        Driver: item.driver_name || "--",
        "Trip Rent": item.trip_rent ? toNumber(item.trip_rent) : "--",
        Advance: item.advance ? toNumber(item.advance) : "--",
        "Pay Amount": item.pay_amount ? toNumber(item.pay_amount) : "--",
        Due: item.running_balance,
      });
    });

    // Add totals row
    dataToExport.push({
      Date: "",
      Vendor: "TOTAL",
      Load: "",
      Unload: "",
      Vehicle: "",
      Driver: "",
      "Trip Rent": totals.rent,
      Advance: totals.advance,
      "Pay Amount": totals.pay_amount,
      Due: grandDue,
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendor Ledger");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `Vendor_Ledger_${selectedVendor || "All"}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");

    // Title
    doc.setFontSize(16);
    doc.text(`Vendor Ledger: ${selectedVendor || "All Vendors"}`, 14, 15);

    if (selectedVendor) {
      doc.setFontSize(10);
      doc.text(`Opening Balance: ${openingBalance}`, 14, 22);
    }

    const columns = [
      "SL.",
      "Date",
      "Vendor",
      "Load",
      "Unload",
      "Vehicle",
      "Driver",
      "Trip Rent",
      "Advance",
      "Pay Amount",
      "Due",
    ];

    const rows = rowsWithRunningBalance.map((item, idx) => {
      return [
        idx + 1,
        item.date || "",
        item.vendor_name || "",
        item.load_point || "--",
        item.unload_point || "--",
        item.vehicle_no || "--",
        item.driver_name || "--",
        item.trip_rent ? toNumber(item.trip_rent) : "--",
        item.advance ? toNumber(item.advance) : "--",
        item.pay_amount ? toNumber(item.pay_amount) : "--",
        item.running_balance,
      ];
    });

    // Add totals row
    rows.push([
      "",
      "",
      "TOTAL",
      "",
      "",
      "",
      "",
      totals.rent,
      totals.advance,
      totals.pay_amount,
      grandDue,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: selectedVendor ? 25 : 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [17, 55, 91], textColor: [255, 255, 255] },
    });
    doc.save(`Vendor_Ledger_${selectedVendor || "All"}.pdf`);
  };

  // print function
  const printTable = () => {
    const content = document.getElementById("vendor-ledger-table").innerHTML;
    const style = `
      <style>
        table, th, td {
          border: 1px solid black;
          border-collapse: collapse;
        }
        th, td {
          padding: 4px;
          font-size: 12px;
          text-align: left;
        }
        table {
          width: 100%;
          margin-bottom: 20px;
        }
        .print-header {
          text-align: center;
          margin-bottom: 15px;
        }
        .print-title {
          font-size: 18px;
          font-weight: bold;
        }
        .opening-balance-text {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .totals-row {
          font-weight: bold;
          background-color: #f2f2f2;
        }
        .text-red-500 {
          color: #ef4444; /* Tailwind's red-500 */
        }
      </style>
    `;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Vendor Ledger</title>
          ${style}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">Vendor Ledger: ${selectedVendor || "All Vendors"
      }</div>
            ${selectedVendor
        ? `<div class="opening-balance-text">Opening Balance: ${openingBalance.toFixed(
          2
        )}</div>`
        : ""
      }
          </div>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="md:p-2">
      <div className="border border-gray-200 md:p-4 rounded-xl">
        <div className="overflow-x-auto  mx-auto">
          <div className="md:flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-[#11375B] capitalize">
              ভেন্ডর লেজার: {selectedVendor || "সকল ভেন্ডর"}
            </h1>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              >
                <FaFilter /> ফিল্টার
              </button>
            </div>
          </div>
          <div className="md:flex items-center justify-between mb-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                <FaFileExcel className="" />
                এক্সেল
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                <FaFilePdf className="" />
                পিডিএফ
              </button>
              <button
                onClick={printTable}
                className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
              >
                <FaPrint className="" />
                প্রিন্ট
              </button>
            </div>
          </div>
          <div>
            {/* Month Filter Section */}
            {showFilter && (
              <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
                <div className="w-full">
                  <div className="relative w-full">
                    <label className="text-primary text-sm font-semibold">
                      মাস নির্বাচন করুন
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                    >
                      <option value="">সকল মাস</option>
                      {availableMonths.map((month, idx) => {
                        const [year, monthNum] = month.split("-");
                        const date = new Date(`${month}-01`);
                        const monthName = date.toLocaleString("default", {
                          month: "long",
                        }); // e.g., July
                        return (
                          <option key={idx} value={month}>
                            {`${monthName}-${year}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                {/* select vendor */}
                <div className="mt-3 md:mt-0 relative w-full">
                  <label className="text-primary text-sm font-semibold">
                    ভেন্ডর নির্বাচন করুন
                  </label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => {
                      setSelectedVendor(e.target.value);
                    }}
                    className="mt-1 w-full text-gray-600 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                  >
                    <option value="">সকল ভেন্ডর</option>
                    {vendorList.map((vendor, idx) => (
                      <option key={idx} value={vendor.vendor_name}>
                        {vendor.vendor_name}
                      </option>
                    ))}
                  </select>
                  <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
                </div>
                <div className=" mt-6 w-xs">
                  <button
                    onClick={() => {
                      setSelectedVendor("");
                      setSelectedMonth("");
                      setShowFilter(false);
                    }}
                    className="bg-gradient-to-r from-primary to-primary w-full text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              </div>
            )}
          </div>
          <div id="vendor-ledger-table" className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-900">
              <thead className="bg-gray-100">
                <tr className="font-bold bg-gray-100">
                  <td colSpan={7} className="border px-2 py-1 text-right">
                    মোট:
                  </td>
                  <td className="border px-2 py-1">{totals.rent}</td>
                  <td className="border px-2 py-1">{totals.advance}</td>
                  <td className="border px-2 py-1">{totals.pay_amount}</td>
                  <td className="border px-2 py-1">
                    <span className={grandDue < 0 ? "text-red-500" : ""}>
                      {grandDue < 0
                        ? `(${Math.abs(grandDue)})`
                        : grandDue}
                    </span>
                    {selectedVendor && (
                      <p className="text-xs text-gray-600 font-normal">
                        (Including Opening Balance)
                      </p>
                    )}
                  </td>
                </tr>
                <tr>
                  <th className="border px-2 py-1">ক্রমিক</th>
                  <th className="border px-2 py-1">তারিখ</th>
                  <th className="border px-2 py-1">ভেন্ডর</th>
                  <th className="border px-2 py-1">লোড</th>
                  <th className="border px-2 py-1">আনলোড</th>
                  <th className="border px-2 py-1">ইকুইপমেন্ট</th>
                  <th className="border px-2 py-1">অপারেটর/ড্রাইভার</th>
                  <th className="border px-2 py-1">ভাড়া</th>
                  <th className="border px-2 py-1">অগ্রিম</th>
                  <th className="border px-2 py-1">পরিশোধ</th>
                  <th className="border px-2 py-1">
                    বাকি{" "}
                    {selectedVendor && (
                      <p className="text-xs text-gray-600 font-normal">
                        উদ্বোধনী ব্যালেন্স: {openingBalance}
                      </p>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowsWithRunningBalance.map((item, idx) => {
                  return (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1">{tableFormatDate(item.date)}</td>
                      <td className="border px-2 py-1">{item.vendor_name}</td>
                      <td className="border px-2 py-1">
                        {item.load_point || (
                          <span className="flex justify-center items-center">
                            --
                          </span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {item.unload_point || (
                          <span className="flex justify-center items-center">
                            --
                          </span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {item.vehicle_no || (
                          <span className="flex justify-center items-center">
                            --
                          </span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {item.driver_name || (
                          <span className="flex justify-center items-center">
                            --
                          </span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {item.trip_rent ? toNumber(item.trip_rent) : "--"}
                      </td>
                      <td className="border px-2 py-1">
                        {item.advance ? toNumber(item.advance) : "--"}
                      </td>
                      <td className="border px-2 py-1">
                        {item.pay_amount ? toNumber(item.pay_amount) : "--"}
                      </td>
                      <td className="border px-2 py-1">
                        <span
                          className={item.running_balance < 0 ? "text-red-500" : ""}
                        >
                          {item.running_balance < 0
                            ? `(${Math.abs(item.running_balance)})`
                            : item.running_balance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot></tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLedger;