import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import moment from "moment";
import uuid from "uuid/v4";

function App() {
  const [reservations, setReservations] = useState([]);
  const [mailContent, setMailContent] = useState([]);
  const [mailContentRaw, setMailContentRaw] = useState([]);
  const [todaysReservation, setTodaysReservation] = useState();
  const headers = {
    AuthToken: "nbjhb3423bghv42hgvdhb234hb",
    "Access-Control-Allow-Origin": "*"
  };

  let baseUrl = "";
  if (window.location.href.includes("localhost")) {
    baseUrl = "http://localhost:8080";
  } else {
    baseUrl = "https://sleepy-castle-58931.herokuapp.com";
  }

  useEffect(() => {
    axios
      .get(`${baseUrl}/api/get-reservations`, {
        headers: headers
      })
      .then(data => {
        const allReservations = data.data;
        window.allReservations = allReservations;

        function compare(a, b) {
          if (new Date(a.date).getTime() < new Date(b.date).getTime()) {
            return 1;
          }
          if (new Date(a.date).getTime() > new Date(b.date).getTime()) {
            return -1;
          }
          return 0;
        }

        const sortedReservationsByDate = allReservations.sort(compare);

        const sortedAndFiltered = sortedReservationsByDate.filter(
          r =>
            new Date(r.date).getTime() >= new Date().getTime() ||
            new Date(r.date).toDateString() === new Date().toDateString()
        );

        const todays = sortedAndFiltered.find(
          s => new Date(s.date).toDateString() === new Date().toDateString()
        );

        const todaysRoom = todays && todays.room ? todays.room : "";

        setTodaysReservation(todaysRoom);

        setReservations(sortedAndFiltered);
      });
  }, []);

  const handleGetMailContent = () => {
    axios
      .get(`${baseUrl}/api/get-mailcontent`, {
        headers: headers
      })
      .then(data => {
        console.dir(data.data);
        window.mailContent = data.data;
        setMailContent(data.data);
      });

    axios
      .get(`${baseUrl}/api/get-mailcontent-raw`, {
        headers: headers
      })
      .then(data => {
        console.dir(data.data);
        window.mailContentRaw = data.data;
        setMailContent(data.data);
      });
  };

  const buttonStyles = {
    padding: "5px 10px",
    backgroundColor: "pink",
    borderRadius: "5px",
    color: "darkblue"
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <h1>Welcome to my react app! 😀</h1>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "fit-content",
          border: "3px solid pink",
          borderRadius: "15px",
          padding: "8px"
        }}
      >
        {todaysReservation ? (
          <span>Today's room is: {todaysReservation}</span>
        ) : (
          <span>No reservations for today!</span>
        )}
      </div>
      <h3>Future reservations</h3>
      <ul style={{ listStyle: "none" }}>
        {reservations &&
          reservations.length &&
          reservations.map((reservation, i) => (
            <li key={uuid()}>
              {i + 1}) Date:{" "}
              {moment(reservation.date).format("dddd") +
                " " +
                moment(reservation.date).format("MMMM Do")}
              , room: {reservation.room}
            </li>
          ))}
      </ul>
      <div>
        <button style={buttonStyles} onClick={handleGetMailContent}>
          Get Mail Content{" "}
        </button>
        <div>
          Mail Content:{" "}
          {mailContent && mailContent.length && JSON.stringify(mailContent)}
        </div>
      </div>
    </div>
  );
}

export default App;
