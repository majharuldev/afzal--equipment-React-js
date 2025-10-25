import { Button, Modal, Table } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { RiEditLine, RiHomeOfficeLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { tableFormatDate } from "../../../components/Shared/formatDate";
import api from "../../../utils/axiosConfig";

const Office = () => {
  const [office, setOffice] = useState([]);
  const [loading, setLoading] = useState(true);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch customer ledger data
  useEffect(() => {
    api
      .get(`/office`)
      .then((response) => {
        if (response.data.success) {
          const data = response.data.data;
          setOffice(data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching office data:", error);
        setLoading(false);
      });
  }, []);
  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/office/${id}`,
      );
      if (!response.ok) {
        throw new Error("শাখার তথ্য মুছে ফেলা ব্যর্থ হয়েছে");
      }
      // Remove office data from local list
      setOffice((prev) => prev.filter((office) => office.id !== id));
      toast.success("শাখার তথ্য সফলভাবে মুছে ফেলা হয়েছে", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsModalOpen(false);
      setSelectedOfficeId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("মুছতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // টেবিলের কলাম
  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "তারিখ",
      dataIndex: "date",
      render: (text) => tableFormatDate(text),
    },
    {
      title: "শাখা",
      dataIndex: "branch_name",
    },
    {
      title: "ঠিকানা",
      dataIndex: "address",
    },
    {
      title: "শুরুর ব্যালেন্স",
      dataIndex: "opening_balance",
    },
    {
      title: "কার্যকলাপ",
      render: (_, record) => (
        <div className="flex gap-2">
          <Link to={`/tramessy/HR/HRM/UpdateOfficeForm/${record.id}`}>
            <Button size="small" type="primary" className="!bg-white !text-primary !shadow-md">
              <RiEditLine />
            </Button>
          </Link>
          <Button
            size="small"
            className="!bg-white !text-red-500 !shadow-md"
            type="primary"
            onClick={() => {
              setSelectedOfficeId(record.id);
              setIsModalOpen(true);
            }}
          >
            <FaTrashAlt />
          </Button>
        </div>
      ),
    },
  ];

  const [currentPage, setCurrentPage] = useState([1]);
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOffices = office.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(office.length / itemsPerPage);
 

  if (loading) return <p className="text-center mt-16">Loading office...</p>;
  return (
    <div className="">
      <Toaster />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-6 border border-gray-200">
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <RiHomeOfficeLine className="text-gray-800 text-2xl" />
            Office
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <Link to="/tramessy/HR/HRM/OfficeForm">
              <button className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer">
                <FaPlus /> Office
              </button>
            </Link>
          </div>
        </div>

        {/* table */}
        <Table
        columns={columns}
        dataSource={currentOffices}
        rowKey="id"
        loading={loading}
        pagination={{
            current: currentPage,
            pageSize: itemsPerPage,
            total: office.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            position: ['bottomCenter'],
          }}
        locale={{ emptyText: "কোনো শাখার তথ্য পাওয়া যায়নি" }}
      />

      {/* Delete Modal */}
      <Modal
        title="মুছে ফেলার নিশ্চয়তা"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            না
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => handleDelete(selectedOfficeId)}
          >
            হ্যাঁ, মুছুন
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত এই শাখার তথ্য মুছে ফেলতে চান?</p>
      </Modal>
      </div>
    </div>
  );
};

export default Office;
