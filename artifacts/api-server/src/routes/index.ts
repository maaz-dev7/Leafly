import { Router, type IRouter } from "express";
import healthRouter from "./health";
import plantsRouter from "./plants";
import variantsRouter from "./variants";
import addonsRouter from "./addons";
import authRouter from "./auth";
import usersRouter from "./users";
import ordersRouter from "./orders";
import bookingsRouter from "./bookings";
import careRouter from "./care";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(plantsRouter);
router.use(variantsRouter);
router.use(addonsRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(bookingsRouter);
router.use(careRouter);
router.use(adminRouter);

export default router;
