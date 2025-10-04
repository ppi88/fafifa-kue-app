import React from "react";

const SidebarToggle = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <button className="p-2 text-2xl md:hidden" onClick={toggleSidebar}>
    ☰
  </button>
);

export default SidebarToggle;