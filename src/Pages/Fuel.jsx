import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaTrashAlt, FaPlus, FaUserSecret, FaPrint, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import DatePicker from "react-datepicker";
import { Table, Modal, Button, Select, Input, DatePicker as AntDatePicker, Card } from "antd";
import { DownloadOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { RiEditLine } from "react-icons/ri";
import { tableFormatDate } from "../components/Shared/formatDate";

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

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
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
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
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
    const dataToExport = filteredfuel.map((item, index) => ({
      "SL No": index + 1,
      "Product ID": item.id,
      "Supplier Name": item.supplier_name,
      "Driver Name": item.driver_name !== "null" ? item.driver_name : "N/A",
      "Vehicle No": item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      "Category": item.category,
      "Item Name": item.item_name,
      "Quantity": item.quantity,
      "Unit Price": item.unit_price,
      "Total": item.fuel_amount,
      "Date": item.date,
      "Remarks": item.remarks || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "fuel List");

    XLSX.writeFile(workbook, "fuel_List.xlsx");
    toast.success("Excel ফাইল ডাউনলোড সম্পন্ন হয়েছে!");
  };

  // PDF Export Function
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("মেইনটেনেন্স তালিকা", 14, 15);

    if (startDate || endDate) {
      doc.setFontSize(10);
      doc.text(
        `তারিখ: ${startDate || "শুরু"} থেকে ${endDate || "শেষ"}`,
        14,
        22
      );
    }

    const tableData = filteredfuel.map((item, index) => [
      index + 1,
      item.id,
      item.supplier_name,
      item.driver_name !== "null" ? item.driver_name : "N/A",
      item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
      item.category,
      item.item_name,
      item.quantity,
      item.unit_price,
      item.fuel_amount,
    ]);

    autoTable(doc, {
      head: [
        [
          "ক্রমিক",
          "প্রোডাক্ট আইডি",
          "সাপ্লায়ার",
          "ড্রাইভার",
          "ইকুইপমেন্ট নম্বর",
          "ক্যাটাগরি",
          "আইটেম",
          "পরিমাণ",
          "একক মূল্য",
          "মোট",
        ],
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
    });

    doc.save("fuel_List.pdf");
    toast.success("PDF ফাইল ডাউনলোড সম্পন্ন হয়েছে!");
  };

  // Print Function
  const printTable = () => {
    const tableHeader = `
    <thead>
      <tr>
        <th>ক্রমিক</th>
        <th>প্রোডাক্ট আইডি</th>
        <th>সাপ্লায়ার</th>
        <th>ড্রাইভার</th>
        <th>ইকুইপমেন্ট নম্বর</th>
        <th>ক্যাটাগরি</th>
        <th>আইটেম</th>
        <th>পরিমাণ</th>
        <th>একক মূল্য</th>
        <th>মোট</th>
      </tr>
    </thead>
  `;

    const tableRows = filteredfuel
      .map(
        (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.id}</td>
          <td>${item.supplier_name}</td>
          <td>${item.driver_name !== "null" ? item.driver_name : "N/A"}</td>
          <td>${item.vehicle_no !== "null" ? item.vehicle_no : "N/A"}</td>
          <td>${item.category}</td>
          <td>${item.item_name}</td>
          <td>${item.quantity}</td>
          <td>${item.unit_price}</td>
          <td>${item.fuel_amount}</td>
        </tr>
      `
      )
      .join("");

    const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;

    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
    <html>
      <head>
        <title>মেইনটেনেন্স তালিকা</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
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
        </style>
      </head>
      <body>
        <h2>মেইনটেনেন্স তালিকা</h2>
        ${printContent}
        <div class="footer">
          মুদ্রণের তারিখ: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
      render: (vehicle) => vehicle !== "null" ? vehicle : "N/A",
    },
    { title: "ফুয়েল টাইপ", dataIndex: "type", key: "type" },
    { title: "গ্যালন/লিটার", dataIndex: "quantity", key: "quantity" },
    { title: "লিটার প্রতি খরচ", dataIndex: "price", key: "price" },
    {
      title: "সর্বমোট খরচ",
      render: (_, record) => record.quantity * record.price,
    },
    {
      title: "অ্যাকশন",
      key: "action",
      width: 80,
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/fuel/update-maintenance/${record.id}`}>
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
              <span className="font-medium">গাড়ির ক্যাটাগরি:</span>
              <span>{selectedfuel.vehicle_category}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium">গাড়ির নম্বর:</span>
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
                src={`${import.meta.env.VITE_BASE_URL}/public/uploads/fuel/${selectedfuel.bill_image}`}
                alt="Bill"
                className="w-48 h-48 object-contain rounded-lg border"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fuel;