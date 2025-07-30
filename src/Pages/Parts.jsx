import React, { useEffect, useRef, useState } from "react";
import { FaTruck, FaPlus, FaTrashAlt, FaPen } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import BtnSubmit from "../components/Button/BtnSubmit";

const Parts = () => {
  const [editMode, setEditMode] = useState(false);
const [editId, setEditId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  // delete modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFuelId, setselectedFuelId] = useState(null);
  const toggleModal = () => setIsOpen(!isOpen);
  // search
  const [searchTerm, setSearchTerm] = useState("");
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const partsDateRef = useRef(null);
 
  // fetch all parts
  const fetchParts = () => {
axios
      .get(`${import.meta.env.VITE_BASE_URL}/api/parts/list`)
      .then((response) => {
        if (response.data.status === "Success") {
          setParts(response.data.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching driver data:", error);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchParts()
  }, []);

  const onSubmit = async (data) => {
 setFormLoading(true);
  try {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    let response;
    if (editMode) {
      response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/parts/update/${editId}`,
        formData
      );
    } else {
      response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/parts/create`,
        formData
      );
    }

    const resData = response.data;

    if (resData.status === "Success") {
      toast.success(
        editMode
          ? "Parts updated successfully!"
          : "Parts saved successfully!",
        { position: "top-right" }
      );
      reset();
      setIsOpen(false);
      setShowFilter(false);
      setEditMode(false);
      setEditId(null);
       resetForm();
      // Refresh data
      fetchParts();
    } else {
      toast.error("Server issue: " + (resData.message || "Unknown error"));
    }
  } catch (error) {
    console.error(error);
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    toast.error("Server issue: " + errorMessage);
  }finally {
      setFormLoading(false);
    }
};
// New function to properly reset the form
  const resetForm = () => {
    reset({
      parts_name: "",
      parts_validity: ""
    });
    setEditMode(false);
    setEditId(null);
    setShowFilter(false);
  };

// edit modal handler
const handleEdit = (part) => {
  resetForm(); 
  setEditMode(true);        // Activate edit mode
  setEditId(part.id);       // Store part ID for update
  reset(part);              // Fill form with part data
  setShowFilter(true);      // Open the modal
};

const handleAddClick = () => {
    resetForm(); // Clear any edit data
    setShowFilter(true);
  };
  

  if (loading) return <p className="text-center mt-16">Loading parts...</p>;

  // delete by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/parts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete trip");
      }
      // Remove fuel from local list
      setParts((prev) => prev.filter((driver) => driver.id !== id));
      toast.success("Parts deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsOpen(false);
      setselectedFuelId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("There was a problem deleting.!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  // search
  const filteredParts = parts?.filter((part) => {
    const term = searchTerm.toLowerCase();
    return (
      part.parts_name?.toLowerCase().includes(term) ||
      part.parts_validity?.toLowerCase().includes(term)
    );
  });
  // pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParts = filteredParts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(parts.length / itemsPerPage);
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((currentPage) => currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages)
      setCurrentPage((currentPage) => currentPage + 1);
  };
  const handlePageClick = (number) => {
    setCurrentPage(number);
  };

  // parts status
  const isPartExpired = (validityDate) => {
  if (!validityDate) return true; // assume expired if no date
  const today = new Date().setHours(0, 0, 0, 0);
  const partDate = new Date(validityDate).setHours(0, 0, 0, 0);
  return partDate < today;
};

  return (
    <main className="relative  ">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-xs md:w-full overflow-hidden overflow-x-auto max-w-7xl mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-2 py-10 md:p-8 border border-gray-200">
        {/* Header */}
        <div className="md:flex items-center justify-between mb-6">
          <h1 className="text-xl font-extrabold text-[#11375B] flex items-center gap-3">
            <FaTruck className="text-[#11375B] text-2xl" />
            Parts List
          </h1>
          <div className="mt-3 md:mt-0 flex gap-2">
            <button
             onClick={handleAddClick} 
              className="bg-primary text-white px-4 py-1 rounded-md shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <FaPlus /> Parts
            </button>
          </div>
        </div>
        {/* Export + Search */}
        <div className="md:flex justify-end items-center">
          <div className="mt-3 md:mt-0">
            <span className="text-primary font-semibold pr-3">Search: </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search here..."
              className="border border-gray-300 rounded-md outline-none text-xs py-2 ps-2 pr-5"
            />
          </div>
        </div>
        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-md border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#11375B] text-white capitalize text-xs">
              <tr>
                <th className="px-2 md:px-4 py-3">SL</th>
                <th className="px-2 md:px-4 py-3">Name</th>
                <th className="px-2 md:px-4 py-3">Valid Date</th>
                <th className="px-2 md:px-4 py-3">Status</th>
                <th className="px-2 md:px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {
              
              currentParts.length === 0 ? (
    <tr>
      <td colSpan="8" className="text-center py-10 text-gray-500 italic">
        <div className="flex flex-col items-center">
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
          No report data found.
        </div>
      </td>
    </tr>
  )  
              : (currentParts?.map((part, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 border-b border-gray-300 transition-all cursor-pointer"
                >
                  <td className=" px-2 md:px-4 py-4 font-bold">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className=" px-2 md:px-4 py-4">
                    {part.parts_name}
                  </td>
                  <td className=" px-2 md:px-4 py-4">
                    {part.parts_validity}
                  </td>
                  <td className=" px-2 md:px-4 py-4">
                   {isPartExpired(part.parts_validity) ? (
    <span className="text-red-500 ">Expired Date</span>
  ) : (
    <span className="text-green-600 ">Valid Date</span>
  )}
                  </td>
                  <td className="px-2 md:px-4 py-4">
                    <div className="flex gap-2">
                      {/* <Link to={`/UpdatePartsForm/${part.id}`}> */}
                        <button onClick={() => handleEdit(part)} className="text-primary hover:bg-primary hover:text-white px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                          <FaPen className="text-[12px]" />
                        </button>
                      {/* </Link> */}
                      <button className="text-red-900 hover:text-white hover:bg-red-900 px-2 py-1 rounded shadow-md transition-all cursor-pointer">
                        <FaTrashAlt
                          onClick={() => {
                            setselectedFuelId(part.id);
                            setIsOpen(true);
                          }}
                          className="text-[12px]"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )))
              }
            </tbody>
          </table>
        </div>
        {/* pagination */}
      {
        currentParts.length === 0 ? (
          ""
        ) :
      (<div className="mt-10 flex justify-center">
        <div className="space-x-2 flex items-center">
          <button
            onClick={handlePrevPage}
            className={`p-2 ${
              currentPage === 1 ? "bg-gray-300" : "bg-primary text-white"
            } rounded-sm`}
            disabled={currentPage === 1}
          >
            <GrFormPrevious />
          </button>
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number + 1}
              onClick={() => handlePageClick(number + 1)}
              className={`px-3 py-1 rounded-sm ${
                currentPage === number + 1
                  ? "bg-primary text-white hover:bg-gray-200 hover:text-primary transition-all duration-300 cursor-pointer"
                  : "bg-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
              }`}
            >
              {number + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            className={`p-2 ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-primary text-white"
            } rounded-sm`}
            disabled={currentPage === totalPages}
          >
            <GrFormNext />
          </button>
        </div>
      </div>)}
      </div>
      
      {/* Delete modal */}
      <div className="flex justify-center items-center">
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#000000ad] z-50">
            <div className="relative bg-white rounded-lg shadow-lg p-6 w-72 max-w-sm border border-gray-300">
              <button
                onClick={toggleModal}
                className="text-2xl absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded-sm"
              >
                <IoMdClose />
              </button>

              <div className="flex justify-center mb-4 text-red-500 text-4xl">
                <FaTrashAlt />
              </div>
              <p className="text-center text-gray-700 font-medium mb-6">
                Do you want to delete the part?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={toggleModal}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-primary hover:text-white cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => handleDelete(selectedFuelId)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form*/}
      {showFilter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setShowFilter(false)}
              className="absolute top-2 right-2 text-white bg-primary rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
            >
              <IoMdClose />
            </button>
            <h2 className="text-xl font-semibold text-[#11375B] mb-4">
             {editMode ? "Update Parts" : "Add Parts"}
            </h2>

            <form action="" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <div className="w-full relative">
                  <label className="text-primary text-sm font-semibold">
                    Part Name
                  </label>
                  <input
                    {...register("parts_name", { required: true })}
                    type="text"
                    placeholder="Part Name..."
                    className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none"
                  />
                  {errors.parts_name && (
                    <span className="text-red-600 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full">
                  <label className="text-primary text-sm font-semibold">
                    Part Validity
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register("parts_validity")}
                      ref={(e) => {
                        register("parts_validity").ref(e);
                        partsDateRef.current = e;
                      }}
                      className="remove-date-icon mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded bg-white outline-none pr-10"
                    />

                    <span className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r">
                      <FiCalendar
                        className="text-white cursor-pointer"
                        onClick={() => partsDateRef.current?.showPicker?.()}
                      />
                    </span>
                  </div>
                </div>
              </div>
              {/* Submit Button */}
              <div className="text-right">
                <BtnSubmit loading={formLoading}>{editMode ? "Update" : "Submit"}</BtnSubmit>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Parts;
