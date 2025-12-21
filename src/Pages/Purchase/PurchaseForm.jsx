
import { useContext, useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import useAdmin from "../../hooks/useAdmin";
import { AuthContext } from "../../providers/AuthProvider";
import { IoMdClose } from "react-icons/io";
import FormSkeleton from "../../components/Form/FormSkeleton";
import api from "../../utils/axiosConfig";
import { number } from "prop-types";
import { toNumber } from "../../hooks/toNumber";

const PurchaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const isAdmin = useAdmin();
  const { user } = useContext(AuthContext)
  const methods = useForm({
    defaultValues: {
      sms_sent: "yes",
      items: [{ item_name: "", quantity: 0, unit_price: 0, total: 0 }],
    },
  });

  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingImage, setExistingImage] = useState(null);

  const selectedCategory = watch("category");
  const selectedVehicle = watch("vehicle_no");
  // মোট খরচ হিসাব
  const quantity = toNumber(watch("quantity") || 0);
  const unitPrice = toNumber(watch("unit_price") || 0);
  const totalPrice = quantity * unitPrice;

  // ডাইনামিক আইটেম ফিল্ড
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // সব আইটেম এবং সার্ভিস চার্জের হিসাব করার জন্য
  const items = useWatch({ control, name: "items" });
  const serviceCharge = useWatch({ control, name: "service_charge" });

  useEffect(() => {
    const totalItemsAmount = (items || []).reduce((sum, item) => {
      const quantity = toNumber(item.quantity) || 0;
      const unitPrice = toNumber(item.unit_price) || 0;
      return sum + quantity * unitPrice;
    }, 0);

    const grandTotal = totalItemsAmount + (toNumber(serviceCharge) || 0);
    setValue("purchase_amount", grandTotal);
  }, [items, serviceCharge, setValue]);


   useEffect(() => {
    if (watch("vehicle_no")) {
      const selectedVehicleData = vehicle.find(
        (v) => `${v.reg_zone} ${v.reg_serial} ${v.reg_no}`.trim() === watch("vehicle_no").trim(),
      )
      if (selectedVehicleData) {
        setValue("vehicle_category", selectedVehicleData.vehicle_category || "")
        setValue("driver_name", selectedVehicleData.driver_name || "")
      }
    }
  }, [vehicle, watch("vehicle_no"), setValue])


  // ইমেজ প্রিভিউ
  const [previewImage, setPreviewImage] = useState(null);

  // ড্রপডাউনের জন্য ডেটা ফেচ
  useEffect(() => {
    // ড্রাইভার ফেচ
    api.get(`/driver`)
      .then((res) => setDrivers(res.data))
      .catch((error) => console.error("ড্রাইভার ডেটা লোড করতে সমস্যা:", error));

    // গাড়ি ফেচ
    api.get(`/vehicle`)
      .then((res) => setVehicle(res.data))
      .catch((error) => console.error("গাড়ির ডেটা লোড করতে সমস্যা:", error));

    // ব্রাঞ্চ ফেচ
    api.get(`/office`)
      .then((res) => setBranch(res.data.data))
      .catch((error) => console.error("ব্রাঞ্চ ডেটা লোড করতে সমস্যা:", error));

    // সাপ্লায়ার ফেচ
    api.get(`/supplier`)
      .then((res) => setSupplier(res.data.data))
      .catch((error) => console.error("সাপ্লায়ার ডেটা লোড করতে সমস্যা:", error));
  }, []);

  // এডিট মোড হলে পারচেজ ডেটা ফেচ
  useEffect(() => {
    if (isEditMode && vehicle.length > 0) {
      const fetchPurchaseData = async () => {
        try {
          const response = await api.get(`/purchase/${id}`)
          const purchaseData = response.data.data
          console.log("ফেচ করা পারচেজ ডেটা:", purchaseData)

          const formValues = {
            date: purchaseData.date,
            category: purchaseData.category,
            item_name: purchaseData.item_name,
            driver_name: purchaseData.driver_name,
            vehicle_category: purchaseData.vehicle_category,
            vehicle_no: purchaseData.vehicle_no,
            branch_name: purchaseData.branch_name,
            supplier_name: purchaseData.supplier_name,
            quantity: purchaseData.quantity,
            service_date: purchaseData.service_date,
            next_service_date: purchaseData.next_service_date,
            unit_price: purchaseData.unit_price,
            last_km: purchaseData.last_km,
            next_km: purchaseData.next_km,
            purchase_amount: purchaseData.purchase_amount,
            remarks: purchaseData.remarks,
            priority: purchaseData.priority,
            created_by: purchaseData.created_by,
            service_charge: purchaseData.service_charge,
            items:
              purchaseData.items && purchaseData.items.length > 0
                ? purchaseData.items
                : [{ item_name: "", quantity: 0, unit_price: 0, total: 0 }],
          }

          reset(formValues)

          if (purchaseData.image) {
            const imageUrl = `https://afzalcons.com/backend/uploads/purchase/${purchaseData.image}`
            setPreviewImage(imageUrl)
            setExistingImage(purchaseData.image)
          }

          setIsLoading(false)
        } catch (error) {
          console.error("পারচেজ ডেটা লোড করতে সমস্যা:", error)
          toast.error("পারচেজ ডেটা লোড করতে ব্যর্থ")
          setIsLoading(false)
        }
      }

      fetchPurchaseData()
    }
  }, [id, isEditMode, vehicle, reset])

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

 const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no}`,
    label: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no}`,
  }))

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const supplyOptions = supplier.map((supply) => ({
    value: supply.supplier_name,
    label: supply.supplier_name,
  }));


  // ফর্ম সাবমিশন হ্যান্ডেল (এডিট এবং অ্যাড উভয়ের জন্য)
  const onSubmit = async (data) => {
    try {
      // তারিখ ফিল্ডগুলো লোকালাইজ করা
      ["date", "service_date", "next_service_date"].forEach((field) => {
        if (data[field]) {
          const d = new Date(data[field]);
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
          data[field] = d.toISOString().split("T")[0];
        }
      });

    const createdByValue = user?.name || user?.email ;
      // আইটেম অ্যারে আলাদা করে নেওয়া
      const item_name = data.items.map((item) => item.item_name);
      const quantity = data.items.map((item) => toNumber(item.quantity));
      const unit_price = data.items.map((item) => toNumber(item.unit_price));
      const total = data.items.map((item) => toNumber(item.quantity) * toNumber(item.unit_price));

      // মোট পারচেজ অ্যামাউন্ট হিসাব
      const purchase_amount =
        total.reduce((sum, val) => sum + val, 0) + toNumber(data.service_charge || 0);

      // ফর্মডেটা তৈরি
      const formData = new FormData();

      formData.append("date", data.date || "");
      formData.append("supplier_name", data.supplier_name || "");
      formData.append("category", data.category || "");
      formData.append("purchase_amount", purchase_amount);
      formData.append("service_charge", data.service_charge || 0);
      formData.append("remarks", data.remarks || "");
      formData.append("driver_name", data.driver_name || "");
      formData.append("branch_name", data.branch_name || "");
      formData.append("vehicle_no", data.vehicle_no || "");
      formData.append("vehicle_category", data.vehicle_category || "");
      formData.append("priority", data.priority || "");
      formData.append("validity", data.validity || "");
      formData.append("next_service_date", data.next_service_date || "");
      formData.append("service_date", data.service_date || "");
      formData.append("last_km", data.last_km || 0);
      formData.append("next_km", data.next_km || 0);
      formData.append("created_by", createdByValue);

      // আইটেমগুলো আলাদা অ্যারে হিসেবে অ্যাপেন্ড
      item_name.forEach((name, i) => formData.append("item_name[]", name));
      quantity.forEach((q, i) => formData.append("quantity[]", q));
      unit_price.forEach((u, i) => formData.append("unit_price[]", u));
      total.forEach((t, i) => formData.append("total[]", t));

      if (data.bill_image instanceof File) {
        formData.append("image", data.bill_image);
      } else if (isEditMode && existingImage) {
        formData.append("existing_image", existingImage);
      }


      // API কল
      const response = isEditMode
        ? await api.post(`/purchase/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        : await api.post(`/purchase`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      if (response.data.success) {
        toast.success(isEditMode ? "পারচেজ আপডেট করা হয়েছে!" : "পারচেজ সাবমিট করা হয়েছে!");
        // নতুন ট্রিপ হলে এবং এসএমএস সেন্ট = "হ্যাঁ" হলে এসএমএস পাঠানো
    //     if (!id && !isAdmin && data.sms_sent === "yes") {
    //       const purchase = response.data.data; // ব্যাকএন্ড থেকে ক্রিয়েটেড ট্রিপ ডেটা রিটার্ন করে
    //       const purchaseId = purchase.id;
    //       const purchaseDate = purchase.date || "";
    //       const supplierName = purchase.supplier_name || "";
    //       const userName = user.name || "";
    //       const purchaseCategory = purchase?.category || "";
    //       const vehicleNo = purchase?.vehicle_no || "";
    //     // মেসেজ কন্টেন্ট বিল্ড
    //  const messageContent = `প্রিয় স্যার, ${userName} দ্বারা একটি নতুন মেইনটেনেন্স তৈরি করা হয়েছে।\nপারচেজ আইডি: ${purchaseId}\nপারচেজ তারিখ: ${purchaseDate}\nসাপ্লায়ার: ${supplierName}\nগাড়ি: ${vehicleNo}\nপারচেজ নাম: ${purchaseCategory}`;
    //      // এসএমএস কনফিগ
    //       const adminNumber = "01872121862"; // বা কমা দিয়ে আলাদা করা একাধিক নাম্বার
    //       const API_KEY = "3b82495582b99be5";
    //       const SECRET_KEY = "ae771458";
    //       const CALLER_ID = "1234";
    //        // সঠিক URL (আপনার দেওয়া উদাহরণের মতো স্ট্রাকচার)
    //       const smsUrl = `http://smpp.revesms.com:7788/sendtext?apikey=${API_KEY}&secretkey=${SECRET_KEY}&callerID=${CALLER_ID}&toUser=${adminNumber}&messageContent=${encodeURIComponent(messageContent)}`;
    //       try {
    //         await fetch(smsUrl);
    //         toast.success("এডমিনকে এসএমএস পাঠানো হয়েছে!");
    //       } catch (smsError) {
    //         // console.error("এসএমএস পাঠাতে ব্যর্থ:", smsError);
    //         // toast.error("ট্রিপ সেভ হয়েছে, কিন্তু এসএমএস পাঠানো যায়নি।");
    //       }
    //     }
     navigate("/tramessy/Purchase/maintenance");
        reset();
      } else {
        throw new Error("পারচেজ সেভ করতে ব্যর্থ");
      }
    } catch (error) {
      console.error("সমস্যা:", error);
      toast.error(error.response?.data?.message || "সার্ভার সমস্যা");
    }
  };


  // if (isLoading) {
  //   return <div className="flex justify-center items-center h-64">পারচেজ ডেটা লোড হচ্ছে...</div>;
  // }

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6  rounded-md shadow">
        <h3 className=" pb-4 text-primary font-semibold">
          {isEditMode ? "মেইনটেনেন্স পারচেজ আপডেট করুন" : "মেইনটেনেন্স পারচেজ যোগ করুন"}
        </h3>
        <FormProvider {...methods}>
          {isLoading  ? (
            <div className="p-4 bg-white rounded-md">
              <FormSkeleton />
            </div>
          ) : (<form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto p-6 space-y-4"
          >
            <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
              {selectedCategory === "fuel"
                ? "জ্বালানি পারচেজ"
                : selectedCategory === "engine_oil" || selectedCategory === "parts"
                  ? "মেইনটেনেন্স"
                  : ""}
            </h5>

            {/* ফর্ম ফিল্ড */}
            <div className="flex flex-col lg:flex-row justify-between gap-x-3">
              <div className="w-full">
                <InputField
                  name="date"
                  label="পারচেজ তারিখ"
                  type="date"
                  required={!isEditMode}
                  inputRef={(e) => {
                    register("date").ref(e);
                    purChaseDateRef.current = e;
                  }}

                />
              </div>
              <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="ব্রাঞ্চ নাম"
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
            </div>

            <div className="md:flex justify-between gap-x-3">
              <div className="w-full">
                <SelectField
                  name="vehicle_no"
                  label="ইকুইপমেন্ট/গাড়ি নম্বর"
                  required={false}
                  options={vehicleOptions}
                  control={control}
                  defaultValue={watch("vehicle_no")}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="category"
                  label="ক্যাটাগরি"
                  required={!isEditMode}
                  options={[
                    { value: "engine_oil", label: "ইঞ্জিন অয়েল" },
                    { value: "parts", label: "পার্টস" },
                    { value: "documents", label: "ডকুমেন্টস" },
                  ]}
                />
              </div>
              {/* {selectedCategory === "parts" || selectedCategory==="documents" && (
                <div className="w-full">
                  <InputField name="item_name" label="আইটেম নাম" required={!isEditMode} />
                </div>
              )} */}
              <div className="w-full">
                <InputField
                  name="service_charge"
                  label="সার্ভিস চার্জ"
                  type="number"
                  required={false}
                />
              </div>

              <div className="w-full hidden">
                <InputField
                  name="driver_name"
                  label="ড্রাইভার নাম"
                  required={!isEditMode}
                  // options={driverOptions}
                  control={control}
                />
              </div>
              {/* গাড়ি ক্যাটাগরি লুকানো ফিল্ড */}
              <div className="w-full hidden">
                <InputField
                  name="vehicle_category"
                  label="গাড়ি ক্যাটাগরি"
                  value={watch("vehicle_category") || ""}
                  readOnly
                  {...register("vehicle_category")}
                />
              </div>
            </div>
            <div>
              {/* ডাইনামিক আইটেম ফিল্ড */}
              {(<div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">আইটেমসমূহ</h4>

                {fields.map((field, index) => {
                  const quantity = watch(`items.${index}.quantity`) || 0;
                  const unitPrice = toNumber(watch(`items.${index}.unit_price`)) || 0;
                  const total = quantity * unitPrice;

                  return (
                    <div key={field.id} className="flex flex-col md:flex-row gap-3 border border-gray-300 p-3 rounded-md relative">
                      <InputField name={`items.${index}.item_name`} label="আইটেম নাম" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.quantity`} label="পরিমাণ" type="number" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.unit_price`} label="ইউনিট প্রাইস" type="number" required={!isEditMode} className="!w-full" />
                      <InputField name={`items.${index}.total`} label="মোট" readOnly value={total} className="!salw-full" />

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => append({ item_name: "", quantity: 0, unit_price: 0, total: 0 })}
                  className="bg-primary text-white px-3 py-1 rounded-md hover:bg-primary/80"
                >
                  + আইটেম যোগ করুন
                </button>
              </div>)}
            </div>

            <div className="flex flex-col lg:flex-row  gap-x-3">
              <div className="w-full">
                <InputField
                  name="purchase_amount"
                  label="মোট পারচেজ অ্যামাউন্ট"
                  readOnly
                  value={watch("purchase_amount") || 0}
                  required={!isEditMode}
                />
              </div>
              {selectedCategory !== "documents" && (<div className="flex gap-x-3 flex-col lg:flex-row w-full">
                <div className="w-full">
                  <InputField
                    name="service_date"
                    label="সার্ভিস তারিখ"
                    type="date"
                    required={false}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="next_service_date"
                    label="পরবর্তী সার্ভিস তারিখ"
                    type="date"
                    required={false}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
              </div>)}
              {selectedCategory === "documents" && (<div className="flex flex-col lg:flex-row gap-x-3 w-full">

                <div className="w-full">
                  <InputField
                    name="service_date"
                    label="ডকুমেন্ট রিনিউ তারিখ"
                    type="date"
                    required={false}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="next_service_date"
                    label="ডকুমেন্ট এক্সপায়ার তারিখ"
                    type="date"
                    required={false}
                    inputRef={(e) => {
                      register("date").ref(e);
                      purChaseDateRef.current = e;
                    }}

                  />
                </div>
              </div>)}

            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-3">
              {selectedCategory !== "documents" && (<div className="w-full">
                <InputField
                  name="last_km"
                  label="শেষ কিলোমিটার"
                  required={false}
                  type="number"
                />
              </div>)}
              {selectedCategory !== "documents" && (<div className="w-full">
                <InputField
                  name="next_km"
                  label="পরবর্তী কিলোমিটার"
                  required={false}
                  type="number"
                />
              </div>)}
              <div className="w-full">
                <InputField name="remarks" label="মন্তব্য" />
              </div>
              <div className="w-full">
                <InputField type="number" name="priority" label="চালান নম্বর" />
              </div>
            </div>
            {/* {!isAdmin && <div className="mt-4">
              <h3 className="text-secondary font-medium mb-2">এসএমএস পাঠানো হবে</h3>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="yes"
                    {...methods.register("sms_sent", { required: true })}
                  />
                  হ্যাঁ
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="no"
                    {...methods.register("sms_sent", { required: true })}
                  />
                  না
                </label>
              </div>
            </div>} */}

            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  বিল ইমেজ
                </label>
                <Controller
                  name="bill_image"
                  control={control}
                  // rules={isEditMode ? {} : { required: "এই ফিল্ডটি প্রয়োজনীয়" }}
                  render={({
                    field: { onChange, ref },
                    fieldState: { error },
                  }) => (
                    <div className="relative">
                      <label
                        htmlFor="bill_image"
                        className="border p-2 rounded w-[50%] block bg-white text-gray-300 text-sm cursor-pointer"
                      >
                        {previewImage ? "ইমেজ সিলেক্ট করা হয়েছে" : "ইমেজ সিলেক্ট করুন"}
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
                      {isEditMode && existingImage && (
                        <span className="text-green-600 text-sm">
                          বর্তমান ইমেজ: {existingImage}
                        </span>
                      )}
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
                  title="ইমেজ সরান"
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

            <BtnSubmit>{isEditMode ? "পারচেজ আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
          </form>)}
        </FormProvider>
      </div>
    </div>
  );
};

export default PurchaseForm;