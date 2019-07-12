const express = require("express");
const app = express();
const Imap = require("imap");
const inspect = require("util").inspect;
const env = require("dotenv").config();
const locus = require("locus");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
var port = process.env.PORT || 8080;

var reservationSchema = new mongoose.Schema({
  date: Date,
  room: String
});
var Reservation = mongoose.model("Reservation", reservationSchema);

var MailListener = require("mail-listener2");

var mailListener = new MailListener({
  username: process.env.IMAP_USER,
  password: process.env.IMAP_PASSWORD,
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  //   searchFilter: ["UNSEEN", "FLAGGED"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: { streamAttachments: true }, // options to be passed to mailParser lib.
  attachments: true, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});

mailListener.start(); // start listening

// stop listening
//mailListener.stop();

mailListener.on("server:connected", function() {
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function() {
  console.log("imapDisconnected");
});

mailListener.on("error", function(err) {
  console.log(err);
});

let mailContext;

mailListener.on("mail", function(mail, seqno, attributes) {
  // do something with mail object including attachments
  //eval(locus);
  console.log(`=====================================================`);
  console.log(`=====================================================`);
  console.log(`mail.text ==`, mail.text);
  mailContext = mail.text;
  console.log(`=====================================================`);
  console.log(`=====================================================`);
  if (mail.text.search(/Amount/g) >= 0) {
    let sliced = mail.text.split("Amount")[1];
    sliced.replace(/\*/, "");
    let splitSliced = sliced.split("\n");

    splitSliced = splitSliced.filter(el2 => {
      return el2 !== "*" && el2 !== "";
    });
    splitSliced = splitSliced.filter(
      el3 =>
        /(Shared\s-\s[\d]{4})/g.test(el3) ||
        /(Monday)|(Tuesday)|(Wednesday)|(Thursday)|(Friday)|(Saturday)|(Sunday)/g.test(
          el3
        )
    );

    console.log("splitSliced = ", splitSliced);

    let pairs = [];
    splitSliced.forEach((s, i) => {
      console.log(`${i}) ${s}`);
      if (
        s.search(
          /(Monday)|(Tuesday)|(Wednesday)|(Thursday)|(Friday)|(Saturday)|(Sunday)/
        ) !== -1
      ) {
        let byDash = splitSliced[i + 1].split("-");
        let theRoom = byDash[byDash.length - 1]
          .replace(/\r/g, "")
          .replace(/\*/, "")
          .replace(/\s/, "");
        pairs.push({
          date: new Date(s.replace(/\r/g, "").replace(/\*/, "")),
          room: theRoom
        });
      }
    });
    console.log("Qualified as true! pairs = ", pairs);
    pairs.forEach(p => {
      Reservation.find({}, function(err, data) {
        console.log(`Length of data at the befinning is = `, data.length);
        if (data.length > 0) {
          let exists = false;
          data.forEach((el, i) => {
            if (
              new Date(el.date).getTime() === new Date(p.date).getTime() &&
              el.room === p.room
            ) {
              exists = true;
            }
          });
          if (!exists) {
            const myData = new Reservation({ date: p.date, room: p.room });
            myData.save().then(item => {
              console.log("item saved to database. Database was checked..");
            });
          } else {
            console.log(
              `#####=====>>>   Nothing has been written because the entry {date - ${
                p.date
              }; room - ${p.room}} already exists`
            );
          }
        } else {
          const myData = new Reservation({ date: p.date, room: p.room });
          myData.save().then(item => {
            console.log("item saved to database. Database was empty.");
          });
        }
        console.log(`Length of data at the END is = `, data.length);
      });
    });
  } else {
    console.log(`AMOUNT was not recognized, operation is terminated.`);
  }
});

mailListener.on("attachment", function(attachment) {
  console.log(attachment.path);
});

app.get("/get-reservations", (req, res) => {
  const authHeader = req.header(process.env.AUTH_HEADER_NAME);
  if (authHeader && authHeader === process.env.AUTH_TOKEN) {
    Reservation.find({}, function(err, data) {
      return res.json(data);
    });
  } else {
    return res.json("authentication failed");
  }
});

app.get("/get-mailContext", (req, res) => {
  const authHeader = req.header(process.env.AUTH_HEADER_NAME);
  if (authHeader && authHeader === process.env.AUTH_TOKEN) {
    return res.json(mailContext);
  } else {
    return res.json("authentication failed");
  }
});

app.get("/del-all-reservations", (req, res) => {
  const authHeader = req.header(process.env.AUTH_HEADER_NAME);
  if (authHeader && authHeader === process.env.AUTH_TOKEN) {
    Reservation.remove({}, () => res.json("all deleted"));
  } else {
    return res.json("authentication failed");
  }
});

app.listen(port, console.log(`Server running on port ${port}`));
