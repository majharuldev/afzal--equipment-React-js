
import { useEffect, useState, useRef, useContext } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import dayjs from "dayjs"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint, FaTrashAlt, FaTruck } from "react-icons/fa"
import toast, { Toaster } from "react-hot-toast"
import { FaPlus } from "react-icons/fa6"
import { Button, Form, Input, Modal, Select, Space, Table } from "antd"
import { RiEditLine } from "react-icons/ri"
import { tableFormatDate } from "../components/Shared/formatDate"
import DatePicker from "react-datepicker"
import api from "../utils/axiosConfig"
import { AuthContext } from "../providers/AuthProvider"

const DailyExpense = () => {
  const [expenses, setExpenses] = useState([])
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const printRef = useRef()
  const [expenseForm] = Form.useForm();
  const { user } = useContext(AuthContext);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // delete modal state
  const [selectedExpenseId, setSelectedExpenseId] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => setIsOpen(!isOpen);

  const salaryCategories = [
    "Salary",
  ];

  // Fetch employees when component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
        const response = await api.get(`/employee`);
        if (response.data.success) {
          const activeEmployees = response.data.data.filter(
            (emp) => emp.status?.toLowerCase() === "active"
          );
          setEmployees(activeEmployees);
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
      const res = await api.get(`/expense/${record.id}`);
      const data = res.data;

      // Form field গুলো prefill করুন
      expenseForm.setFieldsValue({
        date: data?.date || "",
        paid_to: data?.paid_to || "",
        amount: data?.amount || "",
        payment_category: data?.payment_category || "",
        branch_name: data?.branch_name || "",
        status: data?.status || "",
        particulars: data?.particulars || "",
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
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/expense`)
      const allExpenses = response.data || [];
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

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/expense/${id}`);

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

  // expense submit handler
  const handleFormSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        date: dayjs(values.date).format("YYYY-MM-DD"),
        created_by: user.name
      }

      if (editingId) {
        await api.put(`/expense/${editingId}`, payload)
        toast.success("খরচের তথ্য সফলভাবে আপডেট হয়েছে")
      } else {
        await api.post(`/expense`, payload)
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

const filteredData = expenses.filter((item) => {
  // search filter
  const matchesSearch = [item.paid_to, item.amount, item.payment_category, item.particulars]
    .join(" ")
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  // date filter
  let matchesDate = true;
  if (startDate) {
    matchesDate = dayjs(item.date).isAfter(dayjs(startDate).subtract(1, 'day')); // startDate included
  }
  if (endDate) {
    matchesDate = matchesDate && dayjs(item.date).isBefore(dayjs(endDate).add(1, 'day')); // endDate included
  }

  return matchesSearch && matchesDate;
});

  // csv
  const exportCSV = () => {
    const csvContent = [
      ["Serial", "Date", "Paid To", "Amount", "Category", "particulars"],
      ...filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.amount,
        item.payment_category,
        item.particulars,
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
      Sl: i + 1,
      Date: item.date,
      "Paid to": item.paid_to,
      Amount: item.amount,
      Category: item.payment_category,
      Remarks: item.particulars,
      Status: item.status,
      "Created By": item.created_by,
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
      head: [["Serial", "Date", "Paid To", "Amount", "Category", "particulars", "Status", "Created By"]],
      body: filteredData.map((item, i) => [
        i + 1,
        item.date,
        item.paid_to,
        item.amount,
        item.payment_category,
        item.particulars,
        item.status,
        item.created_by,
      ]),
    })
    doc.save("general_expense.pdf")
  }
  // print
 // print function
const printTable = () => {
  // print columns (action column excluded)
const printColumns = columns.filter(col => col.key !== "action");
  const doc = document.createElement("table");
  doc.style.borderCollapse = "collapse";
  doc.style.width = "100%";

  // Header
  const thead = doc.createTHead();
  const headRow = thead.insertRow();
  printColumns.forEach(col => {
    const th = document.createElement("th");
    th.innerText = col.title;
    th.style.border = "1px solid #ddd";
    th.style.padding = "8px";
    th.style.backgroundColor = "#f5f5f5";
    th.style.textAlign = "left";
    headRow.appendChild(th);
  });

  // Body
  const tbody = doc.createTBody();
  filteredData.forEach((item, i) => {
    const row = tbody.insertRow();
    printColumns.forEach(col => {
      const cell = row.insertCell();
      let value = item[col.dataIndex];
      if(col.dataIndex === "date") value = tableFormatDate(value);
      if(col.dataIndex === "index") value = i + 1;
      cell.innerText = value ?? "";
      cell.style.border = "1px solid #ddd";
      cell.style.padding = "8px";
    });
  });

  const win = window.open("", "", "width=900,height=650");
  win.document.write(`
    <html>
      <head>
        <title>Print</title>
        <style>body{font-family:Arial,sans-serif;}</style>
      </head>
      <body>${doc.outerHTML}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
};

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
      dataIndex: "paid_to",
      key: "paid_to",
    },
    {
      title: "পরিমাণ",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "ক্যাটাগরি",
      dataIndex: "payment_category",
      key: "payment_category",
    },
    {
      title: "মন্তব্য",
      dataIndex: "particulars",
      key: "particulars",
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

            {/* <button
              onClick={exportCSV}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-cyan-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FileText size={16} />
              সিএসভি
            </button> */}
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              এক্সেল
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              পিডিএফ
            </button>

            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              প্রিন্ট
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
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-14 top-[11.9rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
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
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setShowFilter(false)
                  setStartDate("")
                  setEndDate("")
                }}
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
              emptyText: "কোন ব্যয়ের তথ্য পাওয়া যায়নি",
            }}
          />
        </div>
      </div>

      {/*Add/update expense Modal */}
      <Modal
        title={editingId ? "বেতন খরচ আপডেট করুন" : "নতুন বেতন খরচ যোগ করুন"}
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
            label="যাকে প্রদান"
            name="paid_to"
            rules={[{ required: !editingId, message: "যাকে প্রদান করবেন তা আবশ্যক" }]}
          >
            <Select
              placeholder={employeesLoading ? "লোড হচ্ছে..." : "কর্মচারী নির্বাচন করুন"}
              loading={employeesLoading}
            >
              {!employeesLoading &&
                employees.map((employee) => (
                  <Select.Option key={employee.id} value={employee.employee_name}>
                    {employee.employee_name}
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

          <Form.Item
            label="ক্যাটাগরি"
            name="payment_category"
            rules={[{ required: !editingId, message: "ক্যাটাগরি নির্বাচন করুন" }]}
          >
            <Select placeholder="ক্যাটাগরি নির্বাচন করুন">
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

          <Form.Item label="মন্তব্য" name="particulars">
            <Input placeholder="মন্তব্য লিখুন" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-5 md:col-span-2">
            <Button onClick={handleCancel} type="default" className="!outline-primary">বাতিল</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="!bg-primary"
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
        title="বেতন  খরচ মুছে ফেলুন"
      >
        <div className="flex justify-center mb-4 text-red-500 text-4xl">
          <FaTrashAlt />
        </div>
        <p className="text-center">
          আপনি কি নিশ্চিত যে আপনি এই বেতন খরচ মুছে ফেলতে চান?
        </p>
      </Modal>
    </div>
  )
}

export default DailyExpense
