import Forms from "./components/Forms";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./pages/Room/Room";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Forms />} />
        <Route path="/:roomId" element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
