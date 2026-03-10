import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Send, Users, FileType2, Copy, CheckCircle } from 'lucide-react';

const VideoElement = ({ stream, isLocal, muted }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 aspect-video flex-1 min-w-[300px] max-w-full">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal || muted}
                    className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full text-zinc-600">No Video</div>
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
    const { localStream, remoteStreams, toggleMute, toggleVideo, disconnect, isMuted, isVideoOff } = useWebRTC(socket, roomId);

    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'files'
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
        <div className="h-screen w-full bg-zinc-950 flex flex-col font-sans overflow-hidden">

            {/* Top Header */}
            <header className="h-14 border-b border-zinc-act bg-zinc-900/40 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <h1 className="text-zinc-200 font-medium">Room: {roomId?.slice(0, 8)}</h1>
                    </div>
                    <div className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 font-mono">
                        {Object.keys(remoteStreams).length + 1} connected
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button onClick={handleCopyLink} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 mr-2">
                        {isLinkCopied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        {isLinkCopied ? "Copied!" : "Copy Link"}
                    </button>
                    <button onClick={toggleMute} className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button onClick={toggleVideo} className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
                        {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-2"></div>
                    <button onClick={handleLeave} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                        <PhoneOff className="w-4 h-4" /> Leave
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <main className="flex-1 flex overflow-hidden">

                {/* Video Grid Area (Fluid) */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex flex-wrap gap-4 justify-center items-center h-full">
                        <VideoElement stream={localStream} isLocal={true} />
                        {Object.entries(remoteStreams).map(([id, stream]) => (
                            <VideoElement key={id} stream={stream} isLocal={false} />
                        ))}
                    </div>
                </div>

                {/* Right Sidebar: Chat & Presence */}
                <aside className="w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col shrink-0">

                    {/* Tabs */}
                    <div className="flex text-sm text-zinc-400 border-b border-zinc-800">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-3 text-center border-b-2 transition-colors ${activeTab === 'chat' ? 'border-indigo-500 text-indigo-400 font-medium' : 'border-transparent hover:text-zinc-200'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><Users className="w-4 h-4" /> Chat ({messages.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`flex-1 py-3 text-center border-b-2 transition-colors ${activeTab === 'files' ? 'border-indigo-500 text-indigo-400 font-medium' : 'border-transparent hover:text-zinc-200'}`}
                        >
                            <span className="flex items-center justify-center gap-2"><FileType2 className="w-4 h-4" /> Presence</span>
                        </button>
                    </div>

                    {/* Chat Panel */}
                    {activeTab === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-zinc-600 text-sm text-center mt-10">No messages yet.</div>
                                )}
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex flex-col max-w-[90%] ${msg.username === username ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                        <span className="text-[10px] text-zinc-500 mb-1 px-1">
                                            {msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className={`px-3 py-2 rounded-lg text-sm ${msg.username === username ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-zinc-800">
                                <form onSubmit={handleSendMessage} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-sm rounded-md pl-3 pr-10 py-2 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-indigo-400 p-1 transition-colors">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}

                    {/* Files / Presence Panel (Mocked for MVP) */}
                    {activeTab === 'files' && (
                        <div className="flex-1 p-4">
                            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4 font-semibold">Active Files</div>
                            <div className="space-y-3">
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded flex justify-between items-center group cursor-pointer hover:border-zinc-600 transition-colors">
                                    <div className="h-full flex flex-col justify-center">
                                        <span className="text-sm text-zinc-300 font-mono">src/App.jsx</span>
                                        <span className="text-xs text-zinc-500 mt-1">Line 42</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center text-xs font-medium border border-pink-500/30">A</div>
                                </div>
                            </div>
                        </div>
                    )}

                </aside>

            </main>
        </div>
    );
};

export default Room;
