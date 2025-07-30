import axios from "axios";
import { useEffect, useState } from "react";
import { FaUserSecret } from "react-icons/fa6";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import BtnSubmit from "../../components/Button/BtnSubmit";

const PaymentList = () => {
  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const [payment, setPayment] = useState([]);
  const [loading, setLoading] = useState(true);
  //
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/payment/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setPayment(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);
  if (loading) return <p className="text-center mt-16">Loading data...</p>;
  // const onSubmit = async (data) => {
  //   try {
  //     const formData = new FormData();
  //     for (const key in data) {
  //       formData.append(key, data[key]);
  //     }
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_BASE_URL}/api/payment/update/{id}`,
  //       formData
  //     );
  //     const resData = response.data;
  //     if (resData.status === "Success") {
  //       toast.success("Payment information saved successfully!", {
  //         position: "top-right",
  //       });
  //       reset();
  //     } else {
  //       toast.error("Server Error: " + (resData.message || "Unknown issue"));
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     const errorMessage =
  //       error.response?.data?.message || error.message || "Unknown error";
  //     toast.error("Server Error: " + errorMessage);
  //   }
  // };
  return (
    <div className="bg-gradient-to-br from-gray-100 to-white md:p-4">
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaUserSecret className="text-[#11375B] text-2xl" />
            Payment List
          </h1>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-sm">
              <tr>
                <th className="px-1 py-3">SL.</th>
                <th className="px-1 py-3">Date</th>
                <th className="px-1 py-3">SupplierName</th>
                <th className="px-1 py-3">Category</th>
                <th className="px-1 py-3">ItemName</th>
                <th className="px-1 py-3">Quantity</th>
                <th className="px-1 py-3">UnitPrice</th>
                <th className="px-1 py-3">TotalAmount</th>
                <th className="px-1 py-3">PayAmount</th>
                <th className="px-1 py-3">DueAmount</th>
                <th className="px-1 py-3">Status</th>
                <th className="px-1 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-[#11375B] font-semibold bg-gray-100">
              {payment?.map((dt, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-all">
                  <td className="px-1 py-4 font-bold">{index + 1}</td>
                  <td className="px-1 py-4">{dt.date}</td>
                  <td className="px-1 py-4">{dt.supplier_name}</td>
                  <td className="px-1 py-4">{dt.category}</td>
                  <td className="px-1 py-4">{dt.item_name}</td>
                  <td className="px-1 py-4">{dt.quantity}</td>
                  <td className="px-1 py-4">{dt.unit_price}</td>
                  <td className="px-1 py-4">{dt.total_amount}</td>
                  <td className="px-1 py-4">{dt.main_amount}</td>
                  <td className="px-1 py-4">
                    {dt.total_amount - dt.main_amount}
                  </td>
                  <td className="px-1 py-4">
                    <select
                      defaultValue={dt.status}
                      className="text-xs font-semibold rounded-md px-2 py-1 border border-gray-300 bg-white text-gray-700"
                    >
                      <option value={dt.status}>{dt.status}</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Unpaid</option>
                    </select>
                  </td>
                  <td className="px-1 action_column">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedPayment(dt);
                          setShowModal(true);
                          reset({
                            due_amount: dt.total_amount - dt.main_amount,
                            main_amount: dt.main_amount,
                            note: "",
                          });
                        }}
                        className="text-primary hover:bg-primary hover:text-white px-1 py-1 rounded shadow-md transition-all cursor-pointer"
                      >
                        Payment
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* modal start */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 z-50  flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-[#11375B]">
              Update Payment
            </h2>
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit((data) => {
                  // console.log("pay data", data);
                  const formData = new FormData();
                  formData.append("main_amount", data.main_amount);
                  // formData.append("note", data.note);
                  axios
                    .post(
                      `${import.meta.env.VITE_BASE_URL}/api/payment/update/${selectedPayment.id}`,
                      formData
                    )
                    .then((res) => {
                      if (res.data.status === "Success") {
                        toast.success("Payment updated successfully!");
                        setShowModal(false);
                        // Refresh payment list
                        setLoading(true);
                        axios
                          .get(
                            `${import.meta.env.VITE_BASE_URL}/api/payment/list`
                          )
                          .then((response) => {
                            if (response.data.status === "Success") {
                              setPayment(response.data.data);
                            }
                            setLoading(false);
                          });
                      } else {
                        toast.error(res.data.message || "Failed to update.");
                      }
                    })
                    .catch((err) => {
                      toast.error(err.message || "Server error");
                    });
                })}
                className="space-y-4"
              >
                <InputField
                  name="due_amount"
                  label="Due Amount"
                  required
                  disabled
                />
                <InputField name="main_amount" label="Pay Amount" required />
                {/* <InputField name="note" label="Note" /> */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <BtnSubmit>Submit</BtnSubmit>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      )}
      {/* modal end */}
    </div>
  );
};

export default PaymentList;
