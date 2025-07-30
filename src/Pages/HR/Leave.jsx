import axios from "axios";
import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { Link } from "react-router-dom";

const Leave = () => {
  const [leave, setLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch leave data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/leave/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setLeave(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);
  if (loading) return <p className="text-center mt-16">Loading leave...</p>;
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white md:p-4">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <MdOutlineAirplaneTicket className="text-[#11375B] text-2xl" />
            Leave List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/LeaveForm">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Leave
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="px-2 py-3">#</th>
                <th className="px-2 py-3">Name</th>
                <th className="px-2 py-3">Apply Date</th>
                <th className="px-2 py-3">Leave Form</th>
                <th className="px-2 py-3">Leave To</th>
                <th className="px-2 py-3">Leave Type</th>
                <th className="px-2 py-3">Remark</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              {leave?.map((dt, index) => (
                <tr className="hover:bg-gray-50 transition-all">
                  <td className="px-2 py-4 font-bold">{index + 1}.</td>
                  <td className="px-2 py-4">{dt.name}</td>
                  <td className="px-2 py-4">{dt.apply_date}</td>
                  <td className="px-2 py-4">{dt.leave_from}</td>
                  <td className="px-2 py-4">{dt.leave_to}</td>
                  <td className="px-2 py-4">{dt.leave_type}</td>
                  <td className="px-2 py-4">{dt.remark}</td>
                  <td className="px-2 py-4">{dt.status}</td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link to={`/tramessy/UpdateLeaveForm/${dt.id}`}>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button
                        // onClick={() => {
                        //   setSelectedEmployeeId(dt.id);
                        //   setIsOpen(true);
                        // }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leave;
