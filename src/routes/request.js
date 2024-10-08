const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModal = require("../modals/connectionRequest");
const User = require("../modals/user");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res
          .status(400)
          .json({ message: "Invalid status type: " + status });
      }
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      const existingConnectionRequest = await ConnectionRequestModal.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection Request Already Exist" });
      }

      const connectionRequest = new ConnectionRequestModal({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status Not Allowed" });
      }

      const connectionRequest = await ConnectionRequestModal.findOne({
        _id: requestId,
        toUserId: loggedInUserId._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection request not found",
        });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({ message: "Connection Request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);
module.exports = requestRouter;
