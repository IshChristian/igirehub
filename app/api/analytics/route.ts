import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    const client = await clientPromise
    const db = client.db()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    if (timeRange === '7d') {
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === '30d') {
      startDate.setDate(now.getDate() - 30)
    } else { // 90d
      startDate.setDate(now.getDate() - 90)
    }

    // Get category distribution
    const categoryDistribution = await db.collection("complaints")
      .aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { category: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ])
      .toArray()

    // Get status distribution
    const statusDistribution = await db.collection("complaints")
      .aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } }
      ])
      .toArray()

    // Get resolution times (grouped by day)
    const resolutionTimes = await db.collection("complaints")
      .aggregate([
        { 
          $match: { 
            status: "resolved",
            createdAt: { $gte: startDate },
            resolvedAt: { $exists: true }
          } 
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$resolvedAt" } },
            daysToResolve: {
              $divide: [
                { $subtract: ["$resolvedAt", "$createdAt"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: "$date",
            avgDays: { $avg: "$daysToResolve" }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", avgDays: 1, _id: 0 } }
      ])
      .toArray()

    // Get unresolved complaints
    const unresolvedComplaints = await db.collection("complaints")
      .find({ 
        status: { $ne: "resolved" },
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Mock AI predictions (replace with your actual prediction logic)
    const predictions = [
      {
        issue: "Water supply interruption in Nyarugenge",
        probability: 85,
        timeframe: "Next 2 weeks",
      },
      {
        issue: "Road deterioration after rains in Kicukiro",
        probability: 78,
        timeframe: "Next rainy season",
      },
      {
        issue: "Garbage collection delays in Gasabo",
        probability: 65,
        timeframe: "Next month",
      },
    ]

    return NextResponse.json({
      categoryDistribution,
      statusDistribution,
      resolutionTimes,
      unresolvedComplaints,
      predictions
    })

  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    )
  }
}