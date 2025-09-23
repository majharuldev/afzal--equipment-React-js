
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaTrashAlt, FaUsers, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Table, Modal, Button } from "antd";
import { RiEditLine } from "react-icons/ri";

const GarageCustomer = () => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // গ্রাহক ডাটা ফেচ
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => {
        if (response.data.status === "Success") {
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
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/customer/delete/${id}`,
        {
          method: "DELETE",
        }
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
      title: "নাম",
      dataIndex: "customer_name",
      key: "customer_name",
    },
    {
      title: "মোবাইল",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "মাস",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "ইকুইপমেন্ট নম্বর",
      dataIndex: "",
      key: "address",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "ইকুইপমেন্ট সংখ্যা",
      dataIndex: "",
      key: "address",
    },
    {
      title: "পরিমাণ",
      dataIndex: "due",
      key: "due",
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
          <Link to={`/tramessy/UpdateCustomerForm/${record.id}`}>
            <Button
              type="primary"
              size="small"
              className="!bg-white !text-primary"
            >
 <RiEditLine/>
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
