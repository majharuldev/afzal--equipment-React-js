// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { Truck } from "lucide-react";

// const VehicleReport = () => {
//   const [vehicles, setVehicles] = useState([]);
//   const [trips, setTrips] = useState([]);
//   const [filterMonth, setFilterMonth] = useState("");
//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//    // Date filter state
//     const [startDate, setStartDate] = useState("");
//     const [endDate, setEndDate] = useState("");
//      const [showFilter, setShowFilter] = useState(false);

//   useEffect(() => {
//     axios.get(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
//       .then(res => setVehicles(res.data.data))
//       .catch(console.error);

//     axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
//       .then(res => setTrips(res.data.data))
//       .catch(console.error);
//   }, []);

//   const tripsFiltered = trips.filter(t => !filterMonth || new Date(t.date).toISOString().slice(0,7) === filterMonth);

// console.log(vehicles, 'vehicle')
//   const vehicleStats = vehicles
//   .map(v => {
//     const vt = tripsFiltered.filter(t => t.vehicle_no === v.vehicle_no);
//     const tripsCount = vt.length;
//     const rentSum = vt.reduce((s, t) => s + Number(t.total_rent || 0), 0);
//     const expSum = vt.reduce((s, t) => s + Number(t.total_exp || 0), 0);
//     return {
//       number: v.vehicle_no,
//       tripsCount,
//       rentSum,
//       expSum,
//       profit: rentSum - expSum
//     };
//   })
//   .filter(v => v.tripsCount > 0);

//   const exportExcel = () => {
//     const data = vehicleStats.map((v,i)=>({
//       SL: i+1, Vehicle: v.number, Trips: v.tripsCount,
//       Rent: v.rentSum, Expense: v.expSum, Profit: v.profit
//     }));
//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "VehicleReport");
//     XLSX.writeFile(wb, "Vehicle_Report.xlsx");
//   };

//   const exportPDF = () => {
//     const doc = new jsPDF("landscape");
//     const head=[["SL","Vehicle","Trips","Rent","Expense","Profit"]];
//     const body = vehicleStats.map((v,i)=>[i+1,v.number,v.tripsCount,v.rentSum,v.expSum,v.profit]);
//     autoTable(doc,{ head, body, theme:"grid" });
//     doc.save("Vehicle_Report.pdf");
//   };

//   const printReport = () => {
//     const html = document.getElementById("vehicle-report").outerHTML;
//     const w = window.open("","","width=900,height=650");
//     w.document.write(`<html><head><title>Vehicle Report</title><style>
//       table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px}thead{background:#11375B;color:#fff}
//       </style></head><body><h3>Vehicle Summary Report</h3>${html}</body></html>`);
//     w.document.close(); w.print(); w.close();
//   };

//   // pagination
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentVehiclesReport = vehicleStats.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(vehicleStats.length / itemsPerPage);
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
//     <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-xl border border-gray-200">
//       <h2 className="text-xl font-bold text-primary flex items-center gap-2 ">
//                 <Truck className="text-lg" />
//                 Vehicle Summary Report
//               </h2>
//       <div className="flex items-center justify-between my-5">
//         <div className="flex flex-wrap md:flex-row gap-3">
//            <button
//               onClick={exportExcel}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFileExcel className="" />
//               Excel
//             </button>
          
//             <button
//               onClick={exportPDF}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFilePdf className="" />
//               PDF
//             </button>
          
//             <button
//               onClick={printReport}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaPrint className="" />
//               Print
//             </button>
//         </div>
//          <button
//                               onClick={() => setShowFilter((prev) => !prev)}
//                               className="border border-primary  text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                             >
//                               <FaFilter /> Filter
//                             </button>
//       </div>

//       {/* Conditional Filter Section */}
//                           {showFilter && (
//                             <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//                               <div className="relative w-full">
//                                 <input
//                                   type="date"
//                                   value={startDate}
//                                   onChange={(e) => setStartDate(e.target.value)}
//                                   placeholder="Start date"
//                                   className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                                 />
//                               </div>
                  
//                               <div className="relative w-full">
//                                 <input
//                                   type="date"
//                                   value={endDate}
//                                   onChange={(e) => setEndDate(e.target.value)}
//                                   placeholder="End date"
//                                   className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                                 />
//                               </div>
//                               <div className="mt-3 md:mt-0 flex gap-2">
//                                             <button
//                                               onClick={() => setCurrentPage(1)}
//                                               className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                                             >
//                                               <FaFilter /> Filter
//                                             </button>
//                                           </div>
//                             </div>
//                           )}
                          
//       <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//         <table id="vehicle-report" className="min-w-full text-sm text-left">
//           <thead className="bg-[#11375B] text-white capitalize text-xs">
//             <tr className="px-2 py-3"><th>SL</th>
//             <th className="px-2 py-3">Vehicle No</th>
//             <th className="px-2 py-3">Trips</th>
//             <th className="px-2 py-3">Rent</th>
//             <th className="px-2 py-3">Expense</th>
//             <th className="px-2 py-3">Profit</th>
//             </tr>
//           </thead>
//           <tbody>
//             {
//                currentVehiclesReport.length === 0 ? (
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
//           No vehicle data found.
//         </div>
//       </td>
//     </tr>
//   )  :
//             (currentVehiclesReport.map((v,i)=>
//               <tr key={i} className="hover:bg-gray-50">
//                 <td className="px-2 py-3">{i+1}</td><td className="px-2 py-3">{v.number}</td><td className="px-2 py-3">{v.tripsCount}</td><td className="px-2 py-3">{v.rentSum}</td><td className="px-2 py-3">{v.expSum}</td><td className="px-2 py-3">{v.profit}</td></tr>
//             ))
//             }
//           </tbody>
//         </table>
//       </div>
//       {/* pagination */}
//             {
//               currentVehiclesReport.length === 0 ? (
//                 ""
//               )
//             :(<div className="mt-10 flex justify-center">
//               <div className="space-x-2 flex items-center">
//                 <button
//                   onClick={handlePrevPage}
//                   className={`p-2 ${
//                     currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                   } rounded-sm`}
//                   disabled={currentPage === 1}
//                 >
//                   <GrFormPrevious/>
//                 </button>
//                 {[...Array(totalPages).keys()].map((number) => (
//                   <button
//                     key={number + 1}
//                     onClick={() => handlePageClick(number + 1)}
//                     className={`px-3 py-1 rounded-sm ${
//                       currentPage === number + 1
//                         ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                         : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                     }`}
//                   >
//                     {number + 1}
//                   </button>
//                 ))}
//                 <button
//                   onClick={handleNextPage}
//                   className={`p-2 ${
//                     currentPage === totalPages
//                       ? "bg-gray-300"
//                       : "bg-primary text-white"
//                   } rounded-sm`}
//                   disabled={currentPage === totalPages}
//                 >
//                   <GrFormNext />
//                 </button>
//               </div>
//             </div>)}
//     </div>
//   );
// };

// export default VehicleReport;



import { useEffect, useState } from "react"
import axios from "axios"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import { Truck } from "lucide-react"

const VehicleReport = () => {
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [filterMonth, setFilterMonth] = useState("") 
  const [loading, setLoading] = useState(true)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [showFilter, setShowFilter] = useState(false)

  // useEffect(() => {
  //   axios
  //     .get(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
  //     .then((res) => setVehicles(res.data.data))
  //     .catch(console.error)
  //   axios
  //     .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
  //     .then((res) => setTrips(res.data.data))
  //     .catch(console.error)
  // }, [])
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [vehicleRes, tripRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`),
      ])
      setVehicles(vehicleRes.data.data)
      setTrips(tripRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false) 
    }
  }

  fetchData()
}, [])



  // Helper to construct the full vehicle registration number
  const getFullRegistrationNumber = (vehicle) => {
    const parts = []
    if (vehicle.registration_zone) parts.push(vehicle.registration_zone)
    if (vehicle.registration_serial) parts.push(vehicle.registration_serial)
    if (vehicle.registration_number) parts.push(vehicle.registration_number)
    return parts.join(" ").trim()
  }

  // Filter trips by month AND date range
  const tripsFiltered = trips.filter((t) => {
    const tripDate = new Date(t.date)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    // Date range filter
    const matchDateRange = (!start || tripDate >= start) && (!end || tripDate <= end)

    // Month filter (if filterMonth is set, otherwise all months match)
    const matchMonth = !filterMonth || new Date(t.date).toISOString().slice(0, 7) === filterMonth

    return matchDateRange && matchMonth
  })

  const vehicleStats = vehicles
    .map((v) => {
      const fullRegNumber = getFullRegistrationNumber(v)
      const vt = tripsFiltered.filter((t) => t.vehicle_no === v.vehicle_name || t.vehicle_no === fullRegNumber)
      const tripsCount = vt.length
      const rentSum = vt.reduce((s, t) => s + Number(t.total_rent || 0), 0)
      const expSum = vt.reduce((s, t) => s + Number(t.total_exp || 0), 0)
      const tripDate = vt.map((t) => t.date).join(", ")

      return {
        number: v.vehicle_name || fullRegNumber, // Use vehicle_name or full registration number for display
        tripsCount,
        rentSum,
        expSum,
        tripDate,
        profit: rentSum - expSum,
      }
    })
    // Filter out vehicles with no activity to avoid showing empty rows
    .filter((v) => v.tripsCount > 0 || v.rentSum > 0 || v.expSum > 0)


  const exportExcel = () => {
    const data = vehicleStats.map((v, i) => ({
      SL: i + 1,
      Vehicle: v.number,
      Trips: v.tripsCount,
      Rent: v.rentSum,
      Expense: v.expSum,
      Profit: v.profit,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "VehicleReport")
    XLSX.writeFile(wb, "Vehicle_Report.xlsx")
  }

  const exportPDF = () => {
    const doc = new jsPDF("landscape")
    const head = [["SL", "Vehicle", "Trips", "Rent", "Expense", "Profit"]]
    const body = vehicleStats.map((v, i) => [i + 1, v.number, v.tripsCount, v.rentSum, v.expSum, v.profit])
    autoTable(doc, { head, body, theme: "grid" })
    doc.save("Vehicle_Report.pdf")
  }

  const printReport = () => {
    const html = document.getElementById("vehicle-report").outerHTML
    const w = window.open("", "", "width=900,height=650")
    w.document.write(
      `<html><head><title>Vehicle Report</title><style>
      table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:6px}thead{background:#11375B;color:#fff}
      </style></head><body><h3>Vehicle Summary Report</h3>${html}</body></html>`,
    )
    w.document.close()
    w.print()
    w.close()
  }

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentVehiclesReport = vehicleStats.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(vehicleStats.length / itemsPerPage)

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1)
  }
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((currentPage) => currentPage + 1)
  }
  const handlePageClick = (number) => {
    setCurrentPage(number)
  }

  if(loading)return<div>
      <div colSpan="7" className="text-center py-10 text-gray-500">
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
          Loading vehicle report...
        </div>
      </div>
    </div>

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2 ">
        <Truck className="text-lg" />
        Vehicle Summary Report
      </h2>
      <div className="flex items-center justify-between my-5">
        <div className="flex flex-wrap md:flex-row gap-3">
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
            onClick={printReport}
            className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
          >
            <FaPrint className="" />
            Print
          </button>
        </div>
        <button
          onClick={() => setShowFilter((prev) => !prev)}
          className="border border-primary  text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <FaFilter /> Filter
        </button>
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
              onClick={() => setCurrentPage(1)} // Reset pagination on filter
              className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
      )}
      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table id="vehicle-report" className="min-w-full text-sm text-left">
          <thead className="bg-[#11375B] text-white capitalize text-xs">
            <tr>
              <th className="px-2 py-3">SL</th>
              {/* <th className="px-2 py-3">Date</th> */}
              <th className="px-2 py-3">Vehicle No</th>
              <th className="px-2 py-3">Trips</th>
              <th className="px-2 py-3">Rent</th>
              <th className="px-2 py-3">Expense</th>
              <th className="px-2 py-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {currentVehiclesReport.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    No vehicle data found.
                  </div>
                </td>
              </tr>
            ) :loading ? (
    <tr>
      <td colSpan="7" className="text-center py-10 text-gray-500">
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
          Loading vehicle report...
        </div>
      </td>
    </tr>
  ) : (
              currentVehiclesReport.map((v, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-2 py-3">{i + 1}</td>
                  {/* <td className="px-2 py-3 line-clamp-1">{v.tripDate}</td> */}
                  <td className="px-2 py-3">{v.number}</td>
                  <td className="px-2 py-3">{v.tripsCount}</td>
                  <td className="px-2 py-3">{v.rentSum}</td>
                  <td className="px-2 py-3">{v.expSum}</td>
                  <td className="px-2 py-3">{v.profit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      {currentVehiclesReport.length === 0 ? (
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
  )
}

export default VehicleReport
