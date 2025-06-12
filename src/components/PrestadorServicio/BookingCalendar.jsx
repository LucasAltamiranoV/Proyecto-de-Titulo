import React, { lazy, Suspense } from 'react'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import { formatDate } from '@fullcalendar/core'; // Import formatDate

const LazyCalendar = lazy(() => import('./Calendar'))
const LazyPlaceholder = lazy(() => import('./Placeholder'))

export default class BookingCalendar extends React.Component {

  state = {
    calendarVisible: true, // test with `true` also (for #177)
    weekendsVisible: true,
    currentEvents: []
  }

  render() {
    return (
      <div className='demo-app'>
        {this.renderSidebar()}
        <div className='demo-app-main'>
          <Suspense>
            {!this.state.calendarVisible ? (
              <LazyPlaceholder />
            ) : (
              <LazyCalendar
                initialEvents={INITIAL_EVENTS} // Removed curly braces for correct passing
                weekendsVisible={this.state.weekendsVisible}
                onDateSelect={this.handleDateSelect}
                onEventClick={this.handleEventClick}
                onEvents={this.handleEvents}
              />
            )}
          </Suspense>
        </div>
      </div>
    )
  }

  renderSidebar() {
    return (
      <div className='demo-app-sidebar'>
        <div className='demo-app-sidebar-section'>
          <label>
            <input
              type='checkbox'
              checked={this.state.calendarVisible}
              onChange={this.handleToggleCalendar}
            ></input>
            toggle calendar
          </label>
        </div>
        <div className='demo-app-sidebar-section'>
          <label>
            <input
              type='checkbox'
              checked={this.state.weekendsVisible}
              onChange={this.handleToggleWeekends}
            ></input>
            toggle weekends
          </label>
        </div>
        <div className='demo-app-sidebar-section'>
          <h2>All Events ({this.state.currentEvents.length})</h2>
          <ul>
            {this.state.currentEvents.map(renderSidebarEvent)}
          </ul>
        </div>
      </div>
    )
  }

  handleToggleCalendar = () => {
    this.setState({
      calendarVisible: !this.state.calendarVisible
    })
  }

  handleToggleWeekends = () => {
    this.setState({
      weekendsVisible: !this.state.weekendsVisible
    })
  }

  handleDateSelect = (selectInfo) => {
    let title = prompt('Please enter a new title for your event')
    let calendarApi = selectInfo.view.calendar

    calendarApi.unselect() // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      })
    }
  }

  handleEventClick = (clickInfo) => {
    if (window.confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) { // Use window.confirm instead of confirm
      clickInfo.event.remove()
    }
  }

  handleEvents = (events) => {
    this.setState({
      currentEvents: events
    })
  }

}

function renderSidebarEvent(event) {
  return (
    <li key={event.id}>
      <b>{formatDate(event.start, {year: 'numeric', month: 'short', day: 'numeric'})}</b>
      <i>{event.title}</i>
    </li>
  )
}
