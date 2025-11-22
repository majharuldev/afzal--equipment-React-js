
import { useForm, FormProvider, useWatch, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { InputField, SelectField } from "../components/Form/FormFields";
import BtnSubmit from "../components/Button/BtnSubmit";
import api from "../utils/axiosConfig";
import { toNumber } from "../hooks/toNumber";
import FormSkeleton from "../components/Form/FormSkeleton";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { Input } from "antd";

export default function AddTripForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const dateRef = useRef(null);
  const { TextArea } = Input;

  // ড্রপডাউন অপশনগুলির জন্য স্টেট
  const [vehicle, setVehicle] = useState([]);
  const [driver, setDriver] = useState([]);
  const [vendorVehicle, setVendorVehicle] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorDrivers, setVendorDrivers] = useState([]);
  const [loadpoint, setLoadpoint] = useState([]);
  const [isFixedRateCustomer, setIsFixedRateCustomer] = useState(false);
  const [helper, setHelper] = useState([]);

  // রেট সম্পর্কিত স্টেট
  const [rates, setRates] = useState([]);
  const [vehicleCategories, setVehicleCategories] = useState([]);
  const [vehicleSizes, setVehicleSizes] = useState([]);
  const [unloadpoints, setUnloadpoints] = useState([]);
  const [branch, setBranch] = useState([]);

  // Preview image
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const methods = useForm({
    defaultValues: {
      date: "",
      load_point: "",
      unload_point: "",
      vehicle_no: "",
      driver_name: "",
      driver_mobile: "",
      fuel_cost: "",
      toll_cost: "",
      police_cost: "",
      driver_commission: "",
      labor: "",
      others_cost: "",
      d_day: "",
      d_amount: "",
      d_total: 0,
      customer: "",
      parking_cost: "",
      night_guard: "",
      feri_cost: "",
      chada: "",
      food_cost: "",
      total_exp: 0,
      total: 0,
      transport_type: "",
      total_rent: "",
      challan: "",
      trip_rent: "",
      advance: "",
      due_amount: "",
      customer_mobile: "",
      driver_adv: "",
      additional_load: "",
      additional_cost: "",
      vehicle_category: "",
      vehicle_size: "",
      branch_name: "",
      trip_id: "",
      trans_cost: "",
    },
  });

  const { watch, handleSubmit, reset, setValue, control } = methods;

  const customerOptions = useMemo(() =>
    customer.map((c) => ({
      value: c.customer_name,
      label: c.customer_name,
      mobile: c.mobile,
      rate: c.rate,
    })),
    [customer]);

  // কাস্টমার মোবাইল নম্বর আপডেট হ্যান্ডেল করা
  const selectedCustomer = useWatch({ control, name: "customer" });
  useEffect(() => {
    const customer = customerOptions.find((c) => c.value === selectedCustomer);
    if (customer) {
      const isFixed = customer.rate === "Fixed";
      setIsFixedRateCustomer(isFixed);
    }
    if (customer) {
      setValue("customer_mobile", customer.mobile || "");
    }
  }, [selectedCustomer, customerOptions, setValue]);

  const [isRateFound, setIsRateFound] = useState(false);
  const selectedTransport = watch("transport_type");
  const selectedLoadPoint = watch("load_point");
  const selectedUnloadPoint = watch("unload_point");
  const selectedVehicleCategory = watch("vehicle_category");
  const selectedVehicleSize = watch("vehicle_size");

  // সকল খরচের ফিল্ডগুলি পর্যবেক্ষণ করা
  const [
    fuelCost,
    tollCost,
    policeCost,
    driverCommision,
    labourCost,
    othersCost,
    parkingCost,
    nightGuardCost,
    feriCost,
    chadaCost,
    foodCost,
    d_day,
    d_amount,
    additional_cost,
    trans_cost,
  ] = watch([
    "fuel_cost",
    "trans_cost",
    "toll_cost",
    "police_cost",
    "driver_commission",
    "labor",
    "others_cost",
    "parking_cost",
    "night_guard",
    "feri_cost",
    "chada",
    "food_cost",
    "d_day",
    "d_amount",
    "additional_cost",
  ]);

  // মোট হিসাব করা
  useEffect(() => {
    // মোট খরচ হিসাব
    const totalExp =
      (toNumber(driverCommision) || 0) +
      (toNumber(labourCost) || 0) +
      (toNumber(parkingCost) || 0) +
      (toNumber(nightGuardCost) || 0) +
      (toNumber(tollCost) || 0) +
      (toNumber(feriCost) || 0) +
      (toNumber(policeCost) || 0) +
      (toNumber(foodCost) || 0) +
      (toNumber(chadaCost) || 0) +
      (toNumber(fuelCost) || 0) +
      (toNumber(trans_cost) || 0) +
      (toNumber(additional_cost) || 0) +
      (toNumber(othersCost) || 0);

    setValue("total_exp", totalExp);

    // ড্যামারেজ মোট হিসাব
    const d_total = (toNumber(d_day) || 0) * (toNumber(d_amount) || 0);
    setValue("d_total", d_total);
  }, [
    driverCommision,
    labourCost,
    parkingCost,
    nightGuardCost,
    tollCost,
    feriCost,
    policeCost,
    foodCost,
    chadaCost,
    fuelCost,
    othersCost,
    d_day,
    d_amount,
    additional_cost,
    setValue,
  ]);

  // ভেন্ডর ট্রান্সপোর্ট ফিল্ডগুলি পর্যবেক্ষণ করা
  const [vendorRent, vendorAdvance] = watch(["total_exp", "advance"]);

  useEffect(() => {
    const due = (toNumber(vendorRent) || 0) - (toNumber(vendorAdvance) || 0);
    setValue("due_amount", due, { shouldValidate: true });
  }, [vendorRent, vendorAdvance, setValue]);

  const [workTime, rate] = watch(["work_time", "rate"]);
  useEffect(() => {
    const totalRent = (toNumber(workTime) || 0) * (toNumber(rate) || 0);
    setValue("total_rent", totalRent, { shouldValidate: true });
  }, [workTime, rate, setValue]);

  // সকল প্রয়োজনীয় ডেটা ফেচ করা
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        // প্রথমে রেট ডেটা ফেচ করা
        const ratesRes = await api.get(`/rate`);
        const ratesData = ratesRes.data;
        setRates(ratesData.data);

        // রেট থেকে ইউনিক লোড পয়েন্ট, আনলোড পয়েন্ট, গাড়ির ক্যাটাগরি এবং সাইজ বের করা
        const loadPoints = [...new Set(ratesData.data.map(rate => rate.load_point))];
        const unloadPoints = [...new Set(ratesData.data.map(rate => rate.unload_point))];
        const categories = [...new Set(ratesData.data.map(rate => rate.vehicle_category))];
        // const sizes = [...new Set(ratesData.data.map(rate => rate.vehicle_size))];

        const sizes = [
          ...new Set(
            ratesData.data
              .map(rate => rate.vehicle_size)
              .filter(size => size && size.trim() !== '')
              .map(size => size.trim())
          )
        ];
        // setVehicleSizes(sizes);

        setLoadpoint(loadPoints.map(point => ({ customer_name: point })));
        setUnloadpoints(unloadPoints);
        setVehicleCategories(categories);
        setVehicleSizes(sizes);

        const [
          vehicleRes,
          driverRes,
          helperRes,
          vendorVehicleRes,
          vendorDriversRes,
          customerRes,
          vendorRes,
          branchRes,
        ] = await Promise.all([
          api.get(`/vehicle`),
          api.get(`/driver`),
          api.get(`/helper`),
          api.get(`/rentVehicle`),
          api.get(`/rentVehicle`),
          api.get(`/customer`),
          api.get(`/vendor`),
          api.get(`/office`),
        ]);
        // Filter only active items
        const activeFilter = (arr) => arr?.filter((item) => item?.status === "Active") || [];
        setVehicle(activeFilter(vehicleRes.data.data || vehicleRes.data));
        setDriver(activeFilter(driverRes.data.data || driverRes.data));
        setHelper(activeFilter(helperRes.data.data || helperRes.data));
        setVendorVehicle(activeFilter(vendorVehicleRes.data.data));
        setVendorDrivers(activeFilter(vendorDriversRes.data.data));
        setCustomer(activeFilter(customerRes.data.data || customerRes.data));
        setVendors(activeFilter(vendorRes.data.data));
        setBranch(branchRes.data.data);

        if (id) {
          const tripRes = await api.get(
            `/trip/${id}`
          );
          if (tripRes.data) {
            const tripData = tripRes.data

            if (tripData.date) {
              tripData.date = new Date(tripData.date).toISOString().split("T")[0];
            }

            const parsedTripData = {
              ...tripData,
              fuel_cost: toNumber(tripData.fuel_cost) || 0,
              toll_cost: toNumber(tripData.toll_cost) || 0,
              police_cost: toNumber(tripData.police_cost) || 0,
              driver_commission: toNumber(tripData.driver_commission) || 0,
              labor: toNumber(tripData.labor) || 0,
              others_cost: toNumber(tripData.others_cost) || 0,
              parking_cost: toNumber(tripData.parking_cost) || 0,
              night_guard: toNumber(tripData.night_guard) || 0,
              feri_cost: toNumber(tripData.feri_cost) || 0,
              chada: toNumber(tripData.chada) || 0,
              trans_cost: toNumber(tripData.trans_cost) || 0,
              food_cost: toNumber(tripData.food_cost) || 0,
              d_day: toNumber(tripData.d_day) || 0,
              d_amount: toNumber(tripData.d_amount) || 0,
              d_total: toNumber(tripData.d_total) || 0,
              total_exp: toNumber(tripData.total_exp) || 0,
              total_rent: toNumber(tripData.total_rent) || 0,
              trip_rent: toNumber(tripData.trip_rent) || 0,
              advance: toNumber(tripData.advance) || 0,
              due_amount: toNumber(tripData.due_amount) || 0,
              driver_adv: toNumber(tripData.driver_adv) || 0,
            };
            reset(parsedTripData);
            if (tripData.image) {
              const imageUrl = `https://afzalcons.com/backend/uploads/trip/${tripData.image}`
              setPreviewImage(imageUrl)
              setExistingImage(tripData.image)
            }
          }
        }
      } catch (error) {
        console.error("ডেটা লোড করতে ত্রুটি:", error);
        toast.error("ফর্ম ডেটা লোড করতে ব্যর্থ");
      } finally {
        setLoading(false); //  সবশেষে loading বন্ধ
      }
    };

    fetchAllData();
  }, [id, reset]);

  // ড্রপডাউনগুলির জন্য অপশন জেনারেট করা
  const vehicleOptions = vehicle.map((v) => ({
    value: `${v.reg_zone} ${v.reg_serial} ${v.reg_no}`,
    label: `${v.reg_zone} ${v.reg_serial} ${v.reg_no}`,
    category: v.vehicle_category,
    size: v.vehicle_size,
  }));
  const vehicleCategoryOptions = [
    ...new Set(vehicle.map(v => v.vehicle_category))
  ]
    .filter(Boolean)
    .map(category => ({
      value: category,
      label: category,
    }));

  const driverOptions = driver.map((d) => ({
    value: d.driver_name,
    label: d.driver_name,
    mobile: d.driver_mobile,
  }));
  const helperOptions = helper.map((d) => ({
    value: d.helper_name,
    label: d.helper_name,
    mobile: d.helper_mobile,
  }));

  const vendorVehicleOptions = vendorVehicle.map((v) => ({
    value: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    label: `${v.registration_zone} ${v.registration_serial} ${v.registration_number}`,
    category: v.vehicle_category,
    size: v.vehicle_size,
  }));

  const vendorOptions = vendors.map((v) => ({
    value: v.vendor_name,
    label: v.vendor_name,
  }));

  const vendorDriverOptions = vendorDrivers.map((driver) => ({
    value: driver.vendor_name,
    label: driver.vendor_name,
    contact: driver.mobile,
  }));

  const loadpointOptions = [...new Set([
    ...loadpoint.map(load => load.customer_name),
    ...rates.map(rate => rate.load_point)
  ])].map(point => ({
    value: point,
    label: point,
  }));

  const unloadpointOptions = unloadpoints.map((unloadpoint) => ({
    value: unloadpoint,
    label: unloadpoint,
  }));

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));

  const vehicleSizeOptions = vehicleSizes.map((size) => ({
    value: size,
    label: size,
  }));

  // গাড়ি নির্বাচন হ্যান্ডেল করে ক্যাটাগরি এবং সাইজ অটো-ফিল করা
  const selectedVehicle = useWatch({ control, name: "vehicle_no" });
  // নির্বাচিত গাড়ির নম্বরের উপর ভিত্তি করে ড্রাইভারের নাম অটো-ফিল করা (শুধুমাত্র নিজস্ব ট্রান্সপোর্ট)
  useEffect(() => {
    if (selectedTransport === "own_transport" && selectedVehicle) {
      const vehicleData = vehicle.find(v =>
        `${v.reg_zone} ${v.reg_serial} ${v.reg_no}` === selectedVehicle
      );

      if (vehicleData) {
        setValue("driver_name", vehicleData.driver_name || "");
      } else {
        setValue("driver_name", "");
      }
    }
  }, [selectedVehicle, selectedTransport, setValue, vehicle]);

  useEffect(() => {
    if (selectedTransport === "own_transport") {
      const vehicle = vehicleOptions.find((v) => v.value === selectedVehicle);
      if (vehicle) {
        // setValue("vehicle_category", vehicle.category || "");
        // setValue("vehicle_size", vehicle.size || "");
      }
    } else if (selectedTransport === "vendor_transport") {
      const vehicle = vendorVehicleOptions.find((v) => v.value === selectedVehicle);
      if (vehicle) {
        // setValue("vehicle_category", vehicle.category || "");
        // setValue("vehicle_size", vehicle.size || "");
      }
    }
  }, [selectedVehicle, selectedTransport, setValue]);

  // লোড পয়েন্ট, আনলোড পয়েন্ট, গাড়ির ক্যাটাগরি এবং সাইজের উপর ভিত্তি করে ফিক্সড রেট হিসাব
  // useEffect(() => {
  //   if (selectedLoadPoint && selectedUnloadPoint && selectedVehicleCategory && selectedVehicleSize && rates.length > 0) {
  //     const foundRate = rates.find(
  //       (rate) =>
  //         rate.load_point === selectedLoadPoint &&
  //         rate.unload_point === selectedUnloadPoint &&
  //         rate.vehicle_category === selectedVehicleCategory &&
  //         // rate.vehicle_size === selectedVehicleSize
  //         rate.vehicle_size.toLowerCase().trim() === selectedVehicleSize.toLowerCase().trim()
  //     );

  //     if (foundRate) {
  //       const rateValue = parseFloat(foundRate.rate) || 0;
  //       setValue("total_rent", Number(rateValue), { shouldValidate: true });
  //       setIsRateFound(true);
  //     } else if (!id) {
  //       setValue("total_rent", "", { shouldValidate: true });
  //       setIsRateFound(false);
  //     }
  //   }
  // }, [selectedLoadPoint, selectedUnloadPoint, selectedVehicleCategory, selectedVehicleSize, rates, setValue, id]);

  useEffect(() => {
    if (
      (selectedVehicleCategory === "Dump Truck" ||
        selectedVehicleCategory === "Trailer") &&
      selectedLoadPoint &&
      selectedUnloadPoint &&
      selectedVehicleCategory &&
      rates.length > 0
    ) {
      const foundRate = rates.find(
        (rate) =>
          rate.load_point === selectedLoadPoint &&
          rate.unload_point === selectedUnloadPoint &&
          rate.vehicle_category === selectedVehicleCategory &&
          rate.vehicle_size.toLowerCase().trim() ===
          selectedVehicleSize.toLowerCase().trim()
      );

      if (foundRate) {
        if (isFixedRateCustomer) {
          setValue("rate", Number(foundRate.rate)); // 🔥 Auto rate for fixed customer
        } else {
          setValue("rate", ""); // 🔥 Normal customer = blank
        }
      } else {
        setValue("rate", "");
      }
    }
  }, [
    selectedLoadPoint,
    selectedUnloadPoint,
    selectedVehicleCategory,
    selectedVehicleSize,
    isFixedRateCustomer,
    rates,
    setValue
  ]);

  // select equipment size based on category
  const [selectedEquipment, setSelectedEquipment] = useState("");
  // ইকুইপমেন্ট অনুযায়ী সাইজ
  const equipmentSizes = {
    Exvator: [
      { value: "0.2", label: "০.২" },
      { value: "0.3", label: "০.৩" },
      { value: "0.5", label: "০.৫" },
      { value: "0.7", label: "০.৭" },
      { value: "0.9", label: "০.৯" },
      { value: "2kv", label: "২ কেভি" },
    ],
    "Concrete Mixer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Road Roller": [
      { value: "13", label: "১৩ টন" },
      { value: "14", label: "১৪ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "16", label: "১৬ টন" },
      { value: "17", label: "১৭ টন" },
      { value: "18", label: "১৮ টন" },
      { value: "19", label: "১৯ টন" },
      { value: "20", label: "২০ টন" },
      { value: "21", label: "২১ টন" },
      { value: "22", label: "২২ টন" },
      { value: "23", label: "২৩ টন" },
    ],
    Payloader: [
      { value: "6m", label: "৬ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Chain Dozer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Dump Truck": [
      { value: "120", label: "১২০ সিএফসি" },
      { value: "180", label: "১৮০ সিএফসি" },
      { value: "200", label: "২০০ সিএফসি" },
      { value: "250", label: "২৫০ সিএফসি" },
      { value: "300", label: "৩০০ সিএফসি" },
      { value: "400", label: "৪০০ সিএফসি" },
      { value: "500", label: "৫০০ সিএফসি" },
      { value: "550", label: "৫৫০ সিএফসি" },
      { value: "600", label: "৬০০ সিএফসি" },
      { value: "650", label: "৬৫০ সিএফসি" },
      { value: "700", label: "৭০০ সিএফসি" },
      { value: "750", label: "৭৫০ সিএফসি" },
      { value: "800", label: "৮০০ সিএফসি" },
      { value: "850", label: "৮৫০ সিএফসি" },
    ],
    Crane: [
      { value: "5", label: "৫ টন" },
      { value: "10", label: "১০ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "20", label: "২০ টন" },
      { value: "25", label: "২৫ টন" },
      { value: "50", label: "৫০ টন" },
      { value: "75", label: "৭৫ টন" },
      { value: "120", label: "১২০ টন" },
      { value: "150", label: "১৫০ টন" },
    ],
    Trailer: [
      { value: "20", label: "২০ ফিট" },
      { value: "40", label: "৪০ ফিট" },
    ],
  };

  // Equipment types & sizes
  const equipmentTypes = {
    Exvator: [
      { value: "short_boom", label: "শর্ট বুম" },
      { value: "long_boom", label: "লং বুম" },
    ],
    "Chain Dozer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Dump Truck": [
      { value: "6_caka", label: "৬ চাক" },
      { value: "10_caka", label: "১০ চাক" },
    ],
    Crane: [
      { value: "mobile_crane", label: "মোবাইল ক্রেন" },
      { value: "kawlar_crane", label: "ক্যাবলার ক্রেন" },
      { value: "truck_sound_crane", label: "ট্রাক সাউন্ড ক্রেন" },
    ],
    "Concrete Mixer": [
      { value: "6m", label: "৬ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    "Road Roller": [
      { value: "13", label: "১৩ টন" },
      { value: "14", label: "১৪ টন" },
      { value: "15", label: "১৫ টন" },
      { value: "16", label: "১৬ টন" },
      { value: "17", label: "১৭ টন" },
      { value: "18", label: "১৮ টন" },
      { value: "19", label: "১৯ টন" },
      { value: "20", label: "২০ টন" },
      { value: "21", label: "২১ টন" },
      { value: "22", label: "২২ টন" },
      { value: "23", label: "২৩ টন" },
    ],
    Payloader: [
      { value: "6m", label: "৬ মিটার" },
      { value: "5m", label: "৫ মিটার" },
      { value: "7m", label: "৭ মিটার" },
      { value: "9m", label: "৯ মিটার" },
    ],
    Trailer: [
      { value: "20", label: "২০ ফিট" },
      { value: "40", label: "৪০ ফিট" },
    ],
  };


  // নির্বাচিত category ট্র্যাক
  const selectedCategory = watch("vehicle_category");

  // category পরিবর্তন হলে state আপডেট হবে
  useEffect(() => {
    if (selectedCategory) {
      setSelectedEquipment(selectedCategory);
    }
  }, [selectedCategory]);


  // ড্রাইভার মোবাইল নম্বর আপডেট হ্যান্ডেল করা
  const selectedDriver = useWatch({ control, name: "driver_name" });
  useEffect(() => {
    const driver = driverOptions.find((d) => d.value === selectedDriver);
    if (driver) {
      setValue("driver_mobile", driver.mobile || "");
    }
  }, [selectedDriver, driverOptions, setValue]);

  //  Load & Unload point এর জন্য state
  const [upazilas, setUpazilas] = useState([]);

  //  Fetch Upazilas API (load & unload point option এ ব্যবহার হবে)
  useEffect(() => {
    axios
      .get("https://bdapis.vercel.app/geo/v2.0/upazilas")
      .then((res) => {
        if (res.data.success === true) {
          // ডুপ্লিকেট বাদ দিয়ে শুধু upazila name নেয়া হচ্ছে
          const upazilaData = res.data.data || [];

          // ডুপ্লিকেট রিমুভ করার সঠিক উপায়
          const uniqueUpazilas = [
            ...new Map(upazilaData.map(u => [u.name, u])).values()
          ];

          setUpazilas(uniqueUpazilas);
          setUpazilas(uniqueUpazilas);
        }
      })
      .catch((error) => console.error("Upazila API Error:", error));
  }, []);
  console.log("Upazilas:", upazilas);
  //  Dropdown options বানানো
  const upazilaOptions = upazilas.map((u) => ({
    value: u.name,
    label: u.bn_name,
  }));
  // ফর্ম সাবমিশন হ্যান্ডেল করা
  // const generateRefId = useRefId();
  const onSubmit = async (data) => {
    // const refId = generateRefId();

    try {
      setLoading(true);
      //শুধুমাত্র বৈধ হলে তারিখ ফরম্যাটিং
      // if (data.date) {
      //   const parsedDate = new Date(data.date);
      //   if (!isNaN(parsedDate)) {
      //     data.date = format(parsedDate, "yyyy-MM-dd");
      //   }
      // }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const url = id
        ? `/trip/${id}`
        : `/trip`;

      // if (!id) {
      //   data.ref_id = refId;
      // }

      const res = id
        ? await api.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }) // update
        : await api.post(url, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

      if (res.data.success) {
        toast.success(id ? "ট্রিপ সফলভাবে আপডেট হয়েছে!" : "ট্রিপ সফলভাবে তৈরি হয়েছে!");
        navigate("/tramessy/equipment-operation");
      } else {
        throw new Error(id ? "ট্রিপ আপডেট করতে ব্যর্থ" : "ট্রিপ তৈরি করতে ব্যর্থ");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <Toaster />
      {loading ? (
        <div className="p-4 bg-white rounded-md shadow ">
          <FormSkeleton />
        </div>
      ) : (<form onSubmit={handleSubmit(onSubmit)} className="min-h-screen p-2">

        <div className="rounded-b-md pt-5 shadow rounded-t-md border border-gray-200">
          {/* ফর্ম হেডার */}
          <div className="text-primary px-4 py-2 ">
            <h2 className="text-lg font-medium">{id ? "অপারেশন আপডেট করুন" : "অপারেশন তৈরি করুন"}</h2>
          </div>
          <div className="p-4 space-y-2">
            {/* ট্রিপ ও গন্তব্য সেকশন */}
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <h3 className="text-orange-500 font-medium text-center mb-6">
                গন্তব্য, ইকুইপমেন্ট ও অপারেটরের তথ্য
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6">
                <div className="relative w-full">
                  <InputField
                    name="date"
                    label="তারিখ"
                    type="date"
                    required={!id}
                    inputRef={(e) => {
                      dateRef.current = e
                    }}

                  />
                </div>
                <SelectField
                  name="customer"
                  label="কাস্টমার"
                  options={customerOptions}
                  control={control}
                  required={!id}
                  isCreatable={false}
                />
                <div className="w-full relative">
                  <SelectField
                    name="branch_name"
                    label="শাখা"
                    required={!id}
                    options={branchOptions}
                    control={control}
                    isCreatable={false}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {/* Category & Size */}
                {/* <div className="md:flex justify-between gap-3"> */}
                <div className="w-full relative">
                  <SelectField
                    name="vehicle_category"
                    label="ইকুইপমেন্টের ধরণ"
                    required
                    // options={[
                    //   { value: "", label: "ইকুইপমেন্টের ধরণ নির্বাচন করুন..." },
                    //   { value: "Exvator", label: "এক্সভেটর" },
                    //   { value: "Concrete Mixer", label: "কংক্রিট মিক্সার" },
                    //   { value: "Road Roller", label: "রোলার" },
                    //   { value: "Payloader", label: "পে-লোডার" },
                    //   { value: "Chain Dozer", label: "চেইন ডোজার" },
                    //   { value: "Dump Truck", label: "ডাম্প ট্রাক" },
                    //   { value: "Crane", label: "ক্রেন" },
                    //   { value: "Trailer", label: "ট্রেইলার" },
                    //   // { value: "Other", label: "অন্যান্য" }
                    // ]}
                    options={vehicleCategoryOptions}
                    control={control}
                  />
                </div>
                <div className="relative mt-2 md:mt-0 w-full">
                  {/* ইকুইপমেন্ট অনুযায়ী সাইজ */}
                  <SelectField
                    name="equipment_type"
                    label="ইকুইপমেন্টের টাইপ"
                    required={false}
                    options={equipmentTypes[selectedCategory] || []}
                    control={control}
                  />
                </div>

                <div className="relative mt-2 md:mt-0 w-full">
                  {/* ইকুইপমেন্ট অনুযায়ী সাইজ */}
                  <SelectField
                    name="vehicle_size"
                    label="ইকুইপমেন্টের সাইজ/ক্ষমতা"
                    required
                    options={equipmentSizes[selectedEquipment] || []}
                    control={control}
                  />
                </div>
                <SelectField
                  name="transport_type"
                  label="ট্রান্সপোর্টের ধরন"
                  options={[
                    { value: "own_transport", label: "নিজস্ব ট্রান্সপোর্ট" },
                    { value: "vendor_transport", label: "ভেন্ডর ট্রান্সপোর্ট" },
                  ]}
                  control={control}
                  required={!id}
                />

                {selectedTransport === "vendor_transport" && (
                  <SelectField
                    name="vendor_name"
                    label="ভেন্ডর নাম"
                    options={vendorOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                )}

                {selectedTransport === "own_transport" ? (
                  <SelectField
                    name="vehicle_no"
                    label="ইকুইপমেন্ট নম্বর"
                    options={vehicleOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                ) : selectedTransport === "vendor_transport" ? (
                  <SelectField
                    name="vehicle_no"
                    label="ইকুইপমেন্ট নম্বর"
                    options={vendorVehicleOptions}
                    control={control}
                    required={!id}
                  />
                ) : (
                  <SelectField
                    name="vehicle_no"
                    label="ইকুইপমেন্ট নম্বর"
                    options={[{ label: "প্রথমে ট্রান্সপোর্ট টাইপ নির্বাচন করুন", value: "", disabled: true }]}
                    control={control}
                  />
                )}

                {selectedTransport === "own_transport" ? (
                  <SelectField
                    name="driver_name"
                    label="অপারেটরের নাম"
                    options={driverOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                ) : selectedTransport === "vendor_transport" ? (
                  <SelectField
                    name="driver_name"
                    label="অপারেটরের নাম/নম্বর"
                    options={vendorDriverOptions}
                    control={control}
                    required={!id}
                  />
                ) : (
                  <SelectField
                    name="driver_name"
                    label="অপারেটরের নাম"
                    options={[{ label: "প্রথমে ট্রান্সপোর্ট টাইপ নির্বাচন করুন", value: "", disabled: true }]}
                    control={control}
                  />
                )}

                {selectedTransport === "own_transport" ? (
                  <SelectField
                    name="helper_name"
                    label="হেলপার নাম"
                    options={helperOptions}
                    control={control}
                    required={!id}
                    isCreatable={false}
                  />
                ) : selectedTransport === "vendor_transport" ? (
                  ""
                ) : (
                  <SelectField
                    name="helper_name"
                    label="হেলপার নাম"
                    options={[{ label: "প্রথমে ট্রান্সপোর্ট টাইপ নির্বাচন করুন", value: "", disabled: true }]}
                    control={control}
                  />
                )}

                {/* <div>
                  {
                  (selectedCategory === "Trailer" || selectedCategory === "Payloader") && (
                    <div className="w-full">
                     <SelectField
                      name="load_point"
                      label="লোড পয়েন্ট (উপজেলা)"
                      options={upazilaOptions}
                      control={control}
                      required={!id}
                      isCreatable={false}
                    />
                   </div>)
                }
                </div>
               <div>
                 { (selectedCategory === "Trailer" || selectedCategory === "Payloader") && (
                   <div className="w-full">
                      <SelectField
                      name="unload_point"
                      label="আনলোড পয়েন্ট (উপজেলা)"
                      options={upazilaOptions}
                      control={control}
                      required={!id}
                      isCreatable={false}
                    />
                    </div>)

                }
               </div> */}
                <InputField name="work_place" label="কাজের জায়গা" />
                <InputField name="challan" label="চালান নম্বর" />
              </div>
              <div>
                {(selectedCategory === "Trailer" || selectedCategory === "Payloader" || selectedCategory === "Dump Truck") && (
                  <div className="flex gap-5">
                    <div className="w-full">
                      <SelectField
                        name="load_point"
                        label="লোড পয়েন্ট (উপজেলা)"
                        options={upazilaOptions}
                        control={control}
                        required={!id}
                        isCreatable={false}
                      />
                    </div>

                    <div className="w-full">
                      <SelectField
                        name="unload_point"
                        label="আনলোড পয়েন্ট (উপজেলা)"
                        options={upazilaOptions}
                        control={control}
                        required={!id}
                        isCreatable={false}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {!["Dump Truck", "Trailer"].includes(watch("vehicle_category")) ? (<><div className="w-full">
                  <InputField
                    name="work_time"
                    label="কাজের সময়"
                    type="number"
                    required={id ? false : true}
                  />
                </div>
                  <div className="w-full">
                    <InputField
                      name="rate"
                      label="প্রতি ঘণ্টার দর"
                      type="number"
                      required={id ? false : true}
                    />
                  </div></>) : null}
                {["Dump Truck", "Trailer"].includes(watch("vehicle_category")) ? (<><div className="w-full">
                  <InputField
                    name="work_time"
                    label="সি এফ টি"
                    type="number"
                    required={id ? false : true}
                  />
                </div>
                  <div className="w-full">
                    <InputField
                      name="rate"
                      label="দর"
                      type="number"
                      required={id ? false : true}
                    />
                  </div></>) : null}
                <div className="w-full">
                  <InputField
                    name="total_rent"
                    label="মোট ভাড়া/বিল পরিমাণ"
                    type="number"
                    readOnly={selectedCategory !== "Dump Truck" && selectedCategory !== "Trailer"}
                    required={id ? false : true}
                  />
                </div>
              </div>
              <div className="w-[50%]">
                {/* < name="remarks" label="মন্তব্য" /> */}
                <label className="block text-gray-700 text-sm font-medium mb-1"> মন্তব্য </label>
                <TextArea name="remarks" label="মন্তব্য" />
              </div>
            </div>

            {/* নিজস্ব ট্রান্সপোর্ট খরচ সেকশন */}
            {selectedTransport === "own_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <h3 className="text-orange-500 font-medium text-center mb-6">
                  খরচের বিবরণ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InputField name="driver_adv" label="অপারেটর/ড্রাইভার অ্যাডভান্স" type="number" />
                  <InputField name="driver_commission" label="অপারেটর/ড্রাইভার কমিশন" type="number" />
                  <InputField name="labor" label="শ্রমিক খরচ" type="number" />
                  <InputField name="fuel_cost" label="ফুয়েল/জ্বালানী খরচ" type="number" />
                </div>

                {["Dump Truck", "Trailer"].includes(watch("vehicle_category")) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <InputField name="night_guard" label="নাইট গার্ড" type="number" />
                    <InputField name="toll_cost" label="টোল খরচ" type="number" />
                    <InputField name="feri_cost" label="ফেরী খরচ" type="number" />
                    <InputField name="police_cost" label="পুলিশ খরচ" type="number" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <InputField name="chada" label="চাঁদা" type="number" />
                  <InputField name="food_cost" label="খাবার খরচ" type="number" />
                  <InputField name="trans_cost" label="ট্রান্সপোর্ট খরচ" type="number" />
                  <InputField name="others_cost" label="অন্যান্য খরচ" type="number" />
                  <InputField name="total_exp" label="মোট খরচ" readOnly />
                </div>
              </div>
            )}

            {/* ভেন্ডর ট্রান্সপোর্ট সেকশন */}
            {selectedTransport === "vendor_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <h3 className="text-orange-500 font-medium text-center mb-6">
                  ভেন্ডর পেমেন্ট বিবরণ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField name="total_exp" label="ভেন্ডর ভাড়া" type="number" required={!id} />
                  <InputField name="advance" label="অ্যাডভান্স" type="number" required={!id} />
                  <InputField name="due_amount" readOnly label="বাকি পরিমাণ" type="number" required={!id} />
                </div>
              </div>
            )}

            <div className="md:flex justify-between gap-3">
              <div className="w-[30%]">
                <InputField name="log_ref" label="লগ রেফারেন্স" className="w-full" />
              </div>
              <div className="w-[30%]">
                <InputField name="log_sign" label="লগ সাইন" className="w-full" />
              </div>
              <div className="w-[40%]">
                <label className="text-gray-700 text-sm font-semibold">
                  ইমেজ
                </label>
                <Controller
                  name="image"
                  control={control}
                  // rules={id ? {} : { required: "This field is required" }}
                  render={({
                    field: { onChange, ref },
                    fieldState: { error },
                  }) => (
                    <div className="relative">
                      <label
                        htmlFor="image"
                        className="border p-2 rounded w-full block bg-white text-gray-300 text-sm cursor-pointer"
                      >
                        {previewImage ? "Image selected" : "Choose image"}
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
                      {id && existingImage && (
                        <span className="text-green-600 text-sm">
                          Current image: {existingImage}
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
                    setValue("image", null);
                    const fileInput = document.getElementById("image");
                    if (fileInput) fileInput.value = "";

                    if (!id) {
                      setExistingImage(null);
                    }
                  }}
                  className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                  title="Remove image"
                >
                  <IoMdClose />
                </button>
                <img
                  src={previewImage}
                  alt="Bill Preview"
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )}

            {/* সাবমিট বাটন */}
            <div className="flex justify-start mt-6">
              <BtnSubmit loading={loading}>
                {id ? "ট্রিপ আপডেট করুন" : "ট্রিপ তৈরি করুন"}
              </BtnSubmit>
            </div>
          </div>
        </div>
      </form>)}
    </FormProvider>
  );
}
