import { useEffect, useState } from "react";
import { FaCheck, FaTrashAlt } from "react-icons/fa";
import { FaEye, FaPen, FaPlus, FaUserSecret } from "react-icons/fa6";
import { IoCloseOutline, IoCloseSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

const AttendanceList = () => {
  const [employee, setEmployee] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  useEffect(() => {
    // Fetch employee list
    fetch(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => response.json())
      .then((data) => setEmployee(data.data))
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  const handleViewClick = (id) => {
    setSelectedEmployeeId(id === selectedEmployeeId ? null : id);
  };

  return (
    <div className=" md:p-4">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Attendance List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/Attendance/AttendanceForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Attendance
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-2 py-3">#</th>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700  ">
              {employee.map((emp, index) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-2 py-4 font-bold">{index + 1}</td>
                  <td className="px-2 py-4">{emp.full_name}</td>
                  <td className="px-2 py-4">{emp.join_date}</td>
                  <td className="px-2 py-4">
                    <div className="flex gap-1">
                      <Link>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleViewClick(emp.id)}
                        className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaEye className="text-[12px]" />
                      </button>
                      {/* <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditional Modal Content (Filtered by ID) */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-[#00000065] flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-3xl w-full relative overflow-x-auto shadow-2xl border border-gray-300">
            {/* Close Button */}
            <button
              onClick={() => setSelectedEmployeeId(null)}
              className="absolute top-2 right-2 text-white bg-primary hover:text-white hover:bg-red-500 rounded-md w-5 h-5 flex items-center justify-center transition-all cursor-pointer"
            >
              <IoCloseSharp />
            </button>

            {/* Modal Table */}
            <table className="min-w-full text-sm text-left text-gray-900 mt-10">
              <thead className="capitalize text-sm">
                <tr>
                  <th className="border border-gray-700 px-2 py-1">SL.</th>
                  <th className="border border-gray-700 px-2 py-1">Date</th>
                  <th className="border border-gray-700 px-2 py-1">
                    Employee Name
                  </th>
                  <th className="border border-gray-700 px-2 py-1 text-center">
                    Present
                  </th>
                  <th className="border border-gray-700 px-2 py-1 text-center">
                    Absent
                  </th>
                </tr>
              </thead>
              <tbody className="font-semibold">
                {employee
                  .filter((emp) => emp.id === selectedEmployeeId)
                  .map((dt, index) => (
                    <tr key={dt.id} className="hover:bg-gray-50 transition-all">
                      <td className="border border-gray-700 p-1 font-bold">
                        {index + 1}.
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.join_date}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.full_name}
                      </td>
                      <td className="border border-gray-700 p-1 text-center">
                        <span className="text-green-600">
                          <FaCheck />
                        </span>
                      </td>
                      <td className="border border-gray-700 p-1 text-center">
                        <span className="text-red-600">
                          <IoCloseOutline />
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
