import React, { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../../hooks/useRef";

const AttendanceForm = () => {
  const methods = useForm();
  const { handleSubmit, reset, register } = methods;
  const dateRef = useRef(null);

  const [employee, setEmployee] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => response.json())
      .then((data) => setEmployee(data.data))
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  const employeeOptions = employee.map((dt) => ({
    value: dt.full_name,
    label: dt.full_name,
  }));
  // post data on server
  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    const refId = generateRefId();
    try {
      const formData = new FormData();
      formData.append("ref_id", refId);
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/attendance/create`,
        formData
      );
      const resData = response.data;
      // console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Attendance saved successfully!", {
          position: "top-right",
        });
        reset();
      } else {
        toast.error("Server Error: " + (resData.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    }
  };
  return (
    <div className="mt-10">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Attendance Form
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
                <SelectField
                  name="name"
                  label="Name"
                  required={true}
                  options={employeeOptions}
                  // control={control}
                />
              </div>
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
            </div>
            <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="check_in" label="Check In" required />
              </div>
              {/* <div className="w-full">
                <InputField name="check_out" label="Check Out" required />
              </div> */}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-left p-5">
            <BtnSubmit>Submit</BtnSubmit>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AttendanceForm;
