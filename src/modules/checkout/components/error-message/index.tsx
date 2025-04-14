import { clx } from "@medusajs/ui"

const ErrorMessage = ({ 
  error, 
  'data-testid': dataTestid,
  className
}: { 
  error?: string | null, 
  'data-testid'?: string,
  className?: string 
}) => {
  if (!error) {
    return null
  }

  return (
    <div className={clx("pt-2 text-rose-500 text-small-regular", className)} data-testid={dataTestid}>
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
