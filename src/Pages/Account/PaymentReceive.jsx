import { useEffect, useState } from "react";
import { FaPen, FaPlus, FaTrashAlt } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { Link } from "react-router-dom";
import { tableFormatDate } from "../../components/Shared/formatDate";
import api from "../../utils/axiosConfig";
import { IoMdClose } from "react-icons/io";
import toast from "react-hot-toast";

const PaymentReceive = () => {
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // Fetch payment data
  useEffect(() => {
    api
      .get(`/paymentRec`)
      .then((response) => {
        if (response.data.status === "Success"){
          setPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

   // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/paymentRec/${id}`);

      // Remove driver from local list
      setPayment((prev) => prev.filter((account) => account.id !== id));
      toast.success("পেমেন্ট সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedPaymentId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayment = payment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payment.length / itemsPerPage);
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

  if (loading) return <p className="text-center mt-16">Loading payment...</p>;
  return (
    <div className=" ">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 ">
            <MdOutlineAirplaneTicket className=" text-2xl" />
            পেমেন্ট রিসিভ
          </h2>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/account/PaymentReceiveForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus />যোগ করুন
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
              <tr>
                <th className="px-2 py-3">SL.</th>
                <th className="px-2 py-3">তারিখ</th>
                <th className="px-2 py-3">গ্রাহকের নাম</th>
                <th className="px-2 py-3">শাখার নাম</th>
                <th className="px-2 py-3">বিল রেফারেন্স</th>
                <th className="px-2 py-3">পরিমাণ</th>
                <th className="px-2 py-3">ক্যাশের ধরন</th>
                {/* <th className="px-2 py-3">নোট</th> */}
                <th className="px-2 py-3">তৈরি করেছেন</th>
                <th className="px-2 py-3">অবস্থা</th>
                <th className="px-2 py-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentPayment.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-10 text-gray-500 italic"
                  >
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
                      No vehicle data found.
                    </div>
                  </td>
                </tr>
              ) : (
                currentPayment?.map((dt, index) => (
                  <tr className="hover:bg-gray-50 transition-all border border-gray-200">
                    <td className="p-2 font-bold">{index + 1}.</td>
                    <td className="p-2">{tableFormatDate(dt.date)}</td>
                    <td className="p-2">{dt.customer_name}</td>
                    <td className="p-2">{dt.branch_name}</td>
                    <td className="p-2">{dt.bill_ref}</td>
                    <td className="p-2">{dt.amount}</td>
                    <td className="p-2">{dt.cash_type}</td>
                    {/* <td className="p-2">{dt.note}</td> */}
                    <td className="p-2">{dt.created_by}</td>
                    <td className="p-2">{dt.status}</td>
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link
                          to={`/tramessy/account/PaymentReceiveForm/edit/${dt.id}`}
                        >
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                        onClick={() => {
                              setSelectedPaymentId(dt.id);
                              setIsOpen(true);
                            }}
                        className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        <FaTrashAlt className="text-[12px]" />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* pagination */}
        {currentPayment.length === 0 ? (
          ""
        ) : (
          <div className="mt-10 flex justify-center">
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
          </div>
        )}

        {/* Delete Modal */}
      <div className="flex justify-center items-center">
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
                Are you sure you want to delete this Customer?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedPaymentId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default PaymentReceive;
