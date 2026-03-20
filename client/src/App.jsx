import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import ConflictPredictor from './pages/ConflictPredictor';
import Auth from './pages/Auth';
import Home from './pages/Home';
import About from './pages/About';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Audits from './pages/Audits';
import TeamDirectory from './pages/TeamDirectory';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import { ProjectProvider } from './context/ProjectContext';

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Routes with Navbar */}
                <Route element={
                    <>
                        <Navbar />
                        <Outlet />
                    </>
                }>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Route>

                {/* Standalone Auth & Onboarding */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />

                {/* Protected Dashboard Layout */}
                <Route element={<ProjectProvider><Layout /></ProjectProvider>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/conflicts" element={<ConflictPredictor />} />
                    <Route path="/audits" element={<Audits />} />
                    <Route path="/team" element={<TeamDirectory />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Standalone Fullscreen */}
                <Route path="/room/:id" element={<Room />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
