import axios from "axios";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import toast, { Toaster } from "react-hot-toast";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import { toWords } from "number-to-words";

const Suzuki = () => {
  const [suzuki, setSuzuki] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch trips data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}ng/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setSuzuki(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // find Suzuki
  const suzukiTrip = suzuki?.filter((dt) => dt.customer === "Suzuki");
  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  // export to excel
  const exportToExcel = () => {
    const selectedData = suzukiTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
    }
    const excelData = selectedData.map((dt, idx) => {
      const rent = parseFloat(dt?.total_rent) || 0;
      const vatAmount = (rent * 15) / 100;
      const totalCost = rent + vatAmount;

      const totalAmount =
        (parseFloat(dt.marking) || 0) +
        (parseFloat(dt.unload_charge) || 0) +
        (parseFloat(dt.extra_fare) || 0) +
        totalCost;
      return {
        SL: idx + 1,
        Date: dt.date,
        VehicleNo: dt.vehicle_no,
        DealerName: dt.dealer_name,
        "Do(Si)": dt.do_si,
        "Co(U)": dt.co_u,
        Destination: dt.unload_point,
        Quantity: dt.quantity,
        Masking: dt.masking,
        UnloadCharge: dt.unload_charge,
        ExtraFare: dt.extra_fare,
        VehicleRentWithVatTax: totalCost,
        TotalAmount: totalAmount,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SuzukiTrips");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "SuzukiTrips.xlsx"
    );
  };
  // export to pdf
  const exportToPDF = () => {
    const selectedData = suzukiTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
    }
    const docDefinition = {
      pageOrientation: "landscape", // Optional: for wide tables
      content: [
        { text: "Suzuki Trip Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: [
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ],
            body: [
              [
                "SL.",
                "Date",
                "VehicleNo",
                "DealerName",
                "Do(Si)",
                "Co(U)",
                "Destination",
                "BikeQty",
                "Masking",
                "UnloadCharge",
                "ExtraFare",
                "VehicleRent WithVatTax",
                "Total Amount",
              ],
              ...selectedData.map((dt, idx) => {
                const rent = parseFloat(dt?.total_rent) || 0;
                const vatAmount = (rent * 15) / 100;
                const totalCost = rent + vatAmount;
                const totalAmount =
                  (parseFloat(dt.marking) || 0) +
                  (parseFloat(dt.unload_charge) || 0) +
                  (parseFloat(dt.extra_fare) || 0) +
                  totalCost;

                return [
                  idx + 1,
                  dt.date,
                  dt.vehicle_no,
                  dt.dealer_name,
                  dt.do_si,
                  dt.co_u,
                  dt.unload_point,
                  dt.quantity,
                  dt.masking,
                  dt.unload_charge,
                  dt.extra_fare,
                  totalCost.toFixed(2),
                  totalAmount.toFixed(2),
                ];
              }),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          marginBottom: 10,
          alignment: "center",
        },
      },
    };

    pdfMake.createPdf(docDefinition).download("SuzukiTrips.pdf");
  };
  // handle print
  const handlePrint = () => {
    const selectedData = suzukiTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
    }

    const currentYear = new Date().getFullYear();

    let totalQuantity = 0;
    let totalMasking = 0;
    let totalUnload = 0;
    let totalExtraFare = 0;
    let totalVehicleRentWithVAT = 0;
    let grandTotal = 0;

    const rowsHTML = selectedData
      .map((dt, i) => {
        const rent = parseFloat(dt?.total_rent) || 0;
        const vat = (rent * 15) / 100;
        const totalCost = rent + vat;
        const masking = parseFloat(dt.masking) || 0;
        const unload = parseFloat(dt.unload_charge) || 0;
        const extraFare = parseFloat(dt.extra_fare) || 0;
        const totalAmount = masking + unload + extraFare + totalCost;

        totalQuantity += parseFloat(dt.quantity) || 0;
        totalMasking += masking;
        totalUnload += unload;
        totalExtraFare += extraFare;
        totalVehicleRentWithVAT += totalCost;
        grandTotal += totalAmount;

        return `
        <tr>
          <td>${i + 1}</td>
          <td>${dt.date}</td>
          <td>${dt.vehicle_no}</td>
          <td>${dt.dealer_name}</td>
          <td>${dt.do_si}</td>
          <td>${dt.co_u}</td>
          <td>${dt.unload_point}</td>
          <td>${dt.quantity}</td>
          <td>${dt.masking}</td>
          <td>${dt.unload_charge}</td>
          <td>${dt.extra_fare}</td>
          <td>${totalCost.toFixed(2)}</td>
          <td>${totalAmount.toFixed(2)}</td>
        </tr>`;
      })
      .join("");

    const totalInWords = numberToWords(grandTotal);

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
        .header-section { margin-bottom: 5px; }
        .subject { margin-top: 20px; }
        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #000;
          padding: 4px;
          text-align: center;
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
          <div><strong>Rancon Motor Bikes Ltd.</strong></div>
          <div>Boro Bhobanipur</div>
          <div>Kashimpur, Gazipur</div>
          <div>Dhaka</div>
          <div class="subject">Subject : Carrying Bill-${currentYear}</div>
        </div>
        
      </div>
      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>Date</th>
            <th>Vehicle No</th>
            <th>Dealer Name</th>
            <th>Do (Si)</th>
            <th>Co (U)</th>
            <th>Destination</th>
            <th>Bike<br/>Qty</th>
            <th>Mask-<br/>ing</th>
            <th>Unload<br/>Charge</th>
            <th>Extra<br/>Fare</th>
            <th>Vehicle Rent<br/>(With Vat+Tax)</th>
            <th>Total<br/>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="7">Total</td>
            <td>${totalQuantity}</td>
            <td>${totalMasking}</td>
            <td>${totalUnload}</td>
            <td>${totalExtraFare}</td>
            <td>${totalVehicleRentWithVAT}</td>
            <td>${grandTotal}</td>
          </tr>
          <tr>
            <td colspan="13" style="text-align:left;">In Words: <strong>${totalInWords}</strong></td>
          </tr>
        </tfoot>
      </table>
    </body>
  </html>`;

    const newWindow = window.open("", "_blank");
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  // Filter start
  // Get selected data based on selectedRows
  const selectedTrips = suzukiTrip.filter((_, idx) => selectedRows[idx]);
  // Fallback: show all if none selected
  const tripsToCalculate =
    selectedTrips.length > 0 ? selectedTrips : suzukiTrip;
  const filteredTrips = suzukiTrip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || tripDate >= start) && (!end || tripDate <= end);
  });
  // Filter end
  // Bike quantity
  const totalQuantity = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.quantity) || 0),
    0
  );
  // Total masking
  const totalMasking = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.masking) || 0),
    0
  );
  // Total extra fare
  const totalExtraFare = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.extra_fare) || 0),
    0
  );
  // Unload charge
  const totalUnload = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.unload_charge) || 0),
    0
  );
  // Total vehicle rent with VAT
  const totalVehicleRentWithVAT = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt?.total_rent) || 0;
    const vatAmount = (rent * 15) / 100;
    return sum + rent + vatAmount;
  }, 0);

  // Grand Total (masking + unload + extra + vehicle rent + vat)
  const grandTotal = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt?.total_rent) || 0;
    const vatAmount = (rent * 15) / 100;
    const totalCost = rent + vatAmount;
    return (
      sum +
      (parseFloat(dt.masking) || 0) +
      (parseFloat(dt.unload_charge) || 0) +
      (parseFloat(dt.extra_fare) || 0) +
      totalCost
    );
  }, 0);
  // number to word footer bottom
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero";
    return toWords(num).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only.";
  };
  // post data on server
  const handleSubmit = async () => {
    const selectedData = suzukiTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.", {
        position: "top-right",
      });
    }
    try {
      const loadingToast = toast.loading("Submitting selected rows...");
      for (const dt of selectedData) {
        const fd = new FormData();
        fd.append("bill_date", new Date().toISOString().split("T")[0]);
        fd.append("vehicle_no", dt.vehicle_no);
        fd.append("customer_name", dt.customer);
        fd.append("delar_name", dt.dealer_name);
        fd.append("do", dt.do_si);
        fd.append("co", dt.co_u);
        fd.append("unload_point", dt.unload_point);
        fd.append("qty", dt.quantity);
        fd.append("masking", dt.masking);
        fd.append("unload_charge", dt.unload_charge);
        fd.append("extra_fare", dt.extra_fare);
        fd.append("load_point", dt.load_point);
        fd.append("total_amount", dt.total_rent);
        // Step 1: Create ledger entry
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`,
          fd
        );
        // Step 2: Update trip status to Approved
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/trip/update/${dt.id}`,
          { status: "Approved" }
        );
      }
      toast.success("Successfully submitted!", {
        id: loadingToast,
        position: "top-right",
      });
      setSelectedRows({});

      // Optional: refetch trips to refresh data
      const refreshed = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/trip/list`
      );
      if (refreshed.data.status === "Success") {
        setSuzuki(refreshed.data.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Check console for details.", {
        position: "top-right",
      });
    }
  };

  if (loading) return <p className="text-center mt-16">Loading Suzuki...</p>;

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white md:p-4">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Suzuki
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
              onClick={() => setShowFilter((prev) => !prev)}
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaFilter /> Filter
            </button>
          </div>
        </div>
        {/* export and search */}
        <div className="md:flex justify-between items-center">
          <div className="flex gap-1 md:gap-3 text-primary font-semibold rounded-md">
            <button
              onClick={exportToExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Print
            </button>
          </div>
        </div>
        {/* Conditional Filter Section */}
        {showFilter && (
          <div className="md:flex gap-6 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <input
                onChange={(e) => setStartDate(e.target.value)}
                type="date"
                placeholder="Start date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>

            <div className="relative w-full">
              <input
                onChange={(e) => setEndDate(e.target.value)}
                type="date"
                placeholder="End date"
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
        )}
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 p-1">SL.</th>
                <th className="border border-gray-700 p-1">Date</th>
                <th className="border border-gray-700 p-1">VehicleNo.</th>
                <th className="border border-gray-700 p-1">DealerName</th>
                <th className="border border-gray-700 p-1">Do(Si)</th>
                <th className="border border-gray-700 p-1">Co(U)</th>
                <th className="border border-gray-700 p-1">Destination</th>
                <th className="border border-gray-700 p-1">
                  Bike
                  <br />
                  Qty
                </th>
                <th className="border border-gray-700 p-1">Masking</th>
                <th className="border border-gray-700 p-1">
                  Unload
                  <br />
                  Charge
                </th>
                <th className="border border-gray-700 p-1">
                  Extra
                  <br />
                  Fare
                </th>
                <th className="border border-gray-700 p-1">
                  VehicleRent
                  <br />
                  WithVatTax
                </th>
                <th className="border border-gray-700 p-1">
                  Total
                  <br />
                  Amount
                </th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredTrips?.map((dt, index) => {
                const rent = parseFloat(dt?.total_rent) || 0;
                const vatAmount = (rent * 15) / 100;
                const totalCost = rent + vatAmount;
                // total amount with masking + unload charge + extra fare + VehicleRent WithVatTax
                const totalAmount =
                  (parseFloat(dt.marking) || 0) +
                  (parseFloat(dt.unload_charge) || 0) +
                  (parseFloat(dt.extra_fare) || 0) +
                  totalCost;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.date}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_no}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.dealer_name}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.do_si}</td>
                    <td className="border border-gray-700 p-1">{dt.co_u}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.quantity}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.masking}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_charge}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.extra_fare}
                    </td>
                    <td className="border border-gray-700 p-1">{totalCost}</td>
                    <td className="border border-gray-700 p-1">
                      {totalAmount}
                    </td>
                    <td className="border border-gray-700 p-1 text-center">
                      {dt.status === "Pending" ? (
                        <input
                          type="checkbox"
                          className="w-4 h-4"
                          checked={!!selectedRows[index]}
                          onChange={() => handleCheckBox(index)}
                        />
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs text-green-700 rounded">
                          Submited
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td
                  colSpan={7}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">
                  {totalQuantity}
                </td>
                <td className="border border-black px-2 py-1">
                  {totalMasking}
                </td>
                <td className="border border-black px-2 py-1">{totalUnload}</td>
                <td className="border border-black px-2 py-1">
                  {totalExtraFare}
                </td>
                <td className="border border-black px-2 py-1">
                  {totalVehicleRentWithVAT}
                </td>
                <td className="border border-black px-2 py-1">{grandTotal}</td>
                <td className="border border-black px-2 py-1"></td>
              </tr>

              <tr className="font-bold">
                <td colSpan={7} className="border border-black px-2 py-1">
                  In Words:{" "}
                  <span className="font-medium">
                    {numberToWords(grandTotal)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-end mt-5">
            <button
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300  cursor-pointer"
              onClick={handleSubmit}
            >
              Save Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suzuki;
