import React from "react";
import OverViewCard from "../components/OverViewCard";
import StatisticsCard from "../components/StatisticsCard";
import DailyCardOverview from "../components/DailyCardOverview";
import MonthlyCustomerPieChart from "../components/PieChart";
import SalesChart from "../components/SalesChart";
import PartsReminder from "../components/PartsReminder";

const Home = () => {
  return (
    <div className="p-4 md:p-0">
      {/* <DailyCardOverview/> */}
      <StatisticsCard />
      <PartsReminder/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OverViewCard />
      <MonthlyCustomerPieChart/>
      </div>
      <SalesChart/>
    </div>
  );
};

export default Home;
