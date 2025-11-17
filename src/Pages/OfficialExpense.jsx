// import { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import dayjs from "dayjs";
// import {
//   Edit,
//   FileText,
//   FileSpreadsheet,
//   FileImage,
//   Printer,
//   Plus,
//   Filter,
//   X,
// } from "lucide-react";
// import {
//   FaFileExcel,
//   FaFilePdf,
//   FaFilter,
//   FaPrint,
//   FaTruck,
// } from "react-icons/fa";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import toast, { Toaster } from "react-hot-toast";
// import { FaPlus } from "react-icons/fa6";
// import { Link } from "react-router-dom";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import DatePicker from "react-datepicker";
// import { Button } from "antd";
// import { tableFormatDate } from "../components/Shared/formatDate";

// const OfficialExpense = () => {
//   const [expenses, setExpenses] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const printRef = useRef();
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     date: "",
//     paid_to: "",
//     pay_amount: "",
//     payment_category: "",
//     branch_name: "",
//     remarks: "",
//   });
//   const [errors, setErrors] = useState({});
//   // Date filter state
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [showFilter, setShowFilter] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const salaryCategories = ["Utility"];

//   // modal show handler
//   const showModal = async (record = null) => {
//     if (record) {
//       try {
//         const res = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/api/expense/${record.id}`
//         );
//         const data = res.data?.data;
//         setFormData({
//           date: data?.date || "",
//           paid_to: data?.paid_to || "",
//           pay_amount: data?.pay_amount || "",
//           payment_category: data?.payment_category || "",
//           branch_name: data?.branch_name || "",
//           remarks: data?.remarks || "",
//         });
//         setEditingId(record.id);
//       } catch (err) {
//         // showToast("ডেটা লোড করতে সমস্যা হয়েছে", "error")
//         console.log("error show modal");
//       }
//     } else {
//       setFormData({
//         date: "",
//         paid_to: "",
//         pay_amount: "",
//         payment_category: "",
//         branch_name: "",
//         remarks: "",
//       });
//       setEditingId(null);
//     }
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setFormData({
//       date: "",
//       paid_to: "",
//       pay_amount: "",
//       payment_category: "",
//       branch_name: "",
//       remarks: "",
//     });
//     setEditingId(null);
//     setIsModalVisible(false);
//     setErrors({});
//   };

//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   //   expense
//   const fetchExpenses = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BASE_URL}/api/expense/list`
//       );
//       const allExpenses = response.data?.data || [];
//       const utilityExpenses = allExpenses.filter(
//         (expense) => expense.payment_category === "Utility"
//       );

//       setExpenses(utilityExpenses);
//       setLoading(false);
//     } catch (err) {
//       console.log("Data feching issue", "error");
//       setLoading(false);
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.date) newErrors.date = "Date is required";
//     if (!formData.paid_to) newErrors.paid_to = "Recipient is required";
//     if (!formData.pay_amount) newErrors.pay_amount = "Amount is required";
//     if (!formData.branch_name)
//       newErrors.branch_name = "Branch name is required";
//     if (!formData.payment_category)
//       newErrors.payment_category = "Category is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;
//     setIsSubmitting(true);
//     try {
//       const payload = {
//         ...formData,
//         date: dayjs(formData.date).format("YYYY-MM-DD"),
//       };

//       if (editingId) {
//         await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/expense/update/${editingId}`,
//           payload
//         );
//         toast.success("Expense Data Update successful");
//       } else {
//         await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/expense/create`,
//           payload
//         );
//         toast.success("Epense Added successful");
//       }

//       handleCancel();
//       fetchExpenses();
//     } catch (err) {
//       console.error(err);
//       toast.error("Operation failed", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const filteredData = expenses.filter((item) =>
//     [item.paid_to, item.pay_amount, item.payment_category, item.remarks]
//       .join(" ")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase())
//   );
//   // csv
//   const exportCSV = () => {
//     const csvContent = [
//       ["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"],
//       ...filteredData.map((item, i) => [
//         i + 1,
//         item.date,
//         item.paid_to,
//         item.pay_amount,
//         item.payment_category,
//         item.remarks,
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     saveAs(blob, "general_expense.csv");
//   };
//   // excel
//   const exportExcel = () => {
//     const data = filteredData.map((item, i) => ({
//       ক্রমিক: i + 1,
//       তারিখ: item.date,
//       "যাকে প্রদান": item.paid_to,
//       পরিমাণ: item.pay_amount,
//       ক্যাটাগরি: item.payment_category,
//       মন্তব্য: item.remarks,
//     }));

//     const ws = XLSX.utils.json_to_sheet(data);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "General Expense");
//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), "general_expense.xlsx");
//   };
//   // pdf
//   const exportPDF = () => {
//     const doc = new jsPDF();
//     autoTable(doc, {
//       head: [["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"]],
//       body: filteredData.map((item, i) => [
//         i + 1,
//         item.date,
//         item.paid_to,
//         item.pay_amount,
//         item.payment_category,
//         item.remarks,
//       ]),
//     });
//     doc.save("general_expense.pdf");
//   };
//   // print
//   const printTable = () => {
//     const content = printRef.current.innerHTML;
//     const win = window.open("", "", "width=900,height=650");
//     win.document.write(`
//       <html>
//         <head>
//           <title>Print</title>
//           <style>
//             body { font-family: Arial, sans-serif; }
//             table { width: 100%; border-collapse: collapse; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f5f5f5; }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `);
//     win.document.close();
//     win.focus();
//     win.print();
//     win.close();
//   };

//   // pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const filteredExpense = filteredData.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
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
//     <div className=" min-h-screen">
//       <Toaster />
//       <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-4">
//         {/* Header */}
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-black flex items-center gap-3">
//             <FaTruck className="text-black text-2xl" />
//             দৈনিক অফিস খরচ
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             {/* <Link to="/tramessy/AddSallaryExpenseForm"> */}
//             <button
//               onClick={() => showModal()}
//               className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaPlus /> যোগ
//             </button>
//             {/* </Link> */}
//             <button
//               onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
//               className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4">
//           <div className="flex flex-wrap gap-2">
//             {/* <button
//               onClick={exportCSV}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FileText size={16} />
//               CSV
//             </button> */}
//             <button
//               onClick={exportExcel}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaFileExcel className="" />
//               এক্সেল
//             </button>
//             {/*                                     
//                                       <button
//                                         onClick={exportPDF}
//                                         className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//                                       >
//                                         <FaFilePdf className="" />
//                                         PDF
//                                       </button> */}

//             <button
//               onClick={printTable}
//               className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
//             >
//               <FaPrint className="" />
//               প্রিন্ট
//             </button>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium text-gray-700">সার্চ:</span>
//             <input
//               type="text"
//               className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="সার্চ..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Conditional Filter Section */}
//         {showFilter && (
//           <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <DatePicker
//               selected={startDate}
//               onChange={(date) => setStartDate(date)}
//               selectsStart
//               startDate={startDate}
//               endDate={endDate}
//               dateFormat="dd/MM/yyyy"
//               placeholderText="শুরুর তারিখ"
//               locale="en-GB"
//               className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//               isClearable
//             />

//             <DatePicker
//               selected={endDate}
//               onChange={(date) => setEndDate(date)}
//               selectsEnd
//               startDate={startDate}
//               endDate={endDate}
//               minDate={startDate}
//               dateFormat="dd/MM/yyyy"
//               placeholderText="শেষ তারিখ"
//               locale="en-GB"
//               className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//               isClearable
//             />
//             <Button
//             type="primary"
//               onClick={() => {
//                 setStartDate("");
//                 setEndDate("");
//                 setShowFilter(false);
//                 setCurrentPage(1);
//               }}
//               icon={<FaFilter />}
//               className="!bg-primary !text-white"
//             >
//               মুছে ফেলুন
//             </Button>
//           </div>
//         )}

//         {/* Table */}
//         <div
//           className="mt-5 overflow-x-auto rounded-xl border border-gray-200"
//           ref={printRef}
//         >
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
//               <tr className="">
//                 <th className="px-3 py-3 text-left text-sm font-semibold w-16">
//                   ক্রমিক
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold">
//                   তারিখ
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold">
//                   প্রদত্ত ব্যক্তি
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold">
//                   পরিমাণ
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold">
//                   ক্যাটাগরি
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold">
//                   মন্তব্য
//                 </th>
//                 <th className="px-3 py-3 text-left text-sm font-semibold w-24">
//                   অ্যাকশন
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan="7"
//                     className="px-3 py-10 text-center text-gray-500"
//                   >
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filteredExpense.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="text-center py-10 text-gray-500 italic"
//                   >
//                     <div className="flex flex-col items-center">
//                       <svg
//                         className="w-12 h-12 text-gray-300 mb-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                       No Expense data found.
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredExpense.map((item, index) => (
//                   <tr
//                     key={item.id}
//                     className="border-b border-gray-200 hover:bg-gray-50"
//                   >
//                     <td className="px-3 py-3 text-sm">{index + 1}</td>
//                     <td className="px-3 py-3 text-sm">{tableFormatDate(item.date)}</td>
//                     <td className="px-3 py-3 text-sm">{item.paid_to}</td>
//                     <td className="px-3 py-3 text-sm">{item.pay_amount}</td>
//                     <td className="px-3 py-3 text-sm">
//                       {item.payment_category}
//                     </td>
//                     <td className="px-3 py-3 text-sm">{item.remarks}</td>
//                     <td className="px-3 py-3 text-sm">
//                       <button
//                         onClick={() => showModal(item)}
//                         className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
//                       >
//                         <Edit size={12} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//         {/* pagination */}
//         {filteredExpense.length === 0 ? (
//           ""
//         ) : (
//           <div className="mt-10 flex justify-center">
//             <div className="space-x-2 flex items-center">
//               <button
//                 onClick={handlePrevPage}
//                 className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                   } rounded-sm`}
//                 disabled={currentPage === 1}
//               >
//                 <GrFormPrevious />
//               </button>
//               {[...Array(totalPages).keys()].map((number) => (
//                 <button
//                   key={number + 1}
//                   onClick={() => handlePageClick(number + 1)}
//                   className={`px-3 py-1 rounded-sm ${currentPage === number + 1
//                     ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                     : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                     }`}
//                 >
//                   {number + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={handleNextPage}
//                 className={`p-2 ${currentPage === totalPages
//                   ? "bg-gray-300"
//                   : "bg-primary text-white"
//                   } rounded-sm`}
//                 disabled={currentPage === totalPages}
//               >
//                 <GrFormNext />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {isModalVisible && (
//         <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
//           <div className="relative bg-white rounded-lg shadow-lg p-6  max-w-2xl border border-gray-300">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-5 ">
//               <h2 className="text-lg font-semibold text-gray-900">
//                 {editingId ? "Update Daily Expense" : " দৈনিক অফিস খরচ"}
//               </h2>
//               <button
//                 onClick={handleCancel}
//                 className="p-1 hover:bg-gray-100 rounded transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <form onSubmit={handleFormSubmit}>
//               <div className="p-5">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       তারিখ <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       value={formData.date}
//                       onChange={(e) =>
//                         setFormData({ ...formData, date: e.target.value })
//                       }
//                     />
//                     {errors.date && (
//                       <p className="text-red-500 text-xs mt-1">{errors.date}</p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       প্রদত্ত ব্যক্তি <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="প্রদত্ত ব্যক্তি"
//                       value={formData.paid_to}
//                       onChange={(e) =>
//                         setFormData({ ...formData, paid_to: e.target.value })
//                       }
//                     />
//                     {errors.paid_to && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.paid_to}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       পরিমাণ <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="পরিমাণ"
//                       value={formData.pay_amount}
//                       onChange={(e) =>
//                         setFormData({ ...formData, pay_amount: e.target.value })
//                       }
//                     />
//                     {errors.pay_amount && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.pay_amount}
//                       </p>
//                     )}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       ক্যাটাগরি <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       value={formData.payment_category}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           payment_category: e.target.value,
//                         })
//                       }
//                     >
//                       <option value="">ক্যাটাগরি নির্বাচন করুন</option>
//                       {salaryCategories.map((category) => (
//                         <option key={category} value={category}>
//                           {category}
//                         </option>
//                       ))}
//                     </select>
//                     {errors.payment_category && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.payment_category}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       শাখার নাম <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="শাখার নাম"
//                       value={formData.branch_name}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           branch_name: e.target.value,
//                         })
//                       }
//                     />
//                     {errors.branch_name && (
//                       <p className="text-red-500 text-xs mt-1">
//                         {errors.branch_name}
//                       </p>
//                     )}
//                   </div>

//                   <div className="mb-4">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       মন্তব্য
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="মন্তব্য"
//                       value={formData.remarks}
//                       onChange={(e) =>
//                         setFormData({ ...formData, remarks: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="flex justify-end gap-3 p-5 ">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   বাতিল করুন
//                 </button>
//                 <BtnSubmit loading={isSubmitting}>জমা দিন</BtnSubmit>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OfficialExpense;


import { useEffect, useState, useRef } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import dayjs from "dayjs"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTrashAlt, FaTruck } from "react-icons/fa"
import toast, { Toaster } from "react-hot-toast"
import { FaPlus } from "react-icons/fa6"

import { FiFileText, FiX } from "react-icons/fi"
import { BiEdit } from "react-icons/bi"

import DatePicker from "react-datepicker"
import { IoMdClose } from "react-icons/io"
import BtnSubmit from "../components/Button/BtnSubmit"
import Pagination from "../components/Shared/Pagination"
import api from "../utils/axiosConfig"
import { toNumber } from "../hooks/toNumber"

const OfficialExpense = () => {
  const [expenses, setExpenses] = useState([])
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const printRef = useRef()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    date: "",
    paid_to: "",
    amount: "",
    payment_category: "",
    branch_name: "",
    particulars: "",
    status: "",
  })
  const [errors, setErrors] = useState({})
  // তারিখ ফিল্টার স্টেট
  const [selectedExpenseId, setSelectedExpenseId] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const salaryCategories = [
    "Utility",
  ];

   const statusOptions = [
    { value: "Paid", label: "পরিশোধিত" },
    { value: "Unpaid", label: "অপরিশোধিত" }
  ];

  //   ব্রাঞ্চ API
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get(`/office`);
        if (response?.data?.success) {
          setBranches(response?.data?.data);
        }
      } catch (err) {
        console.error("ব্রাঞ্চ লোড করতে সমস্যা:", err);
        toast.error("ব্রাঞ্চ লিস্ট লোড করতে ব্যর্থ");
      }
    };

    fetchBranches();
  }, []);

  // মোডাল দেখানোর হ্যান্ডলার
  const showModal = async (record = null) => {
    if (record) {
      try {
        const res = await api.get(`/expense/${record.id}`)
        const data = res.data
        setFormData({
          date: data?.date || "",
          paid_to: data?.paid_to || "",
          amount: data?.amount || "",
          payment_category: data?.payment_category || "",
          branch_name: data?.branch_name || "",
          particulars: data?.particulars || "",
          status: data?.status || "",
        })
        setEditingId(record.id)
      } catch (err) {
        // showToast("ডেটা লোড করতে সমস্যা হয়েছে", "error")
        console.log("মোডাল দেখাতে সমস্যা")
      }
    } else {
      setFormData({
        date: "",
        paid_to: "",
        amount: "",
        payment_category: "",
        branch_name: "",
        particulars: "",
        status: "",
      })
      setEditingId(null)
    }
    setIsModalVisible(true)
  }

  // মোডাল বাতিল
  const handleCancel = () => {
    setFormData({
      date: "",
      paid_to: "",
      amount: "",
      payment_category: "",
      branch_name: "",
      particulars: "",
      status: "",
    })
    setEditingId(null)
    setIsModalVisible(false)
    setErrors({})
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  //   খরচ লোড
  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expense`)
      const allExpenses = response.data || [];
      const utilityExpenses = allExpenses.filter(expense =>
        expense.payment_category === 'Utility'
      );

      setExpenses(utilityExpenses);
      setLoading(false)
    } catch (err) {
      console.log("ডেটা লোড করতে সমস্যা", "error")
      setLoading(false)
    }
  }

  // ফর্ম ভ্যালিডেশন
  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = "তারিখ আবশ্যক"
    if (!formData.paid_to) newErrors.paid_to = "গ্রহীতা আবশ্যক"
    if (!formData.amount) newErrors.amount = "পরিমাণ আবশ্যক"
    if (!formData.branch_name) newErrors.branch_name = "ব্রাঞ্চের নাম আবশ্যক"
    if (!formData.payment_category) newErrors.payment_category = "ক্যাটাগরি আবশ্যক"
    if (!formData.particulars) newErrors.particulars = "বিবরণ আবশ্যক"
    if (!formData.status) newErrors.status = "স্ট্যাটাস আবশ্যক";

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // আইডি দ্বারা ডিলিট
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/expense/${id}`);

      // লোকাল লিস্ট থেকে খরচ সরান
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast.success("খরচ সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedExpenseId(null);
    } catch (error) {
      console.error("ডিলিট সমস্যা:", error.response || error);
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // ফর্ম ডেটা সাবমিট হ্যান্ডলার ফাংশন
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: dayjs(formData.date).format("YYYY-MM-DD"),
      }

      if (editingId) {
        await api.put(`/expense/${editingId}`, payload)
        toast.success("খরচ ডেটা সফলভাবে আপডেট হয়েছে")
      } else {
        await api.post(`/expense`, payload)
        toast.success("খরচ সফলভাবে যোগ হয়েছে")
      }

      handleCancel()
      fetchExpenses()
    } catch (err) {
      console.error(err)
      toast.error("অপারেশন ব্যর্থ হয়েছে", "error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredData = expenses.filter((item) => {
    const itemDate = dayjs(item.date).format("YYYY-MM-DD");

    const matchesSearch = [item.paid_to, item.amount, item.payment_category, item.particulars, item.branch_name, item.status,]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // তারিখ ফিল্টার লজিক
    let matchesDate = true;
    if (startDate && !endDate) {
      // শুধুমাত্র শুরু তারিখ দিলে সেই তারিখের ডেটা
      matchesDate = itemDate === dayjs(startDate).format("YYYY-MM-DD");
    } else if (startDate && endDate) {
      // শুরু + শেষ তারিখ দিলে রেঞ্জ ফিল্টার
      matchesDate =
        itemDate >= dayjs(startDate).format("YYYY-MM-DD") &&
        itemDate <= dayjs(endDate).format("YYYY-MM-DD");
    }

    return matchesSearch && matchesDate;
  })

  // CSV এক্সপোর্ট
  const exportCSV = () => {
    const csvContent = [
      ["সিরিয়াল", "তারিখ", "গ্রহীতা", "পরিমাণ", "ক্যাটাগরি", "মন্তব্য"],
      ...filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.pay_amount,
        item.payment_category,
        item.particulars,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "সাধারণ_খরচ.csv")
  }

  // এক্সেল এক্সপোর্ট
  const exportExcel = () => {
    const data = filteredData.map((item, i) => ({
      Sl: i + 1,
      Date: item.date,
      "Paid To": item.paid_to,
      "Amount": item.amount,
      "Payment Category": item.payment_category,
      "Particulars": item.particulars,
      Status: item.status,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "সাধারণ খরচ")
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), "সাধারণ_খরচ.xlsx")
  }

  // PDF এক্সপোর্ট
  const exportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [["সিরিয়াল", "তারিখ", "গ্রহীতা", "পরিমাণ", "ক্যাটাগরি", "মন্তব্য"]],
      body: filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.amount,
        item.payment_category,
        item.particulars,
        item.status,
      ]),
    })
    doc.save("সাধারণ_খরচ.pdf")
  }

  // প্রিন্ট
  const printTable = () => {
    const tableHeader = `
    <thead>
      <tr>
        <th>সিরিয়াল</th>
        <th>তারিখ</th>
        <th>ব্রাঞ্চ</th>
        <th>গ্রহীতা</th>
        <th>পরিমাণ</th>
        <th>ক্যাটাগরি</th>
        <th>মন্তব্য</th>
        <th>স্ট্যাটাস</th>
      </tr>
    </thead>
  `;

    const tableRows = filteredData
      .map(
        (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.date || ""}</td>
          <td>${item.branch_name || ""}</td>
          <td>${item.paid_to || ""}</td>
          <td>${toNumber(item.amount) || ""}</td>
          <td>${item.payment_category || ""}</td>
          <td>${item.particulars || ""}</td>
           <td>${item.status || ""}</td>
        </tr>
      `
      )
      .join("");

    const printContent = `
    <table>
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

    const win = window.open("", "", "width=900,height=650");
    win.document.write(`
    <html>
      <head>
        <title>অফিস খরচ</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h3 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
          thead { background-color: #11375B; color: white; }
          tbody tr:nth-child(odd) { background-color: #f9f9f9; }
          thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>অফিস খরচ তালিকা</h3>
        ${printContent}
      </body>
    </html>
  `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // পেজিনেশন
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredExpense = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-2 ">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* হেডার */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-xl" />
            দৈনিক অফিস খরচ
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button onClick={() => showModal()} className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> যোগ করুন
            </button>
            <button
              onClick={() => setShowFilter((prev) => !prev)} // ফিল্টার টগল
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {/* কন্ট্রোলস */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow   hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={printTable}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow  hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              className="lg:w-60 px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/*  ক্লিয়ার বাটন */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-12 top-[6.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* কন্ডিশনাল ফিল্টার সেকশন */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
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
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setStartDate("")
                  setEndDate("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> ক্লিয়ার
              </button>
            </div>
          </div>
        )}

        {/* টেবিল */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200" ref={printRef}>
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr className="">
                <th className="px-3 py-3 text-left text-sm font-semibold w-16">সিরিয়াল</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">তারিখ</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">ব্রাঞ্চের নাম</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">গ্রহীতা</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">পরিমাণ</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">ক্যাটাগরি</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">মন্তব্য</th>
                <th className="px-3 py-2">স্ট্যাটাস</th>
                <th className="px-3 py-3 text-left text-sm font-semibold w-24 action_column">একশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-10 text-center text-gray-500">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredExpense.length === 0 ? (
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
                      কোনো খরচের ডেটা পাওয়া যায়নি।
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpense.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-3 text-sm">{index + 1}</td>
                    <td className="px-3 py-3 text-sm">{item.date}</td>
                    <td className="px-3 py-3 text-sm">{item.branch_name}</td>
                    <td className="px-3 py-3 text-sm">{item.paid_to}</td>
                    <td className="px-3 py-3 text-sm">{item.amount}</td>
                    <td className="px-3 py-3 text-sm">{item.payment_category}</td>
                    <td className="px-3 py-3 text-sm">{item.particulars}</td>
                    <td
                      className={`px-3 py-2 font-semibold ${item.status === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                        }`}
                    >
                      {item.status}
                    </td>
                    <td className="px-3 py-3 text-sm action_column flex gap-2 items-center">
                      <button
                        onClick={() => showModal(item)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                      >
                        <BiEdit size={12} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExpenseId(item.id);
                          setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* পেজিনেশন */}
        {filteredExpense.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

      {/* মোডাল */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50 overflow-auto scroll-hidden">
          <div className="relative bg-white rounded-lg shadow-lg p-6  w-3xl border border-gray-300">
            {/* মোডাল হেডার */}
            <div className="flex justify-between items-center p-5 ">
              <h2 className="text-lg font-semibold text-gray-900">{editingId ? "দৈনিক খরচ আপডেট করুন" : "দৈনিক খরচ যোগ করুন"}</h2>
              <button onClick={handleCancel} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <FiX size={20} />
              </button>
            </div>

            {/* মোডাল বডি */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">তারিখ <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">গ্রহীতা <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="গ্রহীতা"
                      value={formData.paid_to}
                      onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                    />
                    {errors.paid_to && <p className="text-red-500 text-xs mt-1">{errors.paid_to}</p>}
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ক্যাটাগরি <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.payment_category}
                      onChange={(e) => setFormData({ ...formData, payment_category: e.target.value })}
                    >
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {salaryCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.payment_category && <p className="text-red-500 text-xs mt-1">{errors.payment_category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পরিমাণ <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="পরিমাণ"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                    {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ব্রাঞ্চের নাম  <span className="text-red-500">*</span></label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.branch_name}
                      onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                    >
                      <option value="">ব্রাঞ্চ নির্বাচন করুন</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.branch_name}>
                          {branch.branch_name}
                        </option>
                      ))}
                    </select>
                    {errors.branch_name && <p className="text-red-500 text-xs mt-1">{errors.branch_name}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">মন্তব্য<span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="মন্তব্য"
                      value={formData.particulars}
                      onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                    />
                    {errors.particulars && <p className="text-red-500 text-xs mt-1">{errors.particulars}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      স্ট্যাটাস <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border px-3 py-2 rounded-md"
                    >
                      <option value="">স্ট্যাটাস নির্বাচন করুন</option>
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="text-xs text-red-500">{errors.status}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* মোডাল ফুটার */}
              <div className="flex justify-end gap-3  ">
                <button
                  type="button"
                  onClick={handleCancel}
                  className=" mt-5 px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  বাতিল
                </button>
                <BtnSubmit
                  loading={isSubmitting}
                >
                  সাবমিট
                </BtnSubmit>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ডিলিট মোডাল */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>
              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                আপনি কি নিশ্চিত যে আপনি এই খরচটি মুছে ফেলতে চান?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  না
                </button>
                <button
                  onClick={() => handleDelete(selectedExpenseId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OfficialExpense
