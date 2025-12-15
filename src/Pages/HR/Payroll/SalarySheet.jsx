
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTruck } from "react-icons/fa"
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../../utils/axiosConfig';
import Pagination from '../../../components/Shared/Pagination';
import { toNumber } from '../../../hooks/toNumber';
import { BiPrinter } from 'react-icons/bi';
import PaySlipPrint from '../HRM/PaySlipPrint';
import { useParams } from 'react-router-dom';
const SalarySheet = () => {
  const { id } = useParams();
  const [salarySheetApiData, setSalarySheetApiData] = useState([])
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [sheetMonth, setSheetMonth] = useState("");
  const printRef = useRef();
  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emp, sheet] = await Promise.all([
          api.get("/employee"),
          api.get(`/salarySheet/${id}`),
        ]);

        const activeEmp = emp.data.data.filter(
          (e) => e.status?.toLowerCase() === "active"
        );

        setEmployees(activeEmp);
        setSalarySheetApiData(sheet.data.items);
        setSheetMonth(sheet.data.generate_month);
      } catch (err) {
        toast.error("Failed to load data");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(salarySheetApiData, "salary")

  // month yeayr options
  const currentYear = new Date().getFullYear();
  const monthsName = [
    { num: "01", name: "January" },
    { num: "02", name: "February" },
    { num: "03", name: "March" },
    { num: "04", name: "April" },
    { num: "05", name: "May" },
    { num: "06", name: "Jun" },
    { num: "07", name: "July" },
    { num: "08", name: "August" },
    { num: "09", name: "September" },
    { num: "10", name: "October" },
    { num: "11", name: "November" },
    { num: "12", name: "December" },
  ];
  const monthYearOptions = [];

  for (let y = currentYear; y <= currentYear + 10; y++) {
    monthsName.forEach((m) => {
      monthYearOptions.push({
        value: `${y}-${m.num}`,
        label: `${y}-${m.name}`
      });
    });
  }
  const months = [...new Set(salarySheetApiData.map((d) => d.working_day))];

  const getEmployee = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      map[emp.id] = emp.employee_name;
    });
    return map;
  }, [employees]);

  const filteredData = useMemo(() => {
    return salarySheetApiData.filter((item) => {
      const empName =
        getEmployee[item.employee_id]?.toLowerCase() || "";

      // const matchSearch = searchTerm
      //   ? empName.includes(searchTerm.toLowerCase())
      //   : true;

      const matchEmployee = selectedEmployee
        ? String(item.employee_id) === String(selectedEmployee)
        : true;

      const matchMonth = selectedMonth
        ? item.month === selectedMonth || true
        : true;

      return matchEmployee && matchMonth;
    });
  }, [salarySheetApiData, selectedEmployee, selectedMonth, getEmployee]);

  // payslip print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Salary Sheet",
    onAfterPrint: () => {
      console.log("[v0] Print completed, clearing selected slip")
      setSelectedSlip(null)
    },
  })

  const handlePrintClick = (item) => {
    console.log("[v0] Print button clicked for:", item.name)
    const slipData = {
      ...item,
      name: getEmployee[item.employee_id], //  employee name
      monthYear: sheetMonth //  month/year
    };

    setSelectedSlip(slipData)
    // Give React time to render the component before printing
    setTimeout(() => {
      if (printRef.current) {
        console.log("[v0] Triggering print")
        handlePrint()
      } else {
        console.error("[v0] Print ref is null")
      }
    }, 100)
  }

  // net pay
  const calculateNetPay = (row) => {
    const earnings = toNumber(row.e_total || 0);
    const deduction = toNumber(row.d_total || 0);
    return earnings - deduction;
  };

  // confirm status change modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const openConfirmModal = (id) => {
    setConfirmId(id);
    setIsConfirmModalOpen(true);
  };

  // const handleConfirmStatus = async () => {
  //   try {
  //     await api.put(`/salarySheet/salary-item/${confirmId}`, { status: "Paid", });

  //     setSalarySheetApiData((prev) =>
  //       prev.map((item) =>
  //         item.id === confirmId ? { ...item, status: "Paid" } : item
  //       )
  //     );

  //     toast.success("Status updated to Paid");
  //   } catch (err) {
  //     toast.error("Failed to update status");
  //   } finally {
  //     setIsConfirmModalOpen(false);
  //     setConfirmId(null);
  //   }
  // };



  const handleConfirmStatus = async () => {
    try {
      // Find the salary item to update
      const itemToUpdate = salarySheetApiData.find(item => item.id === confirmId);

      if (!itemToUpdate) {
        toast.error("Salary item not found");
        return;
      }

      // Prepare payload with status + other data
      const payload = {
        ...itemToUpdate,
        status: "Paid"
      };

      // Send PUT request
      await api.put(`/salary-item/${confirmId}`, payload);

      // Update local state
      setSalarySheetApiData((prev) =>
        prev.map((item) =>
          item.id === confirmId ? { ...item, status: "Paid" } : item
        )
      );

      toast.success("Status updated to Paid");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status");
    } finally {
      setIsConfirmModalOpen(false);
      setConfirmId(null);
    }
  };

  const [currentPage, setCurrentPage] = useState([1])
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const grandTotal = useMemo(() => filteredData.reduce((sum, row) => sum + toNumber(row.e_total), 0), [filteredData]);
  const grandNetPay = useMemo(() => filteredData.reduce((sum, row) => sum + toNumber(calculateNetPay(row)), 0), [filteredData]);

  // Excel export
  const exportExcel = () => {
    const excelData = filteredData.map((d, i) => ({
      SL: i + 1,
      Month: d.monthYear,
      Name: d.name,
      Designation: d.designation,
      WorkingDay: toNumber(d.days),
      Salary: toNumber(d.salary),
      Advance: toNumber(d.advance),
      NetPay: toNumber(d.netPay),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");
    XLSX.writeFile(workbook, "SalarySheet.xlsx");
  };

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Month', 'Name', 'Designation', 'Days', 'salary', 'Advance', 'NetPay']],
      body: filteredData.map(d => [d.monthYear, d.name, d.designation, d.days, d.salary, d.advance, d.netPay]),
    });
    doc.save('SalarySheet.pdf');
  };

  // Full filtered table print function
  const handlePrintTable = () => {
    if (filteredData.length === 0) return;

    // Build HTML table for all filtered data
    let tableHTML = `
    <table style="width:100%; border-collapse: collapse; font-size:12px;">
      <thead>
        <tr>
          <th style="border:1px solid #333; padding:4px;">SL</th>
          <th style="border:1px solid #333; padding:4px;">Month</th>
          <th style="border:1px solid #333; padding:4px;">Name</th>
          <th style="border:1px solid #333; padding:4px;">Designation</th>
          <th style="border:1px solid #333; padding:4px;">Working Day</th>
          <th style="border:1px solid #333; padding:4px;">Salary</th>
          <th style="border:1px solid #333; padding:4px;">Advance</th>
          <th style="border:1px solid #333; padding:4px;">Net Pay</th>
        </tr>
      </thead>
      <tbody>
        ${filteredData.map((row, i) => `
          <tr>
            <td style="border:1px solid #333; padding:4px;">${i + 1}</td>
            <td style="border:1px solid #333; padding:4px;">${row.monthYear}</td>
            <td style="border:1px solid #333; padding:4px; text-align:left;">${row.name}</td>
            <td style="border:1px solid #333; padding:4px;">${row.designation}</td>
            <td style="border:1px solid #333; padding:4px;">${row.days}</td>
            <td style="border:1px solid #333; padding:4px;">${row.salary?.toLocaleString()}</td>
            <td style="border:1px solid #333; padding:4px;">${row.advance?.toLocaleString()}</td>
            <td style="border:1px solid #333; padding:4px; font-weight:bold;">${row.netPay?.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="border:1px solid #333; padding:4px; font-weight:bold;">Grand Total</td>
          <td style="border:1px solid #333; padding:4px;">${grandTotal.toLocaleString()}</td>
          <td style="border:1px solid #333; padding:4px;"></td>
          <td style="border:1px solid #333; padding:4px;">${grandNetPay.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  `;

    const newWin = window.open('', '', 'width=900,height=700');
    newWin.document.write(`
    <html>
      <head>
        <title>Salary Sheet</title>
      </head>
      <body>
        <h3>Salary Sheet</h3>
        ${tableHTML}
      </body>
    </html>
  `);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  };


  return (
    <div className='p-2'>
      <div className="w-[24rem] md:w-full max-w-7xl overflow-hidden overflow-x-auto mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            {/* <FaTruck className="text-gray-800 text-2xl" /> */}
            বেতন শিট {sheetMonth}
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <Link to="/tramessy/AddSallaryExpenseForm">
            <button onClick={() => showModal()} className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> Add
            </button>
            </Link> */}
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="flex flex-wrap text-gray-700 gap-2">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow  hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              পিডিএফ
            </button>

            <button
              onClick={handlePrintTable}
              className="flex items-center gap-2 py-1 px-3 hover:bg-primary bg-white shadow hover:text-white rounded transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>

          {/* <div className=" gap-2">
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-12 top-[11.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div> */}
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <select value={selectedEmployee} onChange={e => { setSelectedEmployee(e.target.value); setCurrentPage(1); }}
              className="border px-3 py-2 rounded-md w-full">
              <option value="">-- কর্মচারী নির্বাচন করুন --</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.employee_name}</option>)}
            </select>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setSelectedEmployee("")
                  setSelectedMonth("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear
              </button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto" >
          <table id="salary-table" className="min-w-full border-collapse border border-gray-400 text-xs">
            <thead>

              {/* Sub header row for SL numbers - merged for names */}
              <tr className=" text-black text-center">
                <th className="border border-gray-400 px-2 py-1" rowSpan={2}>ক্রমিক</th>
                <th className="border border-gray-400 px-2 py-1" colSpan={1} rowSpan={2}>
                  নাম </th>
                <th className="border border-gray-400 px-2 py-1" rowSpan={3}>কর্মদিবস</th>
                <th className="border border-gray-400 px-2 py-1" rowSpan={3}>পদবি</th>
                <th className="border border-gray-400 px-2 py-1 " colSpan={1} >
                  উপার্জন
                </th>
                <th className="border border-gray-400 px-2 py-1 " colSpan={1}>
                  কর্তন
                </th>
                {/* <th className="border border-gray-400 px-2 py-1">By CEO</th> */}
                <th className="border border-gray-400 px-2 py-1">নেট পে(অর্ধেক)</th>
                <th className="border border-gray-400 px-2 py-1">অ্যাকশন</th>
              </tr>
              {/* Main header row */}
              <tr className=" text-black text-center">
                <th className="border border-gray-400 px-2 py-1">বেতন</th>
                {/* <th className="border border-gray-400 px-2 py-1">H/Rent</th> */}
                {/* <th className="border border-gray-400 px-2 py-1">Conv</th> */}
                {/* <th className="border border-gray-400 px-2 py-1">Medical</th> */}
                {/* <th className="border border-gray-400 px-2 py-1">Allowan Ce/Ot</th> */}
                {/* <th className="border border-gray-400 px-2 py-1">Bonus</th> */}
                {/* <th className="border border-gray-400 px-2 py-1 ">Total</th> */}
                <th className="border border-gray-400 px-2 py-1">অ্যাডভান্স</th>
                {/* <th className="border border-gray-400 px-2 py-1">Loan</th> */}
                {/* <th className="border border-gray-400 px-2 py-1">Total</th> */}
                <th className="border border-gray-400 px-2 py-1"></th>

              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={16} className="text-center py-4">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) :
                currentItems.map((row, i) => (
                  <tr key={i} className="text-center hover:bg-gray-100">
                    <td className="border border-gray-400 px-2 py-1">{indexOfFirstItem + i + 1}</td>
                    <td className="border border-gray-400 px-2 py-1 text-left">{getEmployee[row.employee_id]}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.working_day}</td>
                    <td className="border border-gray-400 px-2 py-1">{row.designation}</td>
                    <td className="border border-gray-400 px-2 py-1">{row?.basic?.toLocaleString()}</td>
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.rent?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.conv?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.medical?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.allowance?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.bonus?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1 font-semibold">
                      {row?.total?.toLocaleString()}
                    </td> */}
                    <td className="border border-gray-400 px-2 py-1">{row?.advance?.toLocaleString()}</td>
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.monthly_deduction?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">{row?.deductionTotal?.toLocaleString()}</td> */}
                    {/* <td className="border border-gray-400 px-2 py-1">C</td> */}
                    <td className="border border-gray-400 px-2 py-1  font-bold">
                      {row?.net_pay?.toLocaleString()}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 action_column flex items-center gap-2">
                      <button
                        onClick={() => {
                          // setSelectedSlip(row);
                          handlePrintClick(row);
                        }}
                        className="flex items-center w-full px-3 py-1 text-sm text-gray-700 bg-white shadow rounded"
                      >
                        <BiPrinter className="mr-1 h-4 w-4" />
                        পে-স্লিপ
                      </button>
                      <button
                        onClick={() => openConfirmModal(row.id)}
                        className={`${row?.status === "Paid" ? "bg-primary" : "bg-yellow-500"} text-white px-2 py-1 rounded shadow-md hover:bg-yellow-600`}
                      >
                        {row?.status === "Paid" ? "Paid" : "Unpaid"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className=" font-bold text-center">
                <td className="border border-gray-400 px-2 py-1" colSpan={5}>
                  মোট
                </td>
                <td className="border border-gray-400 px-2 py-1">
                  {grandTotal.toLocaleString()}
                </td>
                <td className="border border-gray-400 px-2 py-1" colSpan={1}></td>
                <td className="border border-gray-400 px-2 py-1">
                  {grandNetPay.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
          {/* pagination */}
          {currentItems.length > 0 && totalPages >= 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          )}
        </div>
        {/* Hidden Component for Printing */}
        <div style={{ display: "none" }} >
          {selectedSlip &&
            <div ref={printRef}><PaySlipPrint data={selectedSlip} /></div>
          }
        </div>
      </div>
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[380px] rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Confirm Payment</h2>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to mark this salary as Paid?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatus}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default SalarySheet;