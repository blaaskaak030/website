const url = '/events.ics'
import ICAL from '/js/ical.min.js'

export async function loadEvents(limit) {
  limit = limit ? limit : 10_000_000
  const res = await fetch(url)
  const text = await res.text()
  const jcal = ICAL.parse(text)
  const comp = new ICAL.Component(jcal)
  const now = new Date()
  const events = comp
    .getAllSubcomponents('vevent')
    .map(v => new ICAL.Event(v))
    // .filter(e => {
    //   const d = e.startDate.toJSDate()
    //   return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    // })
    .sort((a, b) => a.startDate.toJSDate() - b.startDate.toJSDate())

  const list = document.querySelector('#events')
  if (list == null || list == undefined) {
    console.error('No target for calendar list');
    return
  }
  const template = document.querySelector('#event-template')

  for (const event of events.slice(0, limit)) {
    const clone = template.content.cloneNode(true)
    const date = event.startDate.toJSDate()
    const monthday = date.getDate()
    const monthname = date.toLocaleString('nl-NL', { month: 'short' })

    clone.querySelector('.event-day').textContent = monthday
    clone.querySelector('.event-month').textContent = monthname
    clone.querySelector('.event-title').textContent = event.summary

    const locationLink = clone.querySelector('.event-location a')
    locationLink.textContent = event.location
    locationLink.href = `https://www.google.nl/maps/place/${encodeURIComponent(event.location)}`

    list.appendChild(clone)
  }
}
