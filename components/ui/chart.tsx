"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("h-full w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
})
Chart.displayName = "Chart"

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("h-80", className)} {...props} />
})
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {}

const ChartTooltip = React.forwardRef<SVGElement, ChartTooltipProps>(({ ...props }, ref) => {
  return <Tooltip {...props} />
})
ChartTooltip.displayName = "ChartTooltip"

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  payload?: Array<{
    name: string
    value: string | number
    color?: string
  }>
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, label, payload, ...props }, ref) => {
    if (payload === undefined || payload === null) {
      return null
    }

    return (
      <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
        <div className="grid gap-0.5">
          {label && <p className="text-xs font-medium">{label}</p>}
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              {item.color && <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />}
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

interface ChartBarProps {
  data: any[]
  dataKey: string
  categoryKey: string
  showTooltip?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showLegend?: boolean
  showAnimation?: boolean
  colors?: string[]
}

const ChartBar = ({
  data,
  dataKey,
  categoryKey,
  showTooltip = false,
  showXAxis = false,
  showYAxis = false,
  showLegend = false,
  showAnimation = false,
  colors = ["#2563eb"],
}: ChartBarProps) => {
  if (data === undefined || data === null || data.length === 0) {
    return null
  }

  return (
    <BarChart data={data}>
      {showXAxis && <XAxis dataKey={categoryKey} />}
      {showYAxis && <YAxis />}
      {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
      {showLegend && <Legend />}
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <Bar dataKey={dataKey} isAnimationActive={showAnimation} radius={[4, 4, 0, 0]}>
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </BarChart>
  )
}

interface ChartLineProps {
  data: any[]
  dataKey: string
  categoryKey: string
  showTooltip?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showLegend?: boolean
  showAnimation?: boolean
  color?: string
}

const ChartLine = ({
  data,
  dataKey,
  categoryKey,
  showTooltip = false,
  showXAxis = false,
  showYAxis = false,
  showLegend = false,
  showAnimation = false,
  color = "#2563eb",
}: ChartLineProps) => {
  if (data === undefined || data === null || data.length === 0) {
    return null
  }

  return (
    <LineChart data={data}>
      {showXAxis && <XAxis dataKey={categoryKey} />}
      {showYAxis && <YAxis />}
      {showTooltip && <Tooltip content={<ChartTooltipContent />} />}
      {showLegend && <Legend />}
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        isAnimationActive={showAnimation}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  )
}

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent, ChartBar, ChartLine }

