import { FormProvider, useForm } from "react-hook-form"
import toast, { Toaster } from "react-hot-toast"
import axios from "axios"
import { FiCalendar } from "react-icons/fi"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { InputField, SelectField } from "../../components/Form/FormFields"
import BtnSubmit from "../../components/Button/BtnSubmit"

const PaymentReceiveForm = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const dateRef = useRef(null)
  const methods = useForm()
  const { handleSubmit, reset, register, control } = methods

  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  useEffect(() => {
    if (id && !initialDataLoaded) {
      const fetchPaymentData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/paymentRecived/show/${id}`)
          const data = response.data.data
          if (data) {
            reset({
              date: data.date,
              customer_name: data.customer_name,
              branch_name: data.branch_name,
              bill_ref: data.bill_ref,
              amount: data.amount,
              cash_type: data.cash_type,
              note: data.note,
              created_by: data.created_by,
              status: data.status,
            })
            setInitialDataLoaded(true)
          } else {
            toast.error("পেমেন্ট রেকর্ড পাওয়া যায়নি।")
            navigate("/tramessy/account/PaymentReceive")
          }
        } catch (error) {
          console.error("পেমেন্ট ডাটা লোডে সমস্যা:", error)
          toast.error("পেমেন্ট ডাটা লোড করতে ব্যর্থ।")
          navigate("/tramessy/account/PaymentReceive")
        }
      }
      fetchPaymentData()
    }
  }, [id, reset, navigate, initialDataLoaded])

  const [customer, setCustomer] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomer(data.data))
      .catch((error) => console.error("কাস্টমার ডাটা লোডে সমস্যা:", error))
  }, [])
  const customerOptions = customer.map((dt) => ({
    value: dt.customer_name,
    label: dt.customer_name,
  }))

  const [branch, setBranch] = useState([])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("ব্রাঞ্চ ডাটা লোডে সমস্যা:", error))
  }, [])
  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }))

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const formData = new FormData()
      for (const key in data) {
        formData.append(key, data[key])
      }

      let paymentResponse
      if (id) {
        paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/paymentRecived/update/${id}`, formData)
      } else {
        paymentResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/paymentRecived/create`, formData)
      }

      const paymentData = paymentResponse.data
      if (paymentData.success) {
        toast.success(id ? "পেমেন্ট সফলভাবে আপডেট হয়েছে।" : "পেমেন্ট সফলভাবে সংরক্ষণ হয়েছে।", { position: "top-right" })
        reset()
        navigate("/tramessy/account/PaymentReceive")
      } else {
        toast.error("পেমেন্ট API ব্যর্থ: " + (paymentData.message || "অজানা সমস্যা"))
      }
    } catch (error) {
      console.error("সাবমিশন ত্রুটি:", error)
      const errorMessage = error.response?.data?.message || error.message || "অজানা সমস্যা"
      toast.error("সার্ভার সমস্যা: " + errorMessage)
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
        {id ? "পেমেন্ট আপডেট ফর্ম" : "পেমেন্ট গ্রহণ ফর্ম"}
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
                  name="customer_name"
                  label="কাস্টমার নাম"
                  required={!id}
                  options={customerOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="ব্রাঞ্চ নাম"
                  required={!id}
                  control={control}
                  options={[{ label: "ব্রাঞ্চ নির্বাচন করুন", value: "", disabled: true }, { label: "হেড অফিস", value: "Head Office" }, ...branchOptions]}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bill_ref" label="বিল রেফারেন্স" required={!id}/>
              </div>
              <div className="w-full">
                <InputField name="amount" label="পরিমাণ" required={!id} type="number" />
              </div>
              <div className="w-full">
                <SelectField
                  name="cash_type"
                  label="পেমেন্ট ধরন"
                  required={!id}
                  options={[
                    { value: "Cash", label: "নগদ" },
                    { value: "Bank", label: "ব্যাংক" },
                    { value: "Card", label: "কার্ড" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="remarks" label="মন্তব্য" />
              </div>
              <div className="w-full">
                <InputField name="created_by" label="তৈরি করেছেন" required={!id} />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="স্ট্যাটাস"
                  required={!id}
                  options={[
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>
            <div className="text-left p-5">
              <BtnSubmit loading={loading}>{id ? "আপডেট" : "সাবমিট"}</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default PaymentReceiveForm
