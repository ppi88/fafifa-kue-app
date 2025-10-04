import { useState } from "react";

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(prev => !prev);
  return { isOpen, toggleSidebar };
}