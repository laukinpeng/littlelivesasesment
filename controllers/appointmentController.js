import {
  getAvailableSlots as getSlots,
  bookAppointment as book,
  cancelAppointment as cancel,
} from "../services/appointmentService.js";

export function getAvailableSlots(req, res) {
  const { date } = req.params;

  // if (!date) {
  //   return res.status(400).json({ message: 'No date provided' });
  // }

  const slots = getSlots(date);
  res.json(slots);
}

export function bookAppointment(req, res) {
  const { date, time } = req.body;

  if (!date || !time || typeof date !== "string" || typeof time !== "string") {
    return res.status(400).json({ message: "Invalid date or time format" });
  }

  try {
    const appointment = book(date, time);
    res
      .status(201)
      .json({
        message: "You have successfully booked an appointment",
        appointment: appointment,
      });
  } catch (error) {
    if (error.availableSlots) {
      res
        .status(400)
        .json({ message: error.message, availableSlots: error.availableSlots });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
}

export const cancelAppointment = (req, res) => {
  const { id } = req.params;
  try {
    const canceledAppointment = cancel(id);
    res
      .status(200)
      .json({
        message: `Successfully canceled appointment with id ${canceledAppointment.id} on ${canceledAppointment.date}`,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
