const express = require("express");
const connectDB = require("./cofig/database");
const app = express();
const cookieParser = require("cookie-parser");
 const authRouter = require("./routes/auth")
 const profileRouter = require("./routes/profile")
 const requestRouter = require("./routes/request")

app.use(express.json());
app.use(cookieParser());
app.use("/",authRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)



connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(7777, () => {
      console.log("Server is successfully listening on port 7777");
    });
  })
  .catch(() => {
    console.log("Database cannot be connected");
  });
