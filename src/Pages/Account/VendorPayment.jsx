import axios from "axios";
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { Link } from "react-router-dom";
import { tableFormatDate } from "../../components/Shared/formatDate";
import api from "../../utils/axiosConfig";
import { FaFileExcel, FaPrint } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";

const VendorPayment = () => {
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // Fetch payment data
  useEffect(() => {
    api
      .get(`/vendor-payment`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  // Filter data by search
  const filteredPayments = payment.filter((item) => {
    const searchableText = Object.values(item)
      .map((v) => (v ? String(v).toLowerCase() : ""))
      .join(" ");
    return searchableText.includes(searchTerm.toLowerCase());
  });


    // Excel Export Function
const exportToExcel = () => {
  if (!filteredPayments.length) {
    toast.error("No data available to export!");
    return;
  }

  // Prepare export data
  const exportData = filteredPayments.map((dt, index) => ({
    SL: index + 1,
    Date: dt.date ? tableFormatDate(dt.date) : "",
    Vendor_Name: dt.vendor_name || "",
    Bill_Ref: dt.bill_ref || "",
    Amount: Number(dt.amount || 0),
    Cash_Type: dt.cash_type || "",
    Status: dt.status || "",
  }));

  // Add total at the end
  const totalAmount = filteredPayments.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  exportData.push({
    SL: "",
    Date: "",
    Vendor_Name: "",
    Bill_Ref: "Total:",
    Amount: totalAmount,
    Cash_Type: "",
    Status: "",
  });

  // Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor Payment Report");

  // Set column widths for readability
  const colWidths = [
    { wch: 5 },  // SL
    { wch: 12 }, // Date
    { wch: 20 }, // Vendor Name
    { wch: 15 }, // BillRef
    { wch: 12 }, // Amount
    { wch: 12 }, // Cash Type
    { wch: 10 }, // Status
  ];
  worksheet["!cols"] = colWidths;

  // Export file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Vendor_Payment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);

  toast.success("Excel file exported successfully!");
};

  // handle print
  const handlePrint = () => {
    const WindowPrint = window.open("", "", "width=900,height=650");
    const printTableRows = filteredPayments.map(
      (dt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${tableFormatDate(dt.date)}</td>
        <td>${dt.vendor_name}</td>
        <td>${dt.bill_ref}</td>
        <td>${dt.amount}</td>
        <td>${dt.cash_type}</td>
        <td>${dt.status}</td>
      </tr>
    `
    ).join("");

    const totalRow = `
    <tr style="font-weight:bold; background:#f9f9f9;">
      <td colspan="4" style="text-align:right;">Total:</td>
      <td>${totalAmount}</td>
      <td colspan="2"></td>
    </tr>
  `;

    WindowPrint.document.write(`
    <html>
      <head>
        <title>Vendor Payment Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 12px; }
          th { background: #f0f0f0; }
          @media print {
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h2>Vendor Payment Report</h2>
        <table>
          <thead>
            <tr>
              <th>SL.</th>
              <th>Date</th>
              <th>Vendor Name</th>
              <th>BillRef</th>
              <th>Amount</th>
              <th>Cash Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${printTableRows}
          </tbody>
          <tfoot>
            ${totalRow}
          </tfoot>
        </table>
      </body>
    </html>
  `);
    WindowPrint.document.close();
    WindowPrint.focus();
    setTimeout(() => {
      WindowPrint.print();
      WindowPrint.close();
    }, 500);
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/vendor-payment/${id}`);

      // Remove driver from local list
      setPayment((prev) => prev.filter((account) => account.id !== id));
      toast.success("পেমেন্ট সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };



  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayment = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  if (loading) return <p className="text-center mt-16">Loading payment...</p>;
  return (
    <div className=" ">
      <Toaster/>
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2 ">
            <MdOutlineAirplaneTicket className="text-black text-2xl" />
            ভেন্ডর পেমেন্ট
          </h2>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/account/VendorPaymentForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> যোগ
              </button>
            </Link>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-1 px-5 hover:bg-primary bg-white shadow hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
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
              placeholder="Search list..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-8 top-[5.8rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
              <tr>
                <th className="px-2 py-3">SL.</th>
                <th className="px-2 py-3">তারিখ</th>
                <th className="px-2 py-3"> ভেন্ডর  নাম</th>
                <th className="px-2 py-3">বিল রেফারেন্স</th>
                <th className="px-2 py-3">পরিমাণ</th>
                <th className="px-2 py-3">ক্যাশের ধরন</th>
                {/* <th className="px-2 py-3">Created By</th> */}
                <th className="px-2 py-3">অবস্থা</th>
                <th className="px-2 py-3">কার্যকলাপ</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentPayment.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-10 text-gray-500 italic"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      No vehicle data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentPayment?.map((dt, index) => (
                  <tr className="hover:bg-gray-50 transition-all border border-gray-200">
                    <td className="p-2 font-bold">{index + 1}.</td>
                    <td className="p-2">{tableFormatDate(dt.date)}</td>
                    <td className="p-2">{dt.vendor_name}</td>
                    <td className="p-2">{dt.bill_ref}</td>
                    <td className="p-2">{dt.amount}</td>
                    <td className="p-2">{dt.cash_type}</td>
                    {/* <td className="p-2">{dt.created_by}</td> */}
                    <td className="p-2">{dt.status}</td>
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link
                          to={`/tramessy/account/VendorPaymentForm/edit/${dt.id}`}
                        >
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                        onClick={() => {
                              setSelectedPaymentId(dt.id);
                              setIsOpen(true);
                            }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentPayment.length === 0 ? (
          ""
        ) : (
          <div className="mt-10 flex justify-center">
            <div className="space-x-2 flex items-center">
              <button
                onClick={handlePrevPage}
                className={`p-2 ${
                  currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                } rounded-sm`}
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
                className={`p-2 ${
                  currentPage === totalPages
                    ? "bg-gray-300"
                    : "bg-primary text-white"
                } rounded-sm`}
                disabled={currentPage === totalPages}
              >
                <GrFormNext />
              </button>
            </div>
          </div>
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
                Are you sure you want to delete this Customer?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedPaymentId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorPayment;
