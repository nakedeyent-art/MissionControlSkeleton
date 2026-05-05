set today to current date
set time of today to 0
set tomorrow to today + (7 * days)
set output to "["
tell application "Calendar"
  set allCals to every calendar
  repeat with cal in allCals
    set calEvents to (every event of cal whose start date >= today and start date < tomorrow)
    repeat with ev in calEvents
      set evTitle to summary of ev
      set output to output & "{\"title\":\"" & evTitle & "\"},"
    end repeat
  end repeat
end tell
set output to output & "]"
return output
