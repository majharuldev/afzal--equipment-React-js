import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaFilter,
  FaPen,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";
import { Link } from "react-router-dom";
// export
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
//
import toast, { Toaster } from "react-hot-toast";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaTruck } from "react-icons/fa6";
import { Modal, Table, Button, Space } from "antd";
import { RiEditLine } from "react-icons/ri";

const RentList = () => {
  const [fuel, setFuel] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFuelId, setselectedFuelId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // Fetch rent vehicle data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setFuel(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching rent vehicle data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading data...</p>;

  // export functionality
  const headers = [
    { label: "#", key: "index" },
    { label: "ড্রাইভারের নাম", key: "driver_name" },
    { label: "গাড়ির নাম", key: "vehicle_name" },
    { label: "ফুয়েলের ধরন", key: "type" },
    { label: "ফুয়েলিং তারিখ", key: "date_time" },
    { label: "গ্যালন/লিটার", key: "quantity" },
    { label: "লিটার প্রতি খরচ", key: "price" },
    { label: "সকল খরচ", key: "total" },
  ];
  const csvData = fuel.map((dt, index) => ({
    index: index + 1,
    driver_name: dt.driver_name,
    vehicle_name: dt.vehicle_number,
    type: dt.type,
    date_time: dt.date_time,
    quantity: dt.quantity,
    price: dt.price,
    total: dt.quantity * dt.price,
  }));
  // export
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "fuel_data.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      "#",
      "ড্রাইভারের নাম",
      "গাড়ির নাম",
      "ফুয়েলের ধরন",
      "ফুয়েলিং তারিখ",
      "গ্যালন/লিটার",
      "লিটার প্রতি খরচ",
      "সকল খরচ",
    ];

    const tableRows = fuel.map((dt, index) => [
      index + 1,
      dt.driver_name,
      dt.driver_name,
      dt.type,
      dt.date_time,
      dt.quantity,
      dt.price,
      dt.quantity * dt.price,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("fuel_data.pdf");
  };
  const printTable = () => {
    // hide specific column
    const actionColumns = document.querySelectorAll(".action_column");
    actionColumns.forEach((col) => {
      col.style.display = "none";
    });
    const printContent = document.querySelector("table").outerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
    <html>
        <head>
          <title>Print</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
  `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/rent/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }
      // Remove fuel from local list
      setFuel((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Rent list deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedFuelId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting.!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // search
  const filteredData = fuel.filter((dt) => {
    const term = searchTerm.toLowerCase();
    const fuelDate = dt.date_time;
    const matchesSearch =
      dt.date_time?.toLowerCase().includes(term) ||
      dt.vehicle_number?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term) ||
      dt.trip_id_invoice_no?.toLowerCase().includes(term) ||
      dt.pump_name_address?.toLowerCase().includes(term) ||
      String(dt.capacity).includes(term) ||
      dt.type?.toLowerCase().includes(term) ||
      String(dt.quantity).includes(term) ||
      dt.price?.toLowerCase().includes(term) ||
      dt.total_price?.toLowerCase().includes(term);
    const matchesDateRange =
      (!startDate || new Date(fuelDate) >= new Date(startDate)) &&
      (!endDate || new Date(fuelDate) <= new Date(endDate));

    return matchesSearch && matchesDateRange;
  });

  const columns = [
    { title: "#", key: "index", render: (_, __, index) => index + 1 },
    { title: "বিক্রেতা/ড্রাইভারের নাম", dataIndex: "vendor_name", key: "vendor_name" },
    { title: "গাড়ির নাম/মডেল", dataIndex: "vehicle_name_model", key: "vehicle_name_model" },
    { title: "গাড়ির শ্রেণী", dataIndex: "vehicle_category", key: "vehicle_category" },
    { title: "গাড়ির আকার/ধারণ ক্ষমতা", dataIndex: "vehicle_size_capacity", key: "vehicle_size_capacity" },
    { title: "রেজি. নম্বর", dataIndex: "registration_number", key: "registration_number" },
    { title: "অবস্থা", dataIndex: "status", key: "status" },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <Space>
          <Link to={`/tramessy/UpdateRentVehicleForm/${record.id}`}>
            <Button type="primary" size="small" className="!bg-white !text-primary !shadow-md">
              <RiEditLine />
            </Button>
          </Link>
          <Button
            className="!bg-white !text-red-500 !shadow-md"
            type="primary"
            size="small"
            onClick={() => {
              setSelectedId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </Space>
      ),
    },
  ];
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRent = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  return (
    <main className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            ভাড়া গাড়ি
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddRentVehicleForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> যোগ করুন
              </button>
            </Link>
            {/* <button
              onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button> */}
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
          {/*  */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="খুজন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex justify-between gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>

            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> ফিল্টার
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <Table
          columns={columns}
          dataSource={currentRent}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredData.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
      {/* Delete modal */}
      <Modal
        title="ডিলিট কনফার্ম"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="no" onClick={() => setIsModalOpen(false)}>
            না
          </Button>,
          <Button key="yes" type="primary" danger onClick={() => handleDelete(selectedId)}>
            হ্যাঁ
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত যে ডেটা মুছে ফেলতে চান?</p>
      </Modal>
    </main>
  );
};

export default RentList;
