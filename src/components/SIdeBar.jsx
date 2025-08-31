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

import { Link, useLocation } from "react-router-dom";
import useAdmin from "../hooks/useAdmin";
import avatar from "../assets/avatar.png";

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAdmin = useAdmin();
  const [openKeys, setOpenKeys] = useState([]);
  const isActive = (path) => location.pathname === path;

  const handleOpenChange = (keys) => {
    setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
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

    // Fleet Management
    {
      key: "fleet",
      icon: <CarOutlined />,
      label: "ফ্লিট ম্যানেজমেন্ট",
      children: [
        {
          key: "vehicles",
          label: <Link to="/tramessy/vehicel">গাড়ি</Link>,
          className: isActive("/tramessy/vehicel")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "trips",
          label: <Link to="/tramessy/TripList">ট্রিপ</Link>,
          className: isActive("/tramessy/TripList")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "parts",
          label: <Link to="/tramessy/Parts">স্পেয়ার ও পার্টস লিস্ট</Link>,
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
          label: <Link to="/tramessy/DriverList">ড্রাইভার</Link>,
          className: isActive("/tramessy/DriverList")
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
          label: <Link to="/tramessy/HR/HRM/daily-expense">বেতন খরচ</Link>,
          className: isActive("/tramessy/daily-expense")
            ? "ant-menu-item-selected"
            : "",
        },
      ],
    },

    // Purchase
    {
      key: "purchase",
      icon: <ShoppingCartOutlined />,
      label: "পারচেজ", // Purchase → ক্রয়
      children: [
        {
          key: "purchase-list",
          label: <Link to="/tramessy/Purchase/PurchaseList">পারচেজ</Link>,
          className: isActive("/tramessy/Purchase/PurchaseList")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "supplier-list",
          label: <Link to="/tramessy/Purchase/SupplierList">সরবরাহকারী</Link>,
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
      ],
    },
    // Business Model
    {
      key: "business",
      icon: <FileTextOutlined />,
      label: "ফাইন্যান্সিয়াল স্টেটমেন্ট",
      children: [
        {
          key: "daily-income",
          label: <Link to="/tramessy/DailyIncome">দৈনিক আয়</Link>,
          className: isActive("/tramessy/DailyIncome")
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
          key: "trip-report",
          label: <Link to="/tramessy/Reports/Trip-Report">ট্রিপ রিপোর্ট</Link>,
          className: isActive("/tramessy/Reports/Trip-Report")
            ? "ant-menu-item-selected"
            : "",
        },
        {
          key: "vehicle-report",
          label: (
            <Link to="/tramessy/Reports/vehicle-report">
              গাড়ির পারফরম্যান্স রিপোর্ট
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
      label: "একাউন্টস",
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
            <Link to="/tramessy/account/DriverLedger">ড্রাইভার লেজার</Link>
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
      label: " ইউজারস কন্ট্রোল",
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
        hidden
      >
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
  );
};

export default Sidebar;
