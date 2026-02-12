import { useMemo, useState } from "react";
import { SelectDropdown } from "./lib/select/SelectDropdown";
import type { DropdownOption } from "./lib/select/types";

type Item = { id: number; name: string };

export default function App() {
  const options = useMemo<DropdownOption<Item>[]>(() => {
    return Array.from({ length: 200 }).map((_, i) => ({
      value: { id: i + 1, name: `Option ${i + 1}` },
      label: `Option ${i + 1}`,
    }));
  }, []);

  const [withSearch, setWithSearch] = useState(true);
  const [multiple, setMultiple] = useState(true);

  const [singleValue, setSingleValue] = useState<Item | null>(options[0]!.value);
  const [multiValue, setMultiValue] = useState<Item[] | null>([options[0]!.value]);

  const value = multiple ? multiValue : singleValue;

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-xl font-semibold text-slate-900">Makyo Dropdown Demo</h1>

        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
          <label className="pt-2 text-sm text-slate-700">Label</label>
          <div className="space-y-4">
            <SelectDropdown
              options={options}
              value={value}
              onChange={(v) => {
                if (multiple) setMultiValue(v as Item[] | null);
                else setSingleValue(v as Item | null);
              }}
              multiple={multiple}
              searchable={withSearch}
              portal
              zIndex={5000}
              closeOnSelect={!multiple}
            />

            <div className="flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={withSearch}
                  onChange={(e) => setWithSearch(e.target.checked)}
                />
                withSearch
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={multiple}
                  onChange={(e) => setMultiple(e.target.checked)}
                />
                multiple
              </label>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Note: UI framework libraries are not used. Tailwind CSS only.
        </p>
      </div>
    </div>
  );
}
