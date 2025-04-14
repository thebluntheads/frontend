import {
  isAuthorizeNet as isAuthorizeNetFunc,
  paymentInfoMap,
} from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <div className="text-white">
      <div className="space-y-6">
        {payment && (
          <>
            {/* Payment Method Section */}
            <div>
              <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-white font-medium text-lg">
                  Payment Method
                </span>
              </div>
              <div className="ml-7 space-y-1">
                <p className="text-white" data-testid="payment-method">
                  {payment
                    ? paymentInfoMap[payment.provider_id]?.title ||
                      "Credit Card"
                    : "Credit Card"}
                </p>
              </div>
            </div>

            {/* Payment Details Section */}
            <div>
              <div className="flex items-center mb-3 border-b border-gray-700 pb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="text-white font-medium text-lg">
                  Payment Details
                </span>
              </div>
              <div className="ml-7">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded bg-gray-700 text-white">
                    {payment && paymentInfoMap[payment.provider_id]?.icon}
                  </div>
                  <div
                    className="text-white font-mono"
                    data-testid="payment-amount"
                  >
                    {payment &&
                    isAuthorizeNetFunc(payment.provider_id) &&
                    payment.data?.card_last4
                      ? `**** **** **** ${payment.data.card_last4}`
                      : payment
                      ? `${convertToLocale({
                          amount: payment.amount,
                          currency_code: order.currency_code,
                        })}`
                      : "Payment processed"}
                  </div>
                </div>
                {payment && payment.created_at && (
                  <p className="text-gray-300 text-sm ml-11">
                    Paid on{" "}
                    {new Date(payment.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentDetails
