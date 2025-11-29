
import { useEffect, useState, useRef } from "react";
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6";
import axios from "axios";
import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import api from "../../utils/axiosConfig";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { toNumber } from "../../hooks/toNumber";
import DatePicker from "react-datepicker";

const SelectCustomerLadger = ({ customer, selectedCustomerName }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const tableRef = useRef();
  const [customerList, setCustomerList] = useState([]);

  // Fetch customer list with dues
  useEffect(() => {
    api.get(`/customer`)
      .then(res => {
           // শুধু active customer গুলো নেবে
        const activeCustomers = res.data.filter(
          (item) => item.status === "Active"
        );

        setCustomerList(activeCustomers);
      })
      .catch(err => console.error(err));
  }, []);

  // Find selected customer due
  const selectedCustomer = customerList.find(
    cust => cust.customer_name === selectedCustomerName
  );
  const dueAmount = selectedCustomer ? toNumber(selectedCustomer.due) : 0;

  // filter date 
  const filteredLedger = customer.filter((entry) => {
    const entryDate = new Date(entry.bill_date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    if (start && !end) {
      return entryDate === start;
    } else if (start && end) {
      return entryDate >= start && entryDate <= end;
    } else {
      return true;
    }
  });

  // Calculate totals including opening balance
  const totals = filteredLedger.reduce(
    (acc, item) => {
      acc.rent += toNumber(item.bill_amount || 0);
      acc.rec_amount += toNumber(item.rec_amount || 0);
      return acc;
    },
    { rent: 0, rec_amount: 0 }
  );
  // Now calculate due from total trip - advance - pay_amount
  totals.due = totals.rent - totals.rec_amount;

  const grandDue = totals.due + dueAmount;

  // Pagination logic
  // const pageCount = Math.ceil(filteredLedger.length / itemsPerPage);
  // const offset = currentPage * itemsPerPage;
  // const currentItems = filteredLedger.slice(offset, offset + itemsPerPage);

  // const handlePageClick = ({ selected }) => {
  //   setCurrentPage(selected);
  // };

  const totalRent = filteredLedger.reduce(
    (sum, entry) => sum + toNumber(entry.rec_amount || 0),
    0
  );

  const customerName = filteredLedger[0]?.customer_name || "All Customers";

  //  Excel Export (Filtered Data)
  const exportToExcel = () => {
    const rows = filteredLedger.map((dt, index) => {
        const bill = toNumber(dt.bill_amount || 0);
    const rec = toNumber(dt.rec_amount || 0);

    cumulative += bill;
    cumulative -= rec;
      return {
      SL: index + 1,
      Date: tableFormatDate(dt.working_date),
      Customer: dt.customer_name,
      Load: dt.load_point || "--",
      Unload: dt.unload_point || "--",
      Vehicle: dt.vehicle_no || "--",
      Driver: dt.driver_name || "--",
      // "Trip Rent": toNumber(dt.bill_amount || 0),
      // Demurage: toNumber(dt.d_total || 0),
      "Bill Amount": toNumber(dt.bill_amount || 0),
      "Received Amount": toNumber(dt.rec_amount || 0),
      Balance: cumulative
  }});
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Ledger");
    XLSX.writeFile(workbook, `${customerName}-Ledger.xlsx`);
  };

  // pdf
  const exportToPDF = () => {
    const docDefinition = {
      content: [
        { text: `${customerName} Ledger`, style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "*", "auto", "auto", "auto", "auto"],
            body: [
              [
                "SL.",
                "Date",
                "Customer",
                "Vehicle No",
                "Loading Point",
                "Unloading Point",
                "Total Rent",
              ],
              ...filteredLedger.map((dt, index) => [
                index + 1,
                dt.bill_date,
                dt.customer_name,
                dt.vehicle_no,
                dt.load_point,
                dt.unload_point,
                dt.body_cost,
              ]),
              [
                { text: "Total", colSpan: 6, alignment: "right" },
                {}, {}, {}, {}, {},
                totalRent,
              ],
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };
    pdfMake.createPdf(docDefinition).download(`${customerName}-Ledger.pdf`);
  };

  // print
    const handlePrint = () => {
    const printContent = tableRef.current.innerHTML;
    const printWindow = window.open("", "", "width=900,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>${customerName} Ledger</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 5px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2 style="text-align:center;">${customerName} - Customer Ledger</h2>
          <h4 style="text-align:center;">Date Range: ${startDate ? tableFormatDate(startDate) : "All"} - ${endDate ? tableFormatDate(endDate) : "All"}</h4>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="md:p-4">
      <div className="w-xs md:w-full overflow-x-auto">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B]">
            {filteredLedger.length > 0
              ? filteredLedger[0].customer_name
              : "All Customers"} Ledger
          </h1>
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-green-200 transition-all duration-300"
            >
              <FaFileExcel /> এক্সেল
            </button>
            {/* <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-amber-200 transition-all duration-300"
            >
              <FaFilePdf /> পিডিএফ
            </button> */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 bg-gray-50 hover:bg-primary text-primary hover:text-white rounded-md shadow-md shadow-blue-200 transition-all duration-300"
            >
              <FaPrint /> প্রিন্ট
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

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 mb-5">
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
            <div className="w-xs ">
                              <button
                                onClick={() => {
                                  setStartDate("");
                                  setEndDate(""); 
                                  setShowFilter(false);
                                }}
                                className="bg-gradient-to-r from-primary to-primary text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                              >
                                <FaFilter />
                                মুছে ফেলুন
                              </button>
                            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center mt-16">Loading...</p>
        ) : (
          <div ref={tableRef}>
            <table className="min-w-full text-sm text-left text-gray-900">
              <thead className="bg-gray-100 text-gray-800 font-bold">
                <tr className="font-bold bg-gray-50">
                  <td colSpan={8} className="border border-black px-2 py-1 text-right">
                    মোট
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.rent}
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.rec_amount}
                  </td>
                  <td className="border border-black px-2 py-1 text-right">
                    ৳{totals.due}
                  </td>
                </tr>
                <tr>
                  <th className="border px-2 py-1">নং.</th>
                  <th className="border px-2 py-1">তারিখ</th>
                  <th className="border px-2 py-1">গ্রাহক</th>
                  <th className="border px-2 py-1">কাজের জায়গা</th>
                  <th className="border px-2 py-1">লোড</th>
                  <th className="border px-2 py-1">আনলোড</th>
                  <th className="border px-2 py-1">ইকুইপমেন্ট</th>
                  <th className="border px-2 py-1">অপারেটর/ড্রাইভার</th>
                  <th className="border px-2 py-1">বিল অ্যামাউন্ট</th>
                  <th className="border px-2 py-1">রিসিভড অ্যামাউন্ট</th>
                  <th className="border border-gray-700 px-2 py-1">
                    {selectedCustomerName && (
                      <p className="text-sm font-medium text-gray-800">
                        শুরুর ব্যালেন্স: ৳{dueAmount}
                      </p>
                    )}
                    অবশিষ্ট ব্যালেন্স
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let cumulativeDue = dueAmount; // Opening balance
                  return filteredLedger.map((item, idx) => {
                    const billAmount = toNumber(item.bill_amount || 0);
                    const receivedAmount = toNumber(item.rec_amount || 0);

                    cumulativeDue += billAmount;
                    cumulativeDue -= receivedAmount;

                    return (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{idx + 1}</td>
                        <td className="border px-2 py-1">{tableFormatDate(item.bill_date)}</td>
                        <td className="border px-2 py-1">{item.customer_name}</td>
                        <td className="border px-2 py-1">
                          {item.working_area || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.load_point || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.unload_point || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.vehicle_no || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {item.driver_name || <span className="flex justify-center items-center">--</span>}
                        </td>
                        <td className="border px-2 py-1">
                          {billAmount ? billAmount : "--"}
                        </td>
                        <td className="border px-2 py-1">
                          {receivedAmount ? receivedAmount : "--"}
                        </td>
                        
                         <td className={`border border-gray-700 px-2 py-1 ${cumulativeDue < 0 ? 'text-red-600' : ''}`}>
                      {cumulativeDue < 0 ? `(${Math.abs(cumulativeDue)})` : cumulativeDue}
                    </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>

              <tfoot>

                {/* <tr className="font-bold bg-blue-100">
    <td colSpan={9} className="border border-black px-2 py-1 text-right">
      Final Due (Opening Due +)
    </td>
    <td className="border border-black px-2 py-1 text-right text-black">
      ৳{grandDue?}
    </td>
  </tr> */}
              </tfoot>

            </table>

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
                  previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                  breakClassName={"px-3 py-1"}
                  activeClassName={"bg-primary text-white border-primary"}
                  forcePage={currentPage}
                />
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectCustomerLadger;