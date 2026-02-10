"use client";

import { clsx } from "clsx";
import { type ReactNode } from "react";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  header?: ReactNode;
  className?: string;
}

export function Sidebar({ items, header, className }: SidebarProps) {
  return (
    <aside
      className={clsx(
        "flex flex-col w-64 bg-gray-900 text-white min-h-screen",
        className
      )}
    >
      {header && <div className="p-4 border-b border-gray-800">{header}</div>}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              item.active
                ? "bg-primary-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
