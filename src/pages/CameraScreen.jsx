import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdChevronLeft, MdCameraswitch } from 'react-icons/md';
import { LiveKitRoom, useLocalParticipant, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import { auth } from '../config/firebase';
import './CameraScreen.css';

const API_URL = 'http://localhost:3001';
const LIVEKIT_URL = 'wss://babywise-jqbqqsgq.livekit.cloud';

const CameraScreen = () => {
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
    if (socket && socket.connected && auth.currentUser) {
      socket.emit('join-room', {
        group: ROOM_ID,
        role: 'camera',
        cameraIdentity: `${cameraName}`,
        groupId: group.id,
        UID: auth.currentUser.uid,
        baby: cameraName
      });

      const handlePlayAudio = ({ audioUrl }) => {
        console.log('[CameraScreen] Play audio:', audioUrl);
        setAudioUrl(audioUrl);
      };

      const handleStopAudio = () => {
        console.log('[CameraScreen] Stop audio');
        setAudioUrl(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };

      const handleRotateCamera = () => {
        console.log('[CameraScreen] Recibido evento rotate-camera');
        handleToggleFacingMode();
      };

      socket.on('play-audio', handlePlayAudio);
      socket.on('stop-audio', handleStopAudio);
      socket.on('rotate-camera', handleRotateCamera);

      return () => {
        // Notificar que la cámara se desconecta
        socket.emit('camera-disconnect', {
          groupId: group.id,
          cameraName: cameraName
        });
        socket.off('play-audio', handlePlayAudio);
        socket.off('stop-audio', handleStopAudio);
        socket.off('rotate-camera', handleRotateCamera);
      };
    }
  }, [socket, ROOM_ID, cameraName, group.id]);

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
        console.error('[CameraScreen] Error obteniendo token:', err);
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
        console.error('[CameraScreen] Error reproduciendo audio:', err);
        setStatus('Error al reproducir audio');
      });
    }
  }, [audioUrl]);

  const handleToggleFacingMode = () => {
    setFacingMode(prev => {
      const next = prev === 'user' ? 'environment' : 'user';
      console.log(`[CameraScreen] Rotando cámara de ${prev} a ${next}`);
      return next;
    });
  };

  const handleGoBack = () => {
    navigate(`/group/${groupId}`, { replace: true });
  };

  return (
    <div className="camera-screen-container">
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
            console.log('[CameraScreen] Audio terminado');
            setAudioUrl(null);
          }}
          onError={(e) => {
            console.error('[CameraScreen] Error en audio:', e);
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
  const { localParticipant } = useLocalParticipant();
  const videoTracks = useTracks([Track.Source.Camera]);
  const localVideoTrack = videoTracks.find(t => t.participant.isLocal);

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

export default CameraScreen;
