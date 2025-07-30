// import { useEffect, useState } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// const DailyCardOverview = () => {
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

// export default DailyCardOverview;


import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
const DailyCardOverview = () => {
  const [otherExpense, setOtherExpense] = useState(0);
  const [tripCost, setTripCost] = useState(0);
  const [totalTodayExpense, setTotalTodayExpense] = useState(0);
  const [dailySales, setDailySales] = useState({});
  const today = dayjs().format("YYYY-MM-DD");
  const [todayTripCount, setTodayTripCount] = useState(0);
  useEffect(() => {
    const fetchTodayExpenses = async () => {
      try {
        const purchaseRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/list`
        );
        const purchases = purchaseRes.data?.data || [];

        const todayPurchases = purchases.filter((item) => item.date === today);
        const purchaseTotal = todayPurchases.reduce((sum, item) => {
          const qty = parseFloat(item.quantity);
          const price = parseFloat(item.unit_price);
          return sum + (isNaN(qty) || isNaN(price) ? 0 : qty * price);
        }, 0);
        const tripRes = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/trip/list`
        );
        const trips = tripRes.data?.data || [];
        const todayTrips = trips.filter((item) => item.date === today);
        const tripFields = [
          "fuel_cost",
          "driver_commission",
          "road_cost",
          "food_cost",
          "body_fare",
          "toll_cost",
          "feri_cost",
          "police_cost",
          "driver_adv",
          "chada",
          "labor",
          "parking_cost",
          "night_guard",
          "unload_charge",
          "extra_fare",
          "vehicle_rent",
        ];

        let tripTotal = 0;
        todayTrips.forEach((trip) => {
          tripFields.forEach((field) => {
            const val = parseFloat(trip[field]);
            if (!isNaN(val)) {
              tripTotal += val;
            }
          });
        });

        const totalExpense = purchaseTotal + tripTotal;

        setOtherExpense(purchaseTotal);
        setTripCost(tripTotal);
        setTotalTodayExpense(totalExpense);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };

    fetchTodayExpenses();
  }, [today]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((response) => {
        const data = response.data.data;
        const today = new Date().toISOString().split("T")[0];
        const sale = data
          .filter((item) => item.date === today)
          .reduce((sum, trip) => sum + parseFloat(trip.total_rent || 0), 0);

        setDailySales(sale);
      })
      .catch((error) => {
        console.error("Error fetching trip data:", error);
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/trip/list`)
      .then((res) => {
        const allTrips = res.data.data;
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        // Filter trips matching today's date
        const todayTrips = allTrips.filter((trip) => trip.date === today);
        // Set today's trip count
        setTodayTripCount(todayTrips.length);
      });
  }, []);
  return (
    <div className="">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {/* Daily Sales */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Daily Sales</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sale</span>
                <span className="text-sm font-semibold text-gray-900">-</span>
                <span className="text-sm font-bold text-blue-600">{dailySales.toLocaleString()} TK</span>
              </div>
            </div>
          </div>

          {/* Daily Expense */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Daily Expense</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trip Cost</span>
                <span className="text-sm font-semibold text-gray-900">-</span>
                <span className="text-sm font-medium text-black">{tripCost.toFixed(2)} TK</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Others Expense</span>
                <span className="text-sm font-semibold text-gray-900">-</span>
                <span className="text-sm font-medium text-black">
                  {otherExpense.toFixed(2)} TK
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Total Expense</span>
                <span className="text-sm font-semibold text-gray-900">-</span>
                <span className="text-sm font-medium text-black">{totalTodayExpense.toFixed(2)} TK</span>
              </div>
            </div>
          </div>

          {/* Daily Trip */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">Daily Trip</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today Trip</span>
                <span className="text-sm font-semibold text-gray-900">-</span>
                <span className="text-sm font-bold text-green-600"> {todayTripCount}</span>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default DailyCardOverview;