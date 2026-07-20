// Generates the next 5 available delivery dates with 1-hour time slots.
// Respects the 7 PM cutoff: if it's after 7 PM, tomorrow is the
// earliest available date instead of today.

export function getDeliverySlots() {
  const now = new Date();
  const currentHour = now.getHours();
  const isPast7PM = currentHour >= 19;

  const dates = [];
  // Start from today or tomorrow based on cutoff
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

export function getTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const start = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
    const endHour = hour + 1;
    const end = endHour <= 12 ? `${endHour}:00 AM` : `${endHour - 12}:00 PM`;
    slots.push({
      value: `${hour}:00-${endHour}:00`,
      label: `${start.replace(":00 ", " ")} – ${end.replace(":00 ", " ")}`,
    });
  }
  return slots;
}
