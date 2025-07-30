import React from "react";
import bgImage from "../../assets/bannerImg.jpeg";
import { FaEnvelope } from "react-icons/fa";
import ReusableForm from "./ReusableForm";

const ResetPass = () => {
  const handleLogin = (data) => {
    // console.log("Login Data:", data);
    // Add login logic here
  };

  return (
    <div className="md:px-40 h-screen flex items-center">
      <div className="md:border-2 border-primary rounded-xl flex justify-between">
        {/* img */}
        <div className="hidden md:block w-1/2">
          <img src={bgImage} alt="" className="w-fit h-fit rounded-l-lg" />
        </div>
        {/* form */}
        <div className="flex items-center justify-center md:w-1/2 md:px-16 rounded-xl p-3 md:p-8">
          <div className="bg-white shadow-lg p-7 rounded-md border md:border-none border-gray-200">
            <h2 className="text-3xl font-extrabold text-center text-[#11375B] mb-1">
              এডমিন{" "}
              <span className="font-semibold text-red-500">Nalitabari</span>
            </h2>
            <p className="text-sm text-center text-primary mb-6 pt-3">
              তুমি কি তোমার পাসওয়ার্ড ভুলে গেছো? এখানে তুমি সহজেই তোমার
              পাসওয়ার্ড রিসেট করতে পারো।
            </p>

            <ReusableForm onSubmit={handleLogin}>
              {/* Email / Mobile */}
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="ইমেইল"
                  className="w-full text-sm px-4 py-2 border border-primary rounded-md outline-none"
                  required
                />
                <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
                  <FaEnvelope />
                </span>
              </div>
            </ReusableForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPass;
