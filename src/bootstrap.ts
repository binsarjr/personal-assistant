import ExitAction from "./actions/system/ExitAction.js";
import { loadEnv } from "./supports/env.js";

loadEnv();

new ExitAction().execute();
