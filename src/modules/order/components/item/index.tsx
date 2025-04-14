import { HttpTypes } from "@medusajs/types"
import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors" data-testid="product-row">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-700 border border-gray-700 flex-shrink-0">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
        
        <div className="flex flex-col">
          <span 
            className="text-white font-medium text-base"
            data-testid="product-name"
          >
            {item.title}
          </span>
          <div className="text-gray-400 text-sm mt-1">
            <LineItemOptions variant={item.variant} data-testid="product-variant" />
          </div>
          <div className="flex items-center mt-2 text-gray-400 text-sm">
            <span data-testid="product-quantity">{item.quantity}</span>
            <span className="mx-1">×</span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
              className="text-gray-400"
            />
          </div>
        </div>
      </div>

      <div className="text-right">
        <LineItemPrice
          item={item}
          style="tight"
          currencyCode={currencyCode}
          className="text-white font-medium"
        />
      </div>
    </div>
  )
}

export default Item
