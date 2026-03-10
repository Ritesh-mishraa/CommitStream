import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Users, FileType2, Copy, CheckCircle, MonitorUp, MonitorOff } from 'lucide-react';

const VideoElement = ({ stream, isLocal, muted }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800 aspect-video w-full h-full">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal || muted}
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-slate-600">No Video</div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white shadow">
                {isLocal ? 'You' : 'Remote Peer'}
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
            <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h1 className="text-slate-200 font-medium">Room: {roomId?.slice(0, 8)}</h1>
                    </div>
                    <div className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400 font-mono">
                        {Object.keys(remoteStreams).length + 1} connected
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button onClick={handleCopyLink} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 mr-2">
                        {isLinkCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {isLinkCopied ? "Copied!" : "Copy Link"}
                    </button>
                    <button onClick={toggleMute} className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleVideo} className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                    <button onClick={isScreenSharing ? stopScreenShare : startScreenShare} className={`p-2.5 rounded-full transition-colors ${isScreenSharing ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                        {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-6 bg-slate-800 mx-2"></div>
                    <button onClick={handleLeave} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                        <PhoneOff className="w-4 h-4" /> Leave
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden relative">

                {/* Left Area: Video & Screen */}
                <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">

                    {/* Screen Share Area (Pinned) */}
                    {activeScreenStream && (
                        <div className="flex-1 p-4 flex items-center justify-center">
                            <div className="w-full h-full max-h-full">
                                <VideoElement stream={activeScreenStream} isLocal={false} />
                            </div>
                        </div>
                    )}

                    {/* Video Grid Area (Fluid or PiP) */}
                    <div className={activeScreenStream
                        ? "absolute bottom-4 left-4 right-4 flex flex-nowrap gap-4 overflow-x-auto p-4 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl z-10"
                        : "flex-1 p-6 flex flex-wrap gap-4 justify-center items-center overflow-y-auto"}>

                        <div className={activeScreenStream ? "w-64 shrink-0 transition-all" : "flex-1 min-w-[300px] max-w-full transition-all"}>
                            <VideoElement stream={localStream} isLocal={true} />
                        </div>

                        {remoteCameraTracks.map((track, idx) => (
                            <div key={`${track.id}-${idx}`} className={activeScreenStream ? "w-64 shrink-0 transition-all" : "flex-1 min-w-[300px] max-w-full transition-all"}>
                                <VideoElement stream={track.stream} isLocal={false} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Chat & Presence */}
                <aside className="w-80 border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0">

                    {/* Tabs */}
                    <div className="flex text-sm text-slate-400 border-b border-slate-800">
                        <div className="flex-1 py-3 text-center border-b-2 border-blue-500 text-blue-400 font-medium">
                            <span className="flex items-center justify-center gap-2"><Users className="w-4 h-4" /> Chat ({messages.length})</span>
                        </div>
                    </div>

                    {/* Chat Panel */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-slate-600 text-sm text-center mt-10">No messages yet.</div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col max-w-[90%] ${msg.username === username ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                <span className="text-[10px] text-slate-500 mb-1 px-1">
                                    {msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`px-3 py-2 rounded-lg text-sm ${msg.username === username ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-800">
                        <form onSubmit={handleSendMessage} className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-md pl-3 pr-10 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 p-1 transition-colors">
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
