import EventKit
import Foundation

let store = EKEventStore()

let group = DispatchGroup()
group.enter()

store.requestAccess(to: .event) { (granted, error) in
    if granted {
        let calendars = store.calendars(for: .event)
        let now = Date()
        let future = Calendar.current.date(byAdding: .day, value: 30, to: now)!
        
        let predicate = store.predicateForEvents(withStart: now, end: future, calendars: calendars)
        let events = store.events(matching: predicate)
        
        var output = ""
        let formatter = DateFormatter()
        formatter.dateFormat = "MM/dd/yyyy h:mm:ss a"
        
        for event in events {
            let title = event.title ?? "Untitled"
            let start = formatter.string(from: event.startDate)
            let calName = event.calendar.title
            output += "\(title)::\(calName)::\(start)||"
        }
        print(output)
    } else {
        print("ACCESS_DENIED")
    }
    group.leave()
}

group.wait()
