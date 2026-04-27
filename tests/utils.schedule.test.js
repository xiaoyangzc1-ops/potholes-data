const assert = require('assert');
const {
  generateWeekDates,
  splitTimeRangeToHourlySlots,
  mergeContinuousSlots,
  calculateCommonFreeTime
} = require('../miniprogram/utils/schedule');

(function testGenerateWeekDates() {
  const week = generateWeekDates('2026-04-27');
  assert.strictEqual(week.length, 7);
  assert.strictEqual(week[0].key, 'monday');
  assert.strictEqual(week[0].date, '2026-04-27');
})();

(function testSplitAndMerge() {
  const slots = splitTimeRangeToHourlySlots('15:00', '17:00');
  assert.deepStrictEqual(slots, [
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }
  ]);

  const merged = mergeContinuousSlots(slots);
  assert.deepStrictEqual(merged, [{ start: '15:00', end: '17:00' }]);
})();

(function testCommonFreeTime() {
  const schedules = [
    {
      status: 'available',
      availability: { monday: [{ start: '15:00', end: '16:00' }], tuesday: [] }
    },
    {
      status: 'available',
      availability: { monday: [{ start: '15:00', end: '16:00' }], tuesday: [] }
    }
  ];

  const common = calculateCommonFreeTime(schedules);
  assert.deepStrictEqual(common.monday, [{ start: '15:00', end: '16:00' }]);
})();

console.log('utils.schedule tests passed');
