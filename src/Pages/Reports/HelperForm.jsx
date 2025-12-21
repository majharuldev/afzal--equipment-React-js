import { FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";


const HelperForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const methods = useForm();
  const { handleSubmit, reset, setValue } = methods;

  // Edit মোড হলে helper এর ডেটা আনা
  useEffect(() => {
    if (isEditMode) {
      const fetchHelperData = async () => {
        try {
          const response = await api.get(`/helper/${id}`);
          const helperData = response.data.data;
          
          // ফর্মে ডেটা সেট করা
          Object.keys(helperData).forEach(key => {
            setValue(key, helperData[key]);
          });
        } catch (error) {
          console.error("Helper ডেটা আনার সময় সমস্যা:", error);
          toast.error("Helper ডেটা লোড করতে ব্যর্থ হয়েছে");
        }
      };
      fetchHelperData();
    }
  }, [id, isEditMode, setValue]);

  const onSubmit = async (data) => {
    try {
      const url = isEditMode ? `/helper/${id}` : `/helper`;
      const method = isEditMode ? 'put' : 'post';

      const response = await api[method](url, data);
      const resData = response.data;

      if (resData.success) {
        toast.success(
          `হেল্পার ${isEditMode ? 'আপডেট হয়েছে' : 'সংরক্ষণ হয়েছে'} সফলভাবে`, 
          { position: "top-right" }
        );
        if (!isEditMode) reset();
        navigate("/tramessy/HR/helper");
      } else {
        toast.error("সার্ভার সমস্যা: " + (resData.message || "অজানা সমস্যা"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার সমস্যা: " + errorMessage);
    }
  };

  return (
    <div className="mt-5 p-2">
      <Toaster />
      <div className="mx-auto p-6 rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold ">
          {isEditMode ? "হেল্পার আপডেট করুন" : "নতুন হেল্পার তৈরি করুন"}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* নাম ও মোবাইল */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="helper_name" label="হেল্পারের নাম" required />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="phone"
                  label="মোবাইল নম্বর"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* ঠিকানা ও বেতন */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="address" label="ঠিকানা" required />
              </div>
              {/* <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="salary"
                  label="বেতন"
                  type="number"
                  required
                />
              </div> */}
               <div className="w-full relative">
                <SelectField
                  name="status"
                  label="স্ট্যাটাস"
                  required
                  options={[
                    { value: "Active", label: "সক্রিয়" },
                    { value: "Inactive", label: "নিষ্ক্রিয়" },
                  ]}
                />
              </div>
            </div>

            {/* স্ট্যাটাস */}
            <div className="md:flex justify-between gap-3">
             
              <div className="w-full"></div> {/* Layout এর জন্য ফাঁকা div */}
            </div>

            <div className="mt-6 text-left">
              <BtnSubmit>
                {isEditMode ? "হেল্পার আপডেট করুন" : "নতুন হেল্পার তৈরি করুন"}
              </BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default HelperForm;
