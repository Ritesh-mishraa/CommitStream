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
    const knownScreenStreamIds = useRef(new Set());

    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Track negotiation state to resolve WebRTC signaling collisions
    const makingOffer = useRef(false);
    const ignoreOffer = useRef(false);
    const iceCandidateQueue = useRef({}); // { socketId: [RTCIceCandidate] }

    // 1. Initialize local media
    useEffect(() => {
        let isMounted = true;
        let activeStream = null;

        const initLocalMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                
                if (!isMounted) {
                    // If component unmounted while waiting for user permission, kill the hardware immediately
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                activeStream = stream;

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
            isMounted = false;
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
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
                makingOffer.current = true;
                if (pc.signalingState === "stable") {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    if (socket) {
                        socket.emit('webrtc:offer', { to: remoteSocketId, offer: pc.localDescription });
                    }
                }
            } catch (err) {
                console.error('Error during renegotiation:', err);
            } finally {
                makingOffer.current = false;
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
            
            // Check if we received the socket notification for this stream being a Screen Share
            if (knownScreenStreamIds.current.has(stream.id)) {
                stream.isScreen = true;
            }

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

        const flushIceCandidates = async (pc, socketId) => {
            const queue = iceCandidateQueue.current[socketId];
            if (queue && queue.length > 0) {
                for (const candidate of queue) {
                    try {
                        await pc.addIceCandidate(candidate);
                    } catch (e) {
                        console.error('Failed to add queued ICE candidate', e);
                    }
                }
                iceCandidateQueue.current[socketId] = [];
            }
        };

        const handleOfferReceived = async ({ from, offer }) => {
            let pc = peerConnections.current[from];
            if (!pc) pc = createPeerConnection(from);

            const polite = socket.id > from;
            const offerCollision = (offer.type === "offer") && (makingOffer.current || pc.signalingState !== "stable");

            ignoreOffer.current = !polite && offerCollision;
            if (ignoreOffer.current) {
                return; 
            }

            try {
                if (offerCollision) {
                    await Promise.all([
                        pc.setLocalDescription({ type: "rollback" }),
                        pc.setRemoteDescription(new RTCSessionDescription(offer))
                    ]);
                } else {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                }
                
                await flushIceCandidates(pc, from);

                if (offer.type === "offer") {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('webrtc:answer', { to: from, answer: pc.localDescription });
                }
            } catch (err) {
                console.error('Collision resolution error:', err);
            }
        };

        const handleAnswerReceived = async ({ from, answer }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                    await flushIceCandidates(pc, from);
                } catch (e) {
                    console.log('Safe to silently ignore late answers', e);
                }
            }
        };

        const handleIceReceived = async ({ from, candidate }) => {
            const pc = peerConnections.current[from];
            if (pc) {
                try {
                    const rtcCandidate = new RTCIceCandidate(candidate);
                    if (pc.remoteDescription && pc.remoteDescription.type) {
                        await pc.addIceCandidate(rtcCandidate);
                    } else {
                        if (!iceCandidateQueue.current[from]) iceCandidateQueue.current[from] = [];
                        iceCandidateQueue.current[from].push(rtcCandidate);
                    }
                } catch (e) {
                    if (!ignoreOffer.current) {
                        console.error('Failed to handle ICE candidate', e);
                    }
                }
            }
        };

        const handleScreenShareId = ({ from, streamId }) => {
            knownScreenStreamIds.current.add(streamId);
            
            setRemoteStreams(prev => {
                const existingStreams = prev[from] || [];
                const updatedStreams = existingStreams.map(s => {
                    if (s.id === streamId) s.isScreen = true;
                    return s;
                });
                return { ...prev, [from]: updatedStreams };
            });
        };

        const handleScreenShareStopped = ({ from, streamId }) => {
            knownScreenStreamIds.current.delete(streamId);
            setRemoteStreams(prev => {
                const existingStreams = prev[from] || [];
                // Remove the explicitly stopped screen stream completely from the local state
                const updatedStreams = existingStreams.filter(s => s.id !== streamId);
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
        socket.on('webrtc:screen-share-stopped', handleScreenShareStopped);
        socket.on('user-left', handleUserLeft);

        // Tell the server we are NOW ready to receive 'user-joined' events
        socket.emit('webrtc:ready');

        return () => {
            socket.off('user-joined', handleUserJoined);
            socket.off('webrtc:offer-received', handleOfferReceived);
            socket.off('webrtc:answer-received', handleAnswerReceived);
            socket.off('webrtc:ice-received', handleIceReceived);
            socket.off('webrtc:screen-share-id', handleScreenShareId);
            socket.off('webrtc:screen-share-stopped', handleScreenShareStopped);
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
            const streamId = localScreenStreamRef.current.id;
            
            track.stop();

            // Remove the track from all peers
            Object.values(peerConnections.current).forEach(pc => {
                const sender = pc.getSenders().find(s => s.track === track);
                if (sender) pc.removeTrack(sender);
            });

            // Signal other clients in the room to forcefully close this explicit stream layout
            socket.emit('webrtc:screen-share-stopped', { streamId });

            setLocalScreenStream(null);
            localScreenStreamRef.current = null;
            setIsScreenSharing(false);
        }
    };

    const disconnect = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            localStreamRef.current = null;
            setLocalStream(null);
            setIsVideoOff(true);
            setIsMuted(true);
        }

        if (localScreenStreamRef.current) {
            localScreenStreamRef.current.getTracks().forEach(track => track.stop());
            const streamId = localScreenStreamRef.current.id;
            socket?.emit('webrtc:screen-share-stopped', { streamId });
            localScreenStreamRef.current = null;
            setLocalScreenStream(null);
            setIsScreenSharing(false);
        }

        Object.values(peerConnections.current).forEach(pc => pc.close());
        peerConnections.current = {};
        setRemoteStreams({});
        iceCandidateQueue.current = {};
    }, [socket]);

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
