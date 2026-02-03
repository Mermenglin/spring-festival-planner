// 检查2026年农历正月十五的公历日期
const { Lunar, Solar } = require('lunar-javascript');

// 2026年农历正月十五
const lunar2026 = Lunar.fromYmd(2026, 1, 15);
const solar2026 = lunar2026.getSolar();

console.log('2026年农历正月十五（元宵节）:');
console.log('公历日期:', solar2026.toDate().toISOString().split('T')[0]);
console.log('农历:', lunar2026.getMonthInChinese() + lunar2026.getDayInChinese());

// 检查几个日期的农历
const dates = ['2026-02-24', '2026-03-05', '2026-03-04', '2026-03-03'];
dates.forEach(dateStr => {
  const solar = Solar.fromDate(new Date(dateStr));
  const lunar = solar.getLunar();
  console.log(dateStr, '=> 农历', lunar.getMonthInChinese() + lunar.getDayInChinese());
});