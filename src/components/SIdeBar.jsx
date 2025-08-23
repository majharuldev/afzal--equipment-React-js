

// import React, { useState } from "react";
// import {
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   DashboardOutlined,
//   CarOutlined,
//   UserOutlined,
//   TeamOutlined,
//   ShoppingCartOutlined,
//   FileTextOutlined,
//   ToolOutlined,
//   DollarOutlined,
//   ShopOutlined,
//   SolutionOutlined,
//   ContainerOutlined,
//   FileDoneOutlined,
//   SettingOutlined
// } from "@ant-design/icons";
// import { Layout, Menu, Avatar, Typography, theme } from "antd";
// import { Link, useLocation } from "react-router-dom";
// import useAdmin from "../hooks/useAdmin";
// import logo from "../assets/tramessy.png";
// import avatar from "../assets/avatar.png";

// const { Sider } = Layout;
// const { Text } = Typography;

// const Sidebar = ({ collapsed, onCollapse }) => {
//   const location = useLocation();
//   const isAdmin = useAdmin();
//   const [openKeys, setOpenKeys] = useState([]);
//   const {
//     token: { colorBgContainer },
//   } = theme.useToken();

//   const onOpenChange = (keys) => {
//     const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
//     setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
//   };

//   const isActive = (path) => location.pathname === path;

//   // Menu items configuration
  // const menuItems = [
  //   {
  //     key: "dashboard",
  //     icon: <DashboardOutlined />,
  //     label: <Link to="/tramessy">Dashboard</Link>,
  //     className: isActive("/tramessy") ? "ant-menu-item-selected" : "",
  //   },
  //   ...(isAdmin
  //     ? [
  //         // Fleet Management
  //         {
  //           key: "fleet",
  //           icon: <CarOutlined />,
  //           label: "Fleet Management",
  //           children: [
  //             {
  //               key: "vehicles",
  //               label: <Link to="/tramessy/vehicel">Vehicles</Link>,
  //               className: isActive("/tramessy/vehicel")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "trips",
  //               label: <Link to="/tramessy/TripList">Trips</Link>,
  //               className: isActive("/tramessy/TripList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "parts",
  //               label: <Link to="/tramessy/Parts">Spare & Parts List</Link>,
  //               className: isActive("/tramessy/Parts")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Vendor Management
  //         {
  //           key: "vendor",
  //           icon: <TeamOutlined />,
  //           label: "Vendor Management",
  //           children: [
  //             {
  //               key: "all-vendors",
  //               label: <Link to="/tramessy/VendorList">All Vendor</Link>,
  //               className: isActive("/tramessy/VendorList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Rent Vehicle
  //         {
  //           key: "rent-vehicle",
  //           icon: <ShopOutlined />,
  //           label: "Rent Vehicle",
  //           children: [
  //             {
  //               key: "rent-list",
  //               label: <Link to="/tramessy/RentList">Rent Vehicle</Link>,
  //               className: isActive("/tramessy/RentList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // HR Management
  //         {
  //           key: "hr",
  //           icon: <SolutionOutlined />,
  //           label: "HR",
  //           children: [
  //             {
  //               key: "hrm",
  //               label: "HRM",
  //               children: [
  //                 {
  //                   key: "employee",
  //                   label: (
  //                     <Link to="/tramessy/HR/HRM/employee-list">Employee</Link>
  //                   ),
  //                   className: isActive("/tramessy/HR/HRM/employee-list")
  //                     ? "ant-menu-item-selected"
  //                     : "",
  //                 },
  //                 {
  //                   key: "driver",
  //                   label: <Link to="/tramessy/DriverList">Driver</Link>,
  //                   className: isActive("/tramessy/DriverList")
  //                     ? "ant-menu-item-selected"
  //                     : "",
  //                 },
  //                 {
  //                   key: "office",
  //                   label: <Link to="/tramessy/HR/HRM/Office">Office</Link>,
  //                   className: isActive("/tramessy/HR/HRM/Office")
  //                     ? "ant-menu-item-selected"
  //                     : "",
  //                 },
  //                 {
  //                   key: "salary-expense",
  //                   label: (
  //                     <Link to="/tramessy/HR/HRM/daily-expense">
  //                       Salary Expense
  //                     </Link>
  //                   ),
  //                   className: isActive("/tramessy/daily-expense")
  //                     ? "ant-menu-item-selected"
  //                     : "",
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         // Purchase
  //         {
  //           key: "purchase",
  //           icon: <ShoppingCartOutlined />,
  //           label: "Purchase",
  //           children: [
  //             {
  //               key: "purchase-list",
  //               label: <Link to="/tramessy/Purchase/PurchaseList">Purchase</Link>,
  //               className: isActive("/tramessy/Purchase/PurchaseList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "supplier-list",
  //               label: <Link to="/tramessy/Purchase/SupplierList">Supplier</Link>,
  //               className: isActive("/tramessy/Purchase/SupplierList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Customer
  //         {
  //           key: "customer",
  //           icon: <UserOutlined />,
  //           label: "Customer",
  //           children: [
  //             {
  //               key: "customer-list",
  //               label: <Link to="/tramessy/Customer">Customer</Link>,
  //               className: isActive("/tramessy/Customer")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Business Model
  //         {
  //           key: "business",
  //           icon: <FileTextOutlined />,
  //           label: "Business Model",
  //           children: [
  //             {
  //               key: "daily-income",
  //               label: <Link to="/tramessy/DailyIncome">Daily Income</Link>,
  //               className: isActive("/tramessy/DailyIncome")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "daily-trip-expense",
  //               label: (
  //                 <Link to="/tramessy/daily-trip-expense">
  //                   Daily Trip Expense
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/daily-trip-expense")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "monthly-statement",
  //               label: (
  //                 <Link to="/tramessy/monthly-statement">
  //                   Monthly Statement
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/monthly-statement")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Reports
  //         {
  //           key: "reports",
  //           icon: <FileDoneOutlined />,
  //           label: "Reports",
  //           children: [
  //             {
  //               key: "driver-report",
  //               label: (
  //                 <Link to="/tramessy/Reports/Driver-Report">Driver Report</Link>
  //               ),
  //               className: isActive("/tramessy/Reports/Driver-Report")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "trip-report",
  //               label: (
  //                 <Link to="/tramessy/Reports/Trip-Report">Trip Report</Link>
  //               ),
  //               className: isActive("/tramessy/Reports/Trip-Report")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "vehicle-report",
  //               label: (
  //                 <Link to="/tramessy/Reports/vehicle-report">
  //                   Vehicle Report
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/Reports/vehicle-report")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Accounts
  //         {
  //           key: "accounts",
  //           icon: <DollarOutlined />,
  //           label: "Accounts",
  //           children: [
  //             {
  //               key: "official-expense",
  //               label: (
  //                 <Link to="/tramessy/account/official-expense">
  //                   Official Expense
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/official-expense")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "payment-list",
  //               label: (
  //                 <Link to="/tramessy/account/PaymentList">Payment</Link>
  //               ),
  //               className: isActive("/tramessy/account/PaymentList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "payment-receive",
  //               label: (
  //                 <Link to="/tramessy/account/PaymentReceive">
  //                   Payment Receive
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/PaymentReceive")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "vendor-payment",
  //               label: (
  //                 <Link to="/tramessy/account/VendorPayment">
  //                   Vendor Payment
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/VendorPayment")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "supplier-ledger",
  //               label: (
  //                 <Link to="/tramessy/account/SupplierLedger">
  //                   Supplier Ledger
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/SupplierLedger")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "driver-ledger",
  //               label: (
  //                 <Link to="/tramessy/account/DriverLedger">
  //                   Driver Ledger
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/DriverLedger")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "customer-ledger",
  //               label: (
  //                 <Link to="/tramessy/account/CustomerLedger">
  //                   Customer Ledger
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/CustomerLedger")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "vendor-ledger",
  //               label: (
  //                 <Link to="/tramessy/account/vendor-ledger">
  //                   Vendor Ledger
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/vendor-ledger")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "office-ledger",
  //               label: (
  //                 <Link to="/tramessy/account/OfficeLedger">
  //                   Office Ledger
  //                 </Link>
  //               ),
  //               className: isActive("/tramessy/account/OfficeLedger")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // Billing
  //         {
  //           key: "billing",
  //           icon: <ContainerOutlined />,
  //           label: "Billing",
  //           children: [
  //             {
  //               key: "bill",
  //               label: <Link to="/tramessy/billing">Bill</Link>,
  //               className: isActive("/tramessy/billing")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         // User Control
  //         {
  //           key: "user-control",
  //           icon: <SettingOutlined />,
  //           label: "Users Control",
  //           children: [
  //             {
  //               key: "all-users",
  //               label: <Link to="/tramessy/AllUsers">All Users</Link>,
  //               className: isActive("/tramessy/AllUsers")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //       ]
  //     : [
  //         // Non-admin menu items
  //         {
  //           key: "fleet",
  //           icon: <CarOutlined />,
  //           label: "ফ্লীট ম্যানেজমেন্ট",
  //           children: [
  //             {
  //               key: "car-list",
  //               label: <Link to="/CarList">গাড়ি তালিকা</Link>,
  //               className: isActive("/CarList") ? "ant-menu-item-selected" : "",
  //             },
  //             {
  //               key: "driver-list",
  //               label: <Link to="/DriverList">ড্রাইভার তালিকা</Link>,
  //               className: isActive("/DriverList")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //             {
  //               key: "trip-list",
  //               label: <Link to="/TripList">ট্রিপ হিসাব</Link>,
  //               className: isActive("/TripList") ? "ant-menu-item-selected" : "",
  //             },
  //             {
  //               key: "parts",
  //               label: <Link to="/Parts">পার্টস এন্ড স্পায়ারস</Link>,
  //               className: isActive("/Parts") ? "ant-menu-item-selected" : "",
  //             },
  //             {
  //               key: "maintenance",
  //               label: <Link to="/Maintenance">মেইনটেনেন্স</Link>,
  //               className: isActive("/Maintenance")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //         {
  //           key: "business",
  //           icon: <FileTextOutlined />,
  //           label: "বিজনেসের বিবরণ",
  //           children: [
  //             {
  //               key: "daily-expense",
  //               label: <Link to="/DailyExpense">দৈনিক ব্যয়</Link>,
  //               className: isActive("/DailyExpense")
  //                 ? "ant-menu-item-selected"
  //                 : "",
  //             },
  //           ],
  //         },
  //       ]),
  // ];

//   return (
//     <Sider
//       trigger={null}
//       collapsible
//       collapsed={collapsed}
//       onCollapse={onCollapse}
//       width={250}
//       style={{
//         background: colorBgContainer,
//         overflow: "auto",
//         height: "100vh",
//         position: "fixed",
//         left: 0,
//         top: 0,
//         bottom: 0,
//         borderRight: "1px solid #f0f0f0",
//       }}
//     >
//       {/* Logo Section */}
//       <div className="flex items-center justify-center p-4 border-b border-gray-200">
//         <Link to="/tramessy">
//           <div className="flex items-center">
//             <div className="w-14 h-14 rounded-full border border-primary flex flex-col items-center justify-center shadow-md bg-white">
//               <p className="text-xs text-gray-400 -mb-1">L</p>
//               <p className="text-xl font-semibold text-primary">LPS</p>
//               <p className="text-xs text-gray-400 -mt-1">S</p>
//             </div>
//             {!collapsed && (
//               <Text strong className="ml-2 text-lg">
//                 LPS System
//               </Text>
//             )}
//           </div>
//         </Link>
//       </div>

//       {/* Menu Section */}
//       <Menu
//         mode="inline"
//         defaultSelectedKeys={["dashboard"]}
//         openKeys={openKeys}
//         onOpenChange={onOpenChange}
//         style={{ borderRight: 0 }}
//         items={menuItems}
//       />
//     </Sider>
//   );
// };

// export default Sidebar;


import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  CarOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  ToolOutlined,
  DollarOutlined,
  ShopOutlined,
  SolutionOutlined,
  ContainerOutlined,
  FileDoneOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useState } from "react"
import { Layout, Menu, Avatar } from "antd"

import { Link, useLocation } from "react-router-dom"
import useAdmin from "../hooks/useAdmin"
import avatar from "../assets/avatar.png";

const { Sider } = Layout
const { SubMenu } = Menu

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const isAdmin = useAdmin()
  const [openKeys, setOpenKeys] = useState([]);
  const isActive = (path) => location.pathname === path;

  // Get current selected key from pathname
  // const getSelectedKey = () => {
  //   return location.pathname === "/" ? "dashboard" : location.pathname.replace("/", "")
  // }
const handleOpenChange = (keys) => {
  setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
};

  // Admin menu items
    const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/tramessy">Dashboard</Link>,
      className: isActive("/tramessy") ? "ant-menu-item-selected" : "",
    },
    // ...(isAdmin
    //   ?
       
          // Fleet Management
          {
            key: "fleet",
            icon: <CarOutlined />,
            label: "Fleet Management",
            children: [
              {
                key: "vehicles",
                label: <Link to="/tramessy/vehicel">Vehicles</Link>,
                className: isActive("/tramessy/vehicel")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "trips",
                label: <Link to="/tramessy/TripList">Trips</Link>,
                className: isActive("/tramessy/TripList")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "parts",
                label: <Link to="/tramessy/Parts">Spare & Parts List</Link>,
                className: isActive("/tramessy/Parts")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Vendor Management
          {
            key: "vendor",
            icon: <TeamOutlined />,
            label: "Vendor Management",
            children: [
              {
                key: "all-vendors",
                label: <Link to="/tramessy/VendorList">All Vendor</Link>,
                className: isActive("/tramessy/VendorList")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Rent Vehicle
          {
            key: "rent-vehicle",
            icon: <ShopOutlined />,
            label: "Rent Vehicle",
            children: [
              {
                key: "rent-list",
                label: <Link to="/tramessy/RentList">Rent Vehicle</Link>,
                className: isActive("/tramessy/RentList")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // HR Management
          {
            key: "hr",
            icon: <SolutionOutlined />,
            label: "HR",
            children: [
              {
                key: "hrm",
                label: "HRM",
                children: [
                  {
                    key: "employee",
                    label: (
                      <Link to="/tramessy/HR/HRM/employee-list">Employee</Link>
                    ),
                    className: isActive("/tramessy/HR/HRM/employee-list")
                      ? "ant-menu-item-selected"
                      : "",
                  },
                  {
                    key: "driver",
                    label: <Link to="/tramessy/DriverList">Driver</Link>,
                    className: isActive("/tramessy/DriverList")
                      ? "ant-menu-item-selected"
                      : "",
                  },
                  {
                    key: "office",
                    label: <Link to="/tramessy/HR/HRM/Office">Office</Link>,
                    className: isActive("/tramessy/HR/HRM/Office")
                      ? "ant-menu-item-selected"
                      : "",
                  },
                  {
                    key: "salary-expense",
                    label: (
                      <Link to="/tramessy/HR/HRM/daily-expense">
                        Salary Expense
                      </Link>
                    ),
                    className: isActive("/tramessy/daily-expense")
                      ? "ant-menu-item-selected"
                      : "",
                  },
                ],
              },
            ],
          },
          // Purchase
          {
            key: "purchase",
            icon: <ShoppingCartOutlined />,
            label: "Purchase",
            children: [
              {
                key: "purchase-list",
                label: <Link to="/tramessy/Purchase/PurchaseList">Purchase</Link>,
                className: isActive("/tramessy/Purchase/PurchaseList")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "supplier-list",
                label: <Link to="/tramessy/Purchase/SupplierList">Supplier</Link>,
                className: isActive("/tramessy/Purchase/SupplierList")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Customer
          {
            key: "customer",
            icon: <UserOutlined />,
            label: "Customer",
            children: [
              {
                key: "customer-list",
                label: <Link to="/tramessy/Customer">Customer</Link>,
                className: isActive("/tramessy/Customer")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Business Model
          {
            key: "business",
            icon: <FileTextOutlined />,
            label: "Business Model",
            children: [
              {
                key: "daily-income",
                label: <Link to="/tramessy/DailyIncome">Daily Income</Link>,
                className: isActive("/tramessy/DailyIncome")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "daily-trip-expense",
                label: (
                  <Link to="/tramessy/daily-trip-expense">
                    Daily Trip Expense
                  </Link>
                ),
                className: isActive("/tramessy/daily-trip-expense")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "monthly-statement",
                label: (
                  <Link to="/tramessy/monthly-statement">
                    Monthly Statement
                  </Link>
                ),
                className: isActive("/tramessy/monthly-statement")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Reports
          {
            key: "reports",
            icon: <FileDoneOutlined />,
            label: "Reports",
            children: [
              {
                key: "driver-report",
                label: (
                  <Link to="/tramessy/Reports/Driver-Report">Driver Report</Link>
                ),
                className: isActive("/tramessy/Reports/Driver-Report")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "trip-report",
                label: (
                  <Link to="/tramessy/Reports/Trip-Report">Trip Report</Link>
                ),
                className: isActive("/tramessy/Reports/Trip-Report")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "vehicle-report",
                label: (
                  <Link to="/tramessy/Reports/vehicle-report">
                    Vehicle Report
                  </Link>
                ),
                className: isActive("/tramessy/Reports/vehicle-report")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Accounts
          {
            key: "accounts",
            icon: <DollarOutlined />,
            label: "Accounts",
            children: [
              {
                key: "official-expense",
                label: (
                  <Link to="/tramessy/account/official-expense">
                    Official Expense
                  </Link>
                ),
                className: isActive("/tramessy/official-expense")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "payment-list",
                label: (
                  <Link to="/tramessy/account/PaymentList">Payment</Link>
                ),
                className: isActive("/tramessy/account/PaymentList")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "payment-receive",
                label: (
                  <Link to="/tramessy/account/PaymentReceive">
                    Payment Receive
                  </Link>
                ),
                className: isActive("/tramessy/account/PaymentReceive")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "vendor-payment",
                label: (
                  <Link to="/tramessy/account/VendorPayment">
                    Vendor Payment
                  </Link>
                ),
                className: isActive("/tramessy/account/VendorPayment")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "supplier-ledger",
                label: (
                  <Link to="/tramessy/account/SupplierLedger">
                    Supplier Ledger
                  </Link>
                ),
                className: isActive("/tramessy/account/SupplierLedger")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "driver-ledger",
                label: (
                  <Link to="/tramessy/account/DriverLedger">
                    Driver Ledger
                  </Link>
                ),
                className: isActive("/tramessy/account/DriverLedger")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "customer-ledger",
                label: (
                  <Link to="/tramessy/account/CustomerLedger">
                    Customer Ledger
                  </Link>
                ),
                className: isActive("/tramessy/account/CustomerLedger")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "vendor-ledger",
                label: (
                  <Link to="/tramessy/account/vendor-ledger">
                    Vendor Ledger
                  </Link>
                ),
                className: isActive("/tramessy/account/vendor-ledger")
                  ? "ant-menu-item-selected"
                  : "",
              },
              {
                key: "office-ledger",
                label: (
                  <Link to="/tramessy/account/OfficeLedger">
                    Office Ledger
                  </Link>
                ),
                className: isActive("/tramessy/account/OfficeLedger")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // Billing
          {
            key: "billing",
            icon: <ContainerOutlined />,
            label: "Billing",
            children: [
              {
                key: "bill",
                label: <Link to="/tramessy/billing">Bill</Link>,
                className: isActive("/tramessy/billing")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
          // User Control
          {
            key: "user-control",
            icon: <SettingOutlined />,
            label: "Users Control",
            children: [
              {
                key: "all-users",
                label: <Link to="/tramessy/AllUsers">All Users</Link>,
                className: isActive("/tramessy/AllUsers")
                  ? "ant-menu-item-selected"
                  : "",
              },
            ],
          },
        
      // : [
      //     // Non-admin menu items
      //     {
      //       key: "fleet",
      //       icon: <CarOutlined />,
      //       label: "ফ্লীট ম্যানেজমেন্ট",
      //       children: [
      //         {
      //           key: "car-list",
      //           label: <Link to="/CarList">গাড়ি তালিকা</Link>,
      //           className: isActive("/CarList") ? "ant-menu-item-selected" : "",
      //         },
      //         {
      //           key: "driver-list",
      //           label: <Link to="/DriverList">ড্রাইভার তালিকা</Link>,
      //           className: isActive("/DriverList")
      //             ? "ant-menu-item-selected"
      //             : "",
      //         },
      //         {
      //           key: "trip-list",
      //           label: <Link to="/TripList">ট্রিপ হিসাব</Link>,
      //           className: isActive("/TripList") ? "ant-menu-item-selected" : "",
      //         },
      //         {
      //           key: "parts",
      //           label: <Link to="/Parts">পার্টস এন্ড স্পায়ারস</Link>,
      //           className: isActive("/Parts") ? "ant-menu-item-selected" : "",
      //         },
      //         {
      //           key: "maintenance",
      //           label: <Link to="/Maintenance">মেইনটেনেন্স</Link>,
      //           className: isActive("/Maintenance")
      //             ? "ant-menu-item-selected"
      //             : "",
      //         },
      //       ],
      //     },
      //     {
      //       key: "business",
      //       icon: <FileTextOutlined />,
      //       label: "বিজনেসের বিবরণ",
      //       children: [
      //         {
      //           key: "daily-expense",
      //           label: <Link to="/DailyExpense">দৈনিক ব্যয়</Link>,
      //           className: isActive("/DailyExpense")
      //             ? "ant-menu-item-selected"
      //             : "",
      //         },
      //       ],
      //     },
      //   ]),
  ];
  const getSelectedKey = () => {
  const match = menuItems
    .flatMap(item => (item.children ? item.children : item))
    .find(item => location.pathname.includes(item.key));
  return match ? [match.key] : [];
};


  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      
      breakpoint="lg"
      collapsedWidth="80"
      width={260}
      className="bg-white shadow-2xl custom-sider"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        overflow: "auto",
      }}
    >
      {/* Logo Section */}
      <div className="flex justify-center items-center px-4 py-4 lg:py-0  border-b border-gray-200">
        <Link to="/">
          <p className="font-bold text-2xl text-primary">Afzal constraction </p>
        </Link>
      </div>

      {/* Admin Info Section */}
      {/* {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
            <Avatar  src={avatar} size={32} className="shadow-sm" />
            <div className="flex-1">
              <h3 className="text-gray-800 font-semibold text-sm">Admin</h3>
       
            </div>
          </div>
        </div>
      )} */}

      {/* Navigation Menu */}
      <div className="p-2 pb-8">
        <Menu
          mode="inline"
          theme="light"
          selectedKeys={getSelectedKey()}
  openKeys={openKeys}
       onOpenChange={handleOpenChange}
          items={menuItems}
          className="!border-none bg-white h-full custom-menu"
          style={{
            fontSize: "14px",
          }}
        />
      </div>
    </Sider>
  )
}

export default Sidebar
