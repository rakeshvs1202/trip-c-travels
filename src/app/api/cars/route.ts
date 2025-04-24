import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Car from "@/models/Car"

export async function GET(request: NextRequest) {
  // Extract the car id from the request URL (e.g. /api/cars/<id>)
  const idParam = request.nextUrl.pathname.split("/").pop() ?? ""
  const id = Number.parseInt(idParam, 10)
  try {
    await dbConnect()

    const car = await Car.findOne({ id })

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json(car, { status: 200 })
  } catch (error) {
    console.error("Error fetching car:", error)
    return NextResponse.json({ message: "Failed to fetch car" }, { status: 500 })
  }
}
