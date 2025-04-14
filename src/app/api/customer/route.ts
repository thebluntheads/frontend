import { retrieveCustomer } from "@lib/data/customer"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const customer = await retrieveCustomer()
    
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }
    
    return NextResponse.json({ customer })
  } catch (error) {
    console.error("Error fetching customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer data" }, { status: 500 })
  }
}
