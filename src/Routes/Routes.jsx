import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home";
import CarList from "../Pages/CarList";
import AddCarForm from "../Pages/AddCarForm";
import DriverList from "../Pages/DriverList";
import AddDriverForm from "../Pages/AddDriverForm";
import TripList from "../Pages/TripList";
import AddTripForm from "../Pages/AddTripForm";
import Fuel from "../Pages/Fuel";
import FuelForm from "../Pages/FuelForm";
import Parts from "../Pages/Parts";
import DailyExpense from "../Pages/DailyExpense";
import AllUsers from "../Pages/AllUsers";
import AddUserForm from "../Pages/AddUserForm";
import Login from "../components/Form/Login";
import ResetPass from "../components/Form/ResetPass";
import PrivateRoute from "./PrivateRoute";
import UpdatePartsForm from "../Pages/updateForm/UpdatePartsForm";
import UpdateExpenseForm from "../Pages/updateForm/UpdateExpenseForm";
import AdminRoute from "./AdminRoute";
import VendorList from "../Pages/VendorList";
import AddVendorForm from "../Pages/AddVendorForm";
import RentList from "../Pages/RentList";
import AddRentVehicleForm from "../Pages/AddRentVehicleForm";
import EmployeeList from "../Pages/HR/HRM/Employee-list";
import AddEmployee from "../Pages/HR/HRM/AddEmployee";
import PurchaseList from "../Pages/Purchase/PurchaseList";
import PurchaseForm from "../Pages/Purchase/PurchaseForm";
import Stockin from "../Pages/Inventory/Stockin";
import AddStock from "../Pages/Inventory/AddStock";
import StockOut from "../Pages/Inventory/StockOut";
import StockOutForm from "../Pages/Inventory/StockOutForm";
import SupplierList from "../Pages/Purchase/SupplierList";
import AddSupply from "../Pages/Purchase/AddSupply";
import AttendanceList from "../Pages/HR/HRM/AttendanceList";
import AdvanceSalary from "../Pages/HR/Payroll/AdvanceSalary";
import AdvanceSalaryForm from "../Pages/HR/Payroll/AdvanceSalaryForm";
import Customer from "../Pages/Customer/Customer";
import ExployeeReport from "../Pages/Reports/ExployeeReport";
import DriverReport from "../Pages/Reports/DriverReport";
import FuelReport from "../Pages/Reports/FuelReport";
import PurchaseReport from "../Pages/Reports/PurchaseReport";
import InventoryReport from "../Pages/Reports/InventoryReport";
import TripReport from "../Pages/Reports/TripReport";
import AttendanceForm from "../Pages/HR/HRM/AttendanceForm";
import InventorySupplier from "../Pages/Inventory/InventorySupplier";
import InventorySupplierForm from "../Pages/Inventory/InventorySupplierForm";
import CashDispatch from "../Pages/Account/CashDispatch";
import Office from "../Pages/HR/HRM/Office";
import CashDispatchForm from "../Pages/Account/CashDispatchForm";
import OfficeForm from "../Pages/HR/HRM/OfficeForm";
import CustomerLedger from "../Pages/Account/CustomerLedger";
import SupplierLedger from "../Pages/Account/SupplierLedger";
import OfficeLedger from "../Pages/Account/OfficeLedger";
import PaymentList from "../Pages/Account/PaymentList";
import PaymentReceiveForm from "../Pages/Account/PaymentReceiveForm";
import PaymentReceive from "../Pages/Account/PaymentReceive";
import DriverLedger from "../Pages/Account/DriverLedger";
import UpdateLeaveForm from "../Pages/HR/UpdateLeaveForm";
import MonthlyStatement from "../Pages/MontlyStatement";
import VehicleReport from "../Pages/Reports/VehicleReport";
import Bill from "../Pages/Billing/Bill";
import DailyTripExpense from "../Pages/DailyTripExpense";
import VendorLedger from "../Pages/Account/VendorLedger";
import VendorPayment from "../Pages/Account/VendorPayment";
import VendorPaymentForm from "../Pages/Account/VendorPaymentForm";
import OfficialExpense from "../Pages/OfficialExpense";
import OfficialProducts from "../Pages/Purchase/OfficialProducts";
import OfficialProductForm from "../Pages/Purchase/OfficialProductForm";
import CustomerForm from "../Pages/Customer/AddCustomer";
import GarageCustomerForm from "../Pages/Garage/GarageCustomerForm";
import GarageCustomer from "../Pages/Garage/GarageCustomer";
import GarageExpense from "../Pages/Garage/GarageExpense";
import GarageCustomerLedger from "../Pages/Account/GarageCustomerLedger";
import GarageReceiveAmount from "../Pages/Garage/GarageReceiveAmount";
import RoutePricing from "../Pages/Customer/RoutePricing";
import SalarySheet from "../Pages/HR/Payroll/SalarySheet";
import DailyIncome from "../Pages/DailyIncome";
import HelperList from "../Pages/HR/Helper";
import HelperForm from "../Pages/Reports/HelperForm";

export const router = createBrowserRouter([
  {
    path: "/tramessy",
    element: <Main />,
    children: [
      {
        path: "/tramessy",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/equipment",
        element: (
          <PrivateRoute>
            <CarList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/add-equipment-form",
        element: (
          <PrivateRoute>
            <AddCarForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/update-equipment-form/:id",
        element: (
          <PrivateRoute>
            <AddCarForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/HR/DriverList",
        element: (
          <PrivateRoute>
            <DriverList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AddDriverForm",
        element: (
          <PrivateRoute>
            <AddDriverForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdateDriverForm/:id",
        element: (
          <PrivateRoute>
            <AddDriverForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/equipment-operation",
        element: (
          <PrivateRoute>
            <TripList />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/add-equipment-operation-form",
        element: (
          <PrivateRoute>
            <AddTripForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/update-equipment-operation-form/:id",
        element: (
          <PrivateRoute>
            <AddTripForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/Fuel",
        element: (
          <PrivateRoute>
            <Fuel />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/FuelForm",
        element: (
          <PrivateRoute>
            <FuelForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/Parts",
        element: (
          <PrivateRoute>
            <Parts />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/UpdatePartsForm/:id",
        element: (
          <PrivateRoute>
            <UpdatePartsForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/VendorList",
        element: (
          // <AdminRoute>
          <VendorList />
          // </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AddVendorForm",
        element: (
          // <AdminRoute>
          <AddVendorForm />
          // </AdminRoute>
        ),
      },
      {
        path: "/tramessy/UpdateVendorForm/:id",
        element: (
          <PrivateRoute>
            <AddVendorForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/RentList",
        element: (
          // <AdminRoute>
          <RentList />
          // </AdminRoute>
        ),
      },
      {
        path: "/tramessy/AddRentVehicleForm",
        element: (
          // <AdminRoute>
          <AddRentVehicleForm />
          // </AdminRoute>
        ),
      },
      {
        path: "/tramessy/UpdateRentVehicleForm/:id",
        element: (
          <PrivateRoute>
            <AddRentVehicleForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/daily-income",
        element: (
          <AdminRoute>
            <DailyIncome />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/daily-trip-expense",
        element: (
          <PrivateRoute>
            <DailyTripExpense />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/HR/HRM/salary-expense",
        element: (
          <PrivateRoute>
            <DailyExpense />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/monthly-statement",
        element: (
          <PrivateRoute>
            <MonthlyStatement/>
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/AllUsers",
        element: (
          <AdminRoute>
            <AllUsers />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/UserForm",
        element: (
          <AdminRoute>
            <AddUserForm />
          </AdminRoute>
        ),
      },
      {
        path: "/tramessy/UserForm/edit/:id",
        element: (
          <PrivateRoute>
            <AddUserForm />
          </PrivateRoute>
        ),
        // loader: ({ params }) =>
        //   fetch(`${import.meta.env.VITE_BASE_URL}/api/users/${params.id}`),
      },
      {
        path: "/tramessy/Login",
        element: <Login />,
      },
      {
        path: "/tramessy/ResetPass",
        element: <ResetPass />,
      },
      {
        path: "/tramessy/UpdateExpenseForm/:id",
        element: (
          <PrivateRoute>
            <UpdateExpenseForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/${params.id}`),
      },

      // HR
      {
        path: "/tramessy/HR/HRM/employee-list",
        element: <EmployeeList />,
      },
      {
        path: "/tramessy/HR/HRM/Office",
        element: <Office />,
      },
      {
        path: "/tramessy/HR/HRM/OfficeForm",
        element: <OfficeForm />,
      },
      {
        path: "/tramessy/HR/helper",
        element: <HelperList/>,
      },
      {
        path: "/tramessy/HR/helper-form",
        element: <HelperForm />,
      },
       {
        path: "/tramessy/HR/update-helper-form/:id",
        element: <HelperForm />,
      },
      {
        path: "/tramessy/HR/HRM/UpdateOfficeForm/:id",
        element: (
          <PrivateRoute>
            <OfficeForm />
          </PrivateRoute>
        ),
      },
      {
        path: "/tramessy/HR/HRM/AddEmployee",
        element: <AddEmployee />,
      },
      {
        path: "/tramessy/UpdateEmployeeForm/:id",
        element: (
          <PrivateRoute>
            <AddEmployee />
          </PrivateRoute>
        ),
      },
     {
        path: "/tramessy/HR/Payroll/Attendance",
        element: <AttendanceList />,
      },

      {
        path: "/tramessy/HR/payroll/AttendanceForm",
        element: <AttendanceForm />,
      },
      {
        path: "/tramessy/HR/Payroll/update-attendence/:id",
        element: <AttendanceForm />,
      },
      // payroll
      {
        path: "/tramessy/HR/Payroll/Advance-Salary",
        element: <AdvanceSalary />,
      },
      {
        path: "/tramessy/HRM/Payroll/Advance-Salary-Form",
        element: <AdvanceSalaryForm />,
      },
      {
        path: "/tramessy/HR/Payroll/update-advance/:id",
        element: <AdvanceSalaryForm />,
      },
      {
        path: "/tramessy/HR/payroll/salary-sheet",
        element: <SalarySheet />,
      },
      // {
      //   path: "/tramessy/HRM/payroll/generate-salary-form",
      //   element: <GenerateSalaryForm />,
      // },
      // {
      //   path: "/tramessy/HR/HRM/Leave",
      //   element: <Leave />,
      // },
      // {
      //   path: "/tramessy/HR/HRM/LeaveForm",
      //   element: <LeaveForm />,
      // },
      {
        path: "/tramessy/UpdateLeaveForm/:id",
        element: (
          <PrivateRoute>
            <UpdateLeaveForm />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/leave/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/Purchase/maintenance",
        element: <PurchaseList />,
      },
      {
        path: "/tramessy/Purchase/add-maintenance",
        element: <PurchaseForm />,
      },
      {
        path: "/tramessy/Purchase/update-maintenance/:id",
        element: <PurchaseForm />,
        // loader: ({ params }) =>
        //   fetch(
        //     `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${params.id}`
        //   ),
      },
      {
        path: "/tramessy/Purchase/SupplierList",
        element: <SupplierList />,
      },
      {
        path: "/tramessy/Purchase/AddSupply",
        element: <AddSupply />,
      },
      {
        path: "/tramessy/UpdateSupplyForm/:id",
        element: (
          <PrivateRoute>
            <AddSupply />
          </PrivateRoute>
        ),
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/supply/show/${params.id}`
          ),
      },
      {
        path: "/tramessy/Purchase/fuel",
        element: <Fuel />,
      },
      {
        path: "/tramessy/Purchase/update-fuel/:id",
        element: <FuelForm />,
      },
      {
        path: "/tramessy/Purchase/official-product",
        element: <OfficialProducts/>,
      },
      {
        path: "/tramessy/Purchase/add-officialProduct",
        element: <OfficialProductForm/>,
      },
      {
        path: "/tramessy/Purchase/update-officialProduct/:id",
        element: <OfficialProductForm/>,
      },
      // Inventory
      {
        path: "/tramessy/Inventory/Stockin",
        element: <Stockin />,
      },
      {
        path: "/tramessy/Inventory/AddStock",
        element: <AddStock />,
      },
      {
        path: "/tramessy/Inventory/StockOut",
        element: <StockOut />,
      },
      {
        path: "/tramessy/Inventory/StockOutForm",
        element: <StockOutForm />,
      },
      {
        path: "/tramessy/Inventory/Inventory-supplier",
        element: <InventorySupplier />,
      },
      {
        path: "/tramessy/Inventory/InventorySupplierForm",
        element: <InventorySupplierForm />,
      },
      // Customer
      {
        path: "/tramessy/Customer",
        element: <Customer />,
      },
      {
        path: "/tramessy/route-pricing",
        element: <RoutePricing />,
      },
      {
        path: "/tramessy/AddCustomer",
        element: <CustomerForm />,
      },
      {
        path: "/tramessy/UpdateCustomerForm/:id",
        element: <CustomerForm />,
        loader: ({ params }) =>
          fetch(
            `${import.meta.env.VITE_BASE_URL}/api/customer/show/${params.id}`
          ),
      },
      // garage mangement
      { path: "/tramessy/garage", element: <GarageCustomer /> },
      {path: "/tramessy/GarageCustomerForm", element: <GarageCustomerForm />},
      { path: "/tramessy/GarageCustomerForm/update/:id", element: <GarageCustomerForm />},
      { path: "/tramessy/garage-expense", element: <GarageExpense /> },
      { path: "/tramessy/garage-customer-ledger", element: <GarageCustomerLedger /> },
      { path: "/tramessy/garage-recieve-amount", element: <GarageReceiveAmount /> },
      // Reports
      {
        path: "/tramessy/Reports/Employee-Report",
        element: <ExployeeReport />,
      },
      {
        path: "/tramessy/Reports/Driver-Report",
        element: <DriverReport />,
      },
      {
        path: "/tramessy/Reports/fuel-report",
        element: <FuelReport />,
      },
      {
        path: "/tramessy/Reports/purchase-report",
        element: <PurchaseReport />,
      },
      {
        path: "/tramessy/Reports/vehicle-report",
        element: <VehicleReport />,
      },
      {
        path: "/tramessy/Reports/Inventory-Report",
        element: <InventoryReport />,
      },
      {
        path: "/tramessy/Reports/Trip-Report",
        element: <TripReport />,
      },
      // billing
      {
        path: "/tramessy/billing",
        element: <Bill />,
      },
      // Account
      {
        path: "/tramessy/account/CashDispatch",
        element: <CashDispatch />,
      },
      {
        path: "/tramessy/account/CashDispatchForm",
        element: <CashDispatchForm />,
      },
      {
        path: "/tramessy/account/PaymentList",
        element: <PaymentList />,
      },
      {
        path: "/tramessy/account/official-expense",
        element: <OfficialExpense />,
      },
      {
        path: "/tramessy/account/PaymentReceive",
        element: <PaymentReceive />,
      },
      {
        path: "/tramessy/account/PaymentReceiveForm",
        element: <PaymentReceiveForm />,
      },
      {
        path: "/tramessy/account/PaymentReceiveForm/edit/:id",
        element: <PaymentReceiveForm />,
      },
      {
        path: "/tramessy/account/VendorPayment",
        element: <VendorPayment />,
      },
      {
        path: "/tramessy/account/VendorPaymentForm",
        element: <VendorPaymentForm />,
      },
      {
        path: "/tramessy/account/VendorPaymentForm/edit/:id",
        element: <VendorPaymentForm />,
      },
      {
        path: "/tramessy/account/CustomerLedger",
        element: <CustomerLedger />,
      },
      {
        path: "/tramessy/account/SupplierLedger",
        element: <SupplierLedger />,
      },
      {
        path: "/tramessy/account/DriverLedger",
        element: <DriverLedger />,
      },
      {
        path: "/tramessy/account/OfficeLedger",
        element: <OfficeLedger />,
      },
      {
        path: "/tramessy/account/vendor-ledger",
        element: <VendorLedger/>,
      },
    ],
  },
]);
