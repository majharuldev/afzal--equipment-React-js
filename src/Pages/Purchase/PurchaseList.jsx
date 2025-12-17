
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus, FaUserSecret } from "react-icons/fa6";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import { IoMdClose } from "react-icons/io";
import { tableFormatDate } from "../../components/Shared/formatDate";
import api from "../../utils/axiosConfig";
import { toNumber } from "../../hooks/toNumber";
import { Link } from "react-router-dom";
import { Table } from "antd";

const PurchaseList = () => {
  const [purchase, setPurchase] = useState([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  // get single car info by id
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setselectedPurchase] = useState(null);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficialProductId, setSelectedOfficialProductId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    api
      .get(`/purchase`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPurchase(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // state
  const [vehicleFilter, setVehicleFilter] = useState("");

  // Filter by date
  const filtered = purchase.filter((dt) => {
    const dtDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });

  // Vehicle filter apply
  const vehicleFiltered = filtered.filter((dt) => {
    if (vehicleFilter) {
      return dt.vehicle_no === vehicleFilter;
    }
    return true;
  });

  // Search (Product ID, Supplier, Vehicle, Driver)
  const filteredPurchase = vehicleFiltered.filter((dt) => {
    const category = dt.category?.toLowerCase()
    if (!(category === "engine_oil" || category === "parts" || category === "documents")) {
      return false
    }

    const term = searchTerm.toLowerCase()
    if (!term) {
      return true
    }

    return (
      // dt.id?.toString().toLowerCase().includes(term) ||
      dt.priority?.toString().toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term)
    );
  });

  // Vehicle No dropdown unique values
  const uniqueVehicles = [...new Set(purchase.map((p) => p.vehicle_no))];
  // view car by id
  const handleViewCar = async (id) => {
    try {
      const response = await api.get(
        `/purchase/${id}`
      );
      if (response.data.status === "Success") {
        setselectedPurchase(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Purchase Information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Purchase Information could not be loaded.");
    }
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/purchase/${id}`);

      // Remove driver from local list
      setPurchase((prev) => prev.filter((account) => account.id !== id));
      toast.success("মেইনটেনেন্স সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setSelectedOfficialProductId(null);
    } catch (error) {
      console.error("Delete error:", error.response || error);
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // if (loading) return <p className="text-center mt-16">Loading data...</p>;
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchase = filteredPurchase.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPurchase.length / itemsPerPage);


  // Excel Export Function
  const exportExcel = () => {
    const dataToExport = []

    filteredPurchase.forEach((purchase, purchaseIndex) => {
      if (purchase.items && purchase.items.length > 0) {
        purchase.items.forEach((item, itemIndex) => {
          dataToExport.push({
            "SL No": dataToExport.length + 1,
            Date: tableFormatDate(purchase.date),
            "Product ID": purchase.id,
            "Supplier Name": purchase.supplier_name,
            "Branch Name": purchase.branch_name,
            "Driver Name": purchase.driver_name !== "null" ? purchase.driver_name : "N/A",
            "Vehicle No": purchase.vehicle_no !== "null" ? purchase.vehicle_no : "N/A",
            "Vehicle Category": purchase.vehicle_category !== "null" ? purchase.vehicle_category : "N/A",
            Category: purchase.category,
            "Item Name": item.item_name,
            Quantity: toNumber(item.quantity),
            "Unit Price": toNumber(item.unit_price),
            Total: toNumber(purchase.total),
            "Service Charge": toNumber(purchase.service_charge),
            "Purcahse Amount": toNumber(purchase.purchase_amount),
            "Service Date": tableFormatDate(purchase.service_date || "N/A"),
            "Next Service Date": tableFormatDate(purchase.next_service_date || "N/A"),
            "Last KM": purchase.last_km || "N/A",
            "Next KM": purchase.next_km || "N/A",
            Remarks: purchase.remarks || "N/A",
          })
        })
      } else {
        // If no items, still add the purchase record
        dataToExport.push({
          "SL No": dataToExport.length + 1,
          Date: tableFormatDate(purchase.date),
          "Product ID": purchase.id,
          "Supplier Name": purchase.supplier_name,
          "Driver Name": purchase.driver_name !== "null" ? purchase.driver_name : "N/A",
          "Vehicle No": purchase.vehicle_no !== "null" ? purchase.vehicle_no : "N/A",
          "Vehicle Category": purchase.vehicle_category !== "null" ? purchase.vehicle_category : "N/A",
          Category: purchase.category,
          "Item Name": "N/A",
          Quantity: 0,
          "Unit Price": 0,
          Total: toNumber(purchase.total),
          "Service Charge": purchase.service_charge,
          "Purcahse Amount": toNumber(purchase.purchase_amount),
          "Last KM": purchase.last_km || "N/A",
          "Next KM": purchase.next_km || "N/A",
          Remarks: purchase.remarks || "N/A",
        })
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List")

    XLSX.writeFile(workbook, "Purchase_List.xlsx")
    toast.success("Excel file downloaded successfully!")
  }

  // PDF Export Function
  const exportPDF = () => {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Purchase List", 14, 15)

    if (startDate || endDate) {
      doc.setFontSize(10)
      doc.text(`Date Range: ${startDate || "Start"} to ${endDate || "End"}`, 14, 22)
    }

    // শুধু Action বাদ দিয়ে table data তৈরি
    const tableData = filteredPurchase.map((item, index) => [
      index + 1,
      item.id,
      item.supplier_name,
      item.driver_name !== "null" ? item.driver_name : "N/A",
      item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      item.category,
      item.item_name,
      item.quantity,
      item.unit_price,
      item.purchase_amount,
    ])

    autoTable(doc, {
      head: [
        ["SL", "Product ID", "Supplier", "Driver", "Vehicle No", "Category", "Item", "Qty", "Unit Price", "Total"],
      ],
      body: tableData,
      startY: 30,
      theme: "grid",
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      margin: { top: 30 },
    })

    doc.save("Purchase_List.pdf")
    toast.success("PDF file downloaded successfully!")
  }

  // Print Function
  const printTable = () => {
    // শুধু filtered data ব্যবহার
    const tableHeader = `
    <thead>
      <tr>
       <th>ক্রমিক</th>
        <th>তারিখ</th>
        <th>প্রোডাক্ট আইডি</th>
        <th>সরবরাহকারী</th>
        <th>ড্রাইভার</th>
        <th>গাড়ির নম্বর</th>
        <th>গাড়ির ধরন</th>
        <th>ক্যাটাগরি</th>
        <th>আইটেম</th>
        <th>পরিমাণ</th>
        <th>ইউনিট মূল্য</th>
        <th>মোট</th>
        <th>সার্ভিস চার্জ</th>
        <th>ক্রয়ের পরিমাণ</th>
      </tr>
    </thead>
  `

    let rowIndex = 1
    const tableRows = filteredPurchase
      .map((item) => {
        // If purchase has items, create a row for each item
        if (item.items && item.items.length > 0) {
          return item.items
            .map(
              (subItem, i) => `
            <tr>
              <td>${rowIndex++}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${item.id}</td>
              <td>${item.supplier_name}</td>
              <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
              <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
              <td>${item.vehicle_category !== "null" ? item.vehicle_category : "N/A"}</td>
              <td>${item.category}</td>
              <td>${subItem.item_name}</td>
              <td>${toNumber(subItem.quantity)}</td>
              <td>${toNumber(subItem.unit_price)}</td>
              <td>${toNumber(subItem.total)}</td>
              <td>${item.service_charge}</td>
              <td>${toNumber(item.purchase_amount)}</td>
            </tr>
          `,
            )
            .join("")
        } else {
          // If no items, still show the purchase
          return `
            <tr>
              <td>${rowIndex++}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${item.id}</td>
              <td>${item.supplier_name}</td>
              <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
              <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
              <td>${item.vehicle_category !== "null" ? item.vehicle_category : "N/A"}</td>
              <td>${item.category}</td>
              <td>N/A</td>
              <td>0</td>
              <td>0</td>
              <td>${toNumber(item.service_charge)}</td>
              <td>${toNumber(item.purchase_amount)}</td>
            </tr>
          `
        }
      })
      .join("")

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`

    const printWindow = window.open("", "", "width=1200,height=700")
    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          thead tr {
            background: linear-gradient(to right, #11375B, #1e4a7c);
            color: white;
          }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          td { color: #11375B; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
          @media print { body { margin: 0; } }
          thead th {
            color: #000000 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        </style>
      </head>
      <body>
        <h2>মেইনটেনেন্স তালিকা</h2>
        ${printContent}
        <div class="footer">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // ---------- Ant Design Table Columns ----------
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "sl",
      render: (text, record, index) =>
        (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      render: (text) => tableFormatDate(text),
    },
    {
      title: "চালান নম্বর", dataIndex: "priority", render: (_, record) => (
        <div>
          {record.priority ? record.priority : "N/A"}
        </div>
      )
    },
    { title: "সরবরাহকারী", dataIndex: "supplier_name" },
    { title: "ড্রাইভার", dataIndex: "driver_name" },
    { title: "ইকুইপমেন্ট/গাড়ি", dataIndex: "vehicle_no" },
    { title: "ক্যাটাগরি", dataIndex: "category" },
    {
      title: "আইটেম", dataIndex: "item_name",
      render: (_, dt) => {
        return dt.items?.map((item, i) => (
          <div key={i}>{item.item_name}</div>
        ));
      }
    },
    {
      title: "পরিমাণ", dataIndex: "quantity",
      render: (_, dt) => {
        return dt.items?.map((item, i) => (
          <div key={i}>{item.quantity}</div>
        ));
      }

    },
    {
      title: "মূল্য", dataIndex: "unit_price",
      render: (_, dt) => {
        return dt.items?.map((item, i) => (
          <div key={i}>{item.unit_price}</div>
        ));
      }
    },
    { title: "সার্ভিস চার্জ", dataIndex: "service_charge" },
    { title: "মোট", dataIndex: "purchase_amount" },

    {
      title: "অ্যাকশন",
      render: (_, row) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/Purchase/update-maintenance/${row.id}`}>
            <button className="text-primary">
              <FaPen />
            </button>
          </Link>
          <button
            className="text-primary"
            onClick={() => handleViewCar(row.id)}
          >
            <FaEye />
          </button>
          <button
            className="text-red-600"
            onClick={() => {
              setSelectedOfficialProductId(row.id);
              setIsOpen(true);
            }}
          >
            <FaTrashAlt />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className=" p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-md p-2 py-10 md:p-4 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserSecret className="text-gray-800 text-2xl" />
            মেইনটেনেন্স তালিকা
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
            <Link to="/tramessy/Purchase/add-maintenance">
              <button className="bg-primary  text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus />মেইনটেনেন্স
              </button>
            </Link>
          </div>
        </div>
        {/* export */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              এক্সেল
            </button>
            {/* <button
              onClick={exportPDF}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
            >
              PDF
            </button> */}
            <button
              onClick={printTable}
              className="py-1 px-5 hover:bg-primary bg-white hover:text-white rounded shadow transition-all duration-300 cursor-pointer"
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
              placeholder="Search by Product ..."
              className="lg:w-60 border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
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
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value="">All Vehicle No</option>
              {uniqueVehicles.map((v, index) => (
                <option key={index} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <div className="">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setVehicleFilter("");
                  setShowFilter(false);
                }}
                className="bg-primary text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}
        {/* Table */}
        <Table
          columns={columns}
          dataSource={currentPurchase}
          loading={loading}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredPurchase.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
        />

      </div>
      {/* view modal */}
      {viewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5">
              <h2 className="text-2xl font-semibold text-gray-800">
                মেইনটেনেন্স বিস্তারিত
              </h2>
              <button
                onClick={() => setViewModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-10">

              {/* Image Preview */}
              {/* {selectedPurchase.image && (
                <div className="flex justify-center">
                  <img
                    src={selectedPurchase.image}
                    alt="Purchase"
                    className="w-60 h-60 object-cover rounded-xl border shadow-md"
                  />
                </div>
              )} */}

              {/* Basic Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  মূল তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">তারিখ:</span> {tableFormatDate(selectedPurchase.date)}</p>
                  <p><span className="font-medium text-gray-600">সরবরাহকারী নাম:</span> {selectedPurchase.supplier_name}</p>
                  <p><span className="font-medium text-gray-600">ক্যাটাগরি</span> {selectedPurchase.category}</p>
                  <p><span className="font-medium text-gray-600">ক্রয়ের পরিমাণ:</span> {selectedPurchase.purchase_amount}</p>
                  <p><span className="font-medium text-gray-600">সার্ভিস চার্জ:</span> {selectedPurchase.service_charge || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">মন্তব্য:</span> {selectedPurchase.remarks}</p>
                  <p><span className="font-medium text-gray-600">স্ট্যাটাস:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${selectedPurchase.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedPurchase.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                      {selectedPurchase.status}
                    </span>
                  </p>
                </div>
              </section>

              {/* Vehicle Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  ইকুইপমেন্ট তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">ড্রাইভার নাম:</span> {selectedPurchase.driver_name}</p>
                  <p><span className="font-medium text-gray-600">শাখার নাম:</span> {selectedPurchase.branch_name}</p>
                  <p><span className="font-medium text-gray-600">ইকুইপমেন্ট নং:</span> {selectedPurchase.vehicle_no}</p>
                  <p><span className="font-medium text-gray-600">ইকুইপমেন্ট ক্যাটাগরি:</span> {selectedPurchase.vehicle_category}</p>
                </div>
              </section>

              {/* Service Information */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  সার্ভিস তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">সার্ভিস তারিখ:</span> {selectedPurchase.service_date || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">পরবর্তী সার্ভিস তারিখ:</span> {selectedPurchase.next_service_date || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">শেষ কিমি:</span> {selectedPurchase.last_km || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">পরবর্তী কিমি:</span> {selectedPurchase.next_km || "N/A"}</p>
                  <p><span className="font-medium text-gray-600">চালান নম্বর:</span> {selectedPurchase.priority}</p>
                  <p><span className="font-medium text-gray-600">ভ্যালিডিটি:</span> {selectedPurchase.validity || "N/A"}</p>
                </div>
              </section>

              {/* Creator Info */}
              <section>
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                  সিস্টেম তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                  <p><span className="font-medium text-gray-600">তৈরি করেছেন:</span> {selectedPurchase.created_by}</p>
                  <div className="flex flex-col items-start ">
                    <span className="font-medium mb-2">বিলের ছবি:</span>
                    <img
                      src={`https://afzalcons.com/backend/uploads/purchase/${selectedPurchase.image}`}
                      alt="Bill"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                </div>
              </section>

              {/* Purchase Items */}
              {(
                <section>
                  <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">
                    মেইনটেনেন্স আইটেমসমূহ
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm md:text-base">
                      <thead className="bg-gray-100 text-gray-700">
                        <tr>
                          <th className="p-3 text-left">আইটেম নাম</th>
                          <th className="p-3 text-center">পরিমাণ</th>
                          <th className="p-3 text-center">ইউনিট প্রাইস</th>
                          <th className="p-3 text-center">মোট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPurchase?.items?.map((item, index) => (
                          <tr key={item.id} className=" hover:bg-gray-50">
                            <td className="p-3">{item.item_name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-center">{item.unit_price}</td>
                            <td className="p-3 text-center font-medium text-gray-800">{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white flex justify-end p-2">
              <button
                onClick={() => setViewModalOpen(false)}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all font-medium"
              >
                বন্ধ করুন
              </button>
            </div>
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
                আপনি কি নিশ্চিত যে আপনি এই মেইনটেনেন্স প্রোডাক্ট ডিলিট করতে চান?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedOfficialProductId)}
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
  );
};

export default PurchaseList;