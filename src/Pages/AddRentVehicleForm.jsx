
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
  // const [selectedEquipment, setSelectedEquipment] = useState("");

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
          toast.error("ইকুইপমেন্ট তথ্য লোড করা যায়নি");
        })
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  // equipment sizes options
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
          id ? "ইকুইপমেন্ট তথ্য সফলভাবে আপডেট হয়েছে!" : "ইকুইপমেন্ট তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
        <h3 className=" pb-4 text-primary font-semibold ">
          {id ? "ভাড়া ইকুইপমেন্ট তথ্য আপডেট করুন" : "ভাড়া ইকুইপমেন্ট তথ্য যোগ করুন"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* গাড়ি এবং ভেন্ডর তথ্য */}
            <div className="border border-gray-300 p-3 md:p-5 rounded-md">
              <div className="md:flex justify-between gap-3">
                <div className="w-full mt-2 md:mt-0">
                  <InputField
                    name="vehicle_name_model"
                    label="ইকুইপমেন্ট নাম / মডেল"
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
                      // { value: "Other", label: "অন্যান্য" }
                    ]}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="vehicle_size_capacity"
                    label="ইকুইপমেন্ট সাইজ/ক্ষমতা"
                    required
                    options={[
                      { value: "", label: "সাইজ নির্বাচন করুন..." },
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
                      { value: "0.2", label: "০.২" },
                      { value: "0.3", label: "০.৩" },
                      { value: "0.5", label: "০.৫" },
                      { value: "0.7", label: "০.৭" },
                      { value: "0.9", label: "০.৯" },
                      { value: "2kv", label: "২ কেভি" },
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
                      { value: "6m", label: "৬ মিটার" },
                      { value: "7m", label: "৭ মিটার" },
                      { value: "5m", label: "৫ মিটার" },
                      { value: "9m", label: "৯ মিটার" },
                    ]}

                  />
                </div>
              </div>
            </div>

            {/* রেজিস্ট্রেশন তথ্য */}
            <div className="border border-gray-300 p-5 rounded-md mt-3">
              <h5 className="text-primary font-semibold text-center pb-5">
                <span className="py-2 border-b-2 border-primary">
                 ইকুইপমেন্ট রেজিস্ট্রেশন তথ্য
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
                      { value: "KA", label: "ক" },
                      { value: "KHA", label: "খ" },
                      { value: "GA", label: "গ" },
                      { value: "GHA", label: "ঘ" },
                      { value: "CHA", label: "চ" },
                      { value: "JA", label: "জ" },
                      { value: "JHA", label: "ঝ" },
                      { value: "TA", label: "ট" },
                      { value: "THA", label: "ঠ" },
                      { value: "DA", label: "ড" },
                      { value: "DHA", label: "ঢ" },
                      { value: "NA", label: "ন" },
                      { value: "PA", label: "প" },
                      { value: "FA", label: "ফ" },
                      { value: "BA", label: "ব" },
                      { value: "MA", label: "ম" },
                      { value: "SHA", label: "শ" },
                      { value: "LA", label: "ল" },
                      { value: "RA", label: "র" },
                      // { value: "RO", label: "রো" },
                      { value: "HA", label: "হ" },
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

