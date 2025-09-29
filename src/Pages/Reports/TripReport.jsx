import { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { BiTrip } from "react-icons/bi";
import { Button } from "antd";
import DatePicker from "react-datepicker";
import { tableFormatDate } from "../../components/Shared/formatDate";

const TripReport = () => {
  const [trips, setTrips] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // trips data fetch
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          setTrips(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("ট্রিপ ডাটা আনতে ব্যর্থ", err);
        setLoading(false);
      });
  }, []);

  // filter trips by date range
  const filteredTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || tripDate >= start) && (!end || tripDate <= end);
  });

  const totalRent = filteredTrips.reduce((sum, t) => sum + Number(t.total_rent || 0), 0);
  const totalExpense = filteredTrips.reduce((sum, t) => sum + Number(t.total_exp || 0), 0);
  const totalProfit = totalRent - totalExpense;

  // excel export function
  const exportToExcel = () => {
    const data = filteredTrips.map((t, i) => ({
      SL: i + 1,
      "তারিখ": t.date,
      "ভ্যান / গাড়ি": t.vehicle_no,
      "ড্রাইভার": t.driver_name,
      "লোড পয়েন্ট": t.load_point,
      "আনলোড পয়েন্ট": t.unload_point,
      "ভাড়া": t.total_rent,
      "ব্যয়": t.total_exp,
      "লাভ": Number(t.total_rent) - Number(t.total_exp),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TripReport");
    XLSX.writeFile(wb, "Trip_Report.xlsx");
  };

  // pdf export function
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = ["SL", "তারিখ", "ভ্যান / গাড়ি", "ড্রাইভার", "লোড পয়েন্ট", "আনলোড পয়েন্ট", "ভাড়া", "ব্যয়", "লাভ"];
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
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, theme: "grid" });
    doc.save("Trip_Report.pdf");
  };

  // print function
  const printReport = () => {
    const content = document.getElementById("trip-table").outerHTML;
    const printWindow = window.open("", "", "width=900,height=650");
    printWindow.document.write(`
      <html><head><title>ট্রিপ রিপোর্ট</title>
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; }
        thead { background-color: #11375B; color: white; }
      </style>
      </head><body>
      <h3>ট্রিপ রিপোর্ট</h3>
      ${content}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTripsReport = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage((p) => p - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage((p) => p + 1); };
  const handlePageClick = (number) => { setCurrentPage(number); };

  if (loading) return (
    <div>
      <div colSpan="7" className="text-center py-10 text-gray-500">
        <div className="flex justify-center items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
          ট্রিপ রিপোর্ট লোড হচ্ছে...
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white shadow rounded-xl border border-gray-200">
      <h2 className="text-xl font-bold text-primary flex items-center gap-2">
        <BiTrip className="text-lg" />
        মাসিক ট্রিপ রিপোর্ট
      </h2>

      <div className="flex items-center justify-between my-5">
        <div className="flex flex-wrap md:flex-row gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
            <FaFileExcel /> এক্সেল
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
            <FaFilePdf /> পিডিএফ
          </button>
          <button onClick={printReport} className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer">
            <FaPrint /> প্রিন্ট
          </button>
        </div>

        <button onClick={() => setShowFilter((prev) => !prev)} className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
          <FaFilter /> ফিল্টার
        </button>
      </div>

      {showFilter && (
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 justify-center items-center">
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
              setVehicleFilter("");
              setShowFilter(false);
            }}
            icon={<FaFilter />}
            className="!bg-primary !text-white"
          >
            মুছে ফেলুন
          </Button>
        </div>
      )}

      <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
        <table id="trip-table" className="min-w-full text-sm text-left">
          <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
            <tr>
              <th className="px-2 py-3">SL</th>
              <th className="px-2 py-3">তারিখ</th>
              <th className="px-2 py-3">ইকুইপমেন্ট/গাড়ি</th>
              <th className="px-2 py-3">অপারেটর/ড্রাইভার</th>
              <th className="px-2 py-3">লোড পয়েন্ট</th>
              <th className="px-2 py-3">আনলোড পয়েন্ট</th>
              <th className="px-2 py-3">ভাড়া</th>
              <th className="px-2 py-3">ব্যয়</th>
              <th className="px-2 py-3">লাভ</th>
            </tr>
          </thead>
          <tbody>
            {currentTripsReport.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500 italic">
                  কোনো রিপোর্ট ডাটা পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              currentTripsReport.map((t, i) => (
                <tr key={i} className="text-gray-700">
                  <td className="px-2 py-3">{i + 1}</td>
                  <td className="px-2 py-3">{tableFormatDate(t.date)}</td>
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
              <td className="px-2 py-3" colSpan="6">মোট</td>
              <td className="px-2 py-3">{totalRent}</td>
              <td className="px-2 py-3">{totalExpense}</td>
              <td className="px-2 py-3">{totalProfit}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {currentTripsReport.length > 0 && (
        <div className="mt-10 flex justify-center">
          <div className="space-x-2 flex items-center">
            <button onClick={handlePrevPage} className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"} rounded-sm`} disabled={currentPage === 1}>
              <GrFormPrevious />
            </button>
            {[...Array(totalPages).keys()].map((number) => (
              <button key={number + 1} onClick={() => handlePageClick(number + 1)} className={`px-3 py-1 rounded-sm ${currentPage === number + 1 ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer" : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"}`}>
                {number + 1}
              </button>
            ))}
            <button onClick={handleNextPage} className={`p-2 ${currentPage === totalPages ? "bg-gray-300" : "bg-primary text-white"} rounded-sm`} disabled={currentPage === totalPages}>
              <GrFormNext />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripReport;
