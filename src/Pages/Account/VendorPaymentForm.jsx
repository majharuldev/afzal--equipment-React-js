
import { FormProvider, useForm } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { FiCalendar } from "react-icons/fi"
import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"
import api from "../../utils/axiosConfig"
import { AuthContext } from "../../providers/AuthProvider"

const VendorPaymentForm = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const dateRef = useRef(null)
  const methods = useForm()
  const { handleSubmit, reset, register, control } = methods
  const {user} = useContext(AuthContext)

  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // বিদ্যমান ডাটা লোড (Edit Mode)
  useEffect(() => {
    if (id && !initialDataLoaded) {
      const fetchPaymentData = async () => {
        try {
          const response = await api.get(`/vendor-payment/${id}`)
          const data = response.data.data
          if (data) {
            reset({
              date: data.date,
              vendor_name: data.vendor_name,
              branch_name: data.branch_name,
              bill_ref: data.bill_ref,
              amount: data.amount,
              cash_type: data.cash_type,
              note: data.note,
              // created_by: data.created_by,
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
   // select vendor from api
  const [vendor, setVendor] = useState([])
  useEffect(() => {
    api.get(`/vendor`)
      .then((response) => setVendor(response.data.data))
      .catch((error) => console.error("Error fetching vendor data:", error))
  }, [])
  const vendorOptions = vendor.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
  }))

  // select branch office from api
  const [branch, setBranch] = useState([])
  useEffect(() => {
    api.get(`/office`)
      .then((response) => setBranch(response.data.data))
      .catch((error) => console.error("Error fetching branch data:", error))
  }, [])
  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  // ফর্ম সাবমিট
  const onSubmit = async (data) => {
    setLoading(true)
    try {
        const payload = {
              ...data,
              created_by: user.name,
            }
      let paymentResponse
      let paymentData

      if (id) {
        // বিদ্যমান পেমেন্ট আপডেট
        paymentResponse = await api.put(`/vendor-payment/${id}`,payload)
        paymentData = paymentResponse.data
        if (paymentData.success) {
          toast.success("পেমেন্ট সফলভাবে আপডেট হয়েছে।", { position: "top-right" })
          navigate("/tramessy/account/vendorPayment")
        } else {
          toast.error("পেমেন্ট API ব্যর্থ হয়েছে: " + (paymentData.message || "অজানা ত্রুটি"))
        }
      } else {
        // নতুন পেমেন্ট তৈরি
        paymentResponse = await api.post(`/vendor-payment`, payload)
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
                    { label: "Head Office", value: "Head Office" },
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
                <InputField name="note" label="নোট" />
              </div>
              {/* <div className="w-full">
                <InputField name="created_by" label="তৈরি করেছেন" required={!id} />
              </div> */}
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
