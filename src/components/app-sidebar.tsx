import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Products",
    url: "/admin/products",
    icon: Home,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: Inbox,
  },
  // Uncomment if needed:
  // {
  //   title: "Calendar",
  //   url: "#",
  //   icon: Calendar,
  // },
  // {
  //   title: "Search",
  //   url: "#",
  //   icon: Search,
  // },
  // {
  //   title: "Settings",
  //   url: "#",
  //   icon: Settings,
  // },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="bg-white border-r border-gray-200 shadow-lg">
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-extrabold text-gray-900 px-6 py-5 select-none tracking-tight">
            Frame-Kart
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col space-y-1 px-2 py-3">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <a
                    href={item.url}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 group"
                  >
                    <item.icon 
                      className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
                      aria-hidden="true"
                    />
                    <span className="text-base font-medium">{item.title}</span>
                  </a>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
