import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ProductPage from './pages/ProductPage'
import DealsPage from './pages/DealsPage'
import AlertsPage from './pages/AlertsPage'
import CategoryPage from './pages/CategoryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="product/:sku" element={<ProductPage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="category/:category" element={<CategoryPage />} />
      </Route>
    </Routes>
  )
}

export default App
