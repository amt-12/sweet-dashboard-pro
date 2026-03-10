import { Outlet } from "react-router-dom";
import BakerySidebar from "./BakerySidebar";
import DashboardTopbar from "./DashboardTopbar";
import SprinklesCursor from "./SprinklesCursor";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <SprinklesCursor />
      <BakerySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
