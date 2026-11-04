import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import GenreList from './pages/admin/GenreList.jsx'
import GenreCreate from './pages/admin/GenreCreate.jsx'
import AuthorList from './pages/admin/AuthorList.jsx'
import AuthorCreate from './pages/admin/AuthorCreate.jsx'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="genres" element={<GenreList />} />
        <Route path="genres/create" element={<GenreCreate />} />
        <Route path="authors" element={<AuthorList />} />
        <Route path="authors/create" element={<AuthorCreate />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default App
