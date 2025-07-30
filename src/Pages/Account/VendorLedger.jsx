
{/* <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 rounded bg-green-100 shadow hover:bg-green-600 hover:text-white transition">
              <FaFileExcel /> Excel
            </button>
            <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 rounded bg-amber-100 shadow hover:bg-yellow-600 hover:text-white transition">
              <FaFilePdf /> PDF
            </button>
            <button onClick={printTable} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-100 shadow hover:bg-blue-600 hover:text-white transition">
              <FaPrint /> Print
            </button> */}

            

import axios from "axios";
import { useEffect, useState } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ReactPaginate from "react-paginate";

const VendorLedger = () => {
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

   // Month filter state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // vendor
  const [vendorList, setVendorList] = useState([]);
  
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          setVendorList(res.data.data);
        }
      })
      .catch((err) => console.error("Vendor list fetch error:", err));
  }, []);
  
  const selectedVendorInfo = vendorList.find(v => v.vendor_name === selectedVendor);
  const openingBalance = selectedVendorInfo ? Number(selectedVendorInfo.opening_balance || 0) : 0;
// vendor ledger
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/vendorLedger/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          const onlyVendorRows = res.data.data.filter((v) => !!v.vendor_name);
          
          // Calculate running due for each vendor
          const vendorsWithDue = onlyVendorRows.map((item, index, array) => {
            // Get all previous entries for this vendor
            const previousEntries = array.slice(0, index).filter(v => v.vendor_name === item.vendor_name);
            
            // Calculate previous due
            const previousDue = previousEntries.reduce((sum, entry) => {
  return sum + (Number(entry.trip_rent || 0) - Number(entry.advance || 0) - Number(entry.pay_amount || 0));
}, 0);

const currentDue = Number(item.trip_rent || 0) - Number(item.advance || 0) - Number(item.pay_amount || 0);

            
            return {
              ...item,
              due_amount: previousDue + currentDue
            };
          });
          
          setVendorData(vendorsWithDue);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Vendor ledger error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading Vendor Ledger...</p>;

  // monthly filter
  const availableMonths = [
  ...new Set(
    vendorData
      .filter(item => item.date) // Make sure date exists
      .map(item => {
        const [year, month] = item.date.split("-");
        return `${year}-${month}`;
      })
  )
];

  const vendorNames = [...new Set(vendorData.map((v) => v.vendor_name))];
  const filteredVendors = vendorData.filter((v) => {
  const matchesVendor = selectedVendor ? v.vendor_name === selectedVendor : true;
  const matchesMonth = selectedMonth
    ? v.date.startsWith(selectedMonth)
    : true;
  return matchesVendor && matchesMonth;
});

  // Calculate totals including opening balance
  const totals = filteredVendors.reduce(
    (acc, item) => {
      acc.rent += Number(item.trip_rent || 0);
      acc.advance += Number(item.advance || 0);
      acc.pay_amount += Number(item.pay_amount || 0);
      return acc;
    },
    { rent: 0, advance: 0, pay_amount: 0}
  );
  // Now calculate due from total trip - advance - pay_amount
totals.due = totals.rent - totals.advance - totals.pay_amount;

  const grandDue =  totals.due+openingBalance;

  // Pagination logic
  // const pageCount = Math.ceil(filteredVendors.length / itemsPerPage);
  // const offset = currentPage * itemsPerPage;
  // const currentItems = filteredVendors.slice(offset, offset + itemsPerPage);

  // const handlePageClick = ({ selected }) => {
  //   setCurrentPage(selected);
  // };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredVendors.map((item) => {
      const runningBalance = selectedVendor 
        ? openingBalance + (item.due_amount || 0)
        : item.due_amount;
        
      return {
        Date: item.date,
        Vendor: item.vendor_name,
        Load: item.load_point || "--",
        Unload: item.unload_point || "--",
        Vehicle: item.vehicle_no || "--",
        Driver: item.driver_name || "--",
        "Trip Rent": item.trip_rent,
        Advance: item.advance || "--",
        "Pay Amount": item.pay_amount || "--",
        Due: runningBalance.toFixed(2)
      };
    });

    // Add opening balance and totals row
    if (selectedVendor) {
      data.unshift({
        Date: "",
        Vendor: "Opening Balance",
        Load: "",
        Unload: "",
        Vehicle: "",
        Driver: "",
        "Trip Rent": "",
        Advance: "",
        "Pay Amount": "",
        Due: openingBalance.toFixed(2)
      });
    }

    data.push({
      Date: "",
      Vendor: "TOTAL",
      Load: "",
      Unload: "",
      Vehicle: "",
      Driver: "",
      "Trip Rent": totals.rent.toFixed(2),
      Advance: totals.advance.toFixed(2),
      "Pay Amount": totals.pay_amount.toFixed(2),
      Due: grandDue.toFixed(2)
    });

    const ws = XLSX.utils.json_to_sheet(data);
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
      doc.text(`Opening Balance: ${openingBalance.toFixed(2)}`, 14, 22);
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
      "Due"
    ];

    const rows = currentItems.map((item, idx) => {
      const runningBalance = selectedVendor 
        ? openingBalance + (item.due_amount || 0)
        : item.due_amount;
        
      return [
        idx + 1 + offset,
        item.date,
        item.vendor_name,
        item.load_point || "--",
        item.unload_point || "--",
        item.vehicle_no || "--",
        item.driver_name || "--",
        item.trip_rent ? Number(item.trip_rent).toFixed(2) : "--",
        item.advance ? Number(item.advance).toFixed(2) : "--",
        item.pay_amount ? Number(item.pay_amount).toFixed(2) : "--",
        runningBalance.toFixed(2)
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
      totals.rent.toFixed(2),
      totals.advance.toFixed(2),
      totals.pay_amount.toFixed(2),
      grandDue.toFixed(2)
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
        .opening-balance {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .totals-row {
          font-weight: bold;
          background-color: #f2f2f2;
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
            <div class="print-title">Vendor Ledger: ${selectedVendor || "All Vendors"}</div>
            ${selectedVendor ? `<div class="opening-balance">Opening Balance: ${openingBalance.toFixed(2)}</div>` : ''}
          </div>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="border border-gray-200 md:p-4 rounded-xl">
      <div className="overflow-x-auto max-w-5xl mx-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize">
            Vendor Ledger: {selectedVendor || "All Vendors"}
          </h1>
          {/* {selectedVendor && (
            <div className="text-sm text-gray-600 mt-2 md:mt-0">
              <strong>Opening Balance:</strong> {openingBalance.toFixed(2)}
            </div>
          )} */}
           <div className="mt-3 md:mt-0 flex gap-2">
                      <button
                        onClick={() => setShowFilter((prev) => !prev)}
                        className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
                      >
                        <FaFilter /> Filter
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
              Excel
            </button>
          
            <button
              onClick={exportToPDF}
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
         
        </div>
        <div>
            {/* Month Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="w-[50%]">
              <div className="relative w-full">
                <label className="text-primary text-sm font-semibold">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                >
                  <option value="">All Months</option>
                  {/* {availableMonths.map((month, idx) => (
  <option key={idx} value={month}>
    {month}
  </option>
))} */}
                  {availableMonths.map((month, idx) => {
  const [year, monthNum] = month.split("-");
  const date = new Date(`${month}-01`);
  const monthName = date.toLocaleString("default", { month: "long" }); // e.g., July
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
            <div className="mt-3 md:mt-0 relative">
            <label className="text-primary text-sm font-semibold">Select Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => {
                setSelectedVendor(e.target.value);
                // setCurrentPage(0);
              }}
              className="mt-1 w-full text-gray-600 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">All Vendors</option>
              {vendorNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
          </div>
        )}
         
          </div>

        <div id="vendor-ledger-table" className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="bg-gray-100">
              <tr className="font-bold bg-gray-100">
                <td colSpan={7} className="border px-2 py-1 text-right">
                  TOTAL:
                </td>
                <td className="border px-2 py-1">{totals.rent.toFixed(2)}</td>
                <td className="border px-2 py-1">{totals.advance.toFixed(2)}</td>
                <td className="border px-2 py-1">{totals.pay_amount.toFixed(2)}</td>
                <td className="border px-2 py-1">
                  {grandDue.toFixed(2)}
                  {selectedVendor && (
                    <p className="text-xs text-gray-600 font-normal">
                      (Including Opening Balance)
                    </p>
                  )}
                </td>
              </tr>
              <tr>
                <th className="border px-2 py-1">SL.</th>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Vendor</th>
                <th className="border px-2 py-1">Load</th>
                <th className="border px-2 py-1">Unload</th>
                <th className="border px-2 py-1">Vehicle</th>
                <th className="border px-2 py-1">Driver</th>
                <th className="border px-2 py-1">Trip Rent</th>
                <th className="border px-2 py-1">Advance</th>
                <th className="border px-2 py-1">Pay Amount</th>
                <th className="border px-2 py-1">Due {selectedVendor && (
                    <p className="text-xs text-gray-600 font-normal">
                       Opening Balance: {openingBalance}
                    </p>
                  )}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((item, idx) => {
                const runningBalance = selectedVendor 
                  ? openingBalance + (item.due_amount || 0)
                  : item.due_amount;
                  
                return (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{idx + 1 }</td>
                    <td className="border px-2 py-1">{item.date}</td>
                    <td className="border px-2 py-1">{item.vendor_name}</td>
                    <td className="border px-2 py-1">
                      {item.load_point || <span className="flex justify-center items-center">--</span>}
                    </td>
                    <td className="border px-2 py-1">
                      {item.unload_point || <span className="flex justify-center items-center">--</span>}
                    </td>
                    <td className="border px-2 py-1">
                      {item.vehicle_no || <span className="flex justify-center items-center">--</span>}
                    </td>
                    <td className="border px-2 py-1">
                      {item.driver_name || <span className="flex justify-center items-center">--</span>}
                    </td>
                    <td className="border px-2 py-1">
                      {item.trip_rent ? Number(item.trip_rent).toFixed(2) : "--"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.advance ? Number(item.advance).toFixed(2) : "--"}
                    </td>
                    <td className="border px-2 py-1">
                      {item.pay_amount ? Number(item.pay_amount).toFixed(2) : "--"}
                    </td>
                    <td className="border px-2 py-1">
                      {runningBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {/* {pageCount > 1 && (
          <div className="mt-4 flex justify-center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"flex items-center gap-1"}
              pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
              previousClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
              nextClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
              breakClassName={"px-3 py-1"}
              activeClassName={"bg-primary text-white border-primary"}
              forcePage={currentPage}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default VendorLedger;