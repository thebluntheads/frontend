import { Text } from "@medusajs/ui"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center text-white/60">
      © {new Date().getFullYear()} TheBluntHeads All rights reserved.
    </Text>
  )
}

export default MedusaCTA
