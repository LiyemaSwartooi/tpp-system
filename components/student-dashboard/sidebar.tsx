"use client"

import type React from "react"
import { SidebarNavGroup, SidebarNavItem } from "@/components/dashboard-layout"
import { BarChart, Home, User } from "lucide-react"

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
          isActive={activeTab === "input"}
          onClick={() => setActiveTab("input")}
        />
        <SidebarNavItem
          icon={<BarChart className="h-5 w-5" />}
          label="Performance Summary"
          isActive={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        />
        <SidebarNavItem
          icon={<User className="h-5 w-5" />}
          label="My Profile"
          isActive={activeTab === "profile"}
          onClick={() => setActiveTab("profile")}
        />
      </SidebarNavGroup>
    </div>
  )
}
