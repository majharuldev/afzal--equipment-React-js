import { useContext, useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
import useAdmin from "../../hooks/useAdmin";
import FormSkeleton from "../../components/Form/FormSkeleton";
import api from "../../utils/axiosConfig";

const OfficialProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useContext(AuthContext)
  const methods = useForm({
    defaultValues: {
    //   sms_sent: "yes",
    },
  });
  const isAdmin = useAdmin();
  const { handleSubmit, register, watch, reset, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [existingImage, setExistingImage] = useState(null);
// Dynamic item fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedCategory = watch("category");

  // সব items এবং service charge এর হিসাব করার জন্য
    const items = useWatch({ control, name: "items" });
    const serviceCharge = useWatch({ control, name: "service_charge" });
  
    useEffect(() => {
      const totalItemsAmount = (items || []).reduce((sum, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        return sum + quantity * unitPrice;
      }, 0);
  
      const grandTotal = totalItemsAmount + (parseFloat(serviceCharge) || 0);
      setValue("purchase_amount", grandTotal);
    }, [items, serviceCharge, setValue]);

  // Preview image
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    // Fetch drivers
    api.get(`/driver`)
      .then((res) => setDrivers(res.data))
      .catch((error) => console.error("ড্রাইভার ডেটা লোড করতে সমস্যা:", error));

    // Fetch vehicles
    api.get(`/vehicle`)
      .then((res) => setVehicle(res.data))
      .catch((error) => console.error("গাড়ির ডেটা লোড করতে সমস্যা:", error));

    // Fetch branches
    api.get(`/office`)
      .then((res) => setBranch(res.data.data))
      .catch((error) => console.error("ব্রাঞ্চ ডেটা লোড করতে সমস্যা:", error));

    // Fetch suppliers
    api.get(`/supplier`)
      .then((res) => setSupplier(res.data.data))
      .catch((error) => console.error("সাপ্লায়ার ডেটা লোড করতে সমস্যা:", error));
  }, []);

  // Fetch purchase data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPurchaseData = async () => {
        try {
          const response = await api.get(`/purchase/${id}`)
          const purchaseData = response.data.data
          const formValues = {
            date: purchaseData.date,
            category: purchaseData.category,
            item_name: purchaseData.item_name,
            branch_name: purchaseData.branch_name,
            supplier_name: purchaseData.supplier_name,
            // service_date: purchaseData.service_date,
            // next_service_date: purchaseData.next_service_date,
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
  }, [id, isEditMode, setValue]);

  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));

  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no} `,
    label: `${dt.reg_zone} ${dt.reg_serial} ${dt.reg_no} `,
  }));

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const supplyOptions = supplier.map((supply) => ({
    value: supply.supplier_name,
    label: supply.supplier_name,
  }));

  // Handle form submission for both add and update
   const onSubmit = async (data) => {
      try {
        //  তারিখ ফিল্ডগুলো লোকালাইজ করা
        ["date", "service_date", "next_service_date"].forEach((field) => {
          if (data[field]) {
            const d = new Date(data[field]);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            data[field] = d.toISOString().split("T")[0];
          }
        });
  
        const createdByValue = user?.name || user?.email || "অজানা";
        //  আইটেম অ্যারে আলাদা করে নেওয়া
        const item_name = data.items.map((item) => item.item_name);
        const quantity = data.items.map((item) => Number(item.quantity));
        const unit_price = data.items.map((item) => Number(item.unit_price));
        const total = data.items.map((item) => Number(item.quantity) * Number(item.unit_price));
  
        //  মোট পারচেজ অ্যামাউন্ট হিসাব করা
        const purchase_amount =
          total.reduce((sum, val) => sum + val, 0) + Number(data.service_charge || 0);
  
        //  ফর্মডেটা তৈরি
        const formData = new FormData();
  
        formData.append("date", data.date || "");
        formData.append("supplier_name", data.supplier_name || "");
        formData.append("category", data.category || "");
        formData.append("purchase_amount", purchase_amount);
        formData.append("service_charge", data.service_charge || 0);
        formData.append("remarks", data.remarks || "");
        formData.append("branch_name", data.branch_name || "");
        formData.append("priority", data.priority || "");
        formData.append("created_by", createdByValue);
  
        //  আইটেমগুলো আলাদা অ্যারে হিসেবে অ্যাপেন্ড করা
        item_name.forEach((name, i) => formData.append("item_name[]", name));
        quantity.forEach((q, i) => formData.append("quantity[]", q));
        unit_price.forEach((u, i) => formData.append("unit_price[]", u));
        total.forEach((t, i) => formData.append("total[]", t));
  
        if (data.bill_image instanceof File) {
          formData.append("image", data.bill_image);
        } else if (isEditMode && existingImage) {
          formData.append("existing_image", existingImage);
        }
  
        //  API কল
        const response = isEditMode
          ? await api.post(`/purchase/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          : await api.post(`/purchase`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
  
         if (response.data.success) {
        toast.success(isEditMode ? "অফিসিয়াল প্রোডাক্টস পারচেজ আপডেট করা হয়েছে!" : "অফিসিয়াল প্রোডাক্টস পারচেজ সাবমিট করা হয়েছে!");
        //  নতুন ট্রিপ হলে এবং এসএমএস সেন্ট = "হ্যাঁ" হলে এসএমএস পাঠানো
        // if (!id && !isAdmin && data.sms_sent === "yes") {
        //   const purchase = response.data.data;
        //   const purchaseId = purchase.id;
        //   const purchaseDate = purchase.date || "";
        //   const supplierName = purchase.supplier_name || "";
        //   const userName = user.name || "";
        //   const purchaseItem = purchase?.item_name || "";

        //   // মেসেজ কন্টেন্ট বিল্ড
        //   const messageContent = `প্রিয় স্যার, ${userName} দ্বারা একটি নতুন অফিসিয়াল প্রোডাক্ট তৈরি করা হয়েছে।\nপারচেজ আইডি: ${purchaseId}\nপারচেজ তারিখ: ${purchaseDate}\nসাপ্লায়ার: ${supplierName}\nপারচেজ নাম: ${purchaseItem}`;

        //   // এসএমএস কনফিগ
        //   const adminNumber = "01872121862";
        //   const API_KEY = "3b82495582b99be5";
        //   const SECRET_KEY = "ae771458";
        //   const CALLER_ID = "1234";

        //   // সঠিক URL
        //   const smsUrl = `http://smpp.revesms.com:7788/sendtext?apikey=${API_KEY}&secretkey=${SECRET_KEY}&callerID=${CALLER_ID}&toUser=${adminNumber}&messageContent=${encodeURIComponent(messageContent)}`;
        //   try {
        //     await fetch(smsUrl);
        //     toast.success("এডমিনকে এসএমএস পাঠানো হয়েছে!");
        //   } catch (smsError) {
        //     // console.error("এসএমএস পাঠাতে ব্যর্থ:", smsError);
        //   }
        // }
        navigate("/tramessy/Purchase/official-product");
        reset();
      } else {
        throw new Error(isEditMode ? "পারচেজ আপডেট করতে ব্যর্থ" : "পারচেজ তৈরি করতে ব্যর্থ");
      }
      } catch (error) {
        console.error("সমস্যা:", error);
        toast.error(error.response?.data?.message || "সার্ভার সমস্যা");
      }
    };


  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6 rounded-md shadow">
        <h3 className=" pb-4 text-primary font-semibold ">
          {isEditMode ? "অফিসিয়াল পারচেজ আপডেট করুন" : "অফিসিয়াল পারচেজ যোগ করুন"}
        </h3>
        <FormProvider {...methods}>
          {isLoading  ? (
                      <div className="p-4 bg-white rounded-md ">
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
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2  rounded-r"
                      onClick={() => purChaseDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-gray-700 cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="category"
                  label="ক্যাটাগরি"
                  required={!isEditMode}
                  options={[
                    { value: "It Product", label: "আইটি প্রোডাক্ট" },
                    { value: "Electrical", label: "ইলেকট্রিক্যাল" },
                    { value: "Stationary", label: "স্টেশনারি" },
                  ]}
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
                  label="সাপ্লায়ার নাম"
                  required={!isEditMode}
                  options={supplyOptions}
                  control={control}
                />
              </div>
            </div>
            <div>
              {/*  ডাইনামিক আইটেম ফিল্ড */}
              {(<div className="space-y-4">
                <h4 className="text-lg font-semibold text-primary">আইটেমসমূহ</h4>

                {fields.map((field, index) => {
                  const quantity = watch(`items.${index}.quantity`) || 0;
                  const unitPrice = parseFloat(watch(`items.${index}.unit_price`)) || 0;
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

            <div className="flex flex-col lg:flex-row justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="service_charge"
                  label="সার্ভিস চার্জ"
                  type="number"
                  required={false}
                />
              </div>
              <div className="w-full">
                <InputField
                  name="purchase_amount"
                  label="মোট পারচেজ অ্যামাউন্ট"
                  readOnly
                 value={watch("purchase_amount") || 0}
                  required={!isEditMode}
                />
              </div>
              <div className="w-full">
                <InputField name="remarks" label="মন্তব্য" />
              </div>
              <div className="w-full">
                <InputField type="number" name="priority" label="চালান নম্বর" />
              </div>
            </div>

            <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-gray-700 text-sm font-semibold">
                বিল ইমেজ 
              </label>
              <Controller
                name="bill_image"
                control={control}
                // rules={isEditMode ? false : { required: "এই ফিল্ডটি প্রয়োজনীয়" }}
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

            <BtnSubmit>{isEditMode ? "পারচেজ আপডেট করুন" : "সাবমিট করুন"}</BtnSubmit>
          </form>)}
        </FormProvider>
      </div>
    </div>
  );
};

export default OfficialProductForm;