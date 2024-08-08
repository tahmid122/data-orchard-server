const express = require("express");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const app = express();
const cors = require("cors");
const PORT = 3999;
const mongoose = require("mongoose");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const { body, validationResult } = require("express-validator");
//bbbbbbb
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//bbbbbbb
//default setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//upload files
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "data-orchard", // Folder in Cloudinary where you want to store images
    format: async (req, file) => "jpeg", // Format the images (optional)
    public_id: (req, file) => file.originalname.split(".")[0], // The image's public ID (optional)
  },
});

const upload = multer({ storage: storage });
//db connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB is connected"))
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

// schema

const usersSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
  },
  pending: {
    type: Number,
  },
  fullPay: Boolean,
  profileImage: {
    type: String,
  },
  frontVoterId: {
    type: String,
  },
  backVoterId: {
    type: String,
  },
  facebookLink: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  bank: {
    bankName: String,
    branchName: String,
    accountHolderName: String,
    accountNumber: Number,
  },
  task: [
    {
      id: String,
      projectName: String,
      date: String,
      completedTask: Number,
    },
  ],
  about: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
//
const userWorkRecordSchema = new mongoose.Schema({
  recordId: String,
  userName: String,
  date: String,
  time: String,
});

const userWorkRecords = new mongoose.model(
  "userWorkRecords",
  userWorkRecordSchema
);

//test

app.post("/dataorchard", async (req, res) => {
  try {
    const { recordId, userName, date, time } = req.body;

    // Check if the recordId already exists in the database
    const existingRecord = await userWorkRecords.findOne({ recordId });

    if (existingRecord) {
      // If recordId exists, reject the request
      return res.status(400).json({ error: "RecordId already exists" });
    } else {
      // If recordId does not exist, proceed to save the new record
      const userRecords = new userWorkRecords({
        recordId,
        userName,
        date,
        time,
      });
      const finalData = await userRecords.save();
      console.log(finalData);

      res.status(201).json(finalData);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch the data
app.get("/get-dataorchard", async (req, res) => {
  const data = await userWorkRecords.find();
  res.status(200).json(data);
});

app.post("/desired-userName", async (req, res) => {
  const { desiredUserName } = req.body;

  const findUser = await userWorkRecords.find({
    userName: desiredUserName,
  });
  res.status(200).send(findUser);
});

app.post("/desired-user-record", async (req, res) => {
  const { userRecordName, userRecordDate } = req.body;

  const findData = await userWorkRecords.find({
    userName: userRecordName,
    date: userRecordDate,
  });
  if (findData) {
    res.status(200).send(findData);
  } else {
    res.status(200).send("Something went wrong");
  }
});
//test
//
//working history schema

const workingHistorySchema = new mongoose.Schema({
  date: String,
  name: String,
  completedTask: Number,
  totalAmount: Number,
});
//Admin Schema

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Users = new mongoose.model("users", usersSchema);
const workingHistory = new mongoose.model(
  "workingHistory",
  workingHistorySchema
);
const adminPanel = new mongoose.model("adminPanel", adminSchema);

//complete /upload/profileImage/:email
app.post(
  "/upload/profileImage/:email",
  upload.single("file"),
  async (req, res) => {
    const email = req.params.email;
    try {
      const file = req.file;
      console.log(file.path, file.filename);
      const findAndUpdate = await Users.findOneAndUpdate(
        { email: email },
        { $set: { profileImage: file.path } },
        { new: true }
      );
      res.status(200).send(findAndUpdate);
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  }
);
//complete /upload/frontVoterId/:email
app.post(
  "/upload/frontVoterId/:email",
  upload.single("file"),
  async (req, res) => {
    const email = req.params.email;
    try {
      const file = req.file;
      console.log(file.path, file.filename);
      const findAndUpdate = await Users.findOneAndUpdate(
        { email: email },
        { $set: { frontVoterId: file.path } },
        { new: true }
      );
      res.status(200).send(findAndUpdate);
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  }
);
//complete /upload/backVoterId/:email
app.post(
  "/upload/backVoterId/:email",
  upload.single("file"),
  async (req, res) => {
    const email = req.params.email;
    try {
      const file = req.file;
      console.log(file.path, file.filename);
      const findAndUpdate = await Users.findOneAndUpdate(
        { email: email },
        { $set: { backVoterId: file.path } },
        { new: true }
      );
      res.send(findAndUpdate);
    } catch (error) {
      res.status(401).send({ error: error.message });
    }
  }
);
//complete /resetPassword
app.put(
  "/resetPassword",
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be 8 charecters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const findAndUpdate = await Users.findOneAndUpdate(
        { email: email },
        { $set: { password: password } },
        { new: true }
      );
      res.status(201).send(findAndUpdate);
    } catch (error) {
      res.status(401).send(error.message);
    }
  }
);
//complete /findPassword
app.post("/findPassword", async (req, res) => {
  const { findPassword } = req.body;
  try {
    const findUser = await Users.findOne({ email: findPassword });
    if (findUser) {
      res.status(200).send(findUser);
    } else {
      res.status(401).send({ message: "Not Found" });
    }
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
});
//complete /upload/:email
app.get("/upload/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Users.findOne({ email: email });
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
//complete /users/:userName
app.get("/users/:userName", async (req, res) => {
  const userName = req.params.userName;
  try {
    const findUser = await Users.findOne({ userName: userName });
    if (findUser) {
      res.status(200).send(findUser);
    } else {
      res.status(401).send({ message: "Something went wrong" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete  salary
app.put("/users/salary/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { salary } = req.body;
  const user = await Users.findOne({ userName: userName });
  if (user) {
    user.salary = salary;
    await user.save();
    res.status(200).send(user);
  } else {
    res.status(404).send("User not found");
  }
});

//complete paid amount
app.put("/users/paidamount/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { pending, fullPay, nextTime } = req.body;
  const user = await Users.findOne({ userName: userName });
  if (user) {
    // user.paidAmount = user.paidAmount + Number(paidAmount);
    // user.pending = user.pending + Number(user.salary);
    // user.pending = user.pending + Number(user.salary - user.paidAmount);

    user.pending = pending;
    user.fullPay = fullPay;
    await user.save();
    res.status(200).send(user);
  } else {
    res.status(404).send("User not found");
  }
});
//complete pending amount
app.put("/users/pendingamount/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { pending, salary, fullPay } = req.body;
  const user = await Users.findOne({ userName: userName });
  if (user) {
    // user.paidAmount = user.paidAmount + Number(paidAmount);
    // user.pending = user.pending + Number(user.salary);
    // user.pending = user.pending + Number(user.salary - user.paidAmount);
    user.pending = user.pending + pending;
    user.salary = salary;
    user.fullPay = fullPay;
    await user.save();
    res.status(200).send(user);
  } else {
    res.status(404).send("User not found");
  }
});
//complete /
app.get("/", (req, res) => {
  res.status(200).send("home route");
});
//complete /users/update/:userName
app.get("/users/update/:userName", async (req, res) => {
  const userName = req.params.userName;
  try {
    const findUser = await Users.findOne({ userName: userName });
    if (findUser) {
      res.status(200).send(findUser);
    } else {
      res.status(401).send({ message: "Something went wrong" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete /register
app.post(
  "/register",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Input a valid email")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be  8 charecters"),
  body("name").trim().notEmpty().withMessage("Name  is required"),
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("userName is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("userName must be 8 charecters"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("phone is required")
    .isLength({ min: 11, max: 11 })
    .withMessage("phone must be 11 charecter"),
  body("facebookLink")
    .trim()
    .notEmpty()
    .withMessage("facebookLink is required"),
  body("about")
    .trim()
    .notEmpty()
    .withMessage("about is required")
    .isLength({ max: 600 })
    .withMessage("About length must be within 600 letters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    try {
      const newUser = await new Users({
        id: uuidv4(),
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        userName: req.body.userName,
        facebookLink: req.body.facebookLink,
        phone: req.body.phone,
        salary: 0,
        pending: 0,
        fullPay: false,
        bank: req.body.bank,
        task: req.body.task,
        about: req.body.about,
      });
      const user = await newUser.save();
      if (newUser) {
        res.status(201).send(user);
      } else {
        res.status(402).send("User registration failed");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
//complete /users/update/:userName
app.put("/users/update/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { password, name, profileImage, facebookLink, phone, about } = req.body;
  const { bankName, branchName, accountHolderName, accountNumber } =
    req.body.bank;

  try {
    const updatedUser = await Users.findOneAndUpdate(
      { userName: userName },
      {
        $set: {
          password,
          name,
          profileImage,
          facebookLink,
          phone,
          about,
          bank: { bankName, branchName, accountHolderName, accountNumber },
        },
      },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).send(updatedUser);
    } else {
      res.status(200).send("something went wrong");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete /login
app.post(
  "/login",
  body("email").trim().isEmail().notEmpty().withMessage("Email is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be 8 charecters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
      const findUser = await Users.findOne({ email: email });

      if (findUser && findUser.password === password) {
        res.status(200).send(findUser);
      } else {
        res.status(402).send({ message: "Invalid email/password" });
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
//complete /users/task/:userName
app.put("/users/task/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { date, projectName, completedTask } = req.body;

  try {
    const updatedUser = await Users.findOneAndUpdate(
      { userName: userName },
      { $push: { task: { id: uuidv4(), date, projectName, completedTask } } },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).send(updatedUser);
    } else {
      res.status(401).send("Something went wrong");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete
app.get("/users/task/:userName", async (req, res) => {
  const userName = req.params.userName;

  try {
    const findUser = await Users.findOne({ userName: userName });
    if (findUser) {
      res.status(200).send(findUser);
    } else {
      res.status(401).send("Something went wrong");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete
app.put("/users/task/delete/:userName", async (req, res) => {
  const userName = req.params.userName;
  const { id, projectName, date, completedTask } = req.body;
  try {
    const user = await Users.updateOne(
      { userName: userName },
      { $pull: { task: { id, projectName, date, completedTask } } }
    );
    res.status(200).send({ message: "Succesfully Deleted" });
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete admin
app.get("/admin", async (req, res) => {
  try {
    const users = await Users.find();
    res.status(201).send(users);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete /adminLogin
app.post(
  "/adminLogin",
  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be 8 charecter"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    const { email, password } = req.body;

    const findAdmin = await adminPanel.findOne({ email: email });

    if (findAdmin && findAdmin.password === password) {
      res.status(201).send(true);
    } else {
      res.status(401).send({ message: "invalid email/password" });
    }
  }
);
//complete /admin
app.post(
  "/admin",

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be 8 charecter"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const admin = await new adminPanel({ email: email, password: password });
    await admin.save();
    res.status(200).send(admin);
  }
);
//complete /admin delete
app.delete(
  "/admin",

  body("userName").trim().notEmpty().withMessage("userName is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  async (req, res) => {
    const userName = req.body.userName;
    try {
      const deletedUser = await Users.findOneAndDelete({ userName: userName });
      if (deletedUser) {
        res.status(200).send("Deleted successfully");
      } else {
        res.status(200).send("Something went wrong");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
//complete
app.put(
  "/admin",
  body("oldEmail")
    .trim()
    .isEmail()
    .withMessage("Input a valid email")
    .notEmpty()
    .withMessage("oldEmail is required"),
  body("newEmail")
    .trim()
    .isEmail()
    .withMessage("Input a valid email")
    .notEmpty()
    .withMessage("newEmail is required"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("Password must be  8 charecters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },

  async (req, res) => {
    const { oldEmail, newEmail, password } = req.body;
    const findUser = await adminPanel.findOne({ email: oldEmail });
    try {
      if (findUser) {
        const findAndUpdate = await adminPanel.findOneAndUpdate(
          { email: oldEmail },
          { $set: { email: newEmail, password: password } }
        );
        findUser.email = newEmail;
        findUser.password = password;
        await findUser.save();
        res.status(200).send(findUser);
        // console.log(await findUser.email, oldEmail);
      } else {
        res.status(202).send({ message: "Wrong info" });
      }
    } catch (error) {
      res.status(400).send({ invalid: error.message });
    }
  }
);
//complete
app.put("/resetAll", async (req, res) => {
  try {
    const updatedUsers = await Users.updateMany(
      {},
      { $set: { task: [], salary: 0, fullPay: false } },
      { new: true }
    );
    if (updatedUsers) {
      res.status(200).send(updatedUsers);
    } else {
      res.status(200).send("Something went wrong");
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});
//complete
app.post("/admin/working-history", async (req, res) => {
  const { date, name, completedTask, totalAmount } = req.body;
  const newData = await new workingHistory({
    date,
    name,
    completedTask,
    totalAmount,
  });
  const data = await newData.save();
  res.send(data);
});
//complete
app.get("/admin/working-history", async (req, res) => {
  const data = await workingHistory.find();

  res.send(data);
});
//complete
app.get("/update/:email", async (req, res) => {
  const email = req.params.email;

  const findUser = await Users.findOne({ email: email });
  res.send(findUser);
});

// invalid route
app.use((req, res, next) => {
  res.status(404).send({ messgae: "404 not found" });
});
// invalid server route
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).send({ message: "Something went wrong!" });
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
