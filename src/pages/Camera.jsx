import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdChevronLeft, MdCameraswitch } from 'react-icons/md';
import { LiveKitRoom, useTracks, useRoomContext, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { auth } from '../config/firebase';
import './Camera.css';

const API_URL = 'http://localhost:3001';
const LIVEKIT_URL = 'wss://babywise-jqbqqsgq.livekit.cloud';

const Camera = () => {
  const { groupId, cameraName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const group = location.state?.group || { id: groupId, name: 'Grupo' };
  
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('Inicializando...');
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = frontal, 'environment' = trasera
  const socket = useSocket();
  const audioRef = useRef(null);

  const ROOM_ID = `${group.id}`;

  // Unirse a la sala como cámara y escuchar eventos de socket
  useEffect(() => {
    if (!socket) {
      console.log('[Camera] Socket no disponible aún');
      return;
    }

    // Esperar a que el usuario esté autenticado
    const checkAuthAndJoin = () => {
      if (!auth.currentUser) {
        console.error('[Camera] Usuario no autenticado');
        return;
      }

      console.log('[Camera] Emitiendo join-room:', {
        group: ROOM_ID,
        role: 'camera',
        cameraIdentity: `${cameraName}`,
        groupId: groupId,
        UID: auth.currentUser.uid,
        baby: cameraName
      });

      socket.emit('join-room', {
        group: ROOM_ID,
        role: 'camera',
        cameraIdentity: `${cameraName}`,
        groupId: groupId,
        UID: auth.currentUser.uid,
        baby: cameraName
      });
    };

    const joinRoom = () => {
      checkAuthAndJoin();
    };

    // Unirse inmediatamente si ya está conectado
    if (socket.connected) {
      joinRoom();
    }

    // También escuchar el evento 'connect' por si se reconecta
    socket.on('connect', joinRoom);

    const handlePlayAudio = ({ audioUrl }) => {
      console.log('[Camera] Play audio:', audioUrl);
      setAudioUrl(audioUrl);
    };

    const handleStopAudio = () => {
      console.log('[Camera] Stop audio');
      setAudioUrl(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };

    const handleRotateCamera = () => {
      console.log('[Camera] Recibido evento rotate-camera');
      handleToggleFacingMode();
    };

    socket.on('play-audio', handlePlayAudio);
    socket.on('stop-audio', handleStopAudio);
    socket.on('rotate-camera', handleRotateCamera);

    return () => {
      // Notificar que la cámara se desconecta
      console.log('[Camera] Emitiendo camera-disconnect:', {
        groupId: group.id,
        cameraName: cameraName
      });
      socket.emit('camera-disconnect', {
        groupId: group.id,
        cameraName: cameraName
      });
      socket.off('connect', joinRoom);
      socket.off('play-audio', handlePlayAudio);
      socket.off('stop-audio', handleStopAudio);
      socket.off('rotate-camera', handleRotateCamera);
    };
  }, [socket, ROOM_ID, cameraName, groupId]);

  // Obtener token de LiveKit
  useEffect(() => {
    let isMounted = true;
    
    const fetchToken = async () => {
      setStatus('Obteniendo token...');
      try {
        const response = await axios.get(`${API_URL}/getToken`, {
          params: {
            roomName: ROOM_ID,
            participantName: `camera-${cameraName}`,
          },
        });
        if (isMounted) {
          setToken(response.data.token);
          setStatus('Conectando...');
        }
      } catch (err) {
        console.error('[Camera] Error obteniendo token:', err);
        if (isMounted) {
          setStatus(`Error: ${err.message}`);
          setError('No se pudo obtener el token de conexión');
        }
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [cameraName, ROOM_ID]);

  // Reproducir audio cuando cambia audioUrl
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('[Camera] Error reproduciendo audio:', err);
        setStatus('Error al reproducir audio');
      });
    }
  }, [audioUrl]);

  const handleToggleFacingMode = () => {
    setFacingMode(prev => {
      const next = prev === 'user' ? 'environment' : 'user';
      console.log(`[Camera] Rotando cámara de ${prev} a ${next}`);
      return next;
    });
  };

  const handleGoBack = () => {
    navigate(`/group/${groupId}`, { replace: true });
  };

  return (
    <div className="camera-container">
      {/* Header controls */}
      <div className="camera-header">
        <button className="camera-back-button" onClick={handleGoBack}>
          <MdChevronLeft size={32} />
        </button>
        
        <div className="camera-status">
          <span className="status-text">{status}</span>
        </div>

        <button className="rotate-button" onClick={handleToggleFacingMode} title="Rotar cámara">
          <MdCameraswitch size={24} />
        </button>
      </div>

      {/* Group title */}
      <div className="camera-title">
        <h2>{group.name}</h2>
      </div>

      {/* Error message */}
      {error && (
        <div className="camera-error">
          <p>{error}</p>
        </div>
      )}

      {/* LiveKit Room */}
      {token ? (
        <LiveKitRoom
          key={facingMode} // Force re-mount when facing mode changes
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={{ facingMode }}
          options={{
            adaptiveStream: { pixelDensity: 'screen' }
          }}
          connectOptions={{
            autoSubscribe: false
          }}
          onConnected={() => setStatus('En vivo')}
          onDisconnected={() => setStatus('Desconectado')}
        >
          <RoomView setStatus={setStatus} />
        </LiveKitRoom>
      ) : (
        <div className="camera-loading">
          <div className="spinner"></div>
          <p>Cargando transmisión...</p>
        </div>
      )}

      {/* Audio player (hidden) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            console.log('[Camera] Audio terminado');
            setAudioUrl(null);
          }}
          onError={(e) => {
            console.error('[Camera] Error en audio:', e);
            setAudioUrl(null);
            setStatus('Error al reproducir audio');
          }}
        />
      )}
    </div>
  );
};

// Componente interno para manejar la sala de LiveKit
const RoomView = ({ setStatus }) => {
  const room = useRoomContext();
  const videoTracks = useTracks([Track.Source.Camera]);
  const localVideoTrack = videoTracks.find(t => t.participant.isLocal);
  const remoteParticipants = useRemoteParticipants();

  // Suscribirse solo al audio de los viewers
  useEffect(() => {
    if (!room) return;

    // Para tracks publicados después de conectar
    const handleTrackPublished = (publication, participant) => {
      if (participant.identity && participant.identity.startsWith('viewer')) {
        if (publication.kind === 'audio') {
          publication.setSubscribed(true);
          console.log('[Camera] Suscrito al audio del viewer:', participant.identity);
        }
      }
    };

    room.on('trackPublished', handleTrackPublished);

    // Para tracks publicados antes de conectar
    remoteParticipants.forEach((participant) => {
      if (participant.identity && participant.identity.startsWith('viewer')) {
        participant.trackPublications.forEach((publication) => {
          if (publication.kind === 'audio') {
            publication.setSubscribed(true);
            console.log('[Camera] Suscrito al audio del viewer (existente):', participant.identity);
          }
        });
      }
    });

    return () => {
      room.off('trackPublished', handleTrackPublished);
    };
  }, [room, remoteParticipants]);

  useEffect(() => {
    if (localVideoTrack) {
      setStatus('En vivo');
    }
  }, [localVideoTrack, setStatus]);

  return (
    <div className="camera-tracks-container">
      {localVideoTrack ? (
        <video
          ref={(el) => {
            if (el && localVideoTrack.publication?.track) {
              localVideoTrack.publication.track.attach(el);
            }
          }}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
      ) : (
        <div className="camera-waiting">
          <p>Esperando transmisión local...</p>
        </div>
      )}
    </div>
  );
};

export default Camera;
