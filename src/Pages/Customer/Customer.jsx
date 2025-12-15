
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaUsers, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Table, Modal, Button } from "antd";
import { RiEditLine } from "react-icons/ri";
import api from "../../utils/axiosConfig";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Customer = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("")

  // গ্রাহক ডাটা ফেচ
  useEffect(() => {
    api
      .get(`/customer`)
      .then((response) => {
          setCustomer(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("গ্রাহক তথ্য আনতে সমস্যা:", error);
        setLoading(false);
      });
  }, []);

  // filtered
  const filteredCustomer = customer.filter((c) => {
  const term = searchTerm.toLowerCase();
  return (
    c.customer_name?.toLowerCase().includes(term) ||
    c.mobile?.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.address?.toLowerCase().includes(term)
  );
});


  // গ্রাহক ডিলিট
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/customer/${id}`
      );
      setCustomer((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("গ্রাহকের তথ্য সফলভাবে ডিলিট করা হয়েছে");
      setIsModalOpen(false);
      setSelectedCustomerId(null);
    } catch (error) {
      console.error("ডিলিট ত্রুটি:", error);
      toast.error("ডিলিট করার সময় সমস্যা হয়েছে!");
    }
  };

  // টেবিল কলাম
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "নাম",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "মোবাইল",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "ইমেইল",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "রেট",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "শুরুর ব্যালেন্স",
      dataIndex: "opening_balance",
      key: "opening_balance",
    },
    {
      title: "তৈরি করেছেন",
      dataIndex: "created_by",
      key: "created_by",
    },
    {
      title: "অবস্থা",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/UpdateCustomerForm/${record.id}`}>
            <Button
              type="primary"
              size="small"
              className="!bg-white !text-primary"
            >
 <RiEditLine/>
            </Button>
          </Link>
          <Button
            type="primary"
            danger
            size="small"
           className="!bg-white !text-red-500"
            onClick={() => {
              setSelectedCustomerId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  // excel
  const exportOfficeToExcel = () => {
  const excelData = filteredCustomer.map((c, index) => ({
    SL: index + 1,
    Name: c.customer_name,
    Mobile: c.mobile,
    Email: c.email,
    Address: c.address,
    Rate: c.rate,
    "Opening Balance": c.opening_balance,
    Status: c.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customer List");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(data, "customer_list.xlsx");
};

// print
const printOfficeTable = () => {
  const printWindow = window.open("about:blank", "_blank");

  if (!printWindow) {
    alert("Popup blocked! Please allow popups.");
    return;
  }

  const html = `
    <html>
      <head>
        <title>Customer List</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            border: 1px solid #000;
            padding: 6px;
            font-size: 12px;
            text-align: left;
          }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Customer List</h2>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>নাম</th>
              <th>মোবাইল</th>
              <th>ইমেইল</th>
              <th>ঠিকানা</th>
              <th>রেট</th>
              <th>শুরুর ব্যালেন্স</th>
              <th>অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCustomer
              .map(
                (c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.customer_name || "-"}</td>
                <td>${c.mobile || "-"}</td>
                <td>${c.email || "-"}</td>
                <td>${c.address || "-"}</td>
                <td>${c.rate || "-"}</td>
                <td>${c.opening_balance || "-"}</td>
                <td>${c.status || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};

  return (
    <main>
      <Toaster />
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 border border-gray-200">
        {/* হেডার */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-2xl" />
            সকল গ্রাহকের তথ্য
          </h1>
          <div>
            <Link to="/tramessy/AddCustomer">
              <Button
                type="primary"
                icon={<FaPlus />}
                className="flex items-center !bg-primary"
              >
                 যোগ করুন
              </Button>
            </Link>
          </div>
        </div>
{/* export button & search */}
         <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 flex-wrap">
            <button
              onClick={exportOfficeToExcel}
              className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
            >
              Excel
            </button>

            <button
              onClick={printOfficeTable}
              className="py-1 px-5 bg-white shadow font-semibold rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
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
              placeholder="Search Office..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setCurrentPage(1);
        }}
        className="absolute right-10 top-[10.8rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
      >
        ✕
      </button>
    )}
          </div>
        </div>

        {/* টেবিল */}
        <Table
          columns={columns}
          dataSource={filteredCustomer}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: "কোনো গ্রাহকের তথ্য পাওয়া যায়নি",
          }}
        />
      </div>

      {/* ডিলিট মডাল */}
      <Modal
        title="সতর্কতা!"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            না
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => handleDelete(selectedCustomerId)}
          >
            হ্যাঁ, ডিলিট করুন
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত যে এই গ্রাহককে ডিলিট করতে চান?</p>
      </Modal>
    </main>
  );
};

export default Customer;
