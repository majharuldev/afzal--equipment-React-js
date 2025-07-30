// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaTruck, FaFilter, FaPen, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { Link } from "react-router-dom";
// // export
// import { CSVLink } from "react-csv";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { saveAs } from "file-saver";
// const DailyIncome = () => {
//   const [trips, setTrips] = useState([]);
//   const [showFilter, setShowFilter] = useState(false);
//   // Date filter state
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   // search
//   const [searchTerm, setSearchTerm] = useState("");
//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   // Fetch data
//   useEffect(() => {
//     const fetchTrips = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`);
//         const sorted = res.data.data.sort(
//           (a, b) => new Date(b.trip_date) - new Date(a.trip_date)
//         );
//         setTrips(sorted);
//       } catch (err) {
//         console.error("Error fetching trips:", err);
//       }
//     };
//     fetchTrips();
//   }, []);
  
//   // search
//   const filteredIncome = trips.filter((dt) => {
//     const term = searchTerm.toLowerCase();
//     const tripDate = dt.trip_date;
//     const matchesSearch =
//       dt.trip_date?.toLowerCase().includes(term) ||
//       dt.trip_time?.toLowerCase().includes(term) ||
//       dt.load_point?.toLowerCase().includes(term) ||
//       dt.unload_point?.toLowerCase().includes(term) ||
//       dt.driver_name?.toLowerCase().includes(term) ||
//       dt.driver_contact?.toLowerCase().includes(term) ||
//       String(dt.driver_percentage).includes(term) ||
//       dt.fuel_price?.toLowerCase().includes(term) ||
//       dt.gas_price?.toLowerCase().includes(term) ||
//       dt.vehicle_number?.toLowerCase().includes(term) ||
//       dt.other_expenses?.toLowerCase().includes(term) ||
//       dt.trip_price?.toLowerCase().includes(term);
//     const matchesDateRange =
//       (!startDate || new Date(tripDate) >= new Date(startDate)) &&
//       (!endDate || new Date(tripDate) <= new Date(endDate));
//     return matchesSearch && matchesDateRange;
//   });
//   // ✅ Correct headers matching your table
//   const headers = [
//     { label: "#", key: "index" },
//     { label: "তারিখ", key: "trip_date" },
//     { label: "গাড়ি", key: "vehicle_number" },
//     { label: "লোড", key: "load_point" },
//     { label: "আনলোড", key: "unload_point" },
//     { label: "ট্রিপের ভাড়া", key: "trip_price" },
//     { label: "চলমানখরচ", key: "totalCost" }, // corrected key
//     { label: "লাভ", key: "profit" }, // corrected key
//   ];

//   // ✅ Correct CSV data mapping
//   const csvData = trips.map((dt, index) => {
//     const fuel = parseFloat(dt.fuel_price ?? "0") || 0;
//     const gas = parseFloat(dt.gas_price ?? "0") || 0;
//     const others = parseFloat(dt.other_expenses ?? "0") || 0;
//     const commission = parseFloat(dt.driver_percentage ?? "0") || 0;
//     const totalCost = (fuel + gas + others + commission).toFixed(2);
//     const profit = (
//       parseFloat(dt.trip_price ?? "0") - parseFloat(totalCost)
//     ).toFixed(2);

//     return {
//       index: index + 1,
//       trip_date: new Date(dt.trip_date).toLocaleDateString("en-GB"), // format date like in table
//       vehicle_number: dt.vehicle_number,
//       load_point: dt.load_point,
//       unload_point: dt.unload_point,
//       trip_price: dt.trip_price,
//       totalCost, // ✅ use calculated total cost
//       profit, // ✅ use calculated profit
//     };
//   });

//   // ✅ Export Excel function
//   const exportExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(csvData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Trip Data");
//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const data = new Blob([excelBuffer], { type: "application/octet-stream" });
//     saveAs(data, "dailyincome_data.xlsx");
//   };

//   // ✅ Export PDF function
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     const tableColumn = headers.map((h) => h.label);
//     const tableRows = csvData.map((row) => headers.map((h) => row[h.key]));

//     autoTable(doc, {
//       head: [tableColumn],
//       body: tableRows,
//       styles: { font: "helvetica", fontSize: 8 },
//     });

//     doc.save("dailyincome_data.pdf");
//   };

//   // ✅ Print function
//   const printTable = () => {
//     // hide specific column
//     const actionColumns = document.querySelectorAll(".action_column");
//     actionColumns.forEach((col) => {
//       col.style.display = "none";
//     });
//     const printContent = document.querySelector("table").outerHTML;
//     const WinPrint = window.open("", "", "width=900,height=650");
//     WinPrint.document.write(`
//     <html>
//       <head>
//         <title>Print</title>
//         <style>
//           table { width: 100%; border-collapse: collapse; }
//           th, td { border: 1px solid #000; padding: 8px; text-align: center; }
//         </style>
//       </head>
//       <body>${printContent}</body>
//     </html>
//   `);
//     WinPrint.document.close();
//     WinPrint.focus();
//     WinPrint.print();
//     WinPrint.close();
//   };

//   // pagination
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentTrips = filteredIncome.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(trips.length / itemsPerPage);
//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
//   };
//   const handleNextPage = () => {
//     if (currentPage < totalPages)
//       setCurrentPage((currentPage) => currentPage + 1);
//   };
//   const handlePageClick = (number) => {
//     setCurrentPage(number);
//   };

//   return (
//     <main className="">
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             <FaTruck className="text-[#11375B] text-2xl" />
//             Income List
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>

//         {/* Export & Search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <CSVLink
//               data={csvData}
//               headers={headers}
//               filename={"dailyincome_data.csv"}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               CSV
//             </CSVLink>
//             <button
//                 onClick={exportExcel}
//                 className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//               >
//                 <FaFileExcel className="" />
//                 Excel
//               </button>
            
//               <button
//                 onClick={exportPDF}
//                 className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//               >
//                 <FaFilePdf className="" />
//                 PDF
//               </button>
            
//               <button
//                 onClick={printTable}
//                 className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//               >
//                 <FaPrint className="" />
//                 Print
//               </button>
//           </div>
//           {/* search */}
//           <div className="mt-3 md:mt-0">
//             <span className="text-primary font-semibold pr-3">Search: </span>
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               placeholder="Search..."
//               className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
//             />
//           </div>
//         </div>
//         {/* Conditional Filter Section */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="relative w-full">
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 placeholder="Start date"
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>

//             <div className="relative w-full">
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 placeholder="End date"
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//              <div className="mt-3 md:mt-0 flex gap-2">
//                                       <button
//                                         onClick={() => setCurrentPage(1)}
//                                         className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                                       >
//                                         <FaFilter /> Filter
//                                       </button>
//                                     </div>
//           </div>
//         )}
//         {/* Table */}
//         <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-[#11375B] text-white capitalize text-xs">
//               <tr>
//                 <th className="px-4 py-3">#</th>
//                 <th className="px-4 py-3">Date</th>
//                 <th className="px-4 py-3">Vehicle</th>
//                 <th className="px-4 py-3">Load</th>
//                 <th className="px-4 py-3">Unload</th>
//                 {/* <th className="px-4 py-3">Customer</th> */}
//                 <th className="px-4 py-3">Trip Price</th>
//                 {/* <th className="px-4 py-3">Fine</th> */}
//                 <th className="px-4 py-3">Ongoing Expense</th>
//                 <th className="px-4 py-3">Profit</th>
//                 <th className="px-4 py-3 action_column">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-700">
//               {
//                 currentTrips.length === 0 ? (
//     <tr>
//       <td colSpan="8" className="text-center py-10 text-gray-500 italic">
//         <div className="flex flex-col items-center">
//           <svg
//             className="w-12 h-12 text-gray-300 mb-2"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           No Income data found.
//         </div>
//       </td>
//     </tr>
//   )  
//               :(currentTrips.map((trip, index) => (
//                 <tr
//                   key={trip.id || index}
//                   className="hover:bg-gray-50 transition-all"
//                 >
//                   <td className="px-4 py-4 font-bold">
//                     {indexOfFirstItem + index + 1}
//                   </td>
//                   <td className="px-4 py-4">
//                     {new Date(trip.trip_date).toLocaleDateString("en-GB")}
//                   </td>
//                   <td className="px-4 py-4">{trip.vehicle_number}</td>
//                   <td className="px-4 py-4">{trip.load_point}</td>
//                   <td className="px-4 py-4">{trip.unload_point}</td>
//                   <td className="px-4 py-4">{trip.trip_price}</td>
//                   <td className="px-4 py-4">
//                     {(
//                       Number(trip.other_expenses || 0) +
//                       Number(trip.gas_price || 0) +
//                       Number(trip.fuel_price || 0) +
//                       Number(trip.driver_percentage || 0)
//                     ).toFixed(2)}
//                     00
//                   </td>
//                   <td className="px-4 py-4">
//                     {Number(trip.trip_price || 0) -
//                       (
//                         Number(trip.other_expenses || 0) +
//                         Number(trip.gas_price || 0) +
//                         Number(trip.fuel_price || 0) +
//                         Number(trip.driver_percentage || 0)
//                       ).toFixed(2)}
//                     {/* {trip.profit || "00"} */}
//                   </td>
//                   <td className="action_column">
//                     <div className="flex justify-center">
//                       <Link to={`/UpdateDailyIncomeForm/${trip.id}`}>
//                         <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
//                           <FaPen className="text-[12px]" />
//                         </button>
//                       </Link>
//                     </div>
//                   </td>
//                 </tr>
//               )))
//               }
//             </tbody>
//           </table>
//         </div>
//         {/* pagination */}
//         {
//           currentTrips.length === 0 ? (
//             ""
//           )
//         :(<div className="mt-10 flex justify-center">
//           <div className="space-x-2 flex items-center">
//             <button
//               onClick={handlePrevPage}
//               className={`p-2 ${
//                 currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//               } rounded-sm`}
//               disabled={currentPage === 1}
//             >
//               <GrFormPrevious />
//             </button>
//             {[...Array(totalPages).keys()].map((number) => (
//               <button
//                 key={number + 1}
//                 onClick={() => handlePageClick(number + 1)}
//                 className={`px-3 py-1 rounded-sm ${
//                   currentPage === number + 1
//                     ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                     : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                 }`}
//               >
//                 {number + 1}
//               </button>
//             ))}
//             <button
//               onClick={handleNextPage}
//               className={`p-2 ${
//                 currentPage === totalPages
//                   ? "bg-gray-300"
//                   : "bg-primary text-white"
//               } rounded-sm`}
//               disabled={currentPage === totalPages}
//             >
//               <GrFormNext />
//             </button>
//           </div>
//         </div>)}
//       </div>
//     </main>
//   );
// };

// export default DailyIncome;

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { FaTruck, FaFilter, FaPen, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import { Link } from "react-router-dom"
// export
import { CSVLink } from "react-csv"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { saveAs } from "file-saver"

const DailyIncome = () => {
  const [trips, setTrips] = useState([])
  const [showFilter, setShowFilter] = useState(false)
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // search
  const [searchTerm, setSearchTerm] = useState("")
  // pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch data
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
        const sorted = res.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date), // Changed trip_date to date
        )
        setTrips(sorted)
      } catch (err) {
        console.error("Error fetching trips:", err)
      }
    }
    fetchTrips()
  }, [])

  // search and filter
  const filteredIncome = trips.filter((dt) => {
    const term = searchTerm.toLowerCase()
    const tripDate = dt.date // Changed trip_date to date
    const matchesSearch =
      dt.date
        ?.toLowerCase()
        .includes(term) || // Changed trip_date to date
      dt.trip_time?.toLowerCase().includes(term) ||
      dt.load_point?.toLowerCase().includes(term) ||
      dt.unload_point?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.driver_mobile?.toLowerCase().includes(term) || // Changed driver_contact to driver_mobile
      String(dt.driver_commission).includes(term) || // Changed driver_percentage to driver_commission
      String(dt.fuel_cost).includes(term) || // Changed fuel_price to fuel_cost
      // dt.gas_price?.toLowerCase().includes(term) || // Removed gas_price as it's not in AddTripForm
      dt.vehicle_no
        ?.toLowerCase()
        .includes(term) || // Changed vehicle_number to vehicle_no
      String(dt.others).includes(term) || // Changed other_expenses to others
      String(dt.total_rent).includes(term) || // Changed trip_price to total_rent
      String(dt.total_exp).includes(term) // Added total_exp for search

    const matchesDateRange =
      (!startDate || new Date(tripDate) >= new Date(startDate)) && (!endDate || new Date(tripDate) <= new Date(endDate))
    return matchesSearch && matchesDateRange
  })

  // Correct headers matching your table
  const headers = [
    { label: "#", key: "index" },
    { label: "তারিখ", key: "date" }, // Changed trip_date to date
    { label: "গাড়ি", key: "vehicle_no" }, // Changed vehicle_number to vehicle_no
    { label: "লোড", key: "load_point" },
    { label: "আনলোড", key: "unload_point" },
    { label: "ট্রিপের ভাড়া", key: "total_rent" }, // Changed trip_price to total_rent
    { label: "চলমানখরচ", key: "total_exp" }, // Changed totalCost to total_exp
    { label: "লাভ", key: "profit" },
  ]

  // Correct CSV data mapping
  const csvData = trips.map((dt, index) => {
    const totalRent = Number.parseFloat(dt.total_rent ?? "0") || 0 // Changed trip_price to total_rent
    const totalExp = Number.parseFloat(dt.total_exp ?? "0") || 0 // Used total_exp directly
    const profit = (totalRent - totalExp).toFixed(2)

    return {
      index: index + 1,
      date: new Date(dt.date).toLocaleDateString("en-GB"), // Changed trip_date to date
      vehicle_no: dt.vehicle_no, // Changed vehicle_number to vehicle_no
      load_point: dt.load_point,
      unload_point: dt.unload_point,
      total_rent: dt.total_rent, // Changed trip_price to total_rent
      total_exp: totalExp, // Used calculated totalExp
      profit: profit, // Used calculated profit
    }
  })

  // Export Excel function
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trip Data")
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const data = new Blob([excelBuffer], { type: "application/octet-stream" })
    saveAs(data, "dailyincome_data.xlsx")
  }

  // Export PDF function
  const exportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = headers.map((h) => h.label)
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]))
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { font: "helvetica", fontSize: 8 },
    })
    doc.save("dailyincome_data.pdf")
  }

  // Print function
  const printTable = () => {
    // hide specific column
    const actionColumns = document.querySelectorAll(".action_column")
    actionColumns.forEach((col) => {
      col.style.display = "none"
    })
    const printContent = document.querySelector("table").outerHTML
    const WinPrint = window.open("", "", "width=900,height=650")
    WinPrint.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `)
    WinPrint.document.close()
    WinPrint.focus()
    WinPrint.print()
    WinPrint.close()
  }

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrips = filteredIncome.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(trips.length / itemsPerPage)

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((currentPage) => currentPage + 1)
  }
  const handlePageClick = (number) => {
    setCurrentPage(number)
  }

  return (
    <main className="">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Income List
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
        {/* Export & Search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <CSVLink
              data={csvData}
              headers={headers}
              filename={"dailyincome_data.csv"}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              CSV
            </CSVLink>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
            <button
              onClick={exportPDF}
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
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Filter
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Load</th>
                <th className="px-4 py-3">Unload</th>
                {/* <th className="px-4 py-3">Customer</th> */}
                <th className="px-4 py-3">Trip Price</th>
                {/* <th className="px-4 py-3">Fine</th> */}
                <th className="px-4 py-3">Ongoing Expense</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3 action_column">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentTrips.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No Income data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentTrips.map((trip, index) => (
                  <tr key={trip.id || index} className="hover:bg-gray-50 transition-all">
                    <td className="px-4 py-4 font-bold">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-4">
                      {new Date(trip.date).toLocaleDateString("en-GB")} {/* Changed trip_date to date */}
                    </td>
                    <td className="px-4 py-4">{trip.vehicle_no}</td> {/* Changed vehicle_number to vehicle_no */}
                    <td className="px-4 py-4">{trip.load_point}</td>
                    <td className="px-4 py-4">{trip.unload_point}</td>
                    <td className="px-4 py-4">{trip.total_rent}</td> {/* Changed trip_price to total_rent */}
                    <td className="px-4 py-4">
                      {Number(trip.total_exp || 0).toFixed(2)} {/* Used total_exp directly */}
                    </td>
                    <td className="px-4 py-4">
                      {(Number(trip.total_rent || 0) - Number(trip.total_exp || 0)).toFixed(2)}{" "}
                      {/* Corrected profit calculation */}
                    </td>
                    <td className="action_column">
                      <div className="flex justify-center">
                        <Link to={`/UpdateDailyIncomeForm/${trip.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentTrips.length === 0 ? (
          ""
        ) : (
          <div className="mt-10 flex justify-center">
            <div className="space-x-2 flex items-center">
              <button
                onClick={handlePrevPage}
                className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"} rounded-sm`}
                disabled={currentPage === 1}
              >
                <GrFormPrevious />
              </button>
              {[...Array(totalPages).keys()].map((number) => (
                <button
                  key={number + 1}
                  onClick={() => handlePageClick(number + 1)}
                  className={`px-3 py-1 rounded-sm ${
                    currentPage === number + 1
                      ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                      : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                  }`}
                >
                  {number + 1}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                className={`p-2 ${currentPage === totalPages ? "bg-gray-300" : "bg-primary text-white"} rounded-sm`}
                disabled={currentPage === totalPages}
              >
                <GrFormNext />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default DailyIncome
