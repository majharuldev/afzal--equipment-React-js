
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import dayjs from "dayjs"
import { Edit, FileText, FileSpreadsheet, FileImage, Printer, Plus, Filter, X } from "lucide-react"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTruck } from "react-icons/fa"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import toast, { Toaster } from "react-hot-toast"
import { FaPlus } from "react-icons/fa6"
import { Link } from "react-router-dom"
import BtnSubmit from "../components/Button/BtnSubmit"
import { Button, Form, Input, Modal, Select, Table } from "antd"
import { RiEditLine } from "react-icons/ri"

const DailyExpense = () => {
  const [expenses, setExpenses] = useState([])
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const printRef = useRef()
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    date: "",
    paid_to: "",
    pay_amount: "",
    payment_category: "",
    branch_name: "",
    remarks: "",
  })
  const [errors, setErrors] = useState({})
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const salaryCategories = [
    "Salary",
  ];

  // Fetch employees when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/employee/list`);
        if (response.data.status === "Success") {
          setEmployees(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        toast.error("Failed to load employee list");
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
    // fetchExpenses();
  }, []);
  // modal show handler
  const showModal = async (record = null) => {
    if (record) {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/expense/${record.id}`)
        const data = res.data?.data
        setFormData({
          date: data?.date || "",
          paid_to: data?.paid_to || "",
          pay_amount: data?.pay_amount || "",
          payment_category: data?.payment_category || "",
          branch_name: data?.branch_name || "",
          remarks: data?.remarks || "",
        })
        setEditingId(record.id)
      } catch (err) {
        // showToast("ডেটা লোড করতে সমস্যা হয়েছে", "error")
        console.log("error show modal")
      }
    } else {
      setFormData({
        date: "",
        paid_to: "",
        pay_amount: "",
        payment_category: "",
        remarks: "",
      })
      setEditingId(null)
    }
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setFormData({
      date: "",
      paid_to: "",
      pay_amount: "",
      payment_category: "",
      branch_name: "",
      remarks: "",
    })
    setEditingId(null)
    setIsModalVisible(false)
    setErrors({})
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/expense/list`)
      const allExpenses = response.data?.data || [];
      const salaryExpenses = allExpenses.filter(expense =>
        expense.payment_category === 'Salary'
      );

      setExpenses(salaryExpenses);
      setLoading(false)
    } catch (err) {
      console.log("Data feching issue", "error")
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.date) newErrors.date = "তারিখ আবশ্যক"
    if (!formData.paid_to) newErrors.paid_to = "যাকে প্রদান করবেন তা আবশ্যক"
    if (!formData.pay_amount) newErrors.pay_amount = "পরিমাণ আবশ্যক"
    if (!formData.branch_name) newErrors.branch_name = "শাখার নাম আবশ্যক"
    if (!formData.payment_category) newErrors.payment_category = "ক্যাটাগরি নির্বাচন করুন"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: dayjs(formData.date).format("YYYY-MM-DD"),
      }

      if (editingId) {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/expense/update/${editingId}`, payload)
        toast.success("খরচের তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        await axios.post(`${import.meta.env.VITE_BASE_URL}/api/expense/create`, payload)
        toast.success("নতুন খরচ সফলভাবে যোগ হয়েছে")
      }

      handleCancel()
      fetchExpenses()
    } catch (err) {
      console.error(err)
      toast.error("Operation failed", "error")
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredData = expenses.filter((item) =>
    [item.paid_to, item.pay_amount, item.payment_category, item.remarks]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  )
  // csv
  const exportCSV = () => {
    const csvContent = [
      ["Serial", "Date", "Paid To", "Amount", "Category", "Remarks"],
      ...filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.pay_amount,
        item.payment_category,
        item.remarks,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "general_expense.csv")
  }
  // excel
  const exportExcel = () => {
    const data = filteredData.map((item, i) => ({
      ক্রমিক: i + 1,
      তারিখ: item.date,
      "যাকে প্রদান": item.paid_to,
      পরিমাণ: item.pay_amount,
      ক্যাটাগরি: item.payment_category,
      মন্তব্য: item.remarks,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "General Expense")
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([buffer]), "general_expense.xlsx")
  }
  // pdf
  const exportPDF = () => {
    const doc = new jsPDF()
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
    })
    doc.save("general_expense.pdf")
  }
  // print
  const printTable = () => {
    const content = printRef.current.innerHTML
    const win = window.open("", "", "width=900,height=650")
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
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

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
    },
    {
      title: "যাকে প্রদান",
      dataIndex: "paid_to",
      key: "paid_to",
    },
    {
      title: "পরিমাণ",
      dataIndex: "pay_amount",
      key: "pay_amount",
    },
    {
      title: "ক্যাটাগরি",
      dataIndex: "payment_category",
      key: "payment_category",
    },
    {
      title: "মন্তব্য",
      dataIndex: "remarks",
      key: "remarks",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <Button onClick={() => showModal(record)} size="small" type="primary" className="!bg-white !text-primary !shadow-md">
          <RiEditLine />
        </Button>
      ),
    },
  ]

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredExpense = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);;

  return (
    <div className=" min-h-screen">
      <Toaster />
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-4">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            বেতন খরচ
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            {/* <Link to="/tramessy/AddSallaryExpenseForm"> */}
            <button onClick={() => showModal()} className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
              <FaPlus /> যোগ করুন
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

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FileText size={16} />
              CSV
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>

            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
          {/* search */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">সার্চ:</span>
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="নাম, পরিমাণ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
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
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredExpense}
          loading={loading}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: "কোন ব্যয়ের তথ্য পাওয়া যায়নি",
          }}
        />
      </div>

      {/* Modal */}
      <Modal
        title={editingId ? "বেতন খরচ আপডেট করুন" : "নতুন বেতন খরচ যোগ করুন"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={formData}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Form.Item
            label="তারিখ"
            name="date"
            rules={[{ required: true, message: "তারিখ আবশ্যক" }]}
          >
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </Form.Item>

          <Form.Item
            label="যাকে প্রদান"
            name="paid_to"
            rules={[{ required: true, message: "যাকে প্রদান করবেন তা আবশ্যক" }]}
          >
            <Select
              placeholder={employeesLoading ? "লোড হচ্ছে..." : "কর্মচারী নির্বাচন করুন"}
              value={formData.paid_to}
              onChange={(value) => setFormData({ ...formData, paid_to: value })}
              loading={employeesLoading}
            >
              {!employeesLoading &&
                employees.map((employee) => (
                  <Select.Option key={employee.id} value={employee.full_name}>
                    {employee.full_name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="পরিমাণ"
            name="pay_amount"
            rules={[{ required: true, message: "পরিমাণ আবশ্যক" }]}
          >
            <Input
              type="number"
              placeholder="পরিমাণ লিখুন"
              value={formData.pay_amount}
              onChange={(e) => setFormData({ ...formData, pay_amount: e.target.value })}
            />
          </Form.Item>

          <Form.Item
            label="ক্যাটাগরি"
            name="payment_category"
            rules={[{ required: true, message: "ক্যাটাগরি নির্বাচন করুন" }]}
          >
            <Select
              placeholder="ক্যাটাগরি নির্বাচন করুন"
              value={formData.payment_category}
              onChange={(value) => setFormData({ ...formData, payment_category: value })}
            >
              {salaryCategories.map((category) => (
                <Select.Option key={category} value={category}>
                  {category}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="শাখার নাম"
            name="branch_name"
            rules={[{ required: true, message: "শাখার নাম আবশ্যক" }]}
          >
            <Input
              placeholder="শাখার নাম লিখুন"
              value={formData.branch_name}
              onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="মন্তব্য" name="remarks">
            <Input
              placeholder="মন্তব্য লিখুন"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
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
    </div>
  )
}

export default DailyExpense
