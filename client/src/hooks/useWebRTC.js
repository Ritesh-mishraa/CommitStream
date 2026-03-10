import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
};

export const useWebRTC = (socket, roomId) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: MediaStream }

    const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
    const localStreamRef = useRef(null);

    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(false);

    // 1. Initialize local media
    useEffect(() => {
        const initLocalMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                // Start muted by default
                stream.getAudioTracks().forEach(track => track.enabled = false);

                setLocalStream(stream);
                localStreamRef.current = stream;
            } catch (err) {
                console.error("Failed to get local media", err);
            }
        };

        initLocalMedia();

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Helpers to create and manage PCs
    const createPeerConnection = useCallback((remoteSocketId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to PC
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle incoming ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc:ice', { to: remoteSocketId, candidate: event.candidate });
            }
        };

        // Handle incoming media streams
        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({
                ...prev,
                [remoteSocketId]: event.streams[0]
            }));
        };

        peerConnections.current[remoteSocketId] = pc;
        return pc;
    }, [socket]);

    // 2. Handle Socket Events for Signaling
    useEffect(() => {
        // DO NOT attach signaling listeners until local stream is fully acquired
        if (!socket || !localStream) return;

        // When someone joins, we (the existing users) initiate the offer
        const handleUserJoined = async ({ socketId, username }) => {
            const pc = createPeerConnection(socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('webrtc:offer', { to: socketId, offer });
        };

        const handleOfferReceived = async ({ from, offer }) => {
            const pc = createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc:answer', { to: from, answer });
        };

        const handleAnswerReceived = async ({ from, answer }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleIceReceived = async ({ from, candidate }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        const handleUserLeft = ({ socketId }) => {
            if (peerConnections.current[socketId]) {
                peerConnections.current[socketId].close();
                delete peerConnections.current[socketId];
            }
            setRemoteStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[socketId];
                return newStreams;
            });
        };

        socket.on('user-joined', handleUserJoined);
        socket.on('webrtc:offer-received', handleOfferReceived);
        socket.on('webrtc:answer-received', handleAnswerReceived);
        socket.on('webrtc:ice-received', handleIceReceived);
        socket.on('user-left', handleUserLeft);

        // Tell the server we are NOW ready to receive 'user-joined' events
        socket.emit('webrtc:ready');

        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('webrtc:offer-received', handleOfferReceived);
            socket.off('webrtc:answer-received', handleAnswerReceived);
            socket.off('webrtc:ice-received', handleIceReceived);
            socket.off('user-left', handleUserLeft);
        };

    }, [socket, localStream, createPeerConnection]);

    // Media Controls
    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    const disconnect = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }

        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        setRemoteStreams({});
    }, []);

    return {
        localStream,
        remoteStreams,
        toggleMute,
        toggleVideo,
        disconnect,
        isMuted,
        isVideoOff
    };
};
