import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(adminRouter);

export default router;
