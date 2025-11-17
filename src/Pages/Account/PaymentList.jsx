import axios from "axios";
import { useEffect, useState } from "react";
import { FaFilter, FaUserSecret } from "react-icons/fa6";
import { InputField } from "../../components/Form/FormFields";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../../components/Button/BtnSubmit";
import useRefId from "../../hooks/useRef";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { Button } from "antd";
import DatePicker from "react-datepicker";
import api from "../../utils/axiosConfig";

const PaymentList = () => {
  const generateRefId = useRefId();
  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // search
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get(`/payments`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching payment data:", error);
        setLoading(false);
      });
  }, []);
  // Filter by date
  const filteredPayment = payment.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return tripDate >= start && tripDate <= end;
    } else if (start) {
      return tripDate.toDateString() === start.toDateString();
    } else {
      return true;
    }
  });
  // search
  const filteredPaymentList = filteredPayment.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return (
      dt.date?.toLowerCase().includes(term) ||
      dt.item_name?.toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.purchase_id?.toLowerCase().includes(term) ||
      dt.category?.toLowerCase().includes(term) ||
      dt.quantity?.toLowerCase().includes(term) ||
      dt.unit_price?.toLowerCase().includes(term) ||
      dt.total?.toLowerCase().includes(term) ||
      dt.due_amount?.toLowerCase().includes(term) ||
      dt.pay_amount?.toLowerCase().includes(term) ||
      dt.branch_name?.toLowerCase().includes(term)
    );
  });

  // excel
  const exportToExcel = () => {
    const exportData = filteredPaymentList.map((dt, index) => {
      const item = dt.purchase?.items?.[0];
      const total = parseFloat(dt.total_amount) || 0;
      const paid = parseFloat(dt.pay_amount) || 0;
      const due = total - paid;
      
      let status = "Unpaid";
      if (due === 0) {
        status = "Paid";
      } else if (paid > 0 && due > 0) {
        status = "Partial";
      }

      return {
        "SL": index + 1,
        "Date": dt.date,
        "Supplier Name": dt.supplier_name,
        "Category": dt.category,
        "Item name": item?.item_name || "-",
        "Quantity": item?.quantity || "-",
        "Rate": item?.unit_price || "-",
        "Service charge": dt.purchase?.service_charge || 0,
        "Total Amount": dt?.total_amount || "-",
        "Pay Amount": dt.pay_amount,
        "Due": due,
        "Status": dt.status
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "পেমেন্ট রিপোর্ট");
    
    // কলামের width অটো-সেট করার জন্য
    const maxWidth = exportData.reduce((widths, row) => {
      Object.keys(row).forEach((key, idx) => {
        const length = row[key]?.toString().length || 0;
        if (!widths[idx] || length > widths[idx]) {
          widths[idx] = length;
        }
      });
      return widths;
    }, []);
    
    worksheet['!cols'] = maxWidth.map(w => ({ width: w + 2 }));
    
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "পেমেন্ট_রিপোর্ট.xlsx");
  };


  // handle print
  // প্রিন্ট ফাংশন - টেবিলের মতোই ফরম্যাট
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    const tableRows = filteredPaymentList.map((dt, index) => {
      const item = dt.purchase?.items?.[0];
      const total = parseFloat(dt.total_amount) || 0;
      const paid = parseFloat(dt.pay_amount) || 0;
      const due = total - paid;
      
      let status = "Unpaid";
      if (due === 0) {
        status = "Paid";
      } else if (paid > 0 && due > 0) {
        status = "Partial";
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${dt.date}</td>
          <td>${dt.supplier_name}</td>
          <td>${dt.category}</td>
          <td>${item?.item_name || "-"}</td>
          <td>${item?.quantity || "-"}</td>
          <td>${item?.unit_price || "-"}</td>
          <td>${dt.purchase?.service_charge || 0}</td>
          <td>${dt?.total_amount || "-"}</td>
          <td>${dt.pay_amount}</td>
          <td>${due}</td>
          <td>${dt.status}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
    <html>
      <head>
        <title>পেমেন্ট রিপোর্ট</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            direction: ltr;
          }
          h3 { 
            text-align: center; 
            margin-bottom: 20px;
            color: #11375B;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: left;
          }
          th {
            background-color: #11375B;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body { margin: 0; }
            table { font-size: 9px; }
          }
            thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>পেমেন্ট রিপোর্ট</h3>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক নং</th>
              <th>তারিখ</th>
              <th>সাপ্লায়ার নাম</th>
              <th>ক্যাটাগরি</th>
              <th>পণ্যের নাম</th>
              <th>পরিমাণ</th>
              <th>দর</th>
              <th>সার্ভিস চার্জ</th>
              <th>মোট পরিমাণ</th>
              <th>পেমেন্ট</th>
              <th>বাকি</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: center; font-size: 12px;">
          মোট রেকর্ড: ${filteredPaymentList.length}
        </div>
      </body>
    </html>
  `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  };

   // onsubmit
  const onSubmit = async (data) => {
    // const refId = generateRefId();

    // Validation
    if (!data.pay_amount || isNaN(data.pay_amount)) {
      toast.error("Invalid payment amount", { position: "top-right" });
      return;
    }

    if (data.pay_amount > data.due_amount) {
      toast.error("The payment amount cannot be more than the due amount", {
        position: "top-right",
      });
      return;
    }

    // Calculate updated amount
    const previousAmount = parseFloat(selectedPayment.pay_amount) || 0;
    const newAmount = parseFloat(data.pay_amount);
    const updatedAmount = previousAmount + newAmount;

    try {
      // Prepare the complete payment payload
      const paymentPayload = {
        supplier_name: selectedPayment.supplier_name,
        // category: selectedPayment.category,
        // item_name: selectedPayment.item_name,
        // quantity: selectedPayment.quantity,
        // unit_price: selectedPayment.unit_price,
        total_amount: selectedPayment.total_amount,
        pay_amount: updatedAmount,
        remarks: data.note || "Partial payment",
        // driver_name: selectedPayment.driver_name,
        branch_name: selectedPayment.branch_name,
        // vehicle_no: selectedPayment.vehicle_no,
        created_by: selectedPayment.created_by || "admin"
      };

      // 1. Update Payment
      const response = await api.put(
        `/payments/${selectedPayment.id}`,
        paymentPayload
      );

      if (response.data.success) {

        // Update UI state
        setPayment(prevList =>
          prevList.map(item =>
            item.id === selectedPayment.id
              ? {
                ...item,
                pay_amount: updatedAmount,
                due_amount: parseFloat(item.total_amount) - updatedAmount,
                status:
                  updatedAmount === 0
                    ? "Unpaid"
                    : updatedAmount >= parseFloat(item.total_amount)
                      ? "Paid"
                      : "Partial"
              }
              : item
          )
        );

        // Refresh payment list
        const refreshResponse = await api.get(
          `/payments`
        );
        if (refreshResponse.data.status === "Success") {
          setPayment(refreshResponse.data.data);
        }

        toast.success("Payment updated successfully!", {
          position: "top-right",
        });
        setShowModal(false);
        reset();
      } else {
        toast.error(response.data.message || "Failed to update payment");
      }
    } catch (error) {
      console.error("Payment update error:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "An error occurred while updating payment"
      );
    }
  };

  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPaymentList.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(currentPayments.length / itemsPerPage);
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

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  return (
    <div className=" ">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 ">
            <FaUserSecret className="text-gray-800 text-2xl" />
            পেমেন্ট
          </h2>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button> */}

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">সার্চ: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search list..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {showFilter && (
          <div className="md:flex gap-6 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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

        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-800 capitalize text-xs ">
              <tr className="">
                <th className="px-1 py-2">ক্রমিক নং</th>
                <th className="px-1 py-2">তারিখ</th>
                <th className="px-1 py-2">সাপ্লায়ার নাম</th>
                <th className="px-1 py-2">ক্যাটাগরি</th>
                <th className="px-1 py-2">পণ্যের নাম</th>
                <th className="px-1 py-2">পরিমাণ</th>
                <th className="px-1 py-2">দর</th>
                <th className="px-1 py-2">সার্ভিস চার্জ</th>
                <th className="px-1 py-2">মোট পরিমাণ</th>
                <th className="px-1 py-2">পেমেন্ট অ্যামাউন্ট</th>
                <th className="px-1 py-2">বাকি </th>
                <th className="px-1 py-2">স্ট্যাটাস</th>
                <th className="px-1 py-2">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">

              {currentPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
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
                currentPayments.map((dt, index) => {
                  const item = dt.purchase?.items?.[0];

                  return (
                    <tr key={dt.id}>
                      <td>{index + 1}</td>
                      <td>{dt.date}</td>
                      <td>{dt.supplier_name}</td>
                      <td>{dt.category}</td>
                      <td>{item?.item_name || "-"}</td>
                      <td>{item?.quantity || "-"}</td>
                      <td>{item?.unit_price || "-"}</td>
                      <td>{dt.purchase?.service_charge || 0}</td>
                      <td>{dt?.total_amount || "-"}</td>
                      <td>{dt.pay_amount}</td>
                      <td>{dt.due_amount}</td>
                      <td className="px-1 py-2">
                      {(() => {
                        const total = parseFloat(dt.total_amount) || 0;
                        const paid = parseFloat(dt.pay_amount) || 0;
                        const due = total - paid;

                        let status = "Unpaid";
                        if (due === 0) {
                          status = "Paid";
                        } else if (paid > 0 && due > 0) {
                          status = "Partial";
                        }

                        return (
                          <select
                            value={status}
                            disabled
                            className="appearance-none text-xs font-semibold rounded-md px-2 py-1 border border-gray-300 bg-gray-100 text-gray-700"
                          >
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partial">Partial</option>
                          </select>
                        );
                      })()}
                    </td>
                    <td className="px-1 action_column">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (
                              parseFloat(dt.total_amount) -
                              parseFloat(dt.pay_amount) <=
                              0
                            )
                              return;
                            setSelectedPayment(dt);
                            setShowModal(true);
                            reset({
                              due_amount: dt.total_amount - dt.pay_amount,
                              pay_amount: dt.pay_amount,
                              // note: dt.item_name,
                            });
                          }}
                          className={`px-1 py-1 rounded shadow-md transition-all cursor-pointer ${parseFloat(dt.total_amount) -
                              parseFloat(dt.pay_amount) >
                              0
                              ? "text-primary hover:bg-primary hover:text-white"
                              : "text-green-700 bg-gray-200 cursor-not-allowed"
                            }`}
                          disabled={
                            parseFloat(dt.total_amount) -
                            parseFloat(dt.pay_amount) <=
                            0
                          }
                        >
                          {parseFloat(dt.total_amount) -
                            parseFloat(dt.pay_amount) >
                            0
                            ? "Pay Now"
                            : "Complete"}
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentPayments.length === 0 ? (
          ""
        ) : (
          <div className="mt-10 flex justify-center">
            <div className="space-x-2 flex items-center">
              <button
                onClick={handlePrevPage}
                className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                  } rounded-sm`}
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
                className={`p-2 ${currentPage === totalPages
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

      {/* modal start */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50  flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-[#11375B]">
              Update Payment
            </h2>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <InputField
                  name="due_amount"
                  label="Due Amount"
                  required
                  readOnly
                />
                <InputField name="pay_amount" label="Pay Amount" required />
                <InputField name="note" label="Note" />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 px-4 rounded mt-4 hover:bg-primary hover:text-white cursor-pointer transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <BtnSubmit>Submit</BtnSubmit>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
      {/* modal end */}
    </div>
  );
};

export default PaymentList;
