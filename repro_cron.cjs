const cron = require('node-cron');

const job = {
  id: "test-job",
  name: "Test Job",
  schedule: {
    expr: "0 */15 6-16 * * 1-5"
  },
  timezone: "America/New_York"
};

try {
  let scheduleExpr = typeof job.schedule === 'string' ? job.schedule : (job.schedule).expr;
  const timezone = job.timezone || (job.schedule).tz || "America/New_York";
  
  console.log(`Scheduling: ${scheduleExpr} with timezone ${timezone}`);
  const task = cron.schedule(scheduleExpr, () => {
    console.log("Tick");
  }, { timezone });
  
  console.log("Success!");
} catch (err) {
  console.error("Failed:", err.message);
}
