// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import useAdmin from "../hooks/useAdmin";
// import { AuthContext } from "../providers/AuthProvider";

// const AdminRoute = ({ children }) => {
//   const isAdmin = useAdmin();
//   const { user, loading } = useContext(AuthContext);

//   if (loading) return <div>Loading...</div>;

//   if (user && isAdmin) return children;

//   return <Navigate to="/tramessy" replace />;
// };

// export default AdminRoute;


import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthProvider";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) return <Navigate to="/tramessy/Login" />;

  if (user?.role === "admin") {
    return children;
  }

  return <Navigate to="/tramessy/login" replace />;
};

export default AdminRoute;