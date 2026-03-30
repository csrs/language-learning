import { NavLink, Route, Routes } from "react-router";
import { Quiz } from "./components/Quiz/Quiz";
import { Home } from "./components/Home/Home";

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/quiz">Einbürgerungs Quiz</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </div>
  );
}

export default App;
