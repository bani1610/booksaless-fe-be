import { Navigate, Route, Routes } from 'react-router-dom'
import { ROLES } from './auth/authService.js'
import AdminLayout from './components/AdminLayout.jsx'
import Account from './pages/Account.jsx'
import Forbidden from './pages/Forbidden.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AuthorForm from './pages/admin/AuthorForm.jsx'
import AuthorList from './pages/admin/AuthorList.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import GenreForm from './pages/admin/GenreForm.jsx'
import GenreList from './pages/admin/GenreList.jsx'
import GuestRoute from './routes/GuestRoute.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

// Peta akses:
//   publik       -> /
//   tamu saja    -> /login, /register
//   semua login  -> /akun, /403
//   admin saja   -> /admin/*
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/akun" element={<Account />} />
        <Route path="/403" element={<Forbidden />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="genres" element={<GenreList />} />
          <Route path="genres/create" element={<GenreForm />} />
          <Route path="genres/:id/edit" element={<GenreForm />} />
          <Route path="authors" element={<AuthorList />} />
          <Route path="authors/create" element={<AuthorForm />} />
          <Route path="authors/:id/edit" element={<AuthorForm />} />
        </Route>
      </Route>

      {/* URL yang tidak dikenal kembali ke halaman depan, bukan ke login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
