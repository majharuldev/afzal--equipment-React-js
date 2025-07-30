import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { MdShop } from "react-icons/md";
import { Link } from "react-router-dom";

const Stockin = () => {
  const [stock, setStockIn] = useState([]);
  const [loading, setLoading] = useState(true);
  // fetch data from server
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/stockProduct/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setStockIn(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  if (loading) return <p className="text-center mt-16">Loading vehicle...</p>;
  return (
    <div className=" md:p-4">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <MdShop className="text-[#11375B] text-2xl" />
            Stock in List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/Inventory/AddStock">
              <button className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Stock
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="px-2 py-3">SL.</th>
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Product Name</th>
                <th className="px-2 py-3">Quantity</th>
                <th className="px-2 py-3">Supplier Name</th>
                <th className="px-2 py-3">Before Stock</th>
                <th className="px-2 py-3">After Stock</th>
                <th className="px-2 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              {stock?.map((dt, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-all border-t border-gray-300"
                >
                  <td className="px-2 py-4 font-bold">{index + 1}</td>
                  <td className="px-2 py-4">{dt.date}</td>
                  <td className="px-2 py-4">{dt.category}</td>
                  <td className="px-2 py-4">{dt.product_name}</td>
                  <td className="px-2 py-4">{dt.quantity}</td>
                  <td className="px-2 py-4">
                    {dt.vendor_name ? dt.vendor_name : "--"}
                  </td>
                  <td className="px-2 py-4">
                    {dt.before_stock ? dt.before_stock : "--"}
                  </td>
                  <td className="px-2 py-4">
                    {dt.after_stock ? dt.after_stock : "--"}
                  </td>
                  <td className="px-2 action_column">
                    <div className="flex gap-1">
                      <Link>
                        <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      </Link>
                      <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaEye className="text-[12px]" />
                      </button>
                      <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
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

export default Stockin;
