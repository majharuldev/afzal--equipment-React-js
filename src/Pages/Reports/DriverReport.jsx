
import { useEffect, useState } from "react";
import {
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaPrint,
  FaUser,
} from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiFilter } from "react-icons/fi";
import Pagination from "../../components/Shared/Pagination";
import api from "../../utils/axiosConfig";
import { Table } from "antd";
import { toNumber } from "../../hooks/toNumber";

const DriverReport = () => {
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Clear all filters
  const clearFilters = () => {
    setSelectedDriver("");
    setSelectedMonth("");
    setCurrentPage(1);
  };

  // Fetch drivers and trips data
  useEffect(() => {
    setLoading(true);
    const fetchDrivers = api.get(
      `/driver`
    );
    const fetchTrips = api.get(
      `/trip`
    );

    Promise.all([fetchDrivers, fetchTrips])
      .then(([driverRes, tripRes]) => {
        setDrivers(driverRes?.data ?? []);
        // শুধু Approved trip গুলো নাও
        const tripTrips = tripRes?.data ;
        setTrips(tripTrips);
      })
      .catch((err) => {
        console.error("ডেটা আনা ব্যর্থ হয়েছে", err);
        setDrivers([]);
        setTrips([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedDriver]);

  const getAvailableMonths = () => {
  if (!Array.isArray(trips)) return [];

  const monthSet = new Set();

  trips.forEach(trip => {
    if (trip.date && trip.transport_type === "own_transport") {
      const date = new Date(trip.date);
      if (isNaN(date)) return; // invalid date skip
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthYear);
    }
  });

  return Array.from(monthSet)
    .sort()
    .map(month => {
      const [year, monthNum] = month.split('-');
      const monthInt = parseInt(monthNum, 10);
      const monthName = new Date(year, monthInt - 1, 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' });

      return {
        value: month,
        label: monthName,
      };
    });
};


  const availableMonths = getAvailableMonths();

  // Filter trips by month, driver, and only include own transport trips with valid drivers
  const tripsFiltered = Array.isArray(trips)
    ? trips.filter((t) => {
      if (!t.date || t.transport_type !== "own_transport") return false;

      const tripDate = new Date(t.date);
      const tripMonth = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;

       // Check if driver exists using both name + id
      const driverExists = drivers.some(driver =>
        driver.driver_name?.trim().toLowerCase() === t.driver_name?.trim().toLowerCase() &&
        driver.driver_mobile === t.driver_mobile
      );

      if (!driverExists) return false;

      const driverMatch = !selectedDriver ||
        (t.driver_name?.trim().toLowerCase() === selectedDriver.trim().toLowerCase() &&
         drivers.find(d => d.driver_name?.trim().toLowerCase() === t.driver_name?.trim().toLowerCase())?.driver_mobile === t.driver_mobile
        );

      const monthMatch = !selectedMonth || tripMonth === selectedMonth;

      return driverMatch && monthMatch;
    })
    : [];

  // Process driver statistics by month - UPDATED VERSION WITH WORK_TIME AND RATE
  const getMonthlyDriverStats = () => {
    if (!Array.isArray(drivers) || !Array.isArray(tripsFiltered)) return [];

    const monthlyStats = [];

    // Create a map of driver names for quick lookup
    const driverMap = {};
    drivers.forEach(driver => {
      if (driver.driver_name && driver.id) {
        const key = driver.driver_name.trim().toLowerCase() + "_" + driver.driver_mobile;
        driverMap[key] = {
          id: driver.id,
          name: driver.driver_name,
          mobile: driver.driver_mobile
        };
      }
    });

    // Group trips by driver (name+id) and month
    const tripsByDriverAndMonth = tripsFiltered.reduce((acc, trip) => {
      if (!trip.driver_name || !trip.driver_mobile) return acc;

      const driverKey = trip.driver_name.trim().toLowerCase() + "_" + trip.driver_mobile;

      // Only process if driver exists in our driver list
      if (!driverMap[driverKey]) return acc;

      const tripDate = new Date(trip.date);
      const monthYear = `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = tripDate.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!acc[driverKey]) {
        acc[driverKey] = {};
      }

      if (!acc[driverKey][monthYear]) {
        acc[driverKey][monthYear] = {
          month: monthName,
          driverName: driverMap[driverKey].name,
          driverMobile: driverMap[driverKey].mobile,
          trips: [],
          totalRent: 0,
          totalExp: 0,
          totalWorkTime: 0,
          totalRate: 0
        };
      }

      acc[driverKey][monthYear].trips.push(trip);
      acc[driverKey][monthYear].totalRent += Number(trip.total_rent || 0);
      acc[driverKey][monthYear].totalExp += Number(trip.total_exp || 0);
      
      // Add work_time and rate calculations
      acc[driverKey][monthYear].totalWorkTime += Number(trip.work_time || 0);
      acc[driverKey][monthYear].totalRate += Number(trip.rate || 0);

      return acc;
    }, {});

    // Create monthly stats for each driver
    Object.entries(tripsByDriverAndMonth).forEach(([driverKey, monthlyData]) => {
      Object.entries(monthlyData).forEach(([monthKey, monthData]) => {
        monthlyStats.push({
          name: monthData.driverName,
          mobile: monthData.driverMobile,
          month: monthData.month,
          monthKey,
          totalTrips: monthData.trips.length,
          totalRent: monthData.totalRent,
          totalExp: monthData.totalExp,
          totalProfit: monthData.totalRent - monthData.totalExp,
          // New fields for work time and rate
          totalWorkTime: monthData.totalWorkTime,
          totalRate: monthData.totalRate,
          // Calculate averages
          avgWorkTime: monthData.trips.length > 0 ? (monthData.totalWorkTime / monthData.trips.length).toFixed(2) : 0,
          avgRate: monthData.trips.length > 0 ? (monthData.totalRate / monthData.trips.length).toFixed(2) : 0
        });
      });
    });

    // Sort by driver name and month
    return monthlyStats.sort((a, b) => {
      if (a.name === b.name) {
        return a.monthKey.localeCompare(b.monthKey);
      }
      return a.name.localeCompare(b.name);
    });
  };

  // Updated table columns with work_time and rate
  const columns = [
    { title: "ক্রম", dataIndex: "key", render: (_, __, index) => index + 1 },
    { title: "মাস", dataIndex: "month" },
    { title: "অপারেটর/ড্রাইভার", dataIndex: "name" },
    { title: "মোবাইল", dataIndex: "mobile" },
    { title: "ট্রিপ", dataIndex: "totalTrips" },
    { 
      title: "কাজের সময়", 
      dataIndex: "totalWorkTime",
      render: (value, record) => (
        <div>
          <div> {value} ঘণ্টা</div>
          {/* <div className="text-xs text-gray-500">গড়: {record.avgWorkTime} ঘণ্টা</div> */}
        </div>
      )
    },
    { 
      title: "রেট", 
      dataIndex: "totalRate",
      render: (value, record) => (
        <div>
          <div> {value} টাকা</div>
          {/* <div className="text-xs text-gray-500"> {record.avgRate}</div> */}
        </div>
      )
    },
    { title: "আয়", dataIndex: "totalRent" },
    { title: "খরচ", dataIndex: "totalExp" },
    {
      title: "মুনাফা",
      dataIndex: "totalProfit",
      render: (value) => <span style={{ color: value >= 0 ? "green" : "red" }}>{value}</span>,
    },
  ];

  const monthlyDriverStats = getMonthlyDriverStats();

  // Updated Export to Excel with work_time and rate
  const exportExcel = () => {
    const data = monthlyDriverStats.map((d, i) => ({
      SL: i + 1,
      Month: d.month,
      Driver: d.name,
      Mobile: d.mobile,
      Trips: d.totalTrips,
      'Total Work Time': toNumber(d.totalWorkTime),
      'Average Work Time': toNumber(d.avgWorkTime),
      'Total Rate': toNumber(d.totalRate),
      'Average Rate': toNumber(d.avgRate),
      Rent: toNumber(d.totalRent),
      Expense: toNumber(d.totalExp),
      Profit: toNumber(d.totalProfit),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DriverMonthlyReport");
    XLSX.writeFile(wb, "Driver_Monthly_Report.xlsx");
  };

  // Updated Export to PDF with work_time and rate
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    const head = [
      ["SL", "Month", "Driver", "Mobile", "Trips", "Work Time", "Rate", "Rent", "Expense", "Profit"],
    ];
    const body = monthlyDriverStats.map((d, i) => [
      i + 1,
      d.month,
      d.name,
      d.mobile,
      d.totalTrips,
      `${d.totalWorkTime} hrs (avg: ${d.avgWorkTime})`,
      `${d.totalRate} (avg: ${d.avgRate})`,
      d.totalRent,
      d.totalExp,
      d.totalProfit,
    ]);
    autoTable(doc, { head, body, theme: "grid" });
    doc.save("Driver_Monthly_Report.pdf");
  };

  // Updated Print function with work_time and rate
  const printReport = () => {
    const bodyRows = monthlyDriverStats.map((d, i) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${i + 1}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.month}</td>
        <td style="border:1px solid #ccc;padding:6px">${d.name}</td>
        <td style="border:1px solid #ccc;padding:6px">${d.mobile}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${d.totalTrips}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">
          ${d.totalWorkTime}<br>
        </td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">
          ${d.totalRate}<br>
        </td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalRent}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${d.totalExp}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${d.totalProfit >= 0 ? 'green' : 'red'}">${d.totalProfit}</td>
      </tr>
    `).join("");

    // Calculate totals including work_time and rate
    const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + d.totalTrips, 0);
    const totalRent = monthlyDriverStats.reduce((sum, d) => sum + d.totalRent, 0);
    const totalExp = monthlyDriverStats.reduce((sum, d) => sum + d.totalExp, 0);
    const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + d.totalProfit, 0);
    const totalWorkTime = monthlyDriverStats.reduce((sum, d) => sum + d.totalWorkTime, 0);
    const totalRate = monthlyDriverStats.reduce((sum, d) => sum + d.totalRate, 0);

    const totalRow = `
      <tr style="font-weight:bold;background:#f0f0f0">
        <td colspan="4" style="border:1px solid #ccc;padding:6px;text-align:right">Total:</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${totalTrips}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${totalWorkTime} hrs</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:center">${totalRate}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalRent}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right">${totalExp}</td>
        <td style="border:1px solid #ccc;padding:6px;text-align:right;color:${totalProfit >= 0 ? 'green' : 'red'}">${totalProfit}</td>
      </tr>
    `;

    const html = `
      <table style="width:100%;border-collapse:collapse; ">
        <thead style="background:#11375B; color:black;">
          <tr>
            <th style="border:1px solid #ccc;padding:6px">SL</th>
            <th style="border:1px solid #ccc;padding:6px">Month</th>
            <th style="border:1px solid #ccc;padding:6px">Driver</th>
            <th style="border:1px solid #ccc;padding:6px">Mobile</th>
            <th style="border:1px solid #ccc;padding:6px">Trips</th>
            <th style="border:1px solid #ccc;padding:6px">Work Time</th>
            <th style="border:1px solid #ccc;padding:6px">Rate</th>
            <th style="border:1px solid #ccc;padding:6px">Income</th>
            <th style="border:1px solid #ccc;padding:6px">Expense</th>
            <th style="border:1px solid #ccc;padding:6px">Profit</th>
          </tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
        <tfoot>
          ${totalRow}
        </tfoot>
      </table>
    `;

    const w = window.open("", "", "width=1000,height=650");
    w.document.write(`<html><head><title>Driver Monthly Report</title></head><body><h3>Driver Monthly Report</h3>${html}</body></html>`);
    w.document.close();
    w.print();
    w.close();
  };

  // Grand Totals (updated with work_time and rate)
  const totalTrips = monthlyDriverStats.reduce((sum, d) => sum + d.totalTrips, 0);
  const totalRent = monthlyDriverStats.reduce((sum, d) => sum + d.totalRent, 0);
  const totalExp = monthlyDriverStats.reduce((sum, d) => sum + d.totalExp, 0);
  const totalProfit = monthlyDriverStats.reduce((sum, d) => sum + d.totalProfit, 0);
  const totalWorkTime = monthlyDriverStats.reduce((sum, d) => sum + d.totalWorkTime, 0);
  const totalRate = monthlyDriverStats.reduce((sum, d) => sum + d.totalRate, 0);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDriverReport = monthlyDriverStats.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(monthlyDriverStats.length / itemsPerPage);

  // Loading state
  if (loading)
    return (
      <div>
        <div className="text-center py-10 text-gray-500">
          <div className="flex justify-center items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
            ড্রাইভার রিপোর্ট লোড হচ্ছে...
          </div>
        </div>
      </div>
    );

  return (
    <div className="md:p-2">
      <div className="p-4  mx-auto bg-white shadow rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <FaUser className="text-lg" />
          অপারেটরের মাসিক পারফরম্যান্স রিপোর্ট
        </h2>

        {/* Buttons */}
        <div className="flex items-center justify-between my-6">
          <div className="flex flex-wrap md:flex-row gap-3">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel />
              এক্সেল
            </button>
            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf />
              পিডিএফ
            </button>
            <button
              onClick={printReport}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              <FaPrint />
              প্রিন্ট
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {/* Filter UI */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">অপারেটর/ড্রাইভার</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">সব অপারেটর/ড্রাইভার</option>
                {drivers.map((driver) => (
                  <option key={driver.driver_name} value={driver.driver_name}>
                    {driver.driver_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">মাস</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              >
                <option value="">সব মাস</option>
                {availableMonths.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {(selectedDriver || selectedMonth) && (
                <button
                  onClick={clearFilters}
                  className="mt-7 border border-red-500 text-red-500 px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <FiFilter /> Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">মোট কাজের সময়</h3>
            <p className="text-2xl font-bold text-blue-600">{totalWorkTime} ঘণ্টা</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">মোট রেট</h3>
            <p className="text-2xl font-bold text-green-600">{totalRate} টাকা</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">মোট আয়</h3>
            <p className="text-2xl font-bold text-purple-600">{totalRent} টাকা</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800">মোট মুনাফা</h3>
            <p className="text-2xl font-bold text-orange-600">{totalProfit} টাকা</p>
          </div>
        </div> */}

        {/* Report Table */}
        <Table
          columns={columns}
          dataSource={currentDriverReport}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: monthlyDriverStats.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default DriverReport;
