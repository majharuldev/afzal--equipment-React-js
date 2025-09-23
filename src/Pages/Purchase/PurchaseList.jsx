// import axios from "axios";
// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
// import { FaPlus, FaUserSecret } from "react-icons/fa6";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { Link } from "react-router-dom";
// import * as XLSX from "xlsx";
// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable";
// import Pagination from "../../components/Shared/Pagination";
// import { tableFormatDate } from "../../components/Shared/formatDate";
// import DatePicker from "react-datepicker";

// const PurchaseList = () => {
//   const [purchase, setPurchase] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // Date filter state
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   // search
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showFilter, setShowFilter] = useState(false);
//   // get single car info by id
//   const [viewModalOpen, setViewModalOpen] = useState(false);
//   const [selectedPurchase, setselectedPurchase] = useState(null);
//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setPurchase(response.data.data);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching driver data:", error);
//         setLoading(false);
//       });
//   }, []);
//   // state
//   const [vehicleFilter, setVehicleFilter] = useState("");

//   // Filter by date
//   const filtered = purchase.filter((dt) => {
//     const dtDate = new Date(dt.date);
//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;

//     if (start && end) {
//       return dtDate >= start && dtDate <= end;
//     } else if (start) {
//       return dtDate.toDateString() === start.toDateString();
//     } else {
//       return true; // no filter applied
//     }
//   });

//   // Vehicle filter apply
//   const vehicleFiltered = filtered.filter((dt) => {
//     if (vehicleFilter) {
//       return dt.vehicle_no === vehicleFilter;
//     }
//     return true;
//   });

//   // Search (Product ID, Supplier, Vehicle, Driver)
//   const filteredPurchase = vehicleFiltered.filter((dt) => {
//     // শুধু এই দুইটা ক্যাটেগরি দেখানোর জন্য
//     if (!(dt.category === "engine_oil" || dt.category === "parts")) {
//       return false;
//     }
//     const term = searchTerm.toLowerCase();
//     return (
//       dt.id?.toString().toLowerCase().includes(term) ||
//       dt.supplier_name?.toLowerCase().includes(term) ||
//       dt.vehicle_no?.toLowerCase().includes(term) ||
//       dt.driver_name?.toLowerCase().includes(term)
//     );
//   });

//   // Vehicle No dropdown unique values
//   const uniqueVehicles = [...new Set(purchase.map((p) => p.vehicle_no))];
//   // view car by id
//   const handleViewCar = async (id) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
//       );
//       if (response.data.status === "Success") {
//         setselectedPurchase(response.data.data);
//         setViewModalOpen(true);
//       } else {
//         toast.error("Purchase Information could not be loaded.");
//       }
//     } catch (error) {
//       console.error("View error:", error);
//       toast.error("Purchase Information could not be loaded.");
//     }
//   };
//   if (loading) return <p className="text-center mt-16">Loading data...</p>;
//   // pagination
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentPurchase = filteredPurchase.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const totalPages = Math.ceil(filteredPurchase.length / itemsPerPage);

//   // Excel Export Function
//   const exportExcel = () => {
//     const dataToExport = filteredPurchase.map((item, index) => ({
//       "SL No": index + 1,
//       "Product ID": item.id,
//       "Supplier Name": item.supplier_name,
//       "Driver Name": item.driver_name !== "null" ? item.driver_name : "N/A",
//       "Vehicle No": item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
//       "Category": item.category,
//       "Item Name": item.item_name,
//       "Quantity": item.quantity,
//       "Unit Price": item.unit_price,
//       "Total": item.purchase_amount,
//       "Date": item.date,
//       "Remarks": item.remarks || "N/A"
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List");

//     // Generate Excel file
//     XLSX.writeFile(workbook, "Purchase_List.xlsx");
//     toast.success("Excel file downloaded successfully!");
//   };

//   // PDF Export Function
//   const exportPDF = () => {
//     const doc = new jsPDF();

//     doc.setFontSize(18);
//     doc.text("Purchase List", 14, 15);

//     if (startDate || endDate) {
//       doc.setFontSize(10);
//       doc.text(
//         `Date Range: ${startDate || "Start"} to ${endDate || "End"}`,
//         14,
//         22
//       );
//     }

//     // শুধু Action বাদ দিয়ে table data তৈরি
//     const tableData = filteredPurchase.map((item, index) => [
//       index + 1,
//       item.id,
//       item.supplier_name,
//       item.driver_name !== "null" ? item.driver_name : "N/A",
//       item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
//       item.category,
//       item.item_name,
//       item.quantity,
//       item.unit_price,
//       item.purchase_amount,
//     ]);

//     autoTable(doc, {
//       head: [
//         [
//           "SL",
//           "Product ID",
//           "Supplier",
//           "Driver",
//           "Vehicle No",
//           "Category",
//           "Item",
//           "Qty",
//           "Unit Price",
//           "Total",
//         ],
//       ],
//       body: tableData,
//       startY: 30,
//       theme: "grid",
//       headStyles: {
//         fillColor: [17, 55, 91],
//         textColor: 255,
//       },
//       styles: {
//         fontSize: 8,
//         cellPadding: 2,
//       },
//       margin: { top: 30 },
//     });

//     doc.save("Purchase_List.pdf");
//     toast.success("PDF file downloaded successfully!");
//   };

//   // Print Function
//   const printTable = () => {
//     // শুধু filtered data ব্যবহার
//     const tableHeader = `
//     <thead>
//       <tr>
//         <th>SL</th>
//         <th>Product ID</th>
//         <th>Supplier</th>
//         <th>Driver</th>
//         <th>Vehicle No</th>
//         <th>Category</th>
//         <th>Item</th>
//         <th>Qty</th>
//         <th>Unit Price</th>
//         <th>Total</th>
//       </tr>
//     </thead>
//   `;

//     const tableRows = filteredPurchase
//       .map(
//         (item, index) => `
//         <tr>
//           <td>${index + 1}</td>
//           <td>${item.id}</td>
//           <td>${item.supplier_name}</td>
//           <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
//           <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
//           <td>${item.category}</td>
//           <td>${item.item_name}</td>
//           <td>${item.quantity}</td>
//           <td>${item.unit_price}</td>
//           <td>${item.purchase_amount}</td>
//         </tr>
//       `
//       )
//       .join("");

//     const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

//     const printWindow = window.open("", "", "width=1000,height=700");
//     printWindow.document.write(`
//     <html>
//       <head>
//         <title>Purchase List</title>
//         <style>
//           body { font-family: Arial, sans-serif; margin: 20px; }
//           h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
//           table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
//           thead tr {
//             background: linear-gradient(to right, #11375B, #1e4a7c);
//             color: white;
//           }
//           th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
//           td { color: #11375B; }
//           tr:nth-child(even) { background-color: #f9f9f9; }
//           tr:hover { background-color: #f1f5f9; }
//           .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
//           @media print { body { margin: 0; } }
//         </style>
//       </head>
//       <body>
//         <h2>Purchase List</h2>
//         ${printContent}
//         <div class="footer">
//           Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
//         </div>
//       </body>
//     </html>
//   `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };

//   return (
//     <div className=" md:p-2">
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-primary flex items-center gap-3">
//             <FaUserSecret className="text-primary text-2xl" />
//             Maintenance List
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> Filter
//             </button>
//             <Link to="/tramessy/Purchase/add-maintenance">
//               <button className="bg-gradient-to-r from-primary to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
//                 <FaPlus />Maintentance
//               </button>
//             </Link>
//           </div>
//         </div>
//         {/* export */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <button
//               onClick={exportExcel}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               Excel
//             </button>
//             <button
//               onClick={exportPDF}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               PDF
//             </button>
//             <button
//               onClick={printTable}
//               className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               Print
//             </button>
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
//               placeholder="Search by Product ..."
//               className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
//             />
//             {/*  Clear button */}
//             {searchTerm && (
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setCurrentPage(1);
//                 }}
//                 className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
//               >
//                 ✕
//               </button>
//             )}
//           </div>
//         </div>
//         {/* Conditional Filter Section */}
//         {showFilter && (
//           <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>

//             <div className="flex-1 min-w-0">
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 dateFormat="dd/MM/yyyy"
//                 placeholderText="DD/MM/YYYY"
//                 locale="en-GB"
//                 className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                 isClearable
//               />
//             </div>
//             <select
//               value={vehicleFilter}
//               onChange={(e) => {
//                 setVehicleFilter(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="mt-1 flex-1 min-w-0 text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
//             >
//               <option value="">All Vehicle No</option>
//               {uniqueVehicles.map((v, index) => (
//                 <option key={index} value={v}>
//                   {v}
//                 </option>
//               ))}
//             </select>
//             <div className="">
//               <button
//                 onClick={() => {
//                   setStartDate("");
//                   setEndDate("");
//                   setVehicleFilter("");
//                   setShowFilter(false);
//                 }}
//                 className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//               >
//                 <FaFilter /> Clear
//               </button>
//             </div>
//           </div>
//         )}
//         <div id="purchaseTable" className="mt-5 overflow-x-auto rounded-xl">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-primary text-white capitalize text-xs border border-gray-600">
//               <tr>
//                 <th className="p-2">SL.</th>
//                 <th className="p-2">Date</th>
//                 <th className="p-2">ProductID</th>
//                 <th className="p-2">SupplierName</th>
//                 <th className="px-2 py-2">Driver </th>
//                 <th className="px-2 py-2">VehicleCategory</th>
//                 <th className="px-2 py-2">VehicleNo</th>
//                 <th className="p-2">Category</th>
//                 <th className="p-2">ItemName</th>
//                 <th className="p-2">Quantity</th>
//                 {/* <th className="p-2">Unit Price</th> */}
//                 <th className="p-2">Total</th>
//                 {/* <th className="p-2">Bill Image</th> */}
//                 <th className="p-2">Action</th>
//               </tr>
//             </thead>
//             <tbody className="text-primary">
//               {currentPurchase.length === 0 ? (
//                 <tr>
//                   <td colSpan="8" className="text-center p-4 text-gray-500">
//                     No purchase found
//                   </td>
//                 </tr>)
//                 : (currentPurchase?.map((dt, index) => (
//                   <tr
//                     key={index}
//                     className="hover:bg-gray-50 transition-all border border-gray-200"
//                   >
//                     <td className="p-2 font-bold">
//                       {indexOfFirstItem + index + 1}.
//                     </td>
//                     <td className="p-2">{tableFormatDate(dt.date)}</td>
//                     <td className="p-2">{dt.id}</td>
//                     <td className="p-2">{dt.supplier_name}</td>
//                     <td className="px-2 py-2">{dt.driver_name !== "null" ? dt.driver_name : "N/A"}</td>
//                     <td className="px-2 py-2">{dt.vehicle_category !== "null" ? dt.vehicle_category : "N/A"}</td>
//                     <td className="px-2 py-2">{dt.vehicle_no !== "null" ? dt.vehicle_no : "N/A"}</td>
//                     <td className="p-2">{dt.category}</td>
//                     <td className="p-2">{dt.item_name}</td>
//                     <td className="p-2">{dt.quantity}</td>
//                     {/* <td className="p-2">{dt.unit_price}</td> */}
//                     <td className="p-2">{dt.purchase_amount}</td>
//                     {/* <td className="p-2">
//                     <img
//                       src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${dt.bill_image}`}
//                       alt=""
//                       className="w-20 h-20 rounded-xl"
//                     />
//                   </td> */}
//                     <td className="px-2 action_column">
//                       <div className="flex gap-1">
//                         <Link
//                           to={`/tramessy/Purchase/update-maintenance/${dt.id}`}
//                         >
//                           <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
//                             <FaPen className="text-[12px]" />
//                           </button>
//                         </Link>
//                         <button
//                           onClick={() => handleViewCar(dt.id)}
//                           className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                         >
//                           <FaEye className="text-[12px]" />
//                         </button>
//                         {/* <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
//                         <FaTrashAlt className="text-[12px]" />
//                       </button> */}
//                       </div>
//                     </td>
//                   </tr>
//                 )))
//               }
//             </tbody>
//           </table>
//         </div>
//         {/* pagination */}

//         {currentPurchase.length > 0 && totalPages >= 1 && (
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={(page) => setCurrentPage(page)}
//             maxVisible={8}
//           />
//         )}
//       </div>
//       {viewModalOpen && selectedPurchase && (
//         <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50 p-4">
//           <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-5 relative">
//             <h2 className="text-2xl font-bold text-primary border-b pb-4 mb-4">
//               Purchase Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Product ID:</span>
//                 <span>{selectedPurchase.id}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Supplier Name:</span>
//                 <span>{selectedPurchase.supplier_name}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Driver Name:</span>
//                 <span>{selectedPurchase.driver_name}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Vehicle Category:</span>
//                 <span>{selectedPurchase.vehicle_category}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Vehicle No:</span>
//                 <span>{selectedPurchase.vehicle_no}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Category:</span>
//                 <span>{selectedPurchase.category}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Item Name:</span>
//                 <span>{selectedPurchase.item_name}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Quantity:</span>
//                 <span>{selectedPurchase.quantity}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Unit Price:</span>
//                 <span>{selectedPurchase.unit_price}</span>
//               </div>
//               <div className="flex justify-between p-2">
//                 <span className="font-medium w-1/2">Total:</span>
//                 <span>{selectedPurchase.purchase_amount}</span>
//               </div>
//               <div className="flex flex-col items-start p-2">
//                 <span className="font-medium mb-2">Bill Image:</span>
//                 <img
//                   src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${selectedPurchase.bill_image}`}
//                   alt="Bill"
//                   className="w-32 h-32 object-cover rounded-lg border"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mt-5">
//               <button
//                 onClick={() => setViewModalOpen(false)}
//                 className="bg-primary text-white px-5 py-2 rounded-md hover:bg-secondary transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PurchaseList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt, FaPlus, FaUserSecret } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import { Table, Modal, Button, Select, Input, DatePicker as AntDatePicker, Card } from "antd";
import { DownloadOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { RiEditLine } from "react-icons/ri";

const { Option } = Select;
const { RangePicker } = AntDatePicker;

const PurchaseList = () => {
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleFilter, setVehicleFilter] = useState("");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPurchase(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // Filter by date
  const filtered = purchase.filter((dt) => {
    const dtDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true;
    }
  });

  // Vehicle filter apply
  const vehicleFiltered = filtered.filter((dt) => {
    if (vehicleFilter) {
      return dt.vehicle_no === vehicleFilter;
    }
    return true;
  });

  // Search (Product ID, Supplier, Vehicle, Driver)
  const filteredPurchase = vehicleFiltered.filter((dt) => {
    if (!(dt.category === "engine_oil" || dt.category === "parts")) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    return (
      dt.id?.toString().toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term)
    );
  });

  // Vehicle No dropdown unique values
  const uniqueVehicles = [...new Set(purchase.map((p) => p.vehicle_no))];

  // view car by id
  const handleViewCar = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
      );
      if (response.data.status === "Success") {
        setSelectedPurchase(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Purchase Information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Purchase Information could not be loaded.");
    }
  };

  if (loading) return <p className="text-center mt-16">ডেটা লোড হচ্ছে...</p>;

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = filteredPurchase.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPurchase.length / itemsPerPage);

  // Excel Export Function
  const exportExcel = () => {
    const dataToExport = filteredPurchase.map((item, index) => ({
      "SL No": index + 1,
      "Product ID": item.id,
      "Supplier Name": item.supplier_name,
      "Driver Name": item.driver_name !== "null" ? item.driver_name : "N/A",
      "Vehicle No": item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      "Category": item.category,
      "Item Name": item.item_name,
      "Quantity": item.quantity,
      "Unit Price": item.unit_price,
      "Total": item.purchase_amount,
      "Date": item.date,
      "Remarks": item.remarks || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List");

    XLSX.writeFile(workbook, "Purchase_List.xlsx");
    toast.success("Excel ফাইল ডাউনলোড সম্পন্ন হয়েছে!");
  };

  // PDF Export Function
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("মেইনটেনেন্স তালিকা", 14, 15);

    if (startDate || endDate) {
      doc.setFontSize(10);
      doc.text(
        `তারিখ: ${startDate || "শুরু"} থেকে ${endDate || "শেষ"}`,
        14,
        22
      );
    }

    const tableData = filteredPurchase.map((item, index) => [
      index + 1,
      item.id,
      item.supplier_name,
      item.driver_name !== "null" ? item.driver_name : "N/A",
      item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      item.category,
      item.item_name,
      item.quantity,
      item.unit_price,
      item.purchase_amount,
    ]);

    autoTable(doc, {
      head: [
        [
          "ক্রমিক",
          "প্রোডাক্ট আইডি",
          "সরবরাহকারী",
          "ড্রাইভার",
          "গাড়ির নম্বর",
          "ক্যাটাগরি",
          "আইটেম",
          "পরিমাণ",
          "একক মূল্য",
          "মোট",
        ],
      ],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      margin: { top: 30 },
    });

    doc.save("Purchase_List.pdf");
    toast.success("PDF ফাইল ডাউনলোড সম্পন্ন হয়েছে!");
  };

  // Print Function
  const printTable = () => {
    const tableHeader = `
    <thead>
      <tr>
        <th>ক্রমিক</th>
        <th>প্রোডাক্ট আইডি</th>
        <th>সরবরাহকারী</th>
        <th>ড্রাইভার</th>
        <th>গাড়ির নম্বর</th>
        <th>ক্যাটাগরি</th>
        <th>আইটেম</th>
        <th>পরিমাণ</th>
        <th>একক মূল্য</th>
        <th>মোট</th>
      </tr>
    </thead>
  `;

    const tableRows = filteredPurchase
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.id}</td>
          <td>${item.supplier_name}</td>
          <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
          <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
          <td>${item.category}</td>
          <td>${item.item_name}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${item.purchase_amount}</td>
        </tr>
      `
      )
      .join("");

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
    <html>
      <head>
        <title>মেইনটেনেন্স তালিকা</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          thead tr {
            background: linear-gradient(to right, #11375B, #1e4a7c);
            color: white;
          }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          td { color: #11375B; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h2>মেইনটেনেন্স তালিকা</h2>
        ${printContent}
        <div class="footer">
          মুদ্রণের তারিখ: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Ant Design Table Columns
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) => indexOfFirstItem + index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      key: "date",
      render: (date) => tableFormatDate(date),
    },
    {
      title: "প্রোডাক্ট আইডি",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "সাপ্লায়ার নাম",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    // {
    //   title: "ড্রাইভার",
    //   dataIndex: "driver_name",
    //   key: "driver_name",
    //   render: (driver) => driver !== "null" ? driver : "N/A",
    // },
    // {
    //   title: "গাড়ির ক্যাটাগরি",
    //   dataIndex: "vehicle_category",
    //   key: "vehicle_category",
    //   render: (category) => category !== "null" ? category : "N/A",
    // },
    {
      title: "ইকুইপমেন্ট নম্বর",
      dataIndex: "vehicle_no",
      key: "vehicle_no",
      render: (vehicle) => vehicle !== "null" ? vehicle : "N/A",
    },
    {
      title: "ক্যাটাগরি",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "আইটেমের নাম",
      dataIndex: "item_name",
      key: "item_name",
    },
    {
      title: "পরিমাণ",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "মোট",
      dataIndex: "purchase_amount",
      key: "purchase_amount",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      width: 80,
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/Purchase/update-maintenance/${record.id}`}>
            <Button 
              type="primary" 
              size="small" 
              icon={<RiEditLine />}
              className="!bg-white !text-primary !shadow-md"
            />
          </Link>
          <Button 
            type="primary" 
            size="small" 
            icon={<FaEye />}
            className="!bg-white !text-primary !shadow-md"
            onClick={() => handleViewCar(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="md:p-2">
      <Card 
        title={
          <div className="flex items-center">
            <FaUserSecret className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">মেইনটেনেন্স তালিকা</span>
          </div>
        }
        extra={
          <div className="flex gap-2">
            <Button 
              icon={<FaFilter />}
              onClick={() => setShowFilter((prev) => !prev)}
            >
              ফিল্টার
            </Button>
            <Link to="/tramessy/Purchase/add-maintenance">
              <Button 
                type="primary" 
                icon={<FaPlus />}
                className="!bg-primary"
              >
                মেইনটেনেন্স
              </Button>
            </Link>
          </div>
        }
        className="w-full shadow-xl rounded-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex gap-2">
            <Button icon={<DownloadOutlined />} onClick={exportExcel}>
              এক্সেল
            </Button>
            <Button icon={<DownloadOutlined />} onClick={exportPDF}>
              পিডিএফ
            </Button>
            <Button icon={<PrinterOutlined />} onClick={printTable}>
              প্রিন্ট
            </Button>
          </div>
          
          <Input
            placeholder="সার্চ করুন..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
        </div>

        {showFilter && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md mb-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="শুরুর তারিখ"
              locale="en-GB"
              className="w-full p-2 border border-gray-300 rounded text-sm"
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
              className="w-full p-2 border border-gray-300 rounded text-sm"
              isClearable
            />
            
            <Select
              value={vehicleFilter}
              onChange={(value) => {
                setVehicleFilter(value);
                setCurrentPage(1);
              }}
              placeholder="সব ইকুইপমেন্ট নম্বর"
              allowClear
              style={{ width: '100%' }}
            >
              {uniqueVehicles.map((v, index) => (
                <Option key={index} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
            
            <Button 
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setVehicleFilter("");
                setShowFilter(false);
              }}
              icon={<FaFilter />}
            >
              ফিল্টার সরান
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={currentPurchase}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredPurchase.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showQuickJumper: true,
           position: ['bottomCenter'],
          }}
          locale={{ emptyText: "কোন ডেটা পাওয়া যায়নি" }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="মেইনটেনেন্স তথ্য"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            বন্ধ
          </Button>
        ]}
        width={700}
      >
        {selectedPurchase && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex justify-between p-2">
              <span className="font-medium">প্রোডাক্ট আইডি:</span>
              <span>{selectedPurchase.id}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">সরবরাহকারীর নাম:</span>
              <span>{selectedPurchase.supplier_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ড্রাইভারের নাম:</span>
              <span>{selectedPurchase.driver_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">গাড়ির ক্যাটাগরি:</span>
              <span>{selectedPurchase.vehicle_category}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">গাড়ির নম্বর:</span>
              <span>{selectedPurchase.vehicle_no}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ক্যাটাগরি:</span>
              <span>{selectedPurchase.category}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">আইটেমের নাম:</span>
              <span>{selectedPurchase.item_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">পরিমাণ:</span>
              <span>{selectedPurchase.quantity}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">একক মূল্য:</span>
              <span>{selectedPurchase.unit_price}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">মোট:</span>
              <span>{selectedPurchase.purchase_amount}</span>
            </div>
            <div className="col-span-2 flex flex-col items-center p-2">
              <span className="font-medium mb-2">বিলের ছবি:</span>
              <img
                src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${selectedPurchase.bill_image}`}
                alt="Bill"
                className="w-48 h-48 object-contain rounded-lg border"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseList;