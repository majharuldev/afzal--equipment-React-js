
// import axios from "axios";
// import { useEffect, useState } from "react";
// import { FaTruck, FaChartPie, FaUsers } from "react-icons/fa";
// import dayjs from "dayjs";
// import api from "../utils/axiosConfig";

// const StatisticsCard = () => {
//   const [tripData, setTripData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [activeVehicleList, setActiveVehicleList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalSales: 0,
//     totalTrips: 0,
//     todayTrips: 0,
//     todaySales: 0,
//     totalProfit: 0,
//     avgTripValue: 0,
//     totalDistance: 0,
//     activeVehicles: 0,
//     topRoute: "",
//     peakHour: "",
//   });

//   const [dailySales, setDailySales] = useState(0);
//   const [todayTripCount, setTodayTripCount] = useState(0);

//   const handleActiveVehicleClick = () => {
//     const vehicles = [...new Set(tripData.map((trip) => 
//       trip.vehicle_number || 
//       trip.vehicle || 
//       trip.vehicle_no || 
//       ""
//     ))].filter(v => v && v.toString().trim() !== "");
    
//     setActiveVehicleList(vehicles);
//     setIsModalOpen(true);
//   };

//   const today = dayjs().format("YYYY-MM-DD");

//   useEffect(() => {
//     const fetchTripData = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get(`/trip`);
//         const trips = response.data || [];
//         setTripData(trips);

//         const todayTrips = trips.filter((trip) => 
//           dayjs(trip.created_at || trip.date).format("YYYY-MM-DD") === today
//         );

//         // Calculate total sales
//         const totalSales = trips.reduce((sum, trip) => {
//           const amount = parseFloat(
//             trip.amount || 
//             trip.fare || 
//             trip.total_rent || 
//             trip.trip_rent || 
//             0
//           );
//           return sum + (isNaN(amount) ? 0 : amount);
//         }, 0);

//         // Calculate today's sales
//         const todaySales = todayTrips.reduce((sum, trip) => {
//           const amount = parseFloat(
//             trip.amount || 
//             trip.fare || 
//             trip.total_rent || 
//             trip.trip_rent || 
//             0
//           );
//           return sum + (isNaN(amount) ? 0 : amount);
//         }, 0);

//         // Calculate average trip value
//         const avgTripValue = trips.length > 0 ? totalSales / trips.length : 0;

//         // Calculate total distance
//         const totalDistance = trips.reduce((sum, trip) => 
//           sum + Number.parseFloat(trip.distance || 0)
//         , 0);

//         // Get unique vehicles
//         const uniqueVehicles = [...new Set(trips.map((trip) => 
//           trip.vehicle_number || 
//           trip.vehicle || 
//           trip.vehicle_no || 
//           ""
//         ))].filter(v => v && v.toString().trim() !== "");

//         // Find most popular route
//         const routeCounts = {};
//         trips.forEach((trip) => {
//           const route = `${trip.from_location || trip.from || "Unknown"} → ${trip.to_location || trip.to || "Unknown"}`;
//           routeCounts[route] = (routeCounts[route] || 0) + 1;
//         });
//         const topRoute = Object.keys(routeCounts).reduce((a, b) => 
//           (routeCounts[a] > routeCounts[b] ? a : b), "N/A"
//         );

//         // Find peak hour
//         const hourCounts = {};
//         trips.forEach((trip) => {
//           const hour = dayjs(trip.created_at || trip.date).format("HH");
//           hourCounts[hour] = (hourCounts[hour] || 0) + 1;
//         });
//         const peakHour = Object.keys(hourCounts).reduce((a, b) => 
//           (hourCounts[a] > hourCounts[b] ? a : b), ""
//         );

//         setStats({
//           totalSales,
//           totalTrips: trips.length,
//           todayTrips: todayTrips.length,
//           todaySales,
//           totalProfit: totalSales,
//           avgTripValue,
//           totalDistance,
//           activeVehicles: uniqueVehicles.length,
//           topRoute,
//           peakHour: peakHour ? `${peakHour}:00` : "N/A",
//         });

//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching trip data:", error);
//         setLoading(false);
//       }
//     };

//     fetchTripData();
//   }, [today]);

//   useEffect(() => {
//     api.get(`/trip`)
//       .then((response) => {
//         const data = response.data;
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
//     api.get(`/trip`)
//       .then((res) => {
//         const allTrips = res.data;
//         const today = new Date().toISOString().split("T")[0];
//         const todayTrips = allTrips.filter((trip) => trip.date === today);
//         setTodayTripCount(todayTrips.length);
//       });
//   }, []);

//   return (
//     <div className="">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-5">
//         {/* Daily Income Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">দৈনিক আয়</p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {(typeof dailySales === "number" ? dailySales : dailySales?.amount || 0).toLocaleString()} TK
//               </p>
//             </div>
//             <div className="p-3 bg-purple-100 rounded-full">
//               <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
//                 <text x="5" y="18" fontSize="26" fontWeight="bold" fill="currentColor">৳</text>
//               </svg>
//             </div>
//           </div>
//         </div>

//         {/* Daily Trip Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">দৈনিক ট্রিপ</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.todayTrips.toFixed(0)}</p>
//             </div>
//             <div className="p-3 bg-yellow-100 rounded-full">
//               <FaTruck className="w-8 h-8 text-yellow-600" />
//             </div>
//           </div>
//         </div>

//         {/* Average Trip Value Card */}
//         <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">গড় ট্রিপের মান</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.avgTripValue.toFixed(0)} TK</p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-full">
//               <FaChartPie className="w-8 h-8 text-blue-600" />
//             </div>
//           </div>
//         </div>

//         {/* Active Vehicles Card */}
//         <div onClick={handleActiveVehicleClick} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-gray-600 text-sm">সক্রিয় গাড়ি</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.activeVehicles}</p>
//             </div>
//             <div className="p-3 bg-green-100 rounded-full">
//               <FaUsers className="w-8 h-8 text-green-600" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Active Vehicles Modal */}
//       {isModalOpen && (
//         <>
//           <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsModalOpen(false)}></div>
//           <div className="fixed inset-0 z-50 flex items-center justify-center">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
//               <button
//                 className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
//                 onClick={() => setIsModalOpen(false)}
//               >
//                 &times;
//               </button>
//               <h2 className="text-xl font-semibold mb-4">সক্রিয় গাড়ি</h2>
//               {activeVehicleList.length > 0 ? (
//                 <ul className="list-disc list-inside text-gray-800 space-y-1 max-h-60 overflow-y-auto">
//                   {activeVehicleList.map((vehicle, idx) => (
//                     <li key={idx}>{vehicle}</li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-gray-500">No active vehicles found</p>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StatisticsCard;


import axios from "axios";
import { useEffect, useState } from "react";
import { FaTruck, FaChartPie, FaUsers } from "react-icons/fa";
import dayjs from "dayjs";
import api from "../utils/axiosConfig";

const StatisticsCard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalTrips: 0,
    todayTrips: 0,
    todaySales: 0,
    avgTripValue: 0,
    totalDistance: 0,
    activeVehicles: 0,
    topRoute: "",
    peakHour: "",
  });

  const today = dayjs().format("YYYY-MM-DD");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 🟢 Fetch trip data
        const tripResponse = await api.get(
          `/trip`
        );
        const trips = tripResponse.data || [];

        // Filter today's trips
        const todayTrips = trips.filter(
          (trip) =>
            dayjs(trip.created_at || trip.date).format("YYYY-MM-DD") === today
        );

        // Total sales
        const totalSales = trips.reduce((sum, trip) => {
          const amount = parseFloat(
            trip.amount || trip.fare || trip.total_rent || trip.trip_rent || 0
          );
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Today's sales
        const todaySales = todayTrips.reduce((sum, trip) => {
          const amount = parseFloat(
            trip.amount || trip.fare || trip.total_rent || trip.trip_rent || 0
          );
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        // Average trip value
        const avgTripValue = trips.length > 0 ? totalSales / trips.length : 0;

        // Total distance
        const totalDistance = trips.reduce(
          (sum, trip) => sum + Number.parseFloat(trip.distance || 0),
          0
        );

        // Most popular route
        const routeCounts = {};
        trips.forEach((trip) => {
          const route = `${trip.from_location || trip.from || "Unknown"} → ${
            trip.to_location || trip.to || "Unknown"
          }`;
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
        const topRoute =
          Object.keys(routeCounts).length > 0
            ? Object.keys(routeCounts).reduce((a, b) =>
                routeCounts[a] > routeCounts[b] ? a : b
              )
            : "N/A";

        // Peak hour
        const hourCounts = {};
        trips.forEach((trip) => {
          const hour = dayjs(trip.created_at || trip.date).format("HH");
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const peakHour =
          Object.keys(hourCounts).length > 0
            ? Object.keys(hourCounts).reduce((a, b) =>
                hourCounts[a] > hourCounts[b] ? a : b
              )
            : null;

        //  Fetch vehicle data
        const vehicleResponse = await api.get(
          `/vehicle`
        );
        const vehicles = vehicleResponse.data || [];
        const activeVehicleCount = vehicles.filter(
          (v) => v.status?.toLowerCase() === "active"
        ).length;

        //  Update stats
        setStats({
          totalSales,
          totalTrips: trips.length,
          todayTrips: todayTrips.length,
          todaySales,
          avgTripValue,
          totalDistance,
          activeVehicles: activeVehicleCount,
          topRoute,
          peakHour: peakHour ? `${peakHour}:00` : "N/A",
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [today]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="my-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Income Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">দৈনিক আয়</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.todaySales.toLocaleString()} TK
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <text
                  x="5"
                  y="18"
                  fontSize="26"
                  fontWeight="bold"
                  fill="currentColor"
                >
                  ৳
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Daily Trip Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">দৈনিক ইকুইপমেন্ট অপারেশন</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.todayTrips}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaTruck className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Average Trip Value Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">গড় ট্রিপ মান</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgTripValue.toFixed(0)} TK
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaChartPie className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Vehicles Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">সক্রিয় ইকুইপমেন্ট</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeVehicles}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUsers className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;