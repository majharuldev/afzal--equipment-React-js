
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaTruck, FaPlus, FaPen, FaEye, FaTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import { Table, Button, Modal, Input, Space, Card } from "antd";
import api from "../utils/axiosConfig";
import { tableFormatDate } from "../components/Shared/formatDate";

const CarList = () => {
  const [vehicles, setVehicle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCar, setselectedCar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api
      .get(`/vehicle`)
      .then((response) => {
          setVehicle(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("গাড়ির ডাটা আনতে সমস্যা হয়েছে:", error);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(
        `/vehicle/${id}`
      );

      if (response.status === 200) {
      setVehicle((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("গাড়ি সফলভাবে ডিলিট হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
      } else {
        throw new Error("গাড়ি ডিলিট করতে ব্যর্থ!");
      }

      setIsDeleteModalOpen(false);
      setSelectedDriverId(null);
    } catch (error) {
      console.error("ডিলিট এরর:", error);
      toast.error("গাড়ি ডিলিট করতে সমস্যা হয়েছে!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // filter & search functionality
    const filteredCarList = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();
    return (
      vehicle.vehicle_name?.toLowerCase().includes(term) ||
      vehicle.driver_name?.toLowerCase().includes(term) ||
      vehicle.vehicle_category?.toLowerCase().includes(term) ||
      vehicle.size?.toLowerCase().includes(term) ||
      vehicle.reg_no?.toLowerCase().includes(term) ||
      vehicle.reg_serial?.toLowerCase().includes(term) ||
      vehicle.reg_zone?.toLowerCase().includes(term) ||
      vehicle.reg_date?.toLowerCase().includes(term) ||
      vehicle.text_date?.toLowerCase().includes(term) ||
      vehicle.road_permit_date?.toLowerCase().includes(term) ||
      vehicle.fitness_date?.toLowerCase().includes(term)
    );
  });
  if (loading) return <p className="text-center mt-16">ইকুইপমেন্ট তথ্য লোড হচ্ছে...</p>;

  const csvData = filteredCarList.map((dt, index) => ({
    index: index + 1,
    driver_name: dt.driver_name,
    Equipment_name: dt.vehicle_name,
    "Equipment category": dt.vehicle_category,
    size: dt.size,
    "Equipment type": dt.vehicle_type,
    "Registration Zone": dt.reg_zone,
    "Fuel Capacity": dt.fuel_capcity,
    "Registration no": dt.reg_no,
    "Registration serial": dt.reg_serial,
    "Registration date": dt.reg_date,
    "Insurance date": dt.insurance_date,
    "Fitness date": dt.fitness_date,
    "Route Permit date": dt.route_per_date,
    "Tax date": dt.text_date,
    CreatedBy: dt.created_by
  }));

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "vehicles Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "vehicles_data.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    const tableColumn = [
      "#",
      "Driver Name",
      "Equipment Name",
      "Equipment Category",
      "Equipment Size",
      "Equipment No",
      "Status",
    ];
    const tableRows = filteredCarList.map((v, index) => [
      index + 1,
      v.driver_name,
      v.vehicle_name,
      v.vehicle_category,
      v.vehicle_size,
      `${v.reg_serial} ${v.registration_zone} ${v.registration_number}`,
      v.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [17, 55, 91],
        textColor: [255, 255, 255],
        halign: "left",
      },
      bodyStyles: {
        textColor: [17, 55, 91],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      theme: "grid",
    });

    doc.save("vehicles_data.pdf");
  };

  // print
 const printTable = () => {
  const printWindow = window.open("about:blank", "_blank");

  if (!printWindow) {
    alert("Popup blocked! Please allow popups.");
    return;
  }

  const printContent = `
    <html>
      <head>
        <title>Vehicle List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
          th { background: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Vehicle List</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>অপারেটর/ড্রাইভার</th>
              <th>ইকুইপমেন্ট নাম</th>
              <th>ইকুইপমেন্ট ক্যাটাগরি</th>
              <th>ইকুইপমেন্ট সাইজ</th>
              <th>ইকুইপমেন্ট নম্বর</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${filteredCarList
              .map(
                (vehicle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${vehicle.driver_name || "-"}</td>
                <td>${vehicle.vehicle_name || "-"}</td>
                <td>${vehicle.vehicle_category || "-"}</td>
                <td>${vehicle.vehicle_size || "-"}</td>
                <td>${vehicle.reg_serial || ""}-${vehicle.reg_zone || ""} ${vehicle.reg_no || ""}</td>
                <td>${vehicle.status || "-"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};


  const handleViewCar = async (id) => {
    try {
      const response = await api.get(
        `/vehicle/${id}`
      );

        setselectedCar(response.data);
        setViewModalOpen(true);
    } catch (error) {
      console.error("ভিউ এরর:", error);
      toast.error("গাড়ির তথ্য লোড করতে সমস্যা হয়েছে!");
    }
  };


  const columns = [
    {
      title: "ক্রমিক",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "অপারেটর/ড্রাইভার",
      dataIndex: "driver_name",
      key: "driver_name",
    },
    {
      title: "ইকুইপমেন্ট নাম",
      dataIndex: "vehicle_name",
      key: "vehicle_name",
    },
    {
      title: "ইকুইপমেন্ট ক্যাটাগরি",
      dataIndex: "vehicle_category",
      key: "vehicle_category",
    },
    // {
    //   title: "ইকুইপমেন্ট সাইজ",
    //   dataIndex: "vehicle_size",
    //   key: "vehicle_size",
    //   width: 120,
    // },
    {
      title: "ইকুইপমেন্ট নম্বর",
      key: "registration",
      render: (record) => (
        `${record.reg_serial}-${record.reg_zone} ${record.reg_no}`
      ),
    },
    {
      title: "স্ট্যাটাস",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "অ্যাকশন",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Link to={`/tramessy/update-equipment-form/${record.id}`}>
            <Button type="text" icon={<FaPen />} className="text-primary" />
          </Link>
          <Button 
            type="text" 
            icon={<FaEye />} 
            className="text-primary"
            onClick={() => handleViewCar(record.id)}
          />
          <Button 
            type="text" 
            icon={<FaTrashAlt />} 
            className="!text-red-500"
            onClick={() => {
              setSelectedDriverId(record.id);
              setIsDeleteModalOpen(true);
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <main className="p-2">
      <Toaster />
      <Card
        title={
          <div className="flex items-center gap-3 !border-b-none">
            <FaTruck className="text-primary text-2xl" />
            <span className="text-primary font-bold">ইকুইপমেন্ট তালিকা</span>
          </div>
        }
        extra={
          <Link to="/tramessy/add-equipment-form">
            <Button type="primary" icon={<FaPlus />} className="!bg-primary">
             ইকুইপমেন্ট 
            </Button>
          </Link>
        }
        className="shadow-md"
      >
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Button
              onClick={exportExcel}
              icon={<FaFileExcel />}
              type="primary"
              className="!py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-green-200 hover:!text-white"

            >
              এক্সেল
            </Button>
            <Button
              onClick={exportPDF}
              icon={<FaFilePdf />}
              type="primary"
            className=" !py-2 !px-5 !text-primary hover:!bg-primary !bg-gray-50 !shadow-md !shadow-amber-200 hover:!text-white"

            >
             পিডিএফ
            </Button>
            <Button
              onClick={printTable}
              icon={<FaPrint />}
              type="primary"
              className=" !text-primary !py-2 !px-5 hover:!bg-primary !bg-gray-50 !shadow-md !shadow-blue-200 hover:!text-white"
            >
              প্রিন্ট
            </Button>
          </Space>
          
         {/* search */}
         <div className="mt-3 md:mt-0">
            <Input
              placeholder="খুজন..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: 200 }}
            />
            {/*  Clear button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-7 top-[5.9rem] -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCarList}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            position: ["bottomCenter"],
          }}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center py-10">
                <svg
                  className="w-12 h-12 text-gray-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-500">কোনো ইকুইপমেন্ট তথ্য পাওয়া যায়নি</span>
              </div>
            ),
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        title="ডিলিট নিশ্চিত করুন"
        open={isDeleteModalOpen}
        onOk={() => handleDelete(selectedDriverId)}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Yes"
        cancelText="No"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="flex flex-col items-center">
          <FaTrashAlt className="text-red-500 text-4xl mb-4" />
          <p>আপনি কি এই ইকুইপমেন্ট ডিলিট করতে চান?</p>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        title="ইকুইপমেন্ট বিস্তারিত তথ্য"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            বন্ধ করুন
          </Button>,
        ]}
        width={900}
      >
        {selectedCar && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ড্রাইভারের নাম:</p>
              <p>{selectedCar.driver_name}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ইকুইপমেন্ট নাম:</p>
              <p>{selectedCar.vehicle_name}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ইকুইপমেন্ট ক্যাটাগরি:</p>
              <p>{selectedCar.vehicle_category || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ইকুইপমেন্ট সাইজ:</p>
              <p>{selectedCar.vehicle_size || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ইকুইপমেন্ট সাইজ:</p>
              <p>{selectedCar.vehicle_type || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">রেজিস্ট্রেশন নাম্বার:</p>
              <p>{selectedCar.reg_no || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">রেজিস্ট্রেশন সিরিয়াল:</p>
              <p>{selectedCar.reg_serial ||"N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">রেজিস্ট্রেশন Area:</p>
              <p>{selectedCar.reg_zone || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">রেজিস্ট্রেশন তারিখ:</p>
              <p>{tableFormatDate(selectedCar.reg_date) || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ট্যাক্সের মেয়াদ তারিখ:</p>
              <p>{tableFormatDate(selectedCar.tax_date) || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">রোড পারমিট তারিখ:</p>
              <p>{tableFormatDate(selectedCar.route_per_date) || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ফিটনেস তারিখ:</p>
              <p>{tableFormatDate(selectedCar.fitness_date) || "N/A"}</p>
            </div>
            <div className="border p-2 border-gray-200">
              <p className="font-semibold">ইনস্যুরেন্স তারিখ:</p>
              <p>{tableFormatDate(selectedCar.insurance_date) || "N/A"}</p>
            </div>
             <div className="border p-2 border-gray-200">
              <p className="font-semibold">তৈরী করেছেন:</p>
              <p>{tableFormatDate(selectedCar.created_by) || "N/A"}</p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default CarList;