import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./app/Header";
// PAGES
import { TypingPage } from "./app/pages/TypingPage";
import { UserPage } from "./app/pages/UserPage";
// STYLES
import "./app/styles/global.scss";
import { testStore } from "./app/store/core/react-store-ts";
import { useMemo } from "react";

function App() {
  const a = testStore;

  const b = useMemo(() => {}, []);

  return (
    <div className="app">
      <Header />
      <main className="app-content">
        <Routes>
          <Route index path="/typing" element={<TypingPage />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/" element={<Navigate to="typing" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
