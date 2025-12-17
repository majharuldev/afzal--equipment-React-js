
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEye, FaFileExcel, FaFilter, FaPen, FaPrint, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FiFilter } from "react-icons/fi";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isBefore, isEqual } from "date-fns";
import Pagination from "../../components/Shared/Pagination";
import DatePicker from "react-datepicker";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../utils/axiosConfig";
import { toNumber } from "../../hooks/toNumber";
import { tableFormatDate } from "../../components/Shared/formatDate";

const CashDispatch = () => {
  const [account, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("")
  const printRef = useRef();

  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFundTransferId, setSelectedFundTransferId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch office data
  useEffect(() => {
    api
      .get(`/fundTransfer`)
      .then((response) => {
        if (response.data.status = "Success") {
          const data = response.data.data;
          setAccount(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching account data:", error);
        setLoading(false);
      });
  }, []);

  // filtered search by date
  // filtered search by date
  const filteredAccounts = useMemo(() => {
    return account.filter((item) => {
      const itemDate = parseISO(item.date); // ensure Date object
      if (isNaN(itemDate)) return false;

      // Date filtering
      if (startDate && !endDate) {
        // single date filter
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        if (!isEqual(itemDate, start)) return false;
      }
      if (!startDate && endDate) {
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        if (!isEqual(itemDate, end)) return false;
      }
      if (startDate && endDate) {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);
        if (!(isEqual(itemDate, start) || isAfter(itemDate, start))) return false;
        if (!(isEqual(itemDate, end) || isBefore(itemDate, end))) return false;
      }

      // Text search (by name, branch, type, etc.)
      const search = searchTerm.toLowerCase();
      if (search) {
        return (
          item?.person_name?.toLowerCase().includes(search) ||
          item?.sender_branch?.toLowerCase().includes(search) ||
          item?.rec_branch?.toLowerCase().includes(search) ||
          item?.type?.toLowerCase().includes(search) ||
          item?.bank_name?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [account, startDate, endDate, searchTerm]);
  // Excel export (filtered data only)
  const exportExcel = async () => {
    try {
      if (!filteredAccounts.length) {
        toast.error("এক্সপোর্ট করার মতো কোনো তথ্য নেই!");
        return;
      }

      // Dynamically import XLSX (no need to import globally)
      const XLSX = await import("xlsx");

      // Map filtered data to a clean format for Excel
      const excelData = filteredAccounts.map((item, index) => ({
        SL: index + 1,
        Date: tableFormatDate(item.date),
        SenderBranch: item.sender_branch || "",
        ReceieverBranch: item.rec_branch || "",
        PersonName: item.person_name || "",
        Type: item.type || "",
        Amount: toNumber(item.amount) || "",
        BankName: item.bank_name || "",
      }));

      // Create worksheet & workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "FundTransfer");

      // Add total row at bottom
      const total = filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const totalRow = [
        { SL: "", Date: "", Branch: "", PersonName: "", Type: "Total", Amount: total, BankName: "" },
      ];
      XLSX.utils.sheet_add_json(ws, totalRow, { skipHeader: true, origin: -1 });

      // Auto-fit column widths
      const colWidths = Object.keys(excelData[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...excelData.map((item) => String(item[key] || "").length),
          10
        ),
      }));
      ws["!cols"] = colWidths;

      // Save file
      XLSX.writeFile(wb, "FundTransfer_Report.xlsx");
      toast.success("এক্সেল ফাইল সফলভাবে এক্সপোর্ট হয়েছে!");
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error("এক্সেল ফাইল এক্সপোর্ট ব্যর্থ হয়েছে!");
    }
  };


  // handle print
  const handlePrint = () => {
    // Use the filteredAccounts (all filtered data, not currentCash page)
    const rowsHtml = filteredAccounts.map((dt, idx) => {
      return `
      <tr style="border:1px solid #e5e7eb;">
        <td style="padding:8px; font-weight:600;">${idx + 1}</td>
        <td style="padding:8px;">${tableFormatDate(dt.date)}</td>
        <td style="padding:8px;">${dt.sender_branch ?? ""}</td>
        <td style="padding:8px;">${dt.rec_branch ?? ""}</td>
        <td style="padding:8px;">${dt.person_name ?? ""}</td>
        <td style="padding:8px;">${dt.type ?? ""}</td>
        <td style="padding:8px; text-align:right;">${dt.amount ?? ""}</td>
        <td style="padding:8px;">${dt.bank_name ?? ""}</td>
        <!-- Action column intentionally omitted -->
      </tr>
    `;
    }).join("");

    const totalFiltered = filteredAccounts.reduce((s, it) => s + toNumber(it.amount || 0), 0);

    const tableHtml = `
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr>
          <th style="padding:10px; border:1px solid #e5e7eb;">ক্রমিক</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">তারিখ</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">প্রেরক শাখা</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">গ্রহণকারী শাখা</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">ব্যক্তির নাম</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">ধরন</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">পরিমাণ</th>
          <th style="padding:10px; border:1px solid #e5e7eb;">ব্যাংকের নাম</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="7" style="padding:12px; text-align:center; color:#6b7280;">No data</td></tr>`}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="padding:10px; text-align:right; font-weight:700;">Total:</td>
          <td style="padding:10px; text-align:right; font-weight:700;">${totalFiltered}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;

    const printWindow = window.open("", "_blank", "width=1000,height=800");
    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <!-- Tailwind CDN (keeps the look similar). If you use a custom build, include that instead -->
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; color:#111827; }
          table { border-collapse: collapse; width: 100%; }
          th { background:#f3f4f6; color:black; text-transform: capitalize; }
          @media print {
            /* hide anything you don't want in print by adding .no-print class in your app */
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <h1 style="font-size:18px; margin-bottom:8px;">ফান্ড ট্রান্সফার রিপোর্ট</h1>
        ${tableHtml}
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();

    // wait a tick for resources to load then print
    setTimeout(() => {
      printWindow.print();
      // optionally close window after printing:
      // printWindow.close();
    }, 300);
  };

  // total amount calculation
  const totalAmount = useMemo(() => {
    return filteredAccounts.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredAccounts]);

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/fundTransfer/${id}`);

      // Remove driver from local list
      setAccount((prev) => prev.filter((account) => account.id !== id));
      toast.success("ফান্ড ট্রান্সফার সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedFundTransferId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCash = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  if (loading) return <p className="text-center mt-16">লোড হচ্ছে...</p>;
  return (
    <div className="p-2 overflow-x-auto">
      <div className="w-[22rem] md:w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-gray-800 text-2xl" />
            ফান্ড ট্রান্সফার
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="md:mt-0 flex gap-2">
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> ফিল্টার
              </button>
            </div>
            <Link to="/tramessy/account/create-fund-transfer-form">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> ফান্ড ট্রান্সফার
              </button>
            </Link>
          </div>
        </div>
        <div className="md:flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={exportExcel}
              className="py-1 px-5 bg-white shadow rounded hover:bg-primary hover:text-white flex items-center gap-2"
            >
              <FaFileExcel /> এক্সেল
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-1 px-4 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="তালিকা অনুসন্ধান করুন..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.7rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* filter */}
        {showFilter && (
          <div className="md:flex items-center gap-5 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5 space-y-2 lg:space-y-0">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
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
              placeholderText="DD/MM/YYYY"
              locale="en-GB"
              className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
              isClearable
            />
            <div className="w-sm ">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-primary to-primary text-white px-4 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FiFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto rounded-md">
          <table ref={printRef} className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="px-2 py-4">ক্রমিক</th>
                <th className="px-2 py-4">তারিখ</th>
                <th className="px-2 py-4">প্রেরক শাখা</th>
                <th className="px-2 py-4">গ্রহণকারী শাখা</th>
                <th className="px-2 py-4">ব্যক্তির নাম</th>
                <th className="px-2 py-4">ধরন</th>
                <th className="px-2 py-4">পরিমাণ</th>
                <th className="px-2 py-4">ব্যাংকের নাম</th>
                {/* <th className="p-2">Ref</th> */}
                <th className="p-2">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentCash.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    কোনো তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )
                : (currentCash?.map((dt, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirstItem + i + 1}</td>
                    <td className="p-2">{tableFormatDate(dt.date)}</td>
                    <td className="p-2">{dt.sender_branch}</td>
                    <td className="p-2">{dt.rec_branch}</td>
                    <td className="p-2">{dt.person_name}</td>
                    <td className="p-2">{dt.type}</td>
                    <td className="p-2">{dt.amount}</td>
                    <td className="p-2">{dt.bank_name}</td>
                    {/* <td className="p-2">{dt.ref}</td> */}
                    <td className="p-2 action_column">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/account/update-fund-transfer-form/${dt.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        {/* <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaEye className="text-[12px]" />
                      </button>*/}
                        <button
                          onClick={() => {
                            setSelectedFundTransferId(dt.id);
                            setIsOpen(true);
                          }}
                          className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                        >
                          <FaTrashAlt className="text-[12px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))
              }
            </tbody>
            {currentCash.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="6" className="p-2 text-right">মোট:</td>
                  <td className="p-2">{totalAmount}</td>
                  <td colSpan="2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {/* pagination */}
        {currentCash.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>
      {/* Delete Modal */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>
              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                আপনি কি নিশ্চিত যে এই ফান্ড ট্রান্সফারটি মুছে ফেলতে চান?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  না
                </button>
                <button
                  onClick={() => handleDelete(selectedFundTransferId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default CashDispatch;