import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CheckoutPage from './pages/CheckoutPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CheckoutPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:checkoutId" element={<CheckoutPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App