const cron = require('node-cron');

const tests = [
  "0 */15 6-16 * * 1-5",
  "0 */5 9-16 * * 1-5",
  "0 0 */2 * * *",
  "0 0 */3 * * *",
  "0 0 7-19 * * 1-5"
];

tests.forEach(expr => {
  try {
    const valid = cron.validate(expr);
    console.log(`Expression: "${expr}" | Valid: ${valid}`);
    if (valid) {
      cron.schedule(expr, () => {}, { timezone: "America/New_York" });
      console.log(`  -> Scheduled successfully`);
    } else {
       console.log(`  -> INVALID according to validate()`);
    }
  } catch (err) {
    console.log(`  -> Threw error: ${err.message}`);
  }
});
