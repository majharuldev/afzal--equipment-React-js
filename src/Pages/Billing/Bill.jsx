
// import axios from "axios"
// import { useEffect, useState, useRef } from "react"
// import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
// import { HiCurrencyBangladeshi } from "react-icons/hi2"
// import toast, { Toaster } from "react-hot-toast"
// import * as XLSX from "xlsx"
// import { saveAs } from "file-saver"
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts"
// import { toWords } from "number-to-words"
// import ReactPaginate from "react-paginate"
// import { tableFormatDate } from "../../components/Shared/formatDate"

// pdfMake.vfs = pdfFonts.vfs

// const Bill = () => {
//   const [yamaha, setYamaha] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showFilter, setShowFilter] = useState(false)
//   const [selectedRows, setSelectedRows] = useState({})
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
//   const [currentPage, setCurrentPage] = useState(0);
//   const itemsPerPage = 10;

//   // Customer search states
//   const [customerList, setCustomerList] = useState([])
//   const [customerSearchTerm, setCustomerSearchTerm] = useState("")
//   const [selectedCustomer, setSelectedCustomer] = useState("")
//   const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
//   const customerSearchRef = useRef(null)

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setYamaha(response.data.data)
//         }
//         setLoading(false)
//       })
//       .catch((error) => {
//         console.error("ডেটা আনার সময় সমস্যা:", error)
//         setLoading(false)
//       })
//   }, [])

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setCustomerList(response.data.data)
//         }
//       })
//       .catch((error) => console.error("কাস্টমার তালিকা আনতে সমস্যা:", error))
//   }, [])

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
//         setShowCustomerSuggestions(false)
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside)
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside)
//     }
//   }, [])

//   const handleCheckBox = (tripId) => {
//     setSelectedRows((prev) => ({
//       ...prev,
//       [tripId]: !prev[tripId],
//     }))
//   }

//   const exportToExcel = () => {
//     const selectedData = yamaha.filter((_, i) => selectedRows[i])
//     if (!selectedData.length) {
//       return toast.error("দয়া করে অন্তত একটি সারি নির্বাচন করুন।")
//     }
//     const excelData = selectedData.map((dt, idx) => ({
//       SL: idx + 1,
//       Date: dt.date,
//       Product: "বাইক",
//       Portfolio: dt.customer,
//       Vehicle: dt.vehicle_no,
//       Chalan: dt.challan,
//       From: dt.load_point,
//       Destination: dt.unload_point,
//       Quantity: dt.quantity,
//       BodyFare: dt.body_fare,
//       Dropping: "",
//       FuelCost: dt.fuel_cost,
//     }))
//     const worksheet = XLSX.utils.json_to_sheet(excelData)
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, "বিল")
//     const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
//     saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
//   }

//   const exportToPDF = () => {
//     const selectedData = yamaha.filter((_, i) => selectedRows[i])
//     if (!selectedData.length) {
//       return toast.error("দয়া করে অন্তত একটি সারি নির্বাচন করুন।")
//     }
//     const docDefinition = {
//       content: [
//         { text: "বিল", style: "header" },
//         {
//           table: {
//             headerRows: 1,
//             widths: ["auto", "*", "*", "*", "*", "*", "*"],
//             body: [
//               ["SL", "তারিখ", "গাড়ি", "চালান", "উৎক্ষেপণ", "গন্তব্য", "পরিমাণ"],
//               ...selectedData.map((dt, idx) => [
//                 idx + 1,
//                 dt.date,
//                 dt.vehicle_no,
//                 dt.challan,
//                 dt.load_point,
//                 dt.unload_point,
//                 dt.quantity,
//               ]),
//             ],
//           },
//         },
//       ],
//       styles: {
//         header: {
//           fontSize: 16,
//           bold: true,
//           marginBottom: 10,
//         },
//       },
//     }
//     pdfMake.createPdf(docDefinition).download("Bill.pdf")
//   }

//    const handlePrint = () => {
//     const selectedData = filteredTrips.filter((trip) => selectedRows[trip.id])
//     if (!selectedData.length) {
//       return toast.error("Please select at least one row.")
//     }

//     // Get customer name from first selected trip
//     const customerName = selectedData[0]?.customer || "Customer Name"

//     // Calculate totals for selected data
//     const {
//       totalRent: printTotalRent,
//       totalDemurrage: printTotalDemurrage,
//       grandTotal: printGrandTotal,
//     } = calculateTotals(selectedData)

//     // Generate bill number based on current date
//     const currentDate = new Date()
//     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//     const currentMonth = monthNames[currentDate.getMonth()]
//     const currentYear = currentDate.getFullYear()
//     const billNumber = `${currentMonth}-${currentYear} Bill Summary`

//     // Convert total to words
//     const totalInWords = numberToWords(printGrandTotal)

//     const newWindow = window.open("", "_blank")
//     const html = `
//       <html>
//         <head>
//           <style>
//             @page { margin: 0; }
//             body {
//               margin: 1cm;
//               font-family: Arial, sans-serif;
//               font-size: 12px;
//             }
//             .header {
//               text-align: center;
//               margin-bottom: 20px;
//               border-bottom: 2px solid #000;
//               padding-bottom: 10px;
//             }
//             .company-name-bangla {
//               font-size: 18px;
//               font-weight: bold;
//               margin-bottom: 5px;
//             }
//             .company-name-english {
//               font-size: 16px;
//               font-weight: bold;
//               margin-bottom: 10px;
//             }
//             .contact-info {
//               font-size: 10px;
//               line-height: 1.4;
//             }
//             .bill-info {
//               display: flex;
//               justify-content: space-between;
//               margin: 20px 0;
//             }
//             .to-section {
//               line-height: 1.6;
//             }
//             table {
//               border-collapse: collapse;
//               width: 100%;
//               font-size: 11px;
//               margin-top: 20px;
//             }
//             th, td {
//               border: 1px solid #000;
//               padding: 4px;
//               text-align: left;
//             }
//             th {
//               background: #f0f0f0;
//               font-weight: bold;
//               text-align: center;
//             }
//             .text-right { text-align: right; }
//             .text-center { text-align: center; }
//             tfoot td {
//               font-weight: bold;
//               background-color: #f9f9f9;
//             }
//             .signature-section {
//               margin-top: 40px;
//               display: flex;
//               justify-content: space-between;
//             }
//           </style>
//         </head>
//         <body>
//         <div class="bill-info" style="margin-top:3in;">
//             <div class="to-section">
//               <div>To</div>
//               <div><strong>${customerName}</strong></div>
//               <div>Usuf market, Ashulia, Dhaka</div>
//               <div><strong>Sub: ${billNumber}</strong></div>
//             </div>
//             <div>
//               <div><strong>তারিখ: ${new Date().toLocaleDateString("bn-BD")}</strong></div>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>Trip No</th>
//                 <th>Date</th>
//                 <th>Truck No</th>
//                 <th>Load/Unload</th>
//                 <th>Rent</th>
//                 <th>Demurrage</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${selectedData
//         .map(
//           (dt, i) => `
//                 <tr>
//                   <td class="text-center">${dt.id}</td>
//                   <td class="text-center">${dt.date}</td>
//                   <td class="text-center">${dt.vehicle_no || "N/A"}</td>
//                   <td>${dt.unload_point || "N/A"}</td>
//                   <td class="text-right">${dt.total_rent || 0}</td>
//                   <td class="text-right">${dt.d_total || 0}</td>
//                   <td class="text-right">${(Number.parseFloat(dt.total_rent) || 0) + (Number.parseFloat(dt.d_total) || 0)}</td>
//                 </tr>`,
//         )
//         .join("")}
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colspan="4" class="text-right"><strong>Totals</strong></td>
//                 <td class="text-right"><strong>${printTotalRent}</strong></td>
//                 <td class="text-right"><strong>${printTotalDemurrage}</strong></td>
//                 <td class="text-right"><strong>${printGrandTotal}</strong></td>
//               </tr>
//             </tfoot>
//           </table>

//           <div style="margin-top: 20px;">
//             <strong>In words: ${totalInWords}</strong>
//           </div>
//         </body>
//       </html>`

//     newWindow.document.write(html)
//     newWindow.document.close()
//     newWindow.focus()
//     newWindow.print()
//   }

//   const filteredCustomerSuggestions = customerList.filter((customer) =>
//     (customer.customer_name ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase()),
//   )

//   const handleCustomerSelect = (customerName) => {
//     setSelectedCustomer(customerName)
//     setCustomerSearchTerm(customerName)
//     setShowCustomerSuggestions(false)
//   }

//   const filteredTrips = yamaha.filter((trip) => {
//     const tripDate = new Date(trip.date).setHours(0, 0, 0, 0);
//     const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
//     const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

//     const matchDate =
//       start && end
//         ? tripDate >= start && tripDate <= end
//         : start
//         ? tripDate === start
//         : end
//         ? tripDate === end
//         : true;

//     const matchCustomer =
//       !selectedCustomer ||
//       (trip.customer ?? "").toLowerCase().includes(selectedCustomer.toLowerCase());

//     return matchDate && matchCustomer;
//   });

//   const numberToWords = (num) => {
//     if (!num || isNaN(num)) return "শূন্য"
//     return toWords(num).replace(/^\w/, (c) => c.toUpperCase()) + " টাকা মাত্র।"
//   }

//     const handleSubmit = async () => {
//     const selectedData = filteredTrips.filter(
//       (dt, i) => selectedRows[dt.id] && dt.status === "Pending"
//     );
//     if (!selectedData.length) {
//       return toast.error("Please select at least one row for Not submitted.", {
//         position: "top-right",
//       });
//     }
//     try {
//       const loadingToast = toast.loading("Submitting selected rows...")

//       // Create array of promises for all updates
//       const updatePromises = selectedData.map((dt) =>
//         fetch(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             bill_date: new Date().toISOString().split("T")[0],
//             customer_name: dt.customer,
//             vehicle_no: dt.vehicle_no,
//             chalan: dt.challan,
//             load_point: dt.load_point,
//             unload_point: dt.unload_point,
//             qty: dt.quantity,
//             body_cost: dt.body_fare,
//             fuel_cost: dt.fuel_cost,
//             driver_name: dt.driver_name,
//             bill_amount: dt.total_rent,
//           }),
//         }).then(() =>
//           fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               status: "Approved",
//               customer: dt.customer,
//               date: dt.date,
//               load_point: dt.load_point,
//               unload_point: dt.unload_point,
//               transport_type: dt.transport_type,
//               vehicle_no: dt.vehicle_no,
//               total_rent: dt.total_rent,
//               quantity: dt.quantity,
//               dealer_name: dt.dealer_name,
//               driver_name: dt.driver_name,
//               fuel_cost: dt.fuel_cost,
//               do_si: dt.do_si,
//               driver_mobile: dt.driver_mobile,
//               challan: dt.challan,
//               sti: dt.sti,
//               model_no: dt.model_no,
//               co_u: dt.co_u,
//               masking: dt.masking,
//               unload_charge: dt.unload_charge,
//               extra_fare: dt.extra_fare,
//               vehicle_rent: dt.vehicle_rent,
//               goods: dt.goods,
//               distribution_name: dt.distribution_name,
//               remarks: dt.remarks,
//               no_of_trip: dt.no_of_trip,
//               vehicle_mode: dt.vehicle_mode,
//               per_truck_rent: dt.per_truck_rent,
//               vat: dt.vat,
//               total_rent_cost: dt.total_rent_cost,
//               driver_commission: dt.driver_commission,
//               road_cost: dt.road_cost,
//               food_cost: dt.food_cost,
//               total_exp: dt.total_exp,
//               trip_rent: dt.trip_rent,
//               advance: dt.advance,
//               due_amount: dt.due_amount,
//               ref_id: dt.ref_id,
//               body_fare: dt.body_fare,
//               parking_cost: dt.parking_cost,
//               night_guard: dt.night_guard,
//               toll_cost: dt.toll_cost,
//               feri_cost: dt.feri_cost,
//               police_cost: dt.police_cost,
//               driver_adv: dt.driver_adv,
//               chada: dt.chada,
//               labor: dt.labor,
//               additional_load: dt.additional_load,
//               trip_type: dt.trip_type,
//               additional_cost: dt.additional_cost,
//             }),
//           }),
//         ),
//       )

//       // Wait for all updates to complete
//       await Promise.all(updatePromises)

//       // Update local state immediately
//       setYamaha((prev) =>
//         prev.map((trip) => (selectedData.some((dt) => dt.id === trip.id) ? { ...trip, status: "Approved" } : trip)),
//       )

//       toast.success("Successfully submitted!", { id: loadingToast })
//       setSelectedRows({})
//     } catch (error) {
//       console.error("Submission error:", error)
//       toast.error("Submission failed. Check console for details.")
//     }
//   }

//   const selectedTripsForCalculation = filteredTrips.filter((_, idx) => selectedRows[idx])
//   const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : filteredTrips

//   const totalBodyFare = tripsToCalculate.reduce((sum, dt) => sum + (Number.parseFloat(dt.body_fare) || 0), 0)
//   const totalRent = tripsToCalculate.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)

//   const pageCount = Math.ceil(filteredTrips.length / itemsPerPage);
//   const offset = currentPage * itemsPerPage;
//   const currentItems = filteredTrips.slice(offset, offset + itemsPerPage);

//   const handlePageClick = ({ selected }) => setCurrentPage(selected);

//   if (loading) return <p className="text-center mt-16">ডেটা লোড হচ্ছে...</p>

//   return (
//     <div>
//       <Toaster />
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
//             বিলিং
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FaFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>
//         {/* Export and Search */}
//         <div className="md:flex justify-between items-center">
//           <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
//             <button onClick={exportToExcel} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaFileExcel /> এক্সেল
//             </button>
//             <button onClick={exportToPDF} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaFilePdf /> পিডিএফ
//             </button>
//             <button onClick={handlePrint} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
//               <FaPrint /> প্রিন্ট
//             </button>
//           </div>
//           <div className="mt-3 md:mt-0">
//             <div className="relative mt-3 md:mt-0" ref={customerSearchRef}>
//               <input
//                 type="text"
//                 placeholder="কাস্টমার খুঁজুন..."
//                 value={customerSearchTerm}
//                 onChange={(e) => {
//                   setCustomerSearchTerm(e.target.value);
//                   setShowCustomerSuggestions(true);
//                   setCurrentPage(0);
//                 }}
//                 onFocus={() => {
//                   setShowCustomerSuggestions(true);
//                   if (selectedCustomer) {
//                     setCustomerSearchTerm("");
//                     setSelectedCustomer("");
//                   }
//                 }}
//                 className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
//               />
//               {showCustomerSuggestions && (
//                 <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
//                   {filteredCustomerSuggestions.length > 0 ? (
//                     filteredCustomerSuggestions.map((customer, idx) => (
//                       <li
//                         key={idx}
//                         className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                         onClick={() => handleCustomerSelect(customer.customer_name)}
//                       >
//                         {customer.customer_name}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="px-4 py-2 text-gray-500">কোনো কাস্টমার পাওয়া যায়নি</li>
//                   )}
//                 </ul>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Filter Section */}
//         {showFilter && (
//           <div className="flex gap-4 border border-gray-300 rounded-md p-5 my-5">
//             <div className="relative w-full">
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
//                 className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//               {startDate && (
//                 <button onClick={() => { setStartDate(""); setCurrentPage(0); }} className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900" type="button">&times;</button>
//               )}
//             </div>

//             <div className="relative w-full">
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
//                 className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//               />
//               {endDate && (
//                 <button onClick={() => { setEndDate(""); setCurrentPage(0); }} className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900" type="button">&times;</button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Table Section */}
//         <div className="mt-5 overflow-x-auto">
//           <table className="min-w-full text-sm text-left text-gray-900">
//             <thead className="capitalize text-sm">
//               <tr>
//                 <th className="border border-gray-700 px-2 py-1">ক্রমিক</th>
//                 <th className="border border-gray-700 px-2 py-1">তারিখ</th>
//                 <th className="border border-gray-700 px-2 py-1">কাস্টমার</th>
//                 <th className="border border-gray-700 px-2 py-1">গাড়ি নং</th>
//                 <th className="border border-gray-700 px-2 py-1">চালান নং</th>
//                 <th className="border border-gray-700 px-2 py-1">সি এফ টি</th>
//                 <th className="border border-gray-700 px-2 py-1">দর</th>
//                 <th className="border border-gray-700 px-2 py-1">বিলের টাকা</th>
//                 <th className="border border-gray-700 px-2 py-1">বিলের অবস্থা</th>
//               </tr>
//             </thead>
//             <tbody className="font-semibold">
//               {currentItems.map((dt, index) => (
//                 <tr key={index} className="hover:bg-gray-50 transition-all">
//                   <td className="border border-gray-700 p-1 font-bold">{index + 1}.</td>
//                   <td className="border border-gray-700 p-1">{tableFormatDate(dt.date)}</td>
//                   <td className="border border-gray-700 p-1">{dt.customer}</td>
//                   <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
//                   <td className="border border-gray-700 p-1">{dt.load_point}</td>
//                  <td className="border border-gray-700 p-1">{dt.total_rent}</td>
//                   <td className="border border-gray-700 p-1">{dt.total_rent}</td>
//                    <td className="border border-gray-700 p-1">{dt.total_rent}</td>
//                   {/* <td className="border border-gray-700 p-1 text-center">
//                     {dt.status === "Pending" ? (
//                       <input type="checkbox" className="w-4 h-4" checked={!!selectedRows[index]} onChange={() => handleCheckBox(index)} />
//                     ) : (
//                       <span className="inline-block px-2 py-1 text-xs text-green-700 rounded">জমা দেওয়া হয়েছে</span>
//                     )}
//                   </td> */}
//                    <td className="border border-gray-700 p-1 text-center ">
//                     <div className="flex items-center">
//                       <input
//                         type="checkbox"
//                         className="w-4 h-4"
//                         checked={!!selectedRows[dt.id]}
//                         onChange={() => handleCheckBox(dt.id)}
//                         disabled={false}
//                       />
//                       {dt.status === "Pending" && (
//                         <span className=" inline-block px-2  text-xs text-yellow-600 rounded">
//                           Not Submitted
//                         </span>
//                       )}
//                       {dt.status === "Approved" && (
//                         <span className=" inline-block px-2  text-xs text-green-700 rounded">
//                           Submitted
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//             <tfoot>
//               <tr className="font-bold">
//                 <td colSpan={6} className="border border-black px-2 py-1 text-right">মোট</td>
//                 <td className="border border-black px-2 py-1">{totalRent}</td>
//                 <td className="border border-black px-2 py-1"></td>
//               </tr>
//               <tr className="font-bold">
//                 <td colSpan={13} className="border border-black px-2 py-1">
//                   মোট পরিমাণ (বডি বিলের জন্য): <span className="font-medium">{numberToWords(totalBodyFare)}</span>
//                 </td>
//               </tr>
//               <tr className="font-bold">
//                 <td colSpan={13} className="border border-black px-2 py-1">
//                   মোট পরিমাণ (ফুয়েল বিলের জন্য): <span className="font-medium">{numberToWords(totalRent)}</span>
//                 </td>
//               </tr>
//             </tfoot>
//           </table>

//           {pageCount > 1 && (
//             <div className="mt-4 flex justify-center">
//               <ReactPaginate
//                 previousLabel={"আগের"}
//                 nextLabel={"পরের"}
//                 breakLabel={"..."}
//                 pageCount={pageCount}
//                 marginPagesDisplayed={2}
//                 pageRangeDisplayed={5}
//                 onPageChange={handlePageClick}
//                 containerClassName={"flex items-center gap-1"}
//                 pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
//                 previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
//                 nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
//                 breakClassName={"px-3 py-1"}
//                 activeClassName={"bg-primary text-white border-primary"}
//                 forcePage={currentPage}
//               />
//             </div>
//           )}

//           <div className="flex justify-end mt-5">
//             <button
//               className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
//               onClick={handleSubmit}
//             >
//               পরিবর্তন সংরক্ষণ করুন
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Bill


import { useState, useEffect, useRef } from "react"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import { HiCurrencyBangladeshi } from "react-icons/hi2"
import toast, { Toaster } from "react-hot-toast"
import * as XLSX from "xlsx"
import saveAs from "file-saver"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import CreatableSelect from "react-select/creatable"
import { tableFormatDate } from "../../components/Shared/formatDate"
import DatePicker from "react-datepicker"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"

pdfMake.vfs = pdfFonts.vfs

const Bill = () => {
  const [yamaha, setYamaha] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // New states for customer search
  const [customerList, setCustomerList] = useState([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const customerSearchRef = useRef(null)

  // fetch all trip data from server
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Success") {
          setYamaha(data.data)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error)
        setLoading(false)
      })
  }, [])

  // Fetch customer list for the search dropdown
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Success") {
          setCustomerList(data.data)
        }
      })
      .catch((error) => console.error("Error fetching customer list:", error))
  }, [])

  const customerOptions = customerList.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
  }))

  // Handle click outside the customer search input to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
        setShowCustomerSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const exportToExcel = () => {
  const selectedData = yamaha.filter((trip) => selectedRows[trip.id])
  if (!selectedData.length) {
    return toast.error("Please select at least one row.")
  }

  const excelData = selectedData.map((dt, idx) => ({
    SL: idx + 1,
    Date: tableFormatDate(dt.date),
    Vehicle: dt.vehicle_no,
    Chalan: dt.challan_no,
    Rent: dt.total_rent,
    Rate: 15,
    Total: (Number.parseFloat(dt.total_rent) || 0) * 15,
    Status: dt.status,
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bill")

  // Footer totals যোগ করা
  XLSX.utils.sheet_add_aoa(
    worksheet,
    [["", "", "", "মোট", totalRent, 15, grandTotal]],
    { origin: -1 }
  )

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
}


  const exportToPDF = () => {
  const selectedData = yamaha.filter((trip) => selectedRows[trip.id])
  if (!selectedData.length) {
    return toast.error("Please select at least one row.")
  }

 const body = [
  ["ক্রমিক", "তারিখ", "গাড়ি নং", "চালান নং", "সি এফ টি", "দর", "বিলের টাকা", "অবস্থা"],
  ...selectedData.map((dt, idx) => [
    idx + 1,
    tableFormatDate(dt.date),
    dt.vehicle_no,
    dt.challan_no,
    dt.total_rent,
    15,
    (Number.parseFloat(dt.total_rent) || 0) * 15,
    dt.status,
  ]),
  [
    { text: "মোট", colSpan: 4, alignment: "right" }, {}, {}, {},
    totalRent,
    15,
    grandTotal,
    ""
  ],
]
  const docDefinition = {
    content: [
      { text: "বিল", style: "header" },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "*", "*", "*", "*", "*", "*"],
          body,
        },
      },
      { text: `মোট পরিমাণ কথায়: ${numberToWords(grandTotal)}`, margin: [0, 10, 0, 0] },
    ],
    styles: {
      header: { fontSize: 16, bold: true, marginBottom: 10 },
    },
  }

  pdfMake.createPdf(docDefinition).download("Bill.pdf")
}


  // Filtered customer suggestions based on search term
  const filteredCustomerSuggestions = customerList.filter((customer) =>
    (customer.customer_name ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase()),
  )

  // Handle customer selection from suggestions
  const handleCustomerSelect = (customerName) => {
    setSelectedCustomer(customerName)
    setCustomerSearchTerm(customerName)
    setShowCustomerSuggestions(false)
    setCurrentPage(1)
  }

  // total word function
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero Taka only"

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    const convertHundreds = (n) => {
      let result = ""
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred "
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " "
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + " "
        return result
      }
      if (n > 0) {
        result += ones[n] + " "
      }
      return result
    }

    let result = ""
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const remainder = num % 1000

    if (crore > 0) {
      result += convertHundreds(crore) + "Crore "
    }
    if (lakh > 0) {
      result += convertHundreds(lakh) + "Lakh "
    }
    if (thousand > 0) {
      result += convertHundreds(thousand) + "Thousand "
    }
    if (remainder > 0) {
      result += convertHundreds(remainder)
    }

    return result.trim() + " Taka only"
  }
// বাংলা সংখ্যাকে কথায় কনভার্ট করার ফাংশন
const numberToBanglaWords = (num) => {
  if (!num || isNaN(num)) return "শূন্য টাকা মাত্র";

  const ones = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
  const tens = ["", "দশ", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];
  const teens = ["এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ"];

  const convertHundreds = (n) => {
    let result = "";
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " শত ";
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    } else if (n > 10) {
      result += teens[n - 11] + " ";
      return result;
    }
    if (n > 0) {
      result += ones[n] + " ";
    }
    return result;
  };

  let result = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  if (crore > 0) result += convertHundreds(crore) + "কোটি ";
  if (lakh > 0) result += convertHundreds(lakh) + "লক্ষ ";
  if (thousand > 0) result += convertHundreds(thousand) + "হাজার ";
  if (remainder > 0) result += convertHundreds(remainder);

  return result.trim() + " টাকা মাত্র";
};


  const handleCheckBox = (tripId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }))
  }

  // Fixed calculation functions
  const calculateTotals = (trips) => {
    const totalRent = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)
    const totalDemurrage = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.d_total) || 0), 0)
    const grandTotal = totalRent + totalDemurrage
    return { totalRent, totalDemurrage, grandTotal }
  }

  // Date filter
  const filteredTrips = yamaha.filter((trip) => {
    const tripDate = new Date(trip.date).setHours(0, 0, 0, 0)
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null
    const matchDate =
      start && end ? tripDate >= start && tripDate <= end : start ? tripDate === start : end ? tripDate === end : true

    const matchCustomer =
      !selectedCustomer || (trip.customer ?? "").toLowerCase().includes(selectedCustomer.toLowerCase())

    return matchDate && matchCustomer
  })

  // Get selected data based on selectedRows for total calculation
  const selectedTripsForCalculation = filteredTrips.filter((trip) => selectedRows[trip.id])
  const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : filteredTrips
  const { totalRent, totalDemurrage, grandTotal } = calculateTotals(tripsToCalculate)

  const handlePrint = () => {
  const selectedData = yamaha.filter((trip) => selectedRows[trip.id])
  if (!selectedData.length) {
    return toast.error("Please select at least one row.")
  }
// Get customer name from first selected trip
    const customerName = selectedData[0]?.customer || "Customer Name"
  const {
    totalRent: printTotalRent,
    grandTotal: printGrandTotal,
  } = calculateTotals(selectedData)

  const totalInWords = numberToBanglaWords(printGrandTotal)

  const newWindow = window.open("", "_blank")
  const html = `
    <html>
      <head>
      <title>.</title>
        <style>
        @page { margin: 0; }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 4px; text-align: center; }
          th { background: #f0f0f0; }
          tfoot td { font-weight: bold; }
          .bill-no {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body style="margin:0.5in;">
        <div class="to-section" style="margin-top:2.5in;">
         <div>
              <div class="bill-no">
              <div><strong>তারিখ: ${new Date().toLocaleDateString("bn-BD")}</strong></div>
              <div style="margin-right: 2in"><strong>বিল নং:</strong></div>
              </div>
            </div>
              <div>বরাবর</div>
              <div><strong>${customerName}</strong></div>
              <div><strong>বিষয়:</strong></div>
            </div>
           
          </div>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>তারিখ</th>
              <th>গাড়ি নং</th>
              <th>চালান নং</th>
              <th>সি এফ টি</th>
              <th>দর</th>
              <th>বিলের টাকা</th>
            </tr>
          </thead>
          <tbody>
            ${selectedData.map((dt, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${tableFormatDate(dt.date)}</td>
                <td>${dt.vehicle_no}</td>
                <td>${dt.challan_no}</td>
                <td>${dt.total_rent}</td>
                <td>15</td>
                <td>${(Number.parseFloat(dt.total_rent) || 0) * 15}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">মোট</td>
              <td>${printTotalRent}</td>
              <td>15</td>
              <td>${printGrandTotal}</td>
            </tr>
          </tfoot>
        </table>
        <p><strong>মোট পরিমাণ কথায়:</strong> ${totalInWords}</p>
      </body>
    </html>
  `
  newWindow.document.write(html)
  newWindow.document.close()
  newWindow.focus()
  newWindow.print()
}


  const handleSubmit = async () => {
    const selectedData = filteredTrips.filter(
      (dt, i) => selectedRows[dt.id] && dt.status === "Pending"
    );
    if (!selectedData.length) {
      return toast.error("Please select at least one row for Not submitted.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...")

      // Create array of promises for all updates
      const updatePromises = selectedData.map((dt) =>
        fetch(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bill_date: new Date().toISOString().split("T")[0],
            customer_name: dt.customer,
            vehicle_no: dt.vehicle_no,
            chalan: dt.challan,
            load_point: dt.load_point,
            unload_point: dt.unload_point,
            qty: dt.quantity,
            body_cost: dt.body_fare,
            fuel_cost: dt.fuel_cost,
            driver_name: dt.driver_name,
            bill_amount: dt.total_rent,
          }),
        }).then(() =>
          fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Approved",
              customer: dt.customer,
              date: dt.date,
              load_point: dt.load_point,
              unload_point: dt.unload_point,
              transport_type: dt.transport_type,
              vehicle_no: dt.vehicle_no,
              total_rent: dt.total_rent,
              quantity: dt.quantity,
              dealer_name: dt.dealer_name,
              driver_name: dt.driver_name,
              fuel_cost: dt.fuel_cost,
              do_si: dt.do_si,
              driver_mobile: dt.driver_mobile,
              challan: dt.challan,
              sti: dt.sti,
              model_no: dt.model_no,
              co_u: dt.co_u,
              masking: dt.masking,
              unload_charge: dt.unload_charge,
              extra_fare: dt.extra_fare,
              vehicle_rent: dt.vehicle_rent,
              goods: dt.goods,
              distribution_name: dt.distribution_name,
              remarks: dt.remarks,
              no_of_trip: dt.no_of_trip,
              vehicle_mode: dt.vehicle_mode,
              per_truck_rent: dt.per_truck_rent,
              vat: dt.vat,
              total_rent_cost: dt.total_rent_cost,
              driver_commission: dt.driver_commission,
              road_cost: dt.road_cost,
              food_cost: dt.food_cost,
              total_exp: dt.total_exp,
              trip_rent: dt.trip_rent,
              advance: dt.advance,
              due_amount: dt.due_amount,
              ref_id: dt.ref_id,
              body_fare: dt.body_fare,
              parking_cost: dt.parking_cost,
              night_guard: dt.night_guard,
              toll_cost: dt.toll_cost,
              feri_cost: dt.feri_cost,
              police_cost: dt.police_cost,
              driver_adv: dt.driver_adv,
              chada: dt.chada,
              labor: dt.labor,
              additional_load: dt.additional_load,
              trip_type: dt.trip_type,
              additional_cost: dt.additional_cost,
            }),
          }),
        ),
      )

      // Wait for all updates to complete
      await Promise.all(updatePromises)

      // Update local state immediately
      setYamaha((prev) =>
        prev.map((trip) => (selectedData.some((dt) => dt.id === trip.id) ? { ...trip, status: "Approved" } : trip)),
      )

      toast.success("Successfully submitted!", { id: loadingToast })
      setSelectedRows({})
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Submission failed. Check console for details.")
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTrips.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)
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
  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            বিলিং
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              পিডিএফ
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 my-5">
            <div className="flex-1 min-w-0">
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
            </div>
            <div className="flex-1 min-w-0">
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
            </div>
            <CreatableSelect
              isClearable
              placeholder="Select or create customer..."
              value={selectedCustomer ? { value: selectedCustomer, label: selectedCustomer } : null}
              options={customerOptions}
              onChange={(newValue) => {
                setSelectedCustomer(newValue ? newValue.value : "")
                setCurrentPage(1)
              }}
              onCreateOption={(inputValue) => {
                const newCustomer = { value: inputValue, label: inputValue }
                setCustomerList((prev) => [...prev, { customer_name: inputValue }])
                setSelectedCustomer(inputValue)
              }}
              className="text-sm"
            />
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setStartDate("")
                  setEndDate("")
                  setSelectedCustomer("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
               <th className="border border-gray-700 px-2 py-1">ক্রমিক</th>
                 <th className="border border-gray-700 px-2 py-1">তারিখ</th>
            
                 <th className="border border-gray-700 px-2 py-1">গাড়ি নং</th>
                 <th className="border border-gray-700 px-2 py-1">চালান নং</th>
                 <th className="border border-gray-700 px-2 py-1">সি এফ টি</th>
                 <th className="border border-gray-700 px-2 py-1">দর</th>
                 <th className="border border-gray-700 px-2 py-1">বিলের টাকা</th>
                 <th className="border border-gray-700 px-2 py-1">বিলের অবস্থা</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {currentItems.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">{index+1}.</td>
                  <td className="border border-gray-700 p-1">{tableFormatDate(dt.date)}</td>
                  <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
                  <td className="border border-gray-700 p-1">{dt.challan_no}</td>
                  <td className="border border-gray-700 p-1">{dt.total_rent}</td>
                  <td className="border border-gray-700 p-1">{15}</td>
              
                  <td className="border border-gray-700 p-1">
                    {(Number.parseFloat(dt.total_rent) || 0) * (Number.parseFloat(15) || 0)}
                  </td>
                
                  <td className="border border-gray-700 p-1 text-center ">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!selectedRows[dt.id]}
                        onChange={() => handleCheckBox(dt.id)}
                        disabled={false}
                      />
                      {dt.status === "Pending" && (
                        <span className=" inline-block px-2  text-xs text-yellow-600 rounded">
                          Not Submitted
                        </span>
                      )}
                      {dt.status === "Approved" && (
                        <span className=" inline-block px-2  text-xs text-green-700 rounded">
                          Submitted
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={2} className="border border-black px-2 py-1 text-right">
                  মোট
                </td>
                <td className="border border-black px-2 py-1">{"totalVehicle"}</td>
                <td className="border border-black px-2 py-1"></td>
           
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1">{15}</td>
                <td className="border border-black px-2 py-1">{grandTotal}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={11} className="border border-black px-2 py-1">
                  মোট পরিমাণ কথায়: <span className="font-medium">{numberToBanglaWords(grandTotal)}</span>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* pagination */}
          {filteredTrips.length > 0 && totalPages >= 1 && (
            <div className="mt-10 flex justify-center">
              <div className="space-x-2 flex items-center">
                <button
                  onClick={handlePrevPage}
                  className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                    } rounded-sm`}
                  disabled={currentPage === 1}
                >
                  <GrFormPrevious />
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageClick(number + 1)}
                    className={`px-3 py-1 rounded-sm ${currentPage === number + 1
                      ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                      : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                      }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`p-2 ${currentPage === totalPages
                    ? "bg-gray-300"
                    : "bg-primary text-white"
                    } rounded-sm`}
                  disabled={currentPage === totalPages}
                >
                  <GrFormNext />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleSubmit}
            >
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bill;

