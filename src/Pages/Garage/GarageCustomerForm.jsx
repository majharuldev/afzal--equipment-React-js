import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";

const GarageCustomerForm = () => {
    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const dateRef = useRef(null);
    const methods = useForm();
    const navigate = useNavigate();
    const { id } = useParams(); // Update হলে আইডি আসবে
    const { handleSubmit, reset, register, setValue } = methods;
    const generateRefId = useRefId();

    // যদি Update মোড হয়, তাহলে ডাটা লোড করবো
    useEffect(() => {
        if (id) {
            setIsEdit(true);
            axios
                .get(`${import.meta.env.VITE_BASE_URL}/api/customer/show/${id}`)
                .then((res) => {
                    if (res.data.status === "Success") {
                        const customer = res.data.data;
                        Object.keys(customer).forEach((key) => {
                            setValue(key, customer[key]);
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("গ্রাহকের তথ্য আনা যায়নি");
                });
        }
    }, [id, setValue]);

    // সাবমিট ফাংশন (Add & Update)
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }
            if (!isEdit) {
                formData.append("ref_id", generateRefId());
            }

            const url = isEdit
                ? `${import.meta.env.VITE_BASE_URL}/api/customer/update/${id}`
                : `${import.meta.env.VITE_BASE_URL}/api/customer/create`;

            const response = await axios.post(url, formData);
            const resData = response.data;

            if (resData.status === "Success") {
                toast.success(
                    isEdit
                        ? "গ্রাহকের তথ্য সফলভাবে হালনাগাদ হয়েছে!"
                        : "গ্রাহকের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!"
                );
                reset();
                navigate("/tramessy/Customer");
            } else {
                toast.error("সার্ভার সমস্যা: " + (resData.message || "অজানা ত্রুটি"));
            }
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message || error.message || "অজানা ত্রুটি";
            toast.error("সার্ভার সমস্যা: " + errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="">
            <Toaster />

            <div className="mx-auto p-6 rounded-b-md rounded-t-md shadow border border-gray-300">
                <h3 className=" pb-4 text-primary font-semibold ">
                    {isEdit ? "কাস্টমার তথ্য আপডেট করুন" : "নতুন কাস্টমার তথ্য যোগ করুন"}
                </h3>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="md:flex justify-between gap-3">
                            <div className="w-full">
                                <InputField
                                    name="date"
                                    label="তারিখ"
                                    type="date"
                                    required
                                    inputRef={(e) => {
                                        register("date").ref(e);
                                        dateRef.current = e;
                                    }}

                                />
                            </div>
                            <div className="w-full relative">
                                <InputField name="customer_name" label="কাস্টমার নাম" required />
                            </div>
                            <div className="mt-3 md:mt-0 w-full relative">
                                <InputField name="mobile" label="মোবাইল" required />
                            </div>
                            <div className="w-full">
                                <SelectField
                                    name="month"
                                    label="মাস"
                                    required
                                    options={[
                                        { value: "January", label: "জানুয়ারি" },
                                        { value: "February", label: "ফেব্রুয়ারি" },
                                        { value: "March", label: "মার্চ" },
                                        { value: "April", label: "এপ্রিল" },
                                        { value: "May", label: "মে" },
                                        { value: "June", label: "জুন" },
                                        { value: "July", label: "জুলাই" },
                                        { value: "August", label: "আগস্ট" },
                                        { value: "September", label: "সেপ্টেম্বর" },
                                        { value: "October", label: "অক্টোবর" },
                                        { value: "November", label: "নভেম্বর" },
                                        { value: "December", label: "ডিসেম্বর" },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="mt-1 md:flex justify-between gap-3">

                            <div className="mt-3 md:mt-0 w-full relative">
                                <InputField name="equipment_category" label="ইকুইপমেন্ট ক্যাটাগরি" />
                            </div>
                            <div className="w-full relative">
                                <InputField name="equipment_no" label="ইকুইপমেন্ট নম্বর" required />
                            </div>
                            <div className="w-full relative">
                                <InputField name="equipment_qty" label="ইকুইপমেন্ট সংখ্যা" required />
                            </div>
                        </div>

                        <div className="mt-1 md:flex justify-between gap-3">
                            <div className="w-full relative">
                                <InputField name="address" label="ঠিকানা" required />
                            </div>
                            <div className="w-full relative">
                                <InputField name="amount" label="পরিমাণ" required />
                            </div>
                            <div className="w-full">
                                <SelectField
                                    name="status"
                                    label="অবস্থা"
                                    required
                                    options={[
                                        { value: "Active", label: "সক্রিয়" },
                                        { value: "Inactive", label: "নিষ্ক্রিয়" },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* সাবমিট বাটন */}
                        <div className="text-left">
                            <BtnSubmit loading={loading}>
                                {isEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                            </BtnSubmit>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};

export default GarageCustomerForm;
