  const express = require('express');
  const mongoose = require('mongoose');
  const { config } = require('dotenv');

  const bodyParser = require('body-parser');
  const cors = require('cors');

  config();

  const app = express();
  const port = process.env.PORT || 8080;
  const url = "mongodb+srv://bradleygaming12:rifqiadli@be-aic.axfryr4.mongodb.net/?retryWrites=true&w=majority"
  app.use(bodyParser.json());
  app.use(cors());

  mongoose
    .connect(url)
    .then(() => {
      console.log("Connected to the database!");
    })
    .catch((err: any) => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });

  app.get("/", (req: any, res: { send: (arg0: string) => void; }) => {
    res.send("Welcome to AIC Compfest Back End!");
  });

  // import routes
  require("./routes/users")(app);
  require("./routes/posts")(app);
  require("./routes/comments")(app);

  app.listen(port, () => {
      console.log(`Server is running on port ${port}.`);
      }
  );

