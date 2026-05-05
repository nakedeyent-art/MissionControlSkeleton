import EventKit
let store = EKEventStore()
let group = DispatchGroup()
group.enter()
store.requestAccess(to: .event) { (granted, error) in
    if granted {
        let calendars = store.calendars(for: .event)
        for cal in calendars {
            print("\(cal.source.title) -> \(cal.title)")
        }
    }
    group.leave()
}
group.wait()
