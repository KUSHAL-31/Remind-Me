import React, { useState, useEffect } from 'react';
import './App.css';

import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';

function App() {

  const [reminderMsg, setreminderMsg] = useState("")
  const [reminderAt, setreminderAt] = useState()
  const [reminderList, setreminderList] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/allReminders").then(res => setreminderList(res.data))
  }, [])

  const addReminder = () => {
    axios.post("http://localhost:5000/addReminder", { reminderMsg, reminderAt }).then(res => setreminderList(res.data))
    setreminderMsg("")
    setreminderAt("")
  }

  const deleteReminder = (id) => {
    axios.post("http://localhost:5000/deleteReminder", { id }).then(res => setreminderList(res.data))
  }

  return (
    <div className="App">
      <div className="homepage">
        <div className="homepage-header">
          <h1>Remind me </h1>
          <input type="text" placeholder="Enter the reminder note here..." value={reminderMsg} onChange={e => setreminderMsg(e.target.value)} />
          <DateTimePicker
            value={reminderAt}
            onChange={setreminderAt}
            minDate={new Date()}
            minutePlaceholder="mm"
            hourPlaceholder="hh"
            dayPlaceholder="DD"
            monthPlaceholder="MM"
            yearPlaceholder="YYYY"
          />
          <button className="button" onClick={addReminder}>Set Reminder</button>
        </div>
        <div className="homepage-body">
          {
            reminderList.map((item) => {
              return <div className="reminder-card" key={item._id}>
                <h2>{item.reminderMsg}</h2>
                <h3>Remind me at : </h3>
                <p>{String(new Date(item.reminderAt).toLocaleString(undefined, { timeZone: "Asia/Kolkata" }))}</p>
                <div className="button" onClick={() => deleteReminder(item._id)}>Delete</div>
              </div>
            })
          }
        </div>

      </div>
    </div>
  );
}

export default App;
