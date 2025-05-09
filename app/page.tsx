"use client"

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import events from "./events.json"

// Event type definition
type Event = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  color: string
  allDay?: boolean
}

// Day type definition
type Day = {
  date: number
  fullDate: Date
  events: Event[]
  isCurrentDay?: boolean
  isCurrentMonth?: boolean
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const weekNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const shortWeekNames = ["S", "M", "T", "W", "T", "F", "S"]

// Generate hours for select
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 || 12
  const ampm = i < 12 ? "AM" : "PM"
  return {
    value: i.toString(),
    label: `${hour}:00 ${ampm}`,
  }
})

// Generate minutes for select
const minutes = Array.from({ length: 4 }, (_, i) => {
  return {
    value: (i * 15).toString(),
    label: (i * 15).toString().padStart(2, "0"),
  }
})

export default function CalendarPage() {
  // State for the selected day and dialog
  const [selectedDay, setSelectedDay] = useState<Day | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)

  // State for new event form
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date(),
    startHour: "9",
    startMinute: "0",
    endHour: "10",
    endMinute: "0",
    color: "blue",
  })

  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const generateCalendarData = (currentMonth: number, currentYear: number): Day[] => {
    const today = new Date()
    const currentDate = today.getMonth() === currentMonth ? today.getDate() : -1

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0) // 0 = last day of previous month

    const calendarData: Day[] = []

    // Clone firstDayOfMonth and move to the previous Sunday
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - startDate.getDay())

    // Clone lastDayOfMonth and move to the next Saturday
    const endDate = new Date(lastDayOfMonth)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const loopDate = new Date(startDate)

    while (loopDate <= endDate) {
      const formattedDate = `${loopDate.getFullYear()}-${(loopDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${loopDate.getDate().toString().padStart(2, "0")}`

      const dayEvents: Event[] = events.filter(
        (event) => new Date(event.date).toISOString().split("T")[0] === formattedDate,
      )

      const day: Day = {
        date: loopDate.getDate(),
        fullDate: new Date(loopDate),
        events: dayEvents,
        isCurrentMonth: loopDate.getMonth() === currentMonth,
        isCurrentDay:
          loopDate.getDate() === currentDate &&
          loopDate.getMonth() === currentMonth &&
          loopDate.getFullYear() === currentYear,
      }

      calendarData.push(day)
      loopDate.setDate(loopDate.getDate() + 1)
    }

    return calendarData
  }

  // Generate calendar data
  const [today, setToday] = useState(new Date())
  const [currentDate, setCurrentDate] = useState(today.getDate())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  // Initial calendar data
  const [calendarData, setCalendarData] = useState<Day[]>([])

  useEffect(() => {
    const data = generateCalendarData(currentMonth, currentYear)
    setCalendarData(data)
  }, [currentMonth, currentYear])

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  // Function to handle day click
  const handleDayClick = (day: Day) => {
    setSelectedDay(day)
    setIsDialogOpen(true)
  }

  // Function to handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setNewEvent((prev) => ({ ...prev, [field]: value }))
  }

  // Function to add a new event
  const handleAddEvent = () => {
    const { title, date, startHour, startMinute, endHour, endMinute, color } = newEvent

    // Format time
    const startTime = `${Number.parseInt(startHour) % 12 || 12}:${startMinute.padStart(2, "0")} ${Number.parseInt(startHour) < 12 ? "AM" : "PM"}`
    const endTime = `${Number.parseInt(endHour) % 12 || 12}:${endMinute.padStart(2, "0")} ${Number.parseInt(endHour) < 12 ? "AM" : "PM"}`

    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`

    // Create new event
    const event: Event = {
      id: Date.now().toString(),
      title: title,
      date: formattedDate,
      startTime,
      endTime,
      color,
    }

    // Add event to calendar
    const updatedCalendar = calendarData.map((day) => {
      if (day.fullDate.toDateString() === date.toDateString()) {
        return {
          ...day,
          events: [...day.events, event],
        }
      }
      return day
    })

    setCalendarData(updatedCalendar)
    setIsAddEventOpen(false)

    // Reset form
    setNewEvent({
      title: "",
      date: new Date(),
      startHour: "9",
      startMinute: "0",
      endHour: "10",
      endMinute: "0",
      color: "blue",
    })
  }

  // Color options
  const colorOptions = [
    { value: "blue", label: "Blue", bgClass: "bg-blue-500" },
    { value: "green", label: "Green", bgClass: "bg-green-500" },
    { value: "red", label: "Red", bgClass: "bg-red-500" },
    { value: "purple", label: "Purple", bgClass: "bg-purple-500" },
    { value: "orange", label: "Orange", bgClass: "bg-orange-500" },
    { value: "gray", label: "Gray", bgClass: "bg-gray-500" },
  ]

  // Get color class for bullet points
  const getBulletColorClass = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500"
      case "green":
        return "bg-green-500"
      case "red":
        return "bg-red-500"
      case "purple":
        return "bg-purple-500"
      case "orange":
        return "bg-orange-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-3 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-bold">
              {monthNames[currentMonth]} {currentYear}
            </h1>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="bg-black text-white hover:bg-black/90 rounded px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm"
              onClick={() => setIsAddEventOpen(true)}
            >
              Add event
            </Button>
          </div>
        </div>

        {/* Description - Hide on mobile */}
        <p className="hidden md:block text-gray-600 mb-8">
          Here all your planned events. You will find information for each event as well you can planned new one.
        </p>

        {/* Calendar */}
        <div className="mt-2 md:mt-4">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2">
            {isMobileView
              ? shortWeekNames.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center text-xs md:text-sm font-medium ${
                      index === today.getDay() ? "text-orange-500" : "text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                ))
              : weekNames.map((day, index) => (
                  <div
                    key={index}
                    className={`text-center text-xs md:text-sm font-medium ${
                      index === today.getDay() ? "text-orange-500" : "text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                ))}
          </div>

          {/* Week 1 */}
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 md:mb-4">
            {/* Day separators */}
            {weekNames.map((day, index) => (
              <div
                key={index}
                className={`border-t ${index === today.getDay() ? "border-orange-300" : "border-gray-200"}`}
              ></div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-4">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`min-h-[80px] md:min-h-[180px] p-1.5 md:p-3 border border-gray-100 rounded-md cursor-pointer transition-colors hover:border-gray-300 ${
                  day.isCurrentDay ? "bg-orange-50" : ""
                }`}
                onClick={() => handleDayClick(day)}
              >
                <div
                  className={`text-lg md:text-2xl font-medium mb-1 md:mb-4 ${
                    day.isCurrentDay ? "text-orange-500" : day.isCurrentMonth ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {day.date.toString().padStart(2, "0")}
                </div>

                <div className="space-y-1 md:space-y-2">
                  {day.events.slice(0, isMobileView ? 1 : 2).map((event, eventIndex) => (
                    <div key={eventIndex} className="flex items-start">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1 md:mt-1.5 mr-1 md:mr-2 ${getBulletColorClass(event.color)}`}
                      ></div>
                      <div className="overflow-hidden">
                        <div className="font-medium text-xs md:text-sm truncate">{event.title}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 truncate">
                          {event.allDay
                            ? "All day"
                            : event.endTime
                              ? `${event.startTime} - ${event.endTime}`
                              : event.startTime}
                        </div>
                      </div>
                    </div>
                  ))}

                  {day.events.length > (isMobileView ? 1 : 2) && (
                    <div className="text-[10px] md:text-xs text-orange-500 mt-1 md:mt-2 pl-2 md:pl-3.5">
                      +{day.events.length - (isMobileView ? 1 : 2)} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDay?.isCurrentDay ? (
                <span className="text-orange-500">
                  Today - {monthNames[selectedDay.fullDate.getMonth()]} {selectedDay?.date},{" "}
                  {selectedDay.fullDate.getFullYear()}
                </span>
              ) : (
                <span>
                  {monthNames[selectedDay?.fullDate.getMonth() || 0]} {selectedDay?.date},{" "}
                  {selectedDay?.fullDate.getFullYear()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
            {selectedDay?.events.map((event, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 ${getBulletColorClass(event.color)}`}></div>
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-500">
                    {event.allDay
                      ? "All day"
                      : event.endTime
                        ? `${event.startTime} - ${event.endTime}`
                        : event.startTime}
                  </div>
                </div>
              </div>
            ))}
            {selectedDay?.events.length === 0 && (
              <p className="text-gray-500 text-center py-4">No events scheduled for this day</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Event Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {/* Date Picker */}
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newEvent.date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newEvent.date ? format(newEvent.date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newEvent.date}
                    onSelect={(date) => handleInputChange("date", date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <div className="flex gap-2">
                  <Select value={newEvent.startHour} onValueChange={(value) => handleInputChange("startHour", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newEvent.startMinute}
                    onValueChange={(value) => handleInputChange("startMinute", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute.value} value={minute.value}>
                          {minute.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>End Time</Label>
                <div className="flex gap-2">
                  <Select value={newEvent.endHour} onValueChange={(value) => handleInputChange("endHour", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((hour) => (
                        <SelectItem key={hour.value} value={hour.value}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={newEvent.endMinute} onValueChange={(value) => handleInputChange("endMinute", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((minute) => (
                        <SelectItem key={minute.value} value={minute.value}>
                          {minute.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div className="grid gap-2">
              <Label>Event Color</Label>
              <RadioGroup
                className="flex gap-2 flex-wrap"
                value={newEvent.color}
                onValueChange={(value) => handleInputChange("color", value)}
              >
                {colorOptions.map((color) => (
                  <div key={color.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={color.value} id={`color-${color.value}`} className="sr-only" />
                    <Label
                      htmlFor={`color-${color.value}`}
                      className={`h-8 w-8 rounded-full cursor-pointer flex items-center justify-center border-2 ${
                        newEvent.color === color.value ? "border-black" : "border-transparent"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full ${color.bgClass}`}></div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddEvent} disabled={!newEvent.title}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
