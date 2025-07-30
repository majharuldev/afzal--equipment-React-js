import { useState } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaUserSecret } from "react-icons/fa6";

const PurchaseReport = () => {
  const [showFilter, setShowFilter] = useState(false);
  return (
    <div className=" md:p-4">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Purchase List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* Export */}
        <div className="md:flex justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
           {/* <CSVLink
                         data={csvData}
                         headers={headers}
                         filename={"fuel_data.csv"}
                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                       >
                         CSV
                       </CSVLink> */}
                       <button
                          //  onClick={exportExcel}
                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                         >
                           <FaFileExcel className="" />
                           Excel
                         </button>
                       
                         <button
                          //  onClick={exportPDF}
                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                         >
                           <FaFilePdf className="" />
                           PDF
                         </button>
                       
                         <button
                          //  onClick={printTable}
                           className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                         >
                           <FaPrint className="" />
                           Print
                         </button>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
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
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>

            <div className="relative w-full">
              <input
                type="date"
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
        )}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="px-2 py-3">#</th>
                <th className="px-2 py-3">Supplier Name</th>
                <th className="px-2 py-3">Rate</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Item Name</th>
                <th className="px-2 py-3">Quantity</th>
                <th className="px-2 py-3">Unit Price</th>
                <th className="px-2 py-3">Total</th>
                <th className="px-2 py-3">Bill Image</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              <tr className="hover:bg-gray-50 transition-all">
                <td className="px-2 py-4 font-bold">01</td>
                <td className="px-2 py-4">Korim Ali</td>
                <td className="px-2 py-4">250.00</td>
                <td className="px-2 py-4">Parts</td>
                <td className="px-2 py-4">Piston</td>
                <td className="px-2 py-4">5</td>
                <td className="px-2 py-4">250</td>
                <td className="px-2 py-4">1050</td>
                <td className="px-2 py-4">Bill Image</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;
