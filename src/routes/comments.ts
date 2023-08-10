import { Express } from "express";
import verifyToken from "../middleware/auth";

module.exports = (app: Express) => {
  const comments = require("../controllers/comments");
  var router = require("express").Router();

  router.post("/", verifyToken, comments.createComment);
  router.delete("/:commentId", verifyToken, comments.deleteComment);

  app.use("/api/comment", router);
};