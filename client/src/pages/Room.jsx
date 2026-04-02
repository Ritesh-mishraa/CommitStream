import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Users, Copy, CheckCircle, MonitorUp, MonitorOff, User, LayoutDashboard } from 'lucide-react';

const VideoElement = ({ stream, isLocal, muted, isScreenShare = false, label = "Remote Peer" }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 w-full h-full flex items-center justify-center">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal || muted}
                    className={`max-w-full max-h-full ${isScreenShare ? 'object-contain w-full h-full' : 'object-cover w-full h-full'} ${isLocal && !isScreenShare ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-500 bg-slate-800/30">
                    <User className="w-8 h-8 opacity-40 mb-2" />
                    <span className="text-xs font-medium tracking-wide">Camera Off</span>
                </div>
            )}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-200 shadow-sm flex items-center gap-2 border border-slate-700/50">
                {isLocal ? 'You' : label}
                {isScreenShare && <span className="text-blue-400 font-mono tracking-tight text-[9px] uppercase ml-1 border-l border-slate-700 pl-2">Screen</span>}
            </div>
        </div>
    );
};

const Room = () => {
    const { id: roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const username = location.state?.username || user?.username || 'Guest';

    const { socket, isConnected } = useSocket(username, token);
    const {
        localStream,
        localScreenStream,
        remoteStreams,
        toggleMute,
        toggleVideo,
        startScreenShare,
        stopScreenShare,
        disconnect,
        isMuted,
        isVideoOff,
        isScreenSharing
    } = useWebRTC(socket, roomId);

    const remoteScreenTracks = [];
    const remoteCameraTracks = [];

    Object.entries(remoteStreams).forEach(([id, streams]) => {
        streams.forEach(stream => {
            if (stream.isScreen) {
                remoteScreenTracks.push({ id, stream });
            } else {
                remoteCameraTracks.push({ id, stream });
            }
        });
    });

    const activeScreenStream = localScreenStream || (remoteScreenTracks.length > 0 ? remoteScreenTracks[0].stream : null);
    const totalRemoteCameras = remoteCameraTracks.length;

    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    // Connect and join room
    useEffect(() => {
        if (socket && isConnected) {
            socket.emit('join-room', { roomId, username });

            socket.on('new-message', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            return () => {
                socket.emit('leave-room');
                socket.off('new-message');
            };
        }
    }, [socket, isConnected, roomId, username]);

    // Cleanup media on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !socket) return;

        const newMsg = {
            socketId: socket.id,
            username,
            text: chatInput,
            timestamp: new Date().toISOString()
        };

        socket.emit('send-message', { roomId, message: chatInput });
        setMessages((prev) => [...prev, newMsg]);
        setChatInput('');
    };

    const handleLeave = () => {
        disconnect();
        navigate('/dashboard');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col font-sans overflow-hidden">
            {/* Top Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        <h1 className="text-slate-200 font-semibold tracking-wide">Conference: {roomId?.slice(0, 8)}</h1>
                    </div>
                    <div className="px-2.5 py-1 bg-slate-800 rounded-md text-xs text-slate-400 font-mono tracking-tight border border-slate-700">
                        {totalRemoteCameras + 1} Connected
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button onClick={handleCopyLink} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 mr-4">
                        {isLinkCopied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {isLinkCopied ? "Copied!" : "Invite link"}
                    </button>
                    <button 
                        onClick={toggleMute} 
                        className={`p-3 rounded-full transition-all shadow-sm ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={toggleVideo} 
                        className={`p-3 rounded-full transition-all shadow-sm ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100'}`}
                        title={isVideoOff ? "Turn on camera" : "Turn off camera"}
                    >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={isScreenSharing ? stopScreenShare : startScreenShare} 
                        className={`p-3 rounded-full transition-all shadow-sm ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' : 'bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100'}`}
                        title={isScreenSharing ? "Stop sharing" : "Share screen"}
                    >
                        {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
                    </button>
                    <div className="w-px h-8 bg-slate-800 mx-2"></div>
                    <a 
                        href="/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                        title="Open Dashboard in new tab"
                    >
                        <LayoutDashboard className="w-4 h-4" /> <span className="hidden md:inline">Dashboard</span>
                    </a>
                    <button onClick={handleLeave} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-colors flex items-center gap-2">
                        <PhoneOff className="w-4 h-4" /> LEAVE
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden relative">
                
                {/* Left Area: Video & Screen */}
                <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">
                    
                    {activeScreenStream ? (
                        // Screen Share Layout (Google Meet / Zoom style)
                        <>
                            <div className="flex-1 p-4 md:p-6 overflow-hidden flex items-center justify-center bg-slate-950">
                                <div className="w-full h-full">
                                    <VideoElement 
                                        stream={activeScreenStream} 
                                        isLocal={activeScreenStream === localScreenStream} 
                                        isScreenShare={true} 
                                        label={activeScreenStream === localScreenStream ? "Your Screen" : "Remote Screen"} 
                                    />
                                </div>
                            </div>
                            
                            {/* Horizontal PIP Gallery for Camera feeds */}
                            <div className="h-44 md:h-52 bg-slate-900 border-t border-slate-800 p-4 flex gap-4 overflow-x-auto overflow-y-hidden shrink-0 items-center hide-scrollbar">
                                <div className="h-full aspect-video shrink-0 shadow-lg">
                                    <VideoElement stream={localStream} isLocal={true} />
                                </div>
                                {remoteCameraTracks.map((track, idx) => (
                                    <div key={`${track.id}-${idx}`} className="h-full aspect-video shrink-0 shadow-lg">
                                        <VideoElement stream={track.stream} isLocal={false} label={`Participant ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        // Standard Video Grid Layout
                        <div className="flex-1 p-6 md:p-10 flex flex-wrap gap-6 items-center justify-center overflow-y-auto bg-slate-950">
                            <div className={`transition-all duration-300 ease-in-out aspect-video shrink-0 flex-grow max-w-5xl ${totalRemoteCameras === 0 ? 'w-full lg:w-3/4 max-w-4xl' : 'w-[45%] min-w-[320px]'}`}>
                                <VideoElement stream={localStream} isLocal={true} />
                            </div>
                            {remoteCameraTracks.map((track, idx) => (
                                <div key={`${track.id}-${idx}`} className={`transition-all duration-300 ease-in-out aspect-video shrink-0 flex-grow max-w-5xl ${totalRemoteCameras === 0 ? 'w-full lg:w-3/4 max-w-4xl' : 'w-[45%] min-w-[320px]'}`}>
                                    <VideoElement stream={track.stream} isLocal={false} label={`Participant ${idx + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Chat */}
                <aside className="w-[340px] border-l border-slate-800 bg-slate-900/50 flex flex-col shrink-0 z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
                    
                    {/* Tabs */}
                    <div className="flex text-sm text-slate-400 border-b border-slate-800 bg-slate-900/80 p-1">
                        <div className="flex-1 py-3 text-center bg-slate-800 rounded-lg text-slate-100 font-medium shadow-sm">
                            <span className="flex items-center justify-center gap-2"><Users className="w-4 h-4" /> Meeting Chat ({messages.length})</span>
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-3 opacity-50">
                                <Send className="w-8 h-8" />
                                <span className="text-sm font-medium tracking-wide">Say hello to everyone!</span>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col max-w-[90%] ${msg.username === username ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                <span className="text-[10px] text-slate-500 mb-1.5 px-1 font-medium tracking-wide">
                                    {msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.username === username ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Message everyone..."
                                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-blue-500 shadow-inner transition-colors"
                            />
                            <button 
                                type="submit" 
                                disabled={!chatInput.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${chatInput.trim() ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm' : 'text-slate-500'}`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </aside>

            </main>
        </div>
    );
};

export default Room;
