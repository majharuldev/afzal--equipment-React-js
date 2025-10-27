
// import axios from "axios";
// import { useEffect, useRef, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import { FiCalendar } from "react-icons/fi";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import { useNavigate, useParams } from "react-router-dom";

// const VendorForm = () => {
//   const [loading, setLoading] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const navigate = useNavigate();
//   const { id } = useParams(); // URL থেকে vendorId নেবো
//   const dateRef = useRef(null);

//   const methods = useForm({
//   defaultValues: {
//     vendor_name: "",
//     opening_balance: "",
//     mobile: "",
//     email: "",
//     rent_category: "",
//     work_area: "",
//     date: "",
//     status: "",
//   },
// });
// const { handleSubmit, register, reset } = methods;

//   // বিদ্যমান ভেন্ডরের ডাটা লোড করা (Edit Mode)
//   useEffect(() => {
//     if (id) {
//       setIsEdit(true);
//       const fetchVendor = async () => {
//         try {
//           const response = await axios.get(
//             `${import.meta.env.VITE_BASE_URL}/api/vendor/show/${id}`
//           );
//           if (response.data) {
//             methods.reset(response.data.data);// ফর্মে ডাটা বসানো
//           }
//         } catch (error) {
//           // toast.error("ডাটা লোড করতে ব্যর্থ!");
//         }
//       };
//       fetchVendor();
//     }
//   }, [id, reset]);

//   // ফর্ম সাবমিট
//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }

//       let response;
//       if (isEdit) {
//         // Update vendor
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/vendor/update/${id}`,
//           formData
//         );
//       } else {
//         // Create vendor
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/vendor/create`,
//           formData
//         );
//       }

//       const resData = response.data;
//       if (resData.status === "Success") {
//         toast.success(
//           isEdit
//             ? "ভেন্ডর সফলভাবে আপডেট হয়েছে!"
//             : "ভেন্ডর সফলভাবে সংরক্ষণ করা হয়েছে!",
//           { position: "top-right" }
//         );
//         reset();
//         navigate("/tramessy/VendorList");
//       } else {
//         toast.error("সার্ভার ত্রুটি: " + (resData.message || "অজানা সমস্যা"));
//       }
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || error.message || "অজানা ত্রুটি";
//       toast.error("সার্ভার ত্রুটি: " + errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="">

//       <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
//         <h3 className=" pb-4 text-primary font-semibold ">
//           {isEdit ? "ভেন্ডর আপডেট ফর্ম" : "ভেন্ডর ফর্ম"}
//         </h3>
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Toaster position="top-center" reverseOrder={false} />
//             {/* Vendor Name + Opening Balance */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full relative">
//                 <InputField name="vendor_name" label="ভেন্ডরের নাম" required />
//               </div>
//                <div className="mt-3 md:mt-0 w-full relative">
//                 <InputField name="mobile" label="মোবাইল নম্বর" required />
//               </div>
//             </div>

//             {/* Mobile + Email */}
//             <div className="mt-1 md:flex justify-between gap-3">            
//               <div className="mt-3 md:mt-0 w-full relative">
//                 <InputField name="email" label="ইমেইল" />
//               </div>
//               <div className="w-full relative">
//                 <InputField
//                   type="number"
//                   name="opening_balance"
//                   label="শুরুর বাকি"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Rent Category + Work Area */}
//             <div className="mt-1 md:flex justify-between gap-3">
//               <div className="mt-3 md:mt-0 w-full relative">
//                 <SelectField
//                   name="rent_category"
//                   label="রেন্ট ক্যাটাগরি"
//                   required
//                   options={[
//                     { value: "", label: "ট্রান্সপোর্ট ভাড়া নির্বাচন করুন..." },
//                     { value: "Pickup", label: "পিকআপ" },
//                     { value: "Covered Van", label: "কাভার্ড ভ্যান" },
//                     { value: "Open Truck", label: "ওপেন ট্রাক" },
//                     { value: "Trailer", label: "ট্রেইলার" },
//                     { value: "Mini Truck", label: "মিনি ট্রাক" },
//                     { value: "Dump Truck", label: "ডাম্প ট্রাক" },
//                     { value: "Truck", label: "ট্রাক" },
//                     { value: "Tanker", label: "ট্যাংকার" },
//                     { value: "Fridge Van", label: "ফ্রিজ ভ্যান" },
//                     { value: "Cargo Van", label: "কার্গো ভ্যান" },
//                     { value: "Delivery Van", label: "ডেলিভারি ভ্যান" },
//                     { value: "Mini Van", label: "মিনি ভ্যান" },
//                     { value: "Bus", label: "বাস" },
//                     { value: "Micro Bus", label: "মাইক্রোবাস" },
//                     { value: "Car", label: "কার" },
//                     { value: "CNG", label: "সিএনজি" },
//                     { value: "Auto Rickshaw", label: "অটোরিকশা" },
//                     { value: "Bike", label: "বাইক" },
//                     { value: "Loader", label: "লোডার" },
//                     { value: "Crane", label: "ক্রেন" },
//                     { value: "Forklift", label: "ফর্কলিফট" },
//                     { value: "Excavator", label: "এক্সকাভেটর" },
//                     { value: "Bulldozer", label: "বুলডোজার" },
//                     { value: "Road Roller", label: "রোড রোলার" },
//                     { value: "Concrete Mixer", label: "কংক্রিট মিক্সার" },
//                     { value: "Generator", label: "জেনারেটর" },
//                     { value: "Compressor", label: "কম্প্রেসার" },
//                     { value: "Welding Machine", label: "ওয়েল্ডিং মেশিন" },
//                     { value: "Other", label: "অন্যান্য" }
//                   ]}
//                 />
//               </div>
//               <div className="w-full relative">
//                 <InputField name="work_area" label="কাজের এলাকা" />
//               </div>
//             </div>

//             {/* Date + Status */}
//             <div className="mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField
//                   name="date"
//                   label="তারিখ"
//                   type="date"
//                   required
//                   inputRef={(e) => {
//                     register("date").ref(e);
//                     dateRef.current = e;
//                   }}
//                   icon={
//                     <span
//                       className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
//                       onClick={() => dateRef.current?.showPicker?.()}
//                     >
//                       <FiCalendar className="text-white cursor-pointer" />
//                     </span>
//                   }
//                 />
//               </div>
//               <div className="w-full relative">
//                 <SelectField
//                   name="status"
//                   label="অবস্থা"
//                   required
//                   options={[
//                     { value: "", label: "অবস্থা নির্বাচন করুন..." },
//                     { value: "Active", label: "সক্রিয়" },
//                     { value: "Inactive", label: "নিষ্ক্রিয়" },
//                   ]}
//                 />
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="text-left">
//               <BtnSubmit loading={loading}>
//                 {isEdit ? "আপডেট করুন" : "জমা দিন"}
//               </BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default VendorForm;

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axiosConfig";

const AddVendorForm = () => {
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // URL থেকে vendorId নেবো
  const dateRef = useRef(null);

  const methods = useForm({
    defaultValues: {
      vendor_name: "",
      opening_balance: "",
      mobile: "",
      email: "",
      rent_category: "",
      work_area: "",
      date: "",
      status: "",
    },
  });
  const { handleSubmit, register, reset } = methods;

  // বিদ্যমান ভেন্ডরের ডাটা লোড করা (Edit Mode)
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      const fetchVendor = async () => {
        try {
          const response = await api.get(
            `/vendor/${id}`
          );
          if (response.data.success) {
            methods.reset(response.data.data); 
          }
        } catch (error) {
          toast.error("ডাটা লোড করতে ব্যর্থ হয়েছে!");
        }
      };
      fetchVendor();
    }
  }, [id, reset]);

  // ফর্ম সাবমিট
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // const formData = new FormData();
      // for (const key in data) {
      //   formData.append(key, data[key]);
      // }

      let response;
      if (isEdit) {
        // Update vendor
        response = await api.put(
          `/vendor/${id}`,
          data
        );
      } else {
        // Create vendor
        response = await api.post(
          `/vendor`,
          data
        );
      }

      const resData = response.data;
      if (resData.success) {
        toast.success(
          isEdit
            ? "ভেন্ডর সফলভাবে আপডেট হয়েছে!"
            : "ভেন্ডর সফলভাবে সংরক্ষণ করা হয়েছে!",
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/VendorList");
      } else {
        toast.error("সার্ভার ত্রুটি: " + (resData.message || "অজানা সমস্যা"));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার ত্রুটি: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
        <h3 className="pb-4 text-primary font-semibold ">
          {isEdit ? "ভেন্ডর আপডেট ফর্ম" : "ভেন্ডর ফর্ম"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Toaster position="top-center" reverseOrder={false} />

            {/* ভেন্ডরের নাম + মোবাইল */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="vendor_name" label="ভেন্ডরের নাম" required />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="mobile" label="মোবাইল নম্বর" required />
              </div>
            </div>

            {/* ইমেইল + শুরুর বাকি */}
            <div className="mt-1 md:flex justify-between gap-3">            
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="ইমেইল" />
              </div>
              <div className="w-full relative">
                <InputField
                  type="number"
                  name="opening_balance"
                  label="শুরুর বাকি"
                  required
                />
              </div>
            </div>

            {/* রেন্ট ক্যাটাগরি + কাজের এলাকা */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="mt-3 md:mt-0 w-full relative">
                <SelectField
                  name="rent_category"
                  label="রেন্ট ক্যাটাগরি"
                  required
                  options={[
                    { value: "", label: "ভাড়া নির্বাচন করুন..." },
                    { value: "Pickup", label: "পিকআপ" },
                    { value: "Covered Van", label: "কাভার্ড ভ্যান" },
                    { value: "Open Truck", label: "ওপেন ট্রাক" },
                    { value: "Trailer", label: "ট্রেইলার" },
                    { value: "Mini Truck", label: "মিনি ট্রাক" },
                    { value: "Dump Truck", label: "ডাম্প ট্রাক" },
                    { value: "Truck", label: "ট্রাক" },
                    { value: "Tanker", label: "ট্যাংকার" },
                    { value: "Fridge Van", label: "ফ্রিজ ভ্যান" },
                    { value: "Cargo Van", label: "কার্গো ভ্যান" },
                    { value: "Delivery Van", label: "ডেলিভারি ভ্যান" },
                    { value: "Mini Van", label: "মিনি ভ্যান" },
                    { value: "Bus", label: "বাস" },
                    { value: "Micro Bus", label: "মাইক্রোবাস" },
                    { value: "Car", label: "কার" },
                    { value: "CNG", label: "সিএনজি" },
                    { value: "Auto Rickshaw", label: "অটোরিকশা" },
                    { value: "Bike", label: "বাইক" },
                    { value: "Loader", label: "লোডার" },
                    { value: "Crane", label: "ক্রেন" },
                    { value: "Forklift", label: "ফর্কলিফট" },
                    { value: "Excavator", label: "এক্সকাভেটর" },
                    { value: "Bulldozer", label: "বুলডোজার" },
                    { value: "Road Roller", label: "রোড রোলার" },
                    { value: "Concrete Mixer", label: "কংক্রিট মিক্সার" },
                    { value: "Generator", label: "জেনারেটর" },
                    { value: "Compressor", label: "কম্প্রেসার" },
                    { value: "Welding Machine", label: "ওয়েল্ডিং মেশিন" },
                    { value: "Other", label: "অন্যান্য" },
                  ]}
                />
              </div>
              <div className="w-full relative">
                <InputField name="work_area" label="কাজের এলাকা" />
              </div>
            </div>

            {/* তারিখ + অবস্থা */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="তারিখ"
                  type="date"
                  required
                  inputRef={(e) => {
                    register("date").ref(e);
                    dateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => dateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required
                  options={[
                    { value: "", label: "অবস্থা নির্বাচন করুন..." },
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            {/* সাবমিট বাটন */}
            <div className="text-left mt-4">
              <BtnSubmit loading={loading}>
                {isEdit ? "আপডেট করুন" : "জমা দিন"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddVendorForm;

