import Forms from "./components/Forms";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./pages/Room/Room";
import NewWhiteboard from "./components/Whiteboard/NewWhiteboard";
import Home from "./pages/Home/Home";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<Forms />} />
        <Route path="/:roomId" element={<RoomPage />} />
        <Route path="/new" element={<NewWhiteboard />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
