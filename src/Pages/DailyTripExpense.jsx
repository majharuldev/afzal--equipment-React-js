

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
import DatePicker from "react-datepicker"
import { set } from "react-hook-form"
import { Button } from "antd"
import api from "../utils/axiosConfig"

const DailyTripExpense = () => {
  const [showFilter, setShowFilter] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [trip, setTrip] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    api
      .get(`/trip`)
      .then((response) => {
          const sorted = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
          setTrip(sorted)
        setLoading(false)
      })
      .catch((error) => {
        console.error("ট্রিপ তথ্য আনতে সমস্যা হয়েছে:", error)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="text-center mt-16">ট্রিপ তথ্য লোড হচ্ছে...</p>

  const filteredExpense = trip.filter((dt) => {
    const term = searchTerm.toLowerCase()
    const tripDate = dt.date

    const matchesSearch =
      dt.date?.toLowerCase().includes(term) ||
      dt.trip_time?.toLowerCase().includes(term) ||
      dt.load_point?.toLowerCase().includes(term) ||
      dt.unload_point?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.driver_mobile?.toLowerCase().includes(term) ||
      String(dt.driver_commission).includes(term) ||
      String(dt.fuel_cost).includes(term) ||
      String(dt.vehicle_no).includes(term) ||
      String(dt.others).includes(term) ||
      String(dt.total_rent).includes(term) ||
      String(dt.total_exp).includes(term)

    const matchesDateRange =
      (!startDate || new Date(tripDate) >= new Date(startDate)) &&
      (!endDate || new Date(tripDate) <= new Date(endDate))
    return matchesSearch && matchesDateRange
  })

  const headers = [
    { label: "#", key: "index" },
    { label: "Date", key: "date" },
    { label: "Equipemnt No", key: "vehicle_no" },
    { label: "Driver/Operator", key: "driver_name" },
    { label: "Trip Cost", key: "total_exp" },
    { label: "Total cost", key: "totalTripCost" },
  ]

  const csvData = filteredExpense.map((item, index) => {
    const totalExp = Number.parseFloat(item.total_exp ?? "0") || 0
    const totalTripCost = ( totalExp)

    return {
      index: index + 1,
      date: new Date(item.date).toLocaleDateString("en-GB"),
      vehicle_no: item.vehicle_no,
      driver_name: item.driver_name,
      total_exp: totalExp,
      totalTripCost,
    }
  })

  // Excel export function
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "খরচের তথ্য")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const data = new Blob([excelBuffer], { type: "application/octet-stream" })
    saveAs(data, "khroch_data.xlsx")
  }

  // PDF export function
  const exportPDF = () => {
    const doc = new jsPDF()
    const tableColumn = headers.map((h) => h.label)
    const tableRows = csvData.map((row) => headers.map((h) => row[h.key]))
    autoTable(doc, { head: [tableColumn], body: tableRows, styles: { font: "helvetica", fontSize: 8 } })
    doc.save("khroch_data.pdf")
  }

  // print function
  const printTable = () => {
    const actionColumns = document.querySelectorAll(".action_column")
    actionColumns.forEach((col) => { col.style.display = "none" })
    const printContent = document.querySelector("table").outerHTML
    const WinPrint = window.open("", "", "width=900,height=650")
    WinPrint.document.write(`
      <html>
        <head>
          <title>প্রিন্ট</title>
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


  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTrip = filteredExpense.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredExpense.length / itemsPerPage)

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1) }
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage((currentPage) => currentPage + 1) }
  const handlePageClick = (number) => { setCurrentPage(number) }

  return (
    <main>
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            ট্রিপ খরচ তালিকা
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel /> এক্সেল
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf /> পিডিএফ
            </button>
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint /> প্রিন্ট
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">খুঁজুন: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              placeholder="খুঁজুন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="শুরুর তারিখ"
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
              placeholderText="শেষ তারিখ"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <Button
            type="primary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setShowFilter(false);
                setCurrentPage(1);
              }}
              icon={<FaFilter />}
              className="!bg-primary !text-white"
            >
              মুছে ফেলুন
            </Button>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">তারিখ</th>
                <th className="px-4 py-3">ইকুইপমেন্ট/গাড়ি নং</th>
                <th className="px-4 py-3">অপারেটর/ড্রাইভার নাম</th>
                <th className="px-4 py-3">ট্রিপ খরচ</th>
                {/* <th className="px-4 py-3">অন্যান্য খরচ</th> */}
                <th className="px-4 py-3">মোট খরচ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentTrip.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500 italic">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      কোন খরচের তথ্য পাওয়া যায়নি।
                    </div>
                  </td>
                </tr>
              ) : (
                currentTrip?.map((item, index) => {
                  // const totalRent = Number.parseFloat(item.total_rent ?? "0") || 0
                  const totalExp = Number.parseFloat(item.total_exp ?? "0") || 0
                  const totalTripCost = (totalExp)

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-4 py-4 font-bold">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-4">{item.date}</td>
                      <td className="px-4 py-4">{item.vehicle_no}</td>
                      <td className="px-4 py-4">{item.driver_name}</td>
                      {/* <td className="px-4 py-4">{totalRent}</td> */}
                      <td className="px-4 py-4">{totalExp}</td>
                      <td className="px-4 py-4">{totalTripCost}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentTrip.length === 0 ? (
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

export default DailyTripExpense

