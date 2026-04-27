const WEEK_DAYS = [
  { key: 'monday', weekday: '周一' },
  { key: 'tuesday', weekday: '周二' },
  { key: 'wednesday', weekday: '周三' },
  { key: 'thursday', weekday: '周四' },
  { key: 'friday', weekday: '周五' },
  { key: 'saturday', weekday: '周六' },
  { key: 'sunday', weekday: '周日' }
];

function generateWeekDates(weekStartDate) {
  const start = new Date(weekStartDate);
  return WEEK_DAYS.map((day, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const y = current.getFullYear();
    const m = `${current.getMonth() + 1}`.padStart(2, '0');
    const d = `${current.getDate()}`.padStart(2, '0');
    return { ...day, date: `${y}-${m}-${d}` };
  });
}

function splitTimeRangeToHourlySlots(start, end) {
  const slots = [];
  let h = Number(start.slice(0, 2));
  const endH = Number(end.slice(0, 2));
  while (h < endH) {
    const next = h + 1;
    slots.push({
      start: `${String(h).padStart(2, '0')}:00`,
      end: `${String(next).padStart(2, '0')}:00`
    });
    h = next;
  }
  return slots;
}

function mergeContinuousSlots(slots) {
  if (!slots.length) return [];
  const sorted = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (last.end === current.start) {
      last.end = current.end;
    } else {
      merged.push({ ...current });
    }
  }
  return merged;
}

function calculateCommonFreeTime(schedules) {
  const submitted = schedules.filter((s) => s.status !== 'not_submitted');
  if (!submitted.length) {
    return WEEK_DAYS.reduce((acc, d) => ({ ...acc, [d.key]: [] }), {});
  }

  const result = {};
  WEEK_DAYS.forEach((day) => {
    const firstSet = new Set((submitted[0].availability?.[day.key] || []).map((s) => `${s.start}-${s.end}`));
    const intersection = submitted.slice(1).reduce((acc, sch) => {
      const set = new Set((sch.availability?.[day.key] || []).map((s) => `${s.start}-${s.end}`));
      return new Set([...acc].filter((x) => set.has(x)));
    }, firstSet);

    result[day.key] = mergeContinuousSlots(
      [...intersection].map((x) => {
        const [start, end] = x.split('-');
        return { start, end };
      })
    );
  });

  return result;
}

function calculateRecommendedTrainingTimes(schedules, targetMemberIds, weekDates) {
  const total = targetMemberIds.length;
  const submitted = schedules.filter((s) => s.status !== 'not_submitted');
  const records = [];

  weekDates.forEach((day) => {
    const slotMap = {};
    submitted.forEach((s) => {
      (s.availability?.[day.key] || []).forEach((slot) => {
        const key = `${slot.start}-${slot.end}`;
        if (!slotMap[key]) slotMap[key] = [];
        slotMap[key].push(s.user_id);
      });
    });

    Object.keys(slotMap).forEach((slotKey) => {
      const [start, end] = slotKey.split('-');
      const availableMemberIds = Array.from(new Set(slotMap[slotKey]));
      const unavailableMemberIds = targetMemberIds.filter((id) => !availableMemberIds.includes(id));
      records.push({
        date: day.date,
        weekday: day.weekday,
        day_key: day.key,
        start,
        end,
        available_count: availableMemberIds.length,
        total_count: total,
        available_member_ids: availableMemberIds,
        unavailable_member_ids: unavailableMemberIds
      });
    });
  });

  return records.sort((a, b) => {
    if (b.available_count !== a.available_count) return b.available_count - a.available_count;
    const durationA = Number(a.end.slice(0, 2)) - Number(a.start.slice(0, 2));
    const durationB = Number(b.end.slice(0, 2)) - Number(b.start.slice(0, 2));
    if (durationB !== durationA) return durationB - durationA;
    return `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`);
  });
}

module.exports = {
  WEEK_DAYS,
  generateWeekDates,
  splitTimeRangeToHourlySlots,
  mergeContinuousSlots,
  calculateCommonFreeTime,
  calculateRecommendedTrainingTimes
};
