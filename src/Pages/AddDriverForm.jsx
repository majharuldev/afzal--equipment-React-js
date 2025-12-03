// import { useRef, useState } from "react";
// import { Controller, FormProvider, useForm } from "react-hook-form";
// import "react-datepicker/dist/react-datepicker.css";
// import { IoMdClose } from "react-icons/io";
// import { FiCalendar } from "react-icons/fi";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import { useNavigate } from "react-router-dom";

// const AddDriverForm = () => {
//   const [loading, setLoading] = useState(false)
//   const methods = useForm();
//   const { handleSubmit, register, reset, control } = methods;
//   const [previewImage, setPreviewImage] = useState(null);
//   const driverDateRef = useRef(null);
//   const navigate = useNavigate();
//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       for (const key in data) {
//         if (data[key] !== undefined && data[key] !== null) {
//           formData.append(key, data[key]);
//         }
//       }
//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/driver/create`,
//         formData
//       );
//       const resData = response.data;
//       // console.log("resData", resData);
//       if (resData.status === "Success") {
//         toast.success("Driver saved successfully", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/HR/HRM/DriverList")
//       } else {
//         toast.error("Server issue: " + (resData.message || "Unknown issue"));
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server issue: " + errorMessage);
//     }finally {
//     setLoading(false); 
//   }
//   };

//   return (
//     <div className="">
//       <Toaster />
      
//       <div className="mx-auto p-6  rounded-md border border-gray-200 shadow">
//         <h3 className=" pb-4 text-primary font-semibold ">
//         Create Driver
//       </h3>
//         <FormProvider {...methods} className="">
//           <form onSubmit={handleSubmit(onSubmit)} className="">
//             {/* Name & Contact */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="driver_name" label="Driver Name" required />
//               </div>
//               <div className="mt-2 md:mt-0 w-full">
//                 <InputField
//                   name="driver_mobile"
//                   label="Driver Mobile"
//                   required
//                 />
//               </div>
//             </div>

//             {/* NID & Emergency Contact */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="address" label="Address" required />
//               </div>
//               <div className="mt-2 md:mt-0 w-full">
//                 <InputField
//                   name="emergency_contact"
//                   label="Emergency Contact"
//                 />
//               </div>
//             </div>

//             {/* Address & Note */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="nid" label="NID Number" required />
//               </div>
//               <div className="mt-2 md:mt-0 w-full">
//                 <InputField name="license" label="License No" required />
//               </div>
//             </div>

//             {/* License & Expiry */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField
//                   name="license_expire_date"
//                   label="License Expiry Date"
//                   type="date"
//                   required
//                   inputRef={(e) => {
//                     register("license_expire_date").ref(e);
//                     driverDateRef.current = e;
//                   }}
//                   icon={
//                     <span
//                       className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
//                       onClick={() => driverDateRef.current?.showPicker?.()}
//                     >
//                       <FiCalendar className="text-white cursor-pointer" />
//                     </span>
//                   }
//                 />
//               </div>
//               <div className="mt-2 md:mt-0 w-full relative">
//                 <InputField name="note" label="Note" />
//               </div>
//             </div>

//             {/* Status & License Image */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="opening_balance" label="Opening Balance" required />
//               </div>
//               <div className="w-full relative">
//                 <SelectField
//                   name="status"
//                   label="Status"
//                   required
//                   options={[
//                     { value: "Active", label: "Active" },
//                     { value: "Inactive", label: "Inactive" },
//                   ]}
//                 />
//               </div>
//             </div>
// <div className="grid grid-cols-2 gap-3">
//   <div className="mt-3 md:mt-0 w-full">
//                 <label className="text-primary text-sm font-semibold">
//                   Upload License Image <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Controller
//                     name="license_image"
//                     control={control}
//                     rules={{ required: "This field is required" }}
//                     render={({
//                       field: { onChange, ref },
//                       fieldState: { error },
//                     }) => (
//                       <div className="relative">
//                         <label
//                           htmlFor="license_image"
//                           className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
//                         >
//                           {previewImage ? "Image selected" : "Choose image"}
//                         </label>
//                         <input
//                           id="license_image"
//                           type="file"
//                           accept="image/*"
//                           ref={ref}
//                           className="hidden"
//                           onChange={(e) => {
//                             const file = e.target.files[0];
//                             if (file) {
//                               const url = URL.createObjectURL(file);
//                               setPreviewImage(url);
//                               onChange(file);
//                             } else {
//                               setPreviewImage(null);
//                               onChange(null);
//                             }
//                           }}
//                         />
//                         {error && (
//                           <span className="text-red-600 text-sm">
//                             {error.message}
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   />
//                 </div>
//               </div>
// </div>
//             {/* Preview */}
//             {previewImage && (
//               <div className="mt-3 relative flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setPreviewImage(null);
//                     document.getElementById("license_image").value = "";
//                   }}
//                   className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
//                   title="Remove image"
//                 >
//                   <IoMdClose />
//                 </button>
//                 <img
//                   src={previewImage}
//                   alt="License Preview"
//                   className="max-w-xs h-auto rounded border border-gray-300"
//                 />
//               </div>
//             )}

//             <div className="mt-6 text-left">
//               <BtnSubmit loading={loading}>Submit</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default AddDriverForm;


import { useRef, useState, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig";

const DriverForm = () => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const driverDateRef = useRef(null);

  const methods = useForm();
  const { handleSubmit, register, reset, control, setValue } = methods;

  const navigate = useNavigate();
  const { id } = useParams(); // যদি URL এ id থাকে → update mode

  // Update mode হলে ডেটা লোড করা
  useEffect(() => {
    if (id) {
      api
        .get(`/driver/${id}`)
        .then((res) => {
            const driver = res.data;
            setInitialData(driver);
            reset(driver); // form fields set
            // if (driver.license_image) setPreviewImage(driver.license_image);
        })
        .catch((err) => {
          console.error(err);
          toast.error("ড্রাইভারের তথ্য লোড করার সময় সমস্যা হয়েছে");
        });
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // const formData = new FormData();
      // for (const key in data) {
      //   if (data[key] !== undefined && data[key] !== null) {
      //     formData.append(key, data[key]);
      //   }
      // }

      let response;
      if (id) {
        response = await api.put(
          `/driver/${id}`,
          data
        );
      } else {
        response = await api.post(
          `/driver`,
          data
        );
      }

      const resData = response.data;
        toast.success(id ? "ড্রাইভার সফলভাবে আপডেট হয়েছে" : "ড্রাইভার সফলভাবে যোগ হয়েছে");
        reset();
        navigate("/tramessy/HR/DriverList");
    } catch (error) {
      console.error(error);
      toast.error("সার্ভার সমস্যা: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <div className="mx-auto p-6 rounded-md border border-gray-200 shadow">
        <h3 className="pb-4 text-primary font-semibold">
          {id ? "ড্রাইভার আপডেট করুন" : "ড্রাইভার তৈরি করুন"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* নাম ও মোবাইল */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="driver_name" label="ড্রাইভারের নাম" required={!id} />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="driver_mobile" label="ড্রাইভারের মোবাইল" required={!id} />
              </div>
            </div>

            {/* ঠিকানা ও জরুরি যোগাযোগ */}
            <div className="md:flex justify-between gap-3 mt-3">
              <div className="w-full">
                <InputField name="address" label="ঠিকানা" required={!id} />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="emergency_contact" label="জরুরি যোগাযোগ" />
              </div>
            </div>

            {/* NID & লাইসেন্স */}
            <div className="md:flex justify-between gap-3 mt-3">
              <div className="w-full">
                <InputField name="nid" label="এনআইডি নম্বর" required={!id} />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="lincense" label="লাইসেন্স নম্বর" required={!id} />
              </div>
            </div>

            {/* লাইসেন্স মেয়াদ শেষ ও নোট */}
            <div className="md:flex justify-between gap-3 mt-3">
              <div className="w-full">
                <InputField
                  name="expire_date"
                  label="লাইসেন্স মেয়াদ শেষ"
                  type="date"
                  required={!id}
                  inputRef={(e) => {
                    register("expire_date").ref(e);
                    driverDateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => driverDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="mt-2 md:mt-0 w-full relative">
                <InputField name="note" label="নোট" />
              </div>
            </div>

            {/* স্ট্যাটাস ও ওপেনিং ব্যালান্স */}
            <div className="md:flex justify-between gap-3 mt-3">
              <div className="w-full">
                <InputField name="opening_balance" label="ওপেনিং ব্যালান্স" required={!id} />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="স্ট্যাটাস"
                  required={!id}
                  options={[
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            {/* লাইসেন্স ইমেজ */}
            {/* <div className="mt-3 w-[50%]">
              <label className="text-gray-700 text-sm font-medium">
                লাইসেন্স ইমেজ আপলোড <span className="text-red-500">*</span>
              </label>
              <Controller
                name="license_image"
                control={control}
                rules={{ required: !id }}
                render={({ field: { onChange, ref }, fieldState: { error } }) => (
                  <div className="relative mt-1">
                    <label
                      htmlFor="license_image"
                      className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                    >
                      {previewImage ? "ইমেজ সিলেক্টেড" : "Choose image"}
                    </label>
                    <input
                      id="license_image"
                      type="file"
                      accept="image/*"
                      ref={ref}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setPreviewImage(url);
                          onChange(file);
                        } else {
                          setPreviewImage(null);
                          onChange(null);
                        }
                      }}
                    />
                    {error && <span className="text-red-600 text-sm">{error.message}</span>}
                  </div>
                )}
              />
            </div> */}

            {/* প্রিভিউ */}
            {/* {previewImage && (
              <div className="mt-3 relative flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    document.getElementById("license_image").value = "";
                  }}
                  className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                  title="Remove image"
                >
                  <IoMdClose />
                </button>
                <img
                  src={previewImage}
                  alt="লাইসেন্স প্রিভিউ"
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )} */}

            <div className="mt-6 text-left">
              <BtnSubmit loading={loading}>{id ? "আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default DriverForm;
