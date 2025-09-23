// import { useEffect, useRef, useState } from "react";
// import BtnSubmit from "../../components/Button/BtnSubmit";
// import { Controller, FormProvider, useForm } from "react-hook-form";
// import { InputField, SelectField } from "../../components/Form/FormFields";
// import { FiCalendar } from "react-icons/fi";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import { IoMdClose } from "react-icons/io";
// import { useNavigate, useParams } from "react-router-dom";
// import { Card, Form, Input, Select, DatePicker, Button, Row, Col, Upload } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const { Option } = Select;
// const { TextArea } = Input;

// const PurchaseForm = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEditMode = Boolean(id);

//   const methods = useForm();
//   const { handleSubmit, watch, reset, setValue, control } = methods;
//   const [drivers, setDrivers] = useState([]);
//   const [vehicle, setVehicle] = useState([]);
//   const [branch, setBranch] = useState([]);
//   const [supplier, setSupplier] = useState([]);
//   const [isLoading, setIsLoading] = useState(isEditMode);
//   const [existingImage, setExistingImage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [form] = Form.useForm();

//   const selectedCategory = watch("category");
//   const selectedVehicle = watch("vehicle_no");

//   // Calculate Total Expense
//   const quantity = parseFloat(watch("quantity") || 0);
//   const unitPrice = parseFloat(watch("unit_price") || 0);
//   const totalPrice = quantity * unitPrice;

//   useEffect(() => {
//     const totalPrice = quantity * unitPrice;
//     setValue("purchase_amount", totalPrice);
//   }, [quantity, unitPrice, setValue]);

//   // Set vehicle category when vehicle is selected
//   useEffect(() => {
//     if (selectedVehicle) {
//       const selectedVehicleData = vehicle.find(
//         (v) =>
//           `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`.trim() ===
//           selectedVehicle.trim()
//       );
//       if (selectedVehicleData) {
//         setValue("vehicle_category", selectedVehicleData.vehicle_category, {
//           shouldValidate: true,
//           shouldDirty: true,
//         });
//       } else {
//         setValue("vehicle_category", "");
//       }
//     } else {
//       setValue("vehicle_category", "");
//     }
//   }, [selectedVehicle, vehicle, setValue]);

//   // Fetch data for dropdowns
//   useEffect(() => {
//     // Fetch drivers
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
//       .then((response) => response.json())
//       .then((data) => setDrivers(data.data))
//       .catch((error) => console.error("Error fetching driver data:", error));

//     // Fetch vehicles
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
//       .then((response) => response.json())
//       .then((data) => setVehicle(data.data))
//       .catch((error) => console.error("Error fetching vehicle data:", error));

//     // Fetch branches
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
//       .then((response) => response.json())
//       .then((data) => setBranch(data.data))
//       .catch((error) => console.error("Error fetching branch data:", error));

//     // Fetch suppliers
//     fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
//       .then((response) => response.json())
//       .then((data) => setSupplier(data.data))
//       .catch((error) => console.error("Error fetching supply data:", error));
//   }, []);

//   // Fetch purchase data if in edit mode
//   useEffect(() => {
//     if (isEditMode) {
//       const fetchPurchaseData = async () => {
//         try {
//           const response = await axios.get(
//             `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
//           );
//           const purchaseData = response.data.data;

//           // Set form values
//           setValue("date", purchaseData.date);
//           setValue("category", purchaseData.category);
//           setValue("item_name", purchaseData.item_name);
//           setValue("driver_name", purchaseData.driver_name);
//           setValue("vehicle_no", purchaseData.vehicle_no);
//           setValue("vehicle_category", purchaseData.vehicle_category);
//           setValue("branch_name", purchaseData.branch_name);
//           setValue("supplier_name", purchaseData.supplier_name);
//           setValue("quantity", purchaseData.quantity);
//           setValue("unit_price", purchaseData.unit_price);
//           setValue("purchase_amount", purchaseData.purchase_amount);
//           setValue("remarks", purchaseData.remarks);
//           setValue("priority", purchaseData.priority);

//           // Set image preview if exists
//           if (purchaseData.bill_image) {
//             const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/${purchaseData.bill_image}`;
//             setPreviewImage(imageUrl);
//             setExistingImage(purchaseData.bill_image);
//           }

//           setIsLoading(false);
//         } catch (error) {
//           console.error("Error fetching purchase data:", error);
//           toast.error("Failed to load purchase data");
//           setIsLoading(false);
//         }
//       };

//       fetchPurchaseData();
//     }
//   }, [id, isEditMode, setValue]);

//   const driverOptions = drivers.map((driver) => ({
//     value: driver.driver_name,
//     label: driver.driver_name,
//   }));

//   const vehicleOptions = vehicle.map((dt) => ({
//     value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
//     label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
//     category: dt.vehicle_category
//   }));

//   const branchOptions = branch.map((branch) => ({
//     value: branch.branch_name,
//     label: branch.branch_name,
//   }));

//   const supplyOptions = supplier.map((supply) => ({
//     value: supply.supplier_name,
//     label: supply.supplier_name,
//   }));

//   // Handle form submission for both add and update
//   const onSubmit = async (data) => {
//     try {
//       const purchaseFormData = new FormData();

//       // Append all fields, including vehicle_category
//       for (const key in data) {
//         if (key === "bill_image") {
//           if (typeof data[key] === "object" && data[key]) {
//             purchaseFormData.append(key, data[key]);
//           } else if (isEditMode && existingImage && !data[key]) {
//             purchaseFormData.append(key, existingImage);
//           }
//         } else if (data[key] !== null && data[key] !== undefined) {
//           purchaseFormData.append(key, data[key]);
//         }
//       }

//       let response;

//       if (isEditMode) {
//         // Update existing purchase
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`,
//           purchaseFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         toast.success("মেইনটেনেন্স সফলভাবে আপডেট করা হয়েছে!", {
//           position: "top-right",
//         });
//       } else {
//         // Create new purchase
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/purchase/create`,
//           purchaseFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         toast.success("মেইনটেনেন্স সফলভাবে জমা দেওয়া হয়েছে!", {
//           position: "top-right",
//         });
//       }

//       reset();
//       navigate("/tramessy/Purchase/maintenance");
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "অজানা ত্রুটি";
//       toast.error("সার্ভার সমস্যা: " + errorMessage);
//     }
//   };

//   if (isLoading) {
//     return <div className="flex justify-center items-center h-64">মেইনটেনেন্স ডেটা লোড হচ্ছে...</div>;
//   }

//   return (
//     <div className="p-2">
//       <Toaster />
//       <Card 
//         title={
//           <h3 className="text-primary font-semibold">
//             {isEditMode ? "মেইনটেনেন্স আপডেট করুন" : "নতুন মেইনটেনেন্স যোগ করুন"}
//           </h3>
//         }
//         className="shadow-lg rounded-lg"
//       >
//         <FormProvider {...methods}>
//           <Form
//             form={form}
//             onFinish={handleSubmit(onSubmit)}
//             layout="vertical"
//             className="space-y-2"
//           >
//             <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
//               {selectedCategory === "fuel"
//                 ? "জ্বালানি ক্রয়" 
//                 : selectedCategory === "engine_oil" || selectedCategory === "parts" 
//                   ? "মেইনটেনেন্স" 
//                   : ""}
//             </h5>

//             {/* Form fields */}
//             <Row gutter={[16, 0]}>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="ক্রয়ের তারিখ"
//                   name="date"
//                   rules={[{ required: !isEditMode, message: 'ক্রয়ের তারিখ প্রয়োজন' }]}
//                 >
//                   <DatePicker 
//                     format="DD/MM/YYYY"
//                     style={{ width: '100%' }}
//                     placeholder="তারিখ নির্বাচন করুন"
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="ক্যাটাগরি"
//                   name="category"
//                   rules={[{ required: !isEditMode, message: 'ক্যাটাগরি প্রয়োজন' }]}
//                 >
//                   <Select placeholder="ক্যাটাগরি নির্বাচন করুন">
//                     <Option value="engine_oil">ইঞ্জিন অয়েল</Option>
//                     <Option value="parts">পার্টস</Option>
//                   </Select>
//                 </Form.Item>
//               </Col>
//               {selectedCategory === "parts" && (
//                 <Col xs={24} sm={12} md={8}>
//                   <Form.Item
//                     label="আইটেমের নাম"
//                     name="item_name"
//                     rules={[{ required: !isEditMode, message: 'আইটেমের নাম প্রয়োজন' }]}
//                   >
//                     <Input placeholder="আইটেমের নাম লিখুন" />
//                   </Form.Item>
//                 </Col>
//               )}
//             </Row>

//             <Row gutter={[16, 0]}>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="ড্রাইভারের নাম"
//                   name="driver_name"
//                   rules={[{ required: !isEditMode, message: 'ড্রাইভারের নাম প্রয়োজন' }]}
//                 >
//                   <Select 
//                     placeholder="ড্রাইভার নির্বাচন করুন"
//                     showSearch
//                     filterOption={(input, option) =>
//                       option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                     }
//                   >
//                     {drivers.map(driver => (
//                       <Option key={driver.id} value={driver.driver_name}>
//                         {driver.driver_name}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="গাড়ির নম্বর"
//                   name="vehicle_no"
//                   rules={[{ required: !isEditMode, message: 'গাড়ির নম্বর প্রয়োজন' }]}
//                 >
//                   <Select 
//                     placeholder="গাড়ির নম্বর নির্বাচন করুন"
//                     showSearch
//                     filterOption={(input, option) =>
//                       option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                     }
//                   >
//                     {vehicle.map(v => (
//                       <Option 
//                         key={v.id} 
//                         value={`${v.registration_zone} ${v.registration_serial} ${v.registration_number}`}
//                       >
//                         {`${v.registration_zone} ${v.registration_serial} ${v.registration_number}`}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="ব্রাঞ্চের নাম"
//                   name="branch_name"
//                   rules={[{ required: !isEditMode, message: 'ব্রাঞ্চের নাম প্রয়োজন' }]}
//                 >
//                   <Select 
//                     placeholder="ব্রাঞ্চ নির্বাচন করুন"
//                     showSearch
//                     filterOption={(input, option) =>
//                       option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                     }
//                   >
//                     {branch.map(b => (
//                       <Option key={b.id} value={b.branch_name}>
//                         {b.branch_name}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//             </Row>

//             <Row gutter={[16, 0]}>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="সরবরাহকারীর নাম"
//                   name="supplier_name"
//                   rules={[{ required: !isEditMode, message: 'সরবরাহকারীর নাম প্রয়োজন' }]}
//                 >
//                   <Select 
//                     placeholder="সরবরাহকারী নির্বাচন করুন"
//                     showSearch
//                     filterOption={(input, option) =>
//                       option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
//                     }
//                   >
//                     {supplier.map(s => (
//                       <Option key={s.id} value={s.supplier_name}>
//                         {s.supplier_name}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="পরিমাণ"
//                   name="quantity"
//                   rules={[{ required: !isEditMode, message: 'পরিমাণ প্রয়োজন' }]}
//                 >
//                   <Input 
//                     type="number" 
//                     placeholder="পরিমাণ লিখুন" 
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="একক মূল্য"
//                   name="unit_price"
//                   rules={[{ required: !isEditMode, message: 'একক মূল্য প্রয়োজন' }]}
//                 >
//                   <Input 
//                     type="number" 
//                     placeholder="একক মূল্য লিখুন" 
//                   />
//                 </Form.Item>
//               </Col>
//             </Row>

//             <Row gutter={[16, 0]}>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="মোট"
//                   name="purchase_amount"
//                 >
//                   <Input 
//                     value={totalPrice} 
//                     readOnly 
//                     placeholder="মোট টাকা" 
//                   />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="মন্তব্য"
//                   name="remarks"
//                 >
//                   <TextArea placeholder="মন্তব্য লিখুন" rows={2} />
//                 </Form.Item>
//               </Col>
//               <Col xs={24} sm={12} md={8}>
//                 <Form.Item
//                   label="অগ্রাধিকার"
//                   name="priority"
//                 >
//                   <Input placeholder="অগ্রাধিকার লিখুন" />
//                 </Form.Item>
//               </Col>
//             </Row>

//             <Row gutter={[16, 0]}>
//               <Col xs={24} sm={12} md={12}>
//                 <Form.Item
//                   label="বিলের ছবি"
//                   name="bill_image"
//                   rules={isEditMode ? [] : [{ required: true, message: 'বিলের ছবি প্রয়োজন' }]}
//                 >
//                   <Upload
//                     beforeUpload={(file) => {
//                       const url = URL.createObjectURL(file);
//                       setPreviewImage(url);
//                       setValue("bill_image", file);
//                       return false; // Prevent automatic upload
//                     }}
//                     onRemove={() => {
//                       setPreviewImage(null);
//                       setValue("bill_image", null);
//                     }}
//                     maxCount={1}
//                     accept="image/*"
//                   >
//                     <Button icon={<UploadOutlined />}>ছবি আপলোড করুন</Button>
//                   </Upload>
//                 </Form.Item>
//               </Col>
//             </Row>

//             {/* Preview */}
//             {previewImage && (
//               <div className="mt-2 relative flex justify-start">
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     setPreviewImage(null);
//                     setValue("bill_image", null);
//                     if (!isEditMode) {
//                       setExistingImage(null);
//                     }
//                   }}
//                   className="absolute top-2 right-2"
//                   danger
//                   size="small"
//                   title="Remove image"
//                 >
//                   X
//                 </Button>
//                 <img
//                   src={previewImage}
//                   alt="বিলের প্রিভিউ"
//                   className="max-w-xs h-auto rounded border border-gray-300"
//                 />
//               </div>
//             )}

//             <Form.Item>
//               <Button type="primary" htmlType="submit" size="large">
//                 {isEditMode ? "আপডেট করুন" : "জমা দিন"}
//               </Button>
//             </Form.Item>
//           </Form>
//         </FormProvider>
//       </Card>
//     </div>
//   );
// };

// export default PurchaseForm;

import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";

const PurchaseForm = () => {
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
  const selectedVehicle = watch("vehicle_no");

  // Calculate Total Expense
  const quantity = parseFloat(watch("quantity") || 0);
  const unitPrice = parseFloat(watch("unit_price") || 0);
  const totalPrice = quantity * unitPrice;

  useEffect(() => {
    const totalPrice = quantity * unitPrice;
    setValue("purchase_amount", totalPrice);
  }, [quantity, unitPrice, setValue]);

  // Set vehicle category when vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      const selectedVehicleData = vehicle.find(
        (v) =>
          `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`.trim() ===
          selectedVehicle.trim()
      );
      if (selectedVehicleData) {
        setValue("vehicle_category", selectedVehicleData.vehicle_category, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        setValue("vehicle_category", "");
      }
    } else {
      setValue("vehicle_category", "");
    }
  }, [selectedVehicle, vehicle, setValue]);

  // Preview image
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch data for dropdowns
  useEffect(() => {
    // Fetch drivers
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("ড্রাইভার ডেটা লোড করার সময় ত্রুটি:", error));

    // Fetch vehicles
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("গাড়ির ডেটা লোড করার সময় ত্রুটি:", error));

    // Fetch branches
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) => setBranch(data.data))
      .catch((error) => console.error("ব্রাঞ্চ ডেটা লোড করার সময় ত্রুটি:", error));

    // Fetch suppliers
    fetch(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => response.json())
      .then((data) => setSupplier(data.data))
      .catch((error) => console.error("সরবরাহকারী ডেটা লোড করার সময় ত্রুটি:", error));
  }, []);

  // Fetch purchase data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchPurchaseData = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/api/purchase/show/${id}`
          );
          const purchaseData = response.data.data;

          // Set form values
          setValue("date", purchaseData.date);
          setValue("category", purchaseData.category);
          setValue("item_name", purchaseData.item_name);
          setValue("driver_name", purchaseData.driver_name);
          setValue("vehicle_no", purchaseData.vehicle_no);
          setValue("vehicle_category", purchaseData.vehicle_category);
          setValue("branch_name", purchaseData.branch_name);
          setValue("supplier_name", purchaseData.supplier_name);
          setValue("quantity", purchaseData.quantity);
          setValue("unit_price", purchaseData.unit_price);
          setValue("purchase_amount", purchaseData.purchase_amount);
          setValue("remarks", purchaseData.remarks);
          setValue("priority", purchaseData.priority);

          // Set image preview if exists
          if (purchaseData.bill_image) {
            const imageUrl = `${import.meta.env.VITE_BASE_URL}/uploads/${purchaseData.bill_image}`;
            setPreviewImage(imageUrl);
            setExistingImage(purchaseData.bill_image);
          }

          setIsLoading(false);
        } catch (error) {
          console.error("মেইনটেনেন্স ডেটা লোড করার সময় ত্রুটি:", error);
          toast.error("মেইনটেনেন্স ডেটা লোড করতে ব্যর্থ হয়েছে");
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
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number}`,
    category: dt.vehicle_category
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
      const purchaseFormData = new FormData();

      // Append all fields, including vehicle_category
      for (const key in data) {
        if (key === "bill_image") {
          if (typeof data[key] === "object" && data[key]) {
            purchaseFormData.append(key, data[key]);
          } else if (isEditMode && existingImage && !data[key]) {
            purchaseFormData.append(key, existingImage);
          }
        } else if (data[key] !== null && data[key] !== undefined) {
          purchaseFormData.append(key, data[key]);
        }
      }

      let response;

      if (isEditMode) {
        // Update existing purchase
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/update/${id}`,
          purchaseFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("মেইনটেনেন্স সফলভাবে আপডেট করা হয়েছে!", {
          position: "top-right",
        });
      } else {
        // Create new purchase
        response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/api/purchase/create`,
          purchaseFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("মেইনটেনেন্স সফলভাবে জমা দেওয়া হয়েছে!", {
          position: "top-right",
        });
      }

      reset();
      navigate("/tramessy/Purchase/maintenance");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "অজানা ত্রুটি";
      toast.error("সার্ভার সমস্যা: " + errorMessage);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">মেইনটেনেন্স ডেটা লোড হচ্ছে...</div>;
  }

  return (
    <div className="p-2">
      <Toaster />

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto p-6 rounded-md rounded-t-md shadow space-y-4"
        >
          <h3 className=" pb-4 text-primary font-semibold ">
            {isEditMode ? "মেইনটেনেন্স আপডেট করুন" : "নতুন মেইনটেনেন্স যোগ করুন"}
          </h3>
          <h5 className="text-2xl font-bold text-center text-[#EF9C07]">
            {selectedCategory === "fuel"
              ? "জ্বালানি ক্রয়"
              : selectedCategory === "engine_oil" || selectedCategory === "parts"
                ? "মেইনটেনেন্স"
                : ""}
          </h5>

          {/* Form fields */}
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
                label="ক্যাটাগরি"
                required={!isEditMode}
                options={[
                  { value: "engine_oil", label: "ইঞ্জিন অয়েল" },
                  { value: "parts", label: "পার্টস" },
                ]}
              />
            </div>
            {selectedCategory === "parts" && (
              <div className="w-full">
                <InputField name="item_name" label="আইটেমের নাম" required={!isEditMode} />
              </div>
            )}
          </div>

          <div className="md:flex justify-between gap-x-3">
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
                label="ইকুইপমেন্ট নম্বর"
                required={!isEditMode}
                options={vehicleOptions}
                control={control}
              />
            </div>
          </div>

          {/* Hidden field for vehicle category */}
          <div className="w-full hidden">
            <InputField
              name="vehicle_category"
              label="ইকুইপমেন্ট ক্যাটাগরি"
              value={watch("vehicle_category") || ""}
              readOnly
              {...register("vehicle_category")}
            />
          </div>

          <div className="flex flex-col lg:flex-row justify-between gap-x-3">
            <div className="w-full">
              <SelectField
                name="branch_name"
                label="ব্রাঞ্চের নাম"
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
              <label className="text-gray-700 text-sm font-semibold">
                বিলের ছবি {!isEditMode && "(প্রয়োজনীয়)"}
              </label>
              <Controller
                name="bill_image"
                control={control}
                rules={isEditMode ? {} : { required: "এই ফিল্ডটি প্রয়োজন" }}
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
                  </div>
                )}
              />
            </div>
          </div>

          {/* Preview */}
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
                alt="বিলের প্রিভিউ"
                className="max-w-xs h-auto rounded border border-gray-300"
              />
            </div>
          )}

          <BtnSubmit>{isEditMode ? "আপডেট করুন" : "জমা দিন"}</BtnSubmit>
        </form>
      </FormProvider>
    </div>
  );
};

export default PurchaseForm;