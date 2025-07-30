
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

const OfficeLedger = () => {
  const [branch, setbranch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBranch, setselectedBranch] = useState("Head Office");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/branch/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setbranch(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  const [openingBalance, setOpeningBalance] = useState(0);
  let currentBalance = openingBalance;
  
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          const headOffice = data.find(
            (item) => item.branch_name === "Head Office"
          );
          if (headOffice) {
            setOpeningBalance(parseFloat(headOffice.opening_balance) || 0);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching office list:", error);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  // Filtered data based on selected customer
  const filteredBranch = branch.filter((item) => {
    const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    if (start && end) {
      return itemDate >= start && itemDate <= end;
    } else if (start) {
      return itemDate === start;
    } else if (end) {
      return itemDate === end;
    }
    return true;
  });

  // Pagination logic
  // const pageCount = Math.ceil(filteredBranch.length / itemsPerPage);
  // const offset = currentPage * itemsPerPage;
  // const currentItems = filteredBranch.slice(offset, offset + itemsPerPage);

  // const handlePageClick = ({ selected }) => {
  //   setCurrentPage(selected);
  // };

  // Calculate running balance for paginated items
  const calculateRunningBalance = () => {
    let runningBalance = openingBalance;
    // const allItems = filteredBranch.slice(0, offset + currentItems.length);
    
    return filteredBranch.reduce((balance, item, idx) => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Office Ledger");
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

  // print
  const handlePrint = () => {
    const printContents = document.getElementById("ledger-table").innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <main className="overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            OFFICE ledger : {selectedBranch}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
              <button
                  onClick={() => setShowFilter((prev) => !prev)}
                  className="text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
                >
                <FaFilter /> Filter
              </button>
          </div>
        </div>

        {/* Export */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
            <button
              onClick={exportToPdf}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 mb-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {startDate && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setCurrentPage(0);
                  }}
                  className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900"
                  aria-label="Clear start date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  // setCurrentPage(0);
                }}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {endDate && (
                <button
                  onClick={() => {
                    setEndDate("");
                    // setCurrentPage(0);
                  }}
                  className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900"
                  aria-label="Clear end date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div id="ledger-table" className="w-full mt-5 overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left">            
            <thead className="text-black capitalize font-bold">
              <tr className="bg-gray-100 font-bold text-black">
                <td colSpan="7" className="text-right border border-gray-700 px-2 py-2">
                  Closing Balance:
                </td>
                <td className="border border-gray-700 px-2 py-2">
                  {calculateRunningBalance() < 0 
                    ? `(${Math.abs(calculateRunningBalance())})` 
                    : calculateRunningBalance()}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Particulars</th>
                <th className="border border-gray-700 px-2 py-1">Mode</th>
                <th className="border border-gray-700 px-2 py-1">Destination</th>
                <th className="border border-gray-700 px-2 py-1">CashIn</th>
                <th className="border border-gray-700 px-2 py-1">CashOut</th>
                <th className="border border-gray-700 py-1 text-center">
                  <p className="border-b border-tl-none border-tr-none">OpeningBalance {openingBalance}</p>Balance
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
                    <td className="border border-gray-700 px-2 py-1 font-bold">
                      {/* {index + 1 + offset}. */}
                      {index}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.date}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.remarks || "--"}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.mode || "--"}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.unload_point || "--"}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.cash_in}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      {dt.cash_out}
                    </td>
                    <td className="border border-gray-700 px-2 py-1">
                      <span>
                        {currentBalance < 0
                          ? `${Math.abs(currentBalance)}`
                          : currentBalance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* {pageCount > 1 && (
          <div className="mt-4 flex justify-center">
            <ReactPaginate
              previousLabel={"Previous"}
              nextLabel={"Next"}
              breakLabel={"..."}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageClick}
              containerClassName={"flex items-center gap-1"}
              pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
              previousClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
              nextClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
              breakClassName={"px-3 py-1"}
              activeClassName={"bg-primary text-white border-primary"}
              forcePage={currentPage}
            />
          </div>
        )} */}
      </div>
    </main>
  );
};

export default OfficeLedger;