import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import axios from "axios";
import dayjs from "dayjs";

const SalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentMonth = dayjs().format("YYYY-MM");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/trip/list`
        );
        const trips = res.data.data;
        const tripsThisMonth = trips.filter((trip) =>
          trip.date.startsWith(currentMonth)
        );
        const grouped = tripsThisMonth.reduce((acc, trip) => {
          const customer = trip.customer || "Unknown";
          const rent = parseFloat(trip.total_rent) || 0;
          if (!acc[customer]) {
            acc[customer] = { name: customer, total_rent: 0 };
          }
          acc[customer].total_rent += rent;
          return acc;
        }, {});
        const formatted = Object.values(grouped).map((entry) => ({
          name: entry.name,
          "Monthly Sales": entry.total_rent,
        }));
        setChartData(formatted);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentMonth]);

  if (loading) return <p>Loading chart...</p>;
  if (chartData.length === 0) return <p></p>;

  return (
    <div className="bg-white rounded-xl mt-5 pt-5 border border-gray-200 shadow-md">
      <h3 className="text-lg font-bold text-primary border-b border-gray-200 md:mx-5 pb-2">
        Monthly Sales Chart By Customer
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 50, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" scale="band" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Monthly Sales" barSize={30} fill="#413ea0">
            <LabelList
              dataKey="Monthly Sales"
              position="top"
              content={(props) => {
                const { x, y, value, index } = props;
                const customerName = chartData[index]?.name || "";
                return (
                  <text
                    x={x}
                    y={y - 25}
                    fill="#000"
                    fontSize={12}
                    textAnchor="middle"
                  >
                    <tspan x={x} dy="0">
                      {customerName}
                    </tspan>
                    <tspan
                      x={x}
                      dy="1.2em"
                    >{`${value.toLocaleString()} TK`}</tspan>
                  </text>
                );
              }}
            />
          </Bar>
          <Line type="monotone" dataKey="Monthly Sales" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;