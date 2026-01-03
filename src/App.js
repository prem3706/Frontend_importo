import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import "./App.css";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./Dashboard/dashboardMain/Dashboard.js";
import Alert from "./components/Alert";
import CustomConfirmDialog from "./components/ConfirmationAlert.js";
import BranchListPage from "./Dashboard/createSection/BranchListPage.js";
import Layout from "./components/Layout";
import UserProfile from "./Dashboard/dashboardMain/UserProfile.js";
import LRCreateForm from "./Dashboard/createSection/LRCreateForm.js";
import LRListPage from "./Dashboard/createSection/LRListPage.js";
import LRPrintPage from "./Dashboard/createSection/LRPrintPage.js";
import BranchCreateForm from "./Dashboard/createSection/BranchCreateForm.js";
import CompanyListPage from "./Dashboard/createSection/CompanyListPage.js";
import CompanyCreateForm from "./Dashboard/createSection/CompanyCreateForm.js";
import VehicleCreateForm from "./Dashboard/createSection/VehicleCreateForm.js";
import VehicleListPage from "./Dashboard/createSection/VehicleListPage.js";
import GoodsCreateForm from "./Dashboard/createSection/GoodsCreateForm.js";
import GoodsListPage from "./Dashboard/createSection/GoodsListPage.js";

function App() {
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    message: "",
    onConfirm: () => {},
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/check_session.php`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.loggedIn);
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 3000);
  };

  const showConfirmDialog = (message, onConfirm) => {
    setConfirmDialog({
      show: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, show: false }));
      },
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, show: false }));
  };

  if (!authChecked) {
    return null;
  }

  return (
    <Router>
      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
      />

      <CustomConfirmDialog
        show={confirmDialog.show}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={hideConfirmDialog}
      />

      <Layout isLoggedIn={isLoggedIn}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainPage showAlert={showAlert} />} />
          <Route path="/login" element={<Login showAlert={showAlert} />} />
          <Route path="/signup" element={<Signup showAlert={showAlert} />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lr/print/:lrId"
            element={
              <ProtectedRoute>
                <LRPrintPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/brancheslistpage"
            element={
              <ProtectedRoute>
                <BranchListPage
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/branchcreateform"
            element={
              <ProtectedRoute>
                <BranchCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/branch-edit/:branchId"
            element={
              <ProtectedRoute>
                <BranchCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/companylistpage"
            element={
              <ProtectedRoute>
                <CompanyListPage
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/companycreateform"
            element={
              <ProtectedRoute>
                <CompanyCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-edit/:companyId"
            element={
              <ProtectedRoute>
                <CompanyCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehiclecreateform"
            element={
              <ProtectedRoute>
                <VehicleCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehicle-edit/:vehicle_id"
            element={
              <ProtectedRoute>
                <VehicleCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vehiclelistpage"
            element={
              <ProtectedRoute>
                <VehicleListPage
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goodslistpage"
            element={
              <ProtectedRoute>
                <GoodsListPage
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goodscreateform"
            element={
              <ProtectedRoute>
                <GoodsCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goods-edit/:goods_id"
            element={
              <ProtectedRoute>
                <GoodsCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/userprofile"
            element={
              <ProtectedRoute>
                <UserProfile
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lrcreateform"
            element={
              <ProtectedRoute>
                <LRCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lrcreateform/:lrId"
            element={
              <ProtectedRoute>
                <LRCreateForm showAlert={showAlert} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lrlistpage"
            element={
              <ProtectedRoute>
                <LRListPage
                  showAlert={showAlert}
                  showConfirmDialog={showConfirmDialog}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
