
import { useEffect, useState } from "react"
import { BsTools } from "react-icons/bs"
import dayjs from "dayjs"
import api from "../utils/axiosConfig"
import { toNumber } from "../hooks/toNumber"

const PartsReminder = () => {
  // parts & spearce
  const [expiredParts, setExpiredParts] = useState([])
  const [warningParts, setWarningParts] = useState([])
  const [loadingPartsReminder, setLoadingPartsReminder] = useState(true)
  const totalCount = expiredParts.length + warningParts.length
 
  // purchase
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
  const [tripExpense, setTripExpense] = useState(0);
  const [purchaseExpense, setPurchaseExpense] = useState(0);
  const [officeExpense, setOfficeExpense] = useState(0);
  const [salaryExpense, setSalaryExpense] = useState(0);
  // const [dailySales, setDailySales] = useState({}); // Not used, can be removed if not needed
  const today = dayjs().format("YYYY-MM-DD")
  // const [todayTripCount, setTodayTripCount] = useState(0); // Not used, can be removed if not needed



  // expense clear
  useEffect(() => {
    fetchTripData();
    fetchPurchaseData();
    fetchOfficeAndSalaryExpense();
  }, [today]);

   // trip expense
  const fetchTripData = async () => {
    try {
      const res = await api.get("/trip")
      const total = res.data
        .filter((item) => {
        // API থেকে আসা date কে YYYY-MM-DD এ convert
        const tripDate = dayjs(item.date).format("YYYY-MM-DD");
        return tripDate === today;
      })
        .reduce((sum, item) => {
          return sum + toNumber(item.total_exp)
        }, 0)
      setTripExpense(total)
    } catch (error) {
      console.error("Trip fetch error:", error)
    }
  }
// daily purchase expense
  const fetchPurchaseData = async () => {
    try {
      const res = await api.get("/purchase")
      const total = res.data.data
        .filter((p) => p.date === today)
        .reduce((sum, p) => {
          const purchaseAmount = toNumber(p.purchase_amount)
          return sum + purchaseAmount
        }, 0)
      setPurchaseExpense(total)
    } catch (error) {
      console.error("Purchase fetch error:", error)
    }
  }
// office and salary expense
  const fetchOfficeAndSalaryExpense = async () => {
    try {
      const res = await api.get("/expense")
      let office = 0
      let salary = 0
      res.data.forEach((item) => {
        if (item.date === today) {
          if (item.payment_category === "Utility") {
            office += toNumber(item.amount)
          }
          if (item.payment_category === "Salary") {
            salary += toNumber(item.amount)
          }
        }
      })
      setOfficeExpense(office)
      setSalaryExpense(salary)
    } catch (error) {
      console.error("Expense fetch error:", error)
    }
  }

  const totalExpense = tripExpense + purchaseExpense + officeExpense + salaryExpense;

  // daily cash dispatch
  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        const response = await api.get(
          `/fundTransfer`
        );
        const data = response.data?.data || [];
        const total = data
          .filter((item) => dayjs(item.date).format("YYYY-MM-DD") === today)
          .reduce((sum, item) => sum + toNumber(item.amount || 0), 0);

        setTotalDispatch(total);
      } catch (error) {
        console.error("Failed to fetch dispatch data:", error);
      }
    };
    fetchDispatch();
  }, [today]);

  return (
    <div className="my-5 grid grid-cols-2 gap-5">
      <div className="border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-300 ">
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
       <div className=" bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 border-b border-gray-200 pb-1 mb-3">
            📋 দৈনিক খরচ সংক্ষেপ
          </h3>

          {/* Header */}
          <div className="grid grid-cols-2 text-sm font-semibold text-gray-700 bg-gray-100 py-1.5 px-3 rounded-md">
            <div>খরচের ধরন</div>
            <div className="text-right">পরিমাণ</div>
          </div>

          {/* Row */}
          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>অপারেশন খরচ</div>
            <div className="text-right">{tripExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>ক্রয় খরচ</div>
            <div className="text-right">{purchaseExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>অফিস খরচ</div>
            <div className="text-right">{officeExpense}</div>
          </div>

          <div className="grid grid-cols-2 text-sm py-1.5 px-3 border-b border-gray-200">
            <div>বেতন খরচ</div>
            <div className="text-right">{salaryExpense}</div>
          </div>

          {/* Total */}
          <div className="grid grid-cols-2 text-sm font-bold py-2 px-3 mt-1">
            <div>মোট খরচ</div>
            <div className="text-right">{totalExpense}</div>
          </div>
        </div>
    </div>
  )
}

export default PartsReminder
