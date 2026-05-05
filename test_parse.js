const { execFile } = require('child_process');
const path = require('path');
execFile(path.join(__dirname, 'test_cal'), (err, stdout) => {
  if (err) throw err;
  const eventsRaw = stdout ? stdout.trim() : "";
  const allEvents = [];
  if (eventsRaw !== "" && eventsRaw !== "ACCESS_DENIED") {
    const macEvents = eventsRaw.split('||').filter((s) => s.length > 0).map((eventStr) => {
      const parts = eventStr.split('::');
      const startDate = parts[1] ? new Date(parts[1]) : null;
      return {
        title: parts[0] || 'Untitled Event',
        start: (startDate && !isNaN(startDate.getTime())) ? startDate.toISOString() : null,
        source: 'macos'
      };
    });
    allEvents.push(...macEvents);
  }
  console.log(JSON.stringify(allEvents, null, 2));
});
