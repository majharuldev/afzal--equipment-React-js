import React from "react";
import OverViewCard from "../components/OverViewCard";
import StatisticsCard from "../components/StatisticsCard";

import PartsReminder from "../components/PartsReminder";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import useProfitLoseData from "../hooks/profitLoseHooks";

const Home = () => {
  const { data:monthlyData, loading: monthlyLoading } = useProfitLoseData("month");
  const { data:yearlyData, loading: yearlyLoading } = useProfitLoseData("year");

  if (monthlyLoading || yearlyLoading) {
    return <div className="bg-white p-4 rounded-lg shadow">চার্ট লোড হচ্ছে...</div>;
  }

  return (
    <div className="p-4 md:p-0">
      {/* <DailyCardOverview/> */}
      <StatisticsCard />
      <PartsReminder />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OverViewCard />
        <div>
          {/* Present Month Graph */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4">
              চলতি মাসের লাভ বনাম খরচ
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  barCategoryGap="30%" // gap between categories
                  barGap={5} // gap between bars
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'মাস', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'টাকা', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === "totalExpense" ? "মোট খরচ" : "নিট লাভ"
                    ]}
                  />
                  <Legend formatter={(value) => value === "totalExpense" ? "মোট খরচ" : "নিট লাভ"}/>
                  <Bar dataKey="totalExpense" fill="#ed4553" name="মোট খরচ" />
                  <Bar dataKey="netProfit" fill="#239230" name="নিট লাভ" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div>
        {/* Present Year Graph */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
           চলতি বছরের লাভ বনাম খরচ
          </h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                barCategoryGap="30%"
                barGap={5}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'মাস', position: 'insideBottom', offset: -5 }}/>
                <YAxis label={{ value: 'টাকা', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                 formatter={(value, name) => [
                    value,
                    name === "totalExpense" ? "মোট খরচ" : "নিট লাভ"
                  ]}/>
                <Legend formatter={(value) => value === "totalExpense" ? "মোট খরচ" : "নিট লাভ"}/>
                <Bar dataKey="totalExpense" fill="#ed4553" name="মোট খরচ" />
                <Bar dataKey="netProfit" fill="#239230" name="নিট লাভ" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
