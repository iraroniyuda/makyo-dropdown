# Makyo SelectDropdown (Technical Test)

A controlled, headless-first dropdown primitive built with React + TypeScript and styled with Tailwind CSS only.

This component supports:
- Search (toggleable)
- Portal rendering (toggleable)
- Single & multiple selection (toggleable)
- Custom option rendering
- Filtering long option lists
- High z-index compatibility for overlay-heavy UIs

> UI libraries (Shadcn/UI, Radix, Headless UI, MUI, AntD, etc.) are not used.  
> Small utility libraries are used only where necessary (e.g., floating positioning).

---

## Installation

### As a dependency (Create React App / any React app)

```bash
npm install git+https://github.com/iraroniyuda/makyo-dropdown.git
# or
yarn add git+https://github.com/iraroniyuda/makyo-dropdown.git

```


---

## Basic Usage (Single Select)

```tsx
import React, { useMemo, useState } from "react";
import { SelectDropdown, type DropdownOption } from "makyo-dropdown";

type Item = { id: number; name: string };

export default function ExampleSingle() {
  const options = useMemo<DropdownOption<Item>[]>(
    () => [
      { value: { id: 1, name: "Option 1" }, label: "Option 1" },
      { value: { id: 2, name: "Option 2" }, label: "Option 2" },
    ],
    []
  );

  const [value, setValue] = useState<Item | null>(null);

  return (
    <SelectDropdown
      options={options}
      value={value}
      onChange={(next) => setValue(next as Item | null)}
      multiple={false}
      searchable={true}
      portal={true}
      placeholder="Select..."
    />
  );
}
```

---

## Multi Select (Chips)

```tsx
import React, { useMemo, useState } from "react";
import { SelectDropdown, type DropdownOption } from "makyo-dropdown";

type Item = { id: number; name: string };

export default function ExampleMulti() {
  const options = useMemo<DropdownOption<Item>[]>(
    () => Array.from({ length: 1000 }).map((_, i) => ({
      value: { id: i + 1, name: `Option ${i + 1}` },
      label: `Option ${i + 1}`,
    })),
    []
  );

  const [value, setValue] = useState<Item[] | null>([options[0]!.value]);

  return (
    <SelectDropdown
      options={options}
      value={value}
      onChange={(next) => setValue((next as Item[]) ?? [])}
      multiple={true}
      searchable={true}
      portal={true}
      closeOnSelect={false}
    />
  );
}
```

---

## Feature Toggles

### Toggle Search
```tsx
<SelectDropdown
  options={options}
  value={value}
  onChange={onChange}
  searchable={false}
/>
```

### Toggle Portal
```tsx
<SelectDropdown
  options={options}
  value={value}
  onChange={onChange}
  portal={false}
/>
```

### Z-Index Compatibility
```tsx
<SelectDropdown
  options={options}
  value={value}
  onChange={onChange}
  portal={true}
  zIndex={5000}
/>
```

---

## Custom Option Rendering

```tsx
<SelectDropdown
  options={options}
  value={value}
  onChange={onChange}
  renderOption={(opt, state) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {opt.icon}
        <span className={state.selected ? "font-medium" : ""}>{opt.label}</span>
      </div>
      {state.active ? <span className="text-xs text-slate-400">active</span> : null}
    </div>
  )}
/>
```

---

## API

### `DropdownOption<T>`
- `value: T` – the stored value (generic)
- `label: string` – display text
- `disabled?: boolean`
- `icon?: React.ReactNode` – optional, used by custom renderers

### `SelectDropdown<T>` props (high level)
Required:
- `options`
- `value` (controlled)
- `onChange`

Common:
- `multiple?: boolean`
- `searchable?: boolean`
- `portal?: boolean`
- `placeholder?: string`
- `searchPlaceholder?: string`
- `closeOnSelect?: boolean`
- `disabled?: boolean`
- `zIndex?: number`
- `maxMenuHeight?: number`

Customization:
- `filterFn?: (opt, query) => boolean`
- `renderOption?: (opt, state) => ReactNode`
- `renderValue?: (value, helpers) => ReactNode`

---

## Development

Run local dev:
```bash
npm run dev
```

Run Storybook:
```bash
npm run storybook
```

---

## Links (Submission)

- GitHub (public): <TBD>
- Deployment: <TBD>
- Storybook (public): <TBD>
