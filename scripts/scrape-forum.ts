import { fetchCommunityAndStats } from "./fetch-community-and-stats";

fetchCommunityAndStats().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
