import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { SlCalender } from "react-icons/sl";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaFileExcel, FaFilter, FaPrint } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../utils/axiosConfig";

const MonthlyStatement = () => {
  const [allData, setAllData] = useState([]); // Store all data
  const [filteredData, setFilteredData] = useState([]); // Store filtered data
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // For month filter
  const [availableMonths, setAvailableMonths] = useState([]); // Available months for dropdown

  const fetchData = async () => {
    try {
      setLoading(true);

      const [tripsRes, purchasesRes, expensesRes] = await Promise.all([
        api.get(`/trip`),
        api.get(`/purchase`),
        api.get(`/expense`),
      ]);

      const trips = tripsRes.data || [];
      const purchases = purchasesRes.data?.data || [];
      const expenses = expensesRes.data || [];

      const monthlyData = {};

      const getMonthKey = (date) => dayjs(date).format("YYYY-MM");

      // Process all data
      trips.forEach((trip) => {
        const month = getMonthKey(trip.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0,
          };
        }

        if (trip.transport_type === "own_transport") {
          monthlyData[month].ownTripIncome += parseFloat(trip.total_rent) || 0;
          // monthlyData[month].ownTripCost +=
            // (parseFloat(trip.fuel_cost) || 0) +
            // (parseFloat(trip.driver_commission) || 0) +
            // (parseFloat(trip.food_cost) || 0) +
            // (parseFloat(trip.parking_cost) || 0) +
            // (parseFloat(trip.toll_cost) || 0) +
            // (parseFloat(trip.feri_cost) || 0) +
            // (parseFloat(trip.police_cost) || 0) +
            // (parseFloat(trip.labor) || 0);
            monthlyData[month].ownTripCost += parseFloat(trip.total_exp) || 0;
        } else if (trip.transport_type === "vendor_transport") {
          monthlyData[month].vendorTripIncome +=
            parseFloat(trip.total_rent) || 0;
          monthlyData[month].vendorTripCost += parseFloat(trip.total_exp) || 0;
        }
      });

      purchases.forEach((purchase) => {
        const month = getMonthKey(purchase.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0,
          };
        }
        // monthlyData[month].purchaseCost +=
        //   parseFloat(purchase.purchase_amount) || 0;
         // Skip Fuel category purchases
  if (purchase.category.toLowerCase() !== "fuel") {
    monthlyData[month].purchaseCost += parseFloat(purchase.purchase_amount) || 0;
  }
      });

      expenses.forEach((expense) => {
        const month = getMonthKey(expense.date);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            ownTripIncome: 0,
            vendorTripIncome: 0,
            ownTripCost: 0,
            vendorTripCost: 0,
            purchaseCost: 0,
            salaryExpense: 0,
            officeExpense: 0,
          };
        }

        if (expense.payment_category === "Salary") {
          monthlyData[month].salaryExpense +=
            parseFloat(expense.amount) || 0;
        } else {
          monthlyData[month].officeExpense +=
            parseFloat(expense.amount) || 0;
        }
      });

      // Convert to array
      const result = Object.entries(monthlyData)
        .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
        .map(([month, values], index) => ({
          id: index + 1,
          month: dayjs(month).format("MMMM YYYY"),
          monthKey: month,
          ...values,
          totalExpense:
            values.ownTripCost +
            values.vendorTripCost +
            values.purchaseCost +
            values.salaryExpense +
            values.officeExpense,
          netProfit:
            values.ownTripIncome +
            values.vendorTripIncome -
            (values.ownTripCost +
              values.vendorTripCost +
              values.purchaseCost +
              values.salaryExpense +
              values.officeExpense),
        }));

      setAllData(result);
      setFilteredData(result);

      // Set available months for dropdown
      const months = Object.keys(monthlyData).map((month) => ({
        value: month,
        label: dayjs(month).format("MMMM YYYY"),
      }));
      setAvailableMonths(months);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply month filter
  useEffect(() => {
    if (selectedMonth) {
      const filtered = allData.filter(
        (item) => item.monthKey === selectedMonth
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(allData);
    }
  }, [selectedMonth, allData]);

  // Export functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((item) => ({
        Month: item.month,
        "Own Trip Income": item.ownTripIncome,
        "Vendor Trip Income": item.vendorTripIncome,
        "Own Trip Cost": item.ownTripCost,
        "Vendor Trip Cost": item.vendorTripCost,
        "Purchase Cost": item.purchaseCost,
        "Salary Expense": item.salaryExpense,
        "Office Expense": item.officeExpense,
        "Total Expense": item.totalExpense,
        "Net Profit": item.netProfit,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Statement");
    XLSX.writeFile(workbook, "Monthly_Statement.xlsx");
  };

  // pdf
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Statement Report", 10, 10);

    autoTable(doc, {
      head: [
        [
          "Month",
          "Own Income",
          "Vendor Income",
          "Own Cost",
          "Vendor Cost",
          "Purchases",
          "Salaries",
          "Office",
          "Total Expense",
          "Net Profit",
        ],
      ],
      body: filteredData.map((item) => [
        item.month,
        item.ownTripIncome,
        item.vendorTripIncome,
        item.ownTripCost,
        item.vendorTripCost,
        item.purchaseCost,
        item.salaryExpense,
        item.officeExpense,
        item.totalExpense,
        item.netProfit,
      ]),
      startY: 20,
    });

    doc.save("Monthly_Statement.pdf");
  };

  useEffect(() => {
    fetchData();
  }, []);

  // print
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-table, .print-table * {
        visibility: visible;
      }
      .print-table {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // handle print
  const handlePrint = () => {
    const printContents = document.querySelector(".print-table").outerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // To restore the original state
  };

  // Update your print button
  <button
    onClick={handlePrint}
    className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer no-print"
  >
    <FaPrint /> Print
  </button>;

  console.log(filteredData, "fil")

  // pagination
  const [currentPage, setCurrentPage] = useState([1]);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  // Calculate totals
  const calculateTotal = (key) => {
    return filteredData.reduce((sum, item) => sum + (item[key] || 0), 0);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          <SlCalender className="text-lg" />
          মাসিক লাভ-ক্ষতি
        </h2>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="border border-black text-black px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <FaFilter /> ফিল্টার
        </button>
      </div>

      {/* Filter Section */}
      {showFilter && (
        <div className="md:flex gap-5 border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
          <div className="relative w-full">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            >
              <option value="">সব মাস</option>
              {availableMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => {
                setSelectedMonth("");
                setCurrentPage(1);
              }}
              className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
               মুছুন
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFileExcel /> এক্সেল
        </button>
        {/* <button
          onClick={exportToPDF}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFilePdf /> PDF
        </button> */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-2 px-5 no-print hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaPrint />
          প্রিন্ট
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10">Loading data...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">
          No data available for selected filter
        </p>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 print-table">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-200 text-gray-700 capitalize text-xs">
                <tr>
                  <th className="p-2 border">ক্রমিক</th>
                  <th className="p-2 border">মাস</th>
                  <th className="p-2 border">নিজের ট্রিপ আয়</th>
                  <th className="p-2 border">ভেন্ডর ট্রিপ আয়</th>
                  <th className="p-2 border">নিজের ট্রিপ খরচ</th>
                  <th className="p-2 border">ভেন্ডর ট্রিপ খরচ</th>
                  <th className="p-2 border">ক্রয় খরচ</th>
                  <th className="p-2 border">বেতন খরচ</th>
                  <th className="p-2 border">অফিস খরচ</th>
                  <th className="p-2 border">মোট খরচ</th>
                  <th className="p-2 border">নিট লাভ</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border border-gray-400 text-center">
                      {item.id}
                    </td>
                    <td className="p-2 border border-gray-400">{item.month}</td>
                    <td className="p-2 border border-gray-400 text-right">
                      {item.ownTripIncome}
                    </td>
                    <td className="p-2 border border-gray-400 text-right">
                      {item.vendorTripIncome}
                    </td>
                    <td className="p-2 border border-gray-400 text-right ">
                      {item.ownTripCost}
                    </td>
                    <td className="p-2 border border-gray-400 text-right ">
                      {item.vendorTripCost}
                    </td>
                    <td className="p-2 border border-gray-400 text-right ">
                      {item.purchaseCost}
                    </td>
                    <td className="p-2 border border-gray-400 text-right ">
                      {item.salaryExpense}
                    </td>
                    <td className="p-2 border border-gray-400 text-right ">
                      {item.officeExpense}
                    </td>
                    <td className="p-2 border border-gray-400 text-right  font-semibold">
                      {item.totalExpense}
                    </td>
                    <td
                      className={`p-2 border border-gray-400 text-right font-semibold ${
                        item.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.netProfit}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="font-semibold">
                  <td
                    className="p-2 border border-gray-400 text-center"
                    colSpan={2}
                  >
                    Total
                  </td>
                  <td className="p-2 border border-gray-400 text-right">
                    {calculateTotal("ownTripIncome")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right">
                    {calculateTotal("vendorTripIncome")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("ownTripCost")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("vendorTripCost")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("purchaseCost")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("salaryExpense")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("officeExpense")}
                  </td>
                  <td className="p-2 border border-gray-400 text-right ">
                    {calculateTotal("totalExpense")}
                  </td>
                  <td
                    className={`p-2 border border-gray-400 text-right ${
                      calculateTotal("netProfit") >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {calculateTotal("netProfit")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* pagination */}
          {currentItems.length === 0 ? (
            ""
          ) : (
            <div className="mt-10 flex justify-center">
              <div className="space-x-2 flex items-center">
                <button
                  onClick={handlePrevPage}
                  className={`p-2 ${
                    currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                  } rounded-sm`}
                  disabled={currentPage === 1}
                >
                  <GrFormPrevious />
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageClick(number + 1)}
                    className={`px-3 py-1 rounded-sm ${
                      currentPage === number + 1
                        ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                        : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`p-2 ${
                    currentPage === totalPages
                      ? "bg-gray-300"
                      : "bg-primary text-white"
                  } rounded-sm`}
                  disabled={currentPage === totalPages}
                >
                  <GrFormNext />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyStatement;
