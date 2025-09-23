import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { useNavigate, useParams } from "react-router-dom";
import { InputField, SelectField } from "../components/Form/FormFields";

const FuelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // fuel update id

  const methods = useForm();
  const { handleSubmit, watch, reset, control } = methods;

  const quantity = parseFloat(watch("quantity") || 0);
  const price = parseFloat(watch("price_per_liter") || 0);
  const total = quantity * price;

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Vehicles fetch
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((res) => res.json())
      .then((data) => setVehicles(data.data))
      .catch((err) => console.error("গাড়ির ডেটা লোড করতে সমস্যা:", err));
  }, []);

  // Drivers fetch
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((res) => res.json())
      .then((data) => setDrivers(data.data))
      .catch((err) => console.error("ড্রাইভার ডেটা লোড করতে সমস্যা:", err));
  }, []);

  const vehicleOptions = vehicles.map((v) => ({ value: v.registration_number, label: v.registration_number }));
  const driverOptions = drivers.map((d) => ({ value: d.driver_name, label: d.driver_name }));

  // Fetch fuel data if updating
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/purchase/${id}`)
      .then((res) => {
        if (res.data.status === "Success") {
          const fuel = res.data.data;
          reset({
            fueling_date: fuel.fueling_date,
            vehicle_number: fuel.vehicle_number,
            driver_name: fuel.driver_name,
            trip_id_invoice_no: fuel.trip_id_invoice_no,
            pump_name_address: fuel.pump_name_address,
            fuel_capacity: fuel.fuel_capacity,
            fuel_type: fuel.fuel_type,
            quantity: fuel.quantity,
            price_per_liter: fuel.price_per_liter,
            total_amount: fuel.total_amount,
          });
        }
      })
      .catch(() => toast.error("ফুয়েল ডেটা লোড করতে সমস্যা হয়েছে"));
  }, [id, reset]);

  const onSubmit = async (data) => {
    data.total_amount = total;
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => formData.append(key, data[key]));

      const url = id
        ? `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/purchase/create`;

      const response = await axios.post(url, formData);

      if (response.data.status === "Success") {
        toast.success(`জ্বালানি ${id ? "আপডেট" : "সংরক্ষণ"} সফল হয়েছে!`, { position: "top-right" });
        navigate("/tramessy/Fuel");
      } else {
        toast.error("সার্ভার ত্রুটি: " + (response.data.message || "অজানা সমস্যা"));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার ত্রুটি: " + errorMessage);
    }
  };

  return (
    <div className="mt-10">
      
      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-200">
        <h3 className=" pb-4 text-primary font-semibold ">
        জ্বালানি ফর্ম ({id ? "আপডেট" : "নতুন"})
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Toaster position="top-center" reverseOrder={false} />

            {/* Fueling Date & Vehicle */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="fueling_date"
                  label="জ্বালানি দেওয়ার তারিখ"
                  type="date"
                  required
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="vehicle_number"
                  label="গাড়ির নম্বর"
                  options={vehicleOptions}
                  required
                  placeholder="গাড়ির নম্বর নির্বাচন করুন..."
                />
              </div>
            </div>

            {/* Driver & Trip ID */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="driver_name"
                  label="ড্রাইভারের নাম"
                  options={driverOptions}
                  required
                  placeholder="ড্রাইভারের নাম নির্বাচন করুন..."
                />
              </div>
              <div className="w-full">
                <InputField
                  name="trip_id_invoice_no"
                  label="ট্রিপ আইডি / ইনভয়েস নম্বর"
                  type="text"
                  placeholder="ট্রিপ আইডি / ইনভয়েস নম্বর..."
                />
              </div>
            </div>

            {/* Pump & Fuel Capacity */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="pump_name_address"
                  label="পাম্পের নাম ও ঠিকানা"
                  type="text"
                  required
                  placeholder="পাম্পের নাম ও ঠিকানা..."
                />
              </div>
              <div className="w-full">
                <InputField
                  name="fuel_capacity"
                  label="জ্বালানি ধারণক্ষমতা"
                  type="number"
                  placeholder="জ্বালানি ধারণক্ষমতা..."
                />
              </div>
            </div>

            {/* Fuel Type & Quantity */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="fuel_type"
                  label="জ্বালানির ধরন"
                  options={[
                    { value: "Octen", label: "অক্টেন" },
                    { value: "Gas", label: "গ্যাস" },
                    { value: "Petrol", label: "পেট্রোল" },
                    { value: "Diesel", label: "ডিজেল" },
                  ]}
                  required
                  placeholder="জ্বালানির ধরন নির্বাচন করুন..."
                />
              </div>
              <div className="w-full">
                <InputField
                  name="quantity"
                  label="পরিমাণ"
                  type="number"
                  placeholder="জ্বালানির পরিমাণ..."
                  required
                />
              </div>
            </div>

            {/* Price per liter & Total */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="price_per_liter"
                  label="লিটার প্রতি মূল্য"
                  type="number"
                  placeholder="লিটার প্রতি মূল্য..."
                  required
                />
              </div>
              <div className="w-full">
                <InputField
                  name="total_amount"
                  label="মোট Amount"
                  type="number"
                  value={total}
                  readOnly
                />
              </div>
            </div>

            <div className="text-left mt-4">
              <BtnSubmit>{id ? "আপডেট করুন" : "জমা দিন"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default FuelForm;
