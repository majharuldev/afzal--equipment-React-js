import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useLoaderData } from "react-router-dom";
import Select from "react-select";
import BtnSubmit from "../../components/Button/BtnSubmit";

const UpdateCarForm = () => {
  //   update loader data
  const updateCarLoaderData = useLoaderData();
  const {
    id,
    vehicle_name,
    driver_name,
    category,
    size,
    registration_number,
    registration_serial,
    registration_zone,
    registration_date,
    text_date,
    road_permit_date,
    fitness_date,
    status,
  } = updateCarLoaderData.data;
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      driver_name: driver_name || "",
    },
  });
  const registrationDateRef = useRef(null);
  const taxDateRef = useRef(null);
  const roadPermitRef = useRef(null);
  const fitnessDateRef = useRef(null);
  // select driver
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch("https://api.tramessy.com/api/driver")
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.name,
    label: driver.name,
  }));

  const onSubmit = async (data) => {
    try {
      const response = await axios.put(
        `https://api.tramessy.com/api/vehicle/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resData = response.data;

      if (resData.status === "Vehicle updated successfully") {
        toast.success("Vehicle updated successfully!", {
          position: "top-right",
        });
      } else {
        toast.error("Server issue: " + (resData.message || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Vehicle Information
      </h3>
      <div className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4">
        {/* Vehicle & Driver Name */}
        <div className="md:flex justify-between gap-3">
          <div className="w-full">
            <label className="text-primary text-sm font-semibold">
              Vehicle Name
            </label>
            <input
              {...register("vehicle_name")}
              defaultValue={vehicle_name}
              type="text"
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            />
          </div>
          <div className="relative mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">
              Driver's Name
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
                  placeholder="Select Driver's Name..."
                  className="mt-1 text-sm"
                  classNamePrefix="react-select"
                  isClearable
                />
              )}
            />
          </div>
        </div>

        {/* Category & Size */}
        <div className="md:flex justify-between gap-3">
          <div className="relative w-full">
            <label className="text-primary text-sm font-semibold">
              Vehicle Type
            </label>
            <select
              {...register("category")}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value={category}>{category}</option>
              <option value="Truck">Truck</option>
              <option value="Pickup">Pickup</option>
              <option value="Covered Van">Covered Van</option>
              <option value="Trailer">Trailer</option>
              <option value="Fridge Van">Fridge Van</option>
              <option value="Car">Car</option>
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
          <div className="relative mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">
              Vehicle Size
            </label>
            <select
              {...register("size")}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value={size}>{size}</option>
              <option value="7 Feet">7 Feet</option>
              <option value="9 Feet">9 Feet</option>
              <option value="12 Feet">12 Feet</option>
              <option value="14 Feet">14 Feet</option>
              <option value="16 Feet">16 Feet</option>
              <option value="18 Feet">18 Feet</option>
              <option value="20 Feet">20 Feet</option>
              <option value="23 Feet">23 Feet</option>
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
        </div>

        {/* Registration Number & Serial */}
        <div className="md:flex justify-between gap-3">
          <div className="w-full">
            <label className="text-primary text-sm font-semibold">
              Registration Number
            </label>
            <input
              {...register("registration_number")}
              defaultValue={registration_number}
              type="text"
              placeholder="Registration Number..."
              className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
            />
          </div>
          <div className="relative mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">
              Registration Serial
            </label>
            <select
              {...register("registration_serial")}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value={registration_serial}>{registration_serial}</option>
              <option value="Ta">T</option>
              <option value="Tha">Th</option>
              <option value="Da">D</option>
              <option value="Dha">Dh</option>
              <option value="Na">N</option>
              <option value="M">M</option>
              <option value="Sh">Sh</option>
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
        </div>

        {/* Registration Zone */}
        <div className="md:flex justify-between gap-3">
          <div className="relative w-full">
            <label className="text-primary text-sm font-semibold">
              Registration Zone
            </label>
            <select
              {...register("registration_zone")}
              type="text"
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value={registration_zone}>{registration_zone}</option>
              <option value="Dhaka Metro">Dhaka Metro</option>
              <option value="Chatto Metro">Chattogram Metro</option>
              <option value="Sylhet Metro">Sylhet Metro</option>
              <option value="Rajshahi Metro">Rajshahi Metro</option>
              <option value="Khulna Metro">Khulna Metro</option>
              <option value="Rangpur Metro">Rangpur Metro</option>
              <option value="Barisal Metro">Barisal Metro</option>

              <option value="Dhaka">Dhaka</option>
              <option value="Narayanganj">Narayanganj</option>
              <option value="Gazipur">Gazipur</option>
              <option value="Tangail">Tangail</option>
              <option value="Manikgonj">Manikganj</option>
              <option value="Munshigonj">Munshiganj</option>
              <option value="Faridpur">Faridpur</option>
              <option value="Rajbari">Rajbari</option>
              <option value="Narsingdi">Narsingdi</option>
              <option value="Kishorgonj">Kishoreganj</option>
              <option value="Shariatpur">Shariatpur</option>
              <option value="Gopalgonj">Gopalganj</option>
              <option value="Madaripur">Madaripur</option>

              <option value="Chattogram">Chattogram</option>
              <option value="Cumilla">Cumilla</option>
              <option value="Feni">Feni</option>
              <option value="Brahmanbaria">Brahmanbaria</option>
              <option value="Noakhali">Noakhali</option>
              <option value="Chandpur">Chandpur</option>
              <option value="Lokkhipur">Lakshmipur</option>
              <option value="Bandarban">Bandarban</option>
              <option value="Rangamati">Rangamati</option>
              <option value="CoxsBazar">Cox's Bazar</option>
              <option value="Khagrasori">Khagrachari</option>

              <option value="Barisal">Barisal</option>
              <option value="Barguna">Barguna</option>
              <option value="Bhola">Bhola</option>
              <option value="Patuakhali">Patuakhali</option>
              <option value="Pirojpur">Pirojpur</option>
              <option value="Jhalokati">Jhalokati</option>

              <option value="Khulna">Khulna</option>
              <option value="Kustia">Kushtia</option>
              <option value="Jashore">Jessore</option>
              <option value="Chuadanga">Chuadanga</option>
              <option value="Satkhira">Satkhira</option>
              <option value="Bagerhat">Bagerhat</option>
              <option value="Meherpur">Meherpur</option>
              <option value="Jhenaidah">Jhenaidah</option>
              <option value="Norail">Narayal</option>
              <option value="Magura">Magura</option>

              <option value="Rangpur">Rangpur</option>
              <option value="Ponchogor">Panchagarh</option>
              <option value="Thakurgaon">Thakurgaon</option>
              <option value="Kurigram">Kurigram</option>
              <option value="Dinajpur">Dinajpur</option>
              <option value="Nilfamari">Nilphamari</option>
              <option value="Lalmonirhat">Lalmonirhat</option>
              <option value="Gaibandha">Gaibandha</option>

              <option value="Rajshahi">Rajshahi</option>
              <option value="Pabna">Pabna</option>
              <option value="Bagura">Bogura</option>
              <option value="Joypurhat">Joypurhat</option>
              <option value="Nouga">Naogaon</option>
              <option value="Natore">Natore</option>
              <option value="Sirajgonj">Sirajganj</option>
              <option value="Chapainawabganj">Chapainawabganj</option>

              <option value="Sylhet">Sylhet</option>
              <option value="Habiganj">Habiganj</option>
              <option value="Moulvibazar">Moulvibazar</option>
              <option value="Sunamgonj">Sunamganj</option>

              <option value="Mymensingh">Mymensingh</option>
              <option value="Netrokona">Netrokona</option>
              <option value="Jamalpur">Jamalpur</option>
              <option value="Sherpur">Sherpur</option>
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>

          <div className="relative w-full">
            <label className="text-primary text-sm font-semibold">
              Registration Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("registration_date")}
                defaultValue={registration_date}
                ref={(e) => {
                  register("registration_date").ref(e);
                  registrationDateRef.current = e;
                }}
                className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
              />
              <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                <FiCalendar
                  className="text-white cursor-pointer"
                  onClick={() => registrationDateRef.current?.showPicker?.()}
                />
              </span>
            </div>
          </div>

          <div className="mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">
              Tax Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("text_date")}
                defaultValue={text_date}
                ref={(e) => {
                  register("text_date").ref(e);
                  taxDateRef.current = e;
                }}
                className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
              />
              <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                <FiCalendar
                  className="text-white cursor-pointer"
                  onClick={() => taxDateRef.current?.showPicker?.()}
                />
              </span>
            </div>
          </div>
        </div>

        {/* Date Fields */}
        <div className="md:flex justify-between gap-3">
          <div className="w-full">
            <label className="text-primary text-sm font-semibold">
              Road Permit Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("road_permit_date")}
                defaultValue={road_permit_date}
                ref={(e) => {
                  register("road_permit_date").ref(e);
                  roadPermitRef.current = e;
                }}
                className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
              />
              <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                <FiCalendar
                  className="text-white cursor-pointer"
                  onClick={() => roadPermitRef.current?.showPicker?.()}
                />
              </span>
            </div>
          </div>
          <div className="mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">
              Fitness Expiry Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register("fitness_date")}
                defaultValue={fitness_date}
                ref={(e) => {
                  register("fitness_date").ref(e);
                  fitnessDateRef.current = e;
                }}
                className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
              />
              <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                <FiCalendar
                  className="text-white cursor-pointer"
                  onClick={() => fitnessDateRef.current?.showPicker?.()}
                />
              </span>
            </div>
          </div>
          <div className="mt-2 md:mt-0 w-full">
            <label className="text-primary text-sm font-semibold">Status</label>
            <select
              {...register("status")}
              className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
            >
              <option value={status}>{status}</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
          </div>
        </div>
        <div className="text-left">
          <BtnSubmit>Submit</BtnSubmit>
        </div>
      </div>
    </form>
  );
};

export default UpdateCarForm;
