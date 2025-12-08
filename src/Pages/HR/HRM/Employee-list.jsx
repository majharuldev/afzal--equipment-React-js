// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import { FaEye, FaPen, FaPlus, FaTrashAlt, FaUserSecret } from "react-icons/fa";
// import { GrFormNext, GrFormPrevious } from "react-icons/gr";
// import { IoMdClose } from "react-icons/io";
// import { Link } from "react-router-dom";

// const EmployeeList = () => {
//   const [employee, setEmployee] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // delete modal
//   const [isOpen, setIsOpen] = useState(false);
//   const toggleModal = () => setIsOpen(!isOpen);
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
//   // Fetch trips data
//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setEmployee(response.data.data);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching trip data:", error);
//         setLoading(false);
//       });
//   }, []);
//   // delete by id
//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BASE_URL}/api/employee/delete/${id}`,
//         {
//           method: "DELETE",
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to delete employee");
//       }
//       // Remove employee from local list
//       setEmployee((prev) => prev.filter((dt) => dt.id !== id));
//       toast.success("Employee deleted successfully", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//       setIsOpen(false);
//       setSelectedEmployeeId(null);
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error("There was a problem deleting!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     }
//   };

//   // pagination
//   const [currentPage, setCurrentPage] = useState([1]);
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentEmployee = employee.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employee.length / itemsPerPage);

//   const handlePrevPage = () => {
//     if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
//   };
//   const handleNextPage = () => {
//     if (currentPage < totalPages)
//       setCurrentPage((currentPage) => currentPage + 1);
//   };
//   const handlePageClick = (number) => {
//     setCurrentPage(number);
//   };
//   if (loading) return <p className="text-center mt-16">Loading employee...</p>;
//   return (
//     <div className=" md:p-4">
//       <Toaster />
//       <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
//         <div className="md:flex items-center justify-between mb-6">
//           <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
//             <FaUserSecret className="text-[#11375B] text-2xl" />
//             Employee Information
//           </h1>
//           <div className="mt-3 md:mt-0 flex gap-2">
//             <Link to="/tramessy/HR/HRM/AddEmployee">
//               <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
//                 <FaPlus /> Employee
//               </button>
//             </Link>
//           </div>
//         </div>
//         <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
//               <tr>
//                 <th className="px-2 py-1">SL.</th>
//                 <th className="px-2 py-1">ছবি</th>
//                 <th className="px-2 py-1">পূর্ণ নাম</th>
//                 <th className="px-2 py-1">ইমেইল</th>
//                 <th className="px-2 py-1">যোগদানের তারিখ</th>
//                 <th className="px-2 py-1">পদবী</th>
//                 <th className="px-2 py-1">মোবাইল</th>
//                 <th className="px-2 py-1">অবস্থা</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-700  ">
//               {currentEmployee.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="text-center py-10 text-gray-500 italic"
//                   >
//                     <div className="flex flex-col items-center">
//                       <svg
//                         className="w-12 h-12 text-gray-300 mb-2"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                         />
//                       </svg>
//                       No Employee data found.
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 currentEmployee?.map((dt, index) => {
//                   return (
//                     <tr
//                       key={index}
//                       className="hover:bg-gray-50 transition-all border-b border-gray-200"
//                     >
//                       <td className="px-2 py-1 font-bold">{index + 1}.</td>
//                       <td className="px-2 py-1">
//                         <img
//                           src={`${
//                             import.meta.env.VITE_BASE_URL
//                           }/public/uploads/employee/${dt.image}`}
//                           alt=""
//                           className="w-16 h-16 rounded-full"
//                         />
//                       </td>
//                       <td className="px-2 py-1">{dt.full_name}</td>
//                       <td className="px-2 py-1">{dt.email}</td>
//                       <td className="px-2 py-1">{dt.join_date}</td>
//                       <td className="px-2 py-1">{dt.designation}</td>
//                       <td className="px-2 py-1">{dt.mobile}</td>
//                       <td className="px-2 action_column">
//                         <div className="flex gap-1">
//                           <Link to={`/tramessy/UpdateEmployeeForm/${dt.id}`}>
//                             <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
//                               <FaPen className="text-[12px]" />
//                             </button>
//                           </Link>
//                           <button
//                             // onClick={() => handleView(driver.id)}
//                             className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                           >
//                             <FaEye className="text-[12px]" />
//                           </button>
//                           <button
//                             onClick={() => {
//                               setSelectedEmployeeId(dt.id);
//                               setIsOpen(true);
//                             }}
//                             className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
//                           >
//                             <FaTrashAlt className="text-[12px]" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//         {/* pagination */}
//         {currentEmployee.length === 0 ? (
//           ""
//         ) : (
//           <div className="mt-10 flex justify-center">
//             <div className="space-x-2 flex items-center">
//               <button
//                 onClick={handlePrevPage}
//                 className={`p-2 ${
//                   currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
//                 } rounded-sm`}
//                 disabled={currentPage === 1}
//               >
//                 <GrFormPrevious />
//               </button>
//               {[...Array(totalPages).keys()].map((number) => (
//                 <button
//                   key={number + 1}
//                   onClick={() => handlePageClick(number + 1)}
//                   className={`px-3 py-1 rounded-sm ${
//                     currentPage === number + 1
//                       ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
//                       : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
//                   }`}
//                 >
//                   {number + 1}
//                 </button>
//               ))}
//               <button
//                 onClick={handleNextPage}
//                 className={`p-2 ${
//                   currentPage === totalPages
//                     ? "bg-gray-300"
//                     : "bg-primary text-white"
//                 } rounded-sm`}
//                 disabled={currentPage === totalPages}
//               >
//                 <GrFormNext />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* Delete modal */}
//       <div className="flex justify-center items-center">
//         {isOpen && (
//           <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
//             <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
//               <button
//                 onClick={toggleModal}
//                 className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
//               >
//                 <IoMdClose />
//               </button>
//               <div className="flex justify-center mb-4 text-red-500 text-4xl">
//                 <FaTrashAlt />
//               </div>
//               <p className="text-center text-gray-700 font-medium mb-6">
//                 Do you want to delete the employee?
//               </p>
//               <div className="flex justify-center space-x-4">
//                 <button
//                   onClick={toggleModal}
//                   className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
//                 >
//                   No
//                 </button>
//                 <button
//                   onClick={() => handleDelete(selectedEmployeeId)}
//                   className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
//                 >
//                   Yes
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmployeeList;


import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal } from "antd";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaPlus, FaTrashAlt, FaEye, FaUserSecret } from "react-icons/fa";
import { RiEditLine } from "react-icons/ri";
import api from "../../../utils/axiosConfig";
import { tableFormatDate } from "../../../components/Shared/formatDate";

const EmployeeList = () => {
  const [employee, setEmployee] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  // view modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

      <Table
        columns={columns}
        dataSource={employee}
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
