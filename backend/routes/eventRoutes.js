const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventControllers");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", eventController.getAllEvents);
router.get("/:eventId", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put("/:eventId", eventController.updateEvent);
router.delete("/:eventId", eventController.cancelEvent);
router.post("/:eventId/request", eventController.requestToJoinEvent);
router.post(
  "/:eventId/requests/:requestId/accept",
  eventController.acceptJoinRequest
);
router.post(
  "/:eventId/requests/:requestId/reject",
  eventController.rejectJoinRequest
);

module.exports = router;
