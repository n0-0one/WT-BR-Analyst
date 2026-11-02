import { syncWarThunderData } from "./sync-wt-data";

syncWarThunderData().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});
