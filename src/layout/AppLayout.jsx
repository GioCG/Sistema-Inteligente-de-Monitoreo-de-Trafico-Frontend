import { useState } from "react";
import { SidebarDemo } from "../components/sidebar/sidebar";

export const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-shell">
      <SidebarDemo onCollapseChange={setCollapsed} />
      <main className={`page-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
};
