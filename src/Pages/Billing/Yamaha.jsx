import axios from "axios";
import { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { toWords } from "number-to-words";
pdfMake.vfs = pdfFonts.vfs;

const Yamaha = () => {
  const [yamaha, setYamaha] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // fetch data from server
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setYamaha(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  const yamahaTrip = yamaha?.filter((dt) => dt.customer === "Yamaha");
  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  // export to excel
  const exportToExcel = () => {
    const selectedData = yamahaTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "YamahaTrips");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "YamahaTrips.xlsx"
    );
  };
  // export to pdf
  const exportToPDF = () => {
    const selectedData = yamahaTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
    }

    const docDefinition = {
      content: [
        { text: "Yamaha Trip Report", style: "header" },
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
    };

    pdfMake.createPdf(docDefinition).download("YamahaTrips.pdf");
  };
  // handle print
  const handlePrint = () => {
    const selectedData = yamahaTrip.filter((_, i) => selectedRows[i]);
    if (!selectedData.length) {
      return toast.error("Please select at least one row.");
    }
    const months = [
      ...new Set(
        selectedData.map((dt) => {
          const dateObj = new Date(dt.date);
          return dateObj.toLocaleString("en-US", { month: "long" });
        })
      ),
    ];
    const monthText = months.join("/");
    const currentYear = new Date().getFullYear();
    const billNumber = `Bill No-${monthText}-${currentYear}-1426`;

    const totalBodyFare = selectedData.reduce(
      (sum, dt) => sum + (parseFloat(dt.body_fare) || 0),
      0
    );
    const totalFuelCost = selectedData.reduce(
      (sum, dt) => sum + (parseFloat(dt.fuel_cost) || 0),
      0
    );

    const totalBodyFareWords = numberToWords(totalBodyFare);
    const totalFuelCostWords = numberToWords(totalFuelCost);

    const newWindow = window.open("", "_blank");
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
          <div><strong>ACI Motors Ltd.</strong></div>
          <div>ACI Center</div>
          <div>245, Tejgaon I/A</div>
          <div>Dhaka-1208.</div>
          <div class="subject">Subject : Carrying Bill-${currentYear}</div>
        </div>
        <div class="bill-info">
          <div><strong>Bill Name :</strong> Yamaha Bill.</div>
          <div><strong>${billNumber}</strong></div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>SL</th>
            <th>Date</th>
            <th>Product</th>
            <th>Portfolio</th>
            <th>Vehicle</th>
            <th>Chalan</th>
            <th>From</th>
            <th>To</th>
            <th>Qty</th>
            <th>BodyFare</th>
            <th>Dropping</th>
            <th>FuelCost</th>
          </tr>
        </thead>
        <tbody>
          ${selectedData
            .map(
              (dt, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${dt.date}</td>
              <td>Motorcycle</td>
              <td>Yamaha</td>
              <td>${dt.vehicle_no}</td>
              <td>${dt.challan}</td>
              <td>${dt.load_point}</td>
              <td>${dt.unload_point}</td>
              <td>${dt.quantity}</td>
              <td>${dt.body_fare}</td>
              <td></td>
              <td>${dt.fuel_cost}</td>
            </tr>`
            )
            .join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="9" style="text-align: right;">Total</td>
            <td>${totalBodyFare}</td>
            <td></td>
            <td>${totalFuelCost}</td>
          </tr>
          <tr>
            <td colspan="13">Total Amount In Words (For Body Bill): ${totalBodyFareWords}</td>
          </tr>
          <tr>
            <td colspan="13">Total Amount In Words (For Fuel Bill): ${totalFuelCostWords}</td>
          </tr>
        </tfoot>
      </table>
    </body>
  </html>`;

    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  // Filter by date
  const filteredTrips = yamahaTrip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return tripDate >= start && tripDate <= end;
    } else if (start) {
      return tripDate.toDateString() === start.toDateString();
    } else {
      return true; // no filter applied
    }
  });

  // number to words
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero";
    return toWords(num).replace(/^\w/, (c) => c.toUpperCase()) + " Taka only.";
  };
  // Get selected data based on selectedRows
  const selectedTrips = filteredTrips.filter((_, idx) => selectedRows[idx]);

  // Fallback: show all if none selected
  const tripsToCalculate =
    selectedTrips.length > 0 ? selectedTrips : filteredTrips;

  const totalBodyFare = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.body_fare) || 0),
    0
  );
  const totalFuelCost = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.fuel_cost) || 0),
    0
  );
  // post data on server
  const handleSubmit = async () => {
    const selectedData = filteredTrips.filter((_, i) => selectedRows[i]);
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
        fd.append("customer_name", dt.customer);
        fd.append("vehicle_no", dt.vehicle_no);
        fd.append("chalan", dt.challan);
        fd.append("load_point", dt.load_point);
        fd.append("unload_point", dt.unload_point);
        fd.append("qty", dt.quantity);
        fd.append("body_cost", dt.body_fare);
        fd.append("fuel_cost", dt.fuel_cost);
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/customerLedger/create`,
          fd
        );
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
      const refreshed = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/trip/list`
      );
      if (refreshed.data.status === "Success") {
        setYamaha(refreshed.data.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Check console for details.", {
        position: "top-right",
      });
    }
  };

  if (loading) return <p className="text-center mt-16">Loading Yamaha...</p>;

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white md:p-4">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Yamaha
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

        {showFilter && (
          <div className="md:flex gap-6 justify-between border border-gray-300 rounded-md p-5 my-5 transition-all duration-300 pb-5">
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="relative w-full">
              <label className="block mb-1 text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-900">
            <thead className="capitalize text-sm">
              <tr>
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Product</th>
                <th className="border border-gray-700 px-2 py-1">Portfolio</th>
                <th className="border border-gray-700 px-2 py-1">Vehicle</th>
                <th className="border border-gray-700 px-2 py-1">Chalan</th>
                <th className="border border-gray-700 px-2 py-1">From</th>
                <th className="border border-gray-700 px-2 py-1">
                  Destination
                </th>
                <th className="border border-gray-700 px-2 py-1">Quantity</th>
                <th className="border border-gray-700 px-2 py-1">BodyFare</th>
                <th className="border border-gray-700 px-2 py-1">Dropping</th>
                <th className="border border-gray-700 px-2 py-1">FuelCost</th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredTrips.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="border border-gray-700 p-1 font-bold">
                    {index + 1}.
                  </td>
                  <td className="border border-gray-700 p-1">{dt.date}</td>
                  <td className="border border-gray-700 p-1">Motorcycle</td>
                  <td className="border border-gray-700 p-1">{dt.customer}</td>
                  <td className="border border-gray-700 p-1">
                    {dt.vehicle_no}
                  </td>
                  <td className="border border-gray-700 p-1">{dt.challan}</td>
                  <td className="border border-gray-700 p-1">
                    {dt.load_point}
                  </td>
                  <td className="border border-gray-700 p-1">
                    {dt.unload_point}
                  </td>
                  <td className="border border-gray-700 p-1">{dt.quantity}</td>
                  <td className="border border-gray-700 p-1">{dt.body_fare}</td>
                  <td className="border border-gray-700 p-1"></td>
                  <td className="border border-gray-700 p-1">{dt.fuel_cost}</td>
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
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td
                  colSpan={9}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">
                  {totalBodyFare}
                </td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1">
                  {totalFuelCost}
                </td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
              <tr className="font-bold">
                <td colSpan={13} className="border border-black px-2 py-1">
                  Total Amount In Words (For Body Bill):{" "}
                  <span className="font-medium">
                    {numberToWords(totalBodyFare)}
                  </span>
                </td>
              </tr>
              <tr className="font-bold">
                <td colSpan={13} className="border border-black px-2 py-1">
                  Total Amount In Words (For Fuel Bill):{" "}
                  <span className="font-medium">
                    {numberToWords(totalFuelCost)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-end mt-5">
            <button
              className="bg-gradient-to-r from-[#11375B] to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 cursor-pointer"
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

export default Yamaha;
