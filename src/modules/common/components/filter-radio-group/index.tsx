import { EllipseMiniSolid } from "@medusajs/icons"
import { Label, RadioGroup, Text, clx } from "@medusajs/ui"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex gap-x-3 flex-col gap-y-4">
      <Text className="text-base font-medium text-white/80">{title}</Text>
      <RadioGroup data-testid={dataTestId} onValueChange={handleChange}>
        <div className="space-y-3">
          {items?.map((i) => (
            <div
              key={i.value}
              className={clx(
                "flex items-center p-2 rounded-lg transition-all duration-200",
                {
                  "bg-blue-500/20 border border-blue-500/30": i.value === value,
                  "hover:bg-white/5": i.value !== value,
                }
              )}
            >
              <div className="flex items-center gap-x-3">
                <div
                  className={clx(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    {
                      "border-blue-400": i.value === value,
                      "border-white/40": i.value !== value,
                    }
                  )}
                >
                  {i.value === value && (
                    <div className="w-2 h-2 rounded-full bg-light-green" />
                  )}
                </div>
                <RadioGroup.Item
                  checked={i.value === value}
                  className="hidden peer"
                  id={i.value}
                  value={i.value}
                />
                <Label
                  htmlFor={i.value}
                  className={clx("text-sm font-medium hover:cursor-pointer", {
                    "text-white": i.value === value,
                    "text-white/70": i.value !== value,
                  })}
                  data-testid="radio-label"
                  data-active={i.value === value}
                >
                  {i.label}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
