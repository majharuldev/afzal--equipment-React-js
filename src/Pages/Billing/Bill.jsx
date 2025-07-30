
import axios from "axios"
import { useEffect, useState, useRef } from "react"
import { FaFileExcel, FaFilePdf, FaFilter, FaPrint } from "react-icons/fa6"
import { HiCurrencyBangladeshi } from "react-icons/hi2"
import toast, { Toaster } from "react-hot-toast"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts"
import { toWords } from "number-to-words" // Assuming this is correctly imported from a package
import ReactPaginate from "react-paginate"

pdfMake.vfs = pdfFonts.vfs

const Bill = () => {
  const [yamaha, setYamaha] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedRows, setSelectedRows] = useState({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
   const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // New states for customer search
  const [customerList, setCustomerList] = useState([]) // Stores all fetched customers
  const [customerSearchTerm, setCustomerSearchTerm] = useState("") // Text typed in the search input
  const [selectedCustomer, setSelectedCustomer] = useState("") // Customer name used for filtering bills
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false) // Controls suggestion dropdown visibility
  const customerSearchRef = useRef(null) // Ref for the customer search input container

  // fetch all trip data from server
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setYamaha(response.data.data)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error)
        setLoading(false)
      })
  }, [])

  // Fetch customer list for the search dropdown
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setCustomerList(response.data.data)
        }
      })
      .catch((error) => console.error("Error fetching customer list:", error))
  }, [])

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

  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // export to excel
  const exportToExcel = () => {
    const selectedData = yamaha.filter((_, i) => selectedRows[i])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    const excelData = selectedData.map((dt, idx) => ({
      SL: idx + 1,
      Date: dt.date,
      Product: "Bike",
      Portfolio: dt.customer,
      Vehicle: dt.vehicle_no,
      Chalan: dt.challan,
      From: dt.load_point,
      Destination: dt.unload_point,
      Quantity: dt.quantity,
      BodyFare: dt.body_fare,
      Dropping: "",
      FuelCost: dt.fuel_cost,
    }))
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill")
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Bill.xlsx")
  }

  // export to pdf
  const exportToPDF = () => {
    const selectedData = yamaha.filter((_, i) => selectedRows[i])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    const docDefinition = {
      content: [
        { text: "Bill", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "*", "*", "*", "*", "*"],
            body: [
              ["SL", "Date", "Vehicle", "Chalan", "From", "Destination", "Qty"],
              ...selectedData.map((dt, idx) => [
                idx + 1,
                dt.date,
                dt.vehicle_no,
                dt.challan,
                dt.load_point,
                dt.unload_point,
                dt.quantity,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          marginBottom: 10,
        },
      },
    }
    pdfMake.createPdf(docDefinition).download("Bill.pdf")
  }

  // handle print
  const handlePrint = () => {
    const selectedData = yamaha.filter((_, i) => selectedRows[i])
    if (!selectedData.length) {
      return toast.error("Please select at least one row.")
    }
    const months = [
      ...new Set(
        selectedData.map((dt) => {
          const dateObj = new Date(dt.date)
          return dateObj.toLocaleString("en-US", { month: "long" })
        }),
      ),
    ]
    const monthText = months.join("/")
    const currentYear = new Date().getFullYear()
    const billNumber = `Bill No-${monthText}-${currentYear}-1426`
    const totalBodyFare = selectedData.reduce((sum, dt) => sum + (Number.parseFloat(dt.body_fare) || 0), 0)
    const totalRent = selectedData.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)
    const totalBodyFareWords = numberToWords(totalBodyFare)
    const totalRentWords = numberToWords(totalRent)

    const newWindow = window.open("", "_blank")
    const html = `
      <html>
        <head>
          <style>
            @page {
              margin: 0;
            }
            body {
              margin: 1cm;
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            .header-section { margin-bottom: 30px; }
            .to-section { line-height: 1.6; }
            .subject { margin-top: 20px; }
            .bill-info { display: flex; justify-content: space-between; margin-top: 30px; font-weight: bold; }
            h2 { margin: 20px 0; }
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 12px;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
            }
            th {
              background: #eee;
            }
            tfoot td {
              font-weight: bold;
              background-color: #f3f3f3;
            }
          </style>
        </head>
        <body>
          <div class="header-section">
            <div class="to-section">
              <div>To</div>
              <div><strong>Bill</strong></div>
              <div>Laksham Poribohon Songstha</div>
              <div> Union Office (4th Floor), Tejgaon, Dhaka</div>
              <div>Dhaka-1208.</div>
              <div class="subject">Subject : Carrying Bill-${currentYear}</div>
            </div>
            <div class="bill-info">
              <div><strong>Bill Name :</strong> Customer Bill</div>
              <div><strong>${billNumber}</strong></div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Truck No</th>
                <th>Loading Point</th>
                <th>Unloading Point</th>
                <th>Rent</th>
              </tr>
            </thead>
            <tbody>
              ${selectedData
                .map(
                  (dt, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${dt.date}</td>
                  <td>Yamaha</td>
                  <td>${dt.vehicle_no}</td>
                  <td>${dt.load_point}</td>
                  <td>${dt.unload_point}</td>
                  <td>${dt.total_rent}</td>
                </tr>`,
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6" style="text-align: right;">Total</td>
                <td>${totalRent}</td>
              </tr>
              <tr>
                <td colspan="13">Total Amount In Words (For Fuel Bill): ${totalRentWords}</td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>`
    newWindow.document.write(html)
    newWindow.document.close()
    newWindow.focus()
    newWindow.print()
  }

  // Filtered customer suggestions based on search term
  const filteredCustomerSuggestions = customerList.filter((customer) =>
    (customer.customer_name ?? "").toLowerCase().includes(customerSearchTerm.toLowerCase()),
  )

  // Handle customer selection from suggestions
  const handleCustomerSelect = (customerName) => {
    setSelectedCustomer(customerName) // Set the customer for filtering
    setCustomerSearchTerm(customerName) // Set input value to selected name
    setShowCustomerSuggestions(false) // Close suggestions
  }

  // date filter
 const filteredTrips = yamaha.filter((trip) => {
  const tripDate = new Date(trip.date).setHours(0, 0, 0, 0);
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

  const matchCustomer =
    !selectedCustomer ||
    (trip.customer ?? "").toLowerCase().includes(selectedCustomer.toLowerCase());

  return matchDate && matchCustomer;
});

  // number to words utility (assuming `toWords` is from `number-to-words` library)
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero"
    return toWords(num).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only."
  }

  // Get selected data based on selectedRows for total calculation
  const selectedTripsForCalculation = filteredTrips.filter((_, idx) => selectedRows[idx])
  // Fallback: show all filtered if none specifically selected for calculation
  const tripsToCalculate = selectedTripsForCalculation.length > 0 ? selectedTripsForCalculation : filteredTrips

  const totalBodyFare = tripsToCalculate.reduce((sum, dt) => sum + (Number.parseFloat(dt.body_fare) || 0), 0)
  const totalRent = tripsToCalculate.reduce((sum, dt) => sum + (Number.parseFloat(dt.total_rent) || 0), 0)

    // Pagination logic
  const pageCount = Math.ceil(filteredTrips.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredTrips.slice(offset, offset + itemsPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };
 
  const handleSubmit = async () => {
  const selectedData = filteredTrips.filter((_, i) => selectedRows[i]);
  if (!selectedData.length) {
    return toast.error("Please select at least one row.");
  }

  try {
    const loadingToast = toast.loading("Submitting selected rows...");
    
    // Create array of promises for all updates
    const updatePromises = selectedData.map(dt => 
      axios.post(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`, {
        bill_date: new Date().toISOString().split('T')[0],
        customer_name: dt.customer,
        vehicle_no: dt.vehicle_no,
        chalan: dt.challan,
        load_point: dt.load_point,
        unload_point: dt.unload_point,
        qty: dt.quantity,
        body_cost: dt.body_fare,
        fuel_cost: dt.fuel_cost,
        driver_name: dt.driver_name,
        bill_amount: dt.total_rent
      }).then(() => 
        axios.post(`${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`, { 
          status: "Approved",
        customer: dt.customer,
        date: dt.date,
        load_point: dt.load_point,
        unload_point: dt.unload_point,
        transport_type: dt.transport_type,
        vehicle_no: dt.vehicle_no,
        total_rent: dt.total_rent,
        quantity: dt.quantity,
        dealer_name: dt.dealer_name,
        driver_name: dt.driver_name,
        fuel_cost: dt.fuel_cost,
        do_si: dt.do_si,
        driver_mobile: dt.driver_mobile,
        challan: dt.challan,
        sti: dt.sti,
        model_no: dt.model_no,
        co_u: dt.co_u,
        masking: dt.masking,
        unload_charge: dt.unload_charge,
        extra_fare: dt.extra_fare,
        vehicle_rent: dt.vehicle_rent,
        goods: dt.goods,
        distribution_name: dt.distribution_name,
        remarks: dt.remarks,
        no_of_trip: dt.no_of_trip,
        vehicle_mode: dt.vehicle_mode,
        per_truck_rent: dt.per_truck_rent,
        vat: dt.vat,
        total_rent_cost: dt.total_rent_cost,
        driver_commission: dt.driver_commission,
        road_cost: dt.road_cost,
        food_cost: dt.food_cost,
        total_exp: dt.total_exp,
        trip_rent: dt.trip_rent,
        advance: dt.advance,
        due_amount: dt.due_amount,
        ref_id: dt.ref_id,
        body_fare: dt.body_fare,
        parking_cost: dt.parking_cost,
        night_guard: dt.night_guard,
        toll_cost: dt.toll_cost,
        feri_cost: dt.feri_cost,
        police_cost: dt.police_cost,
        driver_adv: dt.driver_adv,
        chada: dt.chada,
        labor: dt.labor,
        })
      )
    );

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Update local state immediately
    setYamaha(prev => prev.map(trip => 
      selectedData.some(dt => dt.id === trip.id) 
        ? {...trip, status: "Approved"} 
        : trip
    ));

    toast.success("Successfully submitted!", { id: loadingToast });
    setSelectedRows({});

  } catch (error) {
    console.error("Submission error:", error);
    toast.error("Submission failed. Check console for details.");
  }
}


// update status 
// const handleSubmit = async () => {
//   const selectedData = filteredTrips.filter((_, i) => selectedRows[i]);
//   if (!selectedData.length) {
//     return toast.error("Please select at least one row.");
//   }

//   try {
//     const loadingToast = toast.loading("Approving selected trips...");

//     // Send approval requests only
//     const approvePromises = selectedData.map(dt =>
//       axios.post(`${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`, {
//          status: "Approved",
//         customer: dt.customer,
//         date: dt.date,
//         load_point: dt.load_point,
//         unload_point: dt.unload_point,
//         transport_type: dt.transport_type,
//         vehicle_no: dt.vehicle_no,
//         total_rent: dt.total_rent,
//         quantity: dt.quantity,
//         dealer_name: dt.dealer_name,
//         driver_name: dt.driver_name,
//         fuel_cost: dt.fuel_cost,
//         do_si: dt.do_si,
//         driver_mobile: dt.driver_mobile,
//         challan: dt.challan,
//         sti: dt.sti,
//         model_no: dt.model_no,
//         co_u: dt.co_u,
//         masking: dt.masking,
//         unload_charge: dt.unload_charge,
//         extra_fare: dt.extra_fare,
//         vehicle_rent: dt.vehicle_rent,
//         goods: dt.goods,
//         distribution_name: dt.distribution_name,
//         remarks: dt.remarks,
//         no_of_trip: dt.no_of_trip,
//         vehicle_mode: dt.vehicle_mode,
//         per_truck_rent: dt.per_truck_rent,
//         vat: dt.vat,
//         total_rent_cost: dt.total_rent_cost,
//         driver_commission: dt.driver_commission,
//         road_cost: dt.road_cost,
//         food_cost: dt.food_cost,
//         total_exp: dt.total_exp,
//         trip_rent: dt.trip_rent,
//         advance: dt.advance,
//         due_amount: dt.due_amount,
//         ref_id: dt.ref_id,
//         body_fare: dt.body_fare,
//         parking_cost: dt.parking_cost,
//         night_guard: dt.night_guard,
//         toll_cost: dt.toll_cost,
//         feri_cost: dt.feri_cost,
//         police_cost: dt.police_cost,
//         driver_adv: dt.driver_adv,
//         chada: dt.chada,
//         labor: dt.labor,
//       })
//     );

//     await Promise.all(approvePromises);

//     // Update local state immediately
//     setYamaha(prev =>
//       prev.map(trip =>
//         selectedData.some(dt => dt.id === trip.id)
//           ? { ...trip, status: "Approved" }
//           : trip
//       )
//     );

//     toast.success("Trips approved and ledgers auto-created!", { id: loadingToast });
//     setSelectedRows({});

//   } catch (error) {
//     console.error("Approval error:", error);
//     toast.error("Approval failed. Check console.");
//   }
// };


  if (loading) return <p className="text-center mt-16">Loading Yamaha...</p>

  return (
    <div className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="border border-primary text-primary px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex flex-wrap md:flex-row gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-green-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFileExcel className="" />
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-amber-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaFilePdf className="" />
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-5 hover:bg-primary bg-gray-50 shadow-md shadow-blue-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              <FaPrint className="" />
              Print
            </button>
          </div>
          {/* Customer Search Input */}
          <div className="mt-3 md:mt-0">
            <div className="relative mt-3 md:mt-0" ref={customerSearchRef}>
  <input
    type="text"
    placeholder="Search customer..."
    value={customerSearchTerm}
    onChange={(e) => {
      setCustomerSearchTerm(e.target.value);
      setShowCustomerSuggestions(true);
      setCurrentPage(0);
    }}
    onFocus={() => {
      setShowCustomerSuggestions(true);
      // Reset the search term when focusing to show all suggestions
      if (selectedCustomer) {
        setCustomerSearchTerm("");
        setSelectedCustomer("");
      }
    }}
    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
  />
  {showCustomerSuggestions && (
    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {filteredCustomerSuggestions.length > 0 ? (
        filteredCustomerSuggestions.map((customer, idx) => (
          <li
            key={idx}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => handleCustomerSelect(customer.customer_name)}
          >
            {customer.customer_name}
          </li>
        ))
      ) : (
        <li className="px-4 py-2 text-gray-500">No customers found</li>
      )}
    </ul>
  )}
</div>
          </div>
        </div>
        {showFilter && (
          <div className="flex gap-4 border border-gray-300 rounded-md p-5 my-5">
            <div className="relative w-full">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {startDate && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setCurrentPage(0);
                  }}
                  className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900"
                  aria-label="Clear start date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="relative w-full">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {endDate && (
                <button
                  onClick={() => {
                    setEndDate("");
                    setCurrentPage(0);
                  }}
                  className="absolute right-8 top-1.5 text-gray-600 hover:text-gray-900"
                  aria-label="Clear end date"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>
            
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Customer</th>
                <th className="border border-gray-700 px-2 py-1">Truck No</th>
                <th className="border border-gray-700 px-2 py-1">Loading Point</th>
                <th className="border border-gray-700 px-2 py-1">Unloading Point</th>
                <th className="border border-gray-700 px-2 py-1">Rent</th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {currentItems.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">{index + 1}.</td>
                  <td className="border border-gray-700 p-1">{dt.date}</td>
                  <td className="border border-gray-700 p-1">{dt.customer}</td>
                  <td className="border border-gray-700 p-1">{dt.vehicle_no}</td>
                  <td className="border border-gray-700 p-1">{dt.load_point}</td>
                  <td className="border border-gray-700 p-1">{dt.unload_point}</td>
                  <td className="border border-gray-700 p-1">{dt.total_rent}</td>
                  <td className="border border-gray-700 p-1 text-center">
                    {dt.status === "Pending" ? (
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={!!selectedRows[index]}
                        onChange={() => handleCheckBox(index)}
                      />
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs text-green-700 rounded">Submited</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={6} className="border border-black px-2 py-1 text-right">
                  Total
                </td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={13} className="border border-black px-2 py-1">
                  Total Amount In Words (For Body Bill):{" "}
                  <span className="font-medium">{numberToWords(totalBodyFare)}</span>
                </td>
              </tr>
              <tr className="font-bold">
                <td colSpan={13} className="border border-black px-2 py-1">
                  Total Amount In Words (For Fuel Bill): <span className="font-medium">{numberToWords(totalRent)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
          {/* Pagination */}
          {pageCount > 1 && (
            <div className="mt-4 flex justify-center">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={"flex items-center gap-1"}
                pageClassName={"px-3 py-1 border rounded hover:bg-gray-100 hover:text-black cursor-pointer"}
                previousClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                nextClassName={"px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer"}
                breakClassName={"px-3 py-1"}
                activeClassName={"bg-primary text-white border-primary"}
                forcePage={currentPage}
              />
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleSubmit}
            >
              Save Change
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bill



