"use client"

import React, { useEffect, useState, useActionState } from "react"
import { PencilSquare as Edit, Trash } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui"

import useToggleState from "@lib/hooks/use-toggle-state"
import CountrySelect from "@modules/checkout/components/country-select"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import Spinner from "@modules/common/icons/spinner"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { HttpTypes } from "@medusajs/types"
import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-dark-green/50 bg-black/40": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-dark-green/10 p-1.5 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-light-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <Heading
              className="text-left text-lg font-semibold text-white"
              data-testid="address-name"
            >
              {address.first_name} {address.last_name}
            </Heading>
          </div>
          {address.company && (
            <Text
              className="text-sm text-white/70 mb-1"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <div className="bg-black/20 border border-white/5 rounded-lg p-3 mt-1">
            <Text className="flex flex-col text-left text-white/80 text-sm">
              <span data-testid="address-address" className="mb-1">
                {address.address_1}
                {address.address_2 && <span>, {address.address_2}</span>}
              </span>
              <span data-testid="address-postal-city" className="mb-1">
                {address.postal_code}, {address.city}
              </span>
              <span data-testid="address-province-country">
                {address.province && `${address.province}, `}
                {address.country_code?.toUpperCase()}
              </span>
            </Text>
          </div>
        </div>
        <div className="flex items-center justify-end gap-x-3 mt-4">
          <button
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg transition-colors duration-200 text-sm flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="flex flex-col gap-y-3 w-full">
              <div className="grid grid-cols-2 gap-x-3">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.first_name || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.last_name || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address_1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address_2 || undefined}
                data-testid="address-2-input"
              />
              <div className="grid grid-cols-2 gap-x-3">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postal_code || undefined}
                  data-testid="postal-code-input"
                />
                <Input
                  label="City"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city || undefined}
                  data-testid="city-input"
                />
              </div>
              <Input
                label="Province / State"
                name="province"
                autoComplete="address-level1"
                defaultValue={address.province || undefined}
                data-testid="state-input"
              />
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country_code || undefined}
                data-testid="country-select"
              />
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-small-regular py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-lg transition-colors duration-200 py-2.5 px-4"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton
                data-testid="save-button"
                className="bg-dark-green hover:bg-dark-green text-white rounded-lg transition-colors duration-200 py-2.5 px-6"
              >
                Save Changes
              </SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
