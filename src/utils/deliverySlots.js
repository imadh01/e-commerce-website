export function getDeliverySlots() {
  const now = new Date();
  const currentHour = now.getHours();
  const isPast7PM = currentHour >= 19;
  const dates = [];
  const startOffset = isPast7PM ? 1 : 0;

  for (let i = startOffset; i < startOffset + 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });

    dates.push({
      value: date.toISOString().split("T")[0],
      label,
    });
  }

  return dates;
}

export function getTimeSlots(selectedDate) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentHour = now.getHours();
  const isToday = selectedDate === today;

  const slots = [];
  // Start from next full hour if today, otherwise from 8 AM
  const startHour = isToday ? Math.max(currentHour + 1, 8) : 8;
  // Cap at 7 PM (19:00) — no deliveries after 7 PM
  const endHour = 19;

  for (let hour = startHour; hour < endHour; hour++) {
    const startLabel = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
    const endHourVal = hour + 1;
    const endLabel =
      endHourVal <= 12 ? `${endHourVal}:00 AM` : `${endHourVal - 12}:00 PM`;

    slots.push({
      value: `${String(hour).padStart(2, "0")}:00-${String(endHourVal).padStart(2, "0")}:00`,
      label: `${startLabel.replace(":00 ", " ")} – ${endLabel.replace(":00 ", " ")}`,
    });
  }

  return slots;
}

// Returns auto-selected defaults
export function getDefaultDeliveryDateTime() {
  const now = new Date();
  const currentHour = now.getHours();
  const isPast7PM = currentHour >= 19;

  // If past 7PM, default to tomorrow
  const defaultDate = new Date(now);
  if (isPast7PM) {
    defaultDate.setDate(defaultDate.getDate() + 1);
  }
  const dateStr = defaultDate.toISOString().split("T")[0];

  // Next available hour slot
  const nextHour = isPast7PM ? 8 : Math.max(currentHour + 1, 8);
  const timeStr =
    nextHour < 19
      ? `${String(nextHour).padStart(2, "0")}:00-${String(nextHour + 1).padStart(2, "0")}:00`
      : "08:00-09:00";

  return { date: dateStr, time: timeStr };
}
