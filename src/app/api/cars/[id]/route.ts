import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Car from "@/models/Car"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const car = await Car.findOne({ id: Number.parseInt(params.id) })

    if (!car) {
      return NextResponse.json({ message: "Car not found" }, { status: 404 })
    }

    return NextResponse.json(car, { status: 200 })
  } catch (error) {
    console.error("Error fetching car:", error)
    return NextResponse.json({ message: "Failed to fetch car" }, { status: 500 })
  }
}
