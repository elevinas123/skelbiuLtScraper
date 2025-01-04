import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LaptopListingPage from "./pages/LaptopListingPage.jsx"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LaptopListingPage />} />
      </Routes>
    </Router>
  )
}

export default App
