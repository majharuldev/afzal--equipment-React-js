// // import React, { useEffect, useState } from "react";
// // import axios from "axios";
// // import dayjs from "dayjs";

// // const OverViewCard = () => {
// //   const [expiringDocs, setExpiringDocs] = useState([]);
// //   const [octenCost, setOctenCost] = useState(0);
// //   const [dieselCost, setDieselCost] = useState(0);
// //   const [petrolCost, setPetrolCost] = useState(0);
// //   const [gasCost, setGasCost] = useState(0);

// //   const today = dayjs().format("YYYY-MM-DD");

// //   // রিমাইন্ডার ফেচ
// //   useEffect(() => {
// //     const fetchVehicles = async () => {
// //       try {
// //         const response = await axios.get(
// //           "https://api.tramessy.com/api/vehicle"
// //         );
// //         const vehicles = response.data?.data || [];

// //         const todayDate = dayjs();
// //         const expiring = [];

// //         vehicles.forEach((vehicle) => {
// //           ["fitness_date", "road_permit_date", "text_date"].forEach((type) => {
// //             const date = dayjs(vehicle[type]);
// //             if (
// //               date.isValid() &&
// //               date.diff(todayDate, "day") <= 7 &&
// //               date.diff(todayDate, "day") >= 0
// //             ) {
// //               expiring.push({
// //                 vehicle: vehicle.registration_number,
// //                 document: type.replace(/_/g, " ").toUpperCase(),
// //                 expireDate: date.format("DD-MM-YYYY"),
// //               });
// //             }
// //           });
// //         });

// //         setExpiringDocs(expiring);
// //       } catch (error) {
// //         console.error("Error fetching vehicle data:", error);
// //       }
// //     };

// //     fetchVehicles();
// //   }, []);

// //   // আজকের ফুয়েল এবং গ্যাস Cost
// //   useEffect(() => {
// //     const fetchFuelData = async () => {
// //       try {
// //         const response = await axios.get("https://api.tramessy.com/api/fuel");
// //         const fuels = response.data?.data || [];

// //         let octen = 0;
// //         let diesel = 0;
// //         let petrol = 0;
// //         let gas = 0;

// //         fuels.forEach((fuel) => {
// //           if (fuel.date_time === today) {
// //             const totalPrice = parseFloat(fuel.total_price) || 0;
// //             const type = (fuel.type || "").toLowerCase();

// //             if (type === "octen") {
// //               octen += totalPrice;
// //             } else if (type === "diesel") {
// //               diesel += totalPrice;
// //             } else if (type === "petroll" || type === "petrol") {
// //               petrol += totalPrice;
// //             } else if (type === "gas") {
// //               gas += totalPrice;
// //             }
// //           }
// //         });

// //         setOctenCost(octen);
// //         setDieselCost(diesel);
// //         setPetrolCost(petrol);
// //         setGasCost(gas);
// //       } catch (error) {
// //         console.error("Error fetching fuel data:", error);
// //       }
// //     };

// //     fetchFuelData();
// //   }, [today]);

// //   const totalCost = octenCost + dieselCost + petrolCost + gasCost;

// //   return (
// //     <div className="md:p-5">
// //       <ul className="md:flex gap-3">
// //         {/* আয় কার্ড */}
// //         <li className="bg-white rounded-md p-3 w-full md:w-full mb-3 shadow-lg">
// //           <div className="text-primary border-b pb-3 border-gray-300">
// //             <h3 className="font-semibold">Today Income</h3>
// //           </div>
// //           <div className="p-3 text-primary font-semibold text-sm space-y-2">
// //             <div className="flex items-center gap-3">
// //               <p className="flex justify-between w-full border-t mt-3 pt-3">
// //                 <span>Total Profit</span> - <span>1595</span>
// //                 {/* চাইলে ডাইনামিক করতে পারো */}
// //               </p>
// //             </div>
// //           </div>
// //         </li>

// //         {/* ব্যয় কার্ড */}
// //         <li className="bg-white rounded-md p-3 w-full md:w-full mb-3 shadow-lg">
// //           <div className="text-primary border-b pb-3 border-gray-300">
// //             <h3 className="font-semibold">Today Expense</h3>
// //           </div>
// //           <div className="p-3 text-primary font-semibold text-sm space-y-2">
// //             <div className="flex items-center gap-3">
// //               <div className="bg-primary w-[6px] h-[6px] rounded-full" />
// //               <p className="flex justify-between w-full">
// //                 <span>Octen Cost</span> - <span>{octenCost.toFixed(2)} TK</span>
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="bg-primary w-[6px] h-[6px] rounded-full" />
// //               <p className="flex justify-between w-full">
// //                 <span>Diesel Cost</span> -{" "}
// //                 <span>{dieselCost.toFixed(2)} TK</span>
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="bg-primary w-[6px] h-[6px] rounded-full" />
// //               <p className="flex justify-between w-full">
// //                 <span>Petrol Cost</span> -{" "}
// //                 <span>{petrolCost.toFixed(2)} TK</span>
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <div className="bg-primary w-[6px] h-[6px] rounded-full" />
// //               <p className="flex justify-between w-full">
// //                 <span>Gas Cost</span> - <span>{gasCost.toFixed(2)} TK</span>
// //               </p>
// //             </div>
// //             <div className="flex items-center gap-3">
// //               <p className="flex justify-between w-full border-t mt-3 pt-3">
// //                 <span>Total Expense</span> -{" "}
// //                 <span>{totalCost.toFixed(2)} TK</span>
// //               </p>
// //             </div>
// //           </div>
// //         </li>

// //         {/* রিমাইন্ডার কার্ড */}
// //         <li className="bg-white rounded-md p-3 w-full md:w-full mb-3 shadow-lg">
// //           <div className="text-primary border-b pb-3 border-gray-300">
// //             <h3 className="font-semibold">Remainder</h3>
// //           </div>
// //           <div className="py-3 text-primary font-semibold text-sm space-y-2">
// //             {expiringDocs.length > 0 ? (
// //               expiringDocs.map((item, i) => (
// //                 <div key={i} className="flex items-center gap-3">
// //                   <div className="w-full">
// //                     <p>Vehicle No: {item.vehicle}</p>
// //                     <p>Document's Name: {item.document}</p>
// //                     <p>Expired Date: {item.expireDate}</p>
// //                   </div>
// //                 </div>
// //               ))
// //             ) : (
// //               <p className="text-sm text-gray-500">No expiration date.</p>
// //             )}
// //           </div>
// //         </li>
// //       </ul>
// //     </div>
// //   );
// // };

// // export default OverViewCard;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// const OverViewCard = () => {
//   const [otherExpense, setOtherExpense] = useState(0);
//   const [tripCost, setTripCost] = useState(0);
//   const [totalTodayExpense, setTotalTodayExpense] = useState(0);
//   const [dailySales, setDailySales] = useState({});
//   const today = dayjs().format("YYYY-MM-DD");
//   const [todayTripCount, setTodayTripCount] = useState(0);
//   useEffect(() => {
//     const fetchTodayExpenses = async () => {
//       try {
//         const purchaseRes = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/api/purchase/list`
//         );
//         const purchases = purchaseRes.data?.data || [];

//         const todayPurchases = purchases.filter((item) => item.date === today);
//         const purchaseTotal = todayPurchases.reduce((sum, item) => {
//           const qty = parseFloat(item.quantity);
//           const price = parseFloat(item.unit_price);
//           return sum + (isNaN(qty) || isNaN(price) ? 0 : qty * price);
//         }, 0);
//         const tripRes = await axios.get(
//           `${import.meta.env.VITE_BASE_URL}/api/trip/list`
//         );
//         const trips = tripRes.data?.data || [];
//         const todayTrips = trips.filter((item) => item.date === today);
//         const tripFields = [
//           "fuel_cost",
//           "driver_commission",
//           "road_cost",
//           "food_cost",
//           "body_fare",
//           "toll_cost",
//           "feri_cost",
//           "police_cost",
//           "driver_adv",
//           "chada",
//           "labor",
//           "parking_cost",
//           "night_guard",
//           "unload_charge",
//           "extra_fare",
//           "vehicle_rent",
//         ];

//         let tripTotal = 0;
//         todayTrips.forEach((trip) => {
//           tripFields.forEach((field) => {
//             const val = parseFloat(trip[field]);
//             if (!isNaN(val)) {
//               tripTotal += val;
//             }
//           });
//         });

//         const totalExpense = purchaseTotal + tripTotal;

//         setOtherExpense(purchaseTotal);
//         setTripCost(tripTotal);
//         setTotalTodayExpense(totalExpense);
//       } catch (err) {
//         console.error("Error fetching expenses:", err);
//       }
//     };

//     fetchTodayExpenses();
//   }, [today]);

//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
//       .then((response) => {
//         const data = response.data.data;
//         const today = new Date().toISOString().split("T")[0];
//         const sale = data
//           .filter((item) => item.date === today)
//           .reduce((sum, trip) => sum + parseFloat(trip.total_rent || 0), 0);

//         setDailySales(sale);
//       })
//       .catch((error) => {
//         console.error("Error fetching trip data:", error);
//       });
//   }, []);
//   useEffect(() => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
//       .then((res) => {
//         const allTrips = res.data.data;
//         // Get today's date in YYYY-MM-DD format
//         const today = new Date().toISOString().split("T")[0];
//         // Filter trips matching today's date
//         const todayTrips = allTrips.filter((trip) => trip.date === today);
//         // Set today's trip count
//         setTodayTripCount(todayTrips.length);
//       });
//   }, []);
//   return (
//     <div className="md:p-5">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//         {/* Sales */}
//         <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
//           <h3 className="text-lg font-bold text-primary border-b pb-2 mb-4">
//             Daily Sales
//           </h3>
//           <div className="text-gray-700 text-sm space-y-2">
//             <div className="flex justify-between font-semibold">
//               <span>Total Sale</span>-
//               <span>{dailySales.toLocaleString()} TK</span>
//             </div>
//           </div>
//         </div>

//         {/* Expense */}
//         <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
//           <h3 className="text-lg font-bold text-primary border-b pb-2 mb-4">
//             Daily Expense
//           </h3>
//           <div className="text-gray-700 text-sm space-y-3">
//             <div className="flex justify-between font-semibold">
//               <span>Trip Cost</span>-<span>{tripCost.toFixed(2)} TK</span>
//             </div>
//             <div className="flex justify-between font-semibold">
//               <span>Others Expense</span>-
//               <span>{otherExpense.toFixed(2)} TK</span>
//             </div>
//             <div className="border-t pt-2 mt-2 flex justify-between font-bold">
//               <span>Total Expense</span>-
//               <span>{totalTodayExpense.toFixed(2)} TK</span>
//             </div>
//           </div>
//         </div>
//         {/* daily trip */}
//         <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer">
//           <h3 className="text-lg font-bold text-primary border-b pb-2 mb-4">
//             Daily Trip
//           </h3>
//           <div className="text-gray-700 text-sm space-y-2">
//             <div className="flex justify-between font-semibold">
//               <span>Today Trip</span>-<span> {todayTripCount}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OverViewCard;

import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const OverViewCard = () => {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/vehicle/list`
        );
        const vehicles = response.data?.data || [];
        const today = dayjs();
        const expiring = [];

        vehicles.forEach((vehicle) => {
          ["fitness_date", "road_permit_date", "registration_date"].forEach(
            (type) => {
              const rawDate = vehicle[type];
              if (rawDate) {
                const date = dayjs(rawDate);
                const remaining = date.diff(today, "day");

                if (date.isValid() && remaining >= 0 && remaining <= 7) {
                  expiring.push({
                    vehicle: `${vehicle.registration_zone}-${vehicle.registration_number}`,
                    document: type
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase()),
                    expireDate: date.format("DD-MM-YYYY"),
                    remaining,
                  });
                }
              }
            }
          );
        });

        setExpiringDocs(expiring);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false); // set loading false after fetch
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 lg:h-[350px]">
        <h3 className="text-xl font-bold text-primary border-b border-gray-200 pb-2 mb-4">
          Document Reminder
        </h3>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-[200px] text-primary">
            <AiOutlineLoading3Quarters className="animate-spin text-5xl mb-3" />
            <p className="text-sm">Checking for expiring documents...</p>
          </div>
        ) : expiringDocs.length > 0 ? (
          <div className="overflow-x-auto max-h-60 overflow-y-auto hide-scrollbar">
            <table className="min-w-full text-sm text-left border border-gray-200">
              <thead className="bg-gray-100 text-primary">
                <tr>
                  <th className="p-2">SL.</th>
                  <th className="p-2">Vehicle Number</th>
                  <th className="p-2">Document</th>
                  <th className="p-2">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {expiringDocs.map((item, i) => (
                  <tr
                    key={i}
                    className="text-gray-700 font-semibold text-sm border-b border-gray-200"
                  >
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{item.vehicle}</td>
                    <td className="p-2">{item.document}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-white text-xs font-semibold ${
                          item.remaining === 0 ? "bg-red-500" : "bg-yellow-500"
                        }`}
                      >
                        {item.remaining} {item.remaining === 1 ? "day" : "days"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <span className="text-4xl flex justify-center mt-20">
              <HiOutlineBellAlert />
            </span>
            <p className="text-lg">No documents expiring soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverViewCard;
