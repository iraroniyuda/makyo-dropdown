import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useMemo, useState } from "react";
import { SelectDropdown } from "./SelectDropdown";
import type { DropdownOption } from "./types";

type Item = { id: number; name: string };

const meta: Meta<typeof SelectDropdown<Item>> = {
  title: "Primitives/SelectDropdown",
  component: SelectDropdown<Item>,
  argTypes: {
    searchable: { control: "boolean", name: "withSearch" },
    multiple: { control: "boolean" },
    portal: { control: "boolean" },
    zIndex: { control: "number" },
    maxMenuHeight: { control: "number" },
    placeholder: { control: "text" },
    searchPlaceholder: { control: "text" },
    disabled: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof SelectDropdown<Item>>;

function useDemoOptions() {
  return useMemo<DropdownOption<Item>[]>(
    () => [
      { value: { id: 1, name: "Option 1" }, label: "Option 1" },
      {
        value: { id: 2, name: "Option with icon" },
        label: "Option with icon",
        icon: <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />,
      },
      { value: { id: 3, name: "Long Long Option 3" }, label: "Long Long Option 3" },
      { value: { id: 4, name: "Long Long Long Option 4" }, label: "Long Long Long Option 4" },
      { value: { id: 5, name: "Long Long Long Long Option 5" }, label: "Long Long Long Long Option 5" },
      { value: { id: 6, name: "Long Long Long Long Long Option 6" }, label: "Long Long Long Long Long Option 6" },
    ],
    []
  );
}

function ControlledHarness(args: any) {
  const options = useDemoOptions();

  const [singleValue, setSingleValue] = useState<Item | null>(options[0]!.value);
  const [multiValue, setMultiValue] = useState<Item[] | null>([options[0]!.value]);


  useEffect(() => {
    if (args.multiple) {
      const base = singleValue ? [singleValue] : [];
      setMultiValue(base.length ? base : [options[0]!.value]);
    } else {
      const first = (multiValue && multiValue[0]) ?? options[0]!.value;
      setSingleValue(first);
    }
  }, [args.multiple]);

  const value = args.multiple ? multiValue : singleValue;

  return (
    <div className="p-8">
      <div className="grid max-w-6xl grid-cols-[120px_1fr] items-start gap-4">
        <label className="pt-2 text-sm text-slate-700">Label</label>

        <div>
          <SelectDropdown
            {...args}
            options={options}
            value={value}
            onChange={(v) => {
              if (args.multiple) setMultiValue(v as Item[] | null);
              else setSingleValue(v as Item | null);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const Demo: Story = {
  args: {
    multiple: true,
    searchable: true,
    portal: true,
    zIndex: 5000,
    maxMenuHeight: 260,
    placeholder: "Select...",
    searchPlaceholder: "Search",
    disabled: false,
    closeOnSelect: false,
  },
  render: (args) => <ControlledHarness {...args} />,
};
