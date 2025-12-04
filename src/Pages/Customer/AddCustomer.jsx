import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useContext, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { AuthContext } from "../../providers/AuthProvider";

const CustomerForm = () => {
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const dateRef = useRef(null);
  const methods = useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Update হলে আইডি আসবে
  const { handleSubmit, reset, register, setValue } = methods;
  const generateRefId = useRefId();
  const {user} = useContext(AuthContext)

  // যদি Update মোড হয়, তাহলে ডাটা লোড করবো
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      api
        .get(`/customer/${id}`)
        .then((res) => {
            const customer = res.data;
            Object.keys(customer).forEach((key) => {
              setValue(key, customer[key]);
            });
        })
        .catch((err) => {
          console.error(err);
          toast.error("গ্রাহকের তথ্য আনা যায়নি");
        });
    }
  }, [id, setValue]);

  // সাবমিট ফাংশন (Add & Update)
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...data, created_by: user.name };

    // ref_id only generate if not in update mode
    if (!id) {
      payload.ref_id = generateRefId();
    }


      const url = isEdit
        ? `/customer/${id}`
        : `/customer`;

       const response = isEdit
                ? await api.put(url, payload)
                : await api.post(url, payload);
      const resData = response.data;
        toast.success(
          isEdit
            ? "গ্রাহকের তথ্য সফলভাবে হালনাগাদ হয়েছে!"
            : "গ্রাহকের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!"
        );
        reset();
        navigate("/tramessy/Customer");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার সমস্যা: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster />
      
      <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
        <h3 className=" pb-4 text-primary font-semibold ">
        {isEdit ? "গ্রাহকের তথ্য আপডেট করুন" : "নতুন গ্রাহকের তথ্য যোগ করুন"}
      </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="customer_name" label="কাস্টমার নাম" required={!isEdit} />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="mobile" label="মোবাইল" required={!isEdit}  />
              </div>
            </div>

            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="address" label="ঠিকানা" required={!isEdit}  />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="ইমেইল" required={false} />
              </div>
            </div>

            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="rate"
                  label="ফিক্সড"
                  required={!isEdit} 
                  options={[
                    { value: "Fixed", label: "ফিক্সড" },
                    { value: "Unfixed", label: "আনফিক্সড" },
                  ]}
                />
              </div>
              <div className="w-full relative">
                <InputField name="opening_balance" label="শুরুর ব্যালেন্স" required={!isEdit}  />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required={!isEdit} 
                  options={[
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            {/* সাবমিট বাটন */}
            <div className="text-left">
              <BtnSubmit loading={loading}>
                {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CustomerForm;
