import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRef } from "react";
import { FiCalendar } from "react-icons/fi";

const CashDispatchForm = () => {
  const dateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, register } = methods;
  // generate ref id
  const generateRefId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let refId = "";
    for (let i = 0; i < 6; i++) {
      refId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return refId;
  };
  // post data on server
  const onSubmit = async (data) => {
    const refId = generateRefId();
    try {
      // --- First API: Trip Create ---
      const tripFormData = new FormData();
      for (const key in data) {
        tripFormData.append(key, data[key]);
      }
      tripFormData.append("ref_id", refId);
      const tripResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/account/create`,
        tripFormData
      );

      const tripData = tripResponse.data;

      if (tripData.status === "Success") {
        toast.success("Fund transfer successfully", {
          position: "top-right",
        });

        // --- Second API: Branch Create (only specific field) ---
        const branchFormData = new FormData();
        branchFormData.append("date", data.date);
        branchFormData.append("cash_in", data.amount);
        branchFormData.append("branch_name", data.branch);
        branchFormData.append("remarks", data.ref);
        branchFormData.append("mode", data.type);
        branchFormData.append("ref_id", refId);

        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/branch/create`,
          branchFormData
        );

        // Reset form if both succeed
        reset();
      } else {
        toast.error(
          "Trip API failed: " + (tripData.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };
  return (
    <div className="mt-10">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Fund Transfer
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mx-auto bg-gray-100 rounded-md shadow"
        >
          {/* Trip & Destination Section */}
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
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
                <InputField name="branch" label="Branch Name" required />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="person_name" label="Person Name" required />
              </div>
              <div className="w-full">
                <SelectField
                  name="type"
                  label="Cash Type"
                  required
                  options={[
                    { value: "Cash", label: "Cash" },
                    { value: "Bank", label: "Bank" },
                    { value: "Card", label: "Card" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField name="amount" label="Amount" required />
              </div>
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="bank_name" label="Bank Name" />
              </div>
              {/* <div className="w-full">
                <InputField name="cash_type" label="Cash Type" required />
              </div> */}
              <div className="w-full">
                <InputField name="ref" label="Note" required />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CashDispatchForm;
