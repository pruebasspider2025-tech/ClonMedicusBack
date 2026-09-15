const DoctorCalendarService = require("../services/DoctorCalendarService");

const getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const appointments = await DoctorCalendarService.getDoctorAppointments(
      doctorId,
      startDate,
      endDate
    );
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDoctorAppointments,
};
