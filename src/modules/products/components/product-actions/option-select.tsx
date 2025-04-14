import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-4">
      <span className="text-white font-medium">Select {title}</span>
      <div
        className="flex flex-wrap justify-between gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current;
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "h-10 rounded-lg p-2 flex-1 transition-all duration-200 text-sm font-medium",
                {
                  "bg-blue-500/30 border border-blue-400/50 text-white": isSelected,
                  "bg-black/30 border border-white/10 text-white/80 hover:bg-black/40 hover:border-white/20": !isSelected,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
