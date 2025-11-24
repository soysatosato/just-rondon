const { defineConfig } = require("prisma");

export default defineConfig({
  datasources: {
    db: {
      // Migrate や Generate に使う接続
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL, // optional
    },
  },
});
