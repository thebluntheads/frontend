import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-5 flex items-center">
        <Heading className="text-[2.5rem] leading-[3rem] font-bold text-white">
          Cart
        </Heading>
      </div>
      <div className="[&_th]:!bg-transparent [&_tr]:!bg-transparent [&_thead]:!bg-transparent [&_table]:!bg-transparent">
        <Table>
          <Table.Header className="border-t-0 border-b border-white/20 !bg-transparent">
            <Table.Row className="text-white/80 txt-medium-plus !bg-transparent">
              <Table.HeaderCell className="!pl-0 !bg-transparent text-white">Item</Table.HeaderCell>
              <Table.HeaderCell className="!bg-transparent"></Table.HeaderCell>
              <Table.HeaderCell className="!bg-transparent text-white">Quantity</Table.HeaderCell>
              <Table.HeaderCell className="hidden small:table-cell !bg-transparent text-white">
                Price
              </Table.HeaderCell>
              <Table.HeaderCell className="!pr-0 text-right !bg-transparent text-white">
                Total
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items
              ? items
                  .sort((a, b) => {
                    return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                  })
                  .map((item) => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        currencyCode={cart?.currency_code}
                      />
                    )
                  })
              : repeat(5).map((i) => {
                  return <SkeletonLineItem key={i} />
                })}
          </Table.Body>
        </Table>
      </div>
    </div>
  )
}

export default ItemsTemplate
