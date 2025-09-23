// import { FormProvider, useForm } from "react-hook-form"
// import toast, { Toaster } from "react-hot-toast"
// import axios from "axios"
// import { FiCalendar } from "react-icons/fi"
// import { useEffect, useRef, useState } from "react"
// import { useNavigate, useParams } from "react-router-dom" // Import useParams
// import { InputField, SelectField } from "../../components/Form/FormFields"
// import BtnSubmit from "../../components/Button/BtnSubmit"

// const VendorPaymentForm = () => {
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate()
//   const { id } = useParams() // Get ID from URL parameters
//   const dateRef = useRef(null)
//   const methods = useForm()
//   const { handleSubmit, reset, register, control } = methods

//   // State for fetched data (if editing)
//   const [initialDataLoaded, setInitialDataLoaded] = useState(false)

//   // Fetch existing data if ID is present (for update mode)
//   useEffect(() => {
//     if (id && !initialDataLoaded) {
//       const fetchPaymentData = async () => {
//         try {
//           // Assuming an API endpoint to fetch a single payment record by ID
//           const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/${id}`)
//           const data = response.data.data // Adjust based on your API response structure
//           if (data) {
//             // Pre-populate the form with fetched data
//             reset({
//               date: data.date,
//               customer_name: data.vendor_name,
//               branch_name: data.branch_name,
//               bill_ref: data.bill_ref,
//               amount: data.amount,
//               cash_type: data.cash_type,
//               note: data.note,
//               created_by: data.created_by,
//               status: data.status,
//             })
//             setInitialDataLoaded(true)
//           } else {
//             toast.error("Payment record not found.")
//             // navigate("/tramessy/account/PaymentReceive") // Redirect if not found
//           }
//         } catch (error) {
//           console.error("Error fetching payment data:", error)
//           toast.error("Failed to load payment data.")
//           // navigate("/tramessy/account/PaymentReceive") // Redirect on error
//         }
//       }
//       fetchPaymentData()
//     }
//   }, [id, reset, navigate, initialDataLoaded])

//   // select customer from api
//   const [customer, setCustomer] = useState([])
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
//       .then((response) => response.json())
//       .then((data) => setCustomer(data.data))
//       .catch((error) => console.error("Error fetching customer data:", error))
//   }, [])
//   const customerOptions = customer.map((dt) => ({
//     value: dt.customer_name,
//     label: dt.customer_name,
//   }))
//    // select vendor from api
//   const [vendor, setVendor] = useState([])
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
//       .then((response) => response.json())
//       .then((data) => setVendor(data.data))
//       .catch((error) => console.error("Error fetching vendor data:", error))
//   }, [])
//   const vendorOptions = vendor.map((dt) => ({
//     value: dt.vendor_name,
//     label: dt.vendor_name,
//   }))

//   // select branch office from api
//   const [branch, setBranch] = useState([])
//   useEffect(() => {
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
//       .then((response) => response.json())
//       .then((data) => setBranch(data.data))
//       .catch((error) => console.error("Error fetching branch data:", error))
//   }, [])
//   const branchOptions = branch.map((dt) => ({
//     value: dt.branch_name,
//     label: dt.branch_name,
//   }))

//   // send data on server
//   const onSubmit = async (data) => {
//   setLoading(true)
//   try {
//     const formData = new FormData()
//     for (const key in data) {
//       formData.append(key, data[key])
//     }

//     let paymentResponse
//     let paymentData

//     if (id) {
//       // Update existing vendor payment
//       paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/update/${id}`, formData)
//       paymentData = paymentResponse.data

//       if (paymentData.success) {
//         toast.success("Payment updated successfully", { position: "top-right" })
//         navigate("/tramessy/account/vendorPayment")
//       } else {
//         toast.error("Payment API failed: " + (paymentData.message || "Unknown error"))
//       }
//     } else {
//       // Create new vendor payment
//       paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/create`, formData)
//       paymentData = paymentResponse.data

//       if (paymentData.success) {
//         toast.success("Payment saved successfully", { position: "top-right" })
//         reset()
//         navigate("/tramessy/account/vendorPayment")
//       } else {
//         toast.error("Payment API failed: " + (paymentData.message || "Unknown error"))
//       }
//     }
//   } catch (error) {
//     console.error("Submit error:", error)
//     const errorMessage = error.response?.data?.message || error.message || "Unknown error"
//     toast.error("Server issue: " + errorMessage)
//   } finally {
//     setLoading(false)
//   }
// }


//   return (
//     <div className="mt-10">
//       <Toaster />
//       <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
//         {id ? "Update Vendor Payment  Form" : "Vendor Payment Form"}
//       </h3>
//       <FormProvider {...methods}>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto rounded-b-md shadow">
//           {/* Trip & Destination Section */}
//           <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField
//                   name="date"
//                   label="Date"
//                   type="date"
//                   required={!id}
//                   inputRef={(e) => {
//                     register("date").ref(e)
//                     dateRef.current = e
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
//               {/* <div className="w-full">
//                 <SelectField
//                   name="customer_name"
//                   label="Customer Name"
//                  required={!id}
//                   options={customerOptions}
//                   control={control}
//                 />
//               </div> */}
//                <div className="w-full">
//                 <SelectField
//                   name="vendor_name"
//                   label="Vendor Name"
//                  required={!id}
//                   options={vendorOptions}
//                   control={control}
//                 />
//               </div>
//               <div className="w-full">
//                 <SelectField
//                   name="branch_name"
//                   label="Branch Name"
//                   required={!id}
//                   control={control}
//                   options={[
//                     { label: "Select Branch", value: "", disabled: true },
//                     { label: "Head Office", value: "Head Office" },
//                     ...branchOptions, // Include dynamically fetched branch options
//                   ]}
//                 />
//               </div>
//             </div>
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <InputField name="bill_ref" label="Bill Ref" required={!id}/>
//               </div>
//               <div className="w-full">
//                 <InputField name="amount" label="Amount" required={!id} type="number" />
//               </div>
//             </div>
//             <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
//               <div className="w-full">
//                 <SelectField
//                   name="cash_type"
//                   label="Cash Type"
//                   required={!id}
//                   options={[
//                     { value: "Cash", label: "Cash" },
//                     { value: "Bank", label: "Bank" },
//                     { value: "Card", label: "Card" },
//                   ]}
//                 />
//               </div>
//               <div className="w-full">
//                 <InputField name="remarks" label="Note" />
//               </div>
//               <div className="w-full">
//                 <InputField name="created_by" label="Created By" required={!id} />
//               </div>
//               <div className="w-full">
//                 <SelectField
//                   name="status"
//                   label="Status"
//                   required={!id}
//                   options={[
//                     { value: "Active", label: "Active" },
//                     { value: "Inactive", label: "Inactive" },
//                   ]}
//                 />
//               </div>
//             </div>
//             {/* Submit Button */}
//             <div className="text-left p-5">
//               <BtnSubmit loading={loading}>{id ? "Update" : "Submit"}</BtnSubmit>
//             </div>
//           </div>
//         </form>
//       </FormProvider>
//     </div>
//   )
// }

// export default VendorPaymentForm

import { FormProvider, useForm } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { FiCalendar } from "react-icons/fi"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"

const VendorPaymentForm = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const dateRef = useRef(null)
  const methods = useForm()
  const { handleSubmit, reset, register, control } = methods

  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // বিদ্যমান ডাটা লোড (Edit Mode)
  useEffect(() => {
    if (id && !initialDataLoaded) {
      const fetchPaymentData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/${id}`)
          const data = response.data.data
          if (data) {
            reset({
              date: data.date,
              vendor_name: data.vendor_name,
              branch_name: data.branch_name,
              bill_ref: data.bill_ref,
              amount: data.amount,
              cash_type: data.cash_type,
              remarks: data.note,
              created_by: data.created_by,
              status: data.status,
            })
            setInitialDataLoaded(true)
          } else {
            toast.error("পেমেন্ট রেকর্ড পাওয়া যায়নি।")
          }
        } catch (error) {
          console.error("পেমেন্ট ডাটা লোডে ত্রুটি:", error)
          toast.error("পেমেন্ট ডাটা লোড করা যায়নি।")
        }
      }
      fetchPaymentData()
    }
  }, [id, reset, initialDataLoaded])

  // Vendor লিস্ট
  const [vendor, setVendor] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
      .then((res) => res.json())
      .then((data) => setVendor(data.data))
      .catch((error) => console.error("Vendor লোডে ত্রুটি:", error))
  }, [])
  const vendorOptions = vendor.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
  }))

  // Branch লিস্ট
  const [branch, setBranch] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((res) => res.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Branch লোডে ত্রুটি:", error))
  }, [])
  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // ফর্ম সাবমিট
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }

      let paymentResponse
      let paymentData

      if (id) {
        // বিদ্যমান পেমেন্ট আপডেট
        paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/update/${id}`, formData)
        paymentData = paymentResponse.data
        if (paymentData.success) {
          toast.success("পেমেন্ট সফলভাবে আপডেট হয়েছে।", { position: "top-right" })
          navigate("/tramessy/account/vendorPayment")
        } else {
          toast.error("পেমেন্ট API ব্যর্থ হয়েছে: " + (paymentData.message || "অজানা ত্রুটি"))
        }
      } else {
        // নতুন পেমেন্ট তৈরি
        paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/vendorBill/create`, formData)
        paymentData = paymentResponse.data
        if (paymentData.success) {
          toast.success("পেমেন্ট সফলভাবে সংরক্ষণ হয়েছে।", { position: "top-right" })
          reset()
          navigate("/tramessy/account/vendorPayment")
        } else {
          toast.error("পেমেন্ট API ব্যর্থ হয়েছে: " + (paymentData.message || "অজানা ত্রুটি"))
        }
      }
    } catch (error) {
      console.error("সাবমিট ত্রুটি:", error)
      const errorMessage = error.response?.data?.message || error.message || "অজানা ত্রুটি"
      toast.error("সার্ভার ত্রুটি: " + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="">
      <Toaster />
      
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mx-auto rounded-b-md shadow">
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md rounded-t-md">
            <h3 className=" pb-4 text-primary font-semibold ">
        {id ? "ভেন্ডর পেমেন্ট আপডেট ফর্ম" : "ভেন্ডর পেমেন্ট ফর্ম"}
      </h3>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="তারিখ"
                  type="date"
                  required={!id}
                  inputRef={(e) => {
                    register("date").ref(e)
                    dateRef.current = e
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
                <SelectField
                  name="vendor_name"
                  label="ভেন্ডরের নাম"
                  required={!id}
                  options={vendorOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="শাখার নাম"
                  required={!id}
                  control={control}
                  options={[
                    { label: "শাখা নির্বাচন করুন", value: "", disabled: true },
                    { label: "হেড অফিস", value: "Head Office" },
                    ...branchOptions,
                  ]}
                />
              </div>
            </div>

            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bill_ref" label="বিল রেফারেন্স" required={!id} />
              </div>
              <div className="w-full">
                <InputField name="amount" label="পরিমাণ" required={!id} type="number" />
              </div>
            </div>

            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="cash_type"
                  label="পেমেন্ট মাধ্যম"
                  required={!id}
                  options={[
                    { value: "Cash", label: "নগদ" },
                    { value: "Bank", label: "ব্যাংক" },
                    { value: "Card", label: "কার্ড" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="remarks" label="নোট" />
              </div>
              <div className="w-full">
                <InputField name="created_by" label="সৃষ্টি করেছেন" required={!id} />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required={!id}
                  options={[
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            <div className="text-left p-5">
              <BtnSubmit loading={loading}>{id ? "আপডেট করুন" : "জমা দিন"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default VendorPaymentForm
