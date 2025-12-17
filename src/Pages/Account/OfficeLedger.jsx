
import { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaFilter } from "react-icons/fa6";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactPaginate from "react-paginate";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import api from "../../utils/axiosConfig";

const OfficeLedger = () => {
  const [branch, setbranch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [officeList, setOfficeList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    api
      .get(`/OfficeLedger`)
      .then((response) => {
        if (response.data.success) {
          setbranch(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("ড্রাইভার তথ্য লোডে ত্রুটি:", error);
        setLoading(false);
      });
  }, []);

  const [openingBalance, setOpeningBalance] = useState(0);
  let currentBalance = openingBalance;
   // Fetch office list with opening balances
    useEffect(() => {
      api.get(`/office`)
        .then((response) => {
          if (response.data.success) {
            const data = response.data.data;
            setOfficeList(data);
  
            // Set default branch if available
            if (data.length > 0 && !selectedBranch) {
              setSelectedBranch(data[0].branch_name);
              setOpeningBalance(parseFloat(data[0].opening_balance) || 0);
              // setCurrentBalance(parseFloat(data[0].opening_balance) || 0);
            }
          }
        })
        .catch((error) => {
          console.error("অফিস তালিকা লোডে ত্রুটি:", error);
        });
    }, []);

  if (loading) return <p className="text-center mt-16">ডেটা লোড হচ্ছে...</p>;

  // ফিল্টার করা ডেটা
  const filteredBranch = branch.filter((item) => {
    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;
  
  // তারিখ ফিল্টার
  let dateMatch = true;
  if (start && end) dateMatch = itemDate >= start && itemDate <= end;
  else if (start) dateMatch = itemDate === start;
  else if (end) dateMatch = itemDate === end;
    // ব্রাঞ্চ ফিল্টার
  let branchMatch = selectedBranch ? item.branch_name === selectedBranch : true;
    return dateMatch && branchMatch;
  })

  const calculateRunningBalance = () => {
    return filteredBranch.reduce((balance, item) => {
      const expense = parseFloat(item.trip_expense) || 0;
      const cashOut = parseFloat(item.cash_out) || 0;
      const cashIn = parseFloat(item.cash_in) || 0;
      return balance + cashIn - cashOut - expense;
    }, openingBalance);
  };

  // excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBranch);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "অফিস লেজার");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "office-ledger.xlsx");
  };

  // pdf
  const exportToPdf = () => {
    const input = document.getElementById("ledger-table");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("office-ledger.pdf");
    });
  };

  const handlePrint = () => {
    const printContents = document.getElementById("ledger-table").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <main className="">
      <Toaster />
      <div className=" md:w-full overflow-visible mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* হেডার */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            অফিস লেজার : {selectedBranch}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {/* এক্সপোর্ট বাটন */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel /> এক্সেল
            </button>
            <button
              onClick={exportToPdf}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf /> পিডিএফ
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint /> প্রিন্ট
            </button>
          </div>
        </div>

        {/* ফিল্টার সেকশন */}
        {showFilter && (
          <div className="lg:flex gap-4 border border-gray-300 rounded-md p-5 mb-5 space-y-2 lg:spavce-y-0">
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
            <div className="relative w-full">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                {officeList.map((office, i) => (
                  <option key={i} value={office.branch_name}>
                    {office.branch_name}
                  </option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[10px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>

            <div className="w-md mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setShowFilter(false)
                  setStartDate("")
                  setEndDate("")
                }
                }
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {/* টেবিল */}
        <div id="ledger-table" className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr className="bg-gray-100 font-bold text-black">
                <td colSpan="7" className="text-right border border-gray-700 px-2 py-2">
                  ক্লোজিং ব্যালেন্স:
                </td>
                <td className={`border border-gray-700 px-2 py-2 ${calculateRunningBalance() < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {calculateRunningBalance() < 0
                    ? `(${Math.abs(calculateRunningBalance())})`
                    : calculateRunningBalance()}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">ক্রম</th>
                <th className="border border-gray-700 px-2 py-1">তারিখ</th>
                <th className="border border-gray-700 px-2 py-1">বিবরণ</th>
                <th className="border border-gray-700 px-2 py-1">পদ্ধতি</th>
                <th className="border border-gray-700 px-2 py-1">গন্তব্য</th>
                <th className="border border-gray-700 px-2 py-1">ক্যাশ ইন</th>
                <th className="border border-gray-700 px-2 py-1">ক্যাশ আউট</th>
                <th className="border border-gray-700 px-2 py-1 text-center">
                  <p className="border-b border-tl-none border-tr-none">প্রারম্ভিক ব্যালেন্স {openingBalance}</p>ব্যালেন্স
                </th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {filteredBranch?.map((dt, index) => {
                const expense = parseFloat(dt.trip_expense) || 0;
                const cashOut = parseFloat(dt.cash_out) || 0;
                const cashIn = parseFloat(dt.cash_in) || 0;
                currentBalance += cashIn - cashOut - expense;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 px-2 py-1 font-bold">{index}</td>
                    <td className="border border-gray-700 px-2 py-1">{tableFormatDate(dt.date)}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.remarks || "--"}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.mode || "--"}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.unload_point || "--"}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.cash_in}</td>
                    <td className="border border-gray-700 px-2 py-1">{dt.cash_out}</td>
                    <td className={`border border-gray-700 px-2 py-1`}>
                      {currentBalance < 0 ? `(${Math.abs(currentBalance)})` : currentBalance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default OfficeLedger;
