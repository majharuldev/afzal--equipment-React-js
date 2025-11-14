import React, { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import toast from "react-hot-toast";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import FormSkeleton from "../../../components/Form/FormSkeleton";
import api from "../../../utils/axiosConfig";

const AdvanceSalaryForm = () => {
  const methods = useForm();
  const { handleSubmit, reset, control, setValue } = methods;
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Fetch employees & user info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, userRes] = await Promise.all([
          api.get(`/employee`),
          api.get(`/user/${userId}`),
        ]);

        if (empRes.data?.data) setEmployees(empRes.data.data);
        if (userRes.data?.name) setUserName(userRes.data.name);
      } catch (err) {
        console.error("ডাটা ফেচে সমস্যা:", err);
      }
    };
    fetchData();
  }, [userId]);

  // Fetch existing advance salary (for edit mode)
  useEffect(() => {
    const fetchAdvanceSalary = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/salaryAdvanced/${id}`);
        const data = res.data?.data;

        if (data) {
          const waitForEmployees = new Promise((resolve) => {
            const interval = setInterval(() => {
              if (employees.length > 0) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });

          await waitForEmployees;

          setValue("employee_id", data.employee_id);
          setValue("amount", data.amount);
          setValue("salary_month", data.salary_month);
          setValue("adjustment", data.adjustment);
          setValue("status", data.status);
          setValue("created_by", data.created_by);
        }
      } catch (err) {
        console.error("Advance salary fetch error:", err);
        toast.error("অগ্রিম বেতন তথ্য লোড করতে সমস্যা হয়েছে!");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvanceSalary();
  }, [id, employees, setValue]);

  // Auto set adjustment same as amount when adding new
  useEffect(() => {
    const subscription = methods.watch((value, { name }) => {
      if (name === "amount" && !id) {
        setValue("adjustment", value.amount || 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [methods, setValue, id]);

  // Submit handler
  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id,
      amount: data.amount,
      salary_month: data.salary_month,
      adjustment: data.adjustment,
      status: data.status,
      created_by: userName,
    };

    try {
      const res = id
        ? await api.put(`/salaryAdvanced/${id}`, payload)
        : await api.post(`/salaryAdvanced`, payload);

      if (res?.data?.status === "Success") {
        toast.success(
          id
            ? "অগ্রিম বেতন সফলভাবে আপডেট হয়েছে!"
            : "অগ্রিম বেতন সফলভাবে যোগ করা হয়েছে!"
        );
        reset();
        navigate("/tramessy/HR/Payroll/Advance-Salary");
        return;
      }

      toast.error(res?.data?.message || "কিছু ভুল হয়েছে!");
    } catch (err) {
      if (!err.response) {
        toast.error("ফর্ম জমা দিতে সমস্যা হয়েছে!");
      }
      console.error("Form submit error:", err);
    }
  };

  return (
    <div className="p-2">
      <FormProvider {...methods}>
        {loading && id ? (
          <div className="p-4 bg-white rounded-md shadow border-t-2 border-primary">
            <FormSkeleton />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto p-6 border-t-2 border-primary rounded-md shadow space-y-4 max-w-3xl bg-white"
          >
            <h3 className="pb-4 text-primary font-semibold text-lg">
              {id
                ? "অগ্রিম বেতন তথ্য সম্পাদনা করুন"
                : "নতুন অগ্রিম বেতন যোগ করুন"}
            </h3>

            {/* Employee + Amount */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  কর্মচারী নির্বাচন <span className="text-red-500">*</span>
                </label>
                <select
                  {...methods.register("employee_id", {
                    required: "কর্মচারী নির্বাচন আবশ্যক",
                  })}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                >
                  <option value="">কর্মচারী নির্বাচন করুন</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_name || emp.email}
                    </option>
                  ))}
                </select>
                {methods.formState.errors.employee_id && (
                  <p className="text-xs text-red-500 mt-1">
                    {methods.formState.errors.employee_id.message}
                  </p>
                )}
              </div>
              <div className="w-full">
                <InputField
                  name="amount"
                  label="অগ্রিম পরিমাণ"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Salary Month + Adjustment + Status */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="salary_month"
                  label="বেতন মাস (YYYY-MM)"
                  placeholder="2025-09"
                  required
                />
              </div>
              <div className="w-full">
                <InputField
                  name="adjustment"
                  label="সংশোধনের পরে পরিমাণ"
                  type="number"
                  required
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label="অবস্থা"
                  required
                  options={[
                    { label: "পরিশোধিত", value: "Paid" },
                    { label: "মুলতুবি", value: "Pending" },
                  ]}
                />
              </div>
            </div>

            {/* Created By (hidden) */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full hidden">
                <InputField
                  name="created_by"
                  label="Created By"
                  value={userName}
                  readOnly
                />
              </div>
            </div>

            {/* Submit */}
            <BtnSubmit>{id ? "আপডেট করুন" : "জমা দিন"}</BtnSubmit>
          </form>
        )}
      </FormProvider>
    </div>
  );
};

export default AdvanceSalaryForm;
