import React, { useContext, useState } from "react";
import bgImage from "../../assets/bannerImg.jpeg";
import { FaEnvelope, FaLock } from "react-icons/fa";
import ReusableForm from "./ReusableForm";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import login1 from "../../assets/afzal.png";
import login2 from "../../assets/login-.jpeg";
import login3 from "../../assets/truck-log.jpeg";
import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
    const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // const handleLogin = async (data) => {
  //   const { email, password } = data;
  //   const result = await login(email, password);

  //   if (result.success) {
  //     navigate("/tramessy");
  //   } else {
  //     alert(result.message || "Login failed");
  //   }
  // };
  const handleLogin = async (data) => {
    const { email, password } = data;
    setError("")
    setIsLoading(true)

     try {
    const res = await login(email, password); 
    // console.log(res)
if (res.success) {
      // লগইন সফল, Active ইউজার
      toast.success("Login successful!");
      navigate("/tramessy");
    } else {
      // লগইন ব্যর্থ বা Inactive
      toast.error(res.message || "Login failed");
      setError(res.message || "Login failed");
    }
  } catch (err) {
    toast.error(err.message || "Login failed");
    setError(err.message || "Login failed");
  }

    // const result = await login(email, password)

    //   navigate("/tramessy")

    setIsLoading(false)
  }

  const loginImages = [login1];

  return (
    <div className="md:px-20 h-screen flex items-center justify-center overflow-x-auto">
      <Toaster/>
      <div className="md:border-1 border-white  md:flex justify-between">
        {/* img */}
        <div className="hidden lg:block lg:w-1/2 mt-10 md:mt-0">
          {/* <img
            src={bgImage}
            alt=""
            className="rounded-lg md:rounded-l-lg w-full h-full"
          /> */}
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            // pagination={{ clickable: true }}
            navigation={false}
            className="w-[300px] h-[300px] lg:w-[500px] lg:h-[400px] "
          >
            {loginImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`Login Slide ${index + 1}`}
                  className="w-full h-full object-fill "
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {/* form */}
        <div className="flex items-center justify-center lg:w-1/2 !bg-white !rounded-xl py-7 md:p-5">
          <div className="bg-white py-28 p-5 md:p-7 w-full">
            <h2 className="text-3xl font-extrabold text-center text-[#11375B] mt-5 mb-10">
              {/* Admin{" "} */}
              <span className="font-semibold text-primary ">
              আফজাল কনস্ট্রাকশন{" "}
              </span>
            </h2>
            {/* <p className="text-sm text-center text-primary mb-6">
              Please Login!
            </p> */}

            <ReusableForm onSubmit={handleLogin}>
              <div className="relative">
                <input
                  type="text"
                  name="email"
                  placeholder="ইমেইল"
                  className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
                  required
                />
                <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
                  <FaEnvelope />
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="পাসওয়ার্ড"
                  className="w-full md:w-80 text-sm px-4 py-2 border border-gray-300 rounded-md outline-none"
                  required
                />
                <span className="absolute right-0 bg-primary text-white px-4 py-[11px] rounded-r-md hover:bg-secondary transition-all duration-500 cursor-pointer">
                  <FaLock />
                </span>
              </div>
            </ReusableForm>

            {/* <div className="mt-4 text-center">
              <Link to="/tramessy/ResetPass">
                <span className="text-sm text-[#11375B] underline hover:text-red-500 transition-all duration-700">
                পাসওয়ার্ড ভুলে গেছেন?
                </span>
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
