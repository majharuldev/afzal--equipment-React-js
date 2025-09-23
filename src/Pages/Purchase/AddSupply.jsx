import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

const SupplyForm = () => {
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { id } = useParams(); // id থাকলে আপডেট
  const navigate = useNavigate();
  const methods = useForm();
  const dateRef = useRef(null);
  const { handleSubmit, reset, register, setValue } = methods;
  const generateRefId = useRefId();

  // ডাটা লোড (যদি id থাকে → আপডেট ফর্ম)
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      axios
        .get(`${import.meta.env.VITE_BASE_URL}/api/supply/show/${id}`)
        .then((res) => {
          if (res.data.status === "Success") {
            const supply = res.data.data;
            // ফর্মে ডিফল্ট ভ্যালু বসানো
            Object.keys(supply).forEach((key) => {
              setValue(key, supply[key]);
            });
          }
        })
        .catch(() => {
          toast.error("সরবরাহকারীর তথ্য লোড করতে সমস্যা হয়েছে।");
        });
    }
  }, [id, setValue]);

  // সাবমিট
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      if (!isEdit) {
        formData.append("ref_id", generateRefId());
      }

      const url = isEdit
        ? `${import.meta.env.VITE_BASE_URL}/api/supply/update/${id}`
        : `${import.meta.env.VITE_BASE_URL}/api/supply/create`;

      const response = await axios.post(url, formData);
      const resData = response.data;

      if (resData.status === "Success") {
        toast.success(
          isEdit
            ? "সরবরাহকারীর তথ্য সফলভাবে হালনাগাদ হয়েছে!"
            : "সরবরাহকারীর তথ্য সফলভাবে সংরক্ষিত হয়েছে!"
        );
        reset();
        navigate("/tramessy/Purchase/SupplierList");
      } else {
        toast.error("সার্ভার সমস্যা: " + (resData.message || "অজানা সমস্যা"));
      }
    } catch (error) {
      console.error(error);
      toast.error("সার্ভার সমস্যা: " + (error.message || "অজানা ত্রুটি"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <Toaster />
      
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 rounded-b-md rounded-t-md shadow space-y-4 border border-gray-300"
        >
          <h3 className="pb-4 text-primary  font-semibold ">
        {isEdit ? "সাপ্লায়ার তথ্য আপডেট করুন" : "সাপ্লায়ার তথ্য যুক্ত করুন"}
      </h3>
          <div className="md:flex justify-between gap-3">
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
              <InputField name="business_name" label="ব্যবসার নাম" required />
            </div>
            <div className="w-full">
              <InputField name="phone" label="ফোন নম্বর" required />
            </div>
          </div>

          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="address" label="ঠিকানা" required />
            </div>
            <div className="w-full">
              <InputField name="due_amount" label="বাকি টাকা" />
            </div>
            <div className="w-full">
              <InputField
                name="contact_person_name"
                label="যোগাযোগ ব্যক্তির নাম"
                required
              />
            </div>
            <div className="relative w-full">
              <SelectField
                name="status"
                label="অবস্থা"
                required
                options={[
                  { value: "", label: "অবস্থা নির্বাচন করুন..." },
                  { value: "Active", label: "সক্রিয়" },
                  { value: "Inactive", label: "নিষ্ক্রিয়" },
                ]}
              />
            </div>
          </div>

          <BtnSubmit loading={loading}>
            {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
          </BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default SupplyForm;
