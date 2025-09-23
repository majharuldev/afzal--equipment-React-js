import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";

const OfficialProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const methods = useForm();
    const { handleSubmit, register, watch, reset, setValue, control } = methods;
    const purChaseDateRef = useRef(null);
    const [drivers, setDrivers] = useState([]);
    const [vehicle, setVehicle] = useState([]);
    const [branch, setBranch] = useState([]);
    const [supplier, setSupplier] = useState([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [existingImage, setExistingImage] = useState(null);

    const selectedCategory = watch("category");

    // মোট খরচ হিসাব করুন
    const quantity = parseFloat(watch("quantity") || 0);
    const unitPrice = parseFloat(watch("unit_price") || 0);
    const totalPrice = quantity * unitPrice;

    useEffect(() => {
        const totalPrice = quantity * unitPrice;
        setValue("purchase_amount", totalPrice);
    }, [quantity, unitPrice, setValue]);

    // ইমেজ প্রিভিউ
    const [previewImage, setPreviewImage] = useState(null);

    // ড্রপডাউনের জন্য ডেটা ফেচ করুন
    useEffect(() => {
        // ড্রাইভার ফেচ করুন
        fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
            .then((response) => response.json())
            .then((data) => setDrivers(data.data))
            .catch((error) => console.error("ড্রাইভার ডেটা লোড করতে ত্রুটি:", error));

        // গাড়ি ফেচ করুন
        fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
            .then((response) => response.json())
            .then((data) => setVehicle(data.data))
            .catch((error) => console.error("গাড়ির ডেটা লোড করতে ত্রুটি:", error));

        // শাখা ফেচ করুন
        fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
            .then((response) => response.json())
            .then((data) => setBranch(data.data))
            .catch((error) => console.error("শাখার ডেটা লোড করতে ত্রুটি:", error));

        // সরবরাহকারী ফেচ করুন
        fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
            .then((response) => response.json())
            .then((data) => setSupplier(data.data))
            .catch((error) => console.error("সরবরাহকারীর ডেটা লোড করতে ত্রুটি:", error));
    }, []);

    // এডিট মোডে থাকলে ক্রয় ডেটা ফেচ করুন
    useEffect(() => {
        if (isEditMode) {
            const fetchPurchaseData = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
                    );
                    const purchaseData = response.data.data;
                    console.log("ফেচ করা ক্রয় ডেটা:", purchaseData);

                    // ফর্মের মান সেট করুন
                    setValue("date", purchaseData.date);
                    setValue("category", purchaseData.category);
                    setValue("item_name", purchaseData.item_name);
                    setValue("driver_name", purchaseData.driver_name);
                    setValue("vehicle_no", purchaseData.vehicle_no);
                    setValue("branch_name", purchaseData.branch_name);
                    setValue("supplier_name", purchaseData.supplier_name);
                    setValue("quantity", purchaseData.quantity);
                    setValue("unit_price", purchaseData.unit_price);
                    setValue("purchase_amount", purchaseData.purchase_amount);
                    setValue("remarks", purchaseData.remarks);
                    setValue("priority", purchaseData.priority);

                    // ইমেজ প্রিভিউ সেট করুন যদি থাকে
                    if (purchaseData.bill_image) {
                        const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/${purchaseData.bill_image}`;
                        setPreviewImage(imageUrl);
                        setExistingImage(purchaseData.bill_image); // বিদ্যমান ইমেজের নাম সংরক্ষণ করুন
                    }

                    setIsLoading(false);
                } catch (error) {
                    console.error("ক্রয় ডেটা লোড করতে ত্রুটি:", error);
                    toast.error("ক্রয় ডেটা লোড করতে ব্যর্থ");
                    setIsLoading(false);
                }
            };

            fetchPurchaseData();
        }
    }, [id, isEditMode, setValue]);

    const driverOptions = drivers.map((driver) => ({
        value: driver.driver_name,
        label: driver.driver_name,
    }));

    const vehicleOptions = vehicle.map((dt) => ({
        value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
        label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    }));

    const branchOptions = branch.map((branch) => ({
        value: branch.branch_name,
        label: branch.branch_name,
    }));

    const supplyOptions = supplier.map((supply) => ({
        value: supply.supplier_name,
        label: supply.supplier_name,
    }));

    // যোগ এবং আপডেট উভয়ের জন্য ফর্ম জমা দিতে হ্যান্ডেল করুন
    const onSubmit = async (data) => {
        try {
            const purchaseFormData = new FormData();

            for (const key in data) {
                // ফাইল আপলোড আলাদাভাবে হ্যান্ডেল করুন
                if (key === "bill_image") {
                    // যদি নতুন ফাইল নির্বাচন করা হয়
                    if (typeof data[key] === "object") {
                        purchaseFormData.append(key, data[key]);
                    }
                    // যদি এডিট মোডে থাকে এবং নতুন ফাইল নির্বাচন না করা হয়
                    else if (isEditMode && existingImage && !data[key]) {
                        purchaseFormData.append(key, existingImage);
                    }
                } else if (data[key] !== null && data[key] !== undefined) {
                    purchaseFormData.append(key, data[key]);
                }
            }

            let response;

            if (isEditMode) {
                // বিদ্যমান ক্রয় আপডেট করুন
                response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`,
                    purchaseFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                toast.success("ক্রয় সফলভাবে আপডেট হয়েছে!", {
                    position: "top-right",
                });
            } else {
                // নতুন ক্রয় তৈরি করুন
                response = await axios.post(
                    `${import.meta.env.VITE_BASE_URL}/api/purchase/create`,
                    purchaseFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                toast.success("ক্রয় সফলভাবে জমা দেওয়া হয়েছে!", {
                    position: "top-right",
                });
            }

            reset();
            navigate("/tramessy/Purchase/official-product");
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.message || error.message || "অজানা ত্রুটি";
            toast.error("সার্ভার সমস্যা: " + errorMessage);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">ক্রয় ডেটা লোড হচ্ছে...</div>;
    }

    return (
        <div className="p-2">
            <Toaster />
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mx-auto p-6 rounded-md rounded-t-md shadow space-y-4"
                >
                    <h3 className="pb-4 text-primary font-semibold ">
                        {isEditMode ? "অফিসিয়াল ক্রয় আপডেট করুন" : "অফিসিয়াল ক্রয় যোগ করুন"}
                    </h3>
                    <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
                        {selectedCategory === "fuel"
                            ? "জ্বালানি ক্রয়"
                            : selectedCategory === "engine_oil" || selectedCategory === "parts"
                                ? "রক্ষণাবেক্ষণ"
                                : ""}
                    </h5>

                    {/* ফর্ম ফিল্ড */}
                    <div className="flex flex-col lg:flex-row justify-between gap-x-3">
                        <div className="w-full">
                            <InputField
                                name="date"
                                label="ক্রয়ের তারিখ"
                                type="date"
                                required={!isEditMode}
                                inputRef={(e) => {
                                    register("date").ref(e);
                                    purChaseDateRef.current = e;
                                }}
                                icon={
                                    <span
                                        className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                                        onClick={() => purChaseDateRef.current?.showPicker?.()}
                                    >
                                        <FiCalendar className="text-white cursor-pointer" />
                                    </span>
                                }
                            />
                        </div>
                        <div className="w-full">
                            <SelectField
                                name="category"
                                label="বিভাগ"
                                required={!isEditMode}
                                options={[
                                    { value: "It Product", label: "আইটি পণ্য" },
                                    { value: "Electrical", label: "ইলেকট্রিক্যাল" },
                                    { value: "Stationary", label: "স্টেশনারি" },

                                ]}
                            />
                        </div>
                        {selectedCategory === "parts" && (
                            <div className="w-full">
                                <InputField name="item_name" label="পণ্যের নাম" required={!isEditMode} />
                            </div>
                        )}
                    </div>

                    {/* <div className="md:flex justify-between gap-x-3">
            <div className="w-full">
              <SelectField
                name="driver_name"
                label="ড্রাইভারের নাম"
                required={!isEditMode}
                options={driverOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="vehicle_no"
                label="গাড়ির নম্বর"
                required={!isEditMode}
                options={vehicleOptions}
                control={control}
              />
            </div>
          </div> */}

                    <div className="flex flex-col lg:flex-row justify-between gap-x-3">
                        <div className="w-full">
                            <SelectField
                                name="branch_name"
                                label="শাখার নাম"
                                required={!isEditMode}
                                options={branchOptions}
                                control={control}
                            />
                        </div>
                        <div className="w-full">
                            <SelectField
                                name="supplier_name"
                                label="সাপ্লায়ার নাম"
                                required={!isEditMode}
                                options={supplyOptions}
                                control={control}
                            />
                        </div>
                        <div className="w-full">
                            <InputField
                                name="quantity"
                                label="পরিমাণ"
                                type="number"
                                required={!isEditMode}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between gap-3">
                        <div className="w-full">
                            <InputField
                                name="unit_price"
                                label="একক মূল্য"
                                type="number"
                                required={!isEditMode}
                            />
                        </div>
                        <div className="w-full">
                            <InputField
                                name="purchase_amount"
                                label="মোট"
                                readOnly
                                value={totalPrice}
                                required={!isEditMode}
                            />
                        </div>
                        <div className="w-full">
                            <InputField name="remarks" label="মন্তব্য" />
                        </div>
                        <div className="w-full">
                            <InputField name="priority" label="অগ্রাধিকার" />
                        </div>
                    </div>

                    <div className="md:flex justify-between gap-3">
                        <div className="w-full">
                            <label className="text-gray-700 text-sm font-medium">
                                বিলের ছবি {!isEditMode && "(আবশ্যক)"}
                            </label>
                            <Controller
                                name="bill_image"
                                control={control}
                                rules={isEditMode ? {} : { required: "এই ফিল্ডটি আবশ্যক" }}
                                render={({
                                    field: { onChange, ref },
                                    fieldState: { error },
                                }) => (
                                    <div className="relative">
                                        <label
                                            htmlFor="bill_image"
                                            className="border p-2 rounded w-[50%] block bg-white text-gray-300 text-sm cursor-pointer"
                                        >
                                            {previewImage ? "ছবি নির্বাচন করা হয়েছে" : "ছবি নির্বাচন করুন"}
                                        </label>
                                        <input
                                            id="bill_image"
                                            type="file"
                                            accept="image/*"
                                            ref={ref}
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setPreviewImage(url);
                                                    onChange(file);
                                                } else {
                                                    setPreviewImage(null);
                                                    onChange(null);
                                                }
                                            }}
                                        />
                                        {error && (
                                            <span className="text-red-600 text-sm">
                                                {error.message}
                                            </span>
                                        )}
                                        {/* {isEditMode && existingImage && (
                      <span className="text-green-600 text-sm">
                        বর্তমান ছবি: {existingImage}
                      </span>
                    )} */}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* প্রিভিউ */}
                    {previewImage && (
                        <div className="mt-2 relative flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewImage(null);
                                    setValue("bill_image", null);
                                    const fileInput = document.getElementById("bill_image");
                                    if (fileInput) fileInput.value = "";

                                    if (!isEditMode) {
                                        setExistingImage(null);
                                    }
                                }}
                                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                                title="ছবি সরান"
                            >
                                <IoMdClose />
                            </button>
                            <img
                                src={previewImage}
                                alt="বিল প্রিভিউ"
                                className="max-w-xs h-auto rounded border border-gray-300"
                            />
                        </div>
                    )}

                    <BtnSubmit>{isEditMode ? "ক্রয় আপডেট করুন" : "জমা দিন"}</BtnSubmit>
                </form>
            </FormProvider>
        </div>
    );
};

export default OfficialProductForm;