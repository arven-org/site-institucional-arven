"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArvenLogo } from "./logo";
import { ScheduleButton } from "./schedule-button";
import { useLeadGate } from "./lead-gate/provider";
import { brand, nav } from "@/lib/site/content";

export function SiteNav() {
  const { open: openGate } = useLeadGate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-500"
      style={{
        backgroundColor: scrolled
          ? "color-mix(in oklab, var(--cream) 82%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--line)" : "transparent"}`,
      }}
    >
      <div className="shell flex h-[68px] items-center justify-between">
        <Link href="/" className="transition-opacity hover:opacity-70" aria-label="Arven, inicio">
          <ArvenLogo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-underline text-[0.82rem] font-medium tracking-[0.02em]"
              style={{ color: "var(--fg-muted)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <ScheduleButton tone="dark" size="md" />
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
          }}
          className="flex h-10 w-10 items-center justify-center lg:hidden"
        >
          <span className="relative block h-3 w-5">
            <span
              className="absolute left-0 block h-[1.5px] w-5 transition-transform duration-300"
              style={{
                top: open ? 5 : 0,
                backgroundColor: "var(--fg)",
                transform: open ? "rotate(45deg)" : "none",
              }}
            />
            <span
              className="absolute bottom-0 left-0 block h-[1.5px] w-5 transition-transform duration-300"
              style={{
                bottom: open ? "auto" : 0,
                top: open ? 5 : "auto",
                backgroundColor: "var(--fg)",
                transform: open ? "rotate(-45deg)" : "none",
              }}
            />
          </span>
        </button>
      </div>

      {/* Menu mobile */}
      <div
        className="overflow-hidden transition-[max-height] duration-500 lg:hidden"
        style={{
          maxHeight: open ? 360 : 0,
          backgroundColor: "color-mix(in oklab, var(--cream) 94%, transparent)",
          backdropFilter: "blur(14px)",
        }}
      >
        <nav className="shell flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                setOpen(false);
              }}
              className="py-3 text-lg"
              style={{ color: "var(--fg)", borderBottom: "1px solid var(--line)" }}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openGate("schedule");
            }}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
            style={{ backgroundColor: "var(--ink)", color: "var(--cream)" }}
          >
            {brand.scheduleLabel} &rarr;
          </button>
        </nav>
      </div>
    </header>
  );
}
