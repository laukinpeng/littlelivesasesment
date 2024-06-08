import express from "express";
import bodyParser from "body-parser";
import {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
} from "./controllers/appointmentController.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(bodyParser.json());

// epxress api
app.get("/appointments/:date", getAvailableSlots);
// http://localhost:3000/appointments/2024-04-04
// to show the available slot for that day

app.post("/appointments", bookAppointment);
// http://localhost:3000/appointments
// {
//   "date": "2024-04-04",
//   "time": "10:00"
// }
// to make a booking based on the available slot for that day

app.delete("/cancelappointment/:id", cancelAppointment);
// http://localhost:3000/cancelappointment/d8acb225-60f4-4b09-aeed-595d93cc06d1
// {
//   "date": "2024-04-04",
//   "time": "10:00"
// }
// to calcel a booking based on id

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
