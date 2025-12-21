import { useEffect, useRef, useState } from "react";
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
import api from "../utils/axiosConfig";
import { toNumber } from "../hooks/toNumber";
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

  // print
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

  // customer data
  useEffect(() => {
    // Fetch customers data
    api
      .get(`/customer`)
      .then((response) => {
        setCustomers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

  // Fetch trips data
  useEffect(() => {
    api
      .get(`/trip`)
      .then((response) => {
        setTrip(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
        setLoading(false);
      });
  }, []);

  //  Excel Export Function
  const exportTripsToExcel = () => {
    try {
      const data = filteredTrips.map((dt, index) => ({
        SL: index + 1,
        Date: tableFormatDate(dt.date),
        Customer: dt.customer || "N/A",
        "Equipment No": dt.vehicle_no || "N/A",
        Driver: dt.driver_name || "N/A",
         "Vendor Name": dt.vendor_name || "N/A",
        "Equipment Type": dt.equipment_type || "N/A",
        "Equipment Category": dt.vehicle_category || "N/A",
        "Equipment Size": dt.vehicle_size || "N/A",
        "Helper Name": dt.helper_name || "N/A", 
        "Work Place": dt.work_place || "--",
        "Load Point": dt.load_point || "--",
        "Unload Point": dt.unload_point || "--",
        "Transport Cost Type": dt.trans_cost_type || "--",
        "Work Time": toNumber(dt.work_time) || "--",
        Rate: toNumber(dt.rate) || "0",
        "Total Rent": toNumber(dt.total_rent) || "0",
        "parking_cost": toNumber(dt.parking_cost),
        "night_guard": toNumber(dt.night_guard),
        "toll_cost": toNumber(dt.toll_cost),
        "feri_cost": toNumber(dt.feri_cost),
        "police_cost": toNumber(dt.police_cost),
        "others_cost": toNumber(dt.others_cost),
        "chada": toNumber(dt.chada),
        "labor": toNumber(dt.labor),
        "fuel_cost": toNumber(dt.fuel_cost),
        "challan_cost": toNumber(dt.challan_cost),
        "Transport cost": toNumber(dt.trans_cost),
        "Total Exp": toNumber(dt.total_exp) || "0",
        "Profit": parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
         "log ref": dt.log_ref ? dt.log_ref : null,
        "log sign": dt.log_sign ? dt.log_sign : null,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Trips");
      XLSX.writeFile(wb, "Trip_Report.xlsx");
      toast.success("Excel file downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Excel export failed");
    }
  };

  //  PDF Export Function
  const exportTripsToPDF = () => {
    try {
      const doc = new jsPDF("l", "pt", "a4");

      doc.setFontSize(14);
      doc.text("Trip Report", 40, 40);

      const rows = filteredTrips.map((dt, index) => [
        index + 1,
        tableFormatDate(dt.date),
        dt.customer || "N/A",
        dt.vehicle_no || "N/A",
        dt.driver_name || "N/A",
        dt.work_place || "--",
        dt.load_point || "--",
        dt.unload_point || "--",
        dt.total_rent || "0",
        dt.total_exp || "0",
        parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0),
      ]);

      autoTable(doc, {
        startY: 60,
        head: [
          [
            "SL",
            "Date",
            "Customer",
            "Vehicle No",
            "Driver",
            "Work Place",
            "Load Point",
            "Unload Point",
            "Total Rent",
            "Total Exp",
            "Profit",
          ],
        ],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [17, 55, 91] },
        styles: { fontSize: 8 },
      });

      doc.save("Trip_Report.pdf");
      toast.success("PDF file downloaded");
    } catch (error) {
      console.error(error);
      toast.error("PDF export failed");
    }
  };
  // print
  const printTripsTable = () => {
    try {
      // ১️⃣ — Action column hide
      const actionColumns = document.querySelectorAll(".action_column");
      actionColumns.forEach((col) => (col.style.display = "none"));

      // ২️⃣ — Table body থেকে filteredTrips data দিয়ে নতুন HTML table বানানো (pagination ছাড়া)
      const rowsHTML = filteredTrips
        .map((dt, index) => {
          const profit =
            parseFloat(dt.total_rent || 0) - parseFloat(dt.total_exp || 0);
          return `
          <tr>
            <td>${index + 1}</td>
            <td>${tableFormatDate(dt.date)}</td>
            <td>${dt.customer || "N/A"}</td>
            <td>${dt.vehicle_no || "N/A"}</td>
            <td>${dt.driver_name || "N/A"}</td>
            <td>${dt.work_place || "--"}</td>
            <td>${dt.load_point || "--"}</td>
            <td>${dt.unload_point || "--"}</td>
            <td>${dt.total_rent || "0"}</td>
            <td>${dt.total_exp || "0"}</td>
            <td>${profit}</td>
          </tr>
        `;
        })
        .join("");

      // ৩️⃣ — Table Header
      const headerHTML = `
      <thead>
        <tr style="background-color:#11375B;color:white;">
          <th>SL.</th>
          <th>তারিখ</th>
          <th>কাস্টমার</th>
          <th>ইকুইপমেন্ট নং</th>
          <th>অপারেটর/ড্রাইভার</th>
          <th>কাজের জায়গা</th>
          <th>লোডিং পয়েন্ট</th>
          <th>আনলোডিং পয়েন্ট</th>
          <th>ট্রিপ ভাড়া</th>
          <th>ট্রিপ খরচ</th>
          <th>মোট লাভ</th>
        </tr>
      </thead>
    `;

      // ৪️⃣ — নতুন print HTML তৈরি
      const printHTML = `
      <html>
        <head>
          <title>Trip Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h3 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; font-size: 12px; text-align: left; }
            tbody tr:nth-child(even) { background-color: #f3f4f6; }
            thead th {
          color: #000000 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
          </style>
        </head>
        <body>
          <h3>Trip Report</h3>
          <table>
            ${headerHTML}
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </body>
      </html>
    `;

      // ৫️⃣ — Print window খুলে print করা
      const WinPrint = window.open("", "", "width=900,height=650");
      WinPrint.document.write(printHTML);
      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();

      // ৬️⃣ — Action column restore
      actionColumns.forEach((col) => (col.style.display = ""));
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Print failed");
    }
  };


  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/trip/${id}`);

      // Axios er jonno check
      if (response.status === 200) {
        // UI update
        setTrip((prev) => prev.filter((item) => item.id !== id));
        toast.success("Trip deleted successfully", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsOpen(false);
        setselectedTripId(null);
      } else {
        throw new Error("Delete request failed");
      }
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
      const response = await api.get(
        `/trip/${id}`
      );
      setselectedTrip(response.data);
      setViewModalOpen(true);
    } catch (error) {
      console.error("View error:", error);
      toast.error("Can't get trip details");
    }
  };

  // Filter by date
  // const filteredTrips = trip.filter((trip) => {
  //   const tripDate = new Date(trip.date);
  //   const start = startDate ? new Date(startDate) : null;
  //   const end = endDate ? new Date(endDate) : null;

  //   if (start && end) {
  //     return tripDate >= start && tripDate <= end;
  //   } else if (start) {
  //     return tripDate.toDateString() === start.toDateString();
  //   } else {
  //     return true; // no filter applied
  //   }
  // });
  // Filtered Trips with Search, Date, Customer & Transport Type
  const filteredTrips = trip.filter((t) => {
    const tripDate = new Date(t.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Date filter
    const dateMatch =
      !start && !end
        ? true
        : start && end
          ? tripDate >= start && tripDate <= end
          : start
            ? tripDate.toDateString() === start.toDateString()
            : true;

    // Customer filter
    const customerMatch = selectedCustomer
      ? t.customer?.toLowerCase().includes(selectedCustomer.toLowerCase())
      : true;

    // Transport Type filter
    const transportMatch = transportType
      ? t.transport_type === transportType
      : true;

    // Search filter (checks multiple fields)
    const searchMatch = searchTerm
      ? Object.values(t)
        .some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    return dateMatch && customerMatch && transportMatch && searchMatch;
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
      width: 50,
      render: (_, record, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date) => tableFormatDate(date),
    },
    {
      title: "কাস্টমার",
      key: "customer",
      width: 100,
      render: (_, record) => (
        <div>
          <div> {record.customer || "N/A"}</div>
        </div>
      ),
    },
    {
      title: "ইকুইপমেন্ট নং",
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
      width: 70,
      render: (_, record) => (
        <div>
          <div> {record.driver_name || "N/A"}</div>
          {/* <div>মোবাইল: {record.driver_mobile || "N/A"}</div>
          <div>কমিশন: {record.driver_commission || "0"}</div> */}
        </div>
      ),
    },
    {
      title: "প্রোজেক্ট নাম",
      dataIndex: "work_place",
      key: "work_place",
    },
    {
      title: "লোডিং পয়েন্ট",
      dataIndex: "load_point",
      key: "load_point",
      render: (_, record) => (
        record.load_point ? record.load_point : "--"
      ),
    },
    {
      title: "আনলোডিং পয়েন্ট",
      dataIndex: "unload_point",
      key: "unload_point",
      render: (_, record) => (
        record.unload_point ? record.unload_point : "--"
      ),
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
        record.total_exp
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
      width: 100,
      className: "action_column",
      render: (_, record) => (
        <Space size="small">
          {/* <Link to={`/tramessy/UpdateTripForm/${record.id}`}>
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
            />
          </Link> */}
          <Link to={`/tramessy/update-equipment-operation-form/${record.id}`}>
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

          <button
            onClick={() => {
              setselectedTripId(record.id);
              setIsOpen(true);
            }}
            className="text-red-500 hover:text-white hover:bg-red-500 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
          >
            <FaTrashAlt className="text-[12px]" />
          </button>
        </Space>
      ),
    },
  ];

  // if (loading) return <p className="text-center mt-16">Loading trip...</p>;

  return (
    <main className=" ">
      <Toaster />
      <div className=" overflow-hidden overflow-x-auto mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            ইকুইপমেন্ট রেকর্ড
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/add-equipment-operation-form">
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
                className="absolute right-3 top-[1rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
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
                placeholderText="শুরুর তারিখ"
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
                placeholderText="শেষ তারিখ"
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
              <option value="">কাস্টমার নির্বাচন করুন</option>
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
              <option value="">ট্রান্সপোর্টের ধরন</option>
              <option value="own_transport">নিজস্ব ট্রান্সপোর্ট</option>
              <option value="vendor_transport">ভেন্ডর ট্রান্সপোর্ট</option>
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
          scroll={{ x: "max-content" }}
          loading={loading}
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
        {/* {selectedTrip && (
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>কাস্টমার:</strong> {selectedTrip.customer}</p>
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
        )} */}

        {selectedTrip ? (
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-[14px] text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">তারিখ:</p>
              <p>{tableFormatDate(selectedTrip.date)}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">কাস্টমার:</p>
              <p>{selectedTrip.customer || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">ইকুইপমেন্টের ধরণ:</p>
              <p>{selectedTrip.vehicle_category || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ইকুইপমেন্ট নং:</p>
              <p>{selectedTrip.vehicle_no || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">ড্রাইভার / অপারেটর:</p>
              <p>{selectedTrip.driver_name || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ড্রাইভার / অপারেটর মোবাইল:</p>
              <p>{selectedTrip.driver_mobile || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">প্রোজেক্ট নাম:</p>
              <p>{selectedTrip.work_place || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">লোড পয়েন্ট:</p>
              <p>{selectedTrip.load_point || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">আনলোড পয়েন্ট:</p>
              <p>{selectedTrip.unload_point || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">ট্রিপ ধরণ:</p>
              <p>{selectedTrip.transport_type || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ট্রান্সপোর্ট খরচ ধরণ:</p>
              <p>{selectedTrip.trans_cost_type || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ভেন্ডর নাম:</p>
              <p>{selectedTrip.vendor_name || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">যানবাহনের ধরন:</p>
              <p>{selectedTrip.vehicle_category || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">যানবাহনের সাইজ:</p>
              <p>{selectedTrip.vehicle_size || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ওয়ার্ক টাইম:</p>
              <p>{selectedTrip.work_time || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ভেন্ডর ভাড়া:</p>
              <p>{selectedTrip.transport_type === "vendor_transport" ? selectedTrip.total_exp : "--"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ভেন্ডর অগ্রিম:</p>
              <p>{selectedTrip.advance || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ভেন্ডর বাকি পরিমাণ:</p>
              <p>{selectedTrip.due_amount || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ফুয়েল খরচ:</p>
              <p>
                {selectedTrip.fuel_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">চালান খরচ:</p>
              <p>
                {selectedTrip.challan_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">শ্রমিক খরচ:</p>
              <p>
                {selectedTrip.labor || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">চাদা খরচ:</p>
              <p>
                {selectedTrip.chada || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">পুলিশ খরচ:</p>
              <p>
                {selectedTrip.police_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">টোল খরচ:</p>
              <p>
                {selectedTrip.toll_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ফেরি খরচ:</p>
              <p>
                {selectedTrip.feri_cost || "—"}
              </p>

            </div>
            <div>
              <p className="font-semibold text-gray-900">নাইট গার্ড খরচ:</p>
              <p>
                {selectedTrip.night_guard || "—"}
              </p>

            </div>
            <div>
              <p className="font-semibold text-gray-900">পার্কিং খরচ:</p>
              <p>
                {selectedTrip.parking_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">অন্যান্য খরচ:</p>
              <p>
                {selectedTrip.others_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ট্রান্সপোর্ট খরচ:</p>
              <p>
                {selectedTrip.trans_cost || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ডেমারেজ দিন:</p>
              <p>{selectedTrip.d_day || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ডেমারেজ পরিমাণ:</p>
              <p>{selectedTrip.d_amount || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">ডেমারেজ মোট:</p>
              <p>
                {selectedTrip.d_total || "—"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">রেট:</p>
              <p>{selectedTrip.rate || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">ট্রিপ ভাড়া:</p>
              <p>{selectedTrip.total_rent || "—"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">ট্রিপ খরচ:</p>
              <p>
                {selectedTrip.total_exp || "—"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">মোট লাভ:</p>
              <p>
                {parseFloat(selectedTrip.total_rent || 0) -
                  parseFloat(selectedTrip.total_exp || 0)}
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">মন্তব্য:</p>
              <p>{selectedTrip.remarks || "—"}</p>
            </div>
              <div>
              <p className="font-semibold text-gray-900">বিষয়:</p>
              <p>{selectedTrip.trip_count|| "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">লগ রেফারেন্স:</p>
              <p>{selectedTrip.log_ref || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">লগ স্বাক্ষর:</p>
              <p>{selectedTrip.log_sign || "—"}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">তৈরী করেছেন:</p>
              <p>{selectedTrip.created_by || "—"}</p>
            </div>
            {/* Trip Image */}
            <div className="flex justify-center items-start">
              {selectedTrip.image ? (
                <img
                  src={`${selectedTrip.image}`}
                  alt="Trip"
                  className="max-w-full max-h-64 object-contain border border-gray-300 rounded-md shadow-md"
                />
              ) : (
                <p className="text-gray-400">No image available</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">লোড হচ্ছে...</p>
        )}
      </Modal>
    </main>
  );
};

export default TripList;
