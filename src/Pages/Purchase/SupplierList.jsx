import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Modal, Button } from "antd";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { MdShop } from "react-icons/md";
import { Link } from "react-router-dom";
import { tableFormatDate } from "../../components/Shared/formatDate";
import { RiEditLine } from "react-icons/ri";

const SupplierList = () => {
  const [supply, setSupply] = useState([]);
  const [loading, setLoading] = useState(true);

  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSupplyId, setSelectedSupplyId] = useState(null);

  // view modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/supply/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setSupply(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/supply/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete supply");
      }
      setSupply((prev) => prev.filter((item) => item.id !== id));
      toast.success("সরবরাহকারীর তথ্য সফলভাবে মুছে ফেলা হয়েছে");

      setIsOpen(false);
      setSelectedSupplyId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("মুছে ফেলতে সমস্যা হয়েছে!");
    }
  };

  // view by id
  const handleView = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/supply/show/${id}`
      );
      if (response.data.status === "Success") {
        setSelectedSupply(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("সরবরাহকারীর তথ্য লোড করা যায়নি।");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("তথ্য আনার সময় সমস্যা হয়েছে।");
    }
  };

  const columns = [
    {
      title: "ক্রমিক নং",
      render: (_, __, index) => <span>{index + 1}.</span>,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      rnder: (date) => tableFormatDate(date),
    },
    {
      title: "ব্যবসার নাম",
      dataIndex: "business_name",
    },
    {
      title: "ফোন",
      dataIndex: "phone",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
    },
    {
      title: "বাকি টাকা",
      dataIndex: "due_amount",
    },
    {
      title: "অবস্থা",
      dataIndex: "status",
    },
    {
      title: "অ্যাকশন",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/UpdateSupplyForm/${record.id}`}>
            <Button size="small" type="primary" className="!bg-white !text-primary">
              <RiEditLine />
            </Button>
          </Link>
          <Button
            size="small"
            type="primary"
            className="!bg-white !text-primary"
            onClick={() => handleView(record.id)}
          >
            <FaEye />
          </Button>
          <Button
            size="small"
            type="primary"
            className="!bg-white !text-red-500"
            onClick={() => {
              setSelectedSupplyId(record.id);
              setIsOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <MdShop className="text-2xl" /> সাপ্লায়ার তালিকা
        </h1>
        <Link to="/tramessy/Purchase/AddSupply">
          <Button type="primary" className="!bg-primary" icon={<FaPlus />}>
             যোগ করুন
          </Button>
        </Link>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={supply}
        columns={columns}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "কোনো সরবরাহকারীর তথ্য পাওয়া যায়নি" }}
      />

      {/* Delete Modal */}
      <Modal
        title="সরবরাহকারী মুছে ফেলুন"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button key="no" onClick={() => setIsOpen(false)}>
            না
          </Button>,
          <Button
            key="yes"
            type="primary"
            danger
            onClick={() => handleDelete(selectedSupplyId)}
          >
            হ্যাঁ
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত এই সরবরাহকারীর তথ্য মুছে ফেলতে চান?</p>
      </Modal>

      {/* View Modal */}
      <Modal
        title="সরবরাহকারীর তথ্য"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewModalOpen(false)}>
            বন্ধ করুন
          </Button>,
        ]}
      >
        {selectedSupply && (
          <div className="space-y-2">
            <p>
              <strong>ব্যবসার নাম:</strong> {selectedSupply.business_name}
            </p>
            <p>
              <strong>ফোন:</strong> {selectedSupply.phone}
            </p>
            <p>
              <strong>ঠিকানা:</strong> {selectedSupply.address}
            </p>
            <p>
              <strong>অবস্থা:</strong> {selectedSupply.status}
            </p>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default SupplierList;
