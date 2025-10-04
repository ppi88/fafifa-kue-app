import Link from "next/link";
import { useRouter } from "next/router";

interface Props {
  label: string;
  icon: string;
  to: string;
}

function SidebarItem({ label, icon, to }: Props) {
  const router = useRouter();
  const active = router.pathname === to;

  return (
    <Link
      href={to}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-r-full transition-all duration-200
        ${active ? "bg-green-700 text-white shadow-md" : "text-gray-700 hover:bg-green-100"}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default SidebarItem;