   

// import { useEffect, useState } from "react";
// import { useForm, FormProvider, useWatch } from "react-hook-form";
// import { Menu, X, User } from "lucide-react";
// import { FiCalendar } from "react-icons/fi";
// import { InputField, SelectField } from "../../components/Form/FormFields";
// import { useLoaderData, useNavigate } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";

// export default function UpdateTripForm() {
//   const navigate = useNavigate();
//   const initialValues = useLoaderData(); 

//   const methods = useForm({
//   defaultValues: {
//     date: initialValues?.date || "",
//     tripTime: initialValues?.tripTime || "",
//     loadPoint: initialValues?.loadPoint || "",
//     unloadPoint: initialValues?.unloadPoint || "",
//     vehicleNo: initialValues?.vehicleNo || "",
//     driverName: initialValues?.driverName || "",
//     driverMobile: initialValues?.driverMobile || "",
//     fuelCost: initialValues?.fuelCost || "",
//     tollCost: initialValues?.tollCost || "",
//     policeCost: initialValues?.policeCost || "",
//     commission: initialValues?.commission || "",
//     labour: initialValues?.labour || "",
//     others: initialValues?.others || "",
//     damarageDay: initialValues?.damarageDay || "",
//     damarageRate: initialValues?.damarageRate || "",
//     customerName: initialValues?.customerName || "",
//     customerNumber: initialValues?.mobile || "",
//     rentAmount: initialValues?.rentAmount || "",
//     advancePayment: initialValues?.advancePayment || "",
//     total: initialValues?.total || "",
//     damarageTotal: initialValues?.damarageTotal || "",
//   },
// });

//   const { handleSubmit, control, reset, watch } = methods;

//   useEffect(() => {
//     if (initialValues) {
//       reset(initialValues);
//     }
//   }, [initialValues, reset]);

//   // Auto-calculation for Total and DamageTotal
//   const watchFields = watch([
//     "fuelCost",
//     "tollCost",
//     "policeCost",
//     "commission",
//     "labour",
//     "others",
//     "damarageDay",
//     "damarageRate",
//   ]);

//   useEffect(() => {
//     const keys = [
//       "fuelCost",
//       "tollCost",
//       "policeCost",
//       "commission",
//       "labour",
//       "others",
//       "damarageDay",
//       "damarageRate",
//     ];

//     const values = watchFields.reduce((acc, val, i) => {
//       acc[keys[i]] = Number(val || 0);
//       return acc;
//     }, {});

//     const total =
//       values.fuelCost +
//       values.tollCost +
//       values.policeCost +
//       values.commission +
//       values.labour +
//       values.others;

//     const damarageTotal = values.damarageDay * values.damarageRate;

//     methods.setValue("total", total);
//     methods.setValue("damarageTotal", damarageTotal);
//   }, [watchFields, methods]);

//   const onSubmitForm = async (data) => {
//   try {
//     const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/update/${data.id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });

//     if (res.ok) {
//       toast.success("Trip updated successfully!"); 
//       navigate("/tramessy/tripList"); 
//     } else {
//       toast.error("Failed to update the trip.");
//     }
//   } catch (error) {
//     console.error(error);
//     toast.error("Something went wrong.");
//   }
// };

// // select driver from api
// const [vehicle, setVehicle] = useState([]);
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
//       .then((response) => response.json())
//       .then((data) => setVehicle(data.data))
//       .catch((error) => console.error("Error fetching driver data:", error));
//   }, []);

//   const vehicleOptions = vehicle.map((vehicle) => ({
//     value: vehicle.vehicle_name,
//     label: vehicle.vehicle_name,
//   }));
//   // vehicel
//   const [driver, setDriver] = useState([]);
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
//       .then((response) => response.json())
//       .then((data) => setDriver(data.data))
//       .catch((error) => console.error("Error fetching driver data:", error));
//   }, []);

//   const driverOptions = driver.map((driver) => ({
//     value: driver.driver_name,
//     label: driver.driver_name,
//      mobile: driver.driver_mobile,
//   }));
//    // Driver name এর পরিবর্তন দেখুন
// const selectedDriverName = useWatch({
//   control,
//   name: "driverName",
// });

// useEffect(() => {
//   const selectedDriver = driverOptions.find(d => d.value === selectedDriverName);
//   if (selectedDriver) {
//     methods.setValue("driverMobile", selectedDriver.mobile || "");
//   }
// }, [selectedDriverName, driverOptions, methods]);

// // customer
//   const [customer, setCustomer] = useState([]);
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
//       .then((response) => response.json())
//       .then((data) => setCustomer(data.data))
//       .catch((error) => console.error("Error fetching driver data:", error));
//   }, []);

//   const customerOptions = customer.map((customer) => ({
//     value: customer.customer_name,
//     label: customer.customer_name,
//      mobile: customer.mobile,
//   }));

//    // Driver name এর পরিবর্তন দেখুন
// const selectedCustomerName = useWatch({
//   control,
//   name: "customerName",
// });

// useEffect(() => {
//   const selectedCustomer = customerOptions.find(d => d.value === selectedCustomerName);
//   if (selectedCustomer) {
//     methods.setValue("mobile", selectedCustomer.mobile || "");
//   }
// }, [selectedCustomerName, customerOptions, methods]);

//   return (
//     <FormProvider {...methods}>
//       <Toaster/>
//       <form onSubmit={handleSubmit(onSubmitForm)} className="min-h-screen mt-10">
//         {/* Header */}
//         <div className="bg-primary text-white px-4 py-2 rounded-t-md">
//           <h2 className="text-lg font-medium">Update Trip Form</h2>
//         </div>

//         <div className="rounded-b-md shadow border border-gray-200">
//           <div className="p-4 space-y-2">
//             {/* Trip & Destination Section */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h3 className="text-orange-500 font-medium text-center mb-6">
//                 Trip & Destination Section!
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
//                 <InputField
//                   name="date"
//                   label="Date"
//                   required
//                   icon={
//                     <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
//                       <FiCalendar className="text-white cursor-pointer" />
//                     </span>
//                   }
//                 />
//                 <InputField name="tripTime" label="Trip Time" placeholder="Trip Time" />
//                 <InputField name="loadPoint" label="Load Point" placeholder="Load Point" />
//                 <InputField name="unloadPoint" label="Unload Point" placeholder="Unload Point" />
//               </div>
//             </div>

//             {/* Vehicle & Driver Information */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h3 className="text-orange-500 font-medium text-center mb-6">Vehicle & Driver Information!</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
//                 <SelectField name="vehicleNo" label="Vehicle No" options={vehicleOptions} control={control} required />
//               <SelectField name="driverName" label="Driver Name" options={driverOptions} control={control} required />
//               <InputField name="driverMobile" label="Driver Mobile" readOnly />
//               </div>
//             </div>

//             {/* Running Cost Section */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h3 className="text-orange-500 font-medium text-center mb-6">Running Cost Section!</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 mb-2">
//                 <InputField name="fuelCost" label="Fuel Cost" />
//                 <InputField name="tollCost" label="Toll Cost" />
//                 <InputField name="policeCost" label="Police Cost" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6">
//                 <InputField name="commission" label="Commission" />
//                 <InputField name="labour" label="Labour" />
//                 <InputField name="others" label="Others" />
//                 <InputField name="total" label="Total" readOnly />
//               </div>
//             </div>

//             {/* Damage Section */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h3 className="text-orange-500 font-medium text-center mb-6">Damarage Section!</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
//                 <InputField name="damarageDay" label="Damarage Day" />
//                 <InputField name="damarageRate" label="Damarage Rate" />
//                 <InputField name="damarageTotal" label="Damarage Total" readOnly />
//               </div>
//             </div>

//             {/* Customer & Payment Section */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h3 className="text-orange-500 font-medium text-center mb-6">Customer & Payment Section!</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
//                 <SelectField name="customerName" label="Customer Name" options={customerOptions} control={control} required />
//                 <InputField name="mobile" label="Customer Number" />
//                 <InputField name="rentAmount" label="Rent Amount" />
//                 <InputField name="advancePayment" label="Advance Payment" />
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-start">
//               <button
//                 type="submit"
//                 className="bg-slate-800 text-white px-8 py-2 rounded-md hover:bg-slate-700 transition-colors"
//               >
//                 Update
//               </button>
//             </div>
//           </div>

//           {/* Mobile Bottom Navigation */}
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex items-center justify-between md:hidden">
//             <div className="flex items-center space-x-4">
//               <Menu className="h-6 w-6 text-gray-600" />
//               <span className="text-gray-600">Home</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <X className="h-5 w-5 text-gray-600" />
//               <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
//                 <User className="h-5 w-5 text-white" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// }


import { useForm, FormProvider, useWatch } from "react-hook-form";

import { Calendar, ChevronDown, Menu, X, User } from "lucide-react";
import { FiCalendar } from "react-icons/fi";
import { useLoaderData, useNavigate } from "react-router-dom";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { InputField, SelectField } from "../../components/Form/FormFields";

export default function UpdateTripForm() {
  const navigate = useNavigate();
const initialValues = useLoaderData(); 

  const methods = useForm({
  defaultValues: {
    date: initialValues?.data?.date || "",
  tripTime: initialValues?.data?.tripTime || "", // যদি API তে না থাকে, বাদ দাও

  loadPoint: initialValues?.data?.load_point || "",
  unloadPoint: initialValues?.data?.unload_point || "",
  vehicleNo: initialValues?.data?.vehicle_no || "",
  driverName: initialValues?.data?.driver_name || "",
  driverMobile: initialValues?.data?.driver_mobile || "",
  fuelCost: initialValues?.data?.fuel_cost || "",
  tollCost: initialValues?.data?.toll_cost || "",
  policeCost: initialValues?.data?.police_cost || "",
  commission: initialValues?.data?.driver_commission || "",
  labour: initialValues?.data?.labor || "",
  others: initialValues?.data?.others || "",
  damarageDay: initialValues?.data?.damarageDay || "", // if not present, keep blank
  damarageRate: initialValues?.data?.damarageRate || "",

  customerName: initialValues?.data?.customer || "",
  customerNumber: initialValues?.data?.customer_mobile || "",

  rentAmount: initialValues?.data?.rentAmount || "",
  advancePayment: initialValues?.data?.advance || "",
  total: initialValues?.data?.total || "",
  damarageTotal: initialValues?.data?.damarageTotal || "",
  },
});

  const { handleSubmit, control, reset, watch, setValue } = methods;

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);
   
 const selectedTransport = watch("transport_type");
  const watchFields = watch([
    "fuelCost",
    "tollCost",
    "policeCost",
    "commission",
    "labour",
    "others",
    "damarageDay",
    "damarageRate",
  ]);

  // calculate Total Expense
  const driverCommision = parseFloat(watch("driver_commission") || 0);
  const roadCost = parseFloat(watch("road_cost") || 0);
  const labourCost = parseFloat(watch("labor") || 0);
  const parkingCost = parseFloat(watch("parking_cost") || 0);
  const guardCost = parseFloat(watch("night_guard") || 0);
  const tollCost = parseFloat(watch("toll_cost") || 0);
  const feriCost = parseFloat(watch("feri_cost") || 0);
  const policeCost = parseFloat(watch("police_cost") || 0);
  const chadaCost = parseFloat(watch("chada") || 0);

  const totalExpense =
    driverCommision +
    roadCost +
    labourCost +
    parkingCost +
    guardCost +
    tollCost +
    feriCost +
    policeCost +
    chadaCost;

  useEffect(() => {
    const total =
      driverCommision +
      roadCost +
      labourCost +
      parkingCost +
      guardCost +
      tollCost +
      feriCost +
      policeCost +
      chadaCost;
    setValue("total_exp", total);
  }, [
    driverCommision,
    roadCost,
    labourCost,
    parkingCost,
    guardCost,
    tollCost,
    feriCost,
    policeCost,
    chadaCost,
    setValue,
  ]);

  // total cost
  useEffect(() => {
      const keys = [
        "fuelCost",
        "tollCost",
        "policeCost",
        "commission",
        "labour",
        "others",
        "damarageDay",
        "damarageRate",
      ];
const values = watchFields.reduce((acc, val, i) => {
      acc[keys[i]] = Number(val || 0);
      return acc;
    }, {});

    const total =
      values.fuelCost +
      values.tollCost +
      values.policeCost +
      values.commission +
      values.labour +
      values.others;

    const damarageTotal = values.damarageDay * values.damarageRate;

    methods.setValue("total", total);
    methods.setValue("damarageTotal", damarageTotal);
  }, [watchFields, methods]);

   const onSubmit = async (data) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/trip/${data.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      toast.success("Trip Added successfully!"); 
      navigate("/tramessy/tripList"); 
    } else {
      toast.error("Failed to Added the trip.");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong.");
  }
};

// select vehicle from api
const [vehicle, setVehicle] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const vehicleOptions = vehicle.map((vehicle) => ({
    value: vehicle.vehicle_name,
    label: vehicle.vehicle_name,
  }));
  // driver
  const [driver, setDriver] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDriver(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = driver.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
     mobile: driver.driver_mobile,
  }));

   // Driver name এর পরিবর্তন দেখুন
const selectedDriverName = useWatch({
  control,
  name: "driverName",
});

useEffect(() => {
  const selectedDriver = driverOptions.find(d => d.value === selectedDriverName);
  if (selectedDriver) {
    methods.setValue("driverMobile", selectedDriver.mobile || "");
  }
}, [selectedDriverName, driverOptions, methods]);

// select vendor Vehicle No. from api
  const [vendorVehicle, setVendorVehicle] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => response.json())
      .then((data) => setVendorVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);
  const vendorVehicleOptions = vendorVehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  }));

  // select own driver from api
  const [vendor, setVendorDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => response.json())
      .then((data) => setVendorDrivers(data.data))
      .catch((error) => console.error("Error fetching vendor data:", error));
  }, []);
  const vendorDriverOptions = vendor.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
    contact: dt.mobile,
  }));

   // select own driver from api
  const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);
  const ownDriverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
    contact: driver.driver_mobile,
  }));

// customer
  const [customer, setCustomer] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomer(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const customerOptions = customer.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
     mobile: customer.mobile,
  }));
   // Driver name এর পরিবর্তন দেখুন
const selectedCustomerName = useWatch({
  control,
  name: "customerName",
});

useEffect(() => {
  const selectedCustomer = customerOptions.find(d => d.value === selectedCustomerName);
  if (selectedCustomer) {
    methods.setValue("mobile", selectedCustomer.mobile || "");
  }
}, [selectedCustomerName, customerOptions, methods]);

  return (
    <FormProvider {...methods}>
      <Toaster/>
      <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen mt-10">
        {/* Header */}
        {/* <div className="bg-white px-4 py-3 flex items-center justify-between ">
          <h1 className="text-xl font-semibold text-gray-800">Trip Create</h1>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-primary hover:underline cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span>Trip Report</span>
          </div>
        </div> */}

        {/* Form Header */}
        <div className="bg-primary text-white px-4 py-2 rounded-t-md">
          <h2 className="text-lg font-medium">Trip Update Form</h2>
        </div>

        <div className="rounded-b-md shadow border border-gray-200">
          <div className="p-4 space-y-2">
          {/* Trip & Destination Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="text-orange-500 font-medium text-center mb-6">Trip & Destination Section!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputField name="date" label="Date" required icon={<span
                                  className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                                  onClick={() => registrationDateRef.current?.showPicker?.()}
                                >
                                  <FiCalendar className="text-white cursor-pointer" />
                                </span>} />
              <InputField name="tripTime" label="Trip Time" placeholder="Trip Time" />
              <InputField name="loadPoint" label="Load Point" placeholder="Load Point" />
              <InputField name="unloadPoint" label="Unload Point" placeholder="Unload Point" />
            </div>
          </div>

          {/* Vehicle & Driver Information */}
          <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="text-orange-500 font-medium text-center mb-6">Vehicle & Driver Information!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                      <SelectField
                        name="transport_type"
                        label="Transport Type"
                        required
                        options={[
                          { value: "own_transport", label: "Own Transport" },
                          {
                            value: "vendor_transport",
                            label: "Vendor Transport",
                          },
                        ]}
                      />
                      {/* vehicle no transportn based */}
              {selectedTransport === "own_transport" ? (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          required={true}
                          options={vehicleOptions}
                          control={control}
                        />
                      ) : selectedTransport === "vendor_transport" ? (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          required={true}
                          options={vendorVehicleOptions}
                          control={control}
                        />
                      ) : (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          defaultValue={"Please select transport first"}
                          required={true}
                          options={[
                            {
                              label: "Please select transport first",
                              value: "",
                              disabled: true,
                            },
                          ]}
                          control={control}
                        />
                      )}
                      {/* vehicle no transportn based */}
               {selectedTransport === "own_transport" ? (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={ownDriverOptions}
                          onSelectChange={(selectedOption) => {
                            setValue(
                              "driver_mobile",
                              selectedOption?.contact || ""
                            );
                          }}
                        />
                      ) : selectedTransport === "vendor_transport" ? (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={vendorDriverOptions}
                        />
                      ) : (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={[
                            {
                              label: "Please select transport first",
                              value: "",
                              disabled: true,
                            },
                          ]}
                        />
                      )}
              <InputField name="driverMobile" label="Driver Mobile" required />
              <InputField
                        name="total_rent"
                        label="Total Rent/Bill Amount"
                        type="number"
                        required
                      />
                      <InputField name="challan" label="Challan" required />
            </div>
          </div>
          {/* own transport */}
          {selectedTransport === "own_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="driver_adv"
                      label="Driver Advance"
                      required
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_commission"
                      label="Driver Commission"
                      required
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="labor"
                      label="Labour Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="fuelCost" label="Fuel Cost" />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="parking_cost"
                      label="Parking Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="night_guard"
                      label="Night Guard Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="toll_cost"
                      label="Toll Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="feri_cost"
                      label="Feri Cost"
                      type="number"
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="police_cost"
                      label="Police Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="chada" label="Chada" type="number" />
                  </div>

                  <div className="w-full">
                    <InputField
                      name="total_exp"
                      label="Total Expense"
                      readOnly
                      defaultValue={totalExpense}
                      value={totalExpense}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* vendor transport */}
            {selectedTransport === "vendor_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5 md:mt-3 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="trip_rent"
                    label="Trip Rent"
                    required
                    type="number"
                  />
                </div>
                <div className="w-full">
                  <InputField name="advance" label="Advance" required />
                </div>
                <div className="w-full">
                  <InputField name="due_amount" label="Due Amount" required />
                </div>
              </div>
            )}

          {/* Running Cost Section */}
          {/* <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="text-orange-500 font-medium text-center mb-6">Running Cost Section!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 mb-2">
              <InputField name="fuelCost" label="Fuel Cost" />
              <InputField name="tollCost" label="Toll Cost" />
              <InputField name="policeCost" label="Police Cost" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6">
              <InputField name="commission" label="Commission" />
              <InputField name="labour" label="Labour" />
              <InputField name="others" label="Others" />
              <InputField name="total" label="Total" readOnly />
            </div>
          </div> */}

          {/* Damage Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="text-orange-500 font-medium text-center mb-6">Damarage Section!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <InputField name="damarageDay" label="Damarage Day" />
              <InputField name="damarageRate" label="Damarage Rate" />
              <InputField name="damarageTotal" label="Damarage Total" readOnly />
            </div>
          </div>

          {/* Customer & Payment Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-4">
            <h3 className="text-orange-500 font-medium text-center mb-6">Customer & Payment Section!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <SelectField name="customerName" label="Customer Name" options={customerOptions} control={control} required />
              <InputField name="mobile" label="Customer Number" />
              <InputField name="rentAmount" label="Rent Amount" />
              <InputField name="advancePayment" label="Advance Payment" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <button type="submit" className="bg-slate-800 text-white px-8 py-2 rounded-md hover:bg-slate-700 transition-colors">
              Submit
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-4">
            <Menu className="h-6 w-6 text-gray-600" />
            <span className="text-gray-600">Home</span>
          </div>
          <div className="flex items-center space-x-2">
            <X className="h-5 w-5 text-gray-600" />
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
        </div>
      </form>
    </FormProvider>
  );
}
