import { Text } from "@medusajs/ui"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <Text className="flex gap-x-2 txt-compact-small-plus items-center text-white/60">
      © {new Date().getFullYear()} All rights reserved
      <span className="mx-2">|</span>
      Built with
      <a href="https://nextjs.org" target="_blank" rel="noreferrer" className="ml-1 hover:opacity-80 transition-opacity">
        <NextJs fill="#9ca3af" />
      </a>
    </Text>
  )
}

export default MedusaCTA
