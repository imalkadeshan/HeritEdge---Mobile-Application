import app from "./app";
import connectDB from "./config/database";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`HeritEdge API running on port ${PORT}`);
  });
};

start();
