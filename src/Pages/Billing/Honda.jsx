import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaFilter } from "react-icons/fa6";
import { HiCurrencyBangladeshi } from "react-icons/hi2";

const Honda = () => {
  const [honda, setHonda] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRows, setSelectedRows] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Fetch trips data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setHonda(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  // find honda
  const hondaTrip = honda?.filter((dt) => dt.customer === "Honda");

  const handleCheckBox = (index) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  // Filter start
  // Get selected data based on selectedRows
  const selectedTrips = hondaTrip.filter((_, idx) => selectedRows[idx]);
  // Fallback: show all if none selected
  const tripsToCalculate = selectedTrips.length > 0 ? selectedTrips : hondaTrip;
  const filteredTrips = hondaTrip.filter((trip) => {
    const tripDate = new Date(trip.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || tripDate >= start) && (!end || tripDate <= end);
  });
  // Filter end
  // Total trip
  const totalTrip = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.no_of_trip) || 0),
    0
  );
  // Per truck rent
  const perTruckRent = tripsToCalculate.reduce(
    (sum, dt) => sum + (parseFloat(dt.per_truck_rent) || 0),
    0
  );
  // Total rent
  const totalRent = tripsToCalculate.reduce((sum, dt) => {
    const trips = parseFloat(dt.no_of_trip || 0);
    const perTruckRent = parseFloat(dt.per_truck_rent || 0);
    return sum + trips * perTruckRent;
  }, 0);
  // Calculate 15% vat
  const totalVat = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt.total_rent || 0);
    const vatAmount = (rent * 15) / 100;
    return sum + vatAmount;
  }, 0);
  // Calculate Total Cost
  const totalCost = tripsToCalculate.reduce((sum, dt) => {
    const rent = parseFloat(dt.total_rent || 0);
    const vatAmount = (rent * 15) / 100;
    return sum + rent + vatAmount;
  }, 0);

  const handleSubmit = async () => {
    const selectedData = hondaTrip.filter((_, i) => selectedRows[i]);
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
        fd.append("delar_name", dt.dealer_name);
        fd.append("unload_point", dt.unload_point);
        fd.append("no_of_trip", dt.no_of_trip);
        fd.append("qty", dt.quantity);
        fd.append("vehicle_mode", dt.vehicle_mode);
        fd.append("per_truck_rent", dt.per_truck_rent);
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
        setHonda(refreshed.data.data);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed. Check console for details.", {
        position: "top-right",
      });
    }
  };

  if (loading) return <p className="text-center mt-16">Loading Honda...</p>;

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white md:p-4">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <HiCurrencyBangladeshi className="text-[#11375B] text-2xl" />
            Billing Honda
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
              // onClick={exportToExcel}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              Excel
            </button>
            <button
              // onClick={exportToPDF}
              className="py-2 px-5 hover:bg-primary bg-gray-200 hover:text-white rounded-md transition-all duration-300 cursor-pointer"
            >
              PDF
            </button>
            <button
              // onClick={handlePrint}
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
                <th className="border border-gray-700 px-2 py-1">SL.</th>
                <th className="border border-gray-700 px-2 py-1">Date</th>
                <th className="border border-gray-700 px-2 py-1">Do(Si)</th>
                <th className="border border-gray-700 px-2 py-1">DealerName</th>
                <th className="border border-gray-700 px-2 py-1">Address</th>
                <th className="border border-gray-700 px-2 py-1">NoOfTrip</th>
                <th className="border border-gray-700 px-2 py-1">NoOfUnit</th>
                <th className="border border-gray-700 px-2 py-1">
                  VehicleMode
                </th>
                <th className="border border-gray-700 px-2 py-1">
                  PerTruckRent
                </th>
                <th className="border border-gray-700 px-2 py-1">TotalRent</th>
                <th className="border border-gray-700 px-2 py-1">15%Vat</th>
                <th className="border border-gray-700 px-2 py-1">TotalCost</th>
                <th className="border border-gray-700 px-2 py-1">BillStatus</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {filteredTrips?.map((dt, index) => {
                const rent = parseFloat(dt?.total_rent) || 0;
                const vatAmount = (rent * 15) / 100;
                const totalCost = rent + vatAmount;

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-all">
                    <td className="border border-gray-700 p-1 font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-gray-700 p-1">{dt.date}</td>
                    <td className="border border-gray-700 p-1">{dt.do_si}</td>
                    <td className="border border-gray-700 p-1">
                      {dt.dealer_name}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.unload_point}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.no_of_trip}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.quantity}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.vehicle_mode}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.per_truck_rent}
                    </td>
                    <td className="border border-gray-700 p-1">
                      {dt.total_rent}
                    </td>
                    <td className="border border-gray-700 p-1">{vatAmount}</td>
                    <td className="border border-gray-700 p-1">{totalCost}</td>
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
                  colSpan={5}
                  className="border border-black px-2 py-1 text-right"
                >
                  Total
                </td>
                <td className="border border-black px-2 py-1">{totalTrip}</td>
                <td className="border border-black px-2 py-1">
                  {/* {totalQuantity} */}
                </td>
                <td className="border border-black px-2 py-1">
                  {/* {totalMasking} */}
                </td>
                <td className="border border-black px-2 py-1">
                  {perTruckRent}
                </td>
                <td className="border border-black px-2 py-1">{totalRent}</td>
                <td className="border border-black px-2 py-1">{totalVat}</td>
                <td className="border border-black px-2 py-1">{totalCost}</td>
                <td className="border border-black px-2 py-1"></td>
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

export default Honda;
