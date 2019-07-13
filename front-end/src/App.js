import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";
import moment from "moment";

function App() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const headers = {
      AuthToken: "nbjhb3423bghv42hgvdhb234hb",
      "Access-Control-Allow-Origin": "*"
    };

    axios
      .get("http://localhost:8080/get-reservations", { headers: headers })
      .then(data => {
        console.log("data => ", data);
        setReservations(data.data);
      });
  }, []);

  return (
    <ul>
      {reservations &&
        reservations.length &&
        reservations.map(reservation => (
          <li>
            Date:{" "}
            {moment(reservation.date).format("dddd") +
              " " +
              moment(reservation.date).format("MMMM Do")}
            , room: {reservation.room}
          </li>
        ))}
    </ul>
  );
}

export default App;
