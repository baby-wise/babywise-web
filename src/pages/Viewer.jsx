import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LiveKitRoom, useTracks, VideoTrack, useRoomContext, useRemoteParticipants, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import { MdArrowBack, MdBrightness2, MdBrightness5, MdBarChart, MdMic, MdMusicNote, MdSupportAgent } from 'react-icons/md';
import SIGNALING_SERVER_URL from '../config/serverUrl';
import { auth } from '../config/firebase';
import './Viewer.css';

const Viewer = () => {
  const { groupId, cameraName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const group = location.state?.group || { id: groupId, _id: groupId };
  const userName = location.state?.userName || 'viewer';
  
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const wsUrl = 'wss://babywise-jqbqqsgq.livekit.cloud';

  useEffect(() => {
    let isMounted = true;
    
    const fetchToken = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/groups');
          return;
        }

        const res = await axios.get(`${SIGNALING_SERVER_URL}/getToken`, {
          params: {
            roomName: groupId,
            participantName: `viewer-${userName || Date.now()}`,
          },
        });
        
        if (isMounted) {
          setToken(res.data.token);
        }
      } catch (err) {
        console.error('Error fetching token:', err);
        setError(`Error: ${err.message}`);
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [groupId, userName, navigate]);

  if (error) {
    return (
      <div className="viewer-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={28} />
        </button>
        <div className="error-container">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="viewer-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Obteniendo token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <LiveKitRoom
        serverUrl={wsUrl}
        token={token}
        connect={true}
        audio={true}
        video={false}
        options={{
          adaptiveStream: { pixelDensity: 'screen' }
        }}
      >
        <RoomView 
          navigate={navigate}
          group={group}
          groupId={groupId}
          userName={userName}
          cameraName={cameraName}
        />
      </LiveKitRoom>
    </div>
  );
};

const RoomView = ({ navigate, group, groupId, userName, cameraName }) => {
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera]);
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  
  // Estados
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isTalking, setIsTalking] = useState(false);
  const [nightVision, setNightVision] = useState(false);
  const [speakingViewers, setSpeakingViewers] = useState([]);
  
  // Filtrar solo participantes que son cámaras
  const cameraTracks = tracks.filter(t => 
    t.participant?.identity && t.participant.identity.startsWith('camera-')
  );
  const cameraParticipants = Array.from(
    new Set(cameraTracks.map(t => t.participant.identity))
  );

  const hasSelectedInitialCamera = useRef(false);

  // Seleccionar cámara inicial
  useEffect(() => {
    if (cameraParticipants.length === 0) {
      setSelectedCamera(null);
      hasSelectedInitialCamera.current = false;
      return;
    }

    if (!hasSelectedInitialCamera.current) {
      if (cameraName && cameraParticipants.includes(`camera-${cameraName}`)) {
        setSelectedCamera(`camera-${cameraName}`);
      } else {
        setSelectedCamera(cameraParticipants[0]);
      }
      hasSelectedInitialCamera.current = true;
    }
  }, [cameraParticipants, cameraName]);

  // Suscribirse a audio y video de cámaras
  useEffect(() => {
    if (!room) return;

    const handleTrackPublished = (publication, participant) => {
      if (participant.identity && participant.identity.startsWith('camera')) {
        if (publication.kind === 'audio' || publication.kind === 'video') {
          publication.setSubscribed(true);
        }
      }
    };

    room.on('trackPublished', handleTrackPublished);

    // Suscribirse a tracks existentes
    remoteParticipants.forEach((participant) => {
      if (participant.identity && participant.identity.startsWith('camera')) {
        participant.getTrackPublications().forEach((publication) => {
          if (publication.kind === 'audio' || publication.kind === 'video') {
            publication.setSubscribed(true);
          }
        });
      }
    });

    return () => {
      room.off('trackPublished', handleTrackPublished);
    };
  }, [room, remoteParticipants]);

  // Escuchar mute/unmute de viewers
  useEffect(() => {
    if (!room) return;

    const handleTrackMuted = (publication, participant) => {
      if (participant.identity && participant.identity.startsWith('viewer')) {
        setSpeakingViewers(prev => prev.filter(id => id !== participant.identity));
      }
    };

    const handleTrackUnmuted = (publication, participant) => {
      if (participant.identity && participant.identity.startsWith('viewer')) {
        setSpeakingViewers(prev => {
          if (!prev.includes(participant.identity)) {
            return [...prev, participant.identity];
          }
          return prev;
        });
      }
    };

    room.on('trackMuted', handleTrackMuted);
    room.on('trackUnmuted', handleTrackUnmuted);

    // Inicializar con viewers desmuteados
    remoteParticipants.forEach((participant) => {
      if (participant.identity && participant.identity.startsWith('viewer')) {
        participant.getTrackPublications().forEach((pub) => {
          if (pub.kind === 'audio' && !pub.isMuted) {
            setSpeakingViewers(prev => {
              if (!prev.includes(participant.identity)) {
                return [...prev, participant.identity];
              }
              return prev;
            });
          }
        });
      }
    });

    return () => {
      room.off('trackMuted', handleTrackMuted);
      room.off('trackUnmuted', handleTrackUnmuted);
    };
  }, [room, remoteParticipants]);

  // Mutear audio local por defecto
  useEffect(() => {
    if (localParticipant) {
      const audioTracks = Array.from(localParticipant.audioTrackPublications.values());
      audioTracks.forEach(pub => {
        if (!pub.isMuted) {
          pub.mute();
        }
      });
    }
  }, [localParticipant?.audioTrackPublications?.size]);

  // Push-to-talk handlers
  const handlePressIn = () => {
    if (localParticipant) {
      const audioTracks = Array.from(localParticipant.audioTrackPublications.values());
      if (audioTracks.length > 0) {
        audioTracks[0].unmute();
        setIsTalking(true);
      }
    }
  };

  const handlePressOut = () => {
    if (localParticipant) {
      const audioTracks = Array.from(localParticipant.audioTrackPublications.values());
      if (audioTracks.length > 0) {
        audioTracks[0].mute();
        setIsTalking(false);
      }
    }
  };

  const selectedTrack = cameraTracks.find(t => t.participant.identity === selectedCamera);

  return (
    <>
      {/* Video o mensaje de espera */}
      {selectedTrack ? (
        <div className="video-container">
          <VideoTrack
            trackRef={selectedTrack}
            className="video-track"
          />
          
          {/* Overlay de visión nocturna */}
          {nightVision && (
            <div className="night-vision-overlay">
              <div className="night-vision-layer-1"></div>
              <div className="night-vision-layer-2"></div>
              <div className="night-vision-layer-3"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="waiting-container">
          <p className="waiting-text">Esperando transmisión de cámara...</p>
        </div>
      )}

      {/* Controles y UI - fuera del video container */}
      <div className="controls-overlay">
        {/* Botón de regreso */}
        <button className="back-button" onClick={() => navigate(`/group/${groupId}`, { replace: true })}>
          <MdArrowBack size={28} />
        </button>

        {/* Título con nombre del bebé */}
        {selectedCamera && (
          <div className="title-container">
            <span className="title-text">{selectedCamera.replace('camera-', '')}</span>
          </div>
        )}

        {/* Selector de cámaras */}
        {cameraParticipants.length > 1 && (
          <div className="camera-buttons-row">
            {cameraParticipants.map(identity => (
              <button
                key={identity}
                className={`camera-item ${selectedCamera === identity ? 'selected' : ''}`}
                onClick={() => setSelectedCamera(identity)}
              >
                {identity.replace('camera-', '')}
              </button>
            ))}
          </div>
        )}

        {/* Botones superiores derecha */}
        {selectedCamera && (
          <div className="top-right-buttons">
            {/* Botón visión nocturna */}
            <button
              className="icon-button"
              onClick={() => setNightVision(!nightVision)}
              title={nightVision ? 'Desactivar visión nocturna' : 'Activar visión nocturna'}
            >
              {nightVision ? <MdBrightness5 size={24} /> : <MdBrightness2 size={24} />}
            </button>
          </div>
        )}

        {/* Indicador de viewers hablando */}
        {speakingViewers.length > 0 && (
          <div className="speaking-indicator">
            <span className="speaking-text">
              {speakingViewers.length === 1
                ? `Hablando: ${speakingViewers[0].replace('viewer-', '')}`
                : `Hablando: ${speakingViewers.map(id => id.replace('viewer-', '')).join(', ')}`}
            </span>
          </div>
        )}

        {/* Controles inferiores */}
        <div className="controls-container">
          {/* Botón de chatbot/estadísticas - izquierda */}
          {selectedCamera && (
            <button
              className="floating-button agent-button"
              onClick={() => navigate(`/statistics/${groupId}/${selectedCamera.replace('camera-', '')}`, {
                state: { group, cameraName: selectedCamera.replace('camera-', '') }
              })}
              title="Chat con agente / Estadísticas"
            >
              <MdSupportAgent size={28} />
            </button>
          )}

          {/* Botón de hablar - centro */}
          {selectedCamera && (
            <button
              className={`floating-button talk-button ${isTalking ? 'active' : ''}`}
              onMouseDown={handlePressIn}
              onMouseUp={handlePressOut}
              onMouseLeave={handlePressOut}
              onTouchStart={handlePressIn}
              onTouchEnd={handlePressOut}
              title="Mantener presionado para hablar"
            >
              <MdMic size={32} color={isTalking ? '#fff' : '#45c3ec'} />
            </button>
          )}

          {/* Botón de audio - derecha */}
          {selectedCamera && (
            <button
              className="floating-button audio-button"
              onClick={() => {
                // TODO: Implementar reproducción de audio
                console.log('Play audio');
              }}
              title="Reproducir audio"
            >
              <MdMusicNote size={28} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Viewer;
