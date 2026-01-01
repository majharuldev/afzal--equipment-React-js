import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { HiOutlineBellAlert } from "react-icons/hi2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from "../utils/axiosConfig";

const OverViewCard = () => {
  const [expiringDocs, setExpiringDocs] = useState([]);
  const [loading, setLoading] = useState(true); // add loading state

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get(
          `/vehicle`
        );
        const vehicles = response.data || [];
        const today = dayjs();
        const expiring = [];

        vehicles.forEach((vehicle) => {
          ["fitness_date", "route_per_date", "reg_date", "tax_date", "insurance_date"].forEach(
            (type) => {
              const rawDate = vehicle[type];
              if (rawDate) {
                const date = dayjs(rawDate);
                const remaining = date.diff(today, "day");

                if (date.isValid() && remaining <= 30 && remaining >= -10) {
                  expiring.push({
                    vehicle: `${vehicle.reg_zone}-${vehicle.reg_serial}-${vehicle.reg_no}`,
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
          ডকুমেন্ট রিমাইন্ডার
        </h3>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-[200px] text-primary">
            <AiOutlineLoading3Quarters className="animate-spin text-5xl mb-3" />
            <p className="text-sm">Checking for expiring documents...</p>
          </div>
        ) : expiringDocs.length > 0 ? (
          <div className="overflow-x-auto max-h-60 overflow-y-auto hide-scrollbar">
            <table className="min-w-full text-xs text-left border border-gray-200">
              <thead className="bg-gray-100 text-primary">
                <tr>
                  <th className="p-1">ক্রমিক</th>
                  <th className="p-2">ইকুইপমেন্ট নং</th>
                  <th className="p-2">ডকুমেন্ট</th>
                  <th className="p-2">অবশিষ্ট</th>
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
      item.remaining < 0 ? "bg-red-500" : "bg-yellow-500"
    }`}
  >
    {item.remaining < 0
      ? `${Math.abs(item.remaining)} ${Math.abs(item.remaining) === 1 ? "দিন" : "দিন"} মেয়াদ শেষ`
      : `${item.remaining} ${item.remaining === 1 ? "দিন" : "দিন"} বাকি`}
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
