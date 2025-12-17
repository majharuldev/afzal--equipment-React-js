
import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { FaFilter, FaFilePdf, FaFileExcel, FaSearch } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import Pagination from "../../components/Shared/Pagination";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import api from "../../utils/axiosConfig";
import  {toNumber}  from "../../hooks/toNumber";
import * as XLSX from "xlsx";
import { tableFormatDate } from "../../components/Shared/formatDate";
dayjs.extend(isBetween);

export default function FuelReport() {
  const [tripData, setTripData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const reportRef = useRef();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tripRes = await api.get("/trip");
      const purchaseRes = await api.get("/purchase");
      setTripData(tripRes.data || []);
      setPurchaseData(purchaseRes.data.data || []);
      generateFuelReport(tripRes.data, purchaseRes.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  };

  const generateFuelReport = (trips, purchases) => {
    const tripFuel = (trips || [])
      .filter(trip => trip.fuel_cost && parseFloat(trip.fuel_cost) > 0)
      .map(trip => ({
        source: "Trip",
        date: trip.date,
        vehicle: trip.vehicle_no || "Unknown",
        driver: trip.driver_name || "N/A",
        customer: trip.customer || "N/A",
        route: `${trip.load_point || ""} to ${trip.unload_point || ""}`,
        fuel_cost: parseFloat(trip.fuel_cost),
        total_rent: parseFloat(trip.total_rent) || 0,
        fuel_percentage: trip.total_rent > 0
          ? ((parseFloat(trip.fuel_cost) / parseFloat(trip.total_rent)) * 100).toFixed(2)
          : "N/A",
        status: trip.status || "N/A"
      }));

    // const purchaseFuel = (purchases || [])
    //   .filter(p => p.category === "fuel")
    //   .map(p => ({
    //     source: "Purchase",
    //     date: p.date,
    //     vehicle: p.vehicle_no || "Unknown",
    //     driver: p.driver_name || "N/A",
    //     customer: p.supplier_name || "N/A",
    //     route: "N/A",
    //     fuel_cost: parseFloat(p.purchase_amount),
    //     total_rent: 0,
    //     fuel_percentage: "N/A",
    //     status: p.status || "N/A"
    //   }));

    // setReport([...tripFuel, ...purchaseFuel]);
    setReport([...tripFuel]);
  };

  const getAvailableVehicles = () => {
    const vehicles = new Set();
    [...tripData, ...purchaseData].forEach(item => {
      if (item.vehicle_no) vehicles.add(item.vehicle_no);
    });
    return Array.from(vehicles).sort();
  };

  const filteredReport = report.filter(item => {
    if (startDate && endDate) {
      const itemDate = dayjs(item.date);
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      if (!itemDate.isBetween(start, end, 'day', '[]')) return false;
    } else if (startDate && !endDate) {
      if (dayjs(item.date).format('YYYY-MM-DD') !== dayjs(startDate).format('YYYY-MM-DD')) return false;
    }

    if (selectedVehicle && item.vehicle !== selectedVehicle) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.date.toLowerCase().includes(searchLower) ||
        item.vehicle.toLowerCase().includes(searchLower) ||
        item.driver.toLowerCase().includes(searchLower) ||
        item.customer.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const totals = filteredReport.reduce((acc, item) => ({
    totalFuelCost: acc.totalFuelCost + item.fuel_cost,
    totalRent: acc.totalRent + item.total_rent
  }), { totalFuelCost: 0, totalRent: 0 });

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedVehicle("");
    setSearchTerm("");
    setCurrentPage(1);
    setShowFilter(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReport.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);

  // pdf export function
  const handlePdfExport = () => {
    const doc = new jsPDF();
    const title = "Fuel Report";

    doc.setFontSize(16);
    doc.text(title, 14, 15);

    if (startDate || endDate) {
      doc.setFontSize(10);
      const dateRangeText = `Date: ${startDate || ''} ${endDate ? ' to ' + endDate : ''}`;
      doc.text(dateRangeText, 14, 22);
    }

    const headers = [
      ["Date", "Equipment No", "Driver", "Supplier/Customer", "Route", "Fuel Cost", "Total Rate", "Fuel %", "Source"]
    ];

    const data = filteredReport.map(item => [
      item.date,
      item.vehicle,
      item.driver,
      item.customer,
      item.route,
      item.fuel_cost,
      item.total_rent,
      item.fuel_percentage,
      item.source
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [17, 55, 91], textColor: 255, fontStyle: 'bold' },
      foot: [
        ['', '', '', '', 'মোট:', totals.totalFuelCost, totals.totalRent, '', '']
      ],
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    doc.save('fuel_report.pdf');
  };

  // excel export function
  const handleExcelExport = () => {
  const excelData = filteredReport.map(item => ({
    "Date": item.date,
    "Equipment No": item.vehicle,
    "Driver": item.driver,
    "Customer/Supplier": item.customer,
    "Route": item.route,
    "Fuel Cost": toNumber(item.fuel_cost),
    "Total Rent": toNumber(item.total_rent),
    "Fuel %": item.fuel_percentage,
    "Source": item.source
  }));

  // Add total row
  excelData.push({
    "Date": "",
    "Equipment": "",
    "Driver": "",
    "Customer/Supplier": "",
    "Route": "Total",
    "Fuel Cost": totals.totalFuelCost,
    "Total Rent": totals.totalRent,
    "Fuel %": "",
    "Source": ""
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel Report");

  XLSX.writeFile(workbook, "fuel_report.xlsx");
};

// print function
  const handlePrint = () => {
    const rowsHtml = filteredReport.map(item => `
      <tr>
        <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.date}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.vehicle}</td>
        <td style="border:1px solid #ddd;padding:6px">${item.driver}</td>
        <td style="border:1px solid #ddd;padding:6px">${item.customer}</td>
        <td style="border:1px solid #ddd;padding:6px">${item.route}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${item.fuel_cost}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${item.total_rent}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.fuel_percentage}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center">${item.source}</td>
      </tr>
    `).join("");

    const totalsRow = `
      <tr style="font-weight:bold;background:#f0f0f0">
        <td colspan="5" style="border:1px solid #ddd;padding:6px;text-align:right">মোট:</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${totals.totalFuelCost}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${totals.totalRent}</td>
        <td colspan="2"></td>
      </tr>
    `;

    const html = `
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#11375B;color:black">
          <tr>
            <th style="border:1px solid #ddd;padding:6px">তারিখ</th>
            <th style="border:1px solid #ddd;padding:6px">ভেহিকল</th>
            <th style="border:1px solid #ddd;padding:6px">ড্রাইভার</th>
            <th style="border:1px solid #ddd;padding:6px">কাস্টমার/সাপ্লায়ার</th>
            <th style="border:1px solid #ddd;padding:6px">রুট</th>
            <th style="border:1px solid #ddd;padding:6px">ফুয়েল খরচ</th>
            <th style="border:1px solid #ddd;padding:6px">টোটাল রেন্ট</th>
            <th style="border:1px solid #ddd;padding:6px">ফুয়েল %</th>
            <th style="border:1px solid #ddd;padding:6px">সোর্স</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>${totalsRow}</tfoot>
      </table>
    `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`<html><head><title>Fuel Report</title></head><body>${html}</body></html>`);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <div className="p-2">
      <div
        ref={reportRef}
        className="w-[22rem] md:w-full  max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200"
      >
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            ফুয়েল খরচ রিপোর্ট
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        <div className="md:flex justify-between items-center mb-3">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button onClick={handleExcelExport} className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow flex items-center gap-2"><FaFileExcel /> এক্সেল</button>
            <button onClick={handlePdfExport} className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow flex items-center gap-2"><FaFilePdf /> পিডিএফ</button>
            <button onClick={handlePrint} className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow flex items-center gap-2">প্রিন্ট</button>
          </div>
          <div className="relative mt-3 md:mt-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md outline-none text-sm py-2 pl-10 pr-5 w-full md:w-64"
            />
            {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
              className="absolute right-5 top-[1.2rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
            >
              ✕
            </button>
          )}
          </div>
        </div>

        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} selectsStart startDate={startDate} endDate={endDate} dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" className="!w-full p-2 border border-gray-300 rounded text-sm" isClearable />
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" className="!w-full p-2 border border-gray-300 rounded text-sm" isClearable />
            <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className=" w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white">
              <option value="">সকল ভেহিকল</option>
              {getAvailableVehicles().map(vehicle => <option key={vehicle} value={vehicle}>{vehicle}</option>)}
            </select>
            <div className="flex items-end"><button onClick={clearFilters} className="bg-primary text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2"><FiFilter />ক্লিয়ার</button></div>
          </div>
        )}

        {loading && <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11375B]"></div></div>}

        {!loading && (
          <div id="fuelReport" className="mt-5 overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-200 text-primary capitalize text-xs">
                <tr>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3">ভেহিকল</th>
                  <th className="p-3">ড্রাইভার</th>
                  <th className="p-3">কাস্টমার/সাপ্লায়ার</th>
                  <th className="p-3">রুট</th>
                  <th className="p-3">ফুয়েল খরচ</th>
                  <th className="p-3">টোটাল রেন্ট</th>
                  <th className="p-3">ফুয়েল %</th>
                  <th className="p-3">সোর্স</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentItems.length > 0 ? currentItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
                    <td className="p-3">{tableFormatDate(item.date)}</td>
                    <td className="p-3">{item.vehicle}</td>
                    <td className="p-3">{item.driver}</td>
                    <td className="p-3">{item.customer}</td>
                    <td className="p-3">{item.route}</td>
                    <td className="p-3">{item.fuel_cost}</td>
                    <td className="p-3">{item.total_rent}</td>
                    <td className="p-3">{item.fuel_percentage}</td>
                    <td className="p-3">{item.source}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} className="p-4 text-center text-gray-500">কোনো ফুয়েল ডেটা পাওয়া যায়নি</td></tr>
                )}
              </tbody>
              {filteredReport.length > 0 && (
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={5} className="p-3 text-right">মোট:</td>
                    <td className="p-3">{totals.totalFuelCost}</td>
                    <td className="p-3">{totals.totalRent}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
            </table>
         </div>
          )}

        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
    </div>
  );
}
