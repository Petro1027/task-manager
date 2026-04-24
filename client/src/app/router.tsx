import { createBrowserRouter } from "react-router-dom";
import BoardsPage from "../pages/BoardsPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/boards",
    element: <BoardsPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
