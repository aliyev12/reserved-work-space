import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import moment from "moment";
import uuid from "uuid/v4";

function App() {
  const [reservations, setReservations] = useState([]);
  const [mailContent, setMailContent] = useState([]);
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
        console.log("data => ", data);
        setReservations(data.data);
      });
  }, []);

  const handleGetMailContent = () => {
    axios
      .get(`${baseUrl}/api/get-mailcontent`, {
        headers: headers
      })
      .then(data => {
        console.dir(data.data);
        setMailContent(data.data);
      });
  };

  return (
    <div>
      <h1>Welcome to my react app! 😀</h1>
      <ul>
        {reservations &&
          reservations.length &&
          reservations.map(reservation => (
            <li key={uuid()}>
              Date:{" "}
              {moment(reservation.date).format("dddd") +
                " " +
                moment(reservation.date).format("MMMM Do")}
              , room: {reservation.room}
            </li>
          ))}
      </ul>
      <div>
        <button onClick={handleGetMailContent}>Get Mail Content </button>
        <div>
          Mail Content:{" "}
          {mailContent && mailContent.length && JSON.stringify(mailContent)}
        </div>
      </div>
    </div>
  );
}

export default App;
