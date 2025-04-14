import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { clx } from "@medusajs/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
  className?: string
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
  className,
}: LineItemOptionsProps) => {
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className={clx(
        "inline-block txt-medium text-white w-full overflow-hidden text-ellipsis",
        className
      )}
    >
      Variant: {variant?.title}
    </Text>
  )
}

export default LineItemOptions
