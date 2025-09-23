import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaFilter, FaPen, FaPlus, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Table, Modal, Button, Input, DatePicker } from "antd";

import { tableFormatDate } from "../../components/Shared/formatDate";
import { RiEditLine } from "react-icons/ri";

const { RangePicker } = DatePicker;

const OfficialProducts = () => {
    const [purchase, setPurchase] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [dateRange, setDateRange] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);   

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/list`)
            .then((res) => {
                if (res.data.status === "Success") {
                    setPurchase(res.data.data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("ডেটা লোড করতে সমস্যা:", err);
                setLoading(false);
            });
    }, []);

    // ফিল্টার ও সার্চ
    const filtered = purchase.filter((item) => {
        const dtDate = new Date(item.date);
        const start = dateRange[0] ? new Date(dateRange[0]) : null;
        const end = dateRange[1] ? new Date(dateRange[1]) : null;

        if (start && end) return dtDate >= start && dtDate <= end;
        if (start) return dtDate.toDateString() === start.toDateString();
        return true;
    }).filter((item) => {
        if (vehicleFilter) return item.vehicle_no === vehicleFilter;
        return true;
    }).filter((item) => {
        if (item.category === "engine_oil" || item.category === "parts") return false;
        const term = searchTerm.toLowerCase();
        return (
            item.id?.toString().toLowerCase().includes(term) ||
            item.supplier_name?.toLowerCase().includes(term) ||
            item.vehicle_no?.toLowerCase().includes(term) ||
            item.driver_name?.toLowerCase().includes(term)
        );
    });

    const uniqueVehicles = [...new Set(purchase.map(p => p.vehicle_no))];

    const handleViewPurchase = async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`);
            if (res.data.status === "Success") {
                setSelectedPurchase(res.data.data);
                setViewModalOpen(true);
            } else toast.error("পণ্য তথ্য লোড করা যায়নি।");
        } catch (err) {
            console.error(err);
            toast.error("পণ্য তথ্য লোড করা যায়নি।");
        }
    };

    // Pagination
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPurchase = filtered.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    // Excel Export
    const exportExcel = () => {
        const dataToExport = filtered.map((item, index) => ({
            "ক্রমিক": index + 1,
            "পণ্য আইডি": item.id,
            "সরবরাহকারী": item.supplier_name,
            "ড্রাইভার": item.driver_name !== "null" ? item.driver_name : "N/A",
            "যানবাহন নং": item.vehicle_no !== "null" ? item.vehicle_no : "N/A",
            "বিভাগ": item.category,
            "পণ্যের নাম": item.item_name,
            "পরিমাণ": item.quantity,
            "একক মূল্য": item.unit_price,
            "মোট": item.purchase_amount,
            "তারিখ": item.date,
            "মন্তব্য": item.remarks || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase List");
        XLSX.writeFile(workbook, "Purchase_List.xlsx");
        toast.success("Excel ফাইল সফলভাবে ডাউনলোড হয়েছে!");
    };

    // PDF Export
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("পণ্যের তালিকা", 14, 15);

        const tableData = filtered.map((item, index) => [
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
        ]);

        autoTable(doc, {
            head: [["ক্রমিক", "পণ্য আইডি", "সরবরাহকারী", "ড্রাইভার", "যানবাহন নং", "বিভাগ", "পণ্যের নাম", "পরিমাণ", "একক মূল্য", "মোট"]],
            body: tableData,
            startY: 30,
            theme: "grid",
            headStyles: { fillColor: [17, 55, 91], textColor: 255 },
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 30 },
        });

        doc.save("Purchase_List.pdf");
        toast.success("PDF ফাইল সফলভাবে ডাউনলোড হয়েছে!");
    };

    // Print function
    const printTable = () => {
        const tableHeader = `
      <thead>
        <tr>
          <th>ক্রমিক</th>
          <th>পণ্য আইডি</th>
          <th>সরবরাহকারী</th>
          <th>ড্রাইভার</th>
          <th>যানবাহন নং</th>
          <th>বিভাগ</th>
          <th>পণ্যের নাম</th>
          <th>পরিমাণ</th>
          <th>একক মূল্য</th>
          <th>মোট</th>
        </tr>
      </thead>
    `;
        const tableRows = filtered.map((item, index) => `
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
        <td>${item.purchase_amount}</td>
      </tr>
    `).join("");
        const printContent = `<table>${tableHeader}<tbody>${tableRows}</tbody></table>`;
        const printWindow = window.open("", "", "width=1000,height=700");
        printWindow.document.write(`<html><head><title>Purchase List</title><style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background: #11375B; color: white; }
      tr:nth-child(even) { background-color: #f9f9f9; }
    </style></head><body><h2>পণ্যের তালিকা</h2>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    // Ant Design Table Columns
    const columns = [
        { title: "ক্রমিক", dataIndex: "sl", key: "sl", render: (_, __, index) => indexOfFirstItem + index + 1 },
        { title: "তারিখ", dataIndex: "date", key: "date", render: (text) => tableFormatDate(text) },
        { title: "পণ্য আইডি", dataIndex: "id", key: "id" },
        { title: "সাপ্লায়ার", dataIndex: "supplier_name", key: "supplier_name" },
        { title: "বিভাগ", dataIndex: "category", key: "category" },
        { title: "পণ্যের নাম", dataIndex: "item_name", key: "item_name" },
        { title: "পরিমাণ", dataIndex: "quantity", key: "quantity" },
        { title: "একক মূল্য", dataIndex: "unit_price", key: "unit_price" },
        { title: "মোট", dataIndex: "purchase_amount", key: "purchase_amount" },
        {
            title: "অ্যাকশন",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Link to={`/tramessy/Purchase/update-officialProduct/${record.id}`}>
                        <Button size="small" type="primary" className="!bg-white !text-primary" icon={<RiEditLine />} />
                    </Link>
                    <Button size="small" className="!bg-white !text-primary" type="primary" onClick={() => handleViewPurchase(record.id)} icon={<FaEye />} />
                </div>
            ),
        },
    ];

    if (loading) return <p className="text-center mt-16">ডেটা লোড হচ্ছে...</p>;

    return (
        <div className="md:p-2">
            <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-5 border border-gray-200">
                <div className="md:flex justify-between items-center mb-6">
                    <h1 className="text-xl font-extrabold text-primary flex items-center gap-3">
                        <FaUserSecret className="text-2xl text-primary" />
                        অফিসিয়াল পণ্যের তালিকা
                    </h1>
                    <div className="flex gap-2 mt-3 md:mt-0 flex-wrap">
                        <Button onClick={() => setShowFilter(!showFilter)} icon={<FaFilter />}>ফিল্টার</Button>
                        <Link to="/tramessy/Purchase/add-officialProduct">
                            <Button type="primary" icon={<FaPlus />} className="!bg-primary">নতুন পণ্য</Button>
                        </Link>

                    </div>
                </div>

                 {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex items-center gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
           
            <div className="">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setVehicleFilter("");
                  setShowFilter(false);
                }}
                className="bg-gradient-to-r from-primary to-blue-600 text-white px-2 py-1.5 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> Clear 
              </button>
            </div>
          </div>
        )}
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={exportExcel}>এক্সেল</Button>
                        <Button onClick={exportPDF}>পিডিএফ</Button>
                        <Button onClick={printTable}>প্রিন্ট</Button>
                    </div>
                    <Input
                        placeholder="পণ্য অনুসন্ধান করুন..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="mb-3 md:w-1/3"
                        style={{ width: 250 }}
                    />
                </div>


                <Table
                    dataSource={currentPurchase}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        current: currentPage,
                        pageSize: itemsPerPage,
                        total: filtered.length,
                        onChange: (page) => setCurrentPage(page),
                        showSizeChanger: false,
                        showQuickJumper: true,
                        position: ['bottomCenter'],
                    }}
                />

                <Modal
                    open={viewModalOpen}
                    title="পণ্য তথ্য"
                    onCancel={() => setViewModalOpen(false)}
                    footer={[
                        <Button key="close" onClick={() => setViewModalOpen(false)} type="primary">
                            বন্ধ
                        </Button>,
                    ]}
                >
                    {selectedPurchase && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <p><b>পণ্য আইডি:</b> {selectedPurchase.id}</p>
                            <p><b>সরবরাহকারী:</b> {selectedPurchase.supplier_name}</p>
                            <p><b>বিভাগ:</b> {selectedPurchase.category}</p>
                            <p><b>পণ্যের নাম:</b> {selectedPurchase.item_name}</p>
                            <p><b>পরিমাণ:</b> {selectedPurchase.quantity}</p>
                            <p><b>একক মূল্য:</b> {selectedPurchase.unit_price}</p>
                            <p><b>মোট:</b> {selectedPurchase.purchase_amount}</p>
                            <div>
                                <b>বিল ছবি:</b>
                                <img
                                    src={`${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${selectedPurchase.bill_image}`}
                                    alt="বিল"
                                    className="w-32 h-32 object-cover mt-2"
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default OfficialProducts;
