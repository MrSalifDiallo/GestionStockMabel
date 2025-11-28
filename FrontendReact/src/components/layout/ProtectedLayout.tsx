import { Navigate, Outlet, useLocation } from "react-router-dom";
import {DashboardLayout} from "@/components/layout/DashboardLayout";
import tokenProvider from "@/config/config.token-provider";

const ProtectedLayout = () => {
  const token = tokenProvider.getToken();
  const location = useLocation();

  // Vérifier si le token existe et n'est pas null/undefined/empty
  if (!token || token === "null" || token === "undefined" || token.trim() === "") {
    tokenProvider.clearToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedLayout;
