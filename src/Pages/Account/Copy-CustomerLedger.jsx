import axios from "axios";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";

const CustomerLedger = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  // Fetch customer ledger data
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customerLedger/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          const data = response.data.data;
          setCustomer(data);

          // Extract unique customer names
          const uniqueCustomers = Array.from(
            new Set(data.map((item) => item.customer_name))
          );
          setCustomerList(uniqueCustomers);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customer data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-16">Loading customer...</p>;

  // Filtered data based on selected customer
  const filteredCustomer = selectedCustomer
    ? customer.filter((item) => item.customer_name === selectedCustomer)
    : customer;

  return (
    <main className="bg-gradient-to-br from-gray-100 to-white md:p-2 overflow-hidden">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#11375B] capitalize flex items-center gap-3">
            Customer ledger
          </h1>
        </div>

        {/* Export */}
        <div className="md:flex items-center justify-between mb-4">
          <div className="flex gap-1 md:gap-3 flex-wrap">
            <div className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all">
              CSV
            </div>
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Excel
            </button>
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              PDF
            </button>
            <button className="py-2 px-5 bg-gray-200 text-primary font-semibold rounded-md hover:bg-primary hover:text-white transition-all cursor-pointer">
              Print
            </button>
          </div>

          <div className="mt-3 md:mt-0">
            <div className="relative w-full">
              <label className="text-primary text-sm font-semibold">
                Select Customer Ledger
              </label>
              <select
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Select customer</option>
                {customerList.map((name, i) => (
                  <option key={i} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-[1030px] mt-5 overflow-x-auto border border-gray-200">
          <table className="text-sm text-left">
            <thead className="text-black capitalize font-bold">
              <tr>
                <th className="border border-gray-700 p-1">SL.</th>
                <th className="border border-gray-700 p-1">BillDate</th>
                <th className="border border-gray-700 p-1">WorkingDate</th>
                <th className="border border-gray-700 p-1">Chalan</th>
                <th className="border border-gray-700 p-1">Vehicle</th>
                <th className="border border-gray-700 p-1">Load</th>
                <th className="border border-gray-700 p-1">Unload</th>
                <th className="border border-gray-700 p-1">Qty</th>
                <th className="border border-gray-700 p-1">FuelCost</th>
                <th className="border border-gray-700 p-1 text-center">
                  BillAmount
                  <br />
                  with VAT & TAX
                </th>

                <th className="border border-gray-700 p-1 text-center">
                  Net Bill
                  <br />
                  Receivable after Tax
                </th>
                <th className="border border-gray-700 p-1 text-center">
                  ReceiveAmount
                </th>
                <th className="text-center border border-black py-1">
                  <p className="border-b">OpeningBalance 2000</p>
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="text-black font-semibold">
              {(() => {
                let openingBalance = 2000; // Initial opening balance
                return filteredCustomer?.map((dt, index) => {
                  const receiveAmount = Number(dt.total_amount) || 0;
                  const currentBalance = receiveAmount - openingBalance;

                  const row = (
                    <tr key={index} className="hover:bg-gray-50 transition-all">
                      <td className="border border-gray-700 p-1 font-bold">
                        {index + 1}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.bill_date}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.woring_date}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.challan}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.vehicle_no}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.load_point}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.unload_point}
                      </td>
                      <td className="border border-gray-700 p-1">{dt.qty}</td>
                      <td className="border border-gray-700 p-1">500</td>
                      <td className="border border-gray-700 p-1">
                        {dt.bill_amount}
                      </td>
                      <td className="border border-gray-700 p-1">50</td>
                      <td className="border border-gray-700 p-1">
                        {dt.total_amount}
                      </td>
                      <td className="border border-gray-700 p-1">
                        {dt.due_amount}
                      </td>
                    </tr>
                  );

                  // Update openingBalance for next iteration
                  openingBalance = currentBalance;
                  return row;
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default CustomerLedger;
