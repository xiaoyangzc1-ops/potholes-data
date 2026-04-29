function toDateString(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonday(date = new Date()) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() - day + 1);
  return current;
}

function getWeekRange(weekStartDate) {
  const start = new Date(weekStartDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    week_start_date: toDateString(start),
    week_end_date: toDateString(end),
    week_label: `${toDateString(start)} ~ ${toDateString(end)}`
  };
}

module.exports = {
  toDateString,
  getMonday,
  getWeekRange
};
