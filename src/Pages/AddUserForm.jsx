

// import { useForm, FormProvider } from "react-hook-form"
// import toast, { Toaster } from "react-hot-toast"
// import axios from "axios"
// import BtnSubmit from "../components/Button/BtnSubmit"
// import { MdOutlineArrowDropDown } from "react-icons/md"
// import { InputField, SelectField } from "../components/Form/FormFields"
// import { useNavigate, useParams } from "react-router-dom" // Import useParams
// import { useEffect, useState } from "react" // Import useEffect and useState

// const AddUserForm = () => {
//   const [loading, setLoading] = useState(false)
//   const navigate = useNavigate()
//   const { id } = useParams() // Get ID from URL parameters
//   const isUpdateMode = !!id // Determine if we are in update mode

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

//   // State to track if initial data has been loaded for update mode
//   const [initialDataLoaded, setInitialDataLoaded] = useState(false)

//   // Fetch existing user data if in update mode
//   useEffect(() => {
//     if (isUpdateMode && !initialDataLoaded) {
//       const fetchUserData = async () => {
//         try {
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`)
//           const data = response.data.data // Adjust based on your API response structure
//           if (data) {
//             // Pre-populate the form with fetched data
//             reset({
//               name: data.name,
//               phone: data.phone,
//               email: data.email,
//               // Passwords are not pre-filled for security reasons
//               // role and status might need to be mapped if values differ from options
//               role: data.role,
//               status: data.status,
//             })
//             setInitialDataLoaded(true)
//           } else {
//             toast.error("User record not found.")
//             navigate("/tramessy/AllUsers") // Redirect if not found
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error)
//           toast.error("Failed to load user data.")
//           navigate("/tramessy/AllUsers") // Redirect on error
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
//         // Only append password fields if they are not empty during update
//         if (isUpdateMode && (key === "password" || key === "confirmPassword") && !value) {
//           return // Skip if empty in update mode
//         }
//         formData.append(key, value)
//       })

//       let response
//       let successMessage = ""
//       let errorMessage = ""
//       const redirectPath = "/tramessy/AllUsers"

//       if (isUpdateMode) {
//          formData.append("_method", "PUT")
//         response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, formData)
//         successMessage = "User successfully updated!"
//         errorMessage = "Failed to update user."
//       } else {
//         response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users`, formData)
//         successMessage = "User successfully added!"
//         errorMessage = "Failed to add user."
//       }

//       const resData = response.data
//       if (resData.status === "success") {
//         toast.success(successMessage, { position: "top-right" })
//         reset() // Reset form after successful submission
//         navigate(redirectPath)
//       } else {
//         toast.error("Server error: " + (resData.message || errorMessage))
//       }
//     } catch (error) {
//       const clientErrorMessage = error.response?.data?.message || error.message || "Unknown error"
//       toast.error("Server issue: " + clientErrorMessage)
//       console.error("Submit error:", error)
//     }finally {
//     setLoading(false); 
//   }
//   }

//   return (
//     <div className="mt-10">
//       <Toaster />
//       <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
//         {isUpdateMode ? "Update User" : "Add User"}
//       </h3>
//       <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Row 1 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="name" label="Name" required={!isUpdateMode} />
//               </div>
//               <div className="w-full">
//                 <InputField name="phone" label="Phone" type="number" required={!isUpdateMode} />
//               </div>
//             </div>
//             {/* Row 2 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="email" label="Email" type="email" required={!isUpdateMode} />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="password"
//                   label="Password"
//                   type="password"
//                   required={!isUpdateMode} // Required only for new user creation
//                 />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="confirmPassword"
//                   label="Confirm Password"
//                   type="password"
//                   required={!isUpdateMode} // Required only for new user creation
//                   validate={(value) => {
//                     if (!isUpdateMode && !value) {
//                       return "Confirm Password is required"
//                     }
//                     if (value && value !== password) {
//                       return "Passwords do not match"
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
//                   label="User Type"
//                   required={!isUpdateMode}
//                   options={[
//                     { value: "", label: "Select User Type..." },
//                     { value: "User", label: "User" },
//                     { value: "Admin", label: "Admin" },
//                   ]}
//                 />
//                 <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//               </div>
//               <div className="w-full relative">
//                 <SelectField
//                   name="status"
//                   label="Status"
//                   required={!isUpdateMode}
//                   options={[
//                     { value: "", label: "Select Status..." },
//                     { value: "Active", label: "Active" },
//                     { value: "Inactive", label: "Inactive" },
//                   ]}
//                 />
//                 <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
//               </div>
//             </div>
//             {/* Submit */}
//             <div className="mt-6">
//               <BtnSubmit loading={loading}>{isUpdateMode ? "Update" : "Submit"}</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   )
// }

// export default AddUserForm

import { useForm, FormProvider } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import BtnSubmit from "../components/Button/BtnSubmit"
import { MdOutlineArrowDropDown } from "react-icons/md"
import { InputField, SelectField } from "../components/Form/FormFields"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const AddUserForm = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const isUpdateMode = !!id

  const methods = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      status: "",
    },
  })
  const { handleSubmit, reset, watch, setValue } = methods
  const password = watch("password")
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  useEffect(() => {
    if (isUpdateMode && !initialDataLoaded) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`)
          const data = response.data.data
          if (data) {
            reset({
              name: data.name,
              phone: data.phone,
              email: data.email,
              role: data.role,
              status: data.status,
            })
            setInitialDataLoaded(true)
          } else {
            toast.error("ইউজারের তথ্য পাওয়া যায়নি।")
            navigate("/tramessy/AllUsers")
          }
        } catch (error) {
          console.error("ইউজার ডেটা লোড করতে সমস্যা:", error)
          toast.error("ইউজারের তথ্য লোড করতে ব্যর্থ হয়েছে।")
          navigate("/tramessy/AllUsers")
        }
      }
      fetchUserData()
    }
  }, [id, reset, navigate, initialDataLoaded, isUpdateMode])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (isUpdateMode && (key === "password" || key === "confirmPassword") && !value) {
          return
        }
        formData.append(key, value)
      })

      let response
      let successMessage = ""
      let errorMessage = ""
      const redirectPath = "/tramessy/AllUsers"

      if (isUpdateMode) {
        formData.append("_method", "PUT")
        response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`, formData)
        successMessage = "ইউজার সফলভাবে আপডেট হয়েছে!"
        errorMessage = "ইউজার আপডেট করতে ব্যর্থ হয়েছে।"
      } else {
        response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users`, formData)
        successMessage = "ইউজার সফলভাবে যোগ করা হয়েছে!"
        errorMessage = "ইউজার যোগ করতে ব্যর্থ হয়েছে।"
      }

      const resData = response.data
      if (resData.status === "success") {
        toast.success(successMessage, { position: "top-right" })
        reset()
        navigate(redirectPath)
      } else {
        toast.error("সার্ভার ত্রুটি: " + (resData.message || errorMessage))
      }
    } catch (error) {
      const clientErrorMessage = error.response?.data?.message || error.message || "অজানা ত্রুটি"
      toast.error("সার্ভার সমস্যা: " + clientErrorMessage)
      console.error("Submit error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <Toaster />
      
      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
        <h3 className=" pb-4 text-primary  font-semibold ">
        {isUpdateMode ? "ইউজার আপডেট করুন" : "নতুন ইউজার যোগ করুন"}
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="name" label="নাম" required={!isUpdateMode} />
              </div>
              <div className="w-full">
                <InputField name="phone" label="মোবাইল" type="number" required={!isUpdateMode} />
              </div>
            </div>
            {/* Row 2 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="email" label="ইমেইল" type="email" required={!isUpdateMode} />
              </div>
              <div className="w-full">
                <InputField
                  name="password"
                  label="পাসওয়ার্ড"
                  type="password"
                  required={!isUpdateMode}
                />
              </div>
              <div className="w-full">
                <InputField
                  name="confirmPassword"
                  label="পাসওয়ার্ড নিশ্চিত করুন"
                  type="password"
                  required={!isUpdateMode}
                  validate={(value) => {
                    if (!isUpdateMode && !value) {
                      return "পাসওয়ার্ড নিশ্চিত করা আবশ্যক"
                    }
                    if (value && value !== password) {
                      return "পাসওয়ার্ড মেলেনি"
                    }
                    return true
                  }}
                />
              </div>
            </div>
            {/* Row 3 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <SelectField
                  name="role"
                  label="ইউজারের ধরন"
                  required={!isUpdateMode}
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
                  required={!isUpdateMode}
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
              <BtnSubmit loading={loading}>{isUpdateMode ? "আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default AddUserForm

