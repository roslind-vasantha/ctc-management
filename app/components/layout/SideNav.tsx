"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { navSections, topItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SideNavProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export const SideNav = ({ isOpen, onClose }: SideNavProps = {}) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidenav:expanded");
    if (saved !== null) setExpanded(saved === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidenav:expanded", expanded ? "1" : "0");
  }, [expanded]);

  const handleToggle = () => {
    setExpanded((v) => !v);
  };

  // Mobile detection - check on mount and resize
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const shouldShowOverlay = isOpen && isMobile;

  return (
    <>
      {/* Overlay for mobile */}
      {shouldShowOverlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen border-r border-[var(--border)] bg-[var(--card-bg)]",
          "flex flex-col transition-all duration-300 z-50",
          expanded ? "w-60" : "w-24",
          isOpen !== undefined && !isOpen
            ? "-translate-x-full lg:translate-x-0"
            : "translate-x-0"
        )}
        style={{ overflowX: "visible" }}
      >
        {/* Header */}
        <div
          className={cn(
            "relative border-b border-[var(--border)]",
            expanded
              ? "py-4 px-3 flex items-center justify-between"
              : "py-3 px-1.5 flex items-center justify-center gap-1"
          )}
        >
          {/* Logo block */}
          <Link
            href="/"
            className={cn(
              "shrink-0",
              expanded ? "flex items-center gap-2" : "grid place-items-center"
            )}
          >
            <div
              className={cn(
                "rounded-xl bg-[var(--foreground)] text-white grid place-items-center",
                expanded ? "h-8 w-8" : "h-8 w-8"
              )}
            >
              <span
                className={cn(
                  "font-black leading-none",
                  expanded ? "text-lg" : "text-base"
                )}
              >
                ₹
              </span>
            </div>
            {/* Optional wordmark when expanded */}
            {expanded && (
              <span className="ml-2 font-semibold text-lg text-[var(--text-color)]">
                Cashout
              </span>
            )}
          </Link>
          {/* Toggle button */}
          <button
            aria-label="Toggle sidebar"
            aria-pressed={expanded}
            onClick={handleToggle}
            className={cn(
              "rounded p-1 hover:bg-[var(--muted)] transition-colors shrink-0",
              !expanded && "p-0.5"
            )}
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={16} />}
          </button>
          {/* Mobile close button */}
          {isMobile && onClose && expanded && (
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-[var(--muted)] transition-colors lg:hidden ml-2"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Top item - Dashboard */}
        <nav className={cn("pt-2", expanded ? "px-2" : "px-2")}>
          <NavItemLink
            item={topItem}
            active={pathname === "/" || pathname === "/dashboard"}
            expanded={expanded}
            onClick={onClose}
          />
        </nav>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto mt-2">
          {navSections.map((section, i) => (
            <Section
              key={section.title}
              section={section}
              expanded={expanded}
              pathname={pathname}
              isFirst={i === 0}
              onItemClick={onClose}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

function Section({
  section,
  expanded,
  pathname,
  isFirst,
  onItemClick,
}: {
  section: { title: string; items: any[] };
  expanded: boolean;
  pathname: string;
  isFirst?: boolean;
  onItemClick?: () => void;
}) {
  return (
    <div className={cn(expanded ? "px-2" : "px-2")}>
      {expanded ? (
        <div className="px-2 pt-5 pb-1.5 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {section.title}
        </div>
      ) : (
        <div
          className={`my-2 ${isFirst ? "mt-3" : ""} h-px bg-[var(--muted)]/60`}
        />
      )}
      <ul className="space-y-1">
        {section.items.map((item) => (
          <li key={item.href}>
            <NavItemLink
              item={item}
              expanded={expanded}
              active={
                pathname === item.href || pathname.startsWith(item.href + "/")
              }
              onClick={onItemClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItemLink({
  item,
  expanded,
  active,
  onClick,
}: {
  item: { label: string; href: string; icon: any };
  expanded: boolean;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={!expanded ? item.label : undefined}
      onClick={onClick}
      className={`
        flex items-center h-10 rounded-lg
        transition-colors
        ${expanded ? "justify-start gap-2 px-2.5" : "justify-center gap-0"}
        ${
          active
            ? "bg-[var(--foreground)] text-white"
            : "text-[var(--text-color)] hover:bg-[var(--muted)]"
        }
      `}
    >
      <Icon size={expanded ? 18 : 20} className="flex-shrink-0" />
      {expanded && (
        <span
          className={`truncate text-sm ${
            active ? "font-semibold" : "font-medium"
          }`}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
}
