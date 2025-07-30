

import { useEffect, useState } from "react"
import axios from "axios"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import { BiTrip } from "react-icons/bi"

const TripReport = () => {
  const [trips, setTrips] = useState([])
  // Date filter state
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showFilter, setShowFilter] = useState(false)
  const [loading, setLoading] = useState(true)
  // pagination
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          setTrips(res.data.data)
        }
        setLoading(false) 
      })
      .catch((err) => {console.error("Failed to fetch trips", err)
      setLoading(false)}
    )
  }, [])

  // Filter trips based on date range
  const filteredTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.date) // Assuming 'date' is the correct property for the trip date
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const matchDateRange = (!start || tripDate >= start) && (!end || tripDate <= end)

    return matchDateRange
  })

  const totalRent = filteredTrips.reduce((sum, t) => sum + Number(t.total_rent || 0), 0)
  const totalExpense = filteredTrips.reduce((sum, t) => sum + Number(t.total_exp || 0), 0)
  const totalProfit = totalRent - totalExpense

  const exportToExcel = () => {
    const data = filteredTrips.map((t, i) => ({
      SL: i + 1,
      Date: t.date,
      Vehicle: t.vehicle_no,
      Driver: t.driver_name,
      "Load Point": t.load_point,
      "Unload Point": t.unload_point,
      Rent: t.total_rent,
      Expense: t.total_exp,
      Profit: Number(t.total_rent) - Number(t.total_exp),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "TripReport")
    XLSX.writeFile(wb, "Trip_Report.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF("landscape")
    const tableColumn = ["SL", "Date", "Vehicle", "Driver", "Load Point", "Unload Point", "Rent", "Expense", "Profit"]
    const tableRows = filteredTrips.map((t, i) => [
      i + 1,
      t.date,
      t.vehicle_no,
      t.driver_name,
      t.load_point,
      t.unload_point,
      t.total_rent,
      t.total_exp,
      Number(t.total_rent) - Number(t.total_exp),
    ])
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
    })
    doc.save("Trip_Report.pdf")
  }

  const printReport = () => {
    const content = document.getElementById("trip-table").outerHTML
    const printWindow = window.open("", "", "width=900,height=650")
    printWindow.document.write(`
      <html><head><title>Trip Report</title>
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; }
        thead { background-color: #11375B; color: white; }
      </style>
      </head><body>
      <h3>Trip Report</h3>
      ${content}
      </body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // pagination
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTripsReport = filteredTrips.slice(indexOfFirstItem, indexOfLastItem) // Changed variable name for clarity
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)

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
          Loading Trip report...
        </div>
      </div>
    </div>

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2 ">
        <BiTrip className="text-lg" />
        Monthly Trip Report
      </h2>
      <div className="flex items-center justify-between my-5">
        <div className="flex flex-wrap md:flex-row gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
          >
            <FaFileExcel className="" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
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
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 justify-center items-center">
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
      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table id="trip-table" className="min-w-full text-sm text-left">
          <thead className="bg-[#11375B] text-white capitalize text-xs">
            <tr className="px-2 py-3">
              <th className="px-2 py-3">SL</th>
              <th className="px-2 py-3">Date</th>
              <th className="px-2 py-3">Vehicle</th>
              <th className="px-2 py-3">Driver</th>
              <th className="px-2 py-3">Load</th>
              <th className="px-2 py-3">Unload</th>
              <th className="px-2 py-3">Rent</th>
              <th className="px-2 py-3">Expense</th>
              <th className="px-2 py-3">Profit</th>
            </tr>
          </thead>
          <tbody>
            {currentTripsReport.length === 0 ? (
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
                    No Report data found.
                  </div>
                </td>
              </tr>
            ) : (
              currentTripsReport.map((t, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="px-2 py-3">{i + 1}</td>
                  <td className="px-2 py-3">{t.date}</td>
                  <td className="px-2 py-3">{t.vehicle_no}</td>
                  <td className="px-2 py-3">{t.driver_name}</td>
                  <td className="px-2 py-3">{t.load_point}</td>
                  <td className="px-2 py-3">{t.unload_point}</td>
                  <td className="px-2 py-3">{t.total_rent}</td>
                  <td className="px-2 py-3">{t.total_exp}</td>
                  <td className="px-2 py-3">{Number(t.total_rent) - Number(t.total_exp)}</td>
                </tr>
              ))
            )}
            <tr className="font-bold bg-gray-100">
              <td className="px-2 py-3" colSpan="6">
                Total
              </td>
              <td className="px-2 py-3">{totalRent}</td>
              <td className="px-2 py-3">{totalExpense}</td>
              <td className="px-2 py-3">{totalProfit}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* pagination */}
      {currentTripsReport.length === 0 ? (
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

export default TripReport
