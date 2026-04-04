import { Router } from "express";
import tasksRouter from "./tasks";
import messagesRouter from "./messages";
import sensorsRouter from "./sensors";
import predictRouter from "./predict";
import chatRouter from "./chat";

const router = Router();

router.use("/tasks", tasksRouter);
router.use("/messages", messagesRouter);
router.use("/sensors", sensorsRouter);
router.use("/predict", predictRouter);
router.use("/chat", chatRouter);

export default router;
