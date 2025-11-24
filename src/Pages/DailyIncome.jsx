
import { useEffect, useState } from "react";
import { FaTruck, FaFilter, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { Table, Button } from "antd";
import { tableFormatDate } from "../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import api from "../utils/axiosConfig";
import { toNumber } from "../hooks/toNumber";

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
        const res = await api.get(`/trip`);
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTrips(sorted);
      } catch (err) {
        console.error("ডেটা আনার সময় ত্রুটি:", err);
      }
    };
    fetchTrips();
  }, []);

  // filter
  const filteredIncome = trips.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const tripDate = new Date(dt.date);
    const matchesSearch =
      String(dt.date || "").toLowerCase().includes(term) ||
      String(dt.trip_time || "").toLowerCase().includes(term) ||
      String(dt.load_point || "").toLowerCase().includes(term) ||
      String(dt.unload_point || "").toLowerCase().includes(term) ||
      String(dt.driver_name || "").toLowerCase().includes(term) ||
      String(dt.driver_mobile || "").includes(term) ||
      String(dt.driver_commission || "").includes(term) ||
      String(dt.work_place || "").includes(term) ||
      String(dt.vehicle_no || "").toLowerCase().includes(term)

    const matchesDateRange =
      (!startDate || new Date(tripDate) >= new Date(startDate)) &&
      (!endDate || new Date(tripDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  // full data for export (ignore pagination)
  const exportData = filteredIncome.map((dt, index) => {
    const totalRent = toNumber(dt.total_rent || 0);
    const totalExp = toNumber(dt.total_exp || 0);
    const profit = totalRent - totalExp;
    return {
      index: index + 1,
      date: new Date(dt.date).toLocaleDateString("en-GB"),
      vehicle_no: dt.vehicle_no,
      work_place: dt.work_place || "N/A",
      load_point: dt.load_point || "N/A",
      unload_point: dt.unload_point || "N/A",
      work_time: dt.work_time || "N/A",
      rate: dt.rate || "N/A",
      total_rent: totalRent,
      total_exp: totalExp,
      profit: profit,
    };
  });

  // excel function
  // const exportExcel = () => {
  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Trip Data");

  //   // Number formatting for total_rent, total_exp, profit
  //   const numberCols = ["G", "H", "I"]; // assuming total_rent=G, total_exp=H, profit=I
  //   numberCols.forEach((col) => {
  //     for (let row = 2; row <= exportData.length + 1; row++) {
  //       const cellRef = `${col}${row}`;
  //       if (worksheet[cellRef]) worksheet[cellRef].t = "n"; // type number
  //     }
  //   });

  //   const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //   const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //   saveAs(data, "dailyincome_data.xlsx");
  // };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Calculate totals
    const totalWorkTimeSum = exportData.reduce((acc, cur) => acc + cur.work_time, 0);
    const totalRateSum = exportData.reduce((acc, cur) => acc + cur.rate, 0);
    const totalRentSum = exportData.reduce((acc, cur) => acc + cur.total_rent, 0);
    const totalExpSum = exportData.reduce((acc, cur) => acc + cur.total_exp, 0);
    const totalProfitSum = exportData.reduce((acc, cur) => acc + cur.profit, 0);

    const totalRow = {
      index: "মোট",
      date: "",
      vehicle_no: "",
      work_place: "",
      load_point: "",
      unload_point: "",
      work_time: totalWorkTimeSum,
      rate: totalRateSum,
      total_rent: totalRentSum,
      total_exp: totalExpSum,
      profit: totalProfitSum,
    };

    const finalData = [...exportData, totalRow];

    const finalSheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, finalSheet, "Trip Data");
    XLSX.writeFile(workbook, "dailyincome_data.xlsx");
  };


  // pdf function
 const exportPDF = () => {
  const doc = new jsPDF();
  const tableColumn = ["#", "Date", "Equipment No", "Work Place", "Load", "Unload", "Work Time", "Rate", "Total Rent", "Total Expense", "Profit"];
  const tableRows = exportData.map((row) => [
    row.index,
    row.date,
    row.vehicle_no,
    row.work_place,
    row.load_point,
    row.unload_point,
    row.work_time,
    row.rate,
    row.total_rent,
    row.total_exp,
    row.profit,
  ]);

  // Total Row
  const totalWorkTimeSum = exportData.reduce((acc, cur) => acc + cur.work_time, 0);
  const totalRateSum = exportData.reduce((acc, cur) => acc + cur.rate, 0);
  const totalRentSum = exportData.reduce((acc, cur) => acc + cur.total_rent, 0);
  const totalExpSum = exportData.reduce((acc, cur) => acc + cur.total_exp, 0);
  const totalProfitSum = exportData.reduce((acc, cur) => acc + cur.profit, 0);
  tableRows.push([
    "মোট", "", "", "", "", "", totalWorkTimeSum, totalRateSum, totalRentSum, totalExpSum, totalProfitSum
  ]);

  autoTable(doc, { head: [tableColumn], body: tableRows, styles: { font: "helvetica", fontSize: 8 } });
  doc.save("dailyincome_data.pdf");
};


  // print function
  // Print all pages
  const printTable = () => {
    let printHtml = "<table border='1' style='border-collapse: collapse; width: 100%; text-align: center;'>";
    printHtml += "<thead><tr><th>#</th><th>তারিখ</th><th>ইকুইপমেন্ট</th><th>কাজের জায়গা</th><th>লোড</th><th>আনলোড</th><th>কাজের সময়</th><th>রেট</th><th>ট্রিপের ভাড়া</th><th>চলমান খরচ</th><th>লাভ</th></tr></thead>";
    printHtml += "<tbody>";
    exportData.forEach((row) => {
      printHtml += `<tr>
        <td>${row.index}</td>
        <td>${row.date}</td>
        <td>${row.vehicle_no}</td>
        <td>${row.work_place}</td>
        <td>${row.load_point}</td>
        <td>${row.unload_point}</td>
        <td>${row.work_time}</td>
        <td>${row.rate}</td>
        <td>${toNumber(row.total_rent)}</td>
        <td>${(row.total_exp)}</td>
        <td>${row.profit}</td>
      </tr>`;
    });
    printHtml += "</tbody></table>";
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`<html><head><title>প্রিন্ট</title></head><body>${printHtml}</body></html>`);
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
      dataIndex: "work_place",
      key: "work_place",
      render: (_, record) => record.work_place || "N/A",
    },
    {
      title: "লোড", dataIndex: "load_point", key: "load_point",
      render: (_, record) => record.load_point || "N/A",
    },
    {
      title: "আনলোড", dataIndex: "unload_point", key: "unload_point",
      render: (_, record) => record.unload_point || "N/A",
    },
    {
      title: "কাজের সময়",
      dataIndex: "work_time",
      key: "work_time",
      render: (_, record) => record.work_time || "N/A",
    },
    {
      title: "রেট", dataIndex: "rate", key: "rate",
      render: (_, record) => record.rate || "N/A",
    },
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
            {/* <CSVLink data={csvData} filename="dailyincome_data.csv">
              <button className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">CSV</button>
            </CSVLink> */}
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFileExcel className="" /> এক্সেল </button>
            {/* <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFilePdf className="" /> পিডিএফ </button> */}
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaPrint className="" /> প্রিন্ট </button>
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
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-9 top-[10.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
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
            // const totalWorkTime = trip.work_time || 0;
            // const totalRate = trip.rate || 0;
            const totalRent = Number(trip.total_rent || 0);
            const totalExp = Number(trip.total_exp || 0);
            return {
              key: trip.id || index,
              ...trip,
              index: index + 1,
              profit: parseFloat(totalRent) - parseFloat(totalExp),
            };
          })}

          pagination={{ pageSize: 10, current: currentPage, onChange: setCurrentPage }}
          summary={(pageData) => {
            let totalWorkTimeSum = 0;
            let totalRateSum = 0;
            let totalRentSum = 0;
            let totalExpSum = 0;
            let totalProfitSum = 0;

            pageData.forEach(({ total_rent, total_exp, profit, work_time, rate }) => {
              totalWorkTimeSum += Number(work_time || 0);
              totalRateSum += Number(rate || 0);
              totalRentSum += Number(total_rent || 0);
              totalExpSum += Number(total_exp || 0);
              totalProfitSum += Number(profit || 0);
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6} className="text-right font-bold">মোট</Table.Summary.Cell>
                <Table.Summary.Cell index={6} className="font-bold">{totalWorkTimeSum}</Table.Summary.Cell>
                <Table.Summary.Cell index={7} className="font-bold">{totalRateSum}</Table.Summary.Cell>
                <Table.Summary.Cell index={8} className="font-bold">{totalRentSum}</Table.Summary.Cell>
                <Table.Summary.Cell index={9} className="font-bold">{totalExpSum}</Table.Summary.Cell>
                <Table.Summary.Cell index={10} className="font-bold">{totalProfitSum}</Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </main>
  );
};

export default DailyIncome;
