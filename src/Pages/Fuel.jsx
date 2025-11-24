import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt, FaPlus, FaUserSecret, FaPrint, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import { Table, Modal, Button, Select, Input, DatePicker as AntDatePicker, Card } from "antd";
import { DownloadOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { RiEditLine } from "react-icons/ri";
import { tableFormatDate } from "../components/Shared/formatDate";
import api from "../utils/axiosConfig";
import { toNumber } from "../hooks/toNumber";
import { IoMdClose } from "react-icons/io";
const { Option } = Select;
const { RangePicker } = AntDatePicker;

const Fuel = () => {
  const [fuel, setfuel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedfuel, setSelectedfuel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleFilter, setVehicleFilter] = useState(null);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficialProductId, setSelectedOfficialProductId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);

  useEffect(() => {
    api
      .get(`/purchase`)
      .then((response) => {
        if (response.data.status === "Success") {
          setfuel(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  // Filter by date
  const filtered = fuel.filter((dt) => {
    const dtDate = new Date(dt.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return dtDate >= start && dtDate <= end;
    } else if (start) {
      return dtDate.toDateString() === start.toDateString();
    } else {
      return true;
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
  const filteredfuel = vehicleFiltered.filter((dt) => {
    if (!(dt.category === "fuel" || dt.category === "fuel")) {
      return false;
    }
    const term = searchTerm.toLowerCase();
    return (
      dt.id?.toString().toLowerCase().includes(term) ||
      dt.supplier_name?.toLowerCase().includes(term) ||
      dt.vehicle_no?.toLowerCase().includes(term) ||
      dt.driver_name?.toLowerCase().includes(term)
    );
  });

  // Vehicle No dropdown unique values
  const uniqueVehicles = [...new Set(fuel.map((p) => p.vehicle_no))];

  // view car by id
  const handleViewCar = async (id) => {
    try {
      const response = await api.get(
        `/purchase/${id}`
      );
      if (response.data.status === "Success") {
        setSelectedfuel(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("fuel Information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("fuel Information could not be loaded.");
    }
  };

  if (loading) return <p className="text-center mt-16">ডেটা লোড হচ্ছে...</p>;

  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentfuel = filteredfuel.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredfuel.length / itemsPerPage);

  // Excel Export Function
  const exportExcel = () => {
    const dataToExport = filteredfuel.map((dt, index) => ({
      "SL No": index + 1,
      "Date": tableFormatDate(dt.date),
      "Category": dt.category,
      "Supplier Name": dt.supplier_name,
      "Branch Name": dt.branch_name,
      "Driver": dt.driver_name !== "null" ? dt.driver_name : "N/A",
      "Equipment No": dt.vehicle_no || "N/A",
      "Item Name": dt.items?.map(i => i.item_name).join(", "),
      "Quantity (Litter)": dt.items?.map(i => toNumber(i.quantity)).join(", "),
      "Unit Price": dt.items?.map(i => toNumber(i.unit_price)).join(", "),
      "Total Amount": toNumber(dt.purchase_amount),
      "Remarks": toNumber(dt.remarks) || "N/A",
      "Created By": dt.created_by
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fuel List");

    XLSX.writeFile(workbook, "Fuel_List.xlsx");
    toast.success("Excel ফাইল ডাউনলোড সম্পন্ন হয়েছে!");
  };


  // PDF Export Function
  // PDF Export Function
  const exportPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(16);
    doc.text("Fuel List", 40, 40);

    if (startDate || endDate) {
      doc.setFontSize(10);
      doc.text(
        `Date: ${startDate || "Start"} to ${endDate || "End"}`,
        40,
        55
      );
    }

    // Convert table data exactly as shown like AntD table
    const tableData = filteredfuel.flatMap((item, index) => {
      if (item.items && item.items.length > 0) {
        return item.items.map((subItem) => [
          index + 1,
          tableFormatDate(item.date),
          item.supplier_name,
          item.driver_name !== "null" ? item.driver_name : "N/A",
          item.vehicle_no || "N/A",
          subItem.item_name,
          subItem.quantity,
          subItem.unit_price,
          item.purchase_amount,
        ]);
      }

      // Default (no items array)
      return [
        [
          index + 1,
          tableFormatDate(item.date),
          item.supplier_name,
          item.driver_name !== "null" ? item.driver_name : "N/A",
          item.vehicle_no || "N/A",
          item.item_name,
          item.quantity,
          item.unit_price,
          item.purchase_amount,
        ],
      ];
    });

    autoTable(doc, {
      head: [
        [
          "SL",
          "Date",
          "Supplier",
          "Driver",
          "Vehicle No",
          "Item Name",
          "Quantity",
          "Unit Price",
          "Total Cost",
        ],
      ],
      body: tableData,
      startY: 70,
      theme: "grid",
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: 255,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { top: 30 },
    });

    doc.save("Fuel_List.pdf");
    toast.success("PDF downloaded successfully!");
  };
  // Print Function
  // Print Function (Updated)
  const printTable = () => {
    // Create table header (English Header)
    const tableHeader = `
    <thead>
      <tr>
        <th>SL</th>
        <th>Date</th>
        <th>Supplier</th>
        <th>Driver</th>
        <th>Vehicle No</th>
        <th>Item name</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Total Cost</th>
      </tr>
    </thead>
  `;

    // Generate table rows exactly like AntD table
    const tableRows = filteredfuel
      .flatMap((item, index) => {
        if (item.items && item.items.length > 0) {
          return item.items.map(
            (sub) => `
            <tr>
              <td>${index + 1}</td>
              <td>${tableFormatDate(item.date)}</td>
              <td>${item.supplier_name}</td>
              <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
              <td>${item.vehicle_no || "N/A"}</td>
              <td>${sub.item_name}</td>
              <td>${sub.quantity}</td>
              <td>${sub.unit_price}</td>
              <td>${item.purchase_amount}</td>
            </tr>
        `
          );
        }

        return [
          `
        <tr>
          <td>${index + 1}</td>
          <td>${tableFormatDate(item.date)}</td>
          <td>${item.supplier_name}</td>
          <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
          <td>${item.vehicle_no || "N/A"}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${item.purchase_amount}</td>
        </tr>
      `,
        ];
      })
      .join("");

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

    // Create Print Window
    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
    <html>
      <head>
        <title>-</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }

          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }

          thead tr {
            background: linear-gradient(to right, #11375B, #1e4a7c);
            color: white;
          }

          th, td {
            padding: 8px;
            border: 1px solid #ddd;
            text-align: center;
          }

          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }

          .footer {
            margin-top: 20px;
            text-align: right;
            font-size: 12px;
            color: #555;
          }

          @media print {
            body { margin: 0; }
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
        <h2>ফুয়েল তালিকা</h2>

        ${printContent}

        <div class="footer">
          Printed On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/purchase/${id}`);

      // Remove driver from local list
      setfuel((prev) => prev.filter((account) => account.id !== id));
      toast.success("Fuel সফলভাবে মুছে ফেলা হয়েছে", {
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


  // Ant Design Table Columns
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) => indexOfFirstItem + index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      key: "date",
      render: (date) => tableFormatDate(date),
    },
    {
      title: "সাপ্লায়ার নাম",
      dataIndex: "supplier_name",
      key: "supplier_name",
    },
    {
      title: "ড্রাইভার",
      dataIndex: "driver_name",
      key: "driver_name",
      render: (driver) => driver !== "null" ? driver : "N/A",
    },
    // {
    //   title: "গাড়ির ক্যাটাগরি",
    //   dataIndex: "vehicle_category",
    //   key: "vehicle_category",
    //   render: (category) => category !== "null" ? category : "N/A",
    // },
    {
      title: "ইকুইপমেন্ট নম্বর",
      dataIndex: "vehicle_no",
      key: "vehicle_no",
      render: (_, record) => record?.vehicle_no || "N/A",
    },
    // { title: "ফুয়েল টাইপ", dataIndex: "type", key: "type" },
    {
      title: "লিটার পরিমাণ", dataIndex: "quantity",
      render: (_, dt) => {
        return dt.items?.map((item, i) => (
          <div key={i}>{item.quantity}</div>
        ));
      }

    },
    {
      title: "লিটার প্রতি মূল্য", dataIndex: "unit_price",
      render: (_, dt) => {
        return dt.items?.map((item, i) => (
          <div key={i}>{item.unit_price}</div>
        ));
      }

    },
    // { title: "সার্ভিস চার্জ", dataIndex: "service_charge" },
    { title: "সর্বমোট খরচ", dataIndex: "purchase_amount" },
    {
      title: "অ্যাকশন",
      key: "action",
      width: 80,
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/Purchase/update-fuel/${record.id}`}>
            <Button
              type="primary"
              size="small"
              icon={<RiEditLine />}
              className="!bg-white !text-primary !shadow-md"
            />
          </Link>
          <Button
            type="primary"
            size="small"
            icon={<FaEye />}
            className="!bg-white !text-primary !shadow-md"
            onClick={() => handleViewCar(record.id)}
          />
          <button
            onClick={() => {
              setSelectedOfficialProductId(record.id);
              setIsOpen(true);
            }}
            className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
          >
            <FaTrashAlt className="text-[12px]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="md:p-2">
      <Card
        title={
          <div className="flex items-center">
            <FaUserSecret className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">ফুয়েল তালিকা</span>
          </div>
        }
        extra={
          <div className="flex gap-2">
            <Button
              icon={<FaFilter />}
              onClick={() => setShowFilter((prev) => !prev)}
            >
              ফিল্টার
            </Button>
            <Link to="/tramessy/FuelForm">
              <Button
                type="primary"
                icon={<FaPlus />}
                className="!bg-primary"
              >
                ফুয়েল
              </Button>
            </Link>
          </div>
        }
        className="w-full shadow-xl rounded-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex gap-2">
            <Button icon={<FaFileExcel />} onClick={exportExcel}
              type="primary"
              className="!py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-green-200 hover:!text-white"
            >
              এক্সেল
            </Button>
            <Button icon={<FaFilePdf />} onClick={exportPDF}
              type="primary"
              className=" !py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-amber-200 hover:!text-white"
            >
              পিডিএফ
            </Button>
            <Button icon={<FaPrint />} onClick={printTable}
              type="primary"
              className=" !text-primary !py-2 !px-5 hover:!bg-primary !bg-gray-50 !shadow-md !shadow-blue-200 hover:!text-white"
            >
              প্রিন্ট
            </Button>
          </div>

          <Input
            placeholder="সার্চ করুন..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
        </div>

        {showFilter && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-md mb-4">
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

            <Select
              value={vehicleFilter}
              onChange={(value) => {
                setVehicleFilter(value);
                setCurrentPage(1);
              }}
              placeholder="সব গাড়ির নম্বর"
              allowClear
              style={{ width: '100%' }}
            >
              {uniqueVehicles.map((v, index) => (
                <Option key={index} value={v}>
                  {v}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setVehicleFilter("");
                setShowFilter(false);
              }}
              icon={<FaFilter />}
              className="!bg-primary !text-white"
            >
              মুছে ফেলুন
            </Button>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={currentfuel}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: filteredfuel.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            showQuickJumper: true,
            position: ['bottomCenter'],
          }}
          locale={{ emptyText: "কোন ডেটা পাওয়া যায়নি" }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="মেইনটেনেন্স তথ্য"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            বন্ধ
          </Button>
        ]}
        width={700}
      >
        {selectedfuel && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex justify-between p-2">
              <span className="font-medium">প্রোডাক্ট আইডি:</span>
              <span>{selectedfuel.id}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">সরবরাহকারীর নাম:</span>
              <span>{selectedfuel.supplier_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ড্রাইভারের নাম:</span>
              <span>{selectedfuel.driver_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ইকুইপমেন্ট ক্যাটাগরি:</span>
              <span>{selectedfuel.vehicle_category}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ইকুইপমেন্ট নম্বর:</span>
              <span>{selectedfuel.vehicle_no}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">ক্যাটাগরি:</span>
              <span>{selectedfuel.category}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">আইটেমের নাম:</span>
              <span>{selectedfuel.item_name}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">পরিমাণ:</span>
              <span>{selectedfuel.quantity}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">একক মূল্য:</span>
              <span>{selectedfuel.unit_price}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">মোট:</span>
              <span>{selectedfuel.fuel_amount}</span>
            </div>
            <div className="col-span-2 flex flex-col items-center p-2">
              <span className="font-medium mb-2">বিলের ছবি:</span>
              <img
                src={`https://afzalcons.com/backend/uploads/purchase/${selectedfuel.image}`}
                alt="Bill"
                className="w-48 h-48 object-contain rounded-lg border"
              />
            </div>
          </div>
        )}
      </Modal>

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
                আপনি কি নিশ্চিত যে আপনি এই ফুয়েল ডিলিট করতে চান?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  না
                </button>
                <button
                  onClick={() => handleDelete(selectedOfficialProductId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  হ্যাঁ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fuel;