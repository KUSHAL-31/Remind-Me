require("dotenv").config()
const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

mongoose.connect('mongodb://localhost:27017/reminderDB', () => {
    console.log("connected to database");
});

const reminderSchema = new mongoose.Schema({
    reminderMsg: String,
    reminderAt: String,
    isReminded: Boolean
})

const Reminder = new mongoose.model("reminder", reminderSchema)


// APi path using routers
setInterval(() => {
    Reminder.find({}, (err, reminderList) => {
        if (err) {
            console.log(err)
        }
        if (reminderList) {
            reminderList.forEach(reminder => {
                if (!reminder.isReminded) {
                    const now = new Date()
                    if ((new Date(reminder.reminderAt) - now) < 0) {
                        Reminder.findByIdAndUpdate(reminder._id, { isReminded: true }, (err, remindObj) => {
                            if (err) {
                                console.log(err)
                            }
                            const accountSid = process.env.ACCOUNT_URL
                            const authToken = process.env.AUTH_TOKEN
                            const client = require('twilio')(accountSid, authToken);
                            client.messages
                                .create({
                                    body: reminder.reminderMsg,
                                    from: 'whatsapp:+14155238886',
                                    to: 'whatsapp:+917045340060'
                                })
                                .then(message => console.log(message.sid))
                                .done()
                            Reminder.deleteOne({ _id: reminder._id }, () => {
                                Reminder.find({}, (err, reminderList) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    else {
                                        res.send(reminderList)
                                    }
                                })
                            })
                        })
                    }
                }
            })
        }
    })
}, 1000);


app.get("/allReminders", (req, res) => {
    Reminder.find({}, (err, reminderList) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send(reminderList)
        }
    })
})


app.post("/addReminder", (req, res) => {
    const { reminderMsg, reminderAt } = req.body;
    const reminder = Reminder({
        reminderMsg,
        reminderAt,
        isReminded: false
    })
    reminder.save((err) => {
        if (err) {
            console.log(err);
        }
        Reminder.find({}, (err, reminderList) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(reminderList)
            }
        })
    })
})

app.post("/deleteReminder", (req, res) => {
    Reminder.deleteOne({ _id: req.body.id }, () => {
        Reminder.find({}, (err, reminderList) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(reminderList)
            }
        })
    })
})


app.listen(5000, () => {
    console.log("Listening on port 5000....");
})