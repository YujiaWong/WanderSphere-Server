import express from "express";
import { getUser } from "../dao/user.js";

const UsersRouter = express.Router();

UsersRouter.get("/find/:userId", getUser);

export default UsersRouter;
