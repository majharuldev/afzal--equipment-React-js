import { Button, Modal, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { RiEditLine, RiHomeOfficeLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { tableFormatDate } from "../../../components/Shared/formatDate";
import api from "../../../utils/axiosConfig";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toNumber } from "../../../hooks/toNumber";

const Office = () => {
  const [office, setOffice] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("")
  // Fetch customer ledger data
  useEffect(() => {
    api
      .get(`/office`)
      .then((response) => {
        if (response.data.success) {
          const data = response.data.data;
          setOffice(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching office data:", error);
        setLoading(false);
      });
  }, []);

    // search
  const filteredOfficeList = office.filter((dt) => {
    const term = searchTerm.toLowerCase();
    return dt.branch_name?.toLowerCase().includes(term);
  });

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/office/${id}`,
      );
      if (response.status === 200) {

        // Remove office data from local list
        setOffice((prev) => prev.filter((office) => office.id !== id));
        toast.success("শাখার তথ্য সফলভাবে মুছে ফেলা হয়েছে", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsModalOpen(false);
        setSelectedOfficeId(null);
      } else {
        throw new Error("মুছে ফেলার অনুরোধ ব্যর্থ হয়েছে");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("মুছতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // টেবিলের কলাম
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "created_at",
      render: (created_at) => tableFormatDate(created_at),
    },
    {
      title: "শাখা",
      dataIndex: "branch_name",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
    },
    {
      title: "শুরুর ব্যালেন্স",
      dataIndex: "opening_balance",
    },
     {
      title: "তৈরী করেছেন",
      dataIndex: "created_by",
    },
    {
      title: "কার্যকলাপ",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/HR/HRM/UpdateOfficeForm/${record.id}`}>
            <Button size="small" type="primary" className="!bg-white !text-primary !shadow-md">
              <RiEditLine />
            </Button>
          </Link>
          <Button
            size="small"
            className="!bg-white !text-red-500 !shadow-md"
            type="primary"
            onClick={() => {
              setSelectedOfficeId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const [currentPage, setCurrentPage] = useState([1]);
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOffices = office.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(office.length / itemsPerPage);

    // Export to Excel
const exportOfficeToExcel = () => {
  const tableData = filteredOfficeList.map((office, index) => ({
    "SL.": index + 1,
    Date: office.created_at,
    Branch: office.branch_name,
    Address: office.address,
    "Opening Balance": toNumber(office.opening_balance),
    "Created By" : office.created_by
  }));

  const worksheet = XLSX.utils.json_to_sheet(tableData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Offices");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, "Office_data.xlsx");
};

// Print
const printOfficeTable = () => {
  const tableHeader = `
    <thead>
      <tr>
        <th>SL.</th>
        <th>তারিখ</th>
        <th>শাখা</th>
        <th>ঠিকানা</th>
        <th>শুরুর ব্যালেন্স</th>
        <th>তৈরী করেছেন</th>
      </tr>
    </thead>
  `;

  const tableRows = filteredOfficeList
    .map(
      (office, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${office.date || ""}</td>
        <td>${office.branch_name || ""}</td>
        <td>${office.address || ""}</td>
        <td>${office.opening_balance || ""}</td>
        <td>${office.created_by || ""}</td>
      </tr>
    `
    )
    .join("");

  const printContent = `
    <table>
      ${tableHeader}
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const WinPrint = window.open("", "", "width=900,height=650");
  WinPrint.document.write(`
    <html>
      <head>
        <title>Office List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h3 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          thead { background-color: #11375B; color: white; }
          tbody tr:nth-child(odd) { background-color: #f3f4f6; }
          thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h3>Office List</h3>
        ${printContent}
      </body>
    </html>
  `);

  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
};

  // if (loading) return <p className="text-center mt-16">Loading office...</p>;
  return (
    <div className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <RiHomeOfficeLine className="text-gray-800 text-2xl" />
            অফিস
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/OfficeForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> অফিস
              </button>
            </Link>
          </div>
        </div>

        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 flex-wrap">
            <button
              onClick={exportOfficeToExcel}
              className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              এক্সেল
            </button>

            {/* <button
              onClick={exportOfficeToPDF}
              className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              PDF
            </button> */}

            <button
              onClick={printOfficeTable}
              className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
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
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        className="absolute right-8 top-[5.8rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
          </div>
        </div>

        {/* table */}
        <Table
          columns={columns}
          dataSource={filteredOfficeList}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: office.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          locale={{ emptyText: "কোনো শাখার তথ্য পাওয়া যায়নি" }}
        />

        {/* Delete Modal */}
        <Modal
          title="মুছে ফেলার নিশ্চয়তা"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalOpen(false)}>
              না
            </Button>,
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => handleDelete(selectedOfficeId)}
            >
              হ্যাঁ, মুছুন
            </Button>,
          ]}
        >
          <p>আপনি কি নিশ্চিত এই শাখার তথ্য মুছে ফেলতে চান?</p>
        </Modal>
      </div>
    </div>
  );
};

export default Office;
