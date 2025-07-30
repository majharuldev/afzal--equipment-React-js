import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { MdOutlineArrowDropDown } from "react-icons/md";
import BtnSubmit from "../../../components/Button/BtnSubmit";

const GenerateSalaryForm = () => {
  const methods = useForm();
  const onSubmit = (data) => {
    // console.log("Form Data:", data);
  };
  return (
    <div className="mt-10">
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Generate salary Form
      </h3>
      <div className="mx-auto p-6 bg-gray-100 rounded-md shadow">
        <FormProvider {...methods} className="">
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField
                  name="employee_name"
                  label="Employee Name"
                  required
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="generate_alary"
                  label="Generate Salary"
                  required
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="generate_by" label="Generate By" required />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full relative">
                <SelectField
                  name="status"
                  label="Status"
                  required
                  options={[
                    { value: "", label: "Select Status..." },
                    { value: "Approved", label: "Approved" },
                    { value: "Pending", label: "Pending" },
                  ]}
                />
                <MdOutlineArrowDropDown className="absolute top-[35px] right-2 pointer-events-none text-xl text-gray-500" />
              </div>
            </div>
            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default GenerateSalaryForm;
