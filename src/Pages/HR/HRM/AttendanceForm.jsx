import React, { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import toast from "react-hot-toast";
import { AuthContext } from "../../../providers/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";

const AdvanceSalaryForm = () => {
  const methods = useForm();
  const { handleSubmit, reset, control, setValue } = methods;
  const [employees, setEmployees] = useState([]);
  const [userName, setUserName] = useState("");
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const { id } = useParams();
  const navigate = useNavigate()
  
    // month yeayr options
    const currentYear = new Date().getFullYear();
const months = [
  { num: "01", name: "জানুয়ারি" },
  { num: "02", name: "ফেব্রুয়ারি" },
  { num: "03", name: "মার্চ" },
  { num: "04", name: "এপ্রিল" },
  { num: "05", name: "মে" },
  { num: "06", name: "জুন" },
  { num: "07", name: "জুলাই" },
  { num: "08", name: "আগস্ট" },
  { num: "09", name: "সেপ্টেম্বর" },
  { num: "10", name: "অক্টোবর" },
  { num: "11", name: "নভেম্বর" },
  { num: "12", name: "ডিসেম্বর" },
];
    const monthYearOptions = [];

    for (let y = currentYear; y <= currentYear + 10; y++) {
        months.forEach((m) => {
            monthYearOptions.push({
                value: `${y}-${m.num}`,
                label: `${y}-${m.name}`
            });
        });
    }

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
        console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (id && employees.length > 0) {
      api
        .get(`/attendence/${id}`)
        .then((res) => {
          const data = res.data?.data;
          if (data) {
            setValue("employee_id", data.employee_id);
            setValue("working_day", data.working_day);
            setValue("month", data.month);
            setValue("created_by", data.created_by);
          }
        })
        .catch(() => toast.error("অ্যাটেনডেন্স লোড করতে ব্যর্থ!"));
    }
  }, [id, employees, setValue]);

  // Submit handler (Add or Update)
  const onSubmit = async (data) => {
    const payload = {
      employee_id: data.employee_id,
      working_day: data.working_day,
      month: data.month,
      created_by: user.name,
    };

    try {
      const res = id
        ? await api.put(`/attendence/${id}`, payload)
        : await api.post(`/attendence`, payload);

      // Success check
      if (res?.data?.status === "Success") {
        toast.success(
          id
            ? "অ্যাটেনডেন্স সফলভাবে আপডেট হয়েছে!"
            : "অ্যাটেনডেন্স সফলভাবে যোগ করা হয়েছে!"
        );
        reset();
        navigate("/tramessy/HR/Payroll/Attendance");
        return;
      }

      toast.error(res?.data?.message || "কিছু সমস্যা হয়েছে!");
    } catch (err) {
      if (!err.response) {
        toast.error("অ্যাটেনডেন্স সাবমিট করতে ব্যর্থ!");
      }
      console.error("ফর্ম সাবমিট এরর:", err);
    }
  };

  return (
    <div className="p-2">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 border-t-2 border-primary rounded-md shadow space-y-4 max-w-3xl bg-white"
        >
          <h3 className="pb-4 text-primary font-semibold text-lg">
            {id
              ? "অ্যাটেনডেন্স তথ্য আপডেট করুন"
              : "অ্যাটেনডেন্স তথ্য যোগ করুন"}
          </h3>

          {/* Employee + Working Day */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                কর্মচারী নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <select
                {...methods.register("employee_id", { required: "কর্মচারী নির্বাচন আবশ্যক" })}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="">কর্মচারী নির্বাচন করুন</option>
                {employees
                  .filter(emp => emp.status === 'Active') // শুধু Active Status Employee
                  .map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employee_name || emp.email}
                    </option>
                  ))
                }
              </select>
              {methods.formState.errors.employee_id && (
                <p className="text-xs text-red-500 mt-1">
                  {methods.formState.errors.employee_id.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <InputField
                name="working_day"
                label="কার্যদিবস"
                type="number"
                required
              />
            </div>
          </div>

          {/* Salary Month */}
          <div className="md:flex justify-between gap-3">
            <div className="w-[50%]">
              {/* <InputField
                name="month"
                label="মাস (YYYY-MM)"
                placeholder="2025-09"
                required
              /> */}
              <SelectField
                name="month"
                label="মাস(YYYY-MM)"
                placeholder="মাস-বছর নির্বাচন করুন"
                required
                options={monthYearOptions}
              />
            </div>
          </div>

          {/* Created By */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full hidden">
              <InputField
                name="created_by"
                label="তৈরি করেছেন"
                value={userName}
                readOnly
              />
            </div>
          </div>

          {/* Submit */}
          <BtnSubmit> {id ? "আপডেট করুন" : "সাবমিট করুন"} </BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AdvanceSalaryForm;
