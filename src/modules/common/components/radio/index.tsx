const Radio = ({
  checked,
  "data-testid": dataTestId,
}: {
  checked: boolean
  "data-testid"?: string
}) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked="true"
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-5 w-5 items-center justify-center outline-none"
        data-testid={dataTestId || "radio-button"}
      >
        <div className="border border-dark-green group-hover:border-light-green bg-black group-data-[state=checked]:bg-black group-data-[state=checked]:border-dark-green group-focus:!border-light-green group-disabled:!bg-ui-bg-disabled group-disabled:!border-gray-500 flex h-[16px] w-[16px] items-center justify-center rounded-full transition-all">
          {checked && (
            <span
              data-state={checked ? "checked" : "unchecked"}
              className="group flex items-center justify-center"
            >
              <div className="bg-dark-green group-disabled:bg-light-green rounded-full group-disabled:shadow-none h-2 w-2"></div>
            </span>
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
