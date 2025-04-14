import { useState } from "react"

export type StepperState = {
  address: boolean
  information: boolean
  delivery: boolean
  payment: boolean
}

type StepperHook = [StepperState, (step: keyof StepperState) => void] & {
  stepper: StepperState
  setStepper: (step: keyof StepperState) => void
}

const useToggleStepper = (): StepperHook => {
  const [state, setState] = useState<StepperState>({
    address: false,
    information: false,
    delivery: false,
    payment: false,
  })

  const setStep = (step: keyof StepperState) => {
    setState({
      address: state["address"],
      information:  state["information"],
      delivery:  state["delivery"],
      payment:  state["payment"],
      [step]: !state[step],
    })
  }

  const hookData = [state, setStep] as StepperHook
  hookData.stepper = state
  hookData.setStepper = setStep

  return hookData
}

export default useToggleStepper
