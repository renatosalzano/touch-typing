import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./app/Header";
// PAGES
import { TypingPage } from "./app/pages/TypingPage";
import { UserPage } from "./app/pages/UserPage";
// STYLES
import "./app/styles/global.scss";
import { typingStore } from "./app/store/typingStore";
import { useEffect, useState } from "react";

function App() {
  const [[str, count], setTest] = useState(["test", 0]);
  typingStore.useWatch({
    standard(newStandard) {
      console.log(newStandard, count);
    },
  });
  return (
    <div className="app">
      <Header />
      <main className="app-content">
        <div onClick={() => setTest((prev) => [prev[0], prev[1] + 1])}>
          TESTING
        </div>
        <div>
          {str} {count}
        </div>
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
