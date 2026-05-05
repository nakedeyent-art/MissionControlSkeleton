const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);

async function test() {
  console.log("Starting calendar fetch...");
  const script = `
    set today to current date
    set time of today to 0
    set futureLimit to today + (30 * days)
    set eventsStr to ""
    tell application "Calendar"
      try
        set allCals to every calendar
        repeat with cal in allCals
          try
            set calEvents to (every event of cal whose start date >= today and start date < futureLimit)
            repeat with ev in calEvents
              set d to start date of ev
              set dStr to (month of d as integer as string) & "/" & (day of d as string) & "/" & (year of d as string) & " " & (time string of d)
              set eventsStr to eventsStr & (summary of ev) & "::" & (name of cal) & "::" & dStr & "||"
            end repeat
          end try
        end repeat
      on error errMsg
        return "ERROR: " & errMsg
      end try
    end tell
    return eventsStr
  `;
  try {
    const startTime = Date.now();
    const { stdout, stderr } = await execFileAsync('osascript', ['-e', script], { timeout: 60000 });
    console.log("Finished in", (Date.now() - startTime)/1000, "seconds");
    console.log("Output length:", stdout.length);
    console.log(stdout.substring(0, 500));
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
