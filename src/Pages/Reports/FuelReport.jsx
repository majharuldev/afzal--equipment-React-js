// import { useState } from "react";
// import { FaTruck, FaFilter } from "react-icons/fa";
// import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa6";

// const FuelReport = () => {
//   const [showFilter, setShowFilter] = useState(false);
//   return (
//     <main className="md:p-6">
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200">
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             <FaTruck className="text-[#11375B] text-2xl" />
//             Fuel Account
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
//               className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//           </div>
//         </div>
//         {/* export */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
//           {/* <CSVLink
//                         data={csvData}
//                         headers={headers}
//                         filename={"fuelReport_data.csv"}
//                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                       >
//                         CSV
//                       </CSVLink> */}
//                       <button
//                           // onClick={exportExcel}
//                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                         >
//                           <FaFileExcel className="" />
//                           Excel
//                         </button>
                      
//                         <button
//                           // onClick={exportPDF}
//                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                         >
//                           <FaFilePdf className="" />
//                           PDF
//                         </button>
                      
//                         <button
//                           // onClick={printTable}
//                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                         >
//                           <FaPrint className="" />
//                           Print
//                         </button>
//           </div>
//           {/*  */}
//           <div className="mt-3 md:mt-0">
//             <span className="text-primary font-semibold pr-3">Search: </span>
//             <input
//               type="text"
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
//                 placeholder="Start date"
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>

//             <div className="relative w-full">
//               <input
//                 type="date"
//                 placeholder="End date"
//                 className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//             </div>
//           </div>
//         )}
//         {/* Table */}
//         <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-[#11375B] text-white capitalize text-sm">
//               <tr>
//                 <th className="px-2 py-3">#</th>
//                 <th className="px-2 py-3">Driver's Name</th>
//                 <th className="px-2 py-3">Vehicle No.</th>
//                 <th className="px-2 py-3">Fuel Type</th>
//                 <th className="px-2 py-3">Fueling Date</th>
//                 <th className="px-2 py-3">Gallon/Liter</th>
//                 <th className="px-2 py-3">Cost per Liter</th>
//                 <th className="px-2 py-3">Total Cost</th>
//               </tr>
//             </thead>
//             <tbody className="text-[#11375B] font-semibold bg-gray-100">
//               <tr className="hover:bg-gray-50 transition-all">
//                 <td className="px-4 py-4 font-bold">1</td>
//                 <td className="px-2 py-4">Driver Name</td>
//                 <td className="px-2 py-4">12-1526</td>
//                 <td className="px-2 py-4">Octan</td>
//                 <td className="px-2 py-4">05-05-2025</td>
//                 <td className="px-2 py-4">15</td>
//                 <td className="px-2 py-4">20</td>
//                 <td className="px-2 py-4">300.00</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </main>
//   );
// };

// export default FuelReport;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { User2Icon } from "lucide-react";

const FuelReport = () => {
  const [fuel, setFuel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://api.tramessy.com/api/fuel")
      .then((res) => {
        if (res.data.status === "success") {
          setFuel(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Aggregate Fuel Report Per Driver
  const report = Object.values(
    fuel.reduce((acc, item) => {
      const name = item.driver_name || "Unknown";
      if (!acc[name]) {
        acc[name] = {
          name,
          totalFuelings: 0,
          totalQuantity: 0,
          totalCost: 0,
        };
      }
      acc[name].totalFuelings += 1;
      acc[name].totalQuantity += Number(item.quantity) || 0;
      acc[name].totalCost += (Number(item.quantity) || 0) * (Number(item.price) || 0);
      return acc;
    }, {})
  ).map((d) => ({
    ...d,
    avgCostPerLiter: d.totalQuantity ? (d.totalCost / d.totalQuantity).toFixed(2) : "0.00",
  }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFuelReport = report.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(report.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  if (loading) return <p className="text-center mt-10">Loading Fuel Report...</p>;

  return (
    <div className="max-w-6xl mx-auto p-5 bg-white shadow-md rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2 ">
                <User2Icon className="text-lg" />
                Fuel Usage Report by Driver
              </h2>
      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-[#11375B] text-white capitalize text-xs">
            <tr>
              <th className="px-3 py-2">SL</th>
              <th className="px-3 py-2">Driver Name</th>
              <th className="px-3 py-2">Total Fuelings</th>
              <th className="px-3 py-2">Total Liters</th>
              <th className="px-3 py-2">Total Cost</th>
              <th className="px-3 py-2">Avg. Cost / Liter</th>
            </tr>
          </thead>
          <tbody>
            {currentFuelReport.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500 italic">
                  No fuel data found.
                </td>
              </tr>
            ) : (
              currentFuelReport.map((d, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2">{d.totalFuelings}</td>
                  <td className="px-3 py-2">{d.totalQuantity}</td>
                  <td className="px-3 py-2">{d.totalCost.toFixed(2)}</td>
                  <td className="px-3 py-2">{d.avgCostPerLiter}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       {/* pagination */}
            {
              currentFuelReport.length === 0 ? (
                " "
              )
            :(<div className="mt-10 flex justify-center">
              <div className="space-x-2 flex items-center">
                <button
                  onClick={handlePrevPage}
                  className={`p-2 ${
                    currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                  } rounded-sm`}
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
                  className={`p-2 ${
                    currentPage === totalPages
                      ? "bg-gray-300"
                      : "bg-primary text-white"
                  } rounded-sm`}
                  disabled={currentPage === totalPages}
                >
                  <GrFormNext />
                </button>
              </div>
            </div>)}
    </div>
  );
};

export default FuelReport;
