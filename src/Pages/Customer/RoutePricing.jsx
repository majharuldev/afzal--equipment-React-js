
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaPlus, FaUsers } from "react-icons/fa";
import { PlusOutlined, EditOutlined, FileExcelOutlined, FilePdfOutlined, PrinterOutlined } from "@ant-design/icons";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import api from "../../utils/axiosConfig";
import { Button, Input, Modal, Select, Spin, Table } from "antd";

const RoutePricing = () => {
  const [routePricing, setRoutePricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [unloadpoints, setUnloadpoints] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    customer_name: "",
    vehicle_category: "",
    vehicle_size: "",
    load_point: "",
    unload_point: "",
    rate: "",
    vat: ""
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch customers
  useEffect(() => {
    api.get(`/customer`)
      .then(res => {
        setCustomers(res.data);
      })
      .catch(console.error);
  }, []);

  // Fetch unload points
  useEffect(() => {
    axios.get("https://bdapis.vercel.app/geo/v2.0/upazilas")
      .then(res => {
        if (res.data.success) setUnloadpoints(res.data.data);
      })
      .catch(console.error);
  }, []);

  // Fetch route pricing
  useEffect(() => {
    fetchRoutePricingData();
  }, []);

  const fetchRoutePricingData = () => {
    api.get(`/rate`)
      .then(res => {
        setRoutePricing(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Reset form & close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ customer_name: "", vehicle_category: "", load_point: "", vehicle_size: "", unload_point: "", rate: "" });
    setEditId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add or update
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.load_point || !formData.unload_point || !formData.rate) {
      toast.error("Please fill in all fields");
      return;
    }

    const apiCall = editId
      ? api.put(`/rate/${editId}`, formData)
      : api.post(`/rate`, formData);

    apiCall
      .then(res => {
        toast.success(editId ? "Route pricing updated!" : "Route pricing added!");
        closeModal();
        fetchRoutePricingData();
      })
      .catch(err => {
        console.error(err);
        toast.error("Error occurred");
      });
  };

  // equipment vehicle fetch
    useEffect(() => {
      const fetchVehicles = async () => {
        try {
          const res = await api.get("/vehicle");
          setVehicles(res.data);
        } catch (error) {
          console.log("Vehicle Load Error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVehicles();
    }, []);
    // equipment category options
    const vehicleOptions = vehicles.map(v => ({
      value: v.vehicle_category,
      label: v.vehicle_category,
    }));

  const handleEdit = (item) => {
    setFormData({
      customer_name: item.customer_name,
      vehicle_category: item.vehicle_category,
      vehicle_size: item.vehicle_size,
      load_point: item.load_point,
      unload_point: item.unload_point,
      rate: item.rate
    });
    setEditId(item.id);
    setIsModalOpen(true);
  };

  // Excel Export (filtered)
  const exportTripsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((dt, index) => ({
        SL: index + 1,
        Customer: dt.customer_name,
        "Vehicle Category": dt.vehicle_category,
        Size: dt.vehicle_size,
        "Load Point": dt.load_point,
        "Unload Point": dt.unload_point,
        Rate: dt.rate,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RoutePricing");
    XLSX.writeFile(workbook, "RoutePricing.xlsx");
  };

  // PDF Export (filtered)
  const exportTripsToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Route Pricing Report", 14, 15);

    // Table body
    const tableData = filteredData.map((dt, index) => [
      index + 1,
      dt.customer_name || "-",
      dt.vehicle_category,
      dt.vehicle_size,
      dt.load_point,
      dt.unload_point,
      dt.rate,
    ]);

    autoTable(doc, {
      head: [["SL", "Customer", "Vehicle Category", "Size", "Load Point", "Unload Point", "Rate"]],
      body: tableData,
      startY: 25,
      theme: "grid",
      headStyles: { fillColor: [17, 55, 91], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 2, halign: "center" },
    });

    doc.save("RoutePricing.pdf");
    toast.success("PDF downloaded!");
  };
  

  // Print Table (filtered)
  const printTripsTable = () => {
    const printWindow = window.open("", "", "width=1000,height=700");
    const tableRows = filteredData
      .map(
        (dt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${dt.customer_name || "-"}</td>
        <td>${dt.vehicle_category || "-"}</td>
        <td>${dt.vehicle_size || "-"}</td>
        <td>${dt.load_point || "-"}</td>
        <td>${dt.unload_point || "-"}</td>
        <td>${dt.rate || "-"}</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Route Pricing</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h2 { color: #11375B; text-align: center; font-size: 22px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { padding: 8px; border: 1px solid #ddd; text-align: center; }
          th { background-color: #11375B; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          tr:hover { background-color: #f1f5f9; }
          .footer { margin-top: 20px; text-align: right; font-size: 12px; color: #555; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h2>Route Pricing Report</h2>
        <table>
          <thead>
            <tr>
              <th>SL</th>
              <th>Customer</th>
              <th>Vehicle Category</th>
              <th>Size</th>
              <th>Load Point</th>
              <th>Unload Point</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

// filtered
  const filteredData = routePricing.filter(item =>
    item.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vehicle_size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.load_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unload_point?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rate?.toString().includes(searchTerm)
  );

  const columns = [
    { title: "ক্রমিক", render: (_, __, index) => index + 1 },
    { title: "কাস্টমার", dataIndex: "customer_name" },
    { title: "গাড়ির ধরন", dataIndex: "vehicle_category" },
    { title: "সাইজ", dataIndex: "vehicle_size" },
    { title: "লোড পয়েন্ট", dataIndex: "load_point" },
    { title: "আনলোড পয়েন্ট", dataIndex: "unload_point" },
    { title: "ভাড়া", dataIndex: "rate" },
    {
      title: "অ্যাকশন",
      render: (item) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleEdit(item)}
          type="primary"
        >
          সম্পাদনা
        </Button>
      ),
    },
  ];


 if (loading) return <Spin tip="লোড হচ্ছে..." className="mt-10" />;

  // Pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomer = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <main className="p-2">
      <Toaster />
      <div className="w-[22rem] md:w-full max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 md:p-4 border border-gray-200">

        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-gray-800 text-2xl" />
            কাস্টমার রুটভিত্তিক মূল্য
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 bg-primary text-white px-4 py-1 rounded-md shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <FaPlus /> মূল্য যোগ করুন
          </button>
        </div>
        {/* Filter and Search */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex gap-1 md:gap-3 text-gray-700 font-semibold rounded-md">
            <button
              onClick={exportTripsToExcel}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              এক্সেল
            </button>
            <button
              onClick={exportTripsToPDF}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              পিডিএফ
            </button>
            <button
              onClick={printTripsTable}
              className="py-1 px-5 hover:bg-primary shadow bg-white hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              প্রিন্ট
            </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0 relative">
            {/* <span className="text-primary font-semibold pr-3">Search: </span> */}
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="কাস্টমার সার্চ করুন..."
                className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-7 w-full"
              />

              {/*  Clear button */}
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Table */}
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />
      </div>

      {/* Add/Edit Modal */}
       {/* Modal */}
      <Modal
        title={editId ? "রুট মূল্য সম্পাদনা" : "নতুন রুট মূল্য"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editId ? "হালনাগাদ" : "সংরক্ষণ"}
        cancelText="বাতিল"
      >
        <div className="space-y-3">
          <label>কাস্টমার</label>
          <Select
            showSearch
            value={formData.customer_name}
            onChange={(value) => setFormData({ ...formData, customer_name: value })}
            options={customers.map((c) => ({ value: c.customer_name, label: c.customer_name }))}
            style={{ width: "100%" }}
            placeholder="কাস্টমার নির্বাচন করুন"
          />

          <label>গাড়ির ধরন</label>
          <Select
            value={formData.vehicle_category}
            onChange={(value) => setFormData({ ...formData, vehicle_category: value })}
            options={vehicleOptions}
            style={{ width: "100%" }}
            placeholder="ধরন নির্বাচন করুন"
          />

          <label>লোড পয়েন্ট</label>
          <Input
            value={formData.load_point}
            onChange={(e) => setFormData({ ...formData, load_point: e.target.value })}
            placeholder="লোড পয়েন্ট লিখুন"
          />

          <label>আনলোড পয়েন্ট</label>
          <Select
            showSearch
            value={formData.unload_point}
            onChange={(value) => setFormData({ ...formData, unload_point: value })}
            options={unloadpoints.map((c) => ({ value: c.name, label: c.name }))}
            style={{ width: "100%" }}
            placeholder="আনলোড পয়েন্ট নির্বাচন করুন"
          />

          <label>গাড়ির সাইজ</label>
          <Input
            value={formData.vehicle_size}
            onChange={(e) => setFormData({ ...formData, vehicle_size: e.target.value })}
            placeholder="যেমন: ৭ টন / ১২ ফুট"
          />

          <label>ভাড়া (৳)</label>
          <Input
            type="number"
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
            placeholder="মূল্য লিখুন"
          />
        </div>
      </Modal>
    </main>
  );
};

export default RoutePricing;
