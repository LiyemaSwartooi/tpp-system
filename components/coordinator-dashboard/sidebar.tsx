"use client"

import type React from "react"
import { SidebarNavGroup, SidebarNavItem } from "@/components/dashboard-layout"
import { Home, Users } from "lucide-react"

type SidebarProps = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="px-2">
      <SidebarNavGroup title="Main">
        <SidebarNavItem
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          isActive={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <SidebarNavItem
          icon={<Users className="h-5 w-5" />}
          label="Student Performance"
          isActive={activeTab === "students" || activeTab === "student-details"}
          onClick={() => setActiveTab("overview")}
        />
      </SidebarNavGroup>
    </div>
  )
}
