// import React, { useRef, useState } from "react";

// import { FormProvider, useForm } from "react-hook-form";
// import { InputField } from "../../../components/Form/FormFields";
// import BtnSubmit from "../../../components/Button/BtnSubmit";
// import { FiCalendar } from "react-icons/fi";
// import toast, { Toaster } from "react-hot-toast";
// import useRefId from "../../../hooks/useRef";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const OfficeForm = () => {
//     const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const methods = useForm();
//   const { handleSubmit, register, reset } = methods;
//   const dateRef = useRef(null);
//   const generateRefId = useRefId();
//   const onSubmit = async (data) => {
//     // console.log("add fuel data", data);
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/office/create`,
//         formData
//       );
//       const resData = response.data;
//       if (resData.status === "Success") {
//         toast.success("Office info saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//         navigate("/tramessy/HR/HRM/Office")
//       } else {
//         toast.error("Server Error: " + (resData.message || "Unknown issue"));
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
//         Office Form
//       </h3>
//       <FormProvider {...methods} className="">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="space-y-3 mx-auto rounded-md shadow"
//         >
//           {/* Trip & Destination Section */}
//           <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField
//                   name="date"
//                   label="Date"
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
//               <div className="w-full">
//                 <InputField name="branch_name" label="Branch Name" required />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="factory_name"
//                   label="Factory / Company Name"
//                   required
//                 />
//               </div>
//             </div>
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField type="number" name="opening_balance" label="Opening Balance" required />
//               </div>
//               <div className="w-full">
//                 <InputField name="address" label="Address" required />
//               </div>
//             </div>
//             {/* Submit Button */}
//             <div className="text-left p-5">
//               <BtnSubmit loading={loading}>Submit</BtnSubmit>
//             </div>
//           </div>
//         </form>
//       </FormProvider>
//     </div>
//   );
// };

// export default OfficeForm;

import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../../hooks/useRef";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const OfficeForm = () => {
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams(); // dynamic id
  const methods = useForm();
  const { handleSubmit, register, reset } = methods;

  const dateRef = useRef(null);
  const generateRefId = useRefId();

  // যদি id থাকে → ডেটা ফেচ করে ফর্মে সেট করব
  useEffect(() => {
    if (id) {
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/api/office/show/${id}`)
        .then((res) => {
          if (res.data.status === "Success") {
            const data = res.data.data;
            setEditData(data);
            reset(data);
          }
        })
        .catch((err) => {
          console.error("ডেটা লোড সমস্যা:", err);
        });
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      if (!id) {
        // Add
        formData.append("ref_id", generateRefId());
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/office/create`,
          formData
        );
        if (response.data.status === "Success") {
          toast.success("অফিসের তথ্য সফলভাবে সংরক্ষণ হয়েছে");
          reset();
          navigate("/tramessy/HR/HRM/Office");
        } else {
          toast.error("সার্ভার ত্রুটি: " + (response.data.message || "অজানা সমস্যা"));
        }
      } else {
        // Update
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/office/update/${id}`,
          formData
        );
        if (response.data.status === "Success") {
          toast.success("অফিসের তথ্য সফলভাবে আপডেট হয়েছে");
          navigate("/tramessy/HR/HRM/Office");
        } else {
          toast.error("সার্ভার ত্রুটি: " + (response.data.message || "অজানা সমস্যা"));
        }
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
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mx-auto rounded-md shadow"
        >
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md rounded-t-md">
            <h3 className=" pb-4 text-primary font-semibold ">
        {id ? "অফিস তথ্য আপডেট ফর্ম" : "নতুন অফিস যোগ ফর্ম"}
      </h3>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
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
              <div className="w-full">
                <InputField name="branch_name" label="শাখার নাম" required />
              </div>
              <div className="w-full">
                <InputField
                  name="factory_name"
                  label="ফ্যাক্টরি / কোম্পানির নাম"
                  required
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  type="number"
                  name="opening_balance"
                  label="প্রারম্ভিক ব্যালেন্স"
                  required
                />
              </div>
              <div className="w-full">
                <InputField name="address" label="ঠিকানা" required />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit loading={loading}>
                {id ? "আপডেট করুন" : "সাবমিট করুন"}
              </BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default OfficeForm;

