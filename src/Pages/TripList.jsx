import axios from "axios";
import { use, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaTruck,
  FaPlus,
  FaFilter,
  FaEye,
  FaTrashAlt,
  FaPen,
  FaFileExcel,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import InvoicePrint from "../components/Shared/InvoicePrint";
import { Button, Col, Modal, Row, Space, Table } from "antd";
import DatePicker from "react-datepicker";
import { RiEditLine } from "react-icons/ri";
import { tableFormatDate } from "../components/Shared/formatDate";
const TripList = () => {
  const [trip, setTrip] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTripId, setselectedTripId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  //  filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [transportType, setTransportType] = useState("");

  // get single trip info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTrip, setselectedTrip] = useState(null);

  // print
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Invoice Print",
    onAfterPrint: () => {
      console.log("Print completed")
      setSelectedInvoice(null)
    },
    onPrintError: (error) => {
      console.error("Print error:", error)
    },
  })

  const handlePrintClick = (tripData) => {
    const formatted = {
      voucherNo: tripData.id,
      receiver: tripData.customer,
      address: tripData.unload_point,
      truckNo: tripData.vehicle_no,
      dln: tripData.date,
      loadingPoint: tripData.load_point,
      unloadingPoint: tripData.unload_point,
      rent: tripData.total_rent,
      loadingDemurrage: tripData.labor,
      inTime: tripData.date,
      outTime: tripData.date,
      totalDay: "1",
      totalDemurrage: tripData.labor,
      others: tripData.remarks || "N/A",
    }

    setSelectedInvoice(formatted)

    // Use setTimeout to ensure the component is rendered before printing
    setTimeout(() => {
      handlePrint()
    }, 100)
  }


  // Fetch trips data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setTrip(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  // excel
  const exportTripsToExcel = () => {
    const tableData = filteredTrips.map((dt, index) => ({
      "SL.": index + 1,
      Date: dt.date,
      "Driver Name": dt.driver_name || "N/A",
      "Driver Mobile": dt.driver_mobile || "N/A",
      Commission: dt.driver_commission || "0",
      "Load Point": dt.load_point,
      "Unload Point": dt.unload_point,
      "Trip Cost": dt.total_exp || 0,
      "Trip Fare": dt.total_rent || 0,
      "Total Profit":
        parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
    }));

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trips");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "trip_report.xlsx");
  };
  // pdf
  const exportTripsToPDF = () => {
    const doc = new jsPDF("landscape");

    const tableColumn = [
      "SL.",
      "Date",
      "Driver Name",
      "Mobile",
      "Commission",
      "Load Point",
      "Unload Point",
      "Trip Cost",
      "Trip Fare",
      "Profit",
    ];

    const tableRows = filteredTrips.map((dt, index) => [
      index + 1,
      dt.date,
      dt.driver_name || "N/A",
      dt.driver_mobile || "N/A",
      dt.driver_commission || "0",
      dt.load_point,
      dt.unload_point,
      dt.total_exp || "0",
      dt.total_rent || "0",
      parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("trip_report.pdf");
  };
  // print
  const printTripsTable = () => {
    const actionColumns = document.querySelectorAll(".action_column");
    actionColumns.forEach((col) => (col.style.display = "none"));

    const printContent = document.querySelector("table").outerHTML;
    const WinPrint = window.open("", "", "width=900,height=650");

    WinPrint.document.write(`
    <html>
    <head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        thead { background-color: #11375B; color: white; }
        tbody tr:nth-child(even) { background-color: #f3f4f6; }
      </style>
    </head>
    <body>
      <h3>Trip Report</h3>
      ${printContent}
    </body>
    </html>
  `);

    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();

    actionColumns.forEach((col) => (col.style.display = ""));
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/trip/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete driver");
      }
      // Remove trip from local list
      setTrip((prev) => prev.filter((trip) => trip.id !== id));
      toast.success("Trip deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedTripId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // view trip by id
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/trip/show/${id}`
      );
      if (response.data.status === "Success") {
        setselectedTrip(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Can't get trip details");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Can't get trip details");
    }
  };

  // Filter by date
  const filteredTrips = trip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return tripDate >= start && tripDate <= end;
    } else if (start) {
      return tripDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });

  const [currentPage, setCurrentPage] = useState([1])
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  // Table columns
  const columns = [
    {
      title: "SL.",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, record, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      key: "date",
      render: (date) => tableFormatDate(date),
    },
     {
      title: "কাস্টমার",
      key: "customer",
      render: (_, record) => (
        <div>
          <div> {record.customer || "N/A"}</div>
        </div>
      ),
    },
     {
      title: "ইকুইপমেন্ট নম্বর",
      key: "vehicle_no",
      render: (_, record) => (
        <div>
          <div> {record.vehicle_no || "N/A"}</div>
        
        </div>
      ),
    },
    {
      title: "অপারেটর/ড্রাইভার",
      key: "driver_info",
      render: (_, record) => (
        <div>
          <div> {record.driver_name || "N/A"}</div>
          {/* <div>মোবাইল: {record.driver_mobile || "N/A"}</div>
          <div>কমিশন: {record.driver_commission || "0"}</div> */}
        </div>
      ),
    },
    {
      title: "লোডিং পয়েন্ট",
      dataIndex: "load_point",
      key: "load_point",
    },
    {
      title: "আনলোডিং পয়েন্ট",
      dataIndex: "unload_point",
      key: "unload_point",
    },
    {
      title: "ট্রিপ ভাড়া",
      dataIndex: "total_rent",
      key: "total_rent",
    },
    {
      title: "ট্রিপ খরচ",
      key: "trip_cost",
      render: (_, record) => (
        record.transport_type === "vendor_transport" ? record.trip_rent : record.total_exp
      ),
    },
    {
      title: "মোট লাভ",
      key: "profit",
      render: (_, record) => (
        parseFloat(record.total_rent || 0) - parseFloat(record.total_exp || 0)
      ),
    },
    {
      title: "অ্যাকশন",
      key: "action",
      fixed: "right",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {/* <Link to={`/tramessy/UpdateTripForm/${record.id}`}>
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
            />
          </Link> */}
          <Link to={`/tramessy/UpdateTripForm/${record.id}`}>
            <button className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
              <RiEditLine className="text-[16px]" />
            </button>
          </Link>
          <button
            onClick={() => handleView(record.id)}
            className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
          >
            <FaEye className="text-[12px]" />
          </button>

          {/* <button
            onClick={() => handlePrintClick(record)}
            className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
          </button> */}
        </Space>
      ),
    },
  ];

  if (loading) return <p className="text-center mt-16">Loading trip...</p>;

  return (
    <main className=" ">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            ইকুইপমেন্ট রেকর্ড
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/AddTripForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> অপারেশন করুন
              </button>
            </Link>
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary  text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter />   ফিল্টার
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center mb-5">

          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={exportTripsToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              পিডিএফ
            </button>

            <button
              onClick={printTripsTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ট্রিপ খুঁজুন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="flex-1 min-w-0">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                locale="en-GB"
                className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                isClearable
              />
            </div>

            <div className="flex-1 min-w-0">
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                locale="en-GB"
                className="!w-full p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
                isClearable
              />
            </div>
            {/* customer select */}
            <select
              value={selectedCustomer}
              onChange={(e) => {
                setSelectedCustomer(e.target.value)
                setCurrentPage(1);
              }}
              className=" flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customer_name}>
                  {c.customer_name}
                </option>
              ))}
            </select>

            {/* transport select */}
            <select
              value={transportType}
              onChange={(e) => {
                setTransportType(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-0 p-2 border border-gray-300 rounded text-sm appearance-none outline-none"
            >
              <option value="">All Transport</option>
              <option value="own_transport">Own Transport</option>
              <option value="vendor_transport">Vendor Transport</option>
            </select>
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setSelectedCustomer("")
                  setTransportType("")
                  setStartDate("")
                  setEndDate("")
                }
                }
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {/* Table */}
        <Table
          columns={columns}
          dataSource={currentTrips}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredTrips.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center py-10">
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
                কোন ট্রিপ ডেটা পাওয়া যায়নি
              </div>
            )
          }}
        />
      </div>
      {/* Hidden Component for Printing */}
      <div style={{ display: "none" }} >
        {selectedInvoice && <InvoicePrint ref={printRef} data={selectedInvoice} />}
      </div>
      {/* Delete Modal */}
      <Modal
        open={isOpen}
        onCancel={toggleModal}
        footer={[
          <Button key="cancel" onClick={toggleModal}>
            না
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => handleDelete(selectedTripId)}
          >
            হ্যাঁ
          </Button>,
        ]}
        title="ট্রিপ মুছে ফেলুন"
      >
        <div className="flex justify-center mb-4 text-red-500 text-4xl">
          <FaTrashAlt />
        </div>
        <p className="text-center">
          আপনি কি নিশ্চিত যে আপনি এই ট্রিপটি মুছে ফেলতে চান?
        </p>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setViewModalOpen(false)}
          >
            বন্ধ
          </Button>,
        ]}
        title="ট্রিপ বিবরণ"
        width={800}
      >
        {selectedTrip && (
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>গ্রাহক:</strong> {selectedTrip.customer}</p>
              <p><strong>ট্রিপ তারিখ:</strong> {selectedTrip.date}</p>
              <p><strong>লোডিং পয়েন্ট:</strong> {selectedTrip.load_point}</p>
              <p><strong>আনলোডিং পয়েন্ট:</strong> {selectedTrip.unload_point}</p>
              <p><strong>ড্রাইভারের নাম:</strong> {selectedTrip.driver_name}</p>
              <p><strong>ড্রাইভারের মোবাইল:</strong> {selectedTrip.driver_mobile}</p>
            </Col>
            <Col span={12}>
              <p><strong>ড্রাইভার কমিশন:</strong> {selectedTrip.driver_commission}</p>
              <p><strong>জ্বালানী খরচ:</strong> {selectedTrip.fuel_cost}</p>
              <p><strong>মোট ভাড়া:</strong> {selectedTrip.total_rent}</p>
              <p><strong>গাড়ির নম্বর:</strong> {selectedTrip.vehicle_no}</p>
              <p><strong>মডেল নম্বর:</strong> {selectedTrip.model_no}</p>
              <p><strong>আনলোড চার্জ:</strong> {selectedTrip.unload_charge}</p>
            </Col>
          </Row>
        )}
      </Modal>
    </main>
  );
};

export default TripList;
