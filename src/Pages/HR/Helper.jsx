import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaEye, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import api from "../../utils/axiosConfig";
import { toNumber } from "../../hooks/toNumber";
import Pagination from "../../components/Shared/Pagination";


const HelperList = () => {
  const [helper, setHelper] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedHelperId, setSelectedHelperId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedHelper, setSelectedHelper] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api
      .get(`/helper`)
      .then((response) => {
        if (response.data.success) {
          setHelper(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("হেল্পার তথ্য আনা যায়নি:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">হেল্পার গুলো লোড হচ্ছে...</p>;

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/helper/${id}`);
      setHelper((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Helper সফলভাবে মুছে ফেলা হয়েছে", { position: "top-right", autoClose: 3000 });
      setIsOpen(false);
      setSelectedHelperId(null);
    } catch (error) {
      console.error("মুছে ফেলার সময় সমস্যা:", error.response || error);
      toast.error("মুছে ফেলার সময় সমস্যা হয়েছে!", { position: "top-right", autoClose: 3000 });
    }
  };

  const handleView = async (id) => {
    try {
      const response = await api.get(`/helper/${id}`);
      if (response.data.success) {
        setSelectedHelper(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("হেল্পার তথ্য লোড করা যায়নি।");
      }
    } catch (error) {
      console.error("তথ্য দেখার সময় সমস্যা:", error);
      toast.error("হেল্পার তথ্য আনার সময় সমস্যা হয়েছে।");
    }
  };

  const exportHelpersToExcel = () => {
    const tableData = filteredHelper.map((Helper, index) => ({
      "SL.": indexOfFirstItem + index + 1,
      নাম: Helper.Helper_name,
      মোবাইল: Helper.phone,
      ঠিকানা: Helper.address,
      বেতন: toNumber(Helper.salary),
      অবস্থা: Helper.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Helpers");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Helpers_data.xlsx");
  };

  const printHelpersTable = () => {
    const tableHeader = `
      <thead>
        <tr>
          <th>SL.</th>
          <th>নাম</th>
          <th>মোবাইল</th>
          <th>ঠিকানা</th>
          <th>বেতন</th>
        </tr>
      </thead>
    `;

    const tableRows = filteredHelper.map((helper, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${helper.helper_name || ""}</td>
        <td>${helper.phone || ""}</td>
        <td>${helper.address || ""}</td>
        <td>${helper.salary || ""}</td>
      </tr>
    `).join("");

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head>
          <title>হেল্পার তালিকা</title>
          <style>
            table { width: 100%; border-collapse: collapse; font-family: Arial; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            thead { background-color: #11375B; color: black; }
            tbody tr:nth-child(odd) { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <h3>হেল্পার তালিকা</h3>
          ${printContent}
        </body>
      </html>
    `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  const filteredHelper = helper.filter((h) => {
    const term = searchTerm.toLowerCase();
    return (
      h.helper_name?.toLowerCase().includes(term) ||
      h.phone?.toLowerCase().includes(term) ||
      h.address?.toLowerCase().includes(term) ||
      h.salary?.toString().toLowerCase().includes(term) ||
      h.status?.toLowerCase().includes(term)
    );
  });

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHelpers = filteredHelper.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHelper.length / itemsPerPage);

  return (
    <main className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-2xl" />
            হেল্পার তথ্য
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/helper-form">
              <button className="bg-primary  text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> হেল্পার যুক্ত করুন
              </button>
            </Link>
          </div>
        </div>

        <div className="md:flex justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportHelpersToExcel}
              className="py-2 px-5 bg-white shadow text-gray-700 font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              এক্সেল
            </button>
            <button
              onClick={printHelpersTable}
              className="py-2 px-5 bg-white shadow text-gray-700 font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
             প্রিন্ট
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="খুঁজুন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-7 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-md">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-200 text-gray-800 capitalize text-xs">
              <tr>
                <th className="p-2">SL.</th>
                <th className="p-2">নাম</th>
                <th className="p-2">মোবাইল</th>
                <th className="p-2">ঠিকানা</th>
                <th className="p-2">বেতন</th>
                <th className="p-2">অবস্থা</th>
                <th className="p-2 action_column">একশন</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentHelpers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    কোন হেল্পার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                currentHelpers?.map((helper, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-all border border-gray-200">
                    <td className="p-2 font-bold">{indexOfFirstItem + index + 1}</td>
                    <td className="p-2">{helper.helper_name}</td>
                    <td className="p-2">{helper.phone}</td>
                    <td className="p-2">{helper.address}</td>
                    <td className="p-2">{helper.salary}</td>
                    <td className="p-2">
                      <span className="text-white bg-green-700 px-3 py-1 rounded-md text-xs font-semibold">
                        {helper.status}
                      </span>
                    </td>
                    <td className="px-2 action_column">
                      <div className="flex gap-1">
                        <Link to={`/tramessy/HR/update-helper-form/${helper.id}`}>
                          <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                            <FaPen className="text-[12px]" />
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedHelperId(helper.id);
                            setIsOpen(true);
                          }}
                          className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
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

        {currentHelpers.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
      </div>

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
                আপনি কি নিশ্চিত এই Helper মুছে দিতে চান?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  না
                </button>
                <button
                  onClick={() => handleDelete(selectedHelperId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewModalOpen && selectedHelper && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#000000ad] z-50">
          <div className="w-4xl p-5 bg-gray-100 rounded-xl mt-10">
            <h3 className="text-primary font-semibold text-base">Helper তথ্য</h3>
            <div className="mt-5">
              <ul className="flex border border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">নাম:</p> <p>{selectedHelper.Helper_name}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">মোবাইল:</p> <p>{selectedHelper.Helper_mobile}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">জরুরি যোগাযোগ:</p> <p>{selectedHelper.emergency_contact}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">ঠিকানা:</p> <p>{selectedHelper.address}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">NID:</p> <p>{selectedHelper.nid}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">লাইসেন্স:</p> <p>{selectedHelper.license}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">লাইসেন্সের মেয়াদ শেষ:</p> <p>{selectedHelper.license_expire_date}</p>
                </li>
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2">
                  <p className="w-48">নোট:</p> <p>{selectedHelper.note || "N/A"}</p>
                </li>
              </ul>
              <ul className="flex border-b border-r border-l border-gray-300">
                <li className="w-[428px] flex text-primary font-semibold text-sm px-3 py-2 border-r border-gray-300">
                  <p className="w-48">অবস্থা:</p> <p>{selectedHelper.status}</p>
                </li>
              </ul>
              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-white bg-primary py-1 px-2 rounded-md cursor-pointer hover:bg-secondary"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HelperList;
