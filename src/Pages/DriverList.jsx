import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaEye, FaTrashAlt, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
// export
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Button, Modal, Space, Table } from "antd";
const CarList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // get single driver info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setDrivers(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading drivers...</p>;

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/driver/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete driver");
      }
      // Remove driver from local list
      setDrivers((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("ড্রাইভার সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedDriverId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("ড্রাইভার মুছে ফেলার সময় সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // view driver by id
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/driver/show/${id}`
      );
      if (response.data.status === "Success") {
        setSelectedDriver(response.data.data);
        setIsViewOpen(true);
      } else {
        toast.error("ড্রাইভারের তথ্য লোড করা যায়নি.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("ড্রাইভারের তথ্য পাওয়ার সময় সমস্যা হয়েছে");
    }
  };
  // export functionality
  const exportDriversToExcel = () => {
    const tableData = currentDrivers.map((driver, index) => ({
      "SL.": indexOfFirstItem + index + 1,
      Name: driver.driver_name,
      Mobile: driver.driver_mobile,
      Address: driver.address,
      Emergency: driver.emergency_contact,
      License: driver.license,
      Expired: driver.license_expire_date,
      Status: driver.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Drivers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "drivers_data.xlsx");
  };
  const exportDriversToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Name",
      "Mobile",
      "Address",
      "Emergency",
      "License",
      "Expired",
      "Status",
    ];

    const tableRows = currentDrivers.map((driver, index) => [
      indexOfFirstItem + index + 1,
      driver.driver_name,
      driver.driver_mobile,
      driver.address,
      driver.emergency_contact,
      driver.license,
      driver.license_expire_date,
      driver.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("drivers_data.pdf");
  };
  const printDriversTable = () => {
    // Hide Action column
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
        table { width: 100%; border-collapse: collapse; font-family: Arial; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        thead { background-color: #11375B; color: white; }
        tbody tr:nth-child(odd) { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <h3>Driver List</h3>
      ${printContent}
    </body>
    </html>
  `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();

    // Restore Action column
    actionColumns.forEach((col) => {
      col.style.display = "";
    });
  };

  // search
  const filteredDriver = drivers.filter((driver) => {
    const term = searchTerm.toLowerCase();
    return (
      driver.driver_name?.toLowerCase().includes(term) ||
      driver.driver_mobile?.toLowerCase().includes(term) ||
      driver.nid?.toLowerCase().includes(term) ||
      driver.emergency_contact?.toLowerCase().includes(term) ||
      driver.address?.toLowerCase().includes(term) ||
      driver.license?.toLowerCase().includes(term) ||
      driver.status?.toLowerCase().includes(term)
    );
  });

  // table columns
  const columns = [
    { title: "ক্রমিক", key: "id", render: (_, __, index) => index+1 },
    { title: "নাম", dataIndex: "driver_name", key: "driver_name" },
    { title: "মোবাইল", dataIndex: "driver_mobile", key: "driver_mobile" },
    { title: "ঠিকানা", dataIndex: "address", key: "address",
      render: (address) => (<p className="line-clamp-2">{address}</p> ) 
     },
    { title: "জরুরি যোগাযোগ", dataIndex: "emergency_contact", key: "emergency_contact" },
    { title: "লাইসেন্স", dataIndex: "license", key: "license" },
    { title: "মেয়াদ শেষ", dataIndex: "license_expire_date", key: "license_expire_date" },
    { title: "স্ট্যাটাস", dataIndex: "status", key: "status", render: (status) => <span className="bg-green-700 text-white px-2 py-1 rounded">{status}</span> },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/tramessy/UpdateDriverForm/${record.id}`}>
            <Button icon={<FaPen />} type="primary" size="small" className="!bg-white !text-primary !shadow-md"/>
          </Link>
          <Button icon={<FaEye />} type="primary" size="small" className="!bg-white !text-primary !shadow-md" onClick={() => handleView(record.id)}></Button>
          <Button icon={<FaTrashAlt />} type="primary" className="!bg-white !text-red-500 !shadow-md" size="small" onClick={() => { setSelectedDriverId(record.id); setIsDeleteOpen(true); }}></Button>
        </Space>
      )
    }
  ];

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDrivers = filteredDriver.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  
  return (
    <main className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-3">
            <FaTruck className="text-gray-800 text-2xl" />
            অপারেটর/ড্রাইভার তালিকা
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddDriverForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus />অপারেটর/ড্রাইভার
              </button>
            </Link>
          </div>
        </div>

        {/* Export */}
        <div className="md:flex justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <button
              onClick={exportDriversToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={exportDriversToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              পিডিএফ
            </button>

            <button
              onClick={printDriversTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>

        {/* Table */}
        <Table
          id="driverTable"
          columns={columns}
          dataSource={currentDrivers}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredDriver.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
        />
      </div>

       {/* Delete Modal */}
      <Modal
        title="সতর্কবার্তা"
        visible={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        onOk={() => handleDelete(selectedDriverId)}
        okText="হ্যাঁ"
        cancelText="না"
      >
        <p>আপনি কি সত্যিই এই অপারেটর/ড্রাইভারটি মুছে ফেলতে চান?</p>
      </Modal>
      {/* View Driver Info Modal */}
      {/* View Modal */}
      <Modal
        title="অপারেটর/ড্রাইভার তথ্য"
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={<Button onClick={() => setIsViewOpen(false)}>বন্ধ করুন</Button>}
        width={700}
      >
        {selectedDriver && (
          <div className="space-y-2">
            <p><strong>নাম:</strong> {selectedDriver.driver_name}</p>
            <p><strong>মোবাইল:</strong> {selectedDriver.driver_mobile}</p>
            <p><strong>জরুরি যোগাযোগ:</strong> {selectedDriver.emergency_contact}</p>
            <p><strong>ঠিকানা:</strong> {selectedDriver.address}</p>
            <p><strong>NID:</strong> {selectedDriver.nid}</p>
            <p><strong>লাইসেন্স:</strong> {selectedDriver.license}</p>
            <p><strong>লাইসেন্স মেয়াদ শেষ:</strong> {selectedDriver.license_expire_date}</p>
            <p><strong>স্ট্যাটাস:</strong> {selectedDriver.status}</p>
            <p><strong>নোট:</strong> {selectedDriver.note || "N/A"}</p>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default CarList;
