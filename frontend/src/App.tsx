import { NavLink, Route, Routes } from "react-router";
import { MemoryGame } from "./components/MemoryGame/MemoryGame";
import { Quiz } from "./components/Quiz/Quiz";
import { TasksAndForm } from "./components/TaskList/TasksAndForm";
import { Home } from "./components/Home/Home";

function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/memory-game">
          Countries + Capital Cities Memory Game
        </NavLink>
        <NavLink to="/tasks-and-form">Todo List Maker</NavLink>
        <NavLink to="/quiz">Einbürgerungs Quiz</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memory-game" element={<MemoryGame />} />
        <Route path="/tasks-and-form" element={<TasksAndForm />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </div>
  );
}

export default App;
