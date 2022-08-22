import Forms from "./components/Forms";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./pages/Room/Room";
import NewBoard from "./components/Whiteboard/NewWhiteboard";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Forms />} />
        <Route path="/:roomId" element={<RoomPage />} />
        <Route path="/new" element={<NewBoard />} />
      </Routes>
    </div>
  );
}

export default App;
