import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./components/Menu/MenuPage";
import Login from "./components/Auth/Login";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import AdminCategories from "./Components/Admin/AdminCategories";
import AdminUsers from "./Components/Admin/AdminUsers";
import AdminWorkingHours from "./components/Admin/AdminWorkingHours";
import AdminMenu from "./components/Admin/AdminMenu";
import AdminSocialMedia from "./components/Admin/AdminSocialMedia";
import NotFound from "./components/Shared/NotFound";

function App() {
  return (
    <Router>

      <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/login" element={<Login /> }/>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/working-hours" element={<AdminWorkingHours />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/social-media" element={<AdminSocialMedia />} />
              <Route path="/admin/categories" element={<AdminCategories />} />

            <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;