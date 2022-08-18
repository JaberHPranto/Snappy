import React from "react";
import CreateRoomForm from "./CreateRoom";
import "./forms.css";
import JoinRoomForm from "./JoinRoom";

const Forms = () => {
  return (
    <div className="row h-100 p-5">
      <div className="col-md-4 mx-auto mt-5 py-3 px-5 border-primary border border-2 rounded-2 d-flex flex-column align-items-center formBox">
        <h1 className="text-primary fw-bold">Create Room</h1>
        <CreateRoomForm />
      </div>
      <div className="col-md-4 mx-auto mt-5 py-3 px-5 border-primary border border-2 rounded-2 d-flex flex-column align-items-center formBox">
        <h1 className="text-primary fw-bold">Join Room</h1>
        <JoinRoomForm />
      </div>
    </div>
  );
};

export default Forms;
