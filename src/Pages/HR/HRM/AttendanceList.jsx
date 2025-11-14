import { useEffect, useState } from "react";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import { FaPen, FaPlus, FaUserSecret } from "react-icons/fa6";
import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";
import { Table } from "antd";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../../components/Shared/formatDate";

const AttendanceList = () => {
  const [employee, setEmployee] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get(`/employee`);
        const empData = empRes.data.data || [];
        setEmployee(empData);

        const attRes = await api.get(`/attendence`);
        const attData = attRes.data.data || [];
        setAttendanceList(attData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // employee name helper
  const getEmployeeName = (empId) => {
    const emp = employee.find((e) => e.id === Number(empId));
    return emp ? emp.employee_name || emp.email : empId;
  };

  // Search filter
  const filteredAttendance = attendanceList.filter((item) => {
    const empName = getEmployeeName(item.employee_id).toLowerCase();
    const month = item.month?.toLowerCase() || "";
    const date = tableFormatDate(item.created_at).toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      empName.includes(term) ||
      month.includes(term) ||
      date.includes(term)
    );
  });

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttendance = filteredAttendance.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

   // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/attendence/${id}`);

      // Remove driver from local list
      setAttendanceList((prev) => prev.filter((account) => account.id !== id));
      toast.success("Attendence deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedAttendanceId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Excel Export
  const exportExcel = () => {
    if (filteredAttendance.length === 0) {
      toast.error("রপ্তানি করার মতো কোনো তথ্য নেই!");
      return;
    }

    const data = filteredAttendance.map((att, index) => ({
      ক্রম: index + 1,
      তারিখ: tableFormatDate(att.created_at),
      কর্মচারী: getEmployeeName(att.employee_id),
      "কার্যদিবস": att.working_day,
      মাস: att.month,
      "তৈরি করেছেন": att.created_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_list.xlsx");
  };

  // Print
  const printTable = () => {
    const printWindow = window.open("", "", "width=900,height=600");
    const tableHTML = `
      <html>
        <head>
          <title>উপস্থিতি রিপোর্ট</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #333; padding: 6px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>উপস্থিতি রিপোর্ট</h2>
          <table>
            <thead>
              <tr>
                <th>ক্রম</th>
                <th>তারিখ</th>
                <th>কর্মচারীর নাম</th>
                <th>কার্যদিবস</th>
                <th>মাস</th>
                <th>তৈরি করেছেন</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAttendance
                .map(
                  (att, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${tableFormatDate(att.created_at)}</td>
                  <td>${getEmployeeName(att.employee_id)}</td>
                  <td>${att.working_day}</td>
                  <td>${att.month}</td>
                  <td>${att.created_by}</td>
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
    {
      title: "ক্রম",
      dataIndex: "sl",
      key: "sl",
      render: (_, __, index) => <b>{index + 1}</b>,
      width: 60,
    },
    {
      title: "তারিখ",
      dataIndex: "created_at",
      render: (date) => tableFormatDate(date),
    },
    {
      title: "কর্মচারীর নাম",
      dataIndex: "employee_id",
      render: (id) => getEmployeeName(id),
    },
    {
      title: "কার্যদিবস",
      dataIndex: "working_day",
    },
    {
      title: "মাস",
      dataIndex: "month",
    },
    {
      title: "তৈরি করেছেন",
      dataIndex: "created_by",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, row) => (
        <div className="flex gap-1">
          <Link to={`/tramessy/HR/Payroll/update-attendence/${row.id}`}>
            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
              <FaPen className="text-[12px]" />
            </button>
          </Link>

          <button
            onClick={() => {
              setSelectedAttendanceId(row.id);
              setIsOpen(true);
            }}
            className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
          >
            <FaTrashAlt className="text-[12px]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl text-gray-800 font-bold flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-xl" />
            উপস্থিতির তালিকা
          </h1>

          <Link to="/tramessy/HR/payroll/AttendanceForm">
            <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> উপস্থিতি যুক্ত করুন
            </button>
          </Link>
        </div>

        {/* EXPORT + SEARCH */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-2 text-gray-700 font-semibold">
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

          <input
            type="text"
            value={searchTerm}
            placeholder="খুঁজুন..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-3 md:mt-0 lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2"
          />
          {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.3rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
        </div>

        {/* TABLE */}
        <div className="mt-5">
          <Table
            columns={columns}
            dataSource={currentAttendance}
            rowKey="id"
            className=" rounded-lg"
            pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredAttendance.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          />
        </div>
      </div>

      {/* DELETE MODAL */}
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
              আপনি কি নিশ্চিত এই উপস্থিতির তথ্য মুছে ফেলতে চান?
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleModal}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
              >
                না
              </button>
              <button
                onClick={() => handleDelete(selectedAttendanceId)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
              >
                হ্যাঁ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceList;
