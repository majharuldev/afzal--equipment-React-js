import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import {
    FaFileExcel,
    FaFilePdf,
    FaFilter,
    FaPrint,
    FaTrashAlt,
    FaTruck,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { tableFormatDate } from "../../components/Shared/formatDate";
import DatePicker from "react-datepicker";
import { Button, Form, Input, Modal, Select, Space, Table } from "antd";
import api from "../../utils/axiosConfig";
import { AuthContext } from "../../providers/AuthProvider";
import { RiEditLine } from "react-icons/ri";

const GarageReceiveAmount = () => {
    const [expenses, setExpenses] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const printRef = useRef();
    const [expenseForm] = Form.useForm();
    const [customersLoading, setCustomersLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [errors, setErrors] = useState({});
    const { user } = useContext(AuthContext);
    // delete modal state
    const [selectedExpenseId, setSelectedExpenseId] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
    const toggleModal = () => setIsOpen(!isOpen);
    // Date filter state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // modal show handler
    const showModal = async (record = null) => {
        if (record) {
            try {
                const res = await api.get(`/garageVara/${record.id}`);
                const data = res.data?.data;

                // Form field গুলো prefill করুন
                expenseForm.setFieldsValue({
                    date: data?.date || "",
                    customer_name: data?.customer_name || "",
                    amount: data?.amount || "",
                    month_name: data?.month_name || "",
                    status: data?.status || "",
                    remarks: data?.remarks || "",
                });

                setEditingId(record.id);
            } catch (err) {
                console.log("Error loading data for modal", err);
            }
        } else {
            expenseForm.resetFields(); // নতুন ফিল্ড খালি হবে
            setEditingId(null);
        }
        setIsModalVisible(true);
    };

    // handle modal cancel
    const handleCancel = () => {
        expenseForm.resetFields(); // সব ফিল্ড খালি হবে
        setEditingId(null);
        setIsModalVisible(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    // Fetch customer list (for opening balance)
    useEffect(() => {
        setCustomersLoading(true);
        api
            .get(`/garageCustomer`)
            .then((res) => {
                if (res.data.success) {
                    const activeCustomers = res.data.data.filter(
                        (c) => c.status === "Active"
                    );
                    setCustomers(activeCustomers);
                }
            })
            .catch((err) => console.error("customer list fetch error:", err))
            .finally(() => setCustomersLoading(false));
    }, []);

    //   expense
    const fetchExpenses = async () => {
        try {
            const response = await api.get(
                `/garageVara`
            );
            const allExpenses = response.data?.data || [];
            // const utilityExpenses = allExpenses.filter(
            //     (expense) => expense.payment_category === "Utility"
            // );

            setExpenses(allExpenses);
            setLoading(false);
        } catch (err) {
            console.log("Data feching issue", "error");
            setLoading(false);
        }
    };

    // delete by id
    const handleDelete = async (id) => {
        try {
            const response = await api.delete(`/garageVara/${id}`);

            // Remove driver from local list
            setExpenses((prev) => prev.filter((expense) => expense.id !== id));
            toast.success("বেতন খরচ সফলভাবে মুছে ফেলা হয়েছে", {
                position: "top-right",
                autoClose: 3000,
            });

            setIsOpen(false);
            setSelectedExpenseId(null);
        } catch (error) {
            console.error("Delete error:", error.response || error);
            toast.error("মুছে ফেলার অনুরোধ ব্যর্থ হয়েছে", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    //   form submit handler
    const handleFormSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...values,
                date: dayjs(values.date).format("YYYY-MM-DD"),
                created_by: user.name,
            };

            if (editingId) {
                await api.put(
                    `/garageVara/${editingId}`,
                    payload
                );
                toast.success("Garage vara uttolon Data Update successful");
            } else {
                await api.post(
                    `/garageVara`,
                    payload
                );
                toast.success("Garage Vara uttolon Added successful");
            }

            handleCancel();
            fetchExpenses();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredData = expenses.filter((item) =>
        [item.customer_name, item.amount, item.month_name, item.remarks]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // column for table
    const columns = [
        {
            title: "ক্রমিক",
            dataIndex: "index",
            key: "index",
            render: (text, record, index) => index + 1,
        },
        {
            title: "তারিখ",
            dataIndex: "date",
            key: "date",
            render: (text) => tableFormatDate(text),
        },
        {
            title: "যাকে প্রদান",
            dataIndex: "customer_name",
            key: "customer_name",
        },
        {
            title: "পরিমাণ",
            dataIndex: "amount",
            key: "amount",
        },
        // {
        //     title: "ক্যাটাগরি",
        //     dataIndex: "category",
        //     key: "category",
        // },
        {
            title: "মন্তব্য",
            dataIndex: "remarks",
            key: "remarks",
        },
        {
            title: "স্ট্যাটাস",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "ক্রিয়েটেড",
            dataIndex: "created_by",
            key: "created_by",
        },
        {
            title: "অ্যাকশন",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button onClick={() => showModal(record)} size="small" type="primary" className="!bg-white !text-primary !shadow-md">
                        <RiEditLine />
                    </Button>
                    <button
                        onClick={() => {
                            setSelectedExpenseId(record.id);
                            setIsOpen(true);
                        }}
                        className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded shadow-md transition-all cursor-pointer"
                    >
                        <FaTrashAlt className="text-[12px]" />
                    </button>
                </Space >
            ),
        },
    ]

    // excel
    const exportExcel = () => {
        const data = filteredData.map((item, i) => ({
            ক্রমিক: i + 1,
            তারিখ: item.date,
            মাস: item.মাস,
            "যাকে প্রদান": item.paid_to,
            পরিমাণ: item.pay_amount,
            স্ট্যাটাস: item.status,
            মন্তব্য: item.remarks,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "General Expense");
        const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer]), "general_expense.xlsx");
    };
    // pdf
    const exportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            head: [["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"]],
            body: filteredData.map((item, i) => [
                i + 1,
                item.date,
                item.paid_to,
                item.pay_amount,
                item.payment_category,
                item.remarks,
            ]),
        });
        doc.save("general_expense.pdf");
    };
    // print
    const printTable = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "", "width=900,height=650");
        win.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredExpense = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className=" min-h-screen">
            <Toaster />
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-4">
                {/* Header */}
                <div className="md:flex items-center justify-between mb-6">
                    <h1 className="text-xl font-extrabold text-black flex items-center gap-3">
                        <FaTruck className="text-black text-2xl" />
                        ভাড়া উত্তোলন
                    </h1>
                    <div className="mt-3 md:mt-0 flex gap-2">
                        {/* <Link to="/tramessy/AddSallaryExpenseForm"> */}
                        <button
                            onClick={() => showModal()}
                            className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <FaPlus /> যোগ
                        </button>
                        {/* </Link> */}
                        <button
                            onClick={() => setShowFilter((prev) => !prev)} // Toggle filter
                            className=" text-primary border border-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                            <FaFilter /> ফিল্টার
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4">
                    <div className="flex flex-wrap gap-2">
                        {/* <button
              onClick={exportCSV}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FileText size={16} />
              CSV
            </button> */}
                        <button
                            onClick={exportExcel}
                            className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                        >
                            <FaFileExcel className="" />
                            এক্সেল
                        </button>
                        {/*                                     
                                      <button
                                        onClick={exportPDF}
                                        className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                                      >
                                        <FaFilePdf className="" />
                                        PDF
                                      </button> */}

                        <button
                            onClick={printTable}
                            className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                        >
                            <FaPrint className="" />
                            প্রিন্ট
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">সার্চ:</span>
                        <input
                            type="text"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="সার্চ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/*  Clear button */}
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                                className="absolute right-15 top-48 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Conditional Filter Section */}
                {showFilter && (
                    <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="শুরুর তারিখ"
                            locale="en-GB"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
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
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            isClearable
                        />
                        <div className="w-xs mt-3 md:mt-0 flex gap-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                <FaFilter /> মুছে ফেলুন
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div ref={printRef}>
                    <Table
                        columns={columns}
                        dataSource={filteredExpense}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            current: currentPage,
                            pageSize: itemsPerPage,
                            total: filteredData.length,
                            onChange: (page) => setCurrentPage(page),
                            showSizeChanger: false,
                            position: ['bottomCenter'],
                        }}
                        locale={{
                            emptyText: "কোন ভাড়া উত্তোলন তথ্য পাওয়া যায়নি",
                        }}
                    />
                </div>
            </div>

            {/*Add/update expense Modal */}
            <Modal
                title={editingId ? " ভাড়া উত্তোলন আপডেট করুন" : "নতুন ভাড়া উত্তোলন  যোগ করুন"}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
            >
                <Form
                    form={expenseForm}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-4"
                >
                    <Form.Item
                        label="তারিখ"
                        name="date"
                        rules={[{ required: editingId, message: "তারিখ আবশ্যক" }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        label="প্রদানকারী ব্যক্তি"
                        name="customer_name"
                        rules={[{ required: !editingId, message: "প্রদানকারী ব্যক্তি করবেন তা আবশ্যক" }]}
                    >
                        <Select
                            placeholder={customersLoading ? "লোড হচ্ছে..." : "কর্মচারী নির্বাচন করুন"}
                            loading={customersLoading}
                        >
                            {!customersLoading &&
                                customers.map((employee) => (
                                    <Select.Option key={employee.id} value={employee.customer_name}>
                                        {employee.customer_name}
                                    </Select.Option>
                                ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="পরিমাণ"
                        name="amount"
                        rules={[{ required: !editingId, message: "পরিমাণ আবশ্যক" }]}
                    >
                        <Input type="number" placeholder="পরিমাণ লিখুন" />
                    </Form.Item>

                    {/* <Form.Item
                        label="শাখার নাম"
                        name="branch_name"
                        rules={[{ required: !editingId, message: "শাখার নাম আবশ্যক" }]}
                    >
                        <Input placeholder="শাখার নাম লিখুন" />
                    </Form.Item> */}
                    <Form.Item
                        label="মাসের নাম"
                        name="month_name"
                        rules={[{ required: !editingId, message: "শাখার নাম আবশ্যক" }]}
                    >
                        <Input placeholder="শাখার নাম লিখুন" />
                    </Form.Item>

                    {/* নতুন Status ফিল্ড */}
                    <Form.Item
                        label="স্ট্যাটাস"
                        name="status"
                        rules={[
                            { required: !editingId, message: "স্ট্যাটাস নির্বাচন করুন" }
                        ]}
                    >
                        <Select placeholder="অবস্থা নির্বাচন করুন">
                            <Select.Option value="paid">Paid</Select.Option>
                            <Select.Option value="unpaid">Unpaid</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="মন্তব্য" name="remarks">
                        <Input placeholder="মন্তব্য লিখুন" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-5 md:col-span-2">
                        <Button onClick={handleCancel}>বাতিল</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isSubmitting}
                        >
                            {editingId ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                        </Button>
                    </div>
                </Form>
            </Modal>
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
                        onClick={() => handleDelete(selectedExpenseId)}
                    >
                        হ্যাঁ
                    </Button>,
                ]}
                title="গ্যারেজ ভাড়া উত্তোলন মুছে ফেলুন"
            >
                <div className="flex justify-center mb-4 text-red-500 text-4xl">
                    <FaTrashAlt />
                </div>
                <p className="text-center">
                    আপনি কি নিশ্চিত যে আপনি এই গ্যারেজ ভাড়া উত্তোলন মুছে ফেলতে চান?
                </p>
            </Modal>
        </div>
    );
};

export default GarageReceiveAmount;
