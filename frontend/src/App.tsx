import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./components/Home/Home";
import { Register } from "./pages/Register/Register";
import { Login } from "./pages/Login/Login";
import { EditProfile } from "./pages/EditProfile/EditProfile";
import { AboutPage } from "./pages/About/About";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <AboutPage /> },
      { path: "register", element: <Register /> },
      { path: "login", element: <Login /> },
      { path: "edit-profile", element: <EditProfile /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
