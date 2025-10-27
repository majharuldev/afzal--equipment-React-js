import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";

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
      api
        .get(`/supplier/${id}`)
        .then((res) => {
          if (res.data.success) {
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
      const payload = { ...data };

    // ref_id only generate if not in update mode
    if (!id) {
      payload.ref_id = generateRefId();
    }

      const url = isEdit
        ? `/supplier/${id}`
        : `/supplier`;

       const response = id
        ? await api.put(`/supplier/${id}`, payload)
        : await api.post(`/supplier`, payload);
      const resData = response.data;

      if (resData.success) {
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
                
              />
            </div>
            <div className="w-full">
              <InputField name="supplier_name" label="সাপ্লায়ার নাম" required />
            </div>
            <div className="w-full">
                  <InputField
                    name="business_category"
                    label="বিজনেস ক্যাটাগরি"
                    required
                  />
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
              <InputField name="opening_balance" label="শুরুর ব্যালেন্স" />
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
