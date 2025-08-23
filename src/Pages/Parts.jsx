// import React, { useEffect, useRef, useState } from "react";
// import { 
//   PlusOutlined, 
//   DeleteOutlined, 
//   EditOutlined, 
//   CloseOutlined,
//   CalendarOutlined,
//   TruckOutlined,
//   ArrowLeftOutlined,
//   ArrowRightOutlined,
//   CloseCircleOutlined
// } from '@ant-design/icons';
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { useForm } from "react-hook-form";
// import { Link } from "react-router-dom";
// import { 
//   Table, 
//   Button, 
//   Modal, 
//   Input, 
//   DatePicker, 
//   Form, 
//   Tag, 
//   Card, 
//   Space, 
//   Pagination,
//   Spin,
//   Empty
// } from 'antd';
// import dayjs from 'dayjs';

// const Parts = () => {
//   const [editMode, setEditMode] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [parts, setParts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [formLoading, setFormLoading] = useState(false);
//   const [deleteModalVisible, setDeleteModalVisible] = useState(false);
//   const [selectedPartId, setSelectedPartId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [form] = Form.useForm();
  
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm();

//   // fetch all parts
//   const fetchParts = () => {
//     axios
//       .get(`${import.meta.env.VITE_BASE_URL}/api/parts/list`)
//       .then((response) => {
//         if (response.data.status === "Success") {
//           setParts(response.data.data);
//         }
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching driver data:", error);
//         setLoading(false);
//       });
//   }

//   useEffect(() => {
//     fetchParts()
//   }, []);

//   const onSubmit = async (values) => {
//     setFormLoading(true);
//     try {
//       const formData = new FormData();
//       for (const key in values) {
//         formData.append(key, values[key]);
//       }

//       let response;
//       if (editMode) {
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/parts/update/${editId}`,
//           formData
//         );
//       } else {
//         response = await axios.post(
//           `${import.meta.env.VITE_BASE_URL}/api/parts/create`,
//           formData
//         );
//       }

//       const resData = response.data;

//       if (resData.status === "Success") {
//         toast.success(
//           editMode
//             ? "Parts updated successfully!"
//             : "Parts saved successfully!",
//           { position: "top-right" }
//         );
//         form.resetFields();
//         setShowModal(false);
//         setEditMode(false);
//         setEditId(null);
//         fetchParts();
//       } else {
//         toast.error("Server issue: " + (resData.message || "Unknown error"));
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server issue: " + errorMessage);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleEdit = (part) => {
//     form.setFieldsValue({
//       parts_name: part.parts_name,
//       parts_validity: part.parts_validity ? dayjs(part.parts_validity) : null
//     });
//     setEditMode(true);
//     setEditId(part.id);
//     setShowModal(true);
//   };

//   const handleAddClick = () => {
//     form.resetFields();
//     setEditMode(false);
//     setEditId(null);
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/parts/${id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete part");
//       }
//       setParts((prev) => prev.filter((part) => part.id !== id));
//       toast.success("Parts deleted successfully", {
//         position: "top-right",
//         autoClose: 3000,
//       });

//       setDeleteModalVisible(false);
//       setSelectedPartId(null);
//     } catch (error) {
//       console.error("Delete error:", error);
//       toast.error("There was a problem deleting!", {
//         position: "top-right",
//         autoClose: 3000,
//       });
//     }
//   };

//   // search and filter
//   const filteredParts = parts?.filter((part) => {
//     const term = searchTerm.toLowerCase();
//     return (
//       part.parts_name?.toLowerCase().includes(term) ||
//       part.parts_validity?.toLowerCase().includes(term)
//     );
//   });

//   // pagination
//   const itemsPerPage = 10;
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentParts = filteredParts.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

//   // parts status
//   const isPartExpired = (validityDate) => {
//     if (!validityDate) return true;
//     const today = new Date().setHours(0, 0, 0, 0);
//     const partDate = new Date(validityDate).setHours(0, 0, 0, 0);
//     return partDate < today;
//   };

//   const columns = [
//     {
//       title: 'SL',
//       dataIndex: 'id',
//       key: 'id',
//       render: (_, record, index) => indexOfFirstItem + index + 1,
//     },
//     {
//       title: 'Name',
//       dataIndex: 'parts_name',
//       key: 'parts_name',
//     },
//     {
//       title: 'Valid Date',
//       dataIndex: 'parts_validity',
//       key: 'parts_validity',
//     },
//     {
//       title: 'Status',
//       key: 'status',
//       render: (_, record) => (
//         isPartExpired(record.parts_validity) ? (
//           <Tag color="error">Expired Date</Tag>
//         ) : (
//           <Tag color="success">Valid Date</Tag>
//         )
//       ),
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Space size="middle">
//           <Button 
//             type="primary" 
//             icon={<EditOutlined />} 
//             onClick={() => handleEdit(record)}
//           />
//           <Button 
//             danger 
//             icon={<DeleteOutlined />} 
//             onClick={() => {
//               setSelectedPartId(record.id);
//               setDeleteModalVisible(true);
//             }}
//           />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="relative">
//       <Toaster position="top-right" reverseOrder={false} />
//       <Card
//         title={
//           <div className="flex items-center">
//             <TruckOutlined className="mr-2 text-[#11375B]" />
//             <span className="text-[#11375B] font-bold">Parts List</span>
//           </div>
//         }
//         extra={
//           <Button 
//             type="primary" 
//             icon={<PlusOutlined />} 
//             onClick={handleAddClick}
//           >
//             Parts
//           </Button>
//         }
//         className="rounded-xl shadow-xl border border-gray-200"
//       >
//         <div className="mb-4 flex justify-end">
//           <Input
//             placeholder="Search here..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//             style={{ width: 200 }}
//           />
//         </div>

//         <Spin spinning={loading}>
//           {currentParts.length === 0 ? (
//             <Empty description="No parts data found" />
//           ) : (
//             <>
//               <Table 
//                 columns={columns} 
//                 dataSource={currentParts} 
//                 rowKey="id"
//                 pagination={false}
//                 className="rounded-md border border-gray-200"
//               />
//               <div className="mt-4 flex justify-center">
//                 <Pagination
//                   current={currentPage}
//                   total={filteredParts.length}
//                   pageSize={itemsPerPage}
//                   onChange={(page) => setCurrentPage(page)}
//                   showSizeChanger={false}
//                 />
//               </div>
//             </>
//           )}
//         </Spin>
//       </Card>

//       {/* Delete Modal */}
//       <Modal
//         title="Confirm Delete"
//         visible={deleteModalVisible}
//         onOk={() => handleDelete(selectedPartId)}
//         onCancel={() => setDeleteModalVisible(false)}
//         okText="Yes"
//         cancelText="No"
//         okButtonProps={{ danger: true }}
//       >
//         <div className="text-center">
//           <DeleteOutlined className="text-4xl text-red-500 mb-4" />
//           <p>Do you want to delete the part?</p>
//         </div>
//       </Modal>

//       {/* Add/Edit Modal */}
//       <Modal
//         title={editMode ? "Update Parts" : "Add Parts"}
//         visible={showModal}
//         onCancel={() => setShowModal(false)}
//         footer={null}
//         destroyOnClose
//       >
//         <Form
//           form={form}
//           layout="vertical"
//           onFinish={onSubmit}
//           autoComplete="off"
//         >
//           <Form.Item
//             label="Part Name"
//             name="parts_name"
//             rules={[{ required: true, message: 'Please input part name!' }]}
//           >
//             <Input placeholder="Part Name..." />
//           </Form.Item>

//           <Form.Item
//             label="Part Validity"
//             name="parts_validity"
//           >
//             <DatePicker 
//               style={{ width: '100%' }} 
//               suffixIcon={<CalendarOutlined />}
//             />
//           </Form.Item>

//           <Form.Item className="text-right">
//             <Button 
//               type="primary" 
//               htmlType="submit" 
//               loading={formLoading}
//             >
//               {editMode ? "Update" : "Submit"}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default Parts;

import React, { useEffect, useRef, useState } from "react";
import { FaTruck, FaPlus, FaPen, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Table, Modal, Input, Button, DatePicker, Pagination, Space, Tag } from "antd";
import dayjs from "dayjs";
import {EditOutlined} from '@ant-design/icons'

const Parts = () => {
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const itemsPerPage = 10;
  const dateRef = useRef(null);

  const fetchParts = () => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/parts/list`)
      .then((res) => {
        if (res.data.status === "Success") {
          setParts(res.data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const resetForm = () => {
    reset({ parts_name: "", parts_validity: "" });
    setEditMode(false);
    setEditId(null);
  };

  const handleAddClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (part) => {
    setEditMode(true);
    setEditId(part.id);
    reset(part);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setFormLoading(true);
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      const url = editMode
        ? `${import.meta.env.VITE_BASE_URL}/api/parts/update/${editId}`
        : `${import.meta.env.VITE_BASE_URL}/api/parts/create`;

      const res = await axios.post(url, formData);
      if (res.data.status === "Success") {
        toast.success(editMode ? "Parts updated successfully!" : "Parts saved successfully!");
        setIsModalOpen(false);
        resetForm();
        fetchParts();
      } else {
        toast.error("Server issue: " + (res.data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Do you want to delete the part?",
      icon: <FaTrashAlt className="text-red-500" />,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/parts/${id}`);
          toast.success("Parts deleted successfully");
          fetchParts();
        } catch {
          toast.error("Failed to delete part");
        }
      },
    });
  };

  const isPartExpired = (validityDate) => {
    if (!validityDate) return true;
    const today = new Date().setHours(0, 0, 0, 0);
    const partDate = new Date(validityDate).setHours(0, 0, 0, 0);
    return partDate < today;
  };

  const filteredParts = parts.filter(
    (p) =>
      p.parts_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parts_validity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentParts = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    {
      title: "SL",
      render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
    },
    {
      title: "Name",
      dataIndex: "parts_name",
    },
    {
      title: "Valid Date",
      dataIndex: "parts_validity",
    },
    {
      title: "Status",
      render: (_, record) =>
        isPartExpired(record.parts_validity) ? (
          <Tag color="red">Expired Date</Tag>
        ) : (
          <Tag color="green">Valid Date</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<FaTrashAlt />}
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <main className="p-4">
      <Toaster />
      <div className="bg-white rounded-lg p-4 shadow">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FaTruck /> Parts List
          </h1>
          <Button type="primary" icon={<FaPlus />} onClick={handleAddClick}>
            Parts
          </Button>
        </div>

        <div className="flex justify-end mb-4">
          <Input.Search
            placeholder="Search here..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 250 }}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={currentParts}
          loading={loading}
          rowKey="id"
          pagination={false}
        />

        {filteredParts.length > itemsPerPage && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={filteredParts.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title={editMode ? "Update Parts" : "Add Parts"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block font-semibold">Part Name</label>
            <Input
              {...register("parts_name", { required: true })}
              placeholder="Part Name..."
            />
            {errors.parts_name && <p className="text-red-500 text-sm">This field is required</p>}
          </div>

          <div className="mb-4">
            <label className="block font-semibold">Part Validity</label>
            <DatePicker
              className="w-full"
              {...register("parts_validity")}
              onChange={(date) =>
                reset((prev) => ({ ...prev, parts_validity: date ? dayjs(date).format("YYYY-MM-DD") : "" }))
              }
            />
          </div>

          <div className="text-right">
            <Button
              type="primary"
              htmlType="submit"
              loading={formLoading}
            >
              {editMode ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
};

export default Parts;
