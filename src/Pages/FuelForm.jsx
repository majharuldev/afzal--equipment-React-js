import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import { MdOutlineArrowDropDown } from "react-icons/md";
import Select from "react-select";
import BtnSubmit from "../components/Button/BtnSubmit";
import { useNavigate } from "react-router-dom";

const FuelForm = () => {
  const navigate = useNavigate()
  const fuelDateRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm();
  const quantity = parseFloat(watch("quantity") || 0);
  const price = parseFloat(watch("price") || 0);
  const total = quantity * price;

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicles(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.registration_number,
    label: vehicle.registration_number,
  }));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  const onSubmit = async (data) => {
    // console.log("add fuel data", data);
    data.total_price = total;
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const response = await axios.post(
        "${import.meta.env.VITE_BASE_URL}/api/fuel",
        formData
      );
      const resData = response.data;

      if (resData.status === "Success") {
        toast.success("Fuel saved successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/Fuel")
      } else {
        toast.error("Server Error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    }
  };

  return (
    <div className="mt-10">
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Fuel Form
      </h3>
      <div className="mx-auto p-6 rounded-b-md shadow border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Toaster position="top-center" reverseOrder={false} />
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Fueling Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("fueling_date", { required: true })}
                  ref={(e) => {
                    register("fueling_date").ref(e);
                    fuelDateRef.current = e;
                  }}
                  className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
                />
                {errors.fueling_date && (
                  <span className="text-red-600 text-sm">Required</span>
                )}
                <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                  <FiCalendar
                    className="text-white cursor-pointer"
                    onClick={() => fuelDateRef.current?.showPicker?.()}
                  />
                </span>
              </div>
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Vehicle Number
              </label>
              <Controller
                name="vehicle_number"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    inputRef={ref}
                    value={
                      vehicleOptions.find((c) => c.value === value) || null
                    }
                    onChange={(val) => onChange(val ? val.value : "")}
                    options={vehicleOptions}
                    placeholder="Select vehicle number..."
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    isClearable
                  />
                )}
              />
              {errors.vehicle_number && (
                <span className="text-red-600 text-sm">Required</span>
              )}
            </div>
          </div>
          {/*  */}
          <div className="mt-1 md:flex justify-between gap-3">
            <div className="mt-3 md:mt-0 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Driver Name
              </label>
              <Controller
                name="driver_name"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    inputRef={ref}
                    value={driverOptions.find((c) => c.value === value) || null}
                    onChange={(val) => onChange(val ? val.value : "")}
                    options={driverOptions}
                    placeholder="Select driver name..."
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    isClearable
                  />
                )}
              />
              {errors.driver_name && (
                <span className="text-red-600 text-sm">Required</span>
              )}
            </div>
            <div className="mt-3 md:mt-0 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Trip ID / Invoice Number
              </label>
              <input
                {...register("trip_id_invoice_no")}
                type="text"
                placeholder="Trip ID / Invoice Number..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
          {/*  */}
          <div className="mt-1 md:flex justify-between gap-3">
            <div className="mt-3 md:mt-0 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Pump Name & Address
              </label>
              <input
                {...register("pump_name_address", { required: true })}
                type="text"
                placeholder="Pump name and address..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {errors.pump_name_address && (
                <span className="text-red-600 text-sm">Required</span>
              )}
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Fuel Capacity
              </label>
              <input
                {...register("fuel_capacity")}
                type="number"
                placeholder="Fuel capacity..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
          {/*  */}
          <div className="mt-1 md:flex justify-between gap-3">
            <div className="relative mt-3 md:mt-0 w-full">
              <label className="text-primary text-sm font-semibold">
                Fuel Type
              </label>
              <select
                {...register("fuel_type", { required: true })}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Select fuel type</option>
                <option value="Octen">Octen</option>
                <option value="Gas">Gas</option>
                <option value="Petroll">Petroll</option>
                <option value="Diesel">Diesel</option>
              </select>
              {errors.type && (
                <span className="text-red-600 text-sm">Required</span>
              )}
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Quantity
              </label>
              <div className="relative">
                <input
                  {...register("quantity", { required: true })}
                  type="number"
                  placeholder="Fuel quantity..."
                  className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                />
                {errors.quantity && (
                  <span className="text-red-600 text-sm">Required</span>
                )}
              </div>
            </div>
          </div>
          {/*  */}
          <div className="mt-1 md:flex justify-between gap-3">
            <div className="mt-3 md:mt-0 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Price per Liter
              </label>
              <input
                {...register("price_per_liter", { required: true })}
                type="number"
                placeholder="Price per liter..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {errors.price && (
                <span className="text-red-600 text-sm">Required</span>
              )}
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Total Amount
              </label>
              <input
                readOnly
                {...register("total_amount", { required: true })}
                type="number"
                defaultValue={total}
                value={total}
                placeholder="Total amount..."
                className="cursor-not-allowed mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-gray-200 outline-none"
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="text-left">
            <BtnSubmit>Submit</BtnSubmit>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelForm;
