import React, { useState } from "react";
import {
  FaBars,
  FaCarRear,
  FaChevronDown,
  FaChevronUp,
  FaBriefcase,
  FaUser,
  FaTruck,
  FaNewspaper,
} from "react-icons/fa6";
import { FaUsersCog } from "react-icons/fa";
import { MdShop } from "react-icons/md";
import logo from "../assets/tramessy.png";
import avatar from "../assets/avatar.png";
import { Link, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import { FaUsers } from "react-icons/fa";
import { PiUsersFour } from "react-icons/pi";
import { RiLuggageCartLine } from "react-icons/ri";
import { HiCurrencyBangladeshi } from "react-icons/hi2";

const Sidebar = () => {
  const [openMenu, setOpenMenu] = useState({
    fleet: false,
    business: false,
    user: false,
  });

  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin = useAdmin();

  return (
    <div className="overflow-y-scroll hide-scrollbar">
      <main>
        {/* Logo */}
        <div className="py-[6px] pl-4 border-b border-gray-300">
          <Link to="/tramessy">
            {/* <img src={logo} alt="Logo" className="w-28" /> */}
            <div className="flex items-start justify-start">
  <div className="w-14 h-14 rounded-full border border-primary flex flex-col items-center justify-center shadow-md bg-white">
    <p className="text-xs text-gray-400 -mb-1">L</p>
    <p className="text-xl font-semibold text-primary">LPS</p>
    <p className="text-xs text-gray-400 -mt-1">S</p>
  </div>
</div>
          </Link>
        </div>

        {/* Admin Info */}
        {/* <div className="p-3 border-b border-gray-300">
          <div className="bg-white p-2 rounded-md flex gap-2 items-center">
            <img
              src={avatar}
              alt="Admin Avatar"
              className="w-8 rounded-2xl drop-shadow"
            />
            <h3 className="text-primary font-semibold">Admin</h3>
          </div>
        </div> */}

        {/* Navigation */}
        <div className="mt-3 px-2">
          <ul className="space-y-3 list-none text-sm">
            {/* Dashboard */}
            <li
              className={` py-3 px-2 rounded-sm cursor-pointer ${
                isActive("/tramessy")
                  ? "bg-primary text-white"
                  : "text-white bg-primary"
              }`}
            >
              <Link
                to="/tramessy"
                className="flex items-center gap-2 font-semibold"
              >
                <FaBars />
                <span className="ps-2">Dashboard</span>
              </Link>
            </li>

            {isAdmin ? (
              <>
                {/* Fleet Management */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("fleet")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaCarRear />
                      <span>Fleet Management</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.fleet ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.fleet ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="px-2 text-sm mt-2 list-none">
                      <li>
                        <Link
                          to="/tramessy/vehicel"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/vehicel")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Vehicles </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/TripList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/TripList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                        
                          <span>Trips</span>
                        </Link>
                      </li>
                      {/* <li>
                              <Link
                                to="/tramessy/DriverList"
                                className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                  isActive("/tramessy/DriverList")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                              
                                <span>Driver </span>
                              </Link>
                            </li> */}
                      {/* <li>
                        <Link
                          to="/tramessy/Fuel"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Fuel")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Fuel</span>
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          to="/tramessy/Parts"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Parts")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Spare & Parts List</span>
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to="/tramessy/Maintenance"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Maintenance")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Maintenance</span>
                        </Link>
                      </li> */}
                    </ul>
                  </div>
                </li>
                {/* Vendor management */}
                <li className="text-primary font-medium rounded-sm list-none">
                  <div
                    onClick={() => toggleMenu("vendor")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaUsers />
                      <span>Vendor Management</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.vendor ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.vendor ? "max-h-[100px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2 list-none">
                      <li>
                        <Link
                          to="/tramessy/VendorList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/VendorList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>All Vendor </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Rent management */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("rentVehicle")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaTruck />
                      <span>Rent Vehicle</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.rentVehicle ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.rentVehicle ? "max-h-[100px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2 list-none">
                      <li>
                        <Link
                          to="/tramessy/RentList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/RentList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Rent Vehicle </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* HR management */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("hrManagement")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900"
                  >
                    <span className="flex items-center gap-2">
                      <FaUsersCog />
                      <span>HR</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.hrManagement ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-900 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[700px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                        <div
                          onClick={() => toggleMenu("hrm")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                           
                            <span>HRM</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.hrm ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div>
                        <div
                          className={`transition-all duration-900 overflow-hidden ${
                            openMenu.hrm ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <ul className="pl-6 space-y-2 mt-1">
                            <li>
                              <Link
                                to="/tramessy/HR/HRM/employee-list"
                                className={`flex gap-2 items-center block p-2 rounded-sm ${
                                  isActive("/tramessy/HR/HRM/employee-list")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                
                                Employee 
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/tramessy/HR/HRM/DriverList"
                                className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                  isActive("/tramessy/DriverList")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                               
                                <span>Driver</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/tramessy/HR/HRM/Office"
                                className={`flex gap-2 items-center p-2 rounded-sm ${
                                  isActive("/tramessy/HR/HRM/Office")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                               
                                Office
                              </Link>
                            </li>
                            <li>
                        <Link
                          to="/tramessy/HR/HRM/daily-expense"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/daily-expense")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Salary Expense</span>
                        </Link>
                      </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* <div
                    className={`transition-all duration-300 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                        <div
                          onClick={() => toggleMenu("attendance")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                           
                            <span>Attendance</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.attendance ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div>
                        <div
                          className={`transition-all duration-900 overflow-hidden px-1 ${
                            openMenu.attendance ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <ul className="pl-6 space-y-2 mt-1">
                            <li>
                              <Link
                                to="/tramessy/HR/Attendance/AttendanceList"
                                className={`block p-2 rounded-sm ${
                                  isActive(
                                    "/tramessy/HR/Attendance/AttendanceList"
                                  )
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                <span className="flex gap-2 items-center">
                                  
                                  <span>Attendance</span>
                                </span>
                              </Link>
                            </li>

                            <li>
                              <Link
                                to="/tramessy/HR/attendance/attendance-report"
                                className={`block p-2 rounded-sm ${
                                  isActive("/HRM/attendance/attendance-report")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                Attendance Report
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div> */}
                
                  <div
                    className={`transition-all duration-300 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                        
                        <div
                          onClick={() => toggleMenu("leave")}
                          className="p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          {/* <li>
                            <Link
                              to="/tramessy/HR/HRM/Leave"
                              className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                isActive("/tramessy/HR/HRM/Leave")
                                  ? "text-white bg-primary"
                                  : "text-gray-500 hover:text-primary"
                              }`}
                            >
                              
                              <span>Leave Request</span>
                            </Link>
                          </li> */}
                          {/* <li>
                            <Link
                              to="/tramessy/HR/HRM/MonthAttendance"
                              className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                isActive("/tramessy/HR/HRM/MonthAttendance")
                                  ? "text-white bg-primary"
                                  : "text-gray-500 hover:text-primary"
                              }`}
                            >
                              
                              <span>Month Attendance</span>
                            </Link>
                          </li> */}
                        </div>
                      </li>
                    </ul>
                  </div>
                
                  {/* <div
                    className={`transition-all duration-300 overflow-hidden px-1 ${
                      openMenu.hrManagement ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-2 px-2 text-sm mt-2">
                      <li>
                    
                        <div
                          onClick={() => toggleMenu("payroll")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                            
                            <span>Payroll</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.payroll ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div>
                      
                        <div
                          className={`transition-all duration-900 overflow-hidden ${
                            openMenu.payroll ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <ul className="pl-6 space-y-2 mt-1">
                            <li>
                              <Link
                                to="/tramessy/HRM/Payroll/Advance-Salary"
                                className={`flex items-center gap-2 p-2 rounded-sm ${
                                  isActive(
                                    "/tramessy/HRM/Payroll/Advance-Salary"
                                  )
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                               
                                Salary Advance
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/tramessy/HRM/attendance-report"
                                className={`block p-2 rounded-sm ${
                                  isActive("/HRM/attendance-report")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                Manage Employee salary
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/tramessy/HRM/payroll/generate-salary"
                                className={`block p-2 rounded-sm ${
                                  isActive(
                                    "/tramessy/HRM/payroll/generate-salary"
                                  )
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                Generate Salary
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </li>
                    </ul>
                  </div> */}
                </li>

                {/* Inventory management */}
                {/* <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("inventory")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900"
                  >
                    <span className="flex items-center gap-2">
                      <MdShop />
                      <span>Inventory</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.inventory ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.inventory ? "max-h-[200px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/Inventory/Stockin"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/Stockin")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Stock in</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Inventory/StockOut"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/StockOut")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Stock Out</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Inventory/Inventory-supplier"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Inventory/Inventory-supplier")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Inventory Supplier</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li> */}
                {/* Purchase */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("purchase")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900 outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <RiLuggageCartLine />
                      <span>Purchase</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.purchase ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.purchase ? "max-h-[100px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/Purchase/PurchaseList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Purchase/PurchaseList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Purchase </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Purchase/SupplierList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Purchase/SupplierList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Supplier </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Customer */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("customer")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      toggleMenu("customer")
                    }
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300 outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <PiUsersFour />
                      <span>Customer</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-500 ${
                        openMenu.customer ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-700 ease-in-out overflow-hidden ${
                      openMenu.customer ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/Customer"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Customer")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Customer</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Business */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("business")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      toggleMenu("business")
                    }
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300 outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <FaBriefcase />
                      <span>Business Model</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-500 ${
                        openMenu.business ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-700 ease-in-out overflow-hidden ${
                      openMenu.business ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/DailyIncome"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/DailyIncome")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                         
                          <span>Daily Income</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/daily-trip-expense"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/daily-trip-expense")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Daily Trip Expense</span>
                        </Link>
                      </li>
                      
                      <li>
                        <Link
                          to="/tramessy/monthly-statement"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/monthly-statement")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Monthly Statement</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Reports */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMenu("reports")}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      toggleMenu("reports")
                    }
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300 outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <FaNewspaper />
                      <span>Reports</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-500 ${
                        openMenu.reports ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>

                  {/* Dropdown container with smooth expand/collapse */}
                  <div
                    className={`transition-all duration-700 ease-in-out overflow-hidden ${
                      openMenu.reports ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <ul className="mt-2 space-y-3 px-2 text-sm">
                      {/* <li>
                        <Link
                          to="/tramessy/Reports/Employee-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Employee-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full ${
                              isActive("/tramessy/Reports/Employee-Report")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Employee Report</span>
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          to="/tramessy/Reports/Driver-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Driver-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Driver Report</span>
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to="/tramessy/Reports/Fuel-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Fuel-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Fuel Report</span>
                        </Link>
                      </li> */}
                      {/* <li>
                        <Link
                          to="/tramessy/Reports/Purchase-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Purchase-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full ${
                              isActive("/tramessy/Reports/Purchase-Report")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Purchase Report</span>
                        </Link>
                      </li> */}
                      {/* <li>
                        <Link
                          to="/tramessy/Reports/Inventory-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Inventory-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full ${
                              isActive("/tramessy/Reports/Inventory-Report")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Inventory Report</span>
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          to="/tramessy/Reports/Trip-Report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/Trip-Report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Trip Report</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/Reports/vehicle-report"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/Reports/vehicle-report")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                      
                          <span>Vehicle Report</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Accounts */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("accounts")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaBriefcase />
                      <span>Accounts</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.accounts ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.accounts ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    {" "}
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      {/* <li>
                        <Link
                          to="/tramessy/account/CashDispatch"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/CashDispatch")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/account/CashDispatch")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Fund Transfer</span>
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          to="/tramessy/account/official-expense"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/official-expense")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          
                          <span>Official Expense</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/PaymentList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/PaymentList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                      
                          <span>Payment </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/PaymentReceive"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/PaymentReceive")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <span>Payment Receive</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/VendorPayment"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/VendorPayment")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <span>Vendor Payment </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/SupplierLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/SupplierLedger")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                         
                          <span>Supplier Ledger</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/DriverLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/DriverLedger")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          {/* <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/account/DriverLedger")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div> */}
                          <span>Driver Ledger</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/CustomerLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/CustomerLedger")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <span>Customer Ledger</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/vendor-ledger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/vendor-ledger")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <span>Vendor Ledger</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/account/OfficeLedger"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/account/OfficeLedger")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                        
                          <span>Office Ledger</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* Billing Control */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("billing")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <HiCurrencyBangladeshi className="text-xl" />
                      <span>Billing</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.billing ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.billing ? "max-h-[300px]" : "max-h-0"
                    }`}
                  >
                    {/* <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/billing/Yamaha"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing/Yamaha")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/billing/Yamaha")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Yamaha</span>
                        </Link>
                      </li>
                      <li>
                        
                        <div
                          onClick={() => toggleMenu("hatimMenu")}
                          className="flex justify-between items-center p-2 cursor-pointer hover:text-primary rounded-sm"
                        >
                          <span className="flex gap-2 items-center">
                            <div
                              className={`w-[6px] h-[6px] rounded-full bg-primary ${
                                isActive("/hatimMenu")
                                  ? "bg-white"
                                  : "bg-primary"
                              }`}
                            ></div>
                            <span>Hatim</span>
                          </span>
                          <span
                            className={`transform transition-transform duration-900 ${
                              openMenu.hatimMenu ? "rotate-180" : ""
                            }`}
                          >
                            <FaChevronDown />
                          </span>
                        </div>
                       
                        <div
                          className={`transition-all duration-900 overflow-hidden ${
                            openMenu.hatimMenu ? "max-h-[500px]" : "max-h-0"
                          }`}
                        >
                          <ul className="pl-6 space-y-2 mt-1">
                            <li>
                              <Link
                                to="/tramessy/billing/Hatim"
                                className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                  isActive("/tramessy/billing/Hatim")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                <div
                                  className={`w-[6px] h-[6px] rounded-full bg-primary ${
                                    isActive("/tramessy/billing/Hatim")
                                      ? "bg-white"
                                      : "bg-primary"
                                  }`}
                                ></div>
                                <span>Hatim Rupgonj</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/tramessy/billing/HatimPubail"
                                className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                                  isActive("/tramessy/billing/HatimPubail")
                                    ? "text-white bg-primary"
                                    : "text-gray-500 hover:text-primary"
                                }`}
                              >
                                <div
                                  className={`w-[6px] h-[6px] rounded-full bg-primary ${
                                    isActive("/tramessy/billing/HatimPubail")
                                      ? "bg-white"
                                      : "bg-primary"
                                  }`}
                                ></div>
                                <span>Hatim Pubail</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/billing/Suzuki"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing/Suzuki")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/billing/Suzuki")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Suzuki</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/billing/Sonalika"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing/Sonalika")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/billing/Sonalika")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Sonalika</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/billing/Honda"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing/Honda")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/billing/Honda")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Honda</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/tramessy/billing/Meghdona"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing/Meghdona")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/tramessy/billing/Meghdona")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>Meghdona</span>
                        </Link>
                      </li>
                    </ul> */}
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/billing"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/billing")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                         
                          <span>Bill</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                {/* User Control */}
                <li className="text-primary font-medium rounded-sm mb-10">
                  <div
                    onClick={() => toggleMenu("user")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaUser />
                      <span>Users Control</span>
                    </span>
                    <span
                      className={`transform transition-transform duration-900 ${
                        openMenu.user ? "rotate-180" : ""
                      }`}
                    >
                      <FaChevronDown />
                    </span>
                  </div>
                  <div
                    className={`transition-all duration-900 ease-in-out overflow-hidden ${
                      openMenu.user ? "max-h-[100px]" : "max-h-0"
                    }`}
                  >
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/tramessy/AllUsers"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/tramessy/AllUsers")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                       
                          <span>All Users</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
              </>
            ) : (
              <>
                {/* private route */}
                {/* Fleet Management */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("fleet")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-900"
                  >
                    <span className="flex items-center gap-2">
                      <FaCarRear />
                      <span>ফ্লীট ম্যানেজমেন্ট</span>
                    </span>
                    {openMenu.fleet ? <FaChevronUp /> : <FaChevronDown />}
                  </div>

                  {openMenu.fleet && (
                    <ul className="space-y-0 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/CarList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/CarList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/CarList") ? "bg-white" : "bg-primary"
                            }`}
                          ></div>
                          <span>গাড়ি তালিকা</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/DriverList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/DriverList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/DriverList")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>ড্রাইভার তালিকা</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/TripList"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/TripList")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/TripList") ? "bg-white" : "bg-primary"
                            }`}
                          ></div>
                          <span>ট্রিপ হিসাব</span>
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to="/Fuel"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/Fuel")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/Fuel") ? "bg-white" : "bg-primary"
                            }`}
                          ></div>
                          <span>ফুয়েল হিসাব</span>
                        </Link>
                      </li> */}
                      <li>
                        <Link
                          to="/Parts"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/Parts")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/Parts") ? "bg-white" : "bg-primary"
                            }`}
                          ></div>
                          <span>পার্টস এন্ড স্পায়ারস</span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/Maintenance"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/Maintenance")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/Maintenance")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>মেইনটেনেন্স</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>

                {/* Business Reports */}
                <li className="text-primary font-medium rounded-sm">
                  <div
                    onClick={() => toggleMenu("business")}
                    className="flex justify-between items-center py-3 px-2 cursor-pointer hover:bg-primary hover:text-white hover:rounded-sm duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <FaBriefcase />
                      <span>বিজনেসের বিবরণ</span>
                    </span>
                    {openMenu.business ? <FaChevronUp /> : <FaChevronDown />}
                  </div>

                  {openMenu.business && (
                    <ul className="space-y-3 px-2 text-sm mt-2">
                      <li>
                        <Link
                          to="/DailyExpense"
                          className={`flex gap-2 items-center p-2 rounded-sm font-medium ${
                            isActive("/DailyExpense")
                              ? "text-white bg-primary"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          <div
                            className={`w-[6px] h-[6px] rounded-full bg-primary ${
                              isActive("/DailyExpense")
                                ? "bg-white"
                                : "bg-primary"
                            }`}
                          ></div>
                          <span>দৈনিক ব্যয়</span>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
