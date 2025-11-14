import React, { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { Table, Button } from "antd";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../../components/Shared/formatDate";

const AdvanceSalary = () => {
  const [advanceSalary, setAdvanceSalary] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAdvanceSalaryId, setSelectedAdvanceSalaryId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  // ডাটা ফেচ
  useEffect(() => {
    const fetchSalaryAdvance = async () => {
      try {
        const res = await api.get(`/salaryAdvanced`);
        if (res.data?.status === "Success") {
          setAdvanceSalary(res.data.data);
        }
      } catch (error) {
        console.error("Advance Salary fetch error:", error);
      }
    };

    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee`);
        if (res.data?.success) {
          setEmployee(res.data.data);
        }
      } catch (error) {
        console.error("Employee fetch error:", error);
      }
    };

    fetchSalaryAdvance();
    fetchEmployee();
  }, []);

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id) => {
    try {
      await api.delete(`/salaryAdvanced/${id}`);
      setAdvanceSalary((prev) => prev.filter((item) => item.id !== id));
      toast.success("অগ্রিম বেতন সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsOpen(false);
      setSelectedAdvanceSalaryId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("মুছে ফেলা যায়নি!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // কর্মচারীর নাম পাওয়ার হেল্পার
  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  // সার্চ ফিল্টার
  const filteredData = advanceSalary.filter((item) => {
    const empName = getEmployeeName(item.employee_id)?.toLowerCase() || "";
    const amount = item.amount?.toString() || "";
    const month = item.salary_month?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return empName.includes(term) || amount.includes(term) || month.includes(term);
  });

  // পেজিনেশন
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // এক্সেল এক্সপোর্ট
  const exportExcel = () => {
    if (filteredData.length === 0) {
      toast.error("এক্সপোর্ট করার জন্য ডাটা নেই!");
      return;
    }
    const data = filteredData.map((item) => ({
      তারিখ: tableFormatDate(item.created_at),
      "কর্মচারীর নাম": getEmployeeName(item.employee_id),
      পরিমাণ: item.amount + " ৳",
      "বেতন মাস": item.salary_month,
      "সংশোধনের পরে": item.adjustment + " ৳",
      অবস্থা: item.status,
      "তৈরি করেছেন": item.created_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Advance Salary");
    XLSX.writeFile(workbook, "Advance_Salary_List.xlsx");
  };

  // প্রিন্ট
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    const tableHTML = `
      <html>
        <head>
          <title>অগ্রিম বেতন রিপোর্ট</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>অগ্রিম বেতন রিপোর্ট</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>তারিখ</th>
                <th>কর্মচারীর নাম</th>
                <th>পরিমাণ</th>
                <th>বেতন মাস</th>
                <th>সংশোধনের পরে</th>
                <th>অবস্থা</th>
                <th>তৈরি করেছেন</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (item, index) => `<tr>
                    <td>${index + 1}</td>
                    <td>${tableFormatDate(item.created_at)}</td>
                    <td>${getEmployeeName(item.employee_id)}</td>
                    <td>${item.amount} ৳</td>
                    <td>${item.salary_month}</td>
                    <td>${item.adjustment} ৳</td>
                    <td>${item.status}</td>
                    <td>${item.created_by}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // AntD Table Columns
  const columns = [
    { title: "#", render: (_, __, index) => indexOfFirst + index + 1 },
    { title: "তারিখ", dataIndex: "created_at", render: (text) => tableFormatDate(text) },
    { title: "কর্মচারীর নাম", dataIndex: "employee_id", render: (id) => getEmployeeName(id) },
    { title: "পরিমাণ", dataIndex: "amount", render: (amt) => `${amt} ৳` },
    { title: "বেতন মাস", dataIndex: "salary_month" },
    { title: "সংশোধনের পরে", dataIndex: "adjustment", render: (adj) => `${adj} ৳` },
    { title: "অবস্থা", dataIndex: "status" },
    { title: "তৈরি করেছেন", dataIndex: "created_by" },
    {
      title: "একশন",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/HR/Payroll/update-advance/${record.id}`}>
            <Button type="primary" size="small" icon={<FaPen />} />
          </Link>
          <Button
            type="primary"
            danger
            size="small"
            icon={<FaTrashAlt />}
            onClick={() => {
              setSelectedAdvanceSalaryId(record.id);
              setIsOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <Toaster/>
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-4 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            অগ্রিম বেতন
          </h1>
          <div>
            <Link to="/tramessy/HR/Payroll/Advance-Salary-Form">
              <Button type="primary" icon={<FaPlus />}>অগ্রিম</Button>
            </Link>
          </div>
        </div>

        {/* Export & Search */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              এক্সেল
            </button>
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
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
                setCurrentPage(1);
              }}
              placeholder="খুঁজুন..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* AntD Table */}
        <Table
          columns={columns}
          dataSource={currentItems}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
        />
      </div>

      {/* Delete Modal */}
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
              আপনি কি এই রেকর্ডটি মুছে দিতে চান?
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={toggleModal}>না</Button>
              <Button type="primary" danger onClick={() => handleDelete(selectedAdvanceSalaryId)}>
                হ্যাঁ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvanceSalary;
