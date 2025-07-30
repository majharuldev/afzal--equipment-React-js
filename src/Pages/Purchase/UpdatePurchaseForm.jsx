import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useLoaderData } from "react-router-dom";

const UpdatePurchaseForm = () => {
  //   update loader data
  const updatePurchaseLoaderData = useLoaderData();
  const {
    id,
    date,
    supplier_name,
    category,
    item_name,
    quantity,
    unit_price,
    total,
    bill_image,
    remarks,
    driver_name,
    branch_name,
    vehicle_no,
  } = updatePurchaseLoaderData.data;
  const methods = useForm({
    defaultValues: { category, branch_name, supplier_name },
  });
  const { handleSubmit, register, watch, setValue, control } = methods;
  const purChaseDateRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicle, setVehicle] = useState([]);
  const [branch, setBranch] = useState([]);
  const [supplier, setSupplier] = useState([]);

  const selectedCategory = watch("category");
  // calculate Total Expense
  const qty = parseFloat(watch("quantity") || 0);
  const unitPrice = parseFloat(watch("unit_price") || 0);
  const totalPrice = qty * unitPrice;
  useEffect(() => {
    const totalPrice = qty * unitPrice;
    setValue("total", totalPrice);
  }, [qty, unitPrice, setValue]);

  // select driver from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);
  const driverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
  }));
  // select Vehicle No. from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);

  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  }));
  // select branch from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);
  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));
  // select supplier from api
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => response.json())
      .then((data) => setSupplier(data.data))
      .catch((error) => console.error("Error fetching supply data:", error));
  }, []);
  const supplyOptions = supplier.map((supply) => ({
    value: supply.contact_person_name,
    label: supply.contact_person_name,
  }));
  //  set bill image image
  const [previewImage, setPreviewImage] = useState(bill_image);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setValue("bill_image", file);
    }
  };
  // post data on server
  const onSubmit = async (data) => {
    // console.log("purchase", data);
    try {
      const purchaseFormData = new FormData();
      // Append form fields
      for (const key in data) {
        purchaseFormData.append(key, data[key]);
      }
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`,
        purchaseFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Purchase submitted successfully!", {
        position: "top-right",
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };

  return (
    <div className="mt-10">
      <Toaster />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Purchase Information
      </h3>
      <FormProvider {...methods} className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4"
        >
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="date"
                label="Purchase Date"
                type="date"
                defaultValue={date}
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
                label="Category"
                defaultValue={category}
                options={[
                  { value: "Fuel", label: "Fuel" },
                  { value: "Engine Oil", label: "Engine Oil" },
                  { value: "Parts", label: "Parts" },
                  { value: "Stationary", label: "Stationary" },
                  { value: "Snacks", label: "Snacks" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "Furniture", label: "Furniture" },
                ]}
              />
            </div>
            <div className="w-full">
              <InputField
                name="item_name"
                label="Item Name"
                defaultValue={item_name}
              />
            </div>
          </div>
          {/* Engine Oil category */}
          {selectedCategory === "Engine Oil" && (
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="driver_name"
                  label="Driver Name"
                  defaultValue={driver_name}
                  options={driverOptions}
                  control={control}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="vehicle_no"
                  label="Vehicle No."
                  defaultValue={vehicle_no}
                  options={vehicleOptions}
                  control={control}
                />
              </div>
            </div>
          )}

          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <SelectField
                name="branch_name"
                label="Branch Name"
                defaultValue={branch_name}
                options={branchOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <SelectField
                name="supplier_name"
                label="Supplier Name"
                defaultValue={supplier_name}
                options={supplyOptions}
                control={control}
              />
            </div>
            <div className="w-full">
              <InputField
                name="quantity"
                label="Quantity"
                defaultValue={quantity}
              />
            </div>
          </div>
          {/*  */}
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <InputField
                name="unit_price"
                label="Unit Price"
                defaultValue={unit_price}
              />
            </div>
            <div className="w-full">
              <InputField
                name="total"
                label="Total"
                readOnly
                defaultValue={total}
                value={totalPrice}
              />
            </div>
            <div className="w-full">
              <InputField
                name="remarks"
                label="Remark"
                defaultValue={remarks}
              />
            </div>
          </div>
          <div className="md:flex justify-between gap-3">
            <div className="w-full">
              <label className="text-primary text-sm font-semibold">
                Bill Image
              </label>
              <Controller
                name="bill_image"
                control={control}
                render={({ fieldState: { error } }) => (
                  <div className="relative">
                    <label
                      htmlFor="bill_image"
                      className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                    >
                      {previewImage ? "Image selected" : "Choose image"}
                    </label>
                    <input
                      {...register("bill_image")}
                      id="bill_image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {error && (
                      <span className="text-red-600 text-sm">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
          {/* Preview */}
          {previewImage && (
            <div className="mt-3 relative flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(null);
                  document.querySelector('input[type="file"]').value = null;
                  setValue("bill_image", null);
                }}
                className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                title="Remove image"
              >
                <IoMdClose />
              </button>
              <img
                src={
                  previewImage?.startsWith("blob:")
                    ? previewImage
                    : `${import.meta.env.VITE_BASE_URL}/public/uploads/purchase/${previewImage}`
                }
                alt="License Preview"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}
          <BtnSubmit>Submit</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default UpdatePurchaseForm;
