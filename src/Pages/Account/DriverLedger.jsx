// import axios from "axios";
// import { useEffect, useState } from "react";
// import { MdOutlineArrowDropDown } from "react-icons/md";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
// import { toNumber } from "../../hooks/toNumber";
// import { tableFormatDate } from "../../components/Shared/formatDate";
// import api from "../../utils/axiosConfig";

// const DriverLedger = () => {
//   const [driver, setDriver] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDriver, setSelectedDriver] = useState("");
//   const [driverOpeningBalances, setDriverOpeningBalances] = useState({});
//   const openingBalance = selectedDriver
//     ? driverOpeningBalances[selectedDriver] || 0
//     : 0;
//   const TADA_RATE = 300;
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 10;

//   // driver
//   useEffect(() => {
//     api
//       .get(`/driver`)
//       .then((res) => {
//         if (res.data.status === "Success") {
//           const driverList = res.data.data;
//           // Store opening balances by driver name
//           const openingBalances = {};
//           driverList.forEach((driver) => {
//             openingBalances[driver.driver_name] =
//               toNumber(driver.opening_balance) || 0;
//           });
//           setDriverOpeningBalances(openingBalances);
//         }
//       })
//       .catch((err) => console.error("Error fetching driver list:", err));
//   }, []);

//   // Month filter state
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [showFilter, setShowFilter] = useState(false);

//   // Fetch driver ledger data
//   useEffect(() => {
//     api
//       .get(`/driverLedger`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setDriver(response.data.data);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching driver data:", error);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p className="text-center mt-16">Loading Driver...</p>;

//   const driverNames = [...new Set(driver.map((d) => d.driver_name))];

//   // Get unique months from data for dropdown
//   const availableMonths = [
//     ...new Set(
//       driver.map((item) => {
//         const date = new Date(item.date);
//         return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
//           2,
//           "0"
//         )}`;
//       })
//     ),
//   ].sort();

//   // Filter by driver and month
//   const filteredDriver = driver.filter((d) => {
//     const matchesDriver = selectedDriver
//       ? d.driver_name === selectedDriver
//       : true;
//     const matchesMonth = selectedMonth
//       ? new Date(d.date).toISOString().slice(0, 7) === selectedMonth
//       : true;
//     return matchesDriver && matchesMonth;
//   });

//   // Pagination logic
//   // const pageCount = Math.ceil(filteredDriver.length / itemsPerPage);
//   // const offset = currentPage * itemsPerPage;
//   // const currentItems = filteredDriver.slice(offset, offset + itemsPerPage);

//   // const handlePageClick = ({ selected }) => {
//   //   setCurrentPage(selected);
//   // };

//   // Calculate TADA (300 BDT per day) for each unique date per driver
//   const calculateTADA = () => {
//     const tadaData = {};

//     filteredDriver.forEach((item) => {
//       if (!tadaData[item.driver_name]) {
//         tadaData[item.driver_name] = new Set();
//       }
//       // Extract just the date part (YYYY-MM-DD) without time
//       const dateOnly = item.date.split("T")[0];
//       tadaData[item.driver_name].add(dateOnly);
//     });

//     const result = {};
//     Object.keys(tadaData).forEach((driver) => {
//       result[driver] = {
//         days: tadaData[driver].size,
//         amount: tadaData[driver].size * TADA_RATE,
//       };
//     });

//     return result;
//   };

//   const tadaAmounts = calculateTADA();

//   // Calculate running balance and totals (without TADA)
//   let runningBalance = openingBalance;
//   const rowsWithBalance = filteredDriver.map((item) => {
//     const {
//       labor = 0,
//       parking_cost = 0,
//       night_guard = 0,
//       toll_cost = 0,
//       feri_cost = 0,
//       police_cost = 0,
//       chada = 0,
//       driver_adv = 0,
//     } = item;

//     const totalExpense =
//       toNumber(labor) +
//       toNumber(parking_cost) +
//       toNumber(night_guard) +
//       toNumber(toll_cost) +
//       toNumber(feri_cost) +
//       toNumber(police_cost) +
//       toNumber(chada);

//     runningBalance += toNumber(driver_adv) - totalExpense;

//     return {
//       ...item,
//       totalExpense,
//       balance: runningBalance,
//     };
//   });

//   // Calculate totals (without TADA)
//   const calculateFooterTotals = () => {
//     return rowsWithBalance.reduce(
//       (acc, item) => {
//         acc.commission += Number(item.driver_commission || 0);
//         acc.advance += Number(item.driver_adv || 0);
//         acc.totalExpense += item.totalExpense;
//         acc.balance = item.balance; // Last balance will be the final balance
//         return acc;
//       },
//       {
//         commission: 0,
//         advance: 0,
//         totalExpense: 0,
//         balance: openingBalance,
//       }
//     );
//   };

//   const footerTotals = calculateFooterTotals();

//   // Calculate final balance including TADA if applicable
//   const getFinalBalance = () => {
//     let balance = footerTotals.balance;

//     if (selectedDriver && tadaAmounts[selectedDriver]) {
//       balance -= tadaAmounts[selectedDriver].amount;
//     }

//     // Deduct driver commission as well
//     balance -= footerTotals.commission;

//     return balance;
//   };
//   const finalBalance = getFinalBalance();

//   // Excel export
//   const exportDriversToExcel = () => {
//     const dataToExport = rowsWithBalance.map((item) => ({
//       Date: item.date,
//       Driver: item.driver_name,
//       Load: item.load_point,
//       Unload: item.unload_point,
//       Commission: item.driver_commission,
//       Advance: item.driver_adv,
//       Labor: item.labor,
//       Parking: item.parking_cost,
//       Night: item.night_guard,
//       Toll: item.toll_cost,
//       Ferry: item.feri_cost,
//       Police: item.police_cost,
//       Chada: item.chada,
//       Total_Expense: item.totalExpense,
//       Balance: item.balance,
//     }));

//     // Add TADA row if a specific driver is selected
//     if (selectedDriver && tadaAmounts[selectedDriver]) {
//       dataToExport.push({
//         Date: "TADA Total",
//         Driver: selectedDriver,
//         Load: "",
//         Unload: "",
//         Commission: "",
//         Advance: "",
//         Labor: "",
//         Parking: "",
//         Night: "",
//         Toll: "",
//         Ferry: "",
//         Police: "",
//         Chada: "",
//         Total_Expense: tadaAmounts[selectedDriver].amount,
//         Balance: finalBalance,
//       });
//     }

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Driver Ledger");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(
//       data,
//       `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.xlsx`
//     );
//   };

//   // PDF export
//   const exportDriversToPDF = () => {
//     const doc = new jsPDF("landscape");

//     const tableColumn = [
//       "SL.",
//       "Date",
//       "Driver",
//       "Load",
//       "Unload",
//       "Commission",
//       "Advance",
//       "Labor",
//       "Parking",
//       "Night",
//       "Toll",
//       "Ferry",
//       "Police",
//       "Chada",
//       "Total Expense",
//       "Balance",
//     ];

//     let pdfRows = [];

//     rowsWithBalance.forEach((item, index) => {
//       pdfRows.push([
//         index + 1,
//         item.date || "",
//         item.driver_name || "",
//         item.load_point || "",
//         item.unload_point || "",
//         item.driver_commission || "0",
//         item.driver_adv || "0",
//         item.labor || "0",
//         item.parking_cost || "0",
//         item.night_guard || "0",
//         item.toll_cost || "0",
//         item.feri_cost || "0",
//         item.police_cost || "0",
//         item.chada || "0",
//         item.totalExpense || "0",
//         item.balance < 0 ? `(${Math.abs(item.balance)})` : item.balance,
//       ]);
//     });

//     // Add TADA row if a specific driver is selected
//     if (selectedDriver && tadaAmounts[selectedDriver]) {
//       pdfRows.push([
//         "",
//         "TADA Total",
//         selectedDriver,
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         "",
//         tadaAmounts[selectedDriver].amount,
//         finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance,
//       ]);
//     }

//     autoTable(doc, {
//       head: [tableColumn],
//       body: pdfRows,
//       startY: 20,
//       styles: {
//         fontSize: 9,
//         cellPadding: 3,
//       },
//       headStyles: {
//         fillColor: [17, 55, 91],
//         textColor: [255, 255, 255],
//         halign: "left",
//       },
//       bodyStyles: {
//         textColor: [17, 55, 91],
//       },
//       alternateRowStyles: {
//         fillColor: [245, 245, 245],
//       },
//       theme: "grid",
//     });

//     doc.save(
//       `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.pdf`
//     );
//   };

//   // Print function
//   const printDriversTable = () => {
//     const content = document.getElementById("driver-ledger-table").innerHTML;
//     const printWindow = window.open("", "", "width=900,height=700");
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Print Driver Ledger</title>
//           <style>
//             table, th, td {
//               border: 1px solid black;
//               border-collapse: collapse;
//             }
//             th, td {
//               padding: 4px;
//               font-size: 12px;
//             }
//             table {
//               width: 100%;
//             }
//             .tada-row {
//               font-weight: bold;
//               background-color: #f0f0f0;
//             }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   return (
//     <div className="border border-gray-200 md:p-4 rounded-xl">
//       <div className="overflow-hidden overflow-x-auto max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
//             অপারেটর/ড্রাইভার লেজার : {selectedDriver || "অপারেটর/ড্রাইভার"}{" "}
//             {selectedMonth && `(${selectedMonth})`}
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>

//         {/* Export and Driver Dropdown */}
//         <div className="md:flex items-center justify-between mb-4">
//           <div className="flex gap-1 md:gap-3 flex-wrap">
//             <button
//               onClick={exportDriversToExcel}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFileExcel className="" />
//               এক্সেল
//             </button>

//             <button
//               onClick={printDriversTable}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaPrint className="" />
//               প্রিন্ট
//             </button>
//           </div>
//         </div>

//         {/* Month Filter Section */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="w-full">
//               <div className="relative w-full">
//                 <label className="text-primary text-sm font-semibold">
//                   মাস বাছাই
//                 </label>
//                 <select
//                   value={selectedMonth}
//                   onChange={(e) => {
//                     setSelectedMonth(e.target.value);
//                     // setCurrentPage(0);
//                   }}
//                   className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                 >
//                   <option value="">All Months</option>
//                   {/* {availableMonths.map((month, idx) => (
//   <option key={idx} value={month}>
//     {month}
//   </option>
// ))} */}
//                   {availableMonths.map((month, idx) => {
//                     const [year, monthNum] = month.split("-");
//                     const date = new Date(`${month}-01`);
//                     const monthName = date.toLocaleString("default", {
//                       month: "long",
//                     }); // e.g., July
//                     return (
//                       <option key={idx} value={month}>
//                         {`${monthName}-${year}`}
//                       </option>
//                     );
//                   })}
//                 </select>
//               </div>
//             </div>
//             {/* Driver dropdown */}
//             <div className="w-full">
//               <div className="relative w-full">
//                 <label className="text-primary text-sm font-semibold">
//                   অপারেটর/ড্রাইভার নির্বাচন করুন
//                 </label>
//                 <select
//                   value={selectedDriver}
//                   onChange={(e) => setSelectedDriver(e.target.value)}
//                   className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
//                 >
//                   <option value="">All Drivers</option>
//                   {driverNames.map((name, idx) => (
//                     <option key={idx} value={name}>
//                       {name}
//                     </option>
//                   ))}
//                 </select>
//                 <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//               </div>
//             </div>
//              <button
//                  onClick={() => {
//     setSelectedDriver("");
//     setSelectedMonth("");   
//     setShowFilter(false);    
//   }}
//                 className="w-[12rem] mt-6 bg-gradient-to-r from-primary to-primary text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                  মুছে ফেলুন
//               </button>
//           </div>
//         )}

//         {/* TADA Summary */}
//         {selectedDriver && tadaAmounts[selectedDriver] && (
//           <div className="mb-4 p-3 bg-blue-50 rounded-md">
//             <h3 className="font-semibold text-primary">
//               {selectedDriver}-এর টিএডিএ সংক্ষিপ্তসার
//             </h3>
//             <p>মোট উপস্থিত দিনের সংখ্যা: {tadaAmounts[selectedDriver].days}</p>
//             <p>
//               মোট টিএডিএ পরিমাণ: {tadaAmounts[selectedDriver].amount} BDT (প্রতি
//               দিন 300 BDT)
//             </p>
//           </div>
//         )}

//         {/* Table with scroll */}
//         <div id="driver-ledger-table" className="overflow-x-auto">
//           <table className="min-w-full text-sm text-left text-gray-900">
//             <thead>
//               <tr className="font-bold bg-gray-100">
//                 <td colSpan={15} className="border px-2 py-1">
//                   <div className="flex justify-between">
//                     <span>Final Balance (After TADA Deduction):</span>
//                     <span>
//                       {finalBalance < 0
//                         ? `(${Math.abs(finalBalance)})`
//                         : finalBalance}{" "}
//                       BDT
//                     </span>
//                   </div>
//                 </td>
//               </tr>
//               <tr>
//                 <th rowSpan="2" className="border px-2 py-1">
//                   তারিখ
//                 </th>
//                 <th colSpan="4" className="border py-1">
//                   বিবরণ
//                 </th>
//                 <th rowSpan="2" className="border px-2 py-1">
//                   অগ্রিম
//                 </th>
//                 <th colSpan="8" className="border px-2 py-1">
//                   খরচ
//                 </th>
//                 <th rowSpan="2" className="border py-1">
//                   <p className="border-b">
//                     শুরুর ব্যালেন্স:{" "}
//                     {selectedDriver
//                       ? driverOpeningBalances[selectedDriver] || 0
//                       : 0}
//                   </p>
//                   অবশিষ্ট ব্যালেন্স
//                 </th>
//               </tr>
//               <tr>
//                 <th className="border px-2 py-1">কাজের জায়গা</th>
//                 <th className="border px-2 py-1">লোড</th>
//                 <th className="border px-2 py-1">আনলোড</th>
//                 <th className="border px-2 py-1">কমিশন</th>
//                 <th className="border px-2 py-1">শ্রম</th>
//                 <th className="border px-2 py-1">পার্কিং</th>
//                 <th className="border px-2 py-1">নাইট চার্জ</th>
//                 <th className="border px-2 py-1">টোল</th>
//                 <th className="border px-2 py-1">ফেরি</th>
//                 <th className="border px-2 py-1">পুলিশ</th>
//                 <th className="border px-2 py-1">চাডা</th>
//                 <th className="border px-2 py-1">মোট</th>
//               </tr>
//             </thead>
//             <tbody className="overflow-x-auto">
//               {rowsWithBalance.map((item, index) => (
//                 <tr key={index}>
//                   <td className="border px-2 py-1">{tableFormatDate(item.date)}</td>
//                   <td className="border px-2 py-1">
//             {item.working_area || <span className="flex justify-center items-center">--</span>}
//           </td>
//                  <td className="border px-2 py-1">
//             {item.load_point || <span className="flex justify-center items-center">--</span>}
//           </td>
//                   <td className="border px-2 py-1">
//             {item.unload_point || <span className="flex justify-center items-center">--</span>}
//           </td>
//                   <td className="border px-2 py-1">{toNumber(item.driver_commission)}</td>
//                   <td className="border px-2 py-1">{toNumber( )}</td>
//                   <td className="border px-2 py-1">{toNumber(item.labor)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.parking_cost)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.night_guard)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.toll_cost)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.feri_cost)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.police_cost)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.chada)}</td>
//                   <td className="border px-2 py-1">{toNumber(item.totalExpense)}</td>
//                   <td className="border px-2 py-1">
//                     {item.balance < 0
//                       ? `(${Math.abs(item.balance)})`
//                       : item.balance}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>

//             <tfoot>
//               <tr className="font-bold bg-gray-100">
//                 <td colSpan={4} className="border px-2 py-1 text-right">
//                   Total:
//                 </td>
//                 <td className="border px-2 py-1">{footerTotals.commission}</td>
//                 <td className="border px-2 py-1">{footerTotals.advance}</td>
//                 <td colSpan={7} className="border px-2 py-1"></td>
//                 <td className="border px-2 py-1">
//                   {footerTotals.totalExpense}
//                 </td>
//                 <td className="border px-2 py-1">
//                   {footerTotals.balance < 0
//                     ? `(${Math.abs(footerTotals.balance)})`
//                     : footerTotals.balance}
//                 </td>
//               </tr>

//               {/* TADA Calculation in Footer */}
//               {selectedDriver && tadaAmounts[selectedDriver] && (
//                 <>
//                   <tr className="font-bold bg-gray-100">
//                     <td colSpan={15} className="border px-2 py-1">
//                       <div className="flex justify-between">
//                         <span>Balance:</span>
//                         <span>
//                           {footerTotals.balance < 0
//                             ? `(${Math.abs(footerTotals.balance)})`
//                             : footerTotals.balance}{" "}
//                           BDT
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                   <tr className="font-bold bg-gray-100">
//                     <td colSpan={15} className="border px-2 py-1">
//                       <div className="flex justify-between">
//                         <span> খোরাকি:</span>
//                         <span>
//                           {tadaAmounts[selectedDriver].days} days × 300 ={" "}
//                           {tadaAmounts[selectedDriver].amount} BDT
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                   <tr className="font-bold bg-gray-100">
//                     <td colSpan={15} className="border px-2 py-1">
//                       <div className="flex justify-between">
//                         <span>ড্রাইভারের কমিশন:</span>
//                         <span>{footerTotals.commission} BDT</span>
//                       </div>
//                     </td>
//                   </tr>
//                   <tr className="font-bold bg-gray-100">
//                     <td colSpan={15} className="border px-2 py-1">
//                       <div className="flex justify-between">
//                         <span>চূড়ান্ত ব্যালেন্স (টিএডিএ কেটে নেওয়ার পরে)</span>
//                         <span>
//                           {finalBalance < 0
//                             ? `(${Math.abs(finalBalance)})`
//                             : finalBalance}{" "}
//                           BDT
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 </>
//               )}

//               {/* Final Balance Row when no driver is selected */}
//               {!selectedDriver && (
//                 <tr className="font-bold bg-gray-100">
//                   <td colSpan={4} className="border px-2 py-1 text-right">
//                     Final Balance:
//                   </td>
//                   <td colSpan={11} className="border px-8 py-1 text-right">
//                     {footerTotals.balance < 0
//                       ? `(${Math.abs(footerTotals.balance)})`
//                       : footerTotals.balance}
//                   </td>
//                 </tr>
//               )}
//             </tfoot>
//           </table>
//         </div>
//         {/* Pagination */}
//         {/* {pageCount > 1 && (
//           <div className="mt-4 flex justify-center">
//             <ReactPaginate
//               previousLabel={"Previous"}
//               nextLabel={"Next"}
//               breakLabel={"..."}
//               pageCount={pageCount}
//               marginPagesDisplayed={2}
//               pageRangeDisplayed={5}
//               onPageChange={handlePageClick}
//               containerClassName={"flex items-center gap-1"}
//               pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
//               previousClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
//               nextClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
//               breakClassName={"px-3 py-1"}
//               activeClassName={"bg-primary text-white border-primary"}
//               forcePage={currentPage}
//             />
//           </div>
//         )} */}
//       </div>
//     </div>
//   );
// };

// export default DriverLedger;




import { useEffect, useState } from "react";
import { MdOutlineArrowDropDown } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilter } from "react-icons/fa";
import api from "../../utils/axiosConfig";
import DatePicker from "react-datepicker";

const DriverLedger = () => {
  const [driver, setDriver] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverList, setDriverList] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Driver selection state
  const [selectedDriver, setSelectedDriver] = useState("");
  const [driverOpeningBalances, setDriverOpeningBalances] = useState({});
  const openingBalance = selectedDriver
    ? driverOpeningBalances[selectedDriver] || 0
    : 0;
  const TADA_RATE = 0;

  // helper states
  const [helpers, setHelpers] = useState([]);
  const [selectedHelper, setSelectedHelper] = useState("");

  useEffect(() => {
    // Fetch helpers data
    api
      .get(`/helper`)
      .then((response) => {
        if (response.data.status === "Success") {
          // Store helpers data directly, assuming salary is part of each helper object
          setHelpers(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching helpers:", error);
      });
  }, []);

  // driver data fetch
  useEffect(() => {
    api
      .get(`/driver`)
      .then((res) => {
        // if (res.data.status === "Success") {
        const drivers = res.data;
        const activeDrivers = drivers.filter(
          (item) => item.status === "Active"
        );
        setDriverList(activeDrivers);
        // Store opening balances by driver name
        const openingBalances = {};
        drivers.forEach((driver) => {
          openingBalances[driver.driver_name] =
            Number(driver.opening_balance) || 0;
        });
        setDriverOpeningBalances(openingBalances);
        // }
      })
      .catch((err) => console.error("Error fetching driver list:", err));
  }, []);

  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Fetch driver ledger data
  useEffect(() => {
    api
      .get(`/driverLedger`)
      .then((response) => {
        // if (response.data.status === "Success") {
        setDriver(response.data);
        // }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  const driverNames = [...new Set(driver.map((d) => d.driver_name))];

  // Get unique months from data for dropdown
  const availableMonths = [
    ...new Set(
      driver.map((item) => {
        const date = new Date(item.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      })
    ),
  ].sort();

  // helper function
  const toNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") {
      if (val.trim().toLowerCase() === "null" || val.trim() === "") return 0;
    }
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // Filter by driver and month
  // const filteredDriver = driver.filter((d) => {
  //   const matchesDriver = selectedDriver
  //     ? d.driver_name === selectedDriver
  //     : true;
  //   const matchesMonth = selectedMonth
  //     ? new Date(d.date).toISOString().slice(0, 7) === selectedMonth
  //     : true;
  //   return matchesDriver && matchesMonth;
  // });

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };
  // filter
  const filteredDriver = driver.filter((d) => {
    const matchesDriver = selectedDriver ? d.driver_name === selectedDriver : true;

    const dateOnly = d.date?.split("T")[0];

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const matchesStart = start ? dateOnly >= start : true;
    const matchesEnd = end ? dateOnly <= end : true;

    return matchesDriver && matchesStart && matchesEnd;
  });



  // Calculate TADA (300 BDT per day) for each unique date per driver
  const calculateTADA = () => {
    const tadaData = {};
    filteredDriver.forEach((item) => {
      if (!tadaData[item.driver_name]) {
        tadaData[item.driver_name] = new Set();
      }
      // Extract just the date part (YYYY-MM-DD) without time
      const dateOnly = item.date?.split("T")[0];
      tadaData[item.driver_name].add(dateOnly);
    });
    const result = {};
    Object.keys(tadaData).forEach((driver) => {
      result[driver] = {
        days: tadaData[driver].size,
        amount: tadaData[driver].size * TADA_RATE,
      };
    });
    return result;
  };
  const tadaAmounts = calculateTADA();

  // Calculate running balance and totals (without TADA)
  let runningBalance = openingBalance;
  const rowsWithBalance = filteredDriver.map((item) => {
    const {
      labor = 0,
      parking_cost = 0,
      night_guard = 0,
      toll_cost = 0,
      feri_cost = 0,
      police_cost = 0,
      chada = 0,
      challan_cost = 0,
      others_cost = 0,
      fuel_cost = 0,
      driver_adv = 0,
    } = item;
    const totalExpense =
      toNumber(labor) +
      toNumber(parking_cost) +
      toNumber(night_guard) +
      toNumber(toll_cost) +
      toNumber(feri_cost) +
      toNumber(police_cost) +
      toNumber(chada) +
      toNumber(challan_cost) +
      toNumber(others_cost) +
      toNumber(fuel_cost);
    runningBalance += Number(driver_adv) - totalExpense;
    return {
      ...item,
      totalExpense,
      balance: runningBalance,
    };
  });

  // Calculate totals (without TADA)
  const calculateFooterTotals = () => {
    return rowsWithBalance.reduce(
      (acc, item) => {
        acc.commission += toNumber(item.driver_commission || 0);
        acc.advance += toNumber(item.driver_adv || 0);
        acc.totalExpense += item.totalExpense;
        acc.balance = item.balance; // Last balance will be the final balance
        return acc;
      },
      {
        commission: 0,
        advance: 0,
        totalExpense: 0,
        balance: openingBalance,
      }
    );
  };
  const footerTotals = calculateFooterTotals();

  const currentHelperSalary = selectedHelper
    ? helpers.find((h) => h.helper_name === selectedHelper)?.salary || 0
    : 0;

  // Calculate final balance including TADA, commission, and helper salary
  const getFinalBalance = () => {
    let balance = footerTotals.balance;
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      balance -= tadaAmounts[selectedDriver].amount;
    }
    // Deduct driver commission
    balance -= footerTotals.commission;
    // Deduct helper salary if a helper is selected
    if (selectedHelper) {
      balance -= toNumber(currentHelperSalary); // Use currentHelperSalary
    }
    return balance;
  };
  const finalBalance = getFinalBalance();

  // Excel export
  const exportDriversToExcel = () => {
    const dataToExport = rowsWithBalance.map((item) => ({
      Date: item.date,
      Driver: item.driver_name,
      "Work Place": item.work_place,
      "Work Time": item.work_time,
      Load: item.load_point,
      Unload: item.unload_point,
      Commission: item.driver_commission,
      Advance: item.driver_adv,
      Labor: item.labor,
      Parking: toNumber(item.parking_cost),
      Night: toNumber(item.night_guard),
      Toll: toNumber(item.toll_cost),
      Ferry: toNumber(item.feri_cost),
      Police: toNumber(item.police_cost),
      Chada: toNumber(item.chada),
      Fuel: toNumber(item.fuel_cost),
      Callan: toNumber(item.callan_cost),
      Others: toNumber(item.others_cost),
      Total_Expense: toNumber(item.totalExpense),
      Balance: toNumber(item.balance),
    }));

    // Add TADA row if a specific driver is selected
    if (selectedDriver && tadaAmounts[selectedDriver]) {
      dataToExport.push({
        Date: "TADA Total",
        Driver: selectedDriver,
        "Work Place": "",
        "Work Time": "",
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
        Fuel: "",
        Callan: "",
        Others: "",
        Total_Expense: tadaAmounts[selectedDriver].amount,
        Balance: finalBalance,
      });
    }

    // Add Helper Salary row if a specific helper is selected and salary is entered
    if (selectedHelper && currentHelperSalary > 0) { // Use currentHelperSalary
      dataToExport.push({
        Date: "Helper Salary",
        Driver: selectedHelper,
        "Work Place": "",
        "Work Time": "",
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
        Fuel: "",
        Callan: "",
        Others: "",
        Total_Expense: currentHelperSalary, // Use currentHelperSalary
        Balance: finalBalance,
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
    saveAs(
      data,
      `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.xlsx`
    );
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
      // "Commission",
      "Advance",
      "Labor",
      "Parking",
      "Night",
      "Toll",
      "Ferry",
      "Police",
      "Chada",
      "Fuel",
      "Callan",
      "Others",
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
        // item.driver_commission || "0",
        item.driver_adv || "0",
        item.labor || "0",
        item.parking_cost || "0",
        item.night_guard || "0",
        item.toll_cost || "0",
        item.feri_cost || "0",
        item.police_cost || "0",
        item.chada || "0",
        item.fuel_cost || "0",
        item.callan_cost || "0",
        item.others_cost || "0",
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
        "",
        "",
        "",
        tadaAmounts[selectedDriver].amount,
        finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance,
      ]);
    }

    // Add Helper Salary row if a specific helper is selected and salary is entered
    if (selectedHelper && currentHelperSalary > 0) { // Use currentHelperSalary
      pdfRows.push([
        "",
        "Helper Salary",
        selectedHelper,
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
        "",
        "",
        "",
        currentHelperSalary, // Use currentHelperSalary
        finalBalance < 0 ? `(${Math.abs(finalBalance)})` : finalBalance,
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
    doc.save(
      `Driver_Ledger_${selectedDriver || "All"}_${selectedMonth || "All"}.pdf`
    );
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
            .text-red-500 {
              color: #ef4444; /* Tailwind's red-500 */
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <p className="text-center mt-16">Loading Driver...</p>;

  return (
    <div className="p-2">
      <div className="w-[24rem] md:w-full  overflow-x-auto mx-auto border border-gray-200 p-2 py-10 md:p-4 rounded-md">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-3">
            অপারেটর/ড্রাইভার লেজার  : {selectedDriver || "অপারেটর/ড্রাইভার"}{" "}
            {selectedMonth && `(${selectedMonth})`}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>
        {/* Export and Driver Dropdown */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap font-semibold text-gray-700">
            <button
              onClick={exportDriversToExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              এক্সেল
            </button>
            {/* <button
              onClick={exportDriversToPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printDriversTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              প্রিন্ট
            </button>
          </div>
        </div>
        {/* Month Filter Section */}
        {showFilter && (
          <div className="flex flex-col md:flex-row gap-5 border border-gray-300 rounded shadow p-5 my-5 transition-all duration-300 pb-5">
            {/* <div className="relative w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                >
                  <option value="">All Months</option>
                  {availableMonths.map((month, idx) => (
                    <option key={idx} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div> */}
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
            {/* Driver dropdown */}
            <div className="w-full">
              <div className="relative w-full">
                {/* <label className="text-gray-700 text-sm font-semibold">
                  Select Driver
                </label> */}
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className=" w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                >
                  <option value="">অপারেটর/ড্রাইভার নির্বাচন করুন</option>
                  {driverList.map((driver, idx) => (
                    <option key={idx} value={driver.driver_name}>
                      {driver.driver_name}
                    </option>
                  ))}
                </select>

                <MdOutlineArrowDropDown className="absolute top-[13px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>
            {/* Helper dropdown */}
            {/* <div className="w-full">
              <div className="relative w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Select Helper
                </label>
                <select
                  value={selectedHelper}
                  onChange={(e) => setSelectedHelper(e.target.value)}
                  className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                >
                  <option value="">All Helper</option>
                  {helpers.map((helper, idx) => (
                    <option key={idx} value={helper.helper_name}>
                      {helper.helper_name}
                    </option>
                  ))}
                </select>
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div> */}
            <div className="w-xs">
              <button
                onClick={() => {
                  setSelectedDriver("");
                  setSelectedHelper("");
                  setStartDate("");
                  setEndDate("");
                  // setSelectedMonth("");
                  // setShowFilter(false);
                }}
                className="w-full bg-primary text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        )}
        {/* TADA Summary */}
        {/* {selectedDriver && tadaAmounts[selectedDriver] && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-primary">
              TADA Summary for {selectedDriver}
            </h3>
            <p>Total Days Present: {tadaAmounts[selectedDriver].days}</p>
            <p>
              Total TADA Amount: {tadaAmounts[selectedDriver].amount} BDT (300
              BDT per day)
            </p>
          </div>
        )} */}
        {/* Table with scroll */}
        <div id="driver-ledger-table" className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead>
              <tr>
                <th rowSpan="2" className="border px-2 py-1">
                  তারিখ
                </th>
                <th colSpan="5" className="border py-1">
                  বিবরণ
                </th>
                <th rowSpan="2" className="border px-2 py-1">
                  অগ্রিম
                </th>
                <th colSpan="11" className="border px-2 py-1">
                  খরচ
                </th>
                <th rowSpan="2" className="border py-1">
                  <p className="border-b">
                    শুরুর ব্যালেন্স:{" "}
                    {selectedDriver
                      ? driverOpeningBalances[selectedDriver] || 0
                      : 0}
                  </p>
                  ব্যালেন্স
                </th>
              </tr>
              <tr>
                <th className="border px-2 py-1">লোড</th>
                <th className="border px-2 py-1">আনলোড</th>
                <th className="border px-2 py-1">কাজের জায়গা</th>
                <th className="border px-2 py-1">কাজের সময়</th>
                <th className="border px-2 py-1">কমিশন</th>
                <th className="border px-2 py-1">শ্রমিক</th>
                <th className="border px-2 py-1">পার্কিং</th>
                <th className="border px-2 py-1">নাইট</th>
                <th className="border px-2 py-1">টোল</th>
                <th className="border px-2 py-1">ফেরি</th>
                <th className="border px-2 py-1">পুলিশ</th>
                <th className="border px-2 py-1">চাঁদা</th>
                <th className="border px-2 py-1">জ্বালানি</th>
                <th className="border px-2 py-1">চালান</th>
                <th className="border px-2 py-1">অন্যান্য</th>
                <th className="border px-2 py-1">মোট</th>
              </tr>
            </thead>
            <tbody className="overflow-x-auto">
              {rowsWithBalance.map((item, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{item.date}</td>
                  <td className="border px-2 py-1">{item.load_point}</td>
                  <td className="border px-2 py-1">{item.unload_point}</td>
                  <td className="border px-2 py-1">{item.work_place}</td>
                  <td className="border px-2 py-1">{item.work_time} h</td>
                  <td className="border px-2 py-1">{toNumber(item.driver_commission)}</td>
                  <td className="border px-2 py-1">{toNumber(item.driver_adv)}</td>
                  <td className="border px-2 py-1">{toNumber(item.labor)}</td>
                  <td className="border px-2 py-1">{toNumber(item.parking_cost)}</td>
                  <td className="border px-2 py-1">{toNumber(item.night_guard)}</td>
                  <td className="border px-2 py-1">{toNumber(item.toll_cost)}</td>
                  <td className="border px-2 py-1">{toNumber(item.feri_cost)}</td>
                  <td className="border px-2 py-1">{toNumber(item.police_cost)}</td>
                  <td className="border px-2 py-1">{toNumber(item.chada)}</td>
                  <td className="border px-2 py-1">{item.fuel_cost}</td>
                  <td className="border px-2 py-1">{item.challan_cost}</td>
                  <td className="border px-2 py-1">{item.others_cost}</td>
                  <td className="border px-2 py-1">{item.totalExpense}</td>
                  <td className="border px-2 py-1">
                    <span className={item.balance < 0 ? "text-red-500" : ""}>
                      {item.balance < 0
                        ? `(${Math.abs(item.balance)})`
                        : item.balance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td colSpan={5} className="border px-2 py-1 text-right">
                  মোট:
                </td>
                <td className="border px-2 py-1">{footerTotals.commission}</td>
                <td className="border px-2 py-1">{footerTotals.advance}</td>
                <td colSpan={10} className="border px-2 py-1"></td>
                <td className="border px-2 py-1">
                  {footerTotals.totalExpense}
                </td>
                <td className="border px-2 py-1">
                  <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                    {footerTotals.balance < 0
                      ? `(${Math.abs(footerTotals.balance)})`
                      : footerTotals.balance}
                  </span>
                </td>
              </tr>
              {/* TADA Calculation in Footer */}
              {selectedDriver && tadaAmounts[selectedDriver] && (
                <>
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={19} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span> ব্যালেন্স:</span>
                        <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                          {footerTotals.balance < 0
                            ? `(${Math.abs(footerTotals.balance)})`
                            : footerTotals.balance}{" "}
                          BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* <tr className="font-bold bg-gray-100">
                    <td colSpan={19} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>TADA Calculation:</span>
                        <span>
                          {tadaAmounts[selectedDriver].days} days × 300 ={" "}
                          {tadaAmounts[selectedDriver].amount} BDT
                        </span>
                      </div>
                    </td>
                  </tr> */}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={20} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>ড্রাইভারের কমিশন:</span>
                        <span>{footerTotals.commission} BDT</span>
                      </div>
                    </td>
                  </tr>
                  {/* Helper Salary Row */}
                  {/* {selectedHelper && (
                    <tr className="font-bold bg-gray-100">
                      <td colSpan={17} className="border px-2 py-1">
                        <div className="flex justify-between">
                          <span>Helper Salary:</span>
                          <span>{currentHelperSalary} BDT</span>
                        </div>
                      </td>
                    </tr>
                  )} */}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={20} className="border px-2 py-1">
                      <div className="flex justify-between">
                        <span>চূড়ান্ত ব্যালেন্স : </span>
                        <span className={finalBalance < 0 ? "text-red-500" : ""}>
                          {finalBalance < 0
                            ? `(${Math.abs(finalBalance)})`
                            : finalBalance}{" "}
                          BDT
                        </span>
                      </div>
                    </td>
                  </tr>
                </>
              )}
              {/* Final Balance Row when no driver is selected */}
              {!selectedDriver && (
                <tr className="font-bold bg-gray-100">
                  <td colSpan={4} className="border px-2 py-1 text-right">
                    চূড়ান্ত ব্যালেন্স:
                  </td>
                  <td colSpan={15} className="border px-8 py-1 text-right">
                    <span className={footerTotals.balance < 0 ? "text-red-500" : ""}>
                      {footerTotals.balance < 0
                        ? `(${Math.abs(footerTotals.balance)})`
                        : footerTotals.balance}
                    </span>
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverLedger;
