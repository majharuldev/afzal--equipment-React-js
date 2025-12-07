
import { useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/Shared/Pagination";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { FaFileExcel, FaPrint } from "react-icons/fa6";
import { toNumber } from "../../hooks/toNumber";

export default function RollerBill({ trips }) {
  const [submittedTrips, setSubmittedTrips] = useState([]);
  const [selectedRows, setSelectedRows] = useState({})
  console.log("trips in dump truck bill:", trips);
  const handleCheckBox = (tripId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }))
  }

  const handleSubmit = async () => {
    const selectedData = filteredTrips.filter(
      (dt, i) => selectedRows[dt.id] && dt.status === "Pending"
    );
    if (!selectedData.length) {
      return toast.error("Please select at least one row for Not submitted.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...")

      // Create array of promises for all updates
      const updatePromises = selectedData.map((dt) =>
        api.put(`/trip/${dt.id}`, {
          status: "Submitted",
          date: dt.date,
          customer: dt.customer,
          branch_name: dt.branch_name,
          load_point: dt.load_point,
          additional_load: dt.additional_load,
          unload_point: dt.unload_point,
          transport_type: dt.transport_type,
          trip_type: dt.trip_type,
          trip_id: dt.trip_id,
          sms_sent: dt.sms_sent,
          vehicle_no: dt.vehicle_no,
          driver_name: dt.driver_name,
          vehicle_category: dt.vehicle_category,
          vehicle_size: dt.vehicle_size,
          product_details: dt.product_details,
          driver_mobile: dt.driver_mobile,
          challan: dt.challan,
          driver_adv: dt.driver_adv,
          remarks: dt.remarks,
          food_cost: dt.food_cost,
          total_exp: dt.total_exp,
          total_rent: dt.total_rent,
          vendor_rent: dt.vendor_rent,
          advance: dt.advance,
          due_amount: dt.due_amount,
          parking_cost: dt.parking_cost,
          night_guard: dt.night_guard,
          toll_cost: dt.toll_cost,
          feri_cost: dt.feri_cost,
          police_cost: dt.police_cost,
          others_cost: dt.others_cost,
          chada: dt.chada,
          labor: dt.labor,
          vendor_name: dt.vendor_name,
          fuel_cost: dt.fuel_cost,
          challan_cost: dt.challan_cost,
          d_day: dt.d_day,
          d_amount: dt.d_amount,
          d_total: dt.d_total,
        })
      );

      // Wait for all updates to complete
      await Promise.all(updatePromises)

      // Update local state immediately
      setTrips((prev) =>
        prev.map((trip) => (selectedData.some((dt) => dt.id === trip.id) ? { ...trip, status: "Submitted" } : trip)),
      )

      toast.success("Successfully submitted!", { id: loadingToast })
      setSelectedRows({})
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Submission failed. Check console for details.")
    }
  }

  // total word function
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero Taka only"

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    const convertHundreds = (n) => {
      let result = ""
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred "
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " "
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + " "
        return result
      }
      if (n > 0) {
        result += ones[n] + " "
      }
      return result
    }

    let result = ""
    const crore = Math.floor(num / 10000000)
    const lakh = Math.floor((num % 10000000) / 100000)
    const thousand = Math.floor((num % 100000) / 1000)
    const remainder = num % 1000

    if (crore > 0) {
      result += convertHundreds(crore) + "Crore "
    }
    if (lakh > 0) {
      result += convertHundreds(lakh) + "Lakh "
    }
    if (thousand > 0) {
      result += convertHundreds(thousand) + "Thousand "
    }
    if (remainder > 0) {
      result += convertHundreds(remainder)
    }

    return result.trim() + " Taka only"
  }
  // বাংলা সংখ্যাকে কথায় কনভার্ট করার ফাংশন
  const numberToBanglaWords = (num) => {
    if (!num || isNaN(num)) return "শূন্য টাকা মাত্র";

    const ones = ["", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়"];
    const tens = ["", "দশ", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];
    const teens = ["এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোল", "সতেরো", "আঠারো", "উনিশ"];

    const convertHundreds = (n) => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " শত ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      } else if (n > 10) {
        result += teens[n - 11] + " ";
        return result;
      }
      if (n > 0) {
        result += ones[n] + " ";
      }
      return result;
    };

    let result = "";
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    if (crore > 0) result += convertHundreds(crore) + "কোটি ";
    if (lakh > 0) result += convertHundreds(lakh) + "লক্ষ ";
    if (thousand > 0) result += convertHundreds(thousand) + "হাজার ";
    if (remainder > 0) result += convertHundreds(remainder);

    return result.trim() + " টাকা মাত্র";
  };

  // Excel Export function
  const exportToExcel = () => {
    const selectedData = trips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }

    const excelData = selectedData.map((dt, idx) => ({
      SL: idx + 1,
      Date: tableFormatDate(dt.date),
      Vehicle: dt.vehicle_no,
      Remarks: dt.remarks,
      "Month": toNumber(dt.work_time),
      Rate: toNumber(dt.rate),
      "Total Rent": (Number.parseFloat(dt.work_time) || 0) * (Number.parseFloat(dt.rate) || 0),
      Status: dt.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill")

    // Footer totals যোগ করা
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["", "", "", "মোট", totalWork, totalRate, totalRent]],
      { origin: -1 }
    )

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
  }

  // Print function
  const handlePrint = () => {
    const selectedData = trips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    // Get customer name from first selected trip
    const customerName = selectedData[0]?.customer || "Customer Name"
    const {
      totalRent: printTotalRent,
      totalRate: totalRate,
      totalWork: totalWork,
      grandTotal: printGrandTotal,
    } = calculateTotals(selectedData)

    const totalInWords = numberToBanglaWords(printGrandTotal)

    const newWindow = window.open("", "_blank")
    const html = `
        <html>
          <head>
          <title>.</title>
            <style>
            @page { margin: 0; }
              body { font-family: Arial, sans-serif; font-size: 12px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 4px; text-align: center; }
              th { background: #f0f0f0; }
              tfoot td { font-weight: bold; }
              .bill-no {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body style="margin:0.5in;">
            <div class="to-section" style="margin-top:2.5in;">
             <div>
                  <div class="bill-no">
                  <div style="margin-right: 2in"><strong>বিল নং:</strong></div>
                  <div style="margin-right: 2in"><strong>তারিখ: ${new Date().toLocaleDateString("bn-BD")}</strong></div>
                  </div>
                </div>
                <div><strong> ${tableFormatDate(selectedData[0]?.date)}</strong></div>
                  <div>বরাবর</div>
                  <div><strong>${customerName}</strong></div>
                  <div><strong>প্রজেক্ট: ${selectedData[0]?.work_place}</strong></div>
                  <div><strong>বিষয়:${selectedData[0]?.trip_count}</strong></div>
                </div>
               
              </div>
            <table>
              <thead>
                <tr>
                  <th>ক্রমিক</th>
                  <th>তারিখ</th>
                  <th>গাড়ি নং</th>
                  <th>বিবরণ</th>
                  <th>মাস</th>
                  <th>দর</th>
                  <th>বিলের টাকা</th>
                </tr>
              </thead>
              <tbody>
                ${selectedData.map((dt, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${tableFormatDate(dt.date)}</td>
                    <td>${dt.vehicle_no}</td>
                    <td>${dt.remarks}</td>
                    <td>${dt.work_time} দিন</td>
                    <td>${dt.rate}</td>
                    <td>${toNumber(dt.work_time) * toNumber(dt.rate)}</td>
                  </tr>
                `).join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4">মোট</td>
                  <td>${totalWork} দিন</td>
                  <td>${totalRate}</td>
                  <td>${printTotalRent}</td>
                </tr>
              </tfoot>
            </table>
            <p><strong>মোট পরিমাণ কথায়:</strong> ${totalInWords}</p>
          </body>
        </html>
      `
    newWindow.document.write(html)
    newWindow.document.close()
    newWindow.focus()
    newWindow.print()
  }

  // Fixed calculation functions
  const calculateTotals = (trips) => {
    const totalRent = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)
    const totalRate = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.rate) || 0), 0)
    const totalWork = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.work_time) || 0), 0)
    const totalDemurrage = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.d_total) || 0), 0)
    const grandTotal = totalRent + totalDemurrage
    return { totalRent, totalDemurrage, grandTotal, totalRate, totalWork }
  }
  // Get selected data based on selectedRows for total calculation
  const selectedTripsForCalculation = trips.filter((trip) => selectedRows[trip.id])
  const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : trips
  const { totalRent, totalDemurrage, grandTotal, totalWork, totalRate } = calculateTotals(tripsToCalculate)

  //   pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = trips.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(trips.length / itemsPerPage)
  return (
    <div>
      <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaFileExcel className="" />
          এক্সেল
        </button>
        {/* <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
                  >
                    <FaFilePdf className="" />
                    পিডিএফ
                  </button> */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
        >
          <FaPrint className="" />
          প্রিন্ট
        </button>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-900">
          <thead className="capitalize text-sm">
            <tr>
              <th className="border border-gray-700 px-2 py-1">ক্রমিক</th>
              <th className="border border-gray-700 px-2 py-1">তারিখ</th>

              <th className="border border-gray-700 px-2 py-1">গাড়ি নং</th>
              <th className="border border-gray-700 px-2 py-1">বিবরণ</th>
              <th className="border border-gray-700 px-2 py-1">মাস</th>
              <th className="border border-gray-700 px-2 py-1">দর</th>
              <th className="border border-gray-700 px-2 py-1">বিলের টাকা</th>
              <th className="border border-gray-700 px-2 py-1">বিলের অবস্থা</th>
            </tr>
          </thead>
          <tbody className="font-semibold">
            {currentItems.map((dt, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-all">
                <td className="border border-gray-700 p-1 font-bold">{index + 1}.</td>
                <td className="border border-gray-700 p-1">{tableFormatDate(dt.date)}</td>
                <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
                <td className="border border-gray-700 p-1">{dt.remarks}</td>
                <td className="border border-gray-700 p-1">{dt.work_time} দিন</td>
                <td className="border border-gray-700 p-1">{dt.rate}</td>

                <td className="border border-gray-700 p-1">
                  {(Number.parseFloat(dt.work_time) || 0) * (Number.parseFloat(dt.rate) || 0)}
                </td>

                <td className="border border-gray-700 p-1 text-center ">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={!!selectedRows[dt.id]}
                      onChange={() => handleCheckBox(dt.id)}
                      disabled={false}
                    />
                    {dt.status === "Pending" && (
                      <span className=" inline-block px-2  text-xs text-yellow-600 rounded">
                        Not Submitted
                      </span>
                    )}
                    {dt.status === "Submitted" && (
                      <span className=" inline-block px-2  text-xs text-green-700 rounded">
                        Submitted
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={2} className="border border-black px-2 py-1 text-right">
                মোট
              </td>
              <td className="border border-black px-2 py-1">{"totalVehicle"}</td>
              <td className="border border-black px-2 py-1"></td>

              <td className="border border-black px-2 py-1">{totalWork} দিন</td>
              <td className="border border-black px-2 py-1">{totalRate}</td>

              <td className="border border-black px-2 py-1">{totalRent}</td>
              <td className="border border-black px-2 py-1"></td>
            </tr>
            <tr className="font-bold">
              <td colSpan={11} className="border border-black px-2 py-1">
                মোট পরিমাণ কথায়: <span className="font-medium">{numberToBanglaWords(grandTotal)}</span>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* pagination */}
        {trips.length > 0 && totalPages >= 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            maxVisible={8}
          />
        )}
        <div className="flex justify-end mt-5">
          <button
            className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
            onClick={handleSubmit}
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

