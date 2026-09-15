const express = require("express");
const router = express.Router();
const DoctorCalendarController = require("../controllers/DoctorCalendarController");
const DoctorController = require("../controllers/DoctorController");

router.get(
  "/doctor-calendar/:doctorId",
  DoctorCalendarController.getDoctorAppointments
);
router.get("/doctors", DoctorController.getDoctorsList);

module.exports = router;
