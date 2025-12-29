
import { useContext, useEffect, useRef, useState } from "react";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import { AuthContext } from "../../../providers/AuthProvider";

const AddEmployeeForm = () => {
  const { id } = useParams(); // update এর জন্য id
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [branch, setBranch] = useState([]);
  const navigate = useNavigate();
  const methods = useForm();
  const [existingImage, setExistingImage] = useState(null);
  const { handleSubmit, control, register, reset, setValue } = methods;
  const { user } = useContext(AuthContext)
  const dateRef = useRef(null);
  const joinDateRef = useRef(null);

  // Branch list
  useEffect(() => {
    api
      .get(`/office`)
      .then((res) => setBranch(res.data.data))
      .catch((err) => console.error("Branch data error:", err));
  }, []);

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }));

  // Fetch employee for update
  useEffect(() => {
    if (!id) return;
    api
      .get(`/employee/${id}`)
      .then((res) => {
        if (res.data.success) {
          const emp = res.data.data;
          reset(emp); // form set value
          if (emp.image) setPreviewImage(`${emp.image}`);
          setExistingImage(emp.image);
        }
      })
      .catch((err) => console.error("Employee fetch error:", err));
  }, [id, reset]);

  // submit function
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // সব fields যোগ করুন except image
      for (const key in data) {
        if (key !== "image") {
          formData.append(key, data[key] ?? "");
        }
      }

      // শুধুমাত্র নতুন image থাকলে image field যোগ করুন
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }
      formData.append("created_by", user.name)

      const url = id ? `/employee/${id}` : `/employee`;
      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "Success") {
        toast.success(
          id ? "Employee updated successfully!" : "Employee added successfully!"
        );
        navigate("/tramessy/HR/HRM/employee-list");
      } else {
        toast.error("Server Error: " + (response.data.message || "Unknown issue"));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Toaster position="top-center" />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 border border-gray-300 rounded-b-md rounded-t-md shadow space-y-4"
        >
          <h3 className=" pb-4 text-primary font-semibold ">
            {id ? "কর্মচারীর তথ্য আপডেট করুন" : "নতুন কর্মচারী যোগ করুন"}
          </h3>
          {/* Row 1 */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="employee_name" label="পূর্ণ নাম" required={!id} />
            </div>

            <div className="w-full">
              <InputField name="nid" label="এনআইডি" required={!id} type="number" />
            </div>
            <div className="w-full">
              <InputField name="mobile" label="মোবাইল" required={!id} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full relative">
              <SelectField
                name="blood_group"
                label="রক্তের গ্রুপ"
                required={!id}
                options={[
                  { value: "A+", label: "এ–পজিটিভ (A+)" },
                  { value: "A-", label: "এ–নেগেটিভ (A-)" },
                  { value: "B+", label: "বি–পজিটিভ (B+)" },
                  { value: "B-", label: "বি–নেগেটিভ (B-)" },
                  { value: "AB+", label: "এবি–পজিটিভ (AB+)" },
                  { value: "AB-", label: "এবি–নেগেটিভ (AB-)" },
                  { value: "O+", label: "ও–পজিটিভ (O+)" },
                  { value: "O-", label: "ও–নেগেটিভ (O-)" },
                ]}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="gender"
                label="লিঙ্গ"
                required={!id}
                options={[
                  { value: "", label: "লিঙ্গ নির্বাচন করুন" },
                  { value: "Male", label: "পুরুষ" },
                  { value: "Female", label: "মহিলা" },
                  { value: "Others", label: "অন্যান্য" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField
                name="birth_date"
                label="জন্ম তারিখ"
                type="date"
                required={!id}
                inputRef={(e) => {
                  register("birth_date").ref(e);
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

          {/* Row 3 */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="join_date"
                label="যোগদানের তারিখ"
                type="date"
                required={!id}
                inputRef={(e) => {
                  register("join_date").ref(e);
                  joinDateRef.current = e;
                }}
                icon={
                  <span
                    className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                    onClick={() => joinDateRef.current?.showPicker?.()}
                  >
                    <FiCalendar className="text-white cursor-pointer" />
                  </span>
                }
              />
            </div>
            <div className="w-full">
              <InputField name="designation" label="পদবী" required={!id} />
            </div>
            <div className="w-full">
              <InputField name="salary" label="বেতন" required={!id} />
            </div>
          </div>

          {/* Row 4 */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField name="address" label="ঠিকানা" required={!id} />
            </div>
            <div className="w-full">
              <InputField name="email" label="ইমেইল" required={false} />
            </div>
            <div className="w-full">
              <SelectField
                name="status"
                label="অবস্থা"
                required
                options={[
                  { value: "Active", label: "সক্রিয়" },
                  { value: "Inactive", label: "নিষ্ক্রিয়" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField name="employee_id" label="আইডি নম্বর" required={false} />
            </div>
          </div>
          {/* image */}
          <div className="w-full">
            <label className="text-gray-700 text-sm font-medium">ছবি</label>
            <Controller
              name="image"
              control={control}
              // rules={{ required: !id }}
              render={({ field: { onChange, ref }, fieldState: { error } }) => (
                <div className="relative">
                  <label
                    htmlFor="image"
                    className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                  >
                    {previewImage ? "ছবি নির্বাচিত" : "ছবি নির্বাচন করুন"}
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    ref={ref}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPreviewImage(URL.createObjectURL(file));
                        onChange(file);
                      } else {
                        setPreviewImage(null);
                        onChange(null);
                      }
                    }}
                  />
                  {error && <span className="text-red-600 text-sm">{error.message}</span>}
                </div>
              )}
            />
          </div>
          {/* Preview */}
          {previewImage && (
            <div className="mt-3 relative flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  setExistingImage(null);
                  document.getElementById("image").value = "";
                  setValue("image", null); // Controller কে আপডেট করুন
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="ছবি মুছে দিন"
              >
                <IoMdClose />
              </button>
              <img src={previewImage} alt="Employee Preview" className="max-w-xs h-auto rounded border border-gray-300" />
            </div>
          )}

          <BtnSubmit loading={loading}>{id ? "আপডেট করুন" : "সংরক্ষণ করুন"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddEmployeeForm;
