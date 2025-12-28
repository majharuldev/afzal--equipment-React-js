import { useEffect, useState } from "react";
import { FaTruck, FaFilter, FaFileExcel, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Table, Button } from "antd";
import DatePicker from "react-datepicker";
import api from "../../utils/axiosConfig";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { set } from "react-hook-form";

const GarageProfitLoss = () => {
  const [garageVara, setGarageVara] = useState([]);   // Income
  const [garageExp, setGarageExp] = useState([]);     // Expense
  const [mergedData, setMergedData] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");

  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const uniqueMonthList = [...new Set(mergedData.map((item) => item.month_name))];

  // Load Garage Vara (Income)
  useEffect(() => {
    const fetchGarageVara = async () => {
      try {
        const res = await api.get(`/garageVara`);
        const sorted = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setGarageVara(sorted);
      } catch (err) {
        console.error("Garage Vara Load Error:", err);
      }
    };
    fetchGarageVara();
  }, []);

  // Load Garage Expense
  useEffect(() => {
    const fetchGarageExp = async () => {
      try {
        const res = await api.get(`/garageExp`);
        const sorted = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setGarageExp(sorted);
      } catch (err) {
        console.error("Garage Expense Load Error:", err);
      }
    };
    fetchGarageExp();
  }, []);

  //  Merge Income + Expense by DATE
  useEffect(() => {
    const merge = [];

    const allDates = new Set([
      ...garageVara.map((x) => x.date),
      ...garageExp.map((x) => x.date),
    ]);

    allDates.forEach((dt) => {
      const income = garageVara.filter((x) => x.date === dt);
      const expense = garageExp.filter((x) => x.date === dt);

      const incomeTotal = income.reduce((sum, i) => sum + Number(i.amount || 0), 0);
      const expenseTotal = expense.reduce((sum, e) => sum + Number(e.amount || 0), 0);

      merge.push({
        date: dt,
        month_name: income[0]?.month_name || "",
        customer_name: income.map((i) => i.customer_name).join(", "),
        garageVara: incomeTotal,
        garageExp: expenseTotal,
        profit: incomeTotal - expenseTotal,
      });
    });

    const sorted = merge.sort((a, b) => new Date(b.date) - new Date(a.date));
    setMergedData(sorted);
  }, [garageVara, garageExp]);

  // Search + Date Filter
  // const filteredData = mergedData.filter((item) => {
  //   const term = searchTerm.toLowerCase();
  //   const matchesSearch =
  //     item.customer_name?.toLowerCase().includes(term) ||
  //     item.month_name?.toLowerCase().includes(term) ||
  //     item.date?.includes(term);

  //   const matchesDate =
  //     (!startDate || new Date(item.date) >= new Date(startDate)) &&
  //     (!endDate || new Date(item.date) <= new Date(endDate));

  //   return matchesSearch && matchesDate;
  // });

 const filteredData = mergedData.filter((item) => {
  const term = searchTerm.toLowerCase();

  const matchesSearch =
    item.customer_name?.toLowerCase().includes(term) ||
    item.month_name?.toLowerCase().includes(term) ||
    item.date?.includes(term);

  // Convert item.date → YYYY-MM-DD only
  const itemDate = new Date(item.date + "T23:59:59");

  // Convert startDate
  const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;

  // Convert endDate → 23:59:59 (VERY IMPORTANT FIX)
  const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

  const matchesDate =
    (!start || itemDate >= start) &&
    (!end || itemDate <= end);

  const matchesMonth =
    !filterMonth || item.month_name === filterMonth;

  return matchesSearch && matchesDate && matchesMonth;
});


  // Excel Export
  const exportExcel = () => {
    // Convert all number fields to actual numbers
    const exportData = filteredData.map((row) => ({
      date: row.date,
      customer_name: row.customer_name,
      month_name: row.month_name,
      garageVara: Number(row.garageVara) || 0,
      garageExp: Number(row.garageExp) || 0,
      profit: Number(row.profit) || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Force numeric columns
    Object.keys(ws).forEach((cell) => {
      if (cell.startsWith('!')) return;

      const cellData = ws[cell];
      if (['garageVara', 'garageExp', 'profit'].includes(cellData.v)) {
        cellData.t = 'n';
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GarageProfitLoss");

    XLSX.writeFile(wb, "Garage_Profit_Loss.xlsx");
  };


  // Print
  const printTable = () => {
    let html = "<table border='1' style='border-collapse: collapse; width:100%; text-align:center'>";
    html += "<tr><th>তারিখ</th><th>কাস্টমার</th><th>কাস্টমার ভাড়া আদায়</th><th>গ্যারেজ ব্যয়</th><th>লাভ</th></tr>";

    filteredData.forEach((row) => {
      html += `<tr>
          <td>${row.date}</td>
          <td>${row.customer_name}</td>
          <td>${row.garageVara}</td>
          <td>${row.garageExp}</td>
          <td>${row.profit}</td>
      </tr>`;
    });

    const win = window.open("", "", "width=900,height=600");
    win.document.write(html);
    win.print();
    win.close();
  };

  // Table Columns
  const columns = [
    { title: "তারিখ", dataIndex: "date", render: (t) => tableFormatDate(t) },
    { title: "কাস্টমার", dataIndex: "customer_name" },
    { title: "মাস - বছর", dataIndex: "month_name" },
    {
      title: "কাস্টমার ভাড়া আদায়",
      dataIndex: "garageVara",
      render: (v) => <p className="text-gray-800">{v}</p>,
    },
    {
      title: "গ্যারেজ ব্যয়",
      dataIndex: "garageExp",
      render: (v) => <p className="text-gray-800">{v}</p>,
    },
    {
      title: "লাভ",
      dataIndex: "profit",
      render: (p) => (
        <b className={p >= 0 ? "text-green-700" : "text-red-700"}>{p}</b>
      ),
    },
  ];

  return (
    <main>
      <div className="w-full max-w-7xl mx-auto bg-white p-4 rounded-xl shadow-md">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaTruck /> গ্যারেজ লাভ-ক্ষতি রিপোর্ট
          </h1>
          <Button onClick={() => setShowFilter(!showFilter)} icon={<FaFilter />}>
            ফিল্টার
          </Button>
        </div>

        {/* Export + Search */}
        <div className="md:flex justify-between items-center mb-5">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFileExcel className="" /> এক্সেল </button>
            {/* <button
              onClick={exportPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaFilePdf className="" /> পিডিএফ </button> */}
            <button
              onClick={printTable}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer" > <FaPrint className="" /> প্রিন্ট </button>
          </div>
          {/* search */}
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">খুঁজুন: </span>
            <input type="text" value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5" />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-9 top-[10.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
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
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-3 py-2 rounded-md w-full"
            >
              <option value="">-- মাস নির্বাচন করুন --</option>

              {uniqueMonthList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>


            <div className="w-md">
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setCurrentPage(1);
                  setFilterMonth("");
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
          dataSource={filteredData.map((item, i) => ({ key: i, ...item }))}
          pagination={{
            pageSize: 10,
            current: currentPage,
            onChange: setCurrentPage,
          }}
          summary={() => {
            let totalIncome = 0;
            let totalExp = 0;
            let totalProfit = 0;

            filteredData.forEach((i) => {
              totalIncome += i.garageVara;
              totalExp += i.garageExp;
              totalProfit += i.profit;
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <b>মোট</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <b>{totalIncome}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <b>{totalExp}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <b>{totalProfit}</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </main>
  );
};

export default GarageProfitLoss;
