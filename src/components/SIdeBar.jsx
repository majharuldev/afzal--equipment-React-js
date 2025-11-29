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
  SettingOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { Layout, Menu, Avatar } from "antd";
import { PiWarehouse } from "react-icons/pi";
import { Link, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import logo from "../assets/afjal-logo.png";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAdmin = useAdmin();
  const [openKeys, setOpenKeys] = useState([]);
   const isActive = (path) => location.pathname === path;

  //  একাধিক Submenu একসাথে খুলতে পারবে
  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  // Admin menu items
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/tramessy">ড্যাশবোর্ড</Link>,
      className: isActive("/tramessy") ? "ant-menu-item-selected" : "",
    },
    // ...(isAdmin
    //   ?
 
        {
          key: "trips",
          icon: <CarOutlined />,
          label: <Link to="/tramessy/equipment-operation">ইকুইপমেন্ট অপারেশন</Link>,
          className: isActive("/tramessy/equipment-operation")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "vehicles",
          icon: <CarOutlined />,
          label: <Link to="/tramessy/equipment">ইকুইপমেন্ট তথ্য</Link>,
          className: isActive("/tramessy/equipment")
            ? "ant-menu-item-selected"
            : "",
        },
    // Fleet Management
    // {
    //   key: "fleet",
    //   icon: <CarOutlined />,
    //   label: "ফ্লিট ম্যানেজমেন্ট",
    //   children: [
    //   ],
    // },
    // Vendor Management
    {
      key: "vendor",
      icon: <TeamOutlined />,
      label: "ভেন্ডর ম্যানেজমেন্ট",
      children: [
        {
          key: "all-vendors",
          label: <Link to="/tramessy/VendorList"> সকল ভেন্ডর </Link>,
          className: isActive("/tramessy/VendorList")
            ? "ant-menu-item-selected"
            : "",
        },

        {
          key: "rent-list",
          label: <Link to="/tramessy/RentList">ভাড়ার গাড়ি</Link>,
          className: isActive("/tramessy/RentList")
            ? "ant-menu-item-selected"
            : "",
        },
      ],
    },
    // Rent Vehicle
    // {
    //   key: "rent-vehicle",
    //   icon: <ShopOutlined />,
    //   label: "ভাড়ার গাড়ি",
    //   children: [
    //     {
    //       key: "rent-list",
    //       label: <Link to="/tramessy/RentList">ভাড়ার গাড়ি</Link>,
    //       className: isActive("/tramessy/RentList")
    //         ? "ant-menu-item-selected"
    //         : "",
    //     },
    //   ],
    // },
    // HR Management
    {
      key: "hr",
      icon: <SolutionOutlined />,
      label: "এইচআর",
      children: [
        {
          key: "employee",
          label: <Link to="/tramessy/HR/HRM/employee-list">কর্মচারী</Link>,
          className: isActive("/tramessy/HR/HRM/employee-list")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "driver",
          label: <Link to="/tramessy/HR/DriverList">অপারেটর/ড্রাইভার</Link>,
          className: isActive("/tramessy/HR/DriverList")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "helper",
          label: <Link to="/tramessy/HR/helper">হেল্পার</Link>,
          className: isActive("/tramessy/HR/helper")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "office",
          label: <Link to="/tramessy/HR/HRM/Office">অফিস</Link>,
          className: isActive("/tramessy/HR/HRM/Office")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "salary-expense",
          label: <Link to="/tramessy/HR/HRM/salary-expense">বেতন খরচ</Link>,
          className: isActive("/tramessy/salary-expense")
            ? "ant-menu-item-selected"
            : "",
        },
      {
  key: "payroll",
  label: "পেরোল ব্যবস্থাপনা",
  children: [
    {
      key: "attendance",
      label: <Link to="/tramessy/HR/Payroll/Attendance">উপস্থিতি</Link>,
    },
    {
      key: "salary-advance",
      label: <Link to="/tramessy/HR/Payroll/Advance-Salary">অগ্রিম বেতন</Link>,
    },
    {
      key: "salary-sheet",
      label: <Link to="/tramessy/HR/Payroll/salary-sheet">বেতন শীট</Link>,
    },
  ],
}
  ]},

    // Purchase
    {
      key: "purchase",
      icon: <ShoppingCartOutlined />,
      label: "ক্রয় ব্যবস্থাপনা", // Purchase → ক্রয়
      children: [
        {
          key: "maintenance",
          label: <Link to="/tramessy/Purchase/maintenance">মেইনটেনেন্স</Link>,
          className: isActive("/tramessy/Purchase/maintenance")
            ? "ant-menu-item-selected"
            : "",
        },
         {
          key: "fuel",
          label: <Link to="/tramessy/Purchase/fuel">ফুয়েল</Link>,
          className: isActive("/tramessy/Purchase/fuel")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "official-purchase",
          label: <Link to="/tramessy/Purchase/official-product">অফিশিয়াল প্রোডাক্টস</Link>,
          className: isActive("/tramessy/Purchase/official-product")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "supplier-list",
          label: <Link to="/tramessy/Purchase/SupplierList">সাপ্লায়ার</Link>,
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
      label: "কাস্টমার",
      children: [
        {
          key: "customer-list",
          label: <Link to="/tramessy/Customer"> কাস্টমার তালিকা </Link>,
          className: isActive("/tramessy/Customer")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "route-pricing",
          label: <Link to="/tramessy/route-pricing"> রুটভিত্তিক মূল্য </Link>,
          className: isActive("/tramessy/route-pricing")
            ? "ant-menu-item-selected"
            : "",
        },
      ],
    },
    // গ্যারেজ ম্যানেজমেন্ট
    {
      key: "yard",
      icon: <PiWarehouse className="mr-1"/>,
      label: "ইয়ার্ড ম্যানেজমেন্ট",
      children: [
        {
          key: "yard",
          label: <Link to="/tramessy/yard">ইয়ার্ড কাস্টমার</Link>,
          className: isActive("/tramessy/yard")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "yard-expense",
          label: <Link to="/tramessy/yard-expense">ইয়ার্ড খরচের হিসাব</Link>,
          className: isActive("/tramessy/yard-expense")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "yard-recieve-amount",
          label: <Link to="/tramessy/yard-recieve-amount">ভাড়া উত্তোলন</Link>,
          className: isActive("/tramessy/yard-recieve-amount")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "yard-customer-ledger",
          label: <Link to="/tramessy/yard-customer-ledger">ইয়ার্ড কাস্টমার লেজার</Link>,
          className: isActive("/tramessy/yard-customer-ledger")
            ? "ant-menu-item-selected"
            : "",
        },
        
      ],
    },
    // Business Model
    {
      key: "business",
      icon: <FileTextOutlined />,
      label: "লাভ/ক্ষতি",
      children: [
        {
          key: "daily-income",
          label: <Link to="/tramessy/daily-income">দৈনিক আয়</Link>,
          className: isActive("/tramessy/daily-income")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "daily-trip-expense",
          label: <Link to="/tramessy/daily-trip-expense">দৈনিক ট্রিপ খরচ</Link>,
          className: isActive("/tramessy/daily-trip-expense")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "monthly-statement",
          label: <Link to="/tramessy/monthly-statement">মাসিক লাভ/ক্ষতি</Link>,
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
      label: "রিপোর্টস",
      children: [
        {
          key: "driver-report",
          label: (
            <Link to="/tramessy/Reports/Driver-Report"> ড্রাইভার রিপোর্ট </Link>
          ),
          className: isActive("/tramessy/Reports/Driver-Report")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "fuel-report",
          label: <Link to="/tramessy/Reports/fuel-Report">ফুয়েল রিপোর্ট</Link>,
          className: isActive("/tramessy/Reports/fuel-Report")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "vehicle-report",
          label: (
            <Link to="/tramessy/Reports/vehicle-report">
              গাড়ির রিপোর্ট
            </Link>
          ),
          className: isActive("/tramessy/Reports/vehicle-report")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "purchase-report",
          label: (
            <Link to="/tramessy/Reports/purchase-report">
              ক্রয় রিপোর্ট
            </Link>
          ),
          className: isActive("/tramessy/Reports/purchase-report")
            ? "ant-menu-item-selected"
            : "",
        },
      ],
    },
    // Accounts
    {
      key: "accounts",
      icon: <DollarOutlined />,
      label: "অ্যাকাউন্টস",
      children: [
        {
          key: "official-expense",
          label: <Link to="/tramessy/account/official-expense">অফিস খরচ</Link>,
          className: isActive("/tramessy/official-expense")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "payment-list",
          label: <Link to="/tramessy/account/PaymentList"> পেমেন্ট </Link>,
          className: isActive("/tramessy/account/PaymentList")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "payment-receive",
          label: (
            <Link to="/tramessy/account/PaymentReceive">পেমেন্ট রিসিভ</Link>
          ),
          className: isActive("/tramessy/account/PaymentReceive")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "vendor-payment",
          label: (
            <Link to="/tramessy/account/VendorPayment">ভেন্ডর পেমেন্ট</Link>
          ),
          className: isActive("/tramessy/account/VendorPayment")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "supplier-ledger",
          label: (
            <Link to="/tramessy/account/SupplierLedger">সাপ্লায়ার লেজার</Link>
          ),
          className: isActive("/tramessy/account/SupplierLedger")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "driver-ledger",
          label: (
            <Link to="/tramessy/account/DriverLedger">অপারেটর লেজার</Link>
          ),
          className: isActive("/tramessy/account/DriverLedger")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "customer-ledger",
          label: (
            <Link to="/tramessy/account/CustomerLedger">কাস্টমার লেজার</Link>
          ),
          className: isActive("/tramessy/account/CustomerLedger")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "vendor-ledger",
          label: <Link to="/tramessy/account/vendor-ledger">ভেন্ডর লেজার</Link>,
          className: isActive("/tramessy/account/vendor-ledger")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "office-ledger",
          label: <Link to="/tramessy/account/OfficeLedger">অফিস লেজার</Link>,
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
      label: "বিলিং",
      children: [
        {
          key: "bill",
          label: <Link to="/tramessy/billing"> বিল </Link>,
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
      label: " ইউজার কন্ট্রোল",
      children: [
        {
          key: "all-users",
          label: <Link to="/tramessy/AllUsers"> সকল ইউজার </Link>,
          className: isActive("/tramessy/AllUsers")
            ? "ant-menu-item-selected"
            : "",
        },
      ],
    },
  ];
  const getSelectedKey = () => {
    const match = menuItems
      .flatMap((item) => (item.children ? item.children : item))
      .find((item) => location.pathname.includes(item.key));
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
      <div
        className="flex justify-center items-center px-4 py-4 lg:py-0  border-b border-gray-200"
       
      >
        <Link to="/tramessy">
         <img src={logo} alt="" className="w-[4.3rem]" />
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
  );
};

export default Sidebar;
