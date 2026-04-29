function buildHourlySlots(start = '08:00', end = '23:00') {
  const slots = [];
  let hour = Number(start.slice(0, 2));
  const endHour = Number(end.slice(0, 2));

  while (hour < endHour) {
    const next = hour + 1;
    slots.push({
      key: `${String(hour).padStart(2, '0')}:00-${String(next).padStart(2, '0')}:00`,
      start: `${String(hour).padStart(2, '0')}:00`,
      end: `${String(next).padStart(2, '0')}:00`
    });
    hour = next;
  }

  return slots;
}

module.exports = {
  buildHourlySlots
};
