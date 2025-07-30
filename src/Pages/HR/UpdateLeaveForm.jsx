import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../hooks/useRef";
import axios from "axios";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { useEffect, useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { useLoaderData } from "react-router-dom";

const UpdateLeaveForm = () => {
  //   update loader data
  const updateLeaveLoaderData = useLoaderData();
  const {
    id,
    name,
    apply_date,
    leave_from,
    leave_to,
    leave_type,
    remark,
    status,
  } = updateLeaveLoaderData.data;

  const methods = useForm({ defaultValue: { name, status } });
  const { handleSubmit, reset, control, register } = methods;
  const applyDateRef = useRef(null);
  const leaveFromDateRef = useRef(null);
  const leaveToDateRef = useRef(null);
  // select employee from api
  const [employee, setEmployee] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/employee/list`)
      .then((response) => response.json())
      .then((data) => setEmployee(data.data))
      .catch((error) => console.error("Error fetching employee data:", error));
  }, []);

  const driverOptions = employee.map((name) => ({
    value: name.full_name,
    label: name.full_name,
  }));

  const generateRefId = useRefId();
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", generateRefId());
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/leave/update/${id}`,
        formData
      );
      const resData = response.data;
      // console.log("resData", resData);
      if (resData.status === "Success") {
        toast.success("Leave application update successfully!", {
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
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Leave Application
      </h3>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4"
        >
          {/* Row 1: Full Name, Apply Date */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <SelectField
                name="name"
                label="Full Name"
                // todo
                defaultValue={name}
                options={driverOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField
                name="apply_date"
                label="Apply Date"
                type="date"
                defaultValue={apply_date}
                inputRef={(e) => {
                  register("apply_date").ref(e);
                  applyDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => applyDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
          </div>

          {/* Row 2: Leave Type, Leave From */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="leave_type"
                label="Leave Type"
                defaultValue={leave_type}
              />
            </div>
            <div className="w-full">
              <InputField
                name="leave_from"
                label="Leave From"
                type="date"
                defaultValue={leave_from}
                inputRef={(e) => {
                  register("leave_from").ref(e);
                  leaveFromDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => leaveFromDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
          </div>

          {/* Row 3: Leave To, Remark */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="leave_to"
                label="Leave To"
                type="date"
                defaultValue={leave_to}
                inputRef={(e) => {
                  register("leave_to").ref(e);
                  leaveToDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => leaveToDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <InputField name="remark" label="Remark" defaultValue={remark} />
            </div>
            <div className="w-full z-50">
              <SelectField
                name="status"
                label="Status"
                defaultValue={status}
                options={[
                  { value: "Approve", label: "Approve" },
                  { value: "Pending", label: "Pending" },
                ]}
              />
            </div>
          </div>
          {/* Submit Button */}
          <div className="text-left">
            <BtnSubmit>Submit</BtnSubmit>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdateLeaveForm;
