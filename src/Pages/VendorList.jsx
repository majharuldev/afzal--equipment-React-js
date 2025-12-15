
import axios from "axios";
import { useEffect, useState } from "react";
import { FaPlus, FaFilter, FaPen, FaTrashAlt, FaUsers, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RiEditLine } from "react-icons/ri";
import toast, { Toaster } from "react-hot-toast";
import { Table, Button, Space, Modal, Input, DatePicker, Card } from 'antd';
import { tableFormatDate } from "../components/Shared/formatDate";
import api from "../utils/axiosConfig";

const VendorList = () => {
  const [vendor, setVendor] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedvendorId, setselectedvendorId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch vendor data
  useEffect(() => {
    api
      .get(`/vendor`)
      .then((response) => {
        if (response.data.success) {
          setVendor(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // if (loading) return <p className="text-center mt-16">Loading vendor...</p>;

  // Export Excel
  const exportExcel = () => {
    const exportData = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, status }) => ({
        Date: tableFormatDate(date),
        Name: vendor_name,
        Mobile: mobile,
        RentCategory: rent_category,
        WorkArea: work_area,
        Status: status,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendors");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Vendor_List_${new Date().toISOString()}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "Date",
      "Name",
      "Mobile",
      "RentCategory",
      "WorkArea",
      "Status",
    ];
    const tableRows = filteredvendor.map(
      ({ date, vendor_name, mobile, rent_category, work_area, status }) => [
        tableFormatDate(date),
        vendor_name,
        mobile,
        rent_category,
        work_area,
        status,
      ]
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 55, 91] },
    });

    doc.save(`Vendor_List_${new Date().toISOString()}.pdf`);
  };

  // Print Table
  const printTable = () => {
    const printableContent = `
    <html>
      <head>
        <title>Vendor List</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            font-size: 12px;
            text-align: left;
          }
          th {
            background-color: #11375B;
            color: white;
          }
         thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        </style>
      </head>
      <body>
        <h2 style="text-align:center;">Vendor List</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>তারিখ</th>
              <th>তারিখ</th>
              <th>মোবাইল</th>
              <th>ভাড়া ক্যাটাগরি</th>
              <th>কাজের এলাকা</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${filteredvendor
        .map(
          (dt, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${tableFormatDate(dt.date)}</td>
                <td>${dt.vendor_name}</td>
                <td>${dt.mobile}</td>
                <td>${dt.rent_category}</td>
                <td>${dt.work_area}</td>
                <td>${dt.status}</td>
              </tr>`
        )
        .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printableContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/vendor/${id}`);

      // Axios er jonno check
      if (response.status === 200) {
        // UI update
        setVendor((prev) => prev.filter((item) => item.id !== id));
        toast.success("ভেন্ডর সফলভাবে মুছে ফেলা হয়েছে", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsOpen(false);
        setselectedvendorId(null);
      } else {
        throw new Error("মুছে ফেলার অনুরোধ ব্যর্থ হয়েছে");
      }
    } catch (error) {
      console.error("মুছে ফেলার ত্রুটি:", error);
      toast.error("মুছে ফেলার সময় একটি সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // search
  const filteredvendor = vendor.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const vendorDate = dt.date;
    const matchesSearch =
      dt.date?.toLowerCase().includes(term) ||
      dt.vendor_name?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.trip_id_invoice_no?.toLowerCase().includes(term) ||
      dt.mobile?.toLowerCase().includes(term) ||
      String(dt.capacity).includes(term) ||
      dt.type?.toLowerCase().includes(term) ||
      String(dt.quantity).includes(term) ||
      dt.price?.toLowerCase().includes(term) ||
      dt.total_price?.toLowerCase().includes(term);
    const matchesDateRange =
      (!startDate || new Date(vendorDate) >= new Date(startDate)) &&
      (!endDate || new Date(vendorDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendor = filteredvendor.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vendor.length / itemsPerPage);

  // Table columns for Antd Table
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) => indexOfFirstItem + index + 1,
    },
    {
      title: 'তারিখ',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (tableFormatDate(date)),
    },
    {
      title: 'নাম',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
    },
    {
      title: 'মোবাইল',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'ভাড়া ক্যাটাগরি',
      dataIndex: 'rent_category',
      key: 'rent_category',
    },
    {
      title: 'কাজের এলাকা',
      dataIndex: 'work_area',
      key: 'work_area',
    },
    {
      title: 'স্ট্যাটাস',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'অ্যাকশন',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Link to={`/tramessy/UpdateVendorForm/${record.id}`}>
            <Button type="primary" icon={<RiEditLine />} size="small" className="!bg-white !text-primary !px-1 !shadow" />
          </Link>
          <Button
            type="primary"
            icon={<FaTrashAlt className="!text-red-500" />}
            size="small"
            onClick={() => {
              setselectedvendorId(record.id);
              setIsOpen(true);
            }}
            className="!bg-white !px-1 !shadow"
          />
        </Space>
      ),
    },
  ];

  return (
    <main className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-lite flex items-center gap-3">
            <FaUsers className="text-primary text-2xl" />
            ভেন্ডর তালিকা
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddVendorForm">
              <Button type="primary" icon={<FaPlus />} className="!bg-primary">
                যোগ করুন
              </Button>
            </Link>
            {/* <Button
              onClick={() => setShowFilter((prev) => !prev)}
              icon={<FaFilter />}
            >
              ফিল্টার
            </Button> */}
          </div>
        </div>

        {/* export */}
        <div className="md:flex justify-between items-center mb-5">
          <Space>
            <Button onClick={exportExcel} icon={<FaFileExcel />}
              type="primary"
              className=" !py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-green-200 hover:!text-white"
            >
              এক্সেল
            </Button>
            <Button onClick={exportPDF} icon={<FaFileExcel />}
              type="primary"
              className=" !py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-amber-200 hover:!text-white"
            >
              পিডিএফ
            </Button>
            <Button onClick={printTable} icon={<FaPrint />}
              type="primary"
              className=" !text-primary !py-2 !px-5 hover:!bg-primary !bg-gray-50 !shadow-md !shadow-blue-200 hover:!text-white"
            >
              প্রিন্ট
            </Button>
          </Space>

          {/* Search */}
          <div className="mt-3 md:mt-0">
            <Input
              placeholder="ভেন্ডর খুজন..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 200 }}
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-6 top-[5.4rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Conditional Filter Section */}
        {/* {showFilter && (
          <Card className="my-5">
            <Space>
              <DatePicker 
                placeholder="শুরুর তারিখ" 
                onChange={(date, dateString) => setStartDate(dateString)}
              />
              <DatePicker 
                placeholder="শেষ তারিখ" 
                onChange={(date, dateString) => setEndDate(dateString)}
              />
              <Button 
                type="primary" 
                icon={<FaFilter />}
                onClick={() => setCurrentPage(1)}
              >
                Filter
              </Button>
            </Space>
          </Card>
        )} */}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={currentVendor}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredvendor.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          loading={loading}
          locale={{
            emptyText: (
              <div className="text-center py-10 text-gray-500 italic">
                <svg
                  className="w-12 h-12 text-gray-300 mb-2 mx-auto"
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
                কোনো ভেন্ডর ডাটা পাওয়া যায়নি।
              </div>
            )
          }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Delete modal */}
      <Modal
        title="মুছে ফেলার নিশ্চয়তা"
        open={isOpen}
        onCancel={toggleModal}
        footer={[
          <Button key="cancel" onClick={toggleModal}>
            No
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => handleDelete(selectedvendorId)}
          >
            Yes
          </Button>,
        ]}
      >
        <div className="text-center">
          <FaTrashAlt className="text-4xl text-red-500 mx-auto mb-4" />
          <p>আপনি কি নিশ্চিত, এই ভেন্ডরটি মুছে ফেলতে চান?</p>
        </div>
      </Modal>
    </main>
  );
};

export default VendorList;