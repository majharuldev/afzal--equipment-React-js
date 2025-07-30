import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useLoaderData, useNavigate } from "react-router-dom";
import Select from "react-select";
import BtnSubmit from "../../components/Button/BtnSubmit";

const UpdateFuelForm = () => {
  const navigate = useNavigate()
  //   update loader data
  const updateFuelLoaderData = useLoaderData();
  const {
    id,
    date_time,
    driver_name,
    vehicle_number,
    trip_id_invoice_no,
    pump_name_address,
    capacity,
    type,
    quantity,
    price,
    total_price,
  } = updateFuelLoaderData.data;

  const fuelDateRef = useRef(null);
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: {
      driver_name: driver_name || "",
      vehicle_number: vehicle_number || "",
    },
  });
  // calsulate total fuel price
  const fuelQuantity = parseFloat(watch("quantity") || 0);
  const fuelPrice = parseFloat(watch("price") || 0);
  const total = fuelQuantity * fuelPrice;
  // driver name
  const [drivers, setDrivers] = useState([]);
  // car name / registration number
  const [vehicles, setVehicles] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle`)
      .then((response) => response.json())
      .then((data) => setVehicles(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.registration_number,
    label: vehicle.registration_number,
  }));
  // driver name
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/fuel/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resData = response.data;

      if (resData.status === "success") {
        toast.success("Fuel updated successfully!", {
          position: "top-right",
        });
        navigate("/tramessy/Fuel")
      } else {
        toast.error("Server issue: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown issue";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-10">
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Fuel Information Update Form
      </h3>
      <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Toaster position="top-center" reverseOrder={false} />
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">Date</label>
              <div className="relative">
                <input
                  type="date"
                  defaultValue={date_time}
                  {...register("date_time")}
                  ref={(e) => {
                    register("date_time").ref(e);
                    fuelDateRef.current = e;
                  }}
                  className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
                />
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
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    inputRef={ref}
                    value={
                      vehicleOptions.find((c) => c.value === value) || null
                    }
                    onChange={(val) => onChange(val ? val.value : "")}
                    options={vehicleOptions}
                    placeholder={vehicle_number}
                    defaultValue={vehicle_number}
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    isClearable
                  />
                )}
              />
            </div>
          </div>
          {/*  */}
          <div className="mt-1 md:flex justify-between gap-3">
            <div className="mt-3 md:mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Driver Name
              </label>
              <Controller
                name="driver_name"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    inputRef={ref}
                    value={driverOptions.find((c) => c.value === value) || null}
                    onChange={(val) => onChange(val ? val.value : "")}
                    options={driverOptions}
                    placeholder={driver_name}
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    isClearable
                  />
                )}
              />
            </div>
            <div className="mt-3 md:mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Trip ID / Invoice Number
              </label>
              <input
                {...register("trip_id_invoice_no")}
                defaultValue={trip_id_invoice_no}
                type="text"
                placeholder="Trip ID / Invoice Number..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="mt-3 md:mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Pump Name & Address
              </label>
              <input
                {...register("pump_name_address")}
                defaultValue={pump_name_address}
                type="text"
                placeholder="Pump Name & Address..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Fuel Capacity
              </label>
              <input
                {...register("capacity")}
                defaultValue={capacity}
                type="number"
                placeholder="Fuel Capacity..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="mt-3 md:mt-1 w-full">
              <label className="text-primary text-sm font-semibold">
                Fuel Type
              </label>
              <select
                {...register("type")}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value={type}>{type}</option>
                <option value="Octen">Octen</option>
                <option value="Gas">Gas</option>
                <option value="Petroll">Petroll</option>
                <option value="Diesel">Diesel</option>
              </select>
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
            <div className="mt-1 w-full">
              <label className="text-primary text-sm font-semibold">
                Fuel Quantity
              </label>
              <div className="relative">
                <input
                  {...register("quantity")}
                  defaultValue={quantity}
                  type="number"
                  placeholder="Fuel Quantity..."
                  className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                />
              </div>
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="mt-3 md:mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Price per Liter
              </label>
              <input
                {...register("price")}
                defaultValue={price}
                type="number"
                placeholder="Price per Liter..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
            </div>
            <div className="mt-1 w-full relative">
              <label className="text-primary text-sm font-semibold">
                Total Price
              </label>
              <input
                readOnly
                {...register("total_price")}
                defaultValue={total_price}
                value={total}
                type="text"
                placeholder="Total Price..."
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

export default UpdateFuelForm;
