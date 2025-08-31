
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
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setVehicle(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete driver");
      }
      setVehicle((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Vehicle deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsDeleteModalOpen(false);
      setSelectedDriverId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) return <p className="text-center mt-16">Loading vehicle...</p>;

  const csvData = vehicles.map((dt, index) => ({
    index: index + 1,
    driver_name: dt.driver_name,
    vehicle_name: dt.vehicle_name,
    category: dt.category,
    size: dt.size,
    registration_zone: dt.registration_zone,
    trip: 0,
    registration_number: dt.registration_number,
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
      "Vehicle Name",
      "Vehicle Category",
      "Vehicle Size",
      "Vehicle No",
      "Status",
    ];
    const tableRows = filteredCarList.map((v, index) => [
      index + 1,
      v.driver_name,
      v.vehicle_name,
      v.vehicle_category,
      v.vehicle_size,
      `${v.registration_zone} ${v.registration_number}`,
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

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <html>
        <head>
          <title>Vehicle List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #11375B; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Vehicle List</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Driver Name</th>
                <th>Vehicle Name</th>
                <th>Vehicle Category</th>
                <th>Vehicle Size</th>
                <th>Vehicle No</th>
                <th>Status</th>
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
                  <td>${vehicle.registration_zone} ${vehicle.registration_number}</td>
                  <td>${vehicle.status || "-"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleViewCar = async (id) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/vehicle/show/${id}`
      );
      if (response.data.status === "Success") {
        setselectedCar(response.data.data);
        setViewModalOpen(true);
      } else {
        toast.error("Vehicle information could not be loaded.");
      }
    } catch (error) {
      console.error("View error:", error);
      toast.error("Vehicle information could not be loaded.");
    }
  };

  const filteredCarList = vehicles.filter((vehicle) => {
    const term = searchTerm.toLowerCase();
    return (
      vehicle.vehicle_name?.toLowerCase().includes(term) ||
      vehicle.driver_name?.toLowerCase().includes(term) ||
      vehicle.category?.toLowerCase().includes(term) ||
      vehicle.size?.toLowerCase().includes(term) ||
      vehicle.registration_number?.toLowerCase().includes(term) ||
      vehicle.registration_serial?.toLowerCase().includes(term) ||
      vehicle.registration_zone?.toLowerCase().includes(term) ||
      vehicle.registration_date?.toLowerCase().includes(term) ||
      vehicle.text_date?.toLowerCase().includes(term) ||
      vehicle.road_permit_date?.toLowerCase().includes(term) ||
      vehicle.fitness_date?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Driver Name",
      dataIndex: "driver_name",
      key: "driver_name",
    },
    {
      title: "Vehicle Name",
      dataIndex: "vehicle_name",
      key: "vehicle_name",
    },
    {
      title: "Vehicle Category",
      dataIndex: "vehicle_category",
      key: "vehicle_category",
    },
    {
      title: "Vehicle Size",
      dataIndex: "vehicle_size",
      key: "vehicle_size",
    },
    {
      title: "Vehicle No",
      key: "registration",
      render: (record) => (
        `${record.registration_serial}-${record.registration_zone} ${record.registration_number}`
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Link to={`/tramessy/update-vehicel-form/${record.id}`}>
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
            className="text-red-500"
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
    <main className="p-4">
      <Toaster />
      <Card
        title={
          <div className="flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            <span className="text-[#11375B] font-bold">Vehicle List</span>
          </div>
        }
        extra={
          <Link to="/tramessy/add-vehicel-form">
            <Button type="primary" icon={<FaPlus />}>
              Add Vehicle
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
              className="flex items-center"
            >
              Excel
            </Button>
            <Button
              onClick={exportPDF}
              icon={<FaFilePdf />}
              className="flex items-center"
            >
              PDF
            </Button>
            <Button
              onClick={printTable}
              icon={<FaPrint />}
              className="flex items-center"
            >
              Print
            </Button>
          </Space>
          
          <Input.Search
            placeholder="Search Vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
          />
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
                <span className="text-gray-500">No vehicle data found</span>
              </div>
            ),
          }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        title="Confirm Delete"
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
          <p>Do you want to delete this vehicle?</p>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Vehicle Information"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {selectedCar && (
          <div className="grid grid-cols-2 gap-4">
            <div className="border p-2">
              <p className="font-semibold">Driver Name:</p>
              <p>{selectedCar.driver_name}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Vehicle Name:</p>
              <p>{selectedCar.vehicle_name}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Vehicle Category:</p>
              <p>{selectedCar.vehicle_category}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Vehicle Size:</p>
              <p>{selectedCar.vehicle_size}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Registration Number:</p>
              <p>{selectedCar.registration_number}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Registration Serial:</p>
              <p>{selectedCar.registration_serial}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Registration Area:</p>
              <p>{selectedCar.registration_zone}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Registration Date:</p>
              <p>{selectedCar.registration_date}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Tax Expiry Date:</p>
              <p>{selectedCar.text_date || "N/A"}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Road Permit Date:</p>
              <p>{selectedCar.road_permit_date}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Fitness Expiry Date:</p>
              <p>{selectedCar.fitness_date}</p>
            </div>
            <div className="border p-2">
              <p className="font-semibold">Insurance Expiry Date:</p>
              <p>{selectedCar.insurance_date}</p>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default CarList;