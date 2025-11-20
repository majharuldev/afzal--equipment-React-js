
import { useEffect, useState } from "react"
import { BsTools } from "react-icons/bs"
import dayjs from "dayjs"
import axios from "axios" // Ensure axios is imported
import api from "../utils/axiosConfig"

const PartsReminder = () => {
  // parts & spearce
  const [expiredParts, setExpiredParts] = useState([])
  const [warningParts, setWarningParts] = useState([])
  const [loadingPartsReminder, setLoadingPartsReminder] = useState(true)
  const totalCount = expiredParts.length + warningParts.length

 
  useEffect(() => {
    const fetchMaintenanceAlerts = async () => {
      try {
        const res = await api.get(`/purchase`)
        const data = res.data?.data || []

        const today = dayjs()
        const sevenDaysLater = today.add(7, "day")

        const expired = []
        const warnings = []

        data.forEach((item) => {
          const name = item.category || "Unknown Item"

          // --- DATE ALERT ---
          if (item.next_service_date) {
            const nextDate = dayjs(item.next_service_date)

            if (nextDate.isBefore(today, "day")) {
              expired.push({
                id: item.id,
                name,
                expireDate: nextDate.format("DD-MM-YYYY"),
              })
            } else if (nextDate.isAfter(today) && nextDate.isBefore(sevenDaysLater)) {
              warnings.push({
                id: item.id,
                name,
                expireDate: nextDate.format("DD-MM-YYYY"),
              })
            }
          }

          // --- KM ALERT ---
          if (item.next_km && item.last_km) {
            const diff = item.next_km - item.last_km

            if (diff <= 0) {
              expired.push({
                id: item.id,
                name,
                expireKm: item.next_km,
              })
            } else if (diff <= 200) {
              warnings.push({
                id: item.id,
                name,
                expireKm: item.next_km,
              })
            }
          }
        })

        setExpiredParts(expired)
        setWarningParts(warnings)
      } catch (e) {
        console.log("Error fetching maintenance alerts:", e)
      } finally {
        setLoadingPartsReminder(false)
      }
    }

    fetchMaintenanceAlerts()
  }, [])

  // expense
  const [otherExpense, setOtherExpense] = useState(0)
  const [tripCost, setTripCost] = useState(0)
  const [totalTodayExpense, setTotalTodayExpense] = useState(0)
  // const [dailySales, setDailySales] = useState({}); // Not used, can be removed if not needed
  const today = dayjs().format("YYYY-MM-DD")
  // const [todayTripCount, setTodayTripCount] = useState(0); // Not used, can be removed if not needed

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      try {
        const tripRes = await api.get(`/trip`)
        const trips = tripRes.data || []

        // console.log("Current 'today' date:", today)
        const todayTrips = trips.filter((item) => item.date === today)
        // console.log("Trips for today:", todayTrips) 

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
        ]
        let tripTotal = 0
        todayTrips.forEach((trip) => {
          tripFields.forEach((field) => {
            const val = Number.parseFloat(trip[field])
            if (!isNaN(val)) {
              tripTotal += val
            }
          })
        })

        // console.log("Calculated tripTotal:", tripTotal)

        setTripCost(tripTotal)
        setOtherExpense(0) // optional: can keep for UI consistency
        setTotalTodayExpense(tripTotal)
      } catch (err) {
        console.error("Error fetching trip expenses:", err)
      }
    }
    fetchTodayExpenses()
  }, [today])

  return (
    <div className="my-5 grid grid-cols-2 gap-5">
      {/* <div className="border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-300 h-[150px]">
     
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-2">
            <BsTools className="text-red-600" />
            <span>মেইনটেনেন্স এলার্ট</span>
          </div>
          {totalCount > 0 && <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalCount}</div>}
        </div>
      
        <div className="px-3 py-2 overflow-y-auto max-h-[100px] text-xs text-gray-700">
          {loadingPartsReminder ? (
            <div className="flex justify-center items-center h-full text-gray-500 text-sm">
              <div className="loader border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full w-5 h-5 animate-spin mr-2" />
              লোড হচ্ছে...
            </div>
          ) : totalCount > 0 ? (
            <ul className="divide-y divide-gray-100">
              {[...warningParts, ...expiredParts].map((item, index) => (
                <li key={index} className="py-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-white text-xs ${
                        item.daysAgo ? "bg-red-500" : "bg-yellow-500"
                      }`}
                    >
                      {item.daysAgo ? `${item.daysAgo} days ago expired` : "Expires soon"}
                    </span>
                  </div>
                  <p className={`text-xs  ${
                        item.daysAgo ? "text-red-500" : "text-yellow-600"
                      }`}>Valid: {item.expireDate}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400">
              <BsTools className="text-xl mb-1" />
              <p className="text-xs">No alerts available</p>
            </div>
          )}
        </div>
      </div> */}
      <div className="border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-300 h-[150px]">
        <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-2">
            <BsTools className="text-red-600" />
            <span>মেইনটেনেন্স এলার্ট</span>
          </div>
          {totalCount > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{totalCount}</div>
          )}
        </div>

        <div className="px-3 py-2 overflow-y-auto max-h-[100px] text-xs text-gray-700">
          {loadingPartsReminder ? (
            <div className="flex justify-center items-center h-full text-gray-500 text-sm">
              <div className="loader border-2 border-t-2 border-gray-200 border-t-blue-500 rounded-full w-5 h-5 animate-spin mr-2" />
              লোড হচ্ছে...
            </div>
          ) : totalCount > 0 ? (
            <ul className="divide-y divide-gray-100">
              {[...warningParts, ...expiredParts].map((item, index) => (
                <li key={index} className="py-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-white text-xs ${
                        expiredParts.includes(item) ? "bg-red-500" : "bg-yellow-500"
                      }`}
                    >
                      {item.expireDate
                        ? expiredParts.includes(item)
                          ? "Expired"
                          : "Expiring soon"
                        : item.expireKm
                        ? expiredParts.includes(item)
                          ? "KM Exceeded"
                          : "KM Warning"
                        : ""}
                    </span>
                  </div>

                  {item.expireDate && (
                    <p className="text-xs text-gray-600">Date: {item.expireDate}</p>
                  )}
                  {item.expireKm && (
                    <p className="text-xs text-gray-600">KM: {item.expireKm}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-gray-400">
              <BsTools className="text-xl mb-1" />
              <p className="text-xs">No alerts available</p>
            </div>
          )}
        </div>
      </div>
      {/* Daily Expense */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-100">দৈনিক খরচ</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">ট্রিপের খরচ</span>
            <span className="text-sm font-semibold text-gray-900">-</span>
            <span className="text-sm font-medium text-black">{tripCost} TK</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">অন্যান্য খরচ</span>
            <span className="text-sm font-semibold text-gray-900">-</span>
            <span className="text-sm font-medium text-black">{otherExpense} TK</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">মোট ব্যয়</span>
            <span className="text-sm font-semibold text-gray-900">-</span>
            <span className="text-sm font-medium text-black">{totalTodayExpense} TK</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartsReminder
