import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../hooks/useRef";
import axios from "axios";
import { useRef } from "react";
import { FiCalendar } from "react-icons/fi";

const AddStock = () => {
  const methods = useForm();
  const { handleSubmit, reset, register } = methods;
  const dateRef = useRef(null);
  // post vehicle
  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    const refId = generateRefId();
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", refId);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/stockProduct/create`,
        formData
      );
      const resData = response.data;

      if (resData.status === "Success") {
        toast.success("Stock product saved successfully!", {
          position: "top-right",
        });
        // --- Second API: Branch Create (only specific field) ---
        const paymentList = new FormData();
        paymentList.append("date", data.date);
        paymentList.append("supplier_name", data.vendor_name);
        paymentList.append("category", data.category);
        paymentList.append("quantity", data.quantity);

        paymentList.append("ref_id", refId);
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/payment/create`,
          paymentList
        );
        reset();
      } else {
        toast.error("Server error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server error: " + errorMessage);
    }
  };
  return (
    <div className="mt-10">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Stock Product Information
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4"
        >
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="date"
                label="Date"
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
              <InputField name="category" label="Category" required />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="product_name" label="Product Name" required />
            </div>
            <div className="w-full">
              <InputField name="quantity" label="Quantity" required />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="vendor_name" label="Vendor Name" required />
            </div>
            <div className="w-full">
              <InputField name="before_stock" label="Before Stock" required />
            </div>
            <div className="w-full">
              <InputField name="after_stock" label="After Stock" required />
            </div>
          </div>
          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddStock;
