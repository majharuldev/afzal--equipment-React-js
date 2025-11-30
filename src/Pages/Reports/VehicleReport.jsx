// import { useState, useEffect, useMemo } from "react"
// import { FiFilter } from "react-icons/fi"
// import * as XLSX from "xlsx"
// import jsPDF from "jspdf"
// import "jspdf-autotable"
// import autoTable from "jspdf-autotable"
// import DatePicker from "react-datepicker"
// import { tableFormatDate } from "../../components/Shared/formatDate"
// import { isSameDay } from "date-fns"
// import { Table } from "antd"

// export default function VehicleProfitReport() {
//   const [tripData, setTripData] = useState([])
//   const [purchaseData, setPurchaseData] = useState([])
//   const [stockOutData, setStockOutData] = useState([])
//   const [profitData, setProfitData] = useState([])
//   const [selectedDate, setSelectedDate] = useState("")
//   const [fromDate, setFromDate] = useState("")
//   const [toDate, setToDate] = useState("")
//   const [selectedVehicle, setSelectedVehicle] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [showFilter, setShowFilter] = useState(false)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(10)

//   const fetchData = async () => {
//     setLoading(true)
//     try {
//       const tripResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
//       const tripResult = await tripResponse.json()

//       const purchaseResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
//       const purchaseResult = await purchaseResponse.json()

//       const stockOutResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/list`)
//       const stockOutResult = await stockOutResponse.json()

//       if (tripResult.status === "Success") setTripData(tripResult.data)
//       if (purchaseResult.status === "Success") setPurchaseData(purchaseResult.data)
//       if (stockOutResult.status === "Success") setStockOutData(stockOutResult.data)
//     } catch (error) {
//       console.error("ডাটা আনতে সমস্যা:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateProfitByVehicle = () => {
//     const normalizeVehicleNo = (no) =>
//       no?.replace(/\s+/g, " ")?.replace(/-+/g, "-")?.trim()

//     const vehicleDateMap = new Map()

//     // ট্রিপ ডাটা প্রসেস করা
//     tripData
//       .filter((trip) => {
//         let dateMatch = true
//         const tripDate = new Date(trip.date)
//         if (fromDate && toDate) dateMatch = tripDate >= fromDate && tripDate <= toDate
//         else if (fromDate) dateMatch = isSameDay(tripDate, fromDate)
//         const vehicleMatch = selectedVehicle === "" || trip.vehicle_no === selectedVehicle
//         return dateMatch && vehicleMatch && trip.vehicle_no
//       })
//       .forEach((trip) => {
//         const key = `${normalizeVehicleNo(trip.vehicle_no)}-${trip.date}`
//         if (!vehicleDateMap.has(key)) {
//           vehicleDateMap.set(key, {
//             vehicle_no: trip.vehicle_no,
//             date: trip.date,
//             total_revenue: 0,
//             trip_expenses: 0,
//             parts_cost: 0,
//             fuel_cost: 0,
//             engine_oil_cost: 0,
//             net_profit: 0,
//             trip_count: 0,
//           })
//         }
//         const vehicleDate = vehicleDateMap.get(key)
//         vehicleDate.total_revenue += Number.parseFloat(trip.total_rent) || 0
//         vehicleDate.trip_expenses += Number.parseFloat(trip.total_exp || "0")
//         vehicleDate.trip_count += 1
//       })

//     // পারচেজ ডাটা প্রসেস করা
//     purchaseData
//       .filter((purchase) => {
//         let dateMatch = true
//         const purchaseDate = new Date(purchase.date)
//         if (fromDate && toDate) dateMatch = purchaseDate >= fromDate && purchaseDate <= toDate
//         else if (fromDate) dateMatch = isSameDay(purchaseDate, fromDate)
//         const vehicleMatch = selectedVehicle === "" || purchase.vehicle_no === selectedVehicle
//         return dateMatch && vehicleMatch && purchase.vehicle_no
//       })
//       .forEach((purchase) => {
//         const key = `${normalizeVehicleNo(purchase.vehicle_no)}-${purchase.date}`
//         if (!vehicleDateMap.has(key)) {
//           vehicleDateMap.set(key, {
//             vehicle_no: purchase.vehicle_no,
//             date: purchase.date,
//             total_revenue: 0,
//             trip_expenses: 0,
//             parts_cost: 0,
//             fuel_cost: 0,
//             engine_oil_cost: 0,
//             net_profit: 0,
//             trip_count: 0,
//           })
//         }
//         const vehicleDate = vehicleDateMap.get(key)
//         const purchaseAmount =
//           Number.parseFloat(purchase.purchase_amount || "0") ||
//           Number.parseFloat(purchase.quantity) * Number.parseFloat(purchase.unit_price)

//         if (purchase.category === "fuel") vehicleDate.fuel_cost += purchaseAmount
//         else if (purchase.category === "parts") vehicleDate.parts_cost += purchaseAmount
//         else if (purchase.category === "engine_oil") vehicleDate.engine_oil_cost += purchaseAmount
//       })

//     // স্টক আউট ডাটা প্রসেস করা (Engine Oil)
//     stockOutData
//       .filter((stock) => {
//         let dateMatch = true
//         const stockDate = new Date(stock.date)
//         if (fromDate && toDate) dateMatch = stockDate >= fromDate && stockDate <= toDate
//         else if (fromDate) dateMatch = isSameDay(stockDate, fromDate)
//         const vehicleMatch = selectedVehicle === "" || stock.vehicle_name === selectedVehicle
//         const isEngineOil = stock.product_category === "engine_oil"
//         return dateMatch && vehicleMatch && stock.vehicle_name && isEngineOil
//       })
//       .forEach((stock) => {
//         const key = `${normalizeVehicleNo(stock.vehicle_name)}-${stock.date}`
//         if (!vehicleDateMap.has(key)) {
//           vehicleDateMap.set(key, {
//             vehicle_no: stock.vehicle_name,
//             date: stock.date,
//             total_revenue: 0,
//             trip_expenses: 0,
//             parts_cost: 0,
//             fuel_cost: 0,
//             engine_oil_cost: 0,
//             net_profit: 0,
//             trip_count: 0,
//           })
//         }
//         const vehicleDate = vehicleDateMap.get(key)
//         vehicleDate.engine_oil_cost += Number.parseFloat(stock.stock_out || "0") * 300
//       })

//     // নেট প্রফিট ক্যালকুলেশন
//     const profitArray = Array.from(vehicleDateMap.values()).map((vehicleDate) => {
//       const totalExpenses =
//         vehicleDate.trip_expenses +
//         vehicleDate.parts_cost +
//         vehicleDate.fuel_cost +
//         vehicleDate.engine_oil_cost
//       return { ...vehicleDate, net_profit: vehicleDate.total_revenue - totalExpenses }
//     })

//     setProfitData(
//       profitArray.sort(
//         (a, b) => new Date(b.date) - new Date(a.date) || b.net_profit - a.net_profit
//       )
//     )
//   }

//   useEffect(() => { fetchData() }, [])
//   useEffect(() => { calculateProfitByVehicle() }, [tripData, purchaseData, stockOutData, selectedDate, fromDate, toDate, selectedVehicle])

//   const getUniqueVehicles = () => {
//     const vehicles = new Set()
//     tripData.forEach((t) => t.vehicle_no && vehicles.add(t.vehicle_no))
//     purchaseData.forEach((p) => p.vehicle_no && vehicles.add(p.vehicle_no))
//     stockOutData.forEach((s) => s.vehicle_name && vehicles.add(s.vehicle_name))
//     return Array.from(vehicles).sort()
//   }

//   const clearAllFilters = () => {
//     setSelectedDate("")
//     setFromDate("")
//     setToDate("")
//     setSelectedVehicle("")
//     setShowFilter(false)
//     setCurrentPage(1)
//   }

//   const totalTrip = profitData.reduce((sum, v) => sum + v.trip_count, 0)
//   const totalTripCost = profitData.reduce((sum, v) => sum + v.trip_expenses, 0)
//   const totalPartsCost = profitData.reduce((sum, v) => sum + v.parts_cost, 0)
//   const totalFuelCost = profitData.reduce((sum, v) => sum + v.fuel_cost, 0)
//   const totalEngineOil = profitData.reduce((sum, v) => sum + v.engine_oil_cost, 0)
//   const totalProfit = profitData.reduce((sum, v) => sum + v.net_profit, 0)
//   const totalRevenue = profitData.reduce((sum, v) => sum + v.total_revenue, 0)

//   const totalPages = Math.ceil(profitData.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const currentData = profitData.slice(startIndex, endIndex)

//   // ------------------- Export functions -------------------
//   const exportToExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(
//       profitData.map((d) => ({
//         "তারিখ": d.date,
//         "গাড়ির নাম্বার": d.vehicle_no,
//         "ট্রিপ সংখ্যা": d.trip_count,
//         "ভাড়া": d.total_revenue,
//         "ট্রিপ খরচ": d.trip_expenses,
//         "পার্টস খরচ": d.parts_cost,
//         "ফুয়েল খরচ": d.fuel_cost,
//         "ইঞ্জিন অয়েল খরচ": d.engine_oil_cost,
//         "নেট প্রফিট": d.net_profit,
//       }))
//     )
//     const workbook = XLSX.utils.book_new()
//     XLSX.utils.book_append_sheet(workbook, worksheet, "গাড়ির প্রফিট রিপোর্ট")
//     XLSX.writeFile(workbook, "vehicle_profit_report.xlsx")
//   }

//   const exportToPDF = () => {
//     try {
//       const doc = new jsPDF()
//       doc.setFontSize(16)
//       doc.text("গাড়ির প্রফিট রিপোর্ট", 14, 15)
//       doc.setFontSize(10)
//       doc.text(`প্রস্তুতকৃত: ${new Date().toLocaleDateString()}`, 14, 22)

//       const tableColumn = [
//         "তারিখ",
//         "গাড়ির নাম্বার",
//         "ট্রিপ সংখ্যা",
//         "ভাড়া",
//         "ট্রিপ খরচ",
//         "পার্টস খরচ",
//         "ফুয়েল খরচ",
//         "ইঞ্জিন অয়েল খরচ",
//         "নেট প্রফিট",
//       ]
//       const tableRows = profitData.map((d) => [
//         d.date,
//         d.vehicle_no,
//         d.trip_count,
//         `${d.total_revenue.toLocaleString()}`,
//         `${d.trip_expenses.toLocaleString()}`,
//         `${d.parts_cost.toLocaleString()}`,
//         `${d.fuel_cost.toLocaleString()}`,
//         `${d.engine_oil_cost.toLocaleString()}`,
//         `${d.net_profit.toLocaleString()}`,
//       ])
//       autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, styles: { fontSize: 9 }, headStyles: { fillColor: [17, 55, 91] } })
//       doc.save("vehicle_profit_report.pdf")
//     } catch (error) {
//       console.error("PDF তৈরিতে সমস্যা:", error)
//       alert("PDF ডাউনলোডে সমস্যা হচ্ছে। আবার চেষ্টা করুন।")
//     }
//   }

//   const printTable = () => {
//     const allRows = profitData.map((d) => `
//       <tr>
//         <td>${d.date}</td>
//         <td>${d.vehicle_no}</td>
//         <td>${d.trip_count}</td>
//         <td>${d.total_revenue.toLocaleString()}</td>
//         <td>${d.trip_expenses.toLocaleString()}</td>
//         <td>${d.parts_cost.toLocaleString()}</td>
//         <td>${d.fuel_cost.toLocaleString()}</td>
//         <td>${d.engine_oil_cost.toLocaleString()}</td>
//         <td>${d.net_profit.toLocaleString()}</td>
//       </tr>
//     `).join("")
//     const totalRow = `
//       <tr style="font-weight:bold; background-color:#f0f0f0;">
//         <td colspan="2" style="text-align:right;">মোট:</td>
//         <td>${totalTrip}</td>
//         <td>${totalRevenue.toLocaleString()}</td>
//         <td>${totalTripCost.toLocaleString()}</td>
//         <td>${totalPartsCost.toLocaleString()}</td>
//         <td>${totalFuelCost.toLocaleString()}</td>
//         <td>${totalEngineOil.toLocaleString()}</td>
//         <td>${totalProfit.toLocaleString()}</td>
//       </tr>
//     `
//     const WinPrint = window.open("", "", "width=900,height=650")
//     WinPrint.document.write(`
//       <html>
//         <head>
//           <title>গাড়ির প্রফিট রিপোর্ট</title>
//           <style>
//             table { width: 100%; border-collapse: collapse; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #11375B; color: white; }
//             tr:nth-child(even) { background-color: #f2f2f2; }
//           </style>
//         </head>
//         <body>
//           <h1>গাড়ির প্রফিট রিপোর্ট</h1>
//           <p>প্রস্তুতকৃত: ${new Date().toLocaleDateString()}</p>
//           <table>
//             <thead>
//               <tr>
//                 <th>তারিখ</th>
//                 <th>গাড়ির নাম্বার</th>
//                 <th>ট্রিপ সংখ্যা</th>
//                 <th>ভাড়া</th>
//                 <th>ট্রিপ খরচ</th>
//                 <th>পার্টস খরচ</th>
//                 <th>ফুয়েল খরচ</th>
//                 <th>ইঞ্জিন অয়েল খরচ</th>
//                 <th>নেট প্রফিট</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${allRows}
//             </tbody>
//             <tfoot>
//               ${totalRow}
//             </tfoot>
//           </table>
//         </body>
//       </html>
//     `)
//     WinPrint.document.close()
//     WinPrint.focus()
//     WinPrint.print()
//     WinPrint.close()
//   }

//   const columns = useMemo(() => [
//     { title: "তারিখ", dataIndex: "date", key: "date", render: (text) => tableFormatDate(text) },
//     { title: "ইকুইপমেন্ট/গাড়ি", dataIndex: "vehicle_no", key: "vehicle_no", render: (text) => <b>{text}</b> },
//     { title: "ট্রিপ সংখ্যা", dataIndex: "trip_count", key: "trip_count" },
//     { title: "ভাড়া", dataIndex: "total_revenue", key: "total_revenue", render: (value) => value.toLocaleString() },
//     { title: "ট্রিপ খরচ", dataIndex: "trip_expenses", key: "trip_expenses", render: (value) => value.toLocaleString() },
//     { title: "পার্টস খরচ", dataIndex: "parts_cost", key: "parts_cost", render: (value) => value.toLocaleString() },
//     { title: "ফুয়েল খরচ", dataIndex: "fuel_cost", key: "fuel_cost", render: (value) => value.toLocaleString() },
//     { title: "ইঞ্জিন অয়েল খরচ", dataIndex: "engine_oil_cost", key: "engine_oil_cost", render: (value) => value.toLocaleString() },
//     { title: "নেট প্রফিট", dataIndex: "net_profit", key: "net_profit", render: (value) => <span style={{ color: value >= 0 ? "green" : "red", fontWeight: "bold" }}>{value.toLocaleString()}</span> },
//   ], []);

//   return (
//     <main className="md:p-2">
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             গাড়ির পারফরমেন্স রিপোর্ট
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <button
//               onClick={() => setShowFilter((prev) => !prev)}
//               className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//             >
//               <FiFilter /> ফিল্টার
//             </button>
//           </div>
//         </div>

//         <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md mb-5">
//           <button onClick={exportToExcel} className="py-2 px-5 hover:bg-primary bg-white shadow-md shadow-orange-100 hover:text-primary rounded-md transition-all duration-300 cursor-pointer">এক্সেল</button>
//           <button onClick={exportToPDF} className="py-2 px-5 hover:bg-primary bg-white shadow-md shadow-blue-100 hover:text-primary rounded-md transition-all duration-300 cursor-pointer">পিডিএফ</button>
//           <button onClick={printTable} className="py-2 px-5 hover:bg-primary bg-white shadow-md shadow-cyan-100 hover:text-primary rounded-md transition-all duration-300 cursor-pointer">প্রিন্ট</button>
//         </div>

//         {showFilter && (
//           <div className="border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
//             <div className="flex flex-col md:flex-row gap-4 mb-4">
//               <div className="flex-1 min-w-0">
//                 <DatePicker
//                   selected={fromDate}
//                   onChange={(date) => setFromDate(date)}
//                   selectsStart
//                   startDate={fromDate}
//                   endDate={toDate}
//                   dateFormat="dd/MM/yyyy"
//                   placeholderText="শুরুর তারিখ"
//                   locale="en-GB"
//                   className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                   isClearable
//                 />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <DatePicker
//                   selected={toDate}
//                   onChange={(date) => setToDate(date)}
//                   selectsEnd
//                   startDate={fromDate}
//                   endDate={toDate}
//                   minDate={fromDate}
//                   dateFormat="dd/MM/yyyy"
//                   placeholderText="শেষ তারিখ"
//                   locale="en-GB"
//                   className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
//                   isClearable
//                 />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <select
//                   value={selectedVehicle}
//                   onChange={(e) => setSelectedVehicle(e.target.value)}
//                   className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
//                 >
//                   <option value="">সব গাড়ি</option>
//                   {getUniqueVehicles().map((vehicle) => (
//                     <option key={vehicle} value={vehicle}>{vehicle}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <div className=" flex gap-2">
//                   <button
//                     onClick={clearAllFilters}
//                     className="bg-primary text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
//                   >
//                     <FiFilter /> ক্লিয়ার
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

       
//       <Table
//         columns={columns}
//         dataSource={profitData}
//         rowKey={(record) => `${record.vehicle_no}-${record.date}`}
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//         summary={() => (
//           <Table.Summary.Row>
//             <Table.Summary.Cell index={0} colSpan={2} align="right">মোট:</Table.Summary.Cell>
//             <Table.Summary.Cell index={2}>{profitData.reduce((sum, v) => sum + v.trip_count, 0)}</Table.Summary.Cell>
//             <Table.Summary.Cell index={3}>{profitData.reduce((sum, v) => sum + v.total_revenue, 0).toLocaleString()}</Table.Summary.Cell>
//             <Table.Summary.Cell index={4}>{profitData.reduce((sum, v) => sum + v.trip_expenses, 0).toLocaleString()}</Table.Summary.Cell>
//             <Table.Summary.Cell index={5}>{profitData.reduce((sum, v) => sum + v.parts_cost, 0).toLocaleString()}</Table.Summary.Cell>
//             <Table.Summary.Cell index={6}>{profitData.reduce((sum, v) => sum + v.fuel_cost, 0).toLocaleString()}</Table.Summary.Cell>
//             <Table.Summary.Cell index={7}>{profitData.reduce((sum, v) => sum + v.engine_oil_cost, 0).toLocaleString()}</Table.Summary.Cell>
//             <Table.Summary.Cell index={8}>
//               <b style={{ color: profitData.reduce((sum, v) => sum + v.net_profit, 0) >= 0 ? "green" : "red" }}>
//                 {profitData.reduce((sum, v) => sum + v.net_profit, 0).toLocaleString()}
//               </b>
//             </Table.Summary.Cell>
//           </Table.Summary.Row>
//         )}
//       />
//       </div>
//     </main>
//   )
// }


import { useState, useEffect } from "react"
import { FiFilter } from "react-icons/fi"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import autoTable from "jspdf-autotable"
import Pagination from "../../components/Shared/Pagination"
import DatePicker from "react-datepicker"

import api from "../../utils/axiosConfig"
import { tableFormatDate } from "../../components/Shared/formatDate"
import { toNumber } from "../../hooks/toNumber"

export default function VehicleProfitReport() {
  const [tripData, setTripData] = useState([])
  const [purchaseData, setPurchaseData] = useState([])
  const [stockOutData, setStockOutData] = useState([])
  const [profitData, setProfitData] = useState([])
  const [selectedDate, setSelectedDate] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchData = async () => {
    setLoading(true)
    try {
      const tripResponse = await api.get(`/trip`)
      const tripResult = tripResponse.data

      const purchaseResponse = await api.get(`/purchase`)
      const purchaseResult = purchaseResponse.data

      // const stockOutResponse = await api.get(`/stockOutProduct`)
      // const stockOutResult =  stockOutResponse.data

      // শুধু Approved trip নাও
      // const approvedTrips = tripResult.filter(
      //   (trip) => trip.status === "Approved"
      // )
      setTripData(tripResult)

      // if (purchaseResult.status === "Success") {
        setPurchaseData(purchaseResult.data)
      // }

      // if (stockOutResult.status === "Success") {
      //   setStockOutData(stockOutResult.data)
      // }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateProfitByVehicle = () => {

    const normalizeVehicleNo = (no) => {
      return no?.replace(/\s+/g, " ")
        ?.replace(/-+/g, "-")
        ?.trim()
    }
    // date normalization function
// const normalizeDate = (dateStr) => {
//   if (!dateStr) return null;
//   const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
//   return new Date(year, month - 1, day); // month is 0-indexed
// };
const normalizeDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};
    const vehicleDateMap = new Map()

    // Process trip data
    tripData
  .filter((trip) => {
    let dateMatch = true;

      const tripDate = normalizeDate(trip.date);
    const from = fromDate ? new Date(fromDate.setHours(0,0,0,0)) : null;
    const to = toDate ? new Date(toDate.setHours(0,0,0,0)) : null;

    if (from && to) {
      dateMatch = tripDate >= from && tripDate <= to;
    } 
    else if (from) {
      dateMatch = tripDate.getTime() === from.getTime();
    }

    const vehicleMatch =
      selectedVehicle === "" || trip.vehicle_no === selectedVehicle;

    return dateMatch && vehicleMatch && trip.vehicle_no;
  })
      .forEach((trip) => {
        // const key = `${trip.vehicle_no}-${trip.date}`
        const key = `${normalizeVehicleNo(trip.vehicle_no)}-${normalizeDate(trip.date)}`

        if (!vehicleDateMap.has(key)) {
          vehicleDateMap.set(key, {
            vehicle_no: trip.vehicle_no,
            date: normalizeDate(trip.date),
            total_revenue: 0,
            trip_expenses: 0,
            parts_cost: 0,
            fuel_cost: 0,
            engine_oil_cost: 0,
            net_profit: 0,
            trip_count: 0,
          })
        }

        const vehicleDate = vehicleDateMap.get(key)
        vehicleDate.total_revenue += Number.parseFloat(trip.total_rent) || 0
        vehicleDate.trip_expenses += Number.parseFloat(trip.total_exp || "0")
        vehicleDate.trip_count += 1
      })

    // Process purchase data
    // purchaseData
    //   .filter((purchase) => {
    //     let dateMatch = true
    //     if (fromDate && toDate) {
    //       dateMatch = purchase.date >= fromDate && purchase.date <= toDate
    //     } else if (fromDate) {
    //       dateMatch = purchase.date === fromDate  // শুধু একদিন
    //     } else {
    //       dateMatch = true
    //     }
    //     const vehicleMatch = selectedVehicle === "" || purchase.vehicle_no === selectedVehicle

    //     return dateMatch && vehicleMatch && purchase.vehicle_no
    //   })
    purchaseData
  .filter((purchase) => {
    let dateMatch = true;

    const purchaseDate = purchase.date ? purchase.date.split("T")[0] : "";
    const from = fromDate ? fromDate.toISOString().split("T")[0] : "";
    const to = toDate ? toDate.toISOString().split("T")[0] : "";

    if (from && to) {
      dateMatch = purchaseDate >= from && purchaseDate <= to;
    } else if (from) {
      dateMatch = purchaseDate === from;
    } else {
      dateMatch = true;
    }

    const vehicleMatch =
      selectedVehicle === "" || purchase.vehicle_no === selectedVehicle;

    return dateMatch && vehicleMatch && purchase.vehicle_no;
  })

      .forEach((purchase) => {
        // const key = `${purchase.vehicle_no}-${purchase.date}`
        const key = `${normalizeVehicleNo(purchase.vehicle_no)}-${purchase.date}`


        if (!vehicleDateMap.has(key)) {
          vehicleDateMap.set(key, {
            vehicle_no: purchase.vehicle_no,
            date: purchase.date,
            total_revenue: 0,
            trip_expenses: 0,
            parts_cost: 0,
            fuel_cost: 0,
            engine_oil_cost: 0,
            net_profit: 0,
            trip_count: 0,
          })
        }

        const vehicleDate = vehicleDateMap.get(key)
        const purchaseAmount =
          Number.parseFloat(purchase.purchase_amount || "0") ||
          Number.parseFloat(purchase.quantity) * Number.parseFloat(purchase.unit_price)

        // if (purchase.category === "fuel") {
        //   vehicleDate.fuel_cost += purchaseAmount
        // } else
        
          if (purchase.category === "parts") {
          vehicleDate.parts_cost += purchaseAmount
        } else if (purchase.category === "engine_oil") {
          vehicleDate.engine_oil_cost += purchaseAmount
        }
      })

    // Process stock out data for engine oil
    // stockOutData
    //   .filter((stock) => {
    //     let dateMatch = true
    //     // if (selectedDate) {
    //     //   dateMatch = stock.date === selectedDate
    //     // } else if (fromDate && toDate) {
    //     //   dateMatch = stock.date >= fromDate && stock.date <= toDate
    //     // } else if (fromDate) {
    //     //   dateMatch = stock.date >= fromDate
    //     // } else if (toDate) {
    //     //   dateMatch = stock.date <= toDate
    //     // }
    //     if (fromDate && toDate) {
    //       dateMatch = stock.date >= fromDate && stock.date <= toDate
    //     } else if (fromDate) {
    //       dateMatch = stock.date === fromDate  // শুধু একদিন
    //     } else {
    //       dateMatch = true
    //     }

    //     const vehicleMatch = selectedVehicle === "" || stock.vehicle_name === selectedVehicle
    //     const isEngineOil = stock.product_category === "engine_oil"

    //     return dateMatch && vehicleMatch && stock.vehicle_name && isEngineOil
    //   })
    //   .forEach((stock) => {
    //     // const key = `${stock.vehicle_name}-${stock.date}`
    //     const key = `${normalizeVehicleNo(stock.vehicle_name)}-${stock.date}`

    //     if (!vehicleDateMap.has(key)) {
    //       vehicleDateMap.set(key, {
    //         vehicle_no: stock.vehicle_name,
    //         date: stock.date,
    //         total_revenue: 0,
    //         trip_expenses: 0,
    //         parts_cost: 0,
    //         fuel_cost: 0,
    //         engine_oil_cost: 0,
    //         net_profit: 0,
    //         trip_count: 0,
    //       })
    //     }

    //     const vehicleDate = vehicleDateMap.get(key)
    //     // Calculate engine oil cost from stock out
    //     const stockOutAmount = Number.parseFloat(stock.stock_out || "0")
    //     // You might need to adjust this calculation based on your actual data structure
    //     vehicleDate.engine_oil_cost += stockOutAmount * 300 // Assuming average engine oil price
    //   })

    // Calculate net profit for each vehicle-date combination
    const profitArray = Array.from(vehicleDateMap.values()).map((vehicleDate) => {
      const totalExpenses = vehicleDate.trip_expenses + vehicleDate.parts_cost +
        vehicleDate.fuel_cost + vehicleDate.engine_oil_cost
      return {
        ...vehicleDate,
        net_profit: vehicleDate.total_revenue - totalExpenses
      }
    })

    setProfitData(profitArray.sort((a, b) => new Date(b.date) - new Date(a.date) || b.net_profit - a.net_profit))
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    calculateProfitByVehicle()
  }, [tripData, purchaseData, stockOutData, selectedDate, fromDate, toDate, selectedVehicle])

  const getUniqueVehicles = () => {
    const vehicles = new Set()
    tripData.forEach((trip) => trip.vehicle_no && vehicles.add(trip.vehicle_no))
    purchaseData.forEach((purchase) => purchase.vehicle_no && vehicles.add(purchase.vehicle_no))
    // stockOutData.forEach((stock) => stock.vehicle_name && vehicles.add(stock.vehicle_name))
    return Array.from(vehicles).sort()
  }

  const clearAllFilters = () => {
    setSelectedDate("")
    setFromDate("")
    setToDate("")
    setSelectedVehicle("")
    setShowFilter(false)
    setCurrentPage(1)
  }
console.log(profitData, "prof")
  useEffect(() => {
    calculateProfitByVehicle()
    setCurrentPage(1)
  }, [tripData, purchaseData, stockOutData, selectedDate, fromDate, toDate, selectedVehicle])

  // চাইলে আলাদা আলাদা বের করতে পারেন
  const totalTrip = profitData.reduce((sum, v) => sum + v.trip_count, 0)
  const totalTripCost = profitData.reduce((sum, v) => sum + v.trip_expenses, 0)
  const totalPartsCost = profitData.reduce((sum, v) => sum + v.parts_cost, 0)
  const totalFuelCost = profitData.reduce((sum, v) => sum + v.fuel_cost, 0)
  const totalEngineOil = profitData.reduce((sum, v) => sum + v.engine_oil_cost, 0)

  const totalPages = Math.ceil(profitData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = profitData.slice(startIndex, endIndex)

  const totalProfit = profitData.reduce((sum, vehicle) => sum + vehicle.net_profit, 0)
  const totalRevenue = profitData.reduce((sum, vehicle) => sum + vehicle.total_revenue, 0)
  const totalCosts = profitData.reduce((sum, vehicle) => sum + (vehicle.trip_expenses + vehicle.parts_cost + vehicle.fuel_cost + vehicle.engine_oil_cost), 0)

  //   // ------------------- Export Functions -------------------
  const exportToExcel = () => {
  const excelData = profitData.map((d) => ({
    Date: tableFormatDate(d.date),
    "Vehicle No": d.vehicle_no,
    Trips: d.trip_count,
    "Trip Rent": toNumber(d.total_revenue),
    "Trip Cost": toNumber(d.trip_expenses),
    "Parts Cost": toNumber(d.parts_cost),
    "Fuel Cost": toNumber(d.fuel_cost),
    "Engine Oil": toNumber(d.engine_oil_cost),
    "Gross Profit": toNumber(d.net_profit),
  }));

  //  Total Row যোগ করুন
  excelData.push({
    Date: "Total",
    "Vehicle No": "",
    Trips: totalTrip,
    "Trip Rent": toNumber(totalRevenue),
    "Trip Cost": toNumber(totalTripCost),
    "Parts Cost": toNumber(totalPartsCost),
    "Fuel Cost": toNumber(totalFuelCost),
    "Engine Oil": toNumber(totalEngineOil),
    "Gross Profit": toNumber(totalProfit),
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicle Profit");
  XLSX.writeFile(workbook, "vehicle_profit_report.xlsx");
};

  // pdf function
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()

      // Title
      doc.setFontSize(16)
      doc.text("Vehicle Profit Report", 14, 15)
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

      // Table Columns
      const tableColumn = [
        "Date",
        "Vehicle No",
        "Trips",
        "Trip Rent",
        "Trip Cost",
        "Parts Cost",
        "Fuel Cost",
        "Engine Oil",
        "Net Profit",
      ]

      // Table Rows
      const tableRows = profitData.map((d) => [
        d.date,
        d.vehicle_no,
        d.trip_count,
        `${d.total_revenue.toLocaleString()}`,
        `${d.trip_expenses.toLocaleString()}`,
        `${d.parts_cost.toLocaleString()}`,
        `${d.fuel_cost.toLocaleString()}`,
        `${d.engine_oil_cost.toLocaleString()}`,
        `${d.net_profit.toLocaleString()}`,
      ])

      // autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [17, 55, 91] }, // #11375B
      })

      doc.save("vehicle_profit_report.pdf")
    } catch (error) {
      console.error("PDF generation error:", error)
      alert("PDF ডাউনলোডে সমস্যা হচ্ছে। দয়া করে আবার চেষ্টা করুন।")
    }
  }

  // print function
  const printTable = () => {
    const allRows = profitData.map((d) => `
    <tr>
      <td>${tableFormatDate(d.date)}</td>
      <td>${d.vehicle_no}</td>
      <td>${d.trip_count}</td>
      <td>${d.total_revenue.toLocaleString()}</td>
      <td>${d.trip_expenses.toLocaleString()}</td>
      <td>${d.parts_cost.toLocaleString()}</td>
      <td>${d.fuel_cost.toLocaleString()}</td>
      <td>${d.engine_oil_cost.toLocaleString()}</td>
      <td>${d.net_profit.toLocaleString()}</td>
    </tr>
  `).join("")

    const totalRow = `
    <tr style="font-weight:bold; background-color:#f0f0f0;">
      <td colspan="2" style="text-align:right;">Total:</td>
      <td>${totalTrip}</td>
      <td>${totalRevenue.toLocaleString()}</td>
      <td>${totalTripCost.toLocaleString()}</td>
      <td>${totalPartsCost.toLocaleString()}</td>
      <td>${totalFuelCost.toLocaleString()}</td>
      <td>${totalEngineOil.toLocaleString()}</td>
      <td>${totalProfit.toLocaleString()}</td>
    </tr>
  `

    const WinPrint = window.open("", "", "width=900,height=650")
    WinPrint.document.write(`
    <html>
      <head>
        <title>Vehicle Profit Report</title>
        <style>
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #11375B; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
           thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h1>Vehicle Profit Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle No</th>
              <th>Trips</th>
              <th>Trip Rent</th>
              <th>Trip Cost</th>
              <th>Parts Cost</th>
              <th>Fuel Cost</th>
              <th>Engine Oil</th>
              <th>Gross Profit</th>
            </tr>
          </thead>
          <tbody>
            ${allRows}
          </tbody>
          <tfoot>
            ${totalRow}
          </tfoot>
        </table>
      </body>
    </html>
  `)
    WinPrint.document.close()
    WinPrint.focus()
    WinPrint.print()
    WinPrint.close()
  }


  return (
    <main className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header and filter section remains the same */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            ইকুইপমেন্ট/গাড়ির পারফরমেন্স রিপোর্ট
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FiFilter /> ফিল্টার
            </button>
            {/* <button
              onClick={fetchData}
              disabled={loading}
              className="bg-[#11375B] text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button> */}
          </div>
        </div>

        <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
          <button
            onClick={exportToExcel}
            className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
          >
            এক্সেল
          </button>
          {/* <button
            onClick={exportToPDF}
            className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
          >
            PDF
          </button> */}
          <button
            onClick={printTable}
            className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
          >
            প্রিন্ট
          </button>
        </div>

        {showFilter && (
          <div className="border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
             <div className="flex-1 min-w-0">
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  locale="en-GB"
                  className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                  isClearable
                />
              </div>

              <div className="flex-1 min-w-0">
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  locale="en-GB"
                  className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                  isClearable
                />
              </div>

              <div className="flex-1 min-w-0">
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle No</label> */}
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                >
                  <option value="">সব ইকুইপমেন্ট</option>
                  {getUniqueVehicles().map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className=" flex gap-2">
                  <button
                    onClick={clearAllFilters}
                    className="bg-primary text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <FiFilter />মুছে ফেলা
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div id="vehicleProfitTable" className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">ইকুইপমেন্ট নম্বর</th>
                <th className="px-4 py-3">ট্রিপ</th>
                <th className="px-4 py-3">ট্রিপ রেট</th>
                <th className="px-4 py-3">ট্রিপ খরচ</th>
                <th className="px-4 py-3">পার্টস খরচ</th>
                <th className="px-4 py-3">ফুয়েল খরচ</th>
                <th className="px-4 py-3">ইঞ্জিন অয়েল</th>
                <th className="px-4 py-3">মোট লাভ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500 italic">
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
                      No daily profit data found for the selected filters.
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((vehicleDate, index) => {
                  const margin =
                    vehicleDate.total_revenue > 0 ? (vehicleDate.net_profit / vehicleDate.total_revenue) * 100 : 0
                  return (
                    <tr
                      key={`${vehicleDate.vehicle_no}-${vehicleDate.date}-${index}`}
                      className="hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-4 font-medium text-[#11375B]">{tableFormatDate(vehicleDate.date)}</td>
                      <td className="px-4 py-4 font-bold">{vehicleDate.vehicle_no}</td>
                      <td className="px-4 py-4 text-gray-700">{vehicleDate.trip_count}</td>
                      <td className="px-4 py-4 text-gray-700 font-semibold">
                        {vehicleDate.total_revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {vehicleDate.trip_expenses.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {vehicleDate.parts_cost.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {vehicleDate.fuel_cost.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-gray-700">
                        {vehicleDate.engine_oil_cost.toLocaleString()}
                      </td>
                      <td className={`px-4 py-4 font-bold ${vehicleDate.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {vehicleDate.net_profit.toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {currentData.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="2" className="text-right px-4 py-3">Total:</td>
                  <td className="px-4 py-3">{totalTrip}</td>
                  <td className="px-4 py-3">{totalRevenue.toLocaleString()}</td>
                  <td className="px-4 py-3">{totalTripCost.toLocaleString()}</td>
                  <td className="px-4 py-3">{totalPartsCost.toLocaleString()}</td>
                  <td className="px-4 py-3">{totalFuelCost.toLocaleString()}</td>
                  <td className="px-4 py-3">{totalEngineOil.toLocaleString()}</td>
                  <td className={`px-4 py-3 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totalProfit.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {currentData.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
    </main>
  )
}
