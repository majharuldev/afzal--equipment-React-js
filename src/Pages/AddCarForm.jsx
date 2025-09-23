import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import useRefId from "../hooks/useRef";
import { useNavigate } from "react-router-dom";
const AddCarForm = () => {
  const [loading, setLoading] = useState(false);
  const methods = useForm();
  const { handleSubmit, register, reset, control, watch } = methods;
  const registrationDateRef = useRef(null);
  const taxDateRef = useRef(null);
  const roadPermitRef = useRef(null);
  const fitnessDateRef = useRef(null);
  const insuranceDateRef = useRef(null);
  const navigate = useNavigate();
  // select driver from api
  const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("ড্রাইভার ডাটা আনতে সমস্যা:", error));
  }, []);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  // select equipment size based on category
  const [selectedEquipment, setSelectedEquipment] = useState("");
  // ইকুইপমেন্ট অনুযায়ী সাইজ
  const equipmentSizes = {
    Exvator: [
      { value: "0.2", label: "০.২" },
      { value: "0.3", label: "০.৩" },
      { value: "0.5", label: "০.৫" },
      { value: "0.7", label: "০.৭" },
      { value: "0.9", label: "০.৯" },
      { value: "2kv", label: "২ কেভি" },
    ],
    "Concrete Mixer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Road Roller": [
      { value: "13", label: "১৩ টন" },
      { value: "14", label: "১৪ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "16", label: "১৬ টন" },
      { value: "17", label: "১৭ টন" },
      { value: "18", label: "১৮ টন" },
      { value: "19", label: "১৯ টন" },
      { value: "20", label: "২০ টন" },
      { value: "21", label: "২১ টন" },
      { value: "22", label: "২২ টন" },
      { value: "23", label: "২৩ টন" },
    ],
    Payloader: [
      { value: "6m", label: "৬ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Chain Dozer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Dump Truck": [
      { value: "120", label: "১২০ সিএফসি" },
      { value: "180", label: "১৮০ সিএফসি" },
      { value: "200", label: "২০০ সিএফসি" },
      { value: "250", label: "২৫০ সিএফসি" },
      { value: "300", label: "৩০০ সিএফসি" },
      { value: "400", label: "৪০০ সিএফসি" },
      { value: "500", label: "৫০০ সিএফসি" },
      { value: "550", label: "৫৫০ সিএফসি" },
      { value: "600", label: "৬০০ সিএফসি" },
      { value: "650", label: "৬৫০ সিএফসি" },
      { value: "700", label: "৭০০ সিএফসি" },
      { value: "750", label: "৭৫০ সিএফসি" },
      { value: "800", label: "৮০০ সিএফসি" },
      { value: "850", label: "৮৫০ সিএফসি" },
    ],
    Crane: [
      { value: "5", label: "৫ টন" },
      { value: "10", label: "১০ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "20", label: "২০ টন" },
      { value: "25", label: "২৫ টন" },
      { value: "50", label: "৫০ টন" },
      { value: "75", label: "৭৫ টন" },
      { value: "120", label: "১২০ টন" },
      { value: "150", label: "১৫০ টন" },
    ],
    Trailer: [
      { value: "20", label: "২০ ফিট" },
      { value: "40", label: "৪০ ফিট" },
    ],
  };

  // Equipment types & sizes
  const equipmentTypes = {
    Exvator: [
      { value: "short_boom", label: "শর্ট বুম" },
      { value: "long_boom", label: "লং বুম" },
    ],
    "Chain Dozer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Dump Truck": [
      { value: "6_caka", label: "৬ চাক" },
      { value: "10_caka", label: "১০ চাক" },
    ],
    Crane: [
      { value: "mobile_crane", label: "মোবাইল ক্রেন" },
      { value: "kawlar_crane", label: "ক্যাবলার ক্রেন" },
      { value: "truck_sound_crane", label: "ট্রাক সাউন্ড ক্রেন" },
    ],
    "Concrete Mixer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Road Roller": [
      { value: "13", label: "১৩ টন" },
      { value: "14", label: "১৪ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "16", label: "১৬ টন" },
      { value: "17", label: "১৭ টন" },
      { value: "18", label: "১৮ টন" },
      { value: "19", label: "১৯ টন" },
      { value: "20", label: "২০ টন" },
      { value: "21", label: "২১ টন" },
      { value: "22", label: "২২ টন" },
      { value: "23", label: "২৩ টন" },
    ],
    Payloader: [
      { value: "6m", label: "৬ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    Trailer: [
      { value: "20", label: "২০ ফিট" },
      { value: "40", label: "৪০ ফিট" },
    ],
  };


  // নির্বাচিত category ট্র্যাক
  const selectedCategory = watch("vehicle_category");

  // category পরিবর্তন হলে state আপডেট হবে
  useEffect(() => {
    if (selectedCategory) {
      setSelectedEquipment(selectedCategory);
    }
  }, [selectedCategory]);
  // post vehicle
  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    setLoading(true);
    // console.log("add car data", data);
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", generateRefId());
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/create`,
        formData
      );
      const resData = response.data;
      // console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("গাড়ির তথ্য সফলভাবে সংরক্ষিত হয়েছে!", { position: "top-right" });
        reset();
        navigate("/tramessy/vehicel")
      } else {
        toast.error("সার্ভার ত্রুটি: " + (resData.message || "অজানা ত্রুটি"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার ত্রুটি:" + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods} className="">
      <form onSubmit={handleSubmit(onSubmit)} className="">
        <Toaster position="top-center" reverseOrder={false} />

        <div className="mx-auto p-6 rounded-t-md rounded-b-md shadow border border-gray-200 ">
          <h3 className="pb-3 text-primary font-semibold text-lg">
            ইকুইপমেন্ট তথ্য যোগ করুন
          </h3>
          {/* Vehicle & Driver Name */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="vehicle_name" label="গাড়ির নাম" required />
            </div>
            <div className="relative mt-2 md:mt-0 w-full">
              <SelectField
                name="driver_name"
                // label="ড্রাইভারের নাম"
                label="অপারেটরের নাম"
                required={true}
                options={driverOptions}
                control={control}
              />
            </div>
          </div>

          {/* Category & Size */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <SelectField
                name="vehicle_category"
                label="ইকুইপমেন্টের ধরণ"
                required
                options={[
                  { value: "", label: "ইকুইপমেন্টের ধরণ নির্বাচন করুন..." },
                  { value: "Exvator", label: "এক্সভেটর" },
                  { value: "Concrete Mixer", label: "কংক্রিট মিক্সার" },
                  { value: "Road Roller", label: "রোলার" },
                  { value: "Payloader", label: "পে-লোডার" },
                  { value: "Chain Dozer", label: "চেইন ডোজার" },
                  { value: "Dump Truck", label: "ডাম্প ট্রাক" },
                  { value: "Crane", label: "ক্রেন" },
                  { value: "Trailer", label: "ট্রেইলার" },
                  { value: "Other", label: "অন্যান্য" }
                ]}
                control={control}
              />
            </div>
            <div className="relative mt-2 md:mt-0 w-full">
              {/* ইকুইপমেন্ট অনুযায়ী সাইজ */}
              <SelectField
                name="equipment_type"
                label="ইকুইপমেন্টের টাইপ"
                required={false}
                options={equipmentTypes[selectedCategory] || []}
                control={control}
              />
            </div>

            <div className="relative mt-2 md:mt-0 w-full">
              {/* ইকুইপমেন্ট অনুযায়ী সাইজ */}
              <SelectField
                name="equipment_size"
                label="ইকুইপমেন্টের সাইজ/ক্ষমতা"
                required
                options={equipmentSizes[selectedEquipment] || []}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField name="fuel_capacity" label="ফুয়েল ধারণক্ষমতা" required />
            </div>
          </div>

          {/* Registration Number & Serial */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="registration_number"
                label="রেজিস্ট্রেশন নাম্বার"
                required
              />
            </div>
            <div className="mt-2 md:mt-0 w-full">
              <SelectField
                name="registration_serial"
                label="রেজিস্ট্রেশন সিরিয়াল"
                required
                options={[
                  { value: "Ta", label: "Ta" },
                  { value: "Tha", label: "Tha" },
                  { value: "Da", label: "Da" },
                  { value: "Dha", label: "Dha" },
                  { value: "Na", label: "Na" },
                  { value: "M", label: "M" },
                  { value: "Sh", label: "Sh" },
                ]}
              />
            </div>
            <div className="relative w-full">
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

          {/* Registration Zone */}
          <div className="md:flex justify-between gap-3">
            {/* Registration Date */}
            <div className="relative w-full">
              <InputField
                name="registration_date"
                label="রেজিস্ট্রেশন তারিখ"
                type="date"
                required
                inputRef={(e) => {
                  register("registration_date").ref(e);
                  registrationDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => registrationDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>

            {/* Tax Expiry Date */}
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="tax_date"
                label="ট্যাক্সের মেয়াদ শেষের তারিখ"
                type="date"
                required
                inputRef={(e) => {
                  register("tax_date").ref(e);
                  taxDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => taxDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <InputField
                name="road_permit_date"
                label="রোড পারমিট তারিখ"
                type="date"
                required
                inputRef={(e) => {
                  register("road_permit_date").ref(e);
                  roadPermitRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => roadPermitRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
              <label className="text-primary text-sm font-semibold"></label>
            </div>
          </div>

          {/* Road Permit & Fitness Date & Status */}
          <div className="md:flex justify-between gap-3">
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="fitness_date"
                label="ফিটনেস মেয়াদ শেষের তারিখ"
                type="date"
                required
                inputRef={(e) => {
                  register("fitness_date").ref(e);
                  fitnessDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => fitnessDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="mt-2 md:mt-0 w-full">
              <InputField
                name="insurance_date"
                label="ইন্সুরেন্স মেয়াদ শেষের তারিখ"
                type="date"
                required
                inputRef={(e) => {
                  register("insurance_date").ref(e);
                  insuranceDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => insuranceDateRef.current?.showPicker?.()}
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
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
          </div>

          <div className="text-left">
            <BtnSubmit loading={loading}>সাবমিট করুন</BtnSubmit>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddCarForm;
