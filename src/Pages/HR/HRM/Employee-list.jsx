
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal } from "antd";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaPlus, FaTrashAlt, FaEye, FaUserSecret } from "react-icons/fa";
import { RiEditLine } from "react-icons/ri";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../../components/Shared/formatDate";
import { toNumber } from "../../../hooks/toNumber";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const EmployeeList = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  // view modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await api.get(`/employee`);
      if (response.data.success) {
        setEmployee(response.data.data);
      }
    } catch (error) {
      console.error("ডেটা লোডিংয়ে সমস্যা:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employee/${id}`);
      setEmployee((prev) => prev.filter((emp) => emp.id !== id));
      toast.success("কর্মচারী সফলভাবে মুছে ফেলা হয়েছে");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("মুছে ফেলা সম্ভব হয়নি!");
    }
  };

  // filter
  const filteredEmployeeList = employee.filter((dt) => {
    const term = searchTerm.toLowerCase();

    
    return dt.employee_name?.toLowerCase().includes(term) ||
    dt.employee_id?.toLowerCase().includes(term) ||
    dt.email?.toLowerCase().includes(term) ||
      dt.mobile?.toLowerCase().includes(term);
  });

  // view handler function
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setViewModalOpen(true);
  };

  const columns = [
   { title: "আইডি নম্বর", dataIndex: "employee_id", key: "employee_id", render: (_, record) => record.employee_id },
    {
      title: "ছবি",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={`${image}`}
          alt="employee"
          className="w-16 h-16 rounded-full"
        />
      ),
    },
    { title: "পূর্ণ নাম", dataIndex: "employee_name", key: "employee_name" },
    { title: "ইমেইল", dataIndex: "email", key: "email" },
    {
      title: "যোগদানের তারিখ", dataIndex: "join_date", key: "join_date",
      render: (date) => {
        const formattedDate = tableFormatDate(date);
        return formattedDate;
      }
    },
    { title: "পদবী", dataIndex: "designation", key: "designation" },
    { title: "মোবাইল", dataIndex: "mobile", key: "mobile" },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <Space>
          <Link to={`/tramessy/UpdateEmployeeForm/${record.id}`}>
            <Button type="primary" size="small" className="!bg-white !text-primary !shadow-md">
              <RiEditLine />
            </Button>
          </Link>
          <Button type="primary" size="small" className="!bg-white !text-primary !shadow-md"
            onClick={() => handleView(record)}>
            <FaEye />
          </Button>
          <Button
            className="!bg-white !text-red-500 !shadow-md"
            type="primary"
            size="small"
            onClick={() => {
              setSelectedEmployeeId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </Space>
      ),
    },
  ];

    // excel
  const exportExcel = () => {
    if (!filteredEmployeeList || filteredEmployeeList.length === 0) {
      toast.error("No data to export!");
      return;
    }

    const data = filteredEmployeeList.map((dt, index) => ({
      SL: index + 1,
      FullName: dt.employee_name,
      Email: dt.email,
      JoinDate: tableFormatDate(dt.join_date),
      Designation: dt.designation,
      Mobile: dt.mobile,
      NID: dt.nid,
      Gender: dt.gender,
      BirthDate: tableFormatDate(dt.birth_date),
      "Blood Group": dt.blood_group,
      Address: dt.address,
      "Basic Salary": toNumber(dt.salary),
      Status: dt.status,
      createBy: dt.created_by,
      ImageUrl: dt.image
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `EmployeeList_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  // print
  const printTable = () => {
    const filteredData = filteredEmployeeList; // all filtered employees

    if (!filteredData || filteredData.length === 0) {
      toast.error("No data to print!");
      return;
    }

    const tableHeader = `
    <thead>
      <tr>
        <th>SL.</th>
        <th>FullName</th>
        <th>Email</th>
        <th>JoinDate</th>
        <th>Designation</th>
        <th>Mobile</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

    const tableRows = filteredData
      .map(
        (dt, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${dt.employee_name}</td>
      <td>${dt.email}</td>
      <td>${tableFormatDate(dt.join_date)}</td>
      <td>${dt.designation}</td>
      <td>${dt.mobile}</td>
      <td>${dt.status}</td>
    </tr>`
      )
      .join("");

    const printContent = `
    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse;">
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
    <head>
      <title>-</title>
      <style>
        body { font-family: Arial, sans-serif; }

        .print-container {
          display: table;
          width: 100%;
        }

        .print-header {
          display: table-header-group;
        }

        .header {
          width: 100%;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; }
        thead th {
         
          color: black !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      </style>
    </head>

    <body>
      <div class="print-container">
        <div class="content">
          <h3 style="text-align:center;">Employee List</h3>
          ${printContent}
        </div>

      </div>
    </body>
    </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl border border-gray-200">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaUserSecret /> কর্মচারী তথ্য
        </h1>
        <Link to="/tramessy/HR/HRM/AddEmployee">
          <Button type="primary" icon={<FaPlus />} className="!bg-primary">
            নতুন কর্মচারী
          </Button>
        </Link>
      </div>
<div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            {/* <button
              onClick={exportPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              Print
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
              placeholder="Search Employee..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-7 top-[5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      <Table
        columns={columns}
        dataSource={filteredEmployeeList}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "কোনো কর্মচারী তথ্য পাওয়া যায়নি" }}
        scroll={{ x: "max-content" }}
      />

      {/* View Modal */}
      <Modal
        title="কর্মচারীর তথ্য"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={null}
      >
        {selectedEmployee && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedEmployee.image
                    ? `${selectedEmployee.image}`
                    : "https://via.placeholder.com/100"
                }
                alt={selectedEmployee.full_name}
                className="w-24 h-24 rounded-full border"
              />
              <div className="flex flex-col gap-1">
                <p><span className="font-semibold">নাম:</span> {selectedEmployee.employee_name}</p>
                <p><span className="font-semibold">ইমেইল:</span> {selectedEmployee.email}</p>
                <p><span className="font-semibold">মোবাইল:</span> {selectedEmployee.mobile}</p>
                <p><span className="font-semibold">পদবি:</span> {selectedEmployee.designation}</p>
                <p><span className="font-semibold">যোগদানের তারিখ:</span> {tableFormatDate(selectedEmployee.join_date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-semibold">লিঙ্গ:</span> {selectedEmployee.gender}</p>
              <p><span className="font-semibold">রক্তের গ্রুপ:</span> {selectedEmployee.blood_group}</p>
              <p><span className="font-semibold">জন্ম তারিখ:</span> {tableFormatDate(selectedEmployee.birth_date)}</p>
              <p><span className="font-semibold">জাতীয় পরিচয়পত্র নং:</span> {selectedEmployee.nid}</p>
              <p><span className="font-semibold">বেতন:</span> {selectedEmployee.salary}</p>
                 <p><span className="font-semibold">তৈরী করেছেন:</span> {selectedEmployee.created_by}</p>
              <p><span className="font-semibold">স্ট্যাটাস:</span> {selectedEmployee.status}</p>
            </div>

            <p><span className="font-semibold">Address:</span> {selectedEmployee.address}</p>
          </div>
        )}
      </Modal>
      {/* Delete Modal */}
      <Modal
        title="মুছে ফেলার নিশ্চয়তা"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="no" onClick={() => setIsModalOpen(false)}>
            না
          </Button>,
          <Button
            key="yes"
            type="primary"
            danger
            onClick={() => handleDelete(selectedEmployeeId)}
          >
            হ্যাঁ
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত যে কর্মচারীটি মুছে ফেলতে চান?</p>
      </Modal>
    </div>
  );
};

export default EmployeeList;
