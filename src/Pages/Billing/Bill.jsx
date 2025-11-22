
import { useState, useEffect, useRef } from "react"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import { HiCurrencyBangladeshi } from "react-icons/hi2"
import toast, { Toaster } from "react-hot-toast"
import * as XLSX from "xlsx"
import saveAs from "file-saver"
import pdfMake from "pdfmake/build/pdfmake"
import pdfFonts from "pdfmake/build/vfs_fonts"
import CreatableSelect from "react-select/creatable"
import { tableFormatDate } from "../../components/Shared/formatDate"
import DatePicker from "react-datepicker"
import { GrFormNext, GrFormPrevious } from "react-icons/gr"
import api from "../../utils/axiosConfig"
import DumpTruck from "./DumpTruck"
import ExvatorBill from "./Exavtor"
import RollerBill from "./Roller"
import ChainDozerBill from "./ChainDozer"
import { toNumber } from "../../hooks/toNumber"

pdfMake.vfs = pdfFonts.vfs

const Bill = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [vehicles, setVehicles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("");

  // New states for customer search
  const [customerList, setCustomerList] = useState([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false)
  const customerSearchRef = useRef(null)

  // fetch all trip data from server
   useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await api.get("/trip");
        setTrips(res.data);
      } catch (error) {
        console.log("Error fetching trip data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

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

  // Fetch customer list for the search dropdown
    useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customer");
        setCustomerList(res.data);
      } catch (error) {
        console.log("Customer Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const customerOptions = customerList.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
  }))

  // Handle click outside the customer search input to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerSearchRef.current && !customerSearchRef.current.contains(event.target)) {
        setShowCustomerSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const exportToExcel = () => {
    const selectedData = trips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }

    const excelData = selectedData.map((dt, idx) => ({
      SL: idx + 1,
      Date: tableFormatDate(dt.date),
      Vehicle: dt.vehicle_no,
      Chalan: dt.challan,
      Rent: toNumber(dt.work_time),
      Rate: toNumber(dt.rate),
      Total: (Number.parseFloat(dt.total_rent) || 0),
      Status: dt.status,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill")

    // Footer totals যোগ করা
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [["", "", "", "মোট", totaWork, totalRate, totalRent]],
      { origin: -1 }
    )

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
  }


  const exportToPDF = () => {
    const selectedData = trips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }

    const body = [
      ["ক্রমিক", "তারিখ", "গাড়ি নং", "চালান নং", "সি এফ টি", "দর", "বিলের টাকা", "অবস্থা"],
      ...selectedData.map((dt, idx) => [
        { text: idx + 1 },
        { text: tableFormatDate(dt.date) },
        { text: dt.vehicle_no },
        { text: dt.challan_no },
        { text: dt.total_rent },
        { text: 15 },
        { text: (Number.parseFloat(dt.total_rent) || 0) * 15 },
        { text: dt.status },
      ]),
      [
        { text: "মোট", colSpan: 4, alignment: "right" }, {}, {}, {},
        { text: totalRent || 0 },
        { text: 15 },
        { text: grandTotal || 0 },
        { text: "" }
      ],
    ]

    const docDefinition = {
      content: [
        { text: "বিল", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "*", "*", "*", "*", "*"],
            body,
          },
        },
        { text: `মোট পরিমাণ কথায়: ${numberToWords(grandTotal)}`, margin: [0, 10, 0, 0] },
      ],
      styles: {
        header: { fontSize: 16, bold: true, marginBottom: 10 },
      },
    }

    pdfMake.createPdf(docDefinition).download("Bill.pdf")
  }


  // Filtered customer suggestions based on search term
  const filteredCustomerSuggestions = customerList.filter((customer) =>
    (customer.customer_name ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase()),
  )

  // Handle customer selection from suggestions
  const handleCustomerSelect = (customerName) => {
    setSelectedCustomer(customerName)
    setCustomerSearchTerm(customerName)
    setShowCustomerSuggestions(false)
    setCurrentPage(1)
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


  const handleCheckBox = (tripId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [tripId]: !prev[tripId],
    }))
  }

  // Fixed calculation functions
  const calculateTotals = (trips) => {
    const totalRent = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)
    const totalWork = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.work_time) || 0), 0)
    const totalRate = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.rate) || 0), 0)
    const totalDemurrage = trips.reduce((sum, dt) => sum + (Number.parseFloat(dt.d_total) || 0), 0)
    const grandTotal = totalRent + totalDemurrage
    return { totalRent, totalDemurrage, grandTotal, totalRate, totalRent, totalWork }
  }

  // Date filter
    const filteredTrips = trips.filter((t) => {
    const matchCategory =
      !selectedCategory || t.vehicle_category === selectedCategory;

    const matchCustomer =
      !selectedCustomer ||
      (t.customer ?? "")
        .toLowerCase()
        .includes(selectedCustomer.toLowerCase());

    const tripDate = new Date(t.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    const matchDate =
      start && end
        ? tripDate >= start && tripDate <= end
        : start
        ? tripDate === start
        : end
        ? tripDate === end
        : true;

    return matchCategory && matchCustomer && matchDate;
  });


  // Get selected data based on selectedRows for total calculation
  const selectedTripsForCalculation = filteredTrips.filter((trip) => selectedRows[trip.id])
  const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : filteredTrips
  const { totalRent, totalDemurrage, grandTotal, totalWork, totalRate } = calculateTotals(tripsToCalculate)

  // Print function
  const handlePrint = () => {
    const selectedData = filteredTrips.filter((trip) => selectedRows[trip.id])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    // Get customer name from first selected trip
    const customerName = selectedData[0]?.customer || "Customer Name"
    const {
      totalRent: printTotalRent,
      totalWork: totalWork,
      totalRate: totalRate,
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
              <div><strong>তারিখ: ${new Date().toLocaleDateString("bn-BD")}</strong></div>
              </div>
            </div>
            <div><strong> ${tableFormatDate(selectedData[0]?.date)}</strong></div>
              <div>বরাবর</div>
              <div><strong>${customerName}</strong></div>
              <div><strong>প্রজেক্ট: ${selectedData[0]?.work_place}</strong></div>
              <div><strong>বিষয়:</strong></div>
            </div>
           
          </div>
        <table>
          <thead>
            <tr>
              <th>ক্রমিক</th>
              <th>তারিখ</th>
              <th>গাড়ি নং</th>
              <th>চালান নং</th>
              <th>ঘণ্টা/দিন</th>
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
                <td>${dt.challan}</td>
                <td>${dt.work_time}</td>
                <td>${dt.rate}</td>
                <td>${(Number.parseFloat(dt.total_rent) || 0)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">মোট</td>
              <td>${totalWork}</td>
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

// Submit function
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

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTrips.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)
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
  if (loading) return <p className="text-center mt-16">Loading...</p>

  return (
    <div className="p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            বিলিং
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <div className="w-full relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">সব ক্যাটাগরি</option>
                {vehicleOptions.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> ফিল্টার
            </button>
          </div>
        </div>

        {/* export and search */}
        {!(selectedCategory === "Exvator" || selectedCategory === "Chain Dozer" || selectedCategory === "Road Roller" || selectedCategory === "Dump Truck" )&&<div className="md:flex justify-between items-center">
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
        </div>}

        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 my-5">
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
            <CreatableSelect
              isClearable
              placeholder="কাস্টমার নির্বাচন করুন..."
              value={selectedCustomer ? { value: selectedCustomer, label: selectedCustomer } : null}
              options={customerOptions}
              onChange={(newValue) => {
                setSelectedCustomer(newValue ? newValue.value : "")
                setCurrentPage(1)
              }}
              onCreateOption={(inputValue) => {
                const newCustomer = { value: inputValue, label: inputValue }
                setCustomerList((prev) => [...prev, { customer_name: inputValue }])
                setSelectedCustomer(inputValue)
              }}
              className="text-sm"
            />
            <div className="mt-3 md:mt-0 flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  setStartDate("")
                  setEndDate("")
                  setSelectedCustomer("")
                  setShowFilter(false)
                }}
                className="bg-primary text-white px-4 py-1 md:py-0 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <FaFilter /> মুছে ফেলুন
              </button>
            </div>
          </div>
        )}

        {!(selectedCategory === "Exvator" || selectedCategory === "Chain Dozer" || selectedCategory === "Road Roller" || selectedCategory === "Dump Truck" )&&<div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">ক্রমিক</th>
                <th className="border border-gray-700 px-2 py-1">তারিখ</th>

                <th className="border border-gray-700 px-2 py-1">গাড়ি নং</th>
                <th className="border border-gray-700 px-2 py-1">চালান নং</th>
                <th className="border border-gray-700 px-2 py-1">ঘণ্টা/দিন</th>
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
                  <td className="border border-gray-700 p-1">{dt.challan}</td>
                  <td className="border border-gray-700 p-1">{dt.total_rent}</td>
                  <td className="border border-gray-700 p-1">{15}</td>

                  <td className="border border-gray-700 p-1">
                    {(Number.parseFloat(dt.total_rent) || 0) * (Number.parseFloat(15) || 0)}
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

                <td className="border border-black px-2 py-1">{totalWork}</td>
                <td className="border border-black px-2 py-1">{totalRate}</td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={11} className="border border-black px-2 py-1">
                  মোট পরিমাণ কথায়: <span className="font-medium">{numberToBanglaWords(totalRent)}</span>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* pagination */}
          {filteredTrips.length > 0 && totalPages >= 1 && (
            <div className="mt-10 flex justify-center">
              <div className="space-x-2 flex items-center">
                <button
                  onClick={handlePrevPage}
                  className={`p-2 ${currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
                    } rounded-sm`}
                  disabled={currentPage === 1}
                >
                  <GrFormPrevious />
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageClick(number + 1)}
                    className={`px-3 py-1 rounded-sm ${currentPage === number + 1
                      ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                      : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                      }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={handleNextPage}
                  className={`p-2 ${currentPage === totalPages
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

          <div className="flex justify-end mt-5">
            <button
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleSubmit}
            >
              পরিবর্তন সংরক্ষণ করুন
            </button>
          </div>
        </div>}
{selectedCategory === "Dump Truck" && <DumpTruck trips={filteredTrips} />}
{selectedCategory=== "Exvator" && <ExvatorBill trips={filteredTrips}/>}
{selectedCategory=== "Road Roller" && <RollerBill trips={filteredTrips}/>}
{selectedCategory=== "Chain Dozer" && <ChainDozerBill trips={filteredTrips}/>}
      </div>
    </div>
  )
}

export default Bill;

