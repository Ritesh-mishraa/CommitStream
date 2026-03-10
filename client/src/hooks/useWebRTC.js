import { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
};

export const useWebRTC = (socket, roomId) => {
    const [localStream, setLocalStream] = useState(null);
    const [localScreenStream, setLocalScreenStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: [MediaStream] }

    const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
    const localStreamRef = useRef(null);
    const localScreenStreamRef = useRef(null);

    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

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

        // Handle renegotiation 
        pc.onnegotiationneeded = async () => {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                if (socket) {
                    socket.emit('webrtc:offer', { to: remoteSocketId, offer });
                }
            } catch (err) {
                console.error('Error during renegotiation:', err);
            }
        };

        // Handle incoming ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('webrtc:ice', { to: remoteSocketId, candidate: event.candidate });
            }
        };

        // Handle incoming media streams
        pc.ontrack = (event) => {
            const stream = event.streams[0];
            setRemoteStreams(prev => {
                const existingStreams = prev[remoteSocketId] || [];
                if (!existingStreams.some(s => s.id === stream.id)) {
                    return {
                        ...prev,
                        [remoteSocketId]: [...existingStreams, stream]
                    };
                }
                return prev;
            });
        };

        peerConnections.current[remoteSocketId] = pc;
        return pc;
    }, [socket]);

    // 2. Handle Socket Events for Signaling
    useEffect(() => {
        // DO NOT attach signaling listeners until local stream is fully acquired
        if (!socket || !localStream) return;

        // When someone joins, create connection
        const handleUserJoined = async ({ socketId, username }) => {
            createPeerConnection(socketId);
            // We rely on onnegotiationneeded to fire the offer
        };

        const handleOfferReceived = async ({ from, offer }) => {
            let pc = peerConnections.current[from];
            if (!pc) pc = createPeerConnection(from);

            // Check signaling state to avoid collision
            if (pc.signalingState !== 'stable') {
                await Promise.all([
                    pc.setLocalDescription({ type: "rollback" }),
                    pc.setRemoteDescription(new RTCSessionDescription(offer))
                ]);
            } else {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('webrtc:answer', { to: from, answer });
        };

        const handleAnswerReceived = async ({ from, answer }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                // If the remote description was already set (e.g., from rollback), we might not need this.
                // But generally safe to attempt.
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) {
                    console.log('Answer ignored, potentially already in stable state', e);
                }
            }
        };

        const handleIceReceived = async ({ from, candidate }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.log('Failed to add ICE candidate', e);
                }
            }
        };

        const handleScreenShareId = ({ from, streamId }) => {
            setRemoteStreams(prev => {
                const existingStreams = prev[from] || [];
                const updatedStreams = existingStreams.map(s => {
                    if (s.id === streamId) s.isScreen = true;
                    return s;
                });
                return { ...prev, [from]: updatedStreams };
            });
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
        socket.on('webrtc:screen-share-id', handleScreenShareId);
        socket.on('user-left', handleUserLeft);

        // Tell the server we are NOW ready to receive 'user-joined' events
        socket.emit('webrtc:ready');

        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('webrtc:offer-received', handleOfferReceived);
            socket.off('webrtc:answer-received', handleAnswerReceived);
            socket.off('webrtc:ice-received', handleIceReceived);
            socket.off('webrtc:screen-share-id', handleScreenShareId);
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

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            setLocalScreenStream(stream);
            localScreenStreamRef.current = stream;
            setIsScreenSharing(true);

            // Add the new screen track to all existing peers
            const screenTrack = stream.getVideoTracks()[0];
            Object.values(peerConnections.current).forEach(pc => {
                pc.addTrack(screenTrack, stream);
            });

            // Notify when the user stops screen sharing via browser button
            screenTrack.onended = () => stopScreenShare();

            // Broadast custom event to tell receivers which stream is the screen
            socket.emit('webrtc:screen-share-id', { streamId: stream.id });

        } catch (err) {
            console.error('Failed to get display media', err);
        }
    };

    const stopScreenShare = () => {
        if (localScreenStreamRef.current) {
            const track = localScreenStreamRef.current.getTracks()[0];
            track.stop();

            // Remove the track from all peers
            Object.values(peerConnections.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track === track);
                if (sender) pc.removeTrack(sender);
            });

            setLocalScreenStream(null);
            localScreenStreamRef.current = null;
            setIsScreenSharing(false);
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
    };
};
