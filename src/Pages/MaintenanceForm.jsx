import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdOutlineArrowDropDown } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import Select from "react-select";
import BtnSubmit from "../components/Button/BtnSubmit";
import { useNavigate } from "react-router-dom";
const MaintenanceForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const [previewImage, setPreviewImage] = useState(null);
  const maintenanceDateRef = useRef(null);
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
  // select driver
  const [drivers, setDrivers] = useState([]);
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

  // post data on server
  const onSubmit = async (data) => {
    // console.log("add car data", data);
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/maintenance`,
        formData
      );
      const resData = response.data;
      // console.log("resData", resData);
      if (resData.status === "success") {
        toast.success("Info saved successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/Maintenance")
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
    <div className="mt-10">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Maintenance Form
      </h3>
      <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Maintenance Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("date", { required: true })}
                  ref={(e) => {
                    register("date").ref(e);
                    maintenanceDateRef.current = e;
                  }}
                  className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
                />
                {errors.date && (
                  <span className="text-red-600 text-sm">
                    This field is required
                  </span>
                )}
                <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                  <FiCalendar
                    className="text-white cursor-pointer"
                    onClick={() => maintenanceDateRef.current?.showPicker?.()}
                  />
                </span>
              </div>
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Service Type
              </label>
              <select
                {...register("service_type", { required: true })}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Service Type</option>
                <option value="Maintenance">Maintenance</option>
                <option value="General">General</option>
              </select>
              {errors.service_type && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>
          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Parts and Spares
              </label>
              <select
                {...register("parts_and_spairs", { require: true })}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Parts and Spares</option>
                <option value="EngineOil">Engine Oil</option>
                <option value="Pistons">Pistons</option>
                <option value="ABS_Sensors">ABS Sensors</option>
                <option value="BrakeDrum">Brake Drum</option>
              </select>
              {errors.parts_and_spairs && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Maintenance Type
              </label>
              <select
                {...register("maintenance_type", { required: true })}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Maintenance Type</option>
                <option value="EngineOil">Engine Oil</option>
                <option value="Pistons">Pistons</option>
                <option value="ABS_Sensors">ABS Sensors</option>
                <option value="BrakeDrum">Brake Drum</option>
              </select>
              {errors.maintenance_type && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
          </div>

          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">Cost</label>
              <input
                {...register("cost", { required: true })}
                type="number"
                placeholder="Cost ..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {errors.cost && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
            </div>
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Vehicle Number
              </label>
              <Controller
                name="vehicle_no"
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
                    placeholder="Select Vehicle Number..."
                    className="mt-1 text-sm"
                    classNamePrefix="react-select"
                    isClearable
                  />
                )}
              />
              {errors.vehicle_number && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}

              {errors.vehicle_no && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
            </div>
          </div>

          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Charged By
              </label>
              <input
                {...register("cost_by", { required: true })}
                type="text"
                placeholder="Charged By..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {errors.cost_by && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
            </div>
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Total Cost
              </label>
              <input
                {...register("total_cost", { required: true })}
                type="number"
                placeholder="Total Cost..."
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
              />
              {errors.total_cost && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
            </div>
          </div>

          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Priority
              </label>
              <select
                {...register("dignifies", { required: true })}
                className="mt-1 w-full text-gray-500 text-sm border border-gray-300 bg-white p-2 rounded appearance-none outline-none"
              >
                <option value="">Priority...</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              {errors.dignifies && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
              <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
            </div>
            <div className="w-full relative">
              <label className="text-primary text-sm font-semibold">
                Service For
              </label>
              <Controller
                name="service_for"
                control={control}
                rules={{ required: true }}
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
              {errors.service_for && (
                <span className="text-red-600 text-sm">
                  This field is required
                </span>
              )}
            </div>
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Cash Memo / Receipt Image
              </label>
              <div className="relative mt-1">
                <Controller
                  name="receipt"
                  control={control}
                  rules={{ required: "This field is required" }}
                  render={({
                    field: { onChange, ref },
                    fieldState: { error },
                  }) => (
                    <div className="relative mt-1">
                      <label
                        htmlFor="receipt"
                        className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                      >
                        {previewImage ? "Image Selected" : "Choose Image"}
                      </label>
                      <input
                        id="receipt"
                        type="file"
                        accept="image/*"
                        ref={ref}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setPreviewImage(url);
                            onChange(file); // ✅ Very important: update form field
                          } else {
                            setPreviewImage(null);
                            onChange(null);
                          }
                        }}
                      />
                      {error && (
                        <span className="text-red-600 text-sm">
                          {error.message}
                        </span>
                      )}
                    </div>
                  )}
                />
              </div>
              {/* 🖼️ Image preview below file input */}
              {previewImage && (
                <div className="mt-3 relative flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setValue("receipt", null, { shouldValidate: true });
                    }}
                    className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                    title="Remove image"
                  >
                    <IoMdClose />
                  </button>
                  <img
                    src={previewImage}
                    alt="Receipt Preview"
                    className="max-w-xs h-auto rounded border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <BtnSubmit>Submit</BtnSubmit>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
