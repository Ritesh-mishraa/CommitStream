import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import ConflictPredictor from './pages/ConflictPredictor';
import Auth from './pages/Auth';
import JoinProject from './pages/JoinProject';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="conflicts" element={<ConflictPredictor />} />
                        {/* Room page handles full screen layout itself */}
                    </Route>
                    <Route path="/room/:id" element={<Room />} />
                    <Route path="/join/:inviteToken" element={<JoinProject />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
