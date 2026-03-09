import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import ConflictPredictor from './pages/ConflictPredictor';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="conflicts" element={<ConflictPredictor />} />
                    {/* Room page handles full screen layout itself */}
                </Route>
                <Route path="/room/:id" element={<Room />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
