// import { useEffect, useState } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import { SlCalender } from "react-icons/sl";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";

// const MonthlyStatement = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       const [tripRes, fuelRes, maintenanceRes] = await Promise.all([
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`),
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api//list`),
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`),
//       ]);

//       const tripData = tripRes.data.data || [];
//       const fuelData = fuelRes.data.data || [];
//       const maintenanceData = maintenanceRes.data.data || [];

//       const allMonths = {};
//       const getMonthKey = date => dayjs(date).format("YYYY-MM");

//       tripData.forEach(item => {
//         const month = getMonthKey(item.trip_date);
//         if (!allMonths[month]) allMonths[month] = { income: 0, trip: 0, maintain: 0 };

//         allMonths[month].income += parseFloat(item.trip_price) || 0;
//         allMonths[month].trip +=
//           (parseFloat(item.fuel_price) || 0) +
//           (parseFloat(item.gas_price) || 0) +
//           (parseFloat(item.other_expenses) || 0) +
//           (parseFloat(item.demarage) || 0) +
//           (parseFloat(item.driver_percentage) || 0);
//       });

//       fuelData.forEach(item => {
//         const month = getMonthKey(item.date_time);
//         if (!allMonths[month]) allMonths[month] = { income: 0, trip: 0, maintain: 0 };

//         allMonths[month].trip +=
//           (parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0);
//       });

//       maintenanceData.forEach((item) => {
//         const month = getMonthKey(item.date);
//         if (!allMonths[month]) {
//           allMonths[month] = { income: 0, trip: 0, maintain: 0 };
//         }

//         const maintenanceCost = parseFloat(item.total_cost || item.cost || 0);
//         allMonths[month].maintain += maintenanceCost;
//       });

//       const sorted = Object.entries(allMonths)
//         .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
//         .map(([month, value], index) => {
//           const totalExpense = value.trip + value.maintain;
//           return {
//             id: index + 1,
//             month: dayjs(month).format("MMMM YYYY"),
//             income: value.income,
//             trip: value.trip,
//             maintain: value.maintain,
//             total: totalExpense,
//             profit: value.income - totalExpense,
//           };
//         });

//       setData(sorted);
//     } catch (err) {
//       console.error("Error loading statement data", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const getTotal = (key) =>
//     data.reduce((acc, cur) => acc + parseFloat(cur[key] || 0), 0);

//   // pagination
//   const [currentPage, setCurrentPage] = useState([1])
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentCalculationData = data.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(data.length / itemsPerPage);
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
//     <div className="">
//       <div className="bg-white md:p-4 shadow rounded-lg border border-gray-200">
//         <h2 className="text-xl font-bold text-primary flex items-center gap-2">
//           <SlCalender className="text-lg" />
//           Monthly Statement
//         </h2>

//         {loading ? (
//           <p className="mt-4 text-center text-gray-600">Loading...</p>
//         ) : (
//           <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//             <table className="min-w-full text-sm text-left">
//               <thead className="bg-primary text-white capitalize text-xs">
//                 <tr>
//                   <th className="px-3 py-2 ">#</th>
//                   <th className="px-3 py-2 ">Month</th>
//                   <th className="px-3 py-2 ">Own Trip Income</th>
//                   <th className="px-3 py-2 ">Vendor Trip Income</th>
//                   <th className="px-3 py-2 ">Own T Cost</th>
//                   <th className="px-3 py-2 ">Vendor T Cost</th>
//                   <th className="px-3 py-2 ">Purchase Cost</th>
//                   <th className="px-3 py-2 ">Salary expense</th>
//                   <th className="px-3 py-2 ">Office expense</th>
//                   <th className="px-3 py-2 ">Total Expense</th>
//                   <th className="px-3 py-2 ">Net Profit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {
//                     currentCalculationData.length === 0 ? (
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
//           No data found.
//         </div>
//       </td>
//     </tr>
//   ) 
//                 :(currentCalculationData.map((item) => (
//                   <tr
//                     key={item.id}
//                     className="border-t hover:bg-gray-50 transition-all"
//                   >
//                     <td className="px-3 py-2  text-center">{item.id}</td>
//                     <td className="px-3 py-2 ">{item.month}</td>
//                     <td className="px-3 py-2  text-green-600">
//                       {item.income.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </td>
//                     <td className="px-3 py-2  text-red-500">
//                       {item.trip.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </td>
//                     <td className="px-3 py-2  text-red-500">
//                       {item.maintain.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </td>
//                     <td className="px-3 py-2  text-red-500">
//                       {item.total.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </td>
//                     <td
//                       className={`px-3 py-2  font-semibold ${
//                         item.profit >= 0 ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {item.profit.toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                       })}
//                     </td>
//                   </tr>
//                 )))
//                 }

//                 {/* Summary Row */}
//                 <tr className="bg-blue-50 font-bold">
//                   <td className="px-3 py-2 text-center" colSpan={2}>
//                     Total
//                   </td>
//                   <td className="px-3 py-2  text-green-700">
//                     {getTotal("income").toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="px-3 py-2  text-red-600">
//                     {getTotal("trip").toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="px-3 py-2  text-red-600">
//                     {getTotal("maintain").toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="px-3 py-2  text-red-600">
//                     {(getTotal("trip") + getTotal("maintain")).toLocaleString(
//                       undefined,
//                       { minimumFractionDigits: 2 }
//                     )}
//                   </td>
//                   <td className="px-3 py-2  text-green-700">
//                     {(getTotal("income") -
//                       getTotal("trip") -
//                       getTotal("maintain")).toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                     })}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}

//          {/* pagination */}
//                 {
//                   currentCalculationData.length === 0 ? (
//                     ""
//                   )
//                 :(<div className="mt-10 flex justify-center">
//                   <div className="space-x-2 flex items-center">
//                     <button
//                       onClick={handlePrevPage}
//                       className={`p-2 ${
//                         currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === 1}
//                     >
//                       <GrFormPrevious/>
//                     </button>
//                     {[...Array(totalPages).keys()].map((number) => (
//                       <button
//                         key={number + 1}
//                         onClick={() => handlePageClick(number + 1)}
//                         className={`px-3 py-1 rounded-sm ${
//                           currentPage === number + 1
//                             ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                             : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                         }`}
//                       >
//                         {number + 1}
//                       </button>
//                     ))}
//                     <button
//                       onClick={handleNextPage}
//                       className={`p-2 ${
//                         currentPage === totalPages
//                           ? "bg-gray-300"
//                           : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === totalPages}
//                     >
//                       <GrFormNext />
//                     </button>
//                   </div>
//                 </div>)}
//       </div>
//     </div>
//   );
// };

// export default MonthlyStatement;


// import { useEffect, useState } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import { SlCalender } from "react-icons/sl";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const MonthlyStatement = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // filter
//    const [showFilter, setShowFilter] = useState(false);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       // Fetch all required data in parallel
//       const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`),
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`),
//         axios.get(`${import.meta.env.VITE_BASE_URL}/api/expense/list`)
//       ]);

//       const trips = tripsRes.data?.data || [];
//       const purchases = purchasesRes.data?.data || [];
//       const expenses = expensesRes.data?.data || [];

//       // Group data by month
//       const monthlyData = {};

//       // Helper function to get month key
//       const getMonthKey = date => dayjs(date).format("YYYY-MM");

//       // Process trips data
//       trips.forEach(trip => {
//         const month = getMonthKey(trip.date);
//         if (!monthlyData[month]) {
//           monthlyData[month] = {
//             ownTripIncome: 0,
//             vendorTripIncome: 0,
//             ownTripCost: 0,
//             vendorTripCost: 0,
//             purchaseCost: 0,
//             salaryExpense: 0,
//             officeExpense: 0
//           };
//         }

//         // Calculate income and costs based on transport type
//         if (trip.transport_type === "own_transport") {
//           monthlyData[month].ownTripIncome += parseFloat(trip.total_rent) || 0;
//           monthlyData[month].ownTripCost += 
//             (parseFloat(trip.fuel_cost) || 0) +
//             (parseFloat(trip.driver_commission) || 0) +
//             (parseFloat(trip.food_cost) || 0) +
//             (parseFloat(trip.parking_cost) || 0) +
//             (parseFloat(trip.toll_cost) || 0) +
//             (parseFloat(trip.feri_cost) || 0) +
//             (parseFloat(trip.police_cost) || 0) +
//             (parseFloat(trip.labor) || 0);
//         } else if (trip.transport_type === "vendor_transport") {
//           monthlyData[month].vendorTripIncome += parseFloat(trip.total_rent) || 0;
//           monthlyData[month].vendorTripCost += parseFloat(trip.trip_rent) || 0;
//         }
//       });

//       // Process purchases data
//       purchases.forEach(purchase => {
//         const month = getMonthKey(purchase.date);
//         if (!monthlyData[month]) {
//           monthlyData[month] = {
//             ownTripIncome: 0,
//             vendorTripIncome: 0,
//             ownTripCost: 0,
//             vendorTripCost: 0,
//             purchaseCost: 0,
//             salaryExpense: 0,
//             officeExpense: 0
//           };
//         }
//         monthlyData[month].purchaseCost += parseFloat(purchase.purchase_amount) || 0;
//       });

//       // Process expenses data
//       expenses.forEach(expense => {
//         const month = getMonthKey(expense.date);
//         if (!monthlyData[month]) {
//           monthlyData[month] = {
//             ownTripIncome: 0,
//             vendorTripIncome: 0,
//             ownTripCost: 0,
//             vendorTripCost: 0,
//             purchaseCost: 0,
//             salaryExpense: 0,
//             officeExpense: 0
//           };
//         }

//         if (expense.payment_category === "Salary") {
//           monthlyData[month].salaryExpense += parseFloat(expense.pay_amount) || 0;
//         } else {
//           monthlyData[month].officeExpense += parseFloat(expense.pay_amount) || 0;
//         }
//       });

//       // Convert to array and calculate totals
//       const result = Object.entries(monthlyData)
//         .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
//         .map(([month, values], index) => ({
//           id: index + 1,
//           month: dayjs(month).format("MMMM YYYY"),
//           monthKey: month,
//           ...values,
//           totalExpense: 
//             values.ownTripCost + 
//             values.vendorTripCost + 
//             values.purchaseCost + 
//             values.salaryExpense + 
//             values.officeExpense,
//           netProfit: 
//             (values.ownTripIncome + values.vendorTripIncome) - 
//             (values.ownTripCost + values.vendorTripCost + values.purchaseCost + values.salaryExpense + values.officeExpense)
//         }));

//       setData(result);
//     } catch (err) {
//       console.error("Error loading data:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Export to Excel
//   const exportToExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
//       "Month": item.month,
//       "Own Trip Income": item.ownTripIncome,
//       "Vendor Trip Income": item.vendorTripIncome,
//       "Own Trip Cost": item.ownTripCost,
//       "Vendor Trip Cost": item.vendorTripCost,
//       "Purchase Cost": item.purchaseCost,
//       "Salary Expense": item.salaryExpense,
//       "Office Expense": item.officeExpense,
//       "Total Expense": item.totalExpense,
//       "Net Profit": item.netProfit
//     })));
    
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Statement");
//     XLSX.writeFile(workbook, "Monthly_Statement.xlsx");
//   };

//   // Export to PDF
//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.text("Monthly Statement Report", 10, 10);
    
//     autoTable(doc, {
//       head: [
//         ["Month", "Own Income", "Vendor Income", "Own Cost", "Vendor Cost", 
//          "Purchases", "Salaries", "Office", "Total Expense", "Net Profit"]
//       ],
//       body: data.map(item => [
//         item.month,
//         item.ownTripIncome.toFixed(2),
//         item.vendorTripIncome.toFixed(2),
//         item.ownTripCost.toFixed(2),
//         item.vendorTripCost.toFixed(2),
//         item.purchaseCost.toFixed(2),
//         item.salaryExpense.toFixed(2),
//         item.officeExpense.toFixed(2),
//         item.totalExpense.toFixed(2),
//         item.netProfit.toFixed(2)
//       ]),
//       startY: 20
//     });
    
//     doc.save("Monthly_Statement.pdf");
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//  // pagination
//   const [currentPage, setCurrentPage] = useState([1])
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(data.length / itemsPerPage);
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
//   // Calculate totals
//   const calculateTotal = (key) => {
//     return data.reduce((sum, item) => sum + (item[key] || 0), 0);
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-bold text-primary flex items-center gap-2">
//           <SlCalender className="text-lg" />
//           Monthly Statement
//         </h2>
//         <button
//                       onClick={() => setShowFilter((prev) => !prev)}
//                       className="border border-primary  text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                     >
//                       <FaFilter /> Filter
//                     </button>

//          {/* Conditional Filter Section */}
//                 {showFilter && (
//                   <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//                     <div className="relative w-full">
//                       <input
//                         type="date"
//                         value={startDate}
//                         onChange={(e) => setStartDate(e.target.value)}
//                         placeholder="Start date"
//                         className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                       />
//                     </div>
        
//                     <div className="relative w-full">
//                       <input
//                         type="date"
//                         value={endDate}
//                         onChange={(e) => setEndDate(e.target.value)}
//                         placeholder="End date"
//                         className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                       />
//                     </div>
//                     <div className="mt-3 md:mt-0 flex gap-2">
//                                   <button
//                                     onClick={() => setCurrentPage(1)}
//                                     className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                                   >
//                                     <FaFilter /> Filter
//                                   </button>
//                                 </div>
//                   </div>
//                 )}
        
//       </div>
//       <div className="flex gap-2 flex-wrap">
//           <button
//                        onClick={exportToExcel}
//                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                       >
//                         <FaFileExcel className="" />
//                         Excel
//                       </button>
                    
//                       <button
//                         onClick={exportToPDF}
//                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                       >
//                         <FaFilePdf className="" />
//                         PDF
//                       </button>
                    
//                       <button
//                         onClick={() => window.print()}
//                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                       >
//                         <FaPrint className="" />
//                         Print
//                       </button>
//         </div>

//       {loading ? (
//         <p className="text-center py-10">Loading data...</p>
//       ) : currentItems.length === 0 ? (
//         <p className="text-center py-10 text-gray-500">No data available</p>
//       ) : (
//         <>
//           <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//             <table className="min-w-full text-sm text-left">
//               <thead className="bg-primary text-white capitalize text-xs">
//                 <tr>
//                   <th className="p-2 border">#</th>
//                   <th className="p-2 border">Month</th>
//                   <th className="p-2 border">Own Trip Income</th>
//                   <th className="p-2 border">Vendor Trip Income</th>
//                   <th className="p-2 border">Own Trip Cost</th>
//                   <th className="p-2 border">Vendor Trip Cost</th>
//                   <th className="p-2 border">Purchase Cost</th>
//                   <th className="p-2 border">Salary Expense</th>
//                   <th className="p-2 border">Office Expense</th>
//                   <th className="p-2 border">Total Expense</th>
//                   <th className="p-2 border">Net Profit</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentItems.map((item) => (
//                   <tr key={item.id} className="hover:bg-gray-50">
//                     <td className="p-2 border text-center">{item.id}</td>
//                     <td className="p-2 border">{item.month}</td>
//                     <td className="p-2 border text-right">{item.ownTripIncome.toFixed(2)}</td>
//                     <td className="p-2 border text-right">{item.vendorTripIncome.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500">{item.ownTripCost.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500">{item.vendorTripCost.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500">{item.purchaseCost.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500">{item.salaryExpense.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500">{item.officeExpense.toFixed(2)}</td>
//                     <td className="p-2 border text-right text-red-500 font-semibold">
//                       {item.totalExpense.toFixed(2)}
//                     </td>
//                     <td className={`p-2 border text-right font-semibold ${
//                       item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
//                     }`}>
//                       {item.netProfit.toFixed(2)}
//                     </td>
//                   </tr>
//                 ))}
//                 {/* Totals row */}
//                 <tr className=" font-semibold">
//                   <td className="p-2 border text-center" colSpan={2}>Total</td>
//                   <td className="p-2 border text-right">{calculateTotal('ownTripIncome').toFixed(2)}</td>
//                   <td className="p-2 border text-right">{calculateTotal('vendorTripIncome').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('ownTripCost').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('vendorTripCost').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('purchaseCost').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('salaryExpense').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('officeExpense').toFixed(2)}</td>
//                   <td className="p-2 border text-right text-red-500">{calculateTotal('totalExpense').toFixed(2)}</td>
//                   <td className={`p-2 border text-right ${
//                     calculateTotal('netProfit') >= 0 ? 'text-green-600' : 'text-red-600'
//                   }`}>
//                     {calculateTotal('netProfit').toFixed(2)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//            {/* pagination */}
//                 {
//                   currentItems.length === 0 ? (
//                     ""
//                   )
//                 :(<div className="mt-10 flex justify-center">
//                   <div className="space-x-2 flex items-center">
//                     <button
//                       onClick={handlePrevPage}
//                       className={`p-2 ${
//                         currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === 1}
//                     >
//                       <GrFormPrevious/>
//                     </button>
//                     {[...Array(totalPages).keys()].map((number) => (
//                       <button
//                         key={number + 1}
//                         onClick={() => handlePageClick(number + 1)}
//                         className={`px-3 py-1 rounded-sm ${
//                           currentPage === number + 1
//                             ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                             : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                         }`}
//                       >
//                         {number + 1}
//                       </button>
//                     ))}
//                     <button
//                       onClick={handleNextPage}
//                       className={`p-2 ${
//                         currentPage === totalPages
//                           ? "bg-gray-300"
//                           : "bg-primary text-white"
//                       } rounded-sm`}
//                       disabled={currentPage === totalPages}
//                     >
//                       <GrFormNext />
//                     </button>
//                   </div>
//                 </div>)}
//         </>
//       )}
//     </div>
//   );
// };

// export default MonthlyStatement;

import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { SlCalender } from "react-icons/sl";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MonthlyStatement = () => {
  const [allData, setAllData] = useState([]); // Store all data
  const [filteredData, setFilteredData] = useState([]); // Store filtered data
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // For month filter
  const [availableMonths, setAvailableMonths] = useState([]); // Available months for dropdown

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/api/expense/list`)
      ]);

      const trips = tripsRes.data?.data || [];
      const purchases = purchasesRes.data?.data || [];
      const expenses = expensesRes.data?.data || [];

      const monthlyData = {};

      const getMonthKey = date => dayjs(date).format("YYYY-MM");

      // Process all data
      trips.forEach(trip => {
        const month = getMonthKey(trip.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (trip.transport_type === "own_transport") {
          monthlyData[month].ownTripIncome += parseFloat(trip.total_rent) || 0;
          monthlyData[month].ownTripCost += 
            (parseFloat(trip.fuel_cost) || 0) +
            (parseFloat(trip.driver_commission) || 0) +
            (parseFloat(trip.food_cost) || 0) +
            (parseFloat(trip.parking_cost) || 0) +
            (parseFloat(trip.toll_cost) || 0) +
            (parseFloat(trip.feri_cost) || 0) +
            (parseFloat(trip.police_cost) || 0) +
            (parseFloat(trip.labor) || 0);
        } else if (trip.transport_type === "vendor_transport") {
          monthlyData[month].vendorTripIncome += parseFloat(trip.total_rent) || 0;
          monthlyData[month].vendorTripCost += parseFloat(trip.total_exp) || 0;
        }
      });

      purchases.forEach(purchase => {
        const month = getMonthKey(purchase.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }
        monthlyData[month].purchaseCost += parseFloat(purchase.purchase_amount) || 0;
      });

      expenses.forEach(expense => {
        const month = getMonthKey(expense.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0
          };
        }

        if (expense.payment_category === "Salary") {
          monthlyData[month].salaryExpense += parseFloat(expense.pay_amount) || 0;
        } else {
          monthlyData[month].officeExpense += parseFloat(expense.pay_amount) || 0;
        }
      });

      // Convert to array
      const result = Object.entries(monthlyData)
        .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
        .map(([month, values], index) => ({
          id: index + 1,
          month: dayjs(month).format("MMMM YYYY"),
          monthKey: month,
          ...values,
          totalExpense: 
            values.ownTripCost + 
            values.vendorTripCost + 
            values.purchaseCost + 
            values.salaryExpense + 
            values.officeExpense,
          netProfit: 
            (values.ownTripIncome + values.vendorTripIncome) - 
            (values.ownTripCost + values.vendorTripCost + values.purchaseCost + values.salaryExpense + values.officeExpense)
        }));

      setAllData(result);
      setFilteredData(result);
      
      // Set available months for dropdown
      const months = Object.keys(monthlyData).map(month => ({
        value: month,
        label: dayjs(month).format("MMMM YYYY")
      }));
      setAvailableMonths(months);
      
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply month filter
  useEffect(() => {
    if (selectedMonth) {
      const filtered = allData.filter(item => item.monthKey === selectedMonth);
      setFilteredData(filtered);
    } else {
      setFilteredData(allData);
    }
  }, [selectedMonth, allData]);

  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      "Month": item.month,
      "Own Trip Income": item.ownTripIncome,
      "Vendor Trip Income": item.vendorTripIncome,
      "Own Trip Cost": item.ownTripCost,
      "Vendor Trip Cost": item.vendorTripCost,
      "Purchase Cost": item.purchaseCost,
      "Salary Expense": item.salaryExpense,
      "Office Expense": item.officeExpense,
      "Total Expense": item.totalExpense,
      "Net Profit": item.netProfit
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Statement");
    XLSX.writeFile(workbook, "Monthly_Statement.xlsx");
  };

  // pdf
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Statement Report", 10, 10);
    
    autoTable(doc, {
      head: [
        ["Month", "Own Income", "Vendor Income", "Own Cost", "Vendor Cost", 
         "Purchases", "Salaries", "Office", "Total Expense", "Net Profit"]
      ],
      body: filteredData.map(item => [
        item.month,
        item.ownTripIncome.toFixed(2),
        item.vendorTripIncome.toFixed(2),
        item.ownTripCost.toFixed(2),
        item.vendorTripCost.toFixed(2),
        item.purchaseCost.toFixed(2),
        item.salaryExpense.toFixed(2),
        item.officeExpense.toFixed(2),
        item.totalExpense.toFixed(2),
        item.netProfit.toFixed(2)
      ]),
      startY: 20
    });
    
    doc.save("Monthly_Statement.pdf");
  };

  useEffect(() => {
    fetchData();
  }, []);

  // print
  useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-table, .print-table * {
        visibility: visible;
      }
      .print-table {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}, []);
  const handlePrint = () => {
  const printContents = document.querySelector('.print-table').outerHTML;
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  window.location.reload(); // To restore the original state
};

// Update your print button
<button
  onClick={handlePrint}
  className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer no-print"
>
  <FaPrint /> Print
</button>

    // pagination
  const [currentPage, setCurrentPage] = useState([1])
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
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

  // Calculate totals
  const calculateTotal = (key) => {
    return filteredData.reduce((sum, item) => sum + (item[key] || 0), 0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <SlCalender className="text-lg" />
          Monthly Statement
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <FaFilter /> Filter
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
          <div className="relative w-full">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            >
              <option value="">All Months</option>
              {availableMonths.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => {
                setSelectedMonth("");
                setCurrentPage(1);
              }}
              className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              Clear 
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFileExcel /> Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-2 px-5 no-print hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaPrint /> Print
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading data...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">No data available for selected filter</p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 print-table">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-primary text-white capitalize text-xs">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Own Trip Income</th>
                  <th className="p-2 border">Vendor Trip Income</th>
                  <th className="p-2 border">Own Trip Cost</th>
                  <th className="p-2 border">Vendor Trip Cost</th>
                  <th className="p-2 border">Purchase Cost</th>
                  <th className="p-2 border">Salary Expense</th>
                  <th className="p-2 border">Office Expense</th>
                  <th className="p-2 border">Total Expense</th>
                  <th className="p-2 border">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-400 text-center">{item.id}</td>
                    <td className="p-2 border border-gray-400">{item.month}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.ownTripIncome.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right">{item.vendorTripIncome.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.ownTripCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.vendorTripCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.purchaseCost.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.salaryExpense.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right ">{item.officeExpense.toFixed(2)}</td>
                    <td className="p-2 border border-gray-400 text-right  font-semibold">
                      {item.totalExpense.toFixed(2)}
                    </td>
                    <td className={`p-2 border border-gray-400 text-right font-semibold ${
                      item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.netProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-semibold">
                  <td className="p-2 border border-gray-400 text-center" colSpan={2}>Total</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('ownTripIncome').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right">{calculateTotal('vendorTripIncome').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('ownTripCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('vendorTripCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('purchaseCost').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('salaryExpense').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('officeExpense').toFixed(2)}</td>
                  <td className="p-2 border border-gray-400 text-right ">{calculateTotal('totalExpense').toFixed(2)}</td>
                  <td className={`p-2 border border-gray-400 text-right ${
                    calculateTotal('netProfit') >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateTotal('netProfit').toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

            {/* pagination */}
                 {
                  currentItems.length === 0 ? (
                    ""
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
                      <GrFormPrevious/>
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
        </>
      )}
    </div>
  );
};

export default MonthlyStatement;