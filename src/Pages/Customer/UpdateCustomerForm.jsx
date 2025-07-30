import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useLoaderData, useNavigate } from "react-router-dom";

const UpdateCustomerForm = () => {
    const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  //   update loader data
  const updateCustomerLoaderData = useLoaderData();
  const { id, date, customer_name, mobile, email, address, due, status } =
    updateCustomerLoaderData.data;
  //   console.log("updateCustomerLoaderData", updateCustomerLoaderData);
  const dateRef = useRef(null);
  const methods = useForm({ defaultValues: { status } });
  const { handleSubmit, register } = methods;

  // update customer
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/customer/update/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const resData = response.data;
      if (resData.status === "Success") {
        toast.success("Customer updated successfully!", {
          position: "top-right",
        });
        navigate("/tramessy/Customer")
      } else {
        toast.error("Server issue " + (resData.message || "Unknown problem"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue " + errorMessage);
    }finally {
    setLoading(false); 
  }
  };

  return (
    <div className="mt-10">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Customer information
      </h3>
      <div className="mx-auto p-6 rounded-b-md shadow border border-gray-300">
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  defaultValue={date}
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
              <div className="w-full relative">
                <InputField
                  name="customer_name"
                  label="Customer Name"
                  defaultValue={customer_name}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="mobile"
                  label="Mobile"
                  defaultValue={mobile}
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label="Email" defaultValue={email} />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField
                  name="address"
                  label="Address"
                  defaultValue={address}
                />
              </div>
              <div className="w-full relative">
                <InputField name="due" label="Due Balance" defaultValue={due} />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="Status"
                  defaultValue={status}
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit loading={loading}>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default UpdateCustomerForm;
