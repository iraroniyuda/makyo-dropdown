import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react-dom";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";
import type { DropdownOption, SelectDropdownProps } from "./types";

function defaultFilter<T>(opt: DropdownOption<T>, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return opt.label.toLowerCase().includes(q);
}

function isEqualValue<T>(a: T, b: T) {
  return Object.is(a, b);
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path
        d="M2 2l6 6M8 2L2 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SelectDropdown<T>(props: SelectDropdownProps<T>) {
  const {
    options,
    value,
    onChange,
    multiple = false,

    placeholder = "Select...",
    searchable = true,
    searchPlaceholder = "Search",
    filterFn = defaultFilter,

    portal = true,
    portalContainer = null,

    renderOption,
    renderValue,

    closeOnSelect = !multiple,
    disabled = false,

    zIndex = 2147483647,

    className,
    menuClassName,

    maxMenuHeight = 260,
  } = props;

  const reactId = useId();
  const buttonId = `select-trigger-${reactId}`;
  const listboxId = `select-listbox-${reactId}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selectedArray: T[] = useMemo(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return value == null ? [] : [value as T];
  }, [multiple, value]);

  const filteredOptions = useMemo(() => {
    return options.filter((o) => (searchable ? filterFn(o, query) : true));
  }, [options, searchable, filterFn, query]);


  const { x, y, strategy, refs, update } = useFloating({
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxHeight: `${Math.min(maxMenuHeight, availableHeight)}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    refs.setReference(triggerRef.current);
  }, [refs]);

  useEffect(() => {
    if (!open) return;

    function onDocPointerDown(e: MouseEvent | TouchEvent) {
      const t = e.target as Node | null;
      if (!t) return;
      const refEl = triggerRef.current;
      const floatingEl = refs.floating.current;
      if (refEl && refEl.contains(t)) return;
      if (floatingEl && floatingEl.contains(t)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", onDocPointerDown);
    document.addEventListener("touchstart", onDocPointerDown, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onDocPointerDown);
      document.removeEventListener("touchstart", onDocPointerDown as any);
    };
  }, [open, refs.floating]);
  useEffect(() => {
    if (!open) return;

    const firstEnabled = filteredOptions.findIndex((o) => !o.disabled);
    setActiveIndex(firstEnabled);

    const raf = requestAnimationFrame(() => {
      if (searchable && searchRef.current) {
        searchRef.current.focus();
        searchRef.current.select();
      } else {
        listRef.current?.focus();
      }
      update();
    });

    return () => cancelAnimationFrame(raf);
  }, [open, searchable, filteredOptions, update]);

  useEffect(() => {
    if (open) return;
    setQuery("");
    setActiveIndex(-1);
  }, [open]);

  function isSelected(opt: DropdownOption<T>) {
    return selectedArray.some((v) => isEqualValue(v, opt.value));
  }

  function removeValue(v: T) {
    if (!multiple) {
      onChange(null);
      return;
    }
    const next = selectedArray.filter((x) => !isEqualValue(x, v));
    onChange(next);
  }

  function commitSelect(opt: DropdownOption<T>) {
    if (opt.disabled) return;

    if (!multiple) {
      onChange(opt.value);
      if (closeOnSelect) setOpen(false);
      return;
    }

    const exists = selectedArray.some((v) => isEqualValue(v, opt.value));
    const next = exists
      ? selectedArray.filter((v) => !isEqualValue(v, opt.value))
      : [...selectedArray, opt.value];

    onChange(next);
    if (closeOnSelect) setOpen(false);
  }

  function scrollIntoView(idx: number) {
    const floatingEl = refs.floating.current;
    if (!floatingEl) return;

    const item = floatingEl.querySelector<HTMLElement>(`[data-option-index="${idx}"]`);
    if (!item) return;

    const container = floatingEl.querySelector<HTMLElement>("[data-menu-scroll]");
    if (!container) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;

    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;

    if (itemTop < viewTop) container.scrollTop = itemTop;
    else if (itemBottom > viewBottom) container.scrollTop = itemBottom - container.clientHeight;
  }

  function moveActive(delta: number) {
    if (!filteredOptions.length) return;
    let idx = activeIndex;
    for (let i = 0; i < filteredOptions.length; i++) {
      idx = (idx + delta + filteredOptions.length) % filteredOptions.length;
      if (!filteredOptions[idx]?.disabled) {
        setActiveIndex(idx);
        scrollIntoView(idx);
        return;
      }
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredOptions[activeIndex];
      if (opt) commitSelect(opt);
      return;
    }

    if (multiple && searchable && e.key === "Backspace" && query.length === 0) {
      const last = selectedArray[selectedArray.length - 1];
      if (last !== undefined) removeValue(last);
    }
  }

  const valueNode = useMemo(() => {
    if (renderValue) return renderValue(value, { remove: removeValue });

    if (selectedArray.length === 0) {
      return <span className="text-slate-400">{placeholder}</span>;
    }

    if (!multiple) {
      const selectedOpt = options.find((o) => isSelected(o));
      return (
        <span className="text-slate-800">
          {selectedOpt?.label ?? String(selectedArray[0])}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {selectedArray.map((v, idx) => {
          const opt = options.find((o) => isEqualValue(o.value, v));
          const label = opt?.label ?? String(v);
          return (
            <span
              key={`${idx}-${label}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
            >
              {label}
              <button
                type="button"
                className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeValue(v);
                }}
                aria-label={`Remove ${label}`}
              >
                <XIcon />
              </button>
            </span>
          );
        })}
      </div>
    );
  }, [renderValue, value, multiple, selectedArray, options, placeholder]);

  const menu = (
    <div
      ref={(el) => {
        refs.setFloating(el);
      }}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex,
      }}
      className={cn(
        "rounded border border-slate-200 bg-white shadow-md",
        "focus:outline-none",
        menuClassName
      )}
      onKeyDown={onMenuKeyDown}
      aria-labelledby={buttonId}
      role="presentation"
    >
      {searchable && (
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
          <span className="select-none text-slate-400">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              const firstEnabled = options
                .filter((o) => filterFn(o, next))
                .findIndex((o) => !o.disabled);
              setActiveIndex(firstEnabled);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search options"
          />
        </div>
      )}

      <div
        data-menu-scroll
        className="overflow-auto py-1"
        style={{ maxHeight: maxMenuHeight }}
        ref={listRef}
        tabIndex={-1}
        role="listbox"
        id={listboxId}
        aria-multiselectable={multiple || undefined}
      >
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-2.5 text-sm text-slate-500">No results</div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const selected = isSelected(opt);
            const active = idx === activeIndex;

            const row = renderOption ? (
              renderOption(opt, { selected, active })
            ) : (
              <div className="flex items-center gap-2">
                {opt.icon ? <span className="inline-flex">{opt.icon}</span> : null}
                <span className={selected ? "font-medium" : ""}>{opt.label}</span>
              </div>
            );

            return (
              <button
                key={`${idx}-${opt.label}`}
                type="button"
                data-option-index={idx}
                role="option"
                aria-selected={selected}
                disabled={opt.disabled}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={(e) => {
                  e.preventDefault();
                  commitSelect(opt);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm text-slate-700",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active ? "bg-emerald-50/70" : "bg-white",
                  "hover:bg-emerald-50/70"
                )}
              >
                {row}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <button
        id={buttonId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex min-h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left",
          "focus:outline-none focus:ring-2 focus:ring-emerald-100",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
        )}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="min-w-0 flex-1">{valueNode}</div>
      </button>

      {open && (portal ? createPortal(menu, portalContainer ?? document.body) : menu)}
    </div>
  );
}
