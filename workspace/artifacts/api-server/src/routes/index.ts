import { Router, type IRouter } from "express";
import healthRouter from "./health";
import riesgosRouter from "./riesgos";
import controlesRouter from "./controles";
import monitoreoRouter from "./monitoreo";
import eventosRouter from "./eventos";
import medicionesRouter from "./mediciones";
import parametrosRouter from "./parametros";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(riesgosRouter);
router.use(controlesRouter);
router.use(monitoreoRouter);
router.use(eventosRouter);
router.use(medicionesRouter);
router.use(parametrosRouter);
router.use(dashboardRouter);

export default router;
