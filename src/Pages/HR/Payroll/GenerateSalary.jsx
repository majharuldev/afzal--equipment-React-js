import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaPlus } from "react-icons/fa6"
import { FaFileExcel, FaFilePdf, FaFilter, FaPen, FaPrint, FaTrashAlt, FaTruck } from "react-icons/fa"
import Pagination from '../../../components/Shared/Pagination';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useForm } from 'react-hook-form';
import { GrView } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import api from '../../../utils/axiosConfig';
import { AuthContext } from '../../../providers/AuthProvider';
import { tableFormatDate } from '../../../components/Shared/formatDate';
import { toNumber } from '../../../hooks/toNumber';

const GenerateSalary = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { user } = useContext(AuthContext)
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedSlip, setSelectedSlip] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [salaryAdvances, setSalaryAdvances] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [mergedData, setMergedData] = useState([]);

  const [salarySheetApiData, setSalarySheetApiData] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [generateSalaryMonth, setGenerateSalaryMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // update
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateMonth, setUpdateMonth] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(null);

  const [loading, setLoading] = useState(true);
  const methods = useForm();
  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [emp, adv, att, loan, bonus, sheet] = await Promise.all([
          api.get("/employee"),
          api.get("/salaryAdvanced"),
          api.get("/attendence"),
          api.get("/loan"),
          api.get("/bonous"),
          api.get("/salarySheet"),
        ]);

        const activeEmp = emp.data.data.filter(
          (e) => e.status?.toLowerCase() === "active"
        );

        setEmployees(activeEmp);
        setSalaryAdvances(adv.data.data);
        setAttendances(att.data.data);
        setLoanData(loan.data.data);
        setBonusData(bonus.data.data);
        setSalarySheetApiData(sheet.data.data);
      } catch (err) {
        toast.error("ডাটা লোড করতে ব্যর্থ হয়েছে");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Check if salary already generated for the month
  const isSalaryAlreadyGenerated = (month) => {
  return salarySheetApiData.some(
    (sheet) => sheet.generate_month === month
  );
};


  // delete confirm
  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/salarySheet/${deleteId}`);

      // UI update
      setSalarySheetApiData((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );

      toast.success("বেতন শিট সফলভাবে মুছে ফেলা হয়েছে");
    } catch (error) {
      console.error(error);
      toast.error("বেতন শিট মুছে ফেলতে ব্যর্থ হয়েছে");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  // pais salary employee
  const getPaidMonthsByEmployee = (empId) => {
    const paidMonths = [];

    salarySheetApiData.forEach(sheet => {
      sheet.items?.forEach(item => {
        if (
          String(item.employee_id) === String(empId) &&
          item.status === "Paid"
        ) {
          paidMonths.push(sheet.generate_month); // YYYY-MM
        }
      });
    });

    return paidMonths;
  };
  // all paid employee 
  const isAllEmployeePaid = (sheet) => {
    if (!sheet?.items || sheet.items.length === 0) return false;

    return sheet.items.every(item => item.status === "Paid");
  };

  const generateSalaryForMonth = (generateSalaryMonth) => {
    if (!generateSalaryMonth) return [];

    return employees.map((emp) => {
      const empId = String(emp.id);

      /* ================= ATTENDANCE ================= */
      const attendance = attendances.find(
        (a) =>
          String(a.employee_id) === empId &&
          a.month === generateSalaryMonth
      );

      const workingDay = attendance
        ? toNumber(attendance.working_day || 0)
        : 0;

      /* ================= ADVANCE SALARY ================= */
      const advanceRecord = salaryAdvances.find(
        (a) =>
          String(a.employee_id) === empId &&
          a.salary_month === generateSalaryMonth
      );

      // advance = full amount deduct
      const advance = advanceRecord
        ? toNumber(advanceRecord.amount || 0)
        : 0;

      /* ================= BONUS ================= */
      // const bonus = bonusData
      //   .filter(
      //     (b) =>
      //       String(b.employee_id) === empId &&
      //       b.month_of === generateSalaryMonth // month match
      //       //  status filter বাদ
      //   )
      //   .reduce((sum, b) => sum + Number(b.amount || 0), 0);

      /* ================= LOAN ================= */
      // const employeeLoans = loanData.filter(
      //   (l) => String(l.employee_id) === empId
      // );
      // const paidMonths = getPaidMonthsByEmployee(empId);
      //     let loanDeduction = 0;

      //     employeeLoans.forEach((loan) => {
      //       const loanStartMonth = loan.date?.slice(0, 7); // YYYY-MM
      //         const remaining = toNumber(loan.adjustment || 0);
      //         const monthly = toNumber(loan.monthly_deduction || 0);
      //   //  ONLY RULE
      //   if (remaining > 0) {
      //     loanDeduction += Math.min(remaining, monthly);
      //   }
      //     });

      /* ================= SALARY PARTS ================= */
      const basic = toNumber(emp.salary || 0);
      // const house_rent = toNumber(emp.house_rent || 0);
      // const conv = toNumber(emp.conv || 0);
      // const medical = toNumber(emp.medical || 0);
      // const allowan = toNumber(emp.allowan || 0);

      /* ================= TOTAL ================= */
      // const earnings = basic + house_rent + conv + medical + allowan + bonus;
      const earnings = basic;

      // const deductions = advance + loanDeduction;
      const deductions = advance

      const netPay = earnings - deductions;

      /* ================= FINAL OBJECT ================= */
      return {
        employee_id: emp.id,
        designation: emp.designation,
        working_day: workingDay,
        basic,
        // house_rent,
        // conv,
        // medical,
        // allown: allowan,     
        // bonous: bonus,       
        status: "Unpaid",
        e_total: earnings,
        adv: advance,
        // loan: loanDeduction,
        d_total: deductions,
        net_pay: netPay,
        month: generateSalaryMonth,
      };
    });
  };


  // handleUpdate
  const handleUpdateClick = (item) => {
    setSelectedSheet(item);
    setUpdateMonth(item.generate_month || "");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateGenerateSalary = async () => {
    if (!updateMonth) {
      toast.error("অনুগ্রহ করে একটি মাস নির্বাচন করুন");
      return;
    }

    try {
      const updatedSalaryData = generateSalaryForMonth(updateMonth);

      await api.put(`/salarySheet/${selectedSheet.id}`, {
        generate_by: user.name,
        generate_date: selectedSheet.generate_date,
        generate_month: updateMonth,
        items: updatedSalaryData,
      });

      toast.success("বেতন সফলভাবে আপডেট হয়েছে");

      setIsUpdateModalOpen(false);
      setSelectedSheet(null);

      // refresh list
      const res = await api.get("/salarySheet");
      setSalarySheetApiData(res.data.data);
    } catch (error) {
      toast.error("বেতন আপডেট করতে ব্যর্থ হয়েছে");
      console.log(error);
    }
  };


  // Send merged salary sheet to API
  const handleGenerate = async () => {
    if (!generateSalaryMonth) {
      toast.error("অনুগ্রহ করে একটি মাস নির্বাচন করুন");
      return;
    }
  
  //  already generated check
  if (isSalaryAlreadyGenerated(generateSalaryMonth)) {
    toast.error("এই মাসের বেতন ইতিমধ্যে তৈরি করা হয়েছে");
    return;
  }
    const dataToSend = generateSalaryForMonth(generateSalaryMonth);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      await api.post("/salarySheet", {
        generate_date: today,
        generate_by: user.name,
        generate_month: generateSalaryMonth,
        items: dataToSend,
      });

      toast.success("বেতন সফলভাবে তৈরি হয়েছে");
      // refresh list
      const res = await api.get("/salarySheet");
      setSalarySheetApiData(res.data.data);
      setCurrentPage(1);
    } catch (err) {
      toast.error("বেতন তৈরি করতে ব্যর্থ হয়েছে");
    }
  };

  // month yeayr options
  const currentYear = new Date().getFullYear();
  const monthsName = [
    { num: "01", name: "জানুয়ারি" },
  { num: "02", name: "ফেব্রুয়ারি" },
  { num: "03", name: "মার্চ" },
  { num: "04", name: "এপ্রিল" },
  { num: "05", name: "মে" },
  { num: "06", name: "জুন" },
  { num: "07", name: "জুলাই" },
  { num: "08", name: "আগস্ট" },
  { num: "09", name: "সেপ্টেম্বর" },
  { num: "10", name: "অক্টোবর" },
  { num: "11", name: "নভেম্বর" },
  { num: "12", name: "ডিসেম্বর" },
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

  const filteredData = salarySheetApiData.filter((item) => {
    return selectedMonth
      ? item.generate_month === selectedMonth
      : true;
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const grandTotal = useMemo(() => filteredData.reduce((sum, row) => sum + row.total, 0), [filteredData]);
  const grandNetPay = useMemo(() => filteredData.reduce((sum, row) => sum + row.netPay, 0), [filteredData]);

  //   // Excel export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salary Sheet");
    XLSX.writeFile(workbook, "SalarySheet.xlsx");
  };

  //   // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Designation', 'Days', 'Basic', 'H/Rent', 'Conv', 'Medical', 'Allowance', 'Total', 'Advance', 'NetPay']],
      body: filteredData.map(d => [d.name, d.designation, toNumber(d.days), toNumber(d.basic), toNumber(d.rent), toNumber(d.conv), toNumber(d.medical), toNumber(d.allowance), toNumber(d.total), toNumber(d.advance), toNumber(d.netPay)]),
    });
    doc.save('SalarySheet.pdf');
  };
  // // Full filtered table print function
  const handlePrintTable = () => {
    // Get the table element
    const table = document.getElementById('salary-table');
    if (!table) return;

    // Clone the table to remove unwanted columns (Action)
    const clone = table.cloneNode(true);

    // Remove Action column from header
    const headerRow = clone.querySelector('thead tr:last-child'); // last header row
    if (headerRow) {
      const actionTh = headerRow.querySelector('th:last-child');
      if (actionTh) actionTh.remove();
    }
    // Remove Action column from all header rows
    clone.querySelectorAll('thead tr').forEach(tr => {
      const ths = tr.querySelectorAll('th');
      ths.forEach(th => {
        if (th.innerText.toLowerCase().includes('action')) {
          th.remove();
        }
      });
    });

    // Remove Action column from each body row
    clone.querySelectorAll('tbody tr').forEach(tr => {
      const actionTd = tr.querySelector('td:last-child');
      if (actionTd) actionTd.remove();
    });

    // Remove pagination if exists
    const pag = document.querySelector('.pagination');
    if (pag) pag.remove();

    // Open new window for print
    const newWin = window.open('', '', 'width=900,height=700');
    newWin.document.write(`
    <html>
      <head>
        <title>Salary Sheet</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #333; padding: 4px; text-align: center; }
          th { background-color: #f0f0f0; }
        </style>
      </head>
      <body>
        <h3>Salary Sheet</h3>
        ${clone.outerHTML}
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
      <Toaster />
      <div className=" w-full overflow-x-auto mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            {/* <FaTruck className="text-gray-800 text-2xl" /> */}
             বেতন শিট 
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="">
              <select
                value={generateSalaryMonth}
                onChange={(e) => setGenerateSalaryMonth(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">মাস নির্বাচন করুন</option>
                {monthYearOptions.map((m, index) => (
                  <option key={index} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              className="bg-primary text-white px-4 py-2 rounded"
            >
              বেতন শিট তৈরি করুন
            </button>
            <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">মাস নির্বাচন করুন</option>
              {monthYearOptions.map((m, index) => (
                <option key={index} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setSelectedMonth("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-primary capitalize text-xs">
              <tr>
                <th className="p-2">ক্রমিক</th>
                 <th className="p-2"> বেতনের মাস</th>
                <th className="p-2">  তৈরি তারিখ</th>
               
                <th className="p-2">তৈরি করেছেন</th>
                {/* <th className="p-2">Status</th> */}
                <th className="p-2">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-500">
                    বেতন শিট লোড হচ্ছে...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                  
                    <td className="p-2">{item.generate_month}</td>
                      <td className="p-2">{tableFormatDate(item.generate_date)}</td>
                    <td className="p-2">{item.generate_by}</td>
                    {/* <td className="p-2">{item.status}</td> */}
                    <td className="p-2 flex gap-2 items-center">
                      {!isAllEmployeePaid(item) && <button
                        onClick={() => handleUpdateClick(item)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaPen className="text-[12px]" />
                      </button>}
                      <Link to={`/tramessy/HR/payroll/salary-sheet/${item.id}`}><button
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <GrView className="text-[12px]" />
                      </button></Link>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                   কোনো তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* update modal */}
        {isUpdateModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[400px] rounded-lg shadow-lg p-5">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                বেতন শিট আপডেট করুন
              </h2>

              {/* Month Select */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  মাস নির্বাচন করুন
                </label>
                <select
                  value={updateMonth}
                  onChange={(e) => setUpdateMonth(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">মাস নির্বাচন করুন</option>
                  {monthYearOptions.map((m, i) => (
                    <option key={i} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                   বাতিল
                </button>

                <button
                  onClick={handleUpdateGenerateSalary}
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  আপডেট করে বেতন তৈরি করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* delete modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[380px] rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                ডিলিট নিশ্চিত করুন
              </h2>

              <p className="text-sm text-gray-600 mb-5">
                আপনি কি নিশ্চিতভাবে এই বেতন শিটটি মুছে ফেলতে চান?
                <br />
                <span className="text-red-500 font-medium">
                  এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
                </span>
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  বাতিল
                </button>

                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  হ্যাঁ, ডিলিট করুন
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Pagination */}
        {currentItems.length > 0 && totalPages >= 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              maxVisible={8}
            />
          </div>
        )}
      </div>
    </div>

  );
};

export default GenerateSalary;