
import { useEffect, useState } from "react";
import axios from "axios";
import { FaTruck, FaFilter, FaPen, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { Table, Input, Button } from "antd";
import { tableFormatDate } from "../components/Shared/formatDate";
import DatePicker from "react-datepicker";

const DailyIncome = () => {
  const [trips, setTrips] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`);
        const sorted = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrips(sorted);
      } catch (err) {
        console.error("ডেটা আনার সময় ত্রুটি:", err);
      }
    };
    fetchTrips();
  }, []);

  const filteredIncome = trips.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const tripDate = dt.date;
    const matchesSearch =
      dt.date?.toLowerCase().includes(term) ||
      dt.trip_time?.toLowerCase().includes(term) ||
      dt.load_point?.toLowerCase().includes(term) ||
      dt.unload_point?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.driver_mobile?.includes(term) ||
      String(dt.driver_commission).includes(term) ||
      String(dt.fuel_cost).includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      String(dt.others).includes(term) ||
      String(dt.total_rent).includes(term) ||
      String(dt.total_exp).includes(term);

    const matchesDateRange =
      (!startDate || new Date(tripDate) >= new Date(startDate)) &&
      (!endDate || new Date(tripDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  const csvData = trips.map((dt, index) => {
    const totalRent = Number.parseFloat(dt.total_rent ?? "0") || 0;
    const totalExp = Number.parseFloat(dt.total_exp ?? "0") || 0;
    const profit = (totalRent - totalExp).toFixed(2);
    return {
      index: index + 1,
      date: new Date(dt.date).toLocaleDateString("en-GB"),
      vehicle_no: dt.vehicle_no,
      load_point: dt.load_point,
      unload_point: dt.unload_point,
      total_rent: dt.total_rent,
      total_exp: totalExp,
      profit: profit,
    };
  });

  // excel function
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trip Data");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "dailyincome_data.xlsx");
  };

  // pdf function
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["#", "তারিখ", "গাড়ি", "লোড", "আনলোড", "ট্রিপের ভাড়া", "চলমান খরচ", "লাভ"];
    const tableRows = csvData.map((row) => [
      row.index,
      row.date,
      row.vehicle_no,
      row.load_point,
      row.unload_point,
      row.total_rent,
      row.total_exp,
      row.profit,
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, styles: { font: "helvetica", fontSize: 8 } });
    doc.save("dailyincome_data.pdf");
  };

  // print function
  const printTable = () => {
    const printContent = document.querySelector("table").outerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
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
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // table columns
  const columns = [
    { title: "#", dataIndex: "index", key: "index" },
    {
      title: "তারিখ", dataIndex: "date", key: "date",
      render: (text) => tableFormatDate(text)
    },
    { title: "ইকুইপমেন্ট/গাড়ি", dataIndex: "vehicle_no", key: "vehicle_no" },
    {
      title: "কাজের জায়গা",
      dataIndex: "working_area",
      key: "working_area",
    },
    { title: "লোড", dataIndex: "load_point", key: "load_point" },
    { title: "আনলোড", dataIndex: "unload_point", key: "unload_point" },
    { title: "ট্রিপের ভাড়া", dataIndex: "total_rent", key: "total_rent" },
    { title: "চলমান খরচ", dataIndex: "total_exp", key: "total_exp" },
    { title: "লাভ", dataIndex: "profit", key: "profit" },
  ];

  return (
    <main>
      <div className="w-full max-w-7xl mx-auto bg-white p-4 rounded-xl shadow-md">
        {/* হেডার */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaTruck /> আয়ের তালিকা
          </h1>
          <Button onClick={() => setShowFilter((prev) => !prev)} icon={<FaFilter />}>
            ফিল্টার
          </Button>
        </div>
        {/* Export & Search */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <CSVLink data={csvData} filename="dailyincome_data.csv">
              <button className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">CSV</button>
            </CSVLink>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFileExcel className="" /> Excel </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFilePdf className="" /> PDF </button>
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaPrint className="" /> Print </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input type="text" value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5" />
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="flex-1 min-w-0">
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
                placeholderText="শেষ তারিখ"
                locale="en-GB"
                className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                isClearable
              />
            </div>

            <div className="">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                  setShowFilter(false);
                }}
                className="bg-primary text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {/* AntD টেবিল */}
        <Table
          columns={columns}
          dataSource={filteredIncome.map((trip, index) => {
            const totalRent = Number(trip.total_rent || 0);
            const totalExp = Number(trip.total_exp || 0);
            return {
              key: trip.id || index,
              ...trip,
              index: index + 1,
              profit: (totalRent - totalExp).toFixed(2),
            };
          })}
          pagination={{ pageSize: 10, current: currentPage, onChange: setCurrentPage }}
        />
      </div>
    </main>
  );
};

export default DailyIncome;
