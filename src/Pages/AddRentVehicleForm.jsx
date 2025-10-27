// import axios from "axios";
// import { FormProvider, useForm } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import useRefId from "../hooks/useRef";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// const AddRentVehicleForm = () => {
//    const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const methods = useForm();
//   const { handleSubmit, reset } = methods;

//   const generateRefId = useRefId();
//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/rent/create`,
//         formData
//       );
//       const resData = response.data;
//       // console.log("resData", resData);
//       if (resData.status === "Success") {
//         toast.success("Rent vehicle saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/RentList")
//       } else {
//         toast.error("Server Error: " + (resData.message || "অজানা ত্রুটি"));
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server Error: " + errorMessage);
//     }finally {
//     setLoading(false); 
//   }
//   };

//   return (
//     <div className="mt-10">
//       <Toaster position="top-center" reverseOrder={false} />
//       <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
//         Rent Vehicle Information
//       </h3>
//       <div className="mx-auto p-6  rounded-b-md shadow border border-gray-300">
//         <FormProvider {...methods} className="">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
//             {/* Trip & Destination Section */}
//             <div className="border border-gray-300 p-3 md:p-5 rounded-md">
//               <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//                 <div className="mt-2 md:mt-0 w-full relative">
//                   <InputField
//                     name="vehicle_name_model"
//                     label="Vehicle Name/Model"
//                     required
//                   />
//                 </div>
//                 <div className="mt-2 md:mt-0 w-full relative">
//                   <InputField
//                     name="vendor_name"
//                     label="Vendor Name/Driver Name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="md:flex justify-between gap-3">
//                 <div className="w-full">
//                   <SelectField
//                     name="vehicle_category"
//                     label="Vehicle Category"
//                     required
//                     options={[
//                       { value: "", label: "Select Vehicle category..." },
//                       { value: "Pickup", label: "Pickup" },
//                       { value: "Covered Van", label: "Covered Van" },
//                       { value: "Open Truck", label: "Open Truck" },
//                     ]}
//                   />
//                 </div>
//                 <div className="w-full relative">
//                   <SelectField
//                     name="vehicle_size_capacity"
//                     label="Vehicle Size/Capacity"
//                     required
//                     options={[
//                       { value: "", label: "Select Vehicle size..." },
//                       { value: "4 Ton", label: "4 Ton" },
//                       { value: "3 Ton", label: "3 Ton" },
//                       { value: "22 Ton", label: "22 Ton" },
//                       { value: "7 Feet", label: "7 Feet" },
//                       { value: "9 Feet", label: "9 Feet" },
//                       { value: "12 Feet", label: "12 Feet" },
//                       { value: "14 Feet", label: "14 Feet" },
//                       { value: "16 Feet", label: "16 Feet" },
//                       { value: "18 Feet", label: "18 Feet" },
//                       { value: "20 Feet", label: "20 Feet" },
//                       { value: "23 Feet", label: "23 Feet" },
//                     ]}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Vehicle and Driver Info */}
//             <div className="border border-gray-300 p-5 rounded-md">
//               <h5 className="text-primary font-semibold text-center pb-5">
//                 <span className="py-2 border-b-2 border-primary">
//                   Transport Registration Number
//                 </span>
//               </h5>
//               <div className="md:flex justify-between gap-3">
//                 <div className="relative w-full">
//                   <InputField
//                     name="registration_number"
//                     label="Registration Number"
//                     required
//                   />
//                 </div>
//                 <div className="relative mt-2 md:mt-0 w-full">
//                   <SelectField
//                     name="registration_serial"
//                     label="Registration Serial"
//                     required
//                     options={[
//                       { value: "Ta", label: "Ta" },
//                       { value: "Tha", label: "Tha" },
//                       { value: "Da", label: "Da" },
//                       { value: "Dha", label: "Dha" },
//                       { value: "Na", label: "Na" },
//                       { value: "M", label: "M" },
//                       { value: "Sh", label: "Sh" },
//                     ]}
//                   />
//                 </div>
//                 <div className="w-full">
//                   <SelectField
//                     name="registration_zone"
//                     label="Registration Zone"
//                     required
//                     options={[
//                       { value: "", label: "Select zone..." },
//                       { value: "Dhaka Metro", label: "Dhaka Metro" },
//                       { value: "Chatto Metro", label: "Chatto Metro" },
//                       { value: "Sylhet Metro", label: "Sylhet Metro" },
//                       { value: "Rajshahi Metro", label: "Rajshahi Metro" },
//                       { value: "Khulna Metro", label: "Khulna Metro" },
//                       { value: "Rangpur Metro", label: "Rangpur Metro" },
//                       { value: "Barisal Metro", label: "Barisal Metro" },
//                       { value: "Dhaka", label: "Dhaka" },
//                       { value: "Narayanganj", label: "Narayanganj" },
//                       { value: "Gazipur", label: "Gazipur" },
//                       { value: "Tangail", label: "Tangail" },
//                       { value: "Manikgonj", label: "Manikgonj" },
//                       { value: "Munshigonj", label: "Munshigonj" },
//                       { value: "Faridpur", label: "Faridpur" },
//                       { value: "Rajbari", label: "Rajbari" },
//                       { value: "Narsingdi", label: "Narsingdi" },
//                       { value: "Kishorgonj", label: "Kishorgonj" },
//                       { value: "Shariatpur", label: "Shariatpur" },
//                       { value: "Gopalgonj", label: "Gopalgonj" },
//                       { value: "Madaripur", label: "Madaripur" },
//                       { value: "Chattogram", label: "Chattogram" },
//                       { value: "Cumilla", label: "Cumilla" },
//                       { value: "Feni", label: "Feni" },
//                       { value: "Brahmanbaria", label: "Brahmanbaria" },
//                       { value: "Noakhali", label: "Noakhali" },
//                       { value: "Chandpur", label: "Chandpur" },
//                       { value: "Lokkhipur", label: "Lokkhipur" },
//                       { value: "Bandarban", label: "Bandarban" },
//                       { value: "Rangamati", label: "Rangamati" },
//                       { value: "CoxsBazar", label: "CoxsBazar" },
//                       { value: "Khagrasori", label: "Khagrasori" },
//                       { value: "Barisal", label: "Barisal" },
//                       { value: "Barguna", label: "Barguna" },
//                       { value: "Bhola", label: "Bhola" },
//                       { value: "Patuakhali", label: "Patuakhali" },
//                       { value: "Pirojpur", label: "Pirojpur" },
//                       { value: "Jhalokati", label: "Jhalokati" },
//                       { value: "Khulna", label: "Khulna" },
//                       { value: "Kustia", label: "Kustia" },
//                       { value: "Jashore", label: "Jashore" },
//                       { value: "Chuadanga", label: "Chuadanga" },
//                       { value: "Satkhira", label: "Satkhira" },
//                       { value: "Bagerhat", label: "Bagerhat" },
//                       { value: "Meherpur", label: "Meherpur" },
//                       { value: "Jhenaidah", label: "Jhenaidah" },
//                       { value: "Norail", label: "Norail" },
//                       { value: "Magura", label: "Magura" },
//                       { value: "Rangpur", label: "Rangpur" },
//                       { value: "Ponchogor", label: "Ponchogor" },
//                       { value: "Thakurgaon", label: "Thakurgaon" },
//                       { value: "Kurigram", label: "Kurigram" },
//                       { value: "Dinajpur", label: "Dinajpur" },
//                       { value: "Nilfamari", label: "Nilfamari" },
//                       { value: "Lalmonirhat", label: "Lalmonirhat" },
//                       { value: "Gaibandha", label: "Gaibandha" },
//                       { value: "Rajshahi", label: "Rajshahi" },
//                       { value: "Pabna", label: "Pabna" },
//                       { value: "Bagura", label: "Bagura" },
//                       { value: "Joypurhat", label: "Joypurhat" },
//                       { value: "Nouga", label: "Nouga" },
//                       { value: "Natore", label: "Natore" },
//                       { value: "Sirajgonj", label: "Sirajgonj" },
//                       { value: "Chapainawabganj", label: "Chapainawabganj" },
//                       { value: "Sylhet", label: "Sylhet" },
//                       { value: "Habiganj", label: "Habiganj" },
//                       { value: "Moulvibazar", label: "Moulvibazar" },
//                       { value: "Sunamgonj", label: "Sunamgonj" },
//                       { value: "Mymensingh", label: "Mymensingh" },
//                       { value: "Netrokona", label: "Netrokona" },
//                       { value: "Jamalpur", label: "Jamalpur" },
//                       { value: "Sherpur", label: "Sherpur" },
//                     ]}
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="w-full">
//               <SelectField
//                 name="status"
//                 label="Status"
//                 required
//                 options={[
//                   { value: "Active", label: "Active" },
//                   { value: "Inactive", label: "Inactive" },
//                 ]}
//               />
//             </div>
//             {/* Submit Button */}
//             <div className="text-left">
//               <BtnSubmit loading={loading}>Submit</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default AddRentVehicleForm;

import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import useRefId from "../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../utils/axiosConfig";

const AddRentVehicleForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // id থাকলে update mode
  const methods = useForm();
  const { handleSubmit, reset, setValue } = methods;

  const generateRefId = useRefId();

  // Update mode → লোড existing data
  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/rentVehicle/${id}`)
        .then((res) => {
          const vehicle = res.data?.data;
          if (vehicle) {
            Object.keys(vehicle).forEach((key) => setValue(key, vehicle[key]));
          }
        })
        .catch((err) => {
          toast.error("গাড়ির তথ্য লোড করা যায়নি");
        })
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  // submit handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };

    // ref_id only generate if not in update mode
    if (!id) {
      payload.ref_id = generateRefId();
    }

      const response = id
        ? await api.put(`/rentVehicle/${id}`, payload)
        : await api.post(`/rentVehicle`, payload);

      const resData = response.data;

      if (resData.success) {
        toast.success(
          id ? "গাড়ির তথ্য সফলভাবে আপডেট হয়েছে!" : "গাড়ির তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/RentList");
      } else {
        toast.error("সার্ভার ত্রুটি: " + (resData.message || "অজানা ত্রুটি"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার ত্রুটি: " + errorMessage);
    }finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
        <h3 className=" pb-4 text-primary font-semibold ">
        {id ? "ভাড়া গাড়ির তথ্য আপডেট করুন" : "ভাড়া গাড়ির তথ্য যোগ করুন"}
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* গাড়ি এবং ভেন্ডর তথ্য */}
            <div className="border border-gray-300 p-3 md:p-5 rounded-md">
              <div className="md:flex justify-between gap-3">
                <div className="w-full mt-2 md:mt-0">
                  <InputField
                    name="vehicle_name_model"
                    label="গাড়ির নাম / মডেল"
                    required
                  />
                </div>
                <div className="w-full mt-2 md:mt-0">
                  <InputField
                    name="vendor_name"
                    label="ভেন্ডর/ড্রাইভারের নাম"
                    required
                  />
                </div>
              </div>

              <div className="md:flex justify-between gap-3 mt-3">
                <div className="w-full">
                  <SelectField
                    name="vehicle_category"
                    label="গাড়ির ধরণ"
                    required
                    options={[
                      { value: "", label: "গাড়ির ধরণ নির্বাচন করুন..." },
                      { value: "Pickup", label: "পিকআপ" },
                      { value: "Covered Van", label: "কাভার্ড ভ্যান" },
                      { value: "Open Truck", label: "ওপেন ট্রাক" },
                    ]}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="vehicle_size_capacity"
                    label="গাড়ির সাইজ/ক্ষমতা"
                    required
                    options={[
                      { value: "", label: "সাইজ নির্বাচন করুন..." },
                      { value: "4 Ton", label: "৪ টন" },
                      { value: "3 Ton", label: "৩ টন" },
                      { value: "22 Ton", label: "২২ টন" },
                      { value: "7 Feet", label: "৭ ফুট" },
                      { value: "9 Feet", label: "৯ ফুট" },
                      { value: "12 Feet", label: "১২ ফুট" },
                      { value: "14 Feet", label: "১৪ ফুট" },
                      { value: "16 Feet", label: "১৬ ফুট" },
                      { value: "18 Feet", label: "১৮ ফুট" },
                      { value: "20 Feet", label: "২০ ফুট" },
                      { value: "23 Feet", label: "২৩ ফুট" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* রেজিস্ট্রেশন তথ্য */}
            <div className="border border-gray-300 p-5 rounded-md mt-3">
              <h5 className="text-primary font-semibold text-center pb-5">
                <span className="py-2 border-b-2 border-primary">
                  গাড়ির রেজিস্ট্রেশন তথ্য
                </span>
              </h5>
              <div className="md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="registration_number"
                    label="রেজিস্ট্রেশন নাম্বার"
                    required
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="registration_serial"
                    label="রেজিস্ট্রেশন সিরিয়াল"
                    required
                    options={[
                  { value: "KA", label: "কা" },
                  { value: "KHA", label: "খা" },
                  { value: "GA", label: "গা" },
                  { value: "GHA", label: "ঘা" },
                  { value: "CHA", label: "চা" },
                  { value: "JA", label: "জা" },
                  { value: "JHA", label: "ঝা" },
                  { value: "TA", label: "টা" },
                  { value: "THA", label: "ঠা" },
                  { value: "DA", label: "ডা" },
                  { value: "DHA", label: "ঢা" },
                  { value: "NA", label: "না" },
                  { value: "PA", label: "পা" },
                  { value: "FA", label: "ফা" },
                  { value: "BA", label: "বা" },
                  { value: "MA", label: "মা" },
                  { value: "SHA", label: "শা" },
                  { value: "LA", label: "লা" },
                  { value: "RA", label: "রা" },
                  { value: "RO", label: "রো" },
                  { value: "HA", label: "হা" },
                ]}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="registration_zone"
                    label="রেজিস্ট্রেশন এলাকা"
                    required
                   options={[
                  { value: "", label: "জোন নির্বাচন করুন..." },
                  { value: "Dhaka Metro", label: "ঢাকা মেট্রো" },
                  { value: "Chatto Metro", label: "চট্টগ্রাম মেট্রো" },
                  { value: "Sylhet Metro", label: "সিলেট মেট্রো" },
                  { value: "Rajshahi Metro", label: "রাজশাহী মেট্রো" },
                  { value: "Khulna Metro", label: "খুলনা মেট্রো" },
                  { value: "Rangpur Metro", label: "রংপুর মেট্রো" },
                  { value: "Barisal Metro", label: "বরিশাল মেট্রো" },
                  { value: "Dhaka", label: "ঢাকা" },
                  { value: "Narayanganj", label: "নারায়ণগঞ্জ" },
                  { value: "Gazipur", label: "গাজীপুর" },
                  { value: "Tangail", label: "টাঙ্গাইল" },
                  { value: "Manikgonj", label: "মানিকগঞ্জ" },
                  { value: "Munshigonj", label: "মুন্সিগঞ্জ" },
                  { value: "Faridpur", label: "ফরিদপুর" },
                  { value: "Rajbari", label: "রাজবাড়ি" },
                  { value: "Narsingdi", label: "নরসিংদী" },
                  { value: "Kishorgonj", label: "কিশোরগঞ্জ" },
                  { value: "Shariatpur", label: "শরীয়তপুর" },
                  { value: "Gopalgonj", label: "গোপালগঞ্জ" },
                  { value: "Madaripur", label: "মাদারীপুর" },
                  { value: "Chattogram", label: "চট্টগ্রাম" },
                  { value: "Cumilla", label: "কুমিল্লা" },
                  { value: "Feni", label: "ফেনী" },
                  { value: "Brahmanbaria", label: "ব্রাহ্মণবাড়িয়া" },
                  { value: "Noakhali", label: "নোয়াখালী" },
                  { value: "Chandpur", label: "চাঁদপুর" },
                  { value: "Lokkhipur", label: "লক্ষ্মীপুর" },
                  { value: "Bandarban", label: "বান্দরবান" },
                  { value: "Rangamati", label: "রাঙ্গামাটি" },
                  { value: "CoxsBazar", label: "কক্সবাজার" },
                  { value: "Khagrasori", label: "খাগড়াছড়ি" },
                  { value: "Barisal", label: "বরিশাল" },
                  { value: "Barguna", label: "বরগুনা" },
                  { value: "Bhola", label: "ভোলা" },
                  { value: "Patuakhali", label: "পটুয়াখালী" },
                  { value: "Pirojpur", label: "পিরোজপুর" },
                  { value: "Jhalokati", label: "ঝালকাঠি" },
                  { value: "Khulna", label: "খুলনা" },
                  { value: "Kustia", label: "কুষ্টিয়া" },
                  { value: "Jashore", label: "যশোর" },
                  { value: "Chuadanga", label: "চুয়াডাঙ্গা" },
                  { value: "Satkhira", label: "সাতক্ষীরা" },
                  { value: "Bagerhat", label: "বাগেরহাট" },
                  { value: "Meherpur", label: "মেহেরপুর" },
                  { value: "Jhenaidah", label: "ঝিনাইদহ" },
                  { value: "Norail", label: "নড়াইল" },
                  { value: "Magura", label: "মাগুরা" },
                  { value: "Rangpur", label: "রংপুর" },
                  { value: "Ponchogor", label: "পঞ্চগড়" },
                  { value: "Thakurgaon", label: "ঠাকুরগাঁও" },
                  { value: "Kurigram", label: "কুড়িগ্রাম" },
                  { value: "Dinajpur", label: "দিনাজপুর" },
                  { value: "Nilfamari", label: "নীলফামারী" },
                  { value: "Lalmonirhat", label: "লালমনিরহাট" },
                  { value: "Gaibandha", label: "গাইবান্ধা" },
                  { value: "Rajshahi", label: "রাজশাহী" },
                  { value: "Pabna", label: "পাবনা" },
                  { value: "Bagura", label: "বগুড়া" },
                  { value: "Joypurhat", label: "জয়পুরহাট" },
                  { value: "Nouga", label: "নওগাঁ" },
                  { value: "Natore", label: "নাটোর" },
                  { value: "Sirajgonj", label: "সিরাজগঞ্জ" },
                  { value: "Chapainawabganj", label: "চাঁপাইনবাবগঞ্জ" },
                  { value: "Sylhet", label: "সিলেট" },
                  { value: "Habiganj", label: "হবিগঞ্জ" },
                  { value: "Moulvibazar", label: "মৌলভীবাজার" },
                  { value: "Sunamgonj", label: "সুনামগঞ্জ" },
                  { value: "Mymensingh", label: "ময়মনসিংহ" },
                  { value: "Netrokona", label: "নেত্রকোনা" },
                  { value: "Jamalpur", label: "জামালপুর" },
                  { value: "Sherpur", label: "শেরপুর" },
                ]}
                  />
                </div>
              </div>
            </div>

            <div className="w-[50%] mt-3">
              <SelectField
                name="status"
                label="অবস্থা"
                required
                options={[
                  { value: "Active", label: "সক্রিয়" },
                  { value: "Inactive", label: "নিষ্ক্রিয়" },
                ]}
              />
            </div>

            {/* Submit Button */}
            <div className="text-left mt-3">
              <BtnSubmit loading={loading}>
                {id ? "আপডেট করুন" : "সাবমিট করুন"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddRentVehicleForm;

