import { Outlet } from "react-router-dom";
import TopNavigation from "./TopNavigation";

function RootLayout() {
  return (
    <>
      <TopNavigation />
      <Outlet />
    </>
  );
}

export default RootLayout;
