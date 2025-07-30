import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus, FaUserSecret } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";

const PurchaseList = () => {
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPurchase(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = purchase.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(purchase.length / itemsPerPage);
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
    <div className=" md:p-2">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-2 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Purchase
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/Purchase/PurchaseForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Add
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-primary text-white capitalize text-xs border border-gray-600">
              <tr>
                <th className="px-2 py-2">SL.</th>
                <th className="px-2 py-2">Supplier Name</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Item Name</th>
                <th className="px-2 py-2">Service Cost</th>
                <th className="px-2 py-2">Quantity</th>
                <th className="px-2 py-2">Unit Price</th>
                <th className="px-2 py-2">Total</th>
                <th className="px-2 py-2">Bill Image</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 ">
              {
                currentPurchase?.length === 0 ? (
    <tr>
      <td colSpan="8" className="text-center py-10 text-gray-500 italic">
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
          No Purchase data found.
        </div>
      </td>
    </tr>
  ) 
              :(currentPurchase?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border-b border-gray-200"
                >
                  <td className="px-2 py-2 font-bold">{index + 1}</td>
                  <td className="px-2 py-2">{dt.supplier_name}</td>
                  <td className="px-2 py-2">{dt.category}</td>
                  <td className="px-2 py-2">{dt.item_name}</td>
                  <td className="px-2 py-2">{dt.service_cost || "0"}</td>
                  <td className="px-2 py-2">{dt.quantity}</td>
                  <td className="px-2 py-2">{dt.unit_price}</td>
                  <td className="px-2 py-2">{dt.purchase_amount}</td>
                  <td className="px-2 py-2">
                    <img
                      src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${dt.bill_image}`}
                      alt=""
                      className="w-16 h-16 rounded-full"
                    />
                  </td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link
                        to={`/tramessy/Purchase/UpdatePurchaseForm/${dt.id}`}
                      >
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaEye className="text-[12px]" />
                      </button>
                      {/* <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt className="text-[12px]" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
         {/* Pagination */}
              {
                currentPurchase?.length === 0 ? ("")
              :(<div className="mt-10 flex justify-center">
                <div className="space-x-2 flex items-center">
                  <button
                    onClick={handlePrevPage}
                    className={`p-2 ${
                      currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                    } rounded-sm`}
                    disabled={currentPage === 1}
                  >
                    <GrFormPrevious />
                  </button>
                  {[...Array(totalPages).keys()].map((number) => (
                    <button
                      key={number + 1}
                      onClick={() => handlePageClick(number + 1)}
                      className={`px-3 py-1 rounded-sm ${
                        currentPage === number + 1
                          ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                          : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                      }`}
                    >
                      {number + 1}
                    </button>
                  ))}
                  <button
                    onClick={handleNextPage}
                    className={`p-2 ${
                      currentPage === totalPages
                        ? "bg-gray-300"
                        : "bg-primary text-white"
                    } rounded-sm`}
                    disabled={currentPage === totalPages}
                  >
                    <GrFormNext />
                  </button>
                </div>
              </div>)}
      </div>
    </div>
  );
};

export default PurchaseList;
