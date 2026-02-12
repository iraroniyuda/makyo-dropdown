import type React from "react";

export type DropdownOption<T> = {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type SelectDropdownProps<T> = {
  options: DropdownOption<T>[];

  value: T | T[] | null;
  onChange: (next: T | T[] | null) => void;

  multiple?: boolean;

  placeholder?: string;

  searchable?: boolean;
  searchPlaceholder?: string;
  filterFn?: (opt: DropdownOption<T>, query: string) => boolean;

  portal?: boolean;
  portalContainer?: Element | null;

  renderOption?: (
    opt: DropdownOption<T>,
    state: { selected: boolean; active: boolean }
  ) => React.ReactNode;

  renderValue?: (
    value: T | T[] | null,
    helpers: { remove: (v: T) => void }
  ) => React.ReactNode;

  closeOnSelect?: boolean;
  disabled?: boolean;

  zIndex?: number;

  className?: string;
  menuClassName?: string;

  maxMenuHeight?: number;
};
