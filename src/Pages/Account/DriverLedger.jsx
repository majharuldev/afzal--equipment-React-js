
import axios from "axios";
import { useEffect, useState } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";

const DriverLedger = () => {
  const [driver, setDriver] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [driverOpeningBalances, setDriverOpeningBalances] = useState({});
  const openingBalance = selectedDriver ? (driverOpeningBalances[selectedDriver] || 0) : 0;
  const TADA_RATE = 300;
  const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

  // driver 
  useEffect(() => {
  axios
    .get(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
    .then((res) => {
      if (res.data.status === "Success") {
        const driverList = res.data.data;
        // Store opening balances by driver name
        const openingBalances = {};
        driverList.forEach(driver => {
          openingBalances[driver.driver_name] = Number(driver.opening_balance) || 0;
        });
        setDriverOpeningBalances(openingBalances);
      }
    })
    .catch((err) => console.error("Error fetching driver list:", err));
}, []);

  
  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch driver ledger data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/driverLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setDriver(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading Driver...</p>;

  const driverNames = [...new Set(driver.map((d) => d.driver_name))];

  // Get unique months from data for dropdown
  const availableMonths = [...new Set(driver.map(item => {
    const date = new Date(item.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort();

  // Filter by driver and month
  const filteredDriver = driver.filter((d) => {
    const matchesDriver = selectedDriver ? d.driver_name === selectedDriver : true;
    const matchesMonth = selectedMonth ? 
      new Date(d.date).toISOString().slice(0, 7) === selectedMonth : true;
    return matchesDriver && matchesMonth;
  });

  // Pagination logic
  // const pageCount = Math.ceil(filteredDriver.length / itemsPerPage);
  // const offset = currentPage * itemsPerPage;
  // const currentItems = filteredDriver.slice(offset, offset + itemsPerPage);

  // const handlePageClick = ({ selected }) => {
  //   setCurrentPage(selected);
  // };

  // Calculate TADA (300 BDT per day) for each unique date per driver
  const calculateTADA = () => {
    const tadaData = {};
    
    filteredDriver.forEach(item => {
      if (!tadaData[item.driver_name]) {
        tadaData[item.driver_name] = new Set();
      }
      // Extract just the date part (YYYY-MM-DD) without time
      const dateOnly = item.date.split('T')[0];
      tadaData[item.driver_name].add(dateOnly);
    });
    
    const result = {};
    Object.keys(tadaData).forEach(driver => {
      result[driver] = {
        days: tadaData[driver].size,
        amount: tadaData[driver].size * TADA_RATE
      };
    });
    
    return result;
  };

  const tadaAmounts = calculateTADA();

  // Calculate running balance and totals (without TADA)
  let runningBalance = openingBalance;
  const rowsWithBalance = filteredDriver.map(item => {
    const {
      labor = 0,
      parking_cost = 0,
      night_guard = 0,
      toll_cost = 0,
      feri_cost = 0,
      police_cost = 0,
      chada = 0,
      driver_adv = 0,
    } = item;

    const totalExpense =
      Number(labor) +
      Number(parking_cost) +
      Number(night_guard) +
      Number(toll_cost) +
      Number(feri_cost) +
      Number(police_cost) +
      Number(chada);

    runningBalance += Number(driver_adv) - totalExpense;

    return {
      ...item,
      totalExpense,
      balance: runningBalance
    };
  });

  // Calculate totals (without TADA)
  const calculateFooterTotals = () => {
    return rowsWithBalance.reduce(
      (acc, item) => {
        acc.commission += Number(item.driver_commission || 0);
        acc.advance += Number(item.driver_adv || 0);
        acc.totalExpense += item.totalExpense;
        acc.balance = item.balance; // Last balance will be the final balance
        return acc;
      },
      {
        commission: 0,
        advance: 0,
        totalExpense: 0,
        balance: openingBalance
      }
    );
  };

  const footerTotals = calculateFooterTotals();

  // Calculate final balance including TADA if applicable
const getFinalBalance = () => {
  let balance = footerTotals.balance;

  if (selectedDriver && tadaAmounts[selectedDriver]) {
    balance -= tadaAmounts[selectedDriver].amount;
  }

  // Deduct driver commission as well
  balance -= footerTotals.commission;

  return balance;
}
  const finalBalance = getFinalBalance();

  // Excel export
  const exportDriversToExcel = () => {
    const dataToExport = rowsWithBalance.map((item) => ({
      Date: item.date,
      Driver: item.driver_name,
      Load: item.load_point,
      Unload: item.unload_point,
      Commission: item.driver_commission,
      Advance: item.driver_adv,
      Labor: item.labor,
      Parking: item.parking_cost,
      Night: item.night_guard,
      Toll: item.toll_cost,
      Ferry: item.feri_cost,
      Police: item.police_cost,
      Chada: item.chada,
      Total_Expense: item.totalExpense,
      Balance: item.balance
    }));

    // Add TADA row if a specific driver is selected
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      dataToExport.push({
        Date: "TADA Total",
        Driver: selectedDriver,
        Load: "",
        Unload: "",
        Commission: "",
        Advance: "",
        Labor: "",
        Parking: "",
        Night: "",
        Toll: "",
        Ferry: "",
        Police: "",
        Chada: "",
        Total_Expense: tadaAmounts[selectedDriver].amount,
        Balance: finalBalance
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Ledger");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.xlsx`);
  };

  // PDF export
  const exportDriversToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Date",
      "Driver",
      "Load",
      "Unload",
      "Commission",
      "Advance",
      "Labor",
      "Parking",
      "Night",
      "Toll",
      "Ferry",
      "Police",
      "Chada",
      "Total Expense",
      "Balance",
    ];

    let pdfRows = [];

    rowsWithBalance.forEach((item, index) => {
      pdfRows.push([
        index + 1,
        item.date || "",
        item.driver_name || "",
        item.load_point || "",
        item.unload_point || "",
        item.driver_commission || "0",
        item.driver_adv || "0",
        item.labor || "0",
        item.parking_cost || "0",
        item.night_guard || "0",
        item.toll_cost || "0",
        item.feri_cost || "0",
        item.police_cost || "0",
        item.chada || "0",
        item.totalExpense || "0",
        item.balance < 0 ? `(${Math.abs(item.balance)})` : item.balance,
      ]);
    });

    // Add TADA row if a specific driver is selected
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      pdfRows.push([
        "",
        "TADA Total",
        selectedDriver,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        tadaAmounts[selectedDriver].amount,
        finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance
      ]);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: pdfRows,
      startY: 20,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      theme: "grid",
    });

    doc.save(`Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.pdf`);
  };

  // Print function
  const printDriversTable = () => {
    const content = document.getElementById("driver-ledger-table").innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Driver Ledger</title>
          <style>
            table, th, td {
              border: 1px solid black;
              border-collapse: collapse;
            }
            th, td {
              padding: 4px;
              font-size: 12px;
            }
            table {
              width: 100%;
            }
            .tada-row {
              font-weight: bold;
              background-color: #f0f0f0;
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="border border-gray-200 md:p-4 rounded-xl">
      <div className="overflow-hidden overflow-x-auto max-w-5xl mx-auto">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            Driver ledger : {selectedDriver || "All Drivers"} {selectedMonth && `(${selectedMonth})`}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Export and Driver Dropdown */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportDriversToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
            <button
              onClick={exportDriversToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>
            <button
              onClick={printDriversTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
        </div>

        {/* Month Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="w-[50%]">
              <div className="relative w-full">
                <label className="text-primary text-sm font-semibold">Select Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {setSelectedMonth(e.target.value)
                    // setCurrentPage(0);
                  }}
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
            {/* Driver dropdown */}
            <div className="w-[50%]">
              <div className="relative w-full">
                <label className="text-primary text-sm font-semibold">
                  Select Driver
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                >
                  <option value="">All Drivers</option>
                  {driverNames.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>
          </div>
        )}

        {/* TADA Summary */}
        {selectedDriver && tadaAmounts[selectedDriver] && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-primary">TADA Summary for {selectedDriver}</h3>
            <p>Total Days Present: {tadaAmounts[selectedDriver].days}</p>
            <p>Total TADA Amount: {tadaAmounts[selectedDriver].amount} BDT (300 BDT per day)</p>
          </div>
        )}

        {/* Table with scroll */}
        <div id="driver-ledger-table" className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead>
               <tr className="font-bold bg-gray-100">
                    <td colSpan={14} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>Final Balance (After TADA Deduction):</span>
                        <span>
                          {finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance}  BDT
                        </span>
                      </div>
                    </td>
                  </tr>
              <tr>
                <th rowSpan="2" className="border px-2 py-1">
                  Date
                </th>
                <th colSpan="3" className="border py-1">
                  Particulars
                </th>
                <th rowSpan="2" className="border px-2 py-1">
                  Advance
                </th>
                <th colSpan="8" className="border px-2 py-1">
                  Expense
                </th>
                <th rowSpan="2" className="border py-1">
                  <p className="border-b">
  Opening Balance: {selectedDriver ? driverOpeningBalances[selectedDriver] || 0 : 0}
</p>
Balance

                </th>
              </tr>
              <tr>
                <th className="border px-2 py-1">Load</th>
                <th className="border px-2 py-1">Unload</th>
                <th className="border px-2 py-1">Commission</th>
                <th className="border px-2 py-1">Labor</th>
                <th className="border px-2 py-1">Parking</th>
                <th className="border px-2 py-1">Night</th>
                <th className="border px-2 py-1">Toll</th>
                <th className="border px-2 py-1">Ferry</th>
                <th className="border px-2 py-1">Police</th>
                <th className="border px-2 py-1">Chada</th>
                <th className="border px-2 py-1">Total</th>
              </tr>
            </thead>
            <tbody className="overflow-x-auto">
              {rowsWithBalance.map((item, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{item.date}</td>
                  <td className="border px-2 py-1">{item.load_point}</td>
                  <td className="border px-2 py-1">{item.unload_point}</td>
                  <td className="border px-2 py-1">{item.driver_commission}</td>
                  <td className="border px-2 py-1">{item.driver_adv}</td>
                  <td className="border px-2 py-1">{item.labor}</td>
                  <td className="border px-2 py-1">{item.parking_cost}</td>
                  <td className="border px-2 py-1">{item.night_guard}</td>
                  <td className="border px-2 py-1">{item.toll_cost}</td>
                  <td className="border px-2 py-1">{item.feri_cost}</td>
                  <td className="border px-2 py-1">{item.police_cost}</td>
                  <td className="border px-2 py-1">{item.chada}</td>
                  <td className="border px-2 py-1">{item.totalExpense}</td>
                  <td className="border px-2 py-1">
                    {item.balance < 0 ? `(${Math.abs(item.balance)})` : item.balance}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td colSpan={3} className="border px-2 py-1 text-right">
                  Total:
                </td>
                <td className="border px-2 py-1">{footerTotals.commission}</td>
                <td className="border px-2 py-1">{footerTotals.advance}</td>
                <td colSpan={7} className="border px-2 py-1"></td>
                <td className="border px-2 py-1">
                  {footerTotals.totalExpense}
                </td>
                <td className="border px-2 py-1">
                  {footerTotals.balance < 0 ? `(${Math.abs(footerTotals.balance)})` : footerTotals.balance}
                </td>
              </tr>
              
              {/* TADA Calculation in Footer */}
              {selectedDriver && tadaAmounts[selectedDriver] && (
                <>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={14} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>Balance:</span>
                        <span>
                          {footerTotals.balance < 0 
                            ? `(${Math.abs(footerTotals.balance)})` 
                            : footerTotals.balance} BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={14} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>TADA Calculation:</span>
                        <span>
                          {tadaAmounts[selectedDriver].days} days × 300 = {tadaAmounts[selectedDriver].amount} BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={14} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>Driver Commission:</span>
                        <span>
                          {footerTotals.commission} BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={14} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>Final Balance (After TADA Deduction):</span>
                        <span>
                          {finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance}  BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                </>
              )}
              
              {/* Final Balance Row when no driver is selected */}
              {!selectedDriver && (
                <tr className="font-bold bg-gray-100">
                  <td colSpan={3} className="border px-2 py-1 text-right">
                    Final Balance:
                  </td>
                  <td colSpan={11} className="border px-8 py-1 text-right">
                    {footerTotals.balance < 0 ? `(${Math.abs(footerTotals.balance)})` : footerTotals.balance}
                  </td>
                </tr>
              )}
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

export default DriverLedger;
