import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
const DB_FILE = process.env.DB_FILE;
const TIME_OFF_DB_FILE = process.env.TIME_OFF_DB_FILE;

const OPERATIONAL_HOURS = {
  start: parseInt(process.env.OPERATIONAL_HOURS_START),
  end: parseInt(process.env.OPERATIONAL_HOURS_END),
};
const SLOT_DURATION = parseInt(process.env.SLOT_DURATION);

const loadAppointments = () => {
  const data = fs.existsSync(DB_FILE) ? fs.readFileSync(DB_FILE) : "[]";
  return JSON.parse(data);
};

const loadTimeOff = () => {
  const data = fs.existsSync(TIME_OFF_DB_FILE)
    ? fs.readFileSync(TIME_OFF_DB_FILE)
    : "[]";
  return JSON.parse(data);
};

const saveAppointments = (appointments) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(appointments, null, 2));
};

export const getAvailableSlots = (date) => {
  const appointments = loadAppointments();
  const slots = [];

  for (
    let hour = OPERATIONAL_HOURS.start;
    hour < OPERATIONAL_HOURS.end;
    hour++
  ) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      const isBooked = appointments.some(
        (app) =>
          new Date(app.date).getTime() === new Date(date).getTime() &&
          new Date(app.startTime).getTime() ===
            new Date(formatedTime(date, startTime)).getTime()
      );

      slots.push({ date, startTime, available_slots: isBooked ? 0 : 1 });
    }
  }

  return slots;
};

export const bookAppointment = (date, time) => {
  const appointments = loadAppointments();
  const timeOff = loadTimeOff();

  const startTime = formatedTime(date, time);
  const endTime = calculateEndTime(startTime);

  const matchedTimeOff = timeOff.find(
    (timeOff) => new Date(timeOff.date).getTime() === new Date(date).getTime()
  );

  if (matchedTimeOff) {
    const error = new Error(
      `${date} is ${matchedTimeOff.timeOffType} please choose another day`
    );
    throw error;
  }

  if (
    appointments.some(
      (app) =>
        new Date(app.date).getTime() === new Date(date).getTime() &&
        new Date(startTime).getTime() >= new Date(app.startTime).getTime() &&
        new Date(startTime).getTime() <= new Date(app.endTime).getTime()
    )
  ) {
    const availableSlots = getAvailableSlots(date);
    const error = new Error("Slot already booked, please book another slot");
    error.availableSlots = availableSlots;
    throw error;
  }

  // return

  const newAppointment = {
    id: uuidv4(),
    date: new Date(date),
    startTime: startTime,
    endTime: endTime,
  };
  appointments.push(newAppointment);
  saveAppointments(appointments);

  return newAppointment;
};

export const cancelAppointment = (id) => {
  let appointments = loadAppointments();
  const canceledAppointment = appointments.find((app) => app.id === id);

  if (!canceledAppointment) {
    throw new Error(`Appointment with id ${id} not found`);
  }

  appointments = appointments.filter((app) => app.id !== id);
  saveAppointments(appointments);

  return canceledAppointment;
};

const saveTimeOff = (timOff) => {
  fs.writeFileSync(TIME_OFF_DB_FILE, JSON.stringify(timOff, null, 2));
};

export const setTimeOff = (date, type) => {
  const timeOffs = loadTimeOff();

  const newTimeOff = {
    id: uuidv4(),
    date: new Date(date),
    timeOffType: type,
  };

  timeOffs.push(newTimeOff);

  saveTimeOff(timeOffs);

  return newTimeOff;
};

const calculateEndTime = (startTime) => {
  return new Date(
    new Date(startTime).getTime() + SLOT_DURATION * 60 * 1000
  ).toISOString();
};

const formatedTime = (date, time) => {
  return new Date(`${date}T${time}:00.000Z`).toISOString();
};
