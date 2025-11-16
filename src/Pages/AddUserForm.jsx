
// import { useForm, FormProvider } from "react-hook-form"
// import toast, { Toaster } from "react-hot-toast"
// import axios from "axios"
// import BtnSubmit from "../components/Button/BtnSubmit"
// import { MdOutlineArrowDropDown } from "react-icons/md"
// import { InputField, SelectField } from "../components/Form/FormFields"
// import { useNavigate, useParams } from "react-router-dom"
// import { useEffect, useState } from "react"
// import api from "../utils/axiosConfig"

// const AddUserForm = () => {
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const { id } = useParams()
//   const isUpdateMode = !!id

//   const methods = useForm({
//     defaultValues: {
//       name: "",
//       phone: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//       role: "",
//       status: "",
//     },
//   })
//   const { handleSubmit, reset, watch, setValue } = methods
//   const password = watch("password")
//   const [initialDataLoaded, setInitialDataLoaded] = useState(false)

//   useEffect(() => {
//     if (isUpdateMode && !initialDataLoaded) {
//       const fetchUserData = async () => {
//         try {
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`)
//           const data = response.data.data
//           if (data) {
//             reset({
//               name: data.name,
//               phone: data.phone,
//               email: data.email,
//               role: data.role,
//               status: data.status,
//             })
//             setInitialDataLoaded(true)
//           } else {
//             toast.error("ইউজারের তথ্য পাওয়া যায়নি।")
//             navigate("/tramessy/AllUsers")
//           }
//         } catch (error) {
//           console.error("ইউজার ডেটা লোড করতে সমস্যা:", error)
//           toast.error("ইউজারের তথ্য লোড করতে ব্যর্থ হয়েছে।")
//           navigate("/tramessy/AllUsers")
//         }
//       }
//       fetchUserData()
//     }
//   }, [id, reset, navigate, initialDataLoaded, isUpdateMode])

//   const onSubmit = async (data) => {
//     setLoading(true)
//     try {
//       const formData = new FormData()
//       Object.entries(data).forEach(([key, value]) => {
//         if (isUpdateMode && (key === "password" || key === "confirmPassword") && !value) {
//           return
//         }
//         formData.append(key, value)
//       })

//       let response
//       let successMessage = ""
//       let errorMessage = ""
//       const redirectPath = "/tramessy/AllUsers"

//       if (isUpdateMode) {
//         formData.append("_method", "PUT")
//         response = await api.post(`/user/${id}`, formData)
//         successMessage = "ইউজার সফলভাবে আপডেট হয়েছে!"
//         errorMessage = "ইউজার আপডেট করতে ব্যর্থ হয়েছে।"
//       } else {
//         response = await api.post(`/user`, formData)
//         successMessage = "ইউজার সফলভাবে যোগ করা হয়েছে!"
//         errorMessage = "ইউজার যোগ করতে ব্যর্থ হয়েছে।"
//       }

//       const resData = response.data
//       if (resData.status === "success") {
//         toast.success(successMessage, { position: "top-right" })
//         reset()
//         navigate(redirectPath)
//       } else {
//         toast.error("সার্ভার ত্রুটি: " + (resData.message || errorMessage))
//       }
//     } catch (error) {
//       const clientErrorMessage = error.response?.data?.message || error.message || "অজানা ত্রুটি"
//       toast.error("সার্ভার সমস্যা: " + clientErrorMessage)
//       console.error("Submit error:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="">
//       <Toaster />

//       <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
//         <h3 className=" pb-4 text-primary  font-semibold ">
//         {isUpdateMode ? "ইউজার আপডেট করুন" : "নতুন ইউজার যোগ করুন"}
//       </h3>
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Row 1 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="name" label="নাম" required={!isUpdateMode} />
//               </div>
//               <div className="w-full">
//                 <InputField name="phone" label="মোবাইল" type="number" required={!isUpdateMode} />
//               </div>
//             </div>
//             {/* Row 2 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="email" label="ইমেইল" type="email" required={!isUpdateMode} />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="password"
//                   label="পাসওয়ার্ড"
//                   type="password"
//                   required={!isUpdateMode}
//                 />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="confirmPassword"
//                   label="পাসওয়ার্ড নিশ্চিত করুন"
//                   type="password"
//                   required={!isUpdateMode}
//                   validate={(value) => {
//                     if (!isUpdateMode && !value) {
//                       return "পাসওয়ার্ড নিশ্চিত করা আবশ্যক"
//                     }
//                     if (value && value !== password) {
//                       return "পাসওয়ার্ড মেলেনি"
//                     }
//                     return true
//                   }}
//                 />
//               </div>
//             </div>
//             {/* Row 3 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full relative">
//                 <SelectField
//                   name="role"
//                   label="ইউজারের ধরন"
//                   required={!isUpdateMode}
//                   options={[
//                     { value: "", label: "ইউজারের ধরন নির্বাচন করুন..." },
//                     { value: "User", label: "ইউজার" },
//                     { value: "Admin", label: "অ্যাডমিন" },
//                   ]}
//                 />
//                 <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//               </div>
//               <div className="w-full relative">
//                 <SelectField
//                   name="status"
//                   label="অবস্থা"
//                   required={!isUpdateMode}
//                   options={[
//                     { value: "", label: "অবস্থা নির্বাচন করুন..." },
//                     { value: "Active", label: "সক্রিয়" },
//                     { value: "Inactive", label: "নিষ্ক্রিয়" },
//                   ]}
//                 />
//                 <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//               </div>
//             </div>
//             {/* Submit */}
//             <div className="mt-6">
//               <BtnSubmit loading={loading}>{isUpdateMode ? "আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   )
// }

// export default AddUserForm



import { useForm, FormProvider } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BtnSubmit from "../components/Button/BtnSubmit";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { InputField, SelectField } from "../components/Form/FormFields";
import api from "../utils/axiosConfig";

const AddUserForm = () => {
  const navigate = useNavigate()
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm();
  const { handleSubmit, reset, setValue, watch } = methods;
  const password = watch("password");

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchUserData = async () => {
        try {
          const response = await api.get(
            `/user/${id}`
          );
          const userData = response.data;

          // Set form values with fetched data
          Object.keys(userData).forEach(key => {
            if (key !== 'confirmPassword') { // Don't set confirmPassword
              setValue(key, userData[key]);
            }
          });
        } catch (error) {
          console.error("ইউজার ডেটা লোড করতে সমস্যা:", error)
          //           toast.error("ইউজারের তথ্য লোড করতে ব্যর্থ হয়েছে।")
        }
      };
      fetchUserData();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...submitData } = data;

      const url = isEditMode
        ? `/user/${id}`
        : `/register`;

      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](url, submitData);
      const resData = response.data;

      if (resData.success) {
        toast.success(
          `ইউজার সফলভাবে ${isEditMode ? 'আপডেট করা হয়েছে' : 'তৈরি করা হয়েছে'}!`,
          { position: "top-right" }
        );
        if (!isEditMode) reset();
        navigate("/tramessy/AllUsers")
      } else {
        toast.error("সার্ভার সমস্যা: " + (resData.message || "অজানা ত্রুটি"));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার সমস্যা: " + errorMessage);
    }
  };

  return (
    <div className="mt-10 md:p-2">
      <Toaster />

      <div className="mx-auto p-6 rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold rounded-t-md">
          {isEditMode ? "ইউজার আপডেট করুন" : "নতুন ইউজার যোগ করুন"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="name" label="নাম" required={!isEditMode} />
              </div>
              {/* <div className="w-full">
                <InputField name="phone" label="Phone" type="number" required={!isEditMode} />
              </div> */}
              <div className="w-full">
                <InputField name="email" label="ইমেইল" type="email" required={!isEditMode} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="md:flex justify-between gap-3">

              <div className="w-full">
                <InputField
                  name="password"
                  label="পাসওয়ার্ড"
                  type="password"
                  // required={!isEditMode}
                  required
                />
              </div>
              <div className="w-full">
                <InputField
                  name="password_confirmation"
                  label="পাসওয়ার্ড নিশ্চিত করুন"
                  type="password"
                  // required={!isEditMode}
                  required
                  validate={(value) =>
                    !password || value === password || "Passwords do not match"
                  }
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <SelectField
                  name="role"
                  label="ইউজারের ধরন"
                  required={!isEditMode}
                  options={[
                    { value: "", label: "ইউজারের ধরন নির্বাচন করুন..." },
                     { value: "User", label: "ইউজার" },
                     { value: "Admin", label: "অ্যাডমিন" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required={!isEditMode}
                  options={[
                    { value: "", label: "অবস্থা নির্বাচন করুন..." },
                     { value: "Active", label: "সক্রিয়" },
                     { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6">
              <BtnSubmit>
                {isEditMode ? "আপডেট করুন" : "সাবমিট করুন"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddUserForm;