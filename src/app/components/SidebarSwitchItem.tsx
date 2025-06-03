import React from "react";
import ToggleSwitch from "./ToggleSwitch";

export default function SidebarItem({
  icon,
  label,
  state,
  onChange
}: {
  icon: any,
  label: string,
  state: boolean,
  onChange: () => void
}
) {
  return (
    <div className="flex justify-between space-x-4 hover:bg-gray-600 duration-300 rounded-xl p-2 pr-0 cursor-default">
      <div className="flex">
        <div className="flex text-xl">
          {icon}
        </div>
        <span className="ml-2">{label}</span>
      </div>
      <ToggleSwitch onChange={onChange} state={state} />
    </div>
  );
}
