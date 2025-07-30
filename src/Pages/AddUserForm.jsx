// import { useForm, FormProvider } from "react-hook-form";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import BtnSubmit from "../components/Button/BtnSubmit";
// import { MdOutlineArrowDropDown } from "react-icons/md";
// import { InputField, SelectField } from "../components/Form/FormFields";
// import { useNavigate } from "react-router-dom";

// const AddUserForm = () => {
//   const navigate = useNavigate()
//   const methods = useForm();
//   const { handleSubmit, reset, watch } = methods;
//   const password = watch("password");
//   const onSubmit = async (data) => {
//     try {
//       const formData = new FormData();
//       Object.entries(data).forEach(([key, value]) => {
//         formData.append(key, value);
//       });

//       const response = await axios.post(
//         `${import.meta.env.VITE_BASE_URL}/api/users`,
//         formData
//       );
//       const resData = response.data;

//       if (resData.status === "success") {
//         toast.success("User successfully added!", { position: "top-right" });
//         reset();
//         navigate("/tramessy/AllUsers")
//       } else {
//         toast.error("Server error: " + (resData.message || "Unknown issue"));
//       }
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server error: " + errorMessage);
//     }
//   };

//   return (
//     <div className="mt-10">
//       <Toaster />
//       <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
//         Add User
//       </h3>
//       <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
//         <FormProvider {...methods}>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Row 1 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="name" label="Name" required />
//               </div>
//               <div className="w-full">
//                 <InputField name="phone" label="Phone" type="number" required />
//               </div>
//             </div>

//             {/* Row 2 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="email" label="Email" type="email" required />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="password"
//                   label="Password"
//                   type="password"
//                   required
//                 />
//               </div>
//               <div className="w-full">
//                 <InputField
//                   name="confirmPassword"
//                   label="Confirm Password"
//                   type="password"
//                   required
//                   validate={(value) =>
//                     value === password || "Passwords do not match"
//                   }
//                 />
//               </div>
//             </div>

//             {/* Row 3 */}
//             <div className="md:flex justify-between gap-3">
//               <div className="w-full relative">
//                 <SelectField
//                   name="role"
//                   label="User Type"
//                   required
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
//                   required
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
//               <BtnSubmit>Submit</BtnSubmit>
//             </div>
//           </form>
//         </FormProvider>
//       </div>
//     </div>
//   );
// };

// export default AddUserForm;


"use client"

import { useForm, FormProvider } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import BtnSubmit from "../components/Button/BtnSubmit"
import { MdOutlineArrowDropDown } from "react-icons/md"
import { InputField, SelectField } from "../components/Form/FormFields"
import { useNavigate, useParams } from "react-router-dom" // Import useParams
import { useEffect, useState } from "react" // Import useEffect and useState

const AddUserForm = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams() // Get ID from URL parameters
  const isUpdateMode = !!id // Determine if we are in update mode

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

  // State to track if initial data has been loaded for update mode
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Fetch existing user data if in update mode
  useEffect(() => {
    if (isUpdateMode && !initialDataLoaded) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/${id}`)
          const data = response.data.data // Adjust based on your API response structure
          if (data) {
            // Pre-populate the form with fetched data
            reset({
              name: data.name,
              phone: data.phone,
              email: data.email,
              // Passwords are not pre-filled for security reasons
              // role and status might need to be mapped if values differ from options
              role: data.role,
              status: data.status,
            })
            setInitialDataLoaded(true)
          } else {
            toast.error("User record not found.")
            navigate("/tramessy/AllUsers") // Redirect if not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Failed to load user data.")
          navigate("/tramessy/AllUsers") // Redirect on error
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
        // Only append password fields if they are not empty during update
        if (isUpdateMode && (key === "password" || key === "confirmPassword") && !value) {
          return // Skip if empty in update mode
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
        successMessage = "User successfully updated!"
        errorMessage = "Failed to update user."
      } else {
        response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/users`, formData)
        successMessage = "User successfully added!"
        errorMessage = "Failed to add user."
      }

      const resData = response.data
      if (resData.status === "success") {
        toast.success(successMessage, { position: "top-right" })
        reset() // Reset form after successful submission
        navigate(redirectPath)
      } else {
        toast.error("Server error: " + (resData.message || errorMessage))
      }
    } catch (error) {
      const clientErrorMessage = error.response?.data?.message || error.message || "Unknown error"
      toast.error("Server issue: " + clientErrorMessage)
      console.error("Submit error:", error)
    }finally {
    setLoading(false); 
  }
  }

  return (
    <div className="mt-10">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        {isUpdateMode ? "Update User" : "Add User"}
      </h3>
      <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="name" label="Name" required={!isUpdateMode} />
              </div>
              <div className="w-full">
                <InputField name="phone" label="Phone" type="number" required={!isUpdateMode} />
              </div>
            </div>
            {/* Row 2 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="email" label="Email" type="email" required={!isUpdateMode} />
              </div>
              <div className="w-full">
                <InputField
                  name="password"
                  label="Password"
                  type="password"
                  required={!isUpdateMode} // Required only for new user creation
                />
              </div>
              <div className="w-full">
                <InputField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  required={!isUpdateMode} // Required only for new user creation
                  validate={(value) => {
                    if (!isUpdateMode && !value) {
                      return "Confirm Password is required"
                    }
                    if (value && value !== password) {
                      return "Passwords do not match"
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
                  label="User Type"
                  required={!isUpdateMode}
                  options={[
                    { value: "", label: "Select User Type..." },
                    { value: "User", label: "User" },
                    { value: "Admin", label: "Admin" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="Status"
                  required={!isUpdateMode}
                  options={[
                    { value: "", label: "Select Status..." },
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>
            {/* Submit */}
            <div className="mt-6">
              <BtnSubmit loading={loading}>{isUpdateMode ? "Update" : "Submit"}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default AddUserForm
