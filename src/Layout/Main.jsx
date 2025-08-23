// import React, { useState, useEffect, useRef } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import SIdeBar from "../components/SIdeBar";
// import Header from "../components/Shared/Header";
// import Footer from "../components/Shared/Footer";

// const Main = () => {
//   const location = useLocation();
//   const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
//   const sidebarRef = useRef(null);

//   const hideMenu =
//     location.pathname.includes("/Login") ||
//     location.pathname.includes("/ResetPass");

//   // Close sidebar if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setMobileSidebarOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);

//     // Cleanup event listener
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   if (hideMenu) {
//     return (
//       <div className="min-h-screen roboto-font">
//         <Outlet />
//       </div>
//     );
//   }

//   return (
//     <div className="flex md:max-w-7xl lg:max-w-[1920px] hide-scrollbar mx-auto">
//       {/* Fixed Sidebar (Desktop) */}
//       <div className="hidden md:flex flex-col w-64 h-screen fixed border-r border-gray-300">
//         <SIdeBar />
//       </div>

//       {/* Sidebar (Mobile) */}
//       {/* {mobileSidebarOpen && (
//         <>
//           <div
//             ref={sidebarRef} // Attach the ref to the sidebar
//             className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-scroll ${
//               mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
//             }`}
//           >
//             <SIdeBar />
//           </div>
//         </>
//       )} */}

//       {/* Main Content */}
//       <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
//         {/* Pass toggleSidebar function to Header */}
//         <Header setMobileSidebarOpen={setMobileSidebarOpen} />
//         <main className="flex-1 overflow-hidden md:p-4">
//           <Outlet />
//         </main>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default Main;


import React, { useEffect, useRef, useState } from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/SIdeBar";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";

const { Sider, Content } = Layout;

const Main = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const hideMenu =
    location.pathname.includes("/tramessy/Login") ||
    location.pathname.includes("/tramessy/ResetPass");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (hideMenu) {
    return (
      <div className="min-h-screen">
        <Outlet />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {/* <Sider
        width={260}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        className="bg-white shadow-md"
        style={{ height: "100vh", overflow: "auto", position: "sticky", top: 0 }}
      > */}
        <Sidebar />
      {/* </Sider> */}

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <div style={{ background: "#fff", zIndex: 10 }}>
          <Header setMobileSidebarOpen={setMobileSidebarOpen} />
        </div>

        {/* Content */}
        <Content className="bg-white px-2 sm:px-4  py-4 hide-scrollbar" style={{ flex: 1, overflowY: "auto", // Ensure content is scrollable
    maxHeight: "100vh", }}>
          <Outlet />
        </Content>

        {/* Footer */}
        <Footer />
      </Layout>
    </Layout>
  );
};

export default Main;