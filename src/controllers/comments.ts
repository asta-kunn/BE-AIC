import { Response } from "express";
import CommentService from "../services/comments";
import { UserAuthRequest } from "../middleware/auth";

exports.createComment = (req: UserAuthRequest, res: Response): void => {
  const { parentId, parentType, content } = req.body;
  console.log(req.body);
  const email = req.email;
  CommentService.create(email, parentId, parentType, content)
    .then((comment) => {
      res.status(201).json(comment);
    })
    .catch((error) => res.status(400).json(error.message));
};

exports.deleteComment = (req: UserAuthRequest, res: Response): void => {
    const { commentId } = req.params;
    const email = req.email;
    CommentService.deleteComments(email, commentId)
        .then(() => {
        res.status(200).json("Comment successfully deleted");
        })
        .catch((error) => res.status(400).json(error.message));
    }
    





































