import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaUsers, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Table, Modal, Button } from "antd";
import { RiEditLine } from "react-icons/ri";
import api from "../../utils/axiosConfig";
import { tableFormatDate } from "../../components/Shared/formatDate";

const GarageCustomer = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
  // গ্রাহক ডাটা ফেচ
  useEffect(() => {
    api
      .get(`/garageCustomer`)
      .then((response) => {
        if (response.data.success) {
          setCustomer(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("গ্রাহক তথ্য আনতে সমস্যা:", error);
        setLoading(false);
      });
  }, []);

  // গ্রাহক ডিলিট
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/customer/${id}`,
      );
      if (!response.ok) throw new Error("গ্রাহক ডিলিট ব্যর্থ হয়েছে!");

      setCustomer((prev) => prev.filter((customer) => customer.id !== id));
      toast.success("গ্রাহকের তথ্য সফলভাবে ডিলিট করা হয়েছে");
      setIsModalOpen(false);
      setSelectedCustomerId(null);
    } catch (error) {
      console.error("ডিলিট ত্রুটি:", error);
      toast.error("ডিলিট করার সময় সমস্যা হয়েছে!");
    }
  };

  // টেবিল কলাম
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "ক্রমিক",
      dataIndex: "date",
      key: "date",
      render: (_, record) => tableFormatDate(record.date),
    },
    {
      title: "নাম",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "মোবাইল",
      dataIndex: "customer_mobile",
      key: "customer_mobile",
    },
    {
      title: "মাস",
      dataIndex: "month_name",
      key: "month_name",
    },
    {
      title: "ইকুইপমেন্ট নম্বর",
      dataIndex: "vehicle_no",
      key: "vehicle_no",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "ইকুইপমেন্ট সংখ্যা",
      dataIndex: "vehicle_qty",
      key: "vehicle_qty",
    },
    {
      title: "পরিমাণ",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "অবস্থা",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/GarageCustomerForm/update/${record.id}`}>
            <Button
              type="primary"
              size="small"
              className="!bg-white !text-primary"
            >
              <RiEditLine />
            </Button>
          </Link>
          <Button
            type="primary"
            danger
            size="small"
            className="!bg-white !text-red-500"
            onClick={() => {
              setSelectedCustomerId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <main>
      <Toaster />
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-xl p-4 border border-gray-200">
        {/* হেডার */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-gray-800 flex items-center gap-3">
            <FaUsers className="text-2xl" />
            সকল কাস্টমার তথ্য
          </h1>
          <div>
            <Link to="/tramessy/GarageCustomerForm">
              <Button
                type="primary"
                icon={<FaPlus />}
                className="flex items-center !bg-primary"
              >
                যোগ করুন
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-end my-3">
          {/* search */}
          <div className="mt-3 md:mt-0 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ট্রিপ খুঁজুন..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-5 top-[5.5rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* টেবিল */}
        <Table
          columns={columns}
          dataSource={customer}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: "কোনো গ্রাহকের তথ্য পাওয়া যায়নি",
          }}
        />
      </div>

      {/* ডিলিট মডাল */}
      <Modal
        title="সতর্কতা!"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            না
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => handleDelete(selectedCustomerId)}
          >
            হ্যাঁ, ডিলিট করুন
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত যে এই গ্রাহককে ডিলিট করতে চান?</p>
      </Modal>
    </main>
  );
};

export default GarageCustomer;
