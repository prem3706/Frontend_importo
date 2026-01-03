import { useLocation } from "react-router-dom";
import DashboardHeader from "../Dashboard/dashboardMain/DashboardHeader";
import Header from "./Header";

const Layout = ({ children, isLoggedIn }) => {
  const location = useLocation();

  // Routes where header should be hidden
  const hideHeaderRoutes = [
    "/lrcreateform",
    "/lrlistpage",
    "/branchcreateform",
    "/brancheslistpage",
    "/companylistpage",
    "/companycreateform",
    "/vehiclecreateform",
    "/vehiclelistpage",
    "/goodslistpage",
    "/goodscreateform",
    "/goodsedit"  
  ];

  const shouldHideHeader =
  hideHeaderRoutes.includes(location.pathname) ||
  location.pathname.startsWith("/goodsedit") ||
  location.pathname.startsWith("/lrcreateform") ||
  location.pathname.startsWith("/branch-edit") ||
  location.pathname.startsWith("/company-edit") ||
  location.pathname.startsWith("/vehicle-edit") ||
  location.pathname.startsWith("/goods-edit") ||
  location.pathname.startsWith("/lr/print");


  // Decide which header to show
  const showHeader = shouldHideHeader
    ? null
    : location.pathname === "/"
    ? <Header />
    : isLoggedIn
    ? <DashboardHeader />
    : <Header />;

  return (
    <div>
      <header>{showHeader}</header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
