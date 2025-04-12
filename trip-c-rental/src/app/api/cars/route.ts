import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Car from "@/models/Car"

export async function GET() {
  try {
    await dbConnect()

    const cars = await Car.find({})

    return NextResponse.json(cars, { status: 200 })
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json({ message: "Failed to fetch cars" }, { status: 500 })
  }
}
