import React, { useEffect, useState, useRef } from 'react';
import { LiveKitRoom, useTracks, VideoTrack, useRemoteParticipants } from '@livekit/components-react';
import { Track } from 'livekit-client';
import axios from 'axios';
import SIGNALING_SERVER_URL from '../config/serverUrl';
import './CameraThumbnailPreview.css';

// Componente que renderiza el video de la cámara
const VideoRenderer = ({ cameraName, onParticipantDisconnected, onConnectionError }) => {
  const remoteParticipants = useRemoteParticipants();
  const [hasNotifiedDisconnect, setHasNotifiedDisconnect] = useState(false);
  const [hasSeenParticipant, setHasSeenParticipant] = useState(false);
  const connectionTimeoutRef = useRef(null);

  // Buscar el participante que corresponde a esta cámara
  const cameraParticipant = remoteParticipants.find(p => 
    p.identity === `camera-${cameraName}`
  );

  // Timeout de conexión: si no vemos al participante en 10 segundos, hay un problema
  useEffect(() => {
    if (!hasSeenParticipant && !connectionTimeoutRef.current) {
      connectionTimeoutRef.current = setTimeout(() => {
        if (!hasSeenParticipant) {
          console.log('[CameraThumbnail] Timeout esperando participante:', cameraName);
          onConnectionError?.();
        }
      }, 10000);
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [hasSeenParticipant, cameraName, onConnectionError]);

  // Marcar que hemos visto al participante al menos una vez
  useEffect(() => {
    if (cameraParticipant && !hasSeenParticipant) {
      setHasSeenParticipant(true);
      // Limpiar timeout si finalmente apareció
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Suscribirse SOLO al video, NO al audio
      const videoPublications = Array.from(cameraParticipant.videoTrackPublications.values());
      videoPublications.forEach(publication => {
        if (!publication.isSubscribed) {
          publication.setSubscribed(true);
          console.log('[CameraThumbnail] Suscrito a video track:', cameraName);
        }
      });
      
      // Asegurarse de NO suscribirse al audio
      const audioPublications = Array.from(cameraParticipant.audioTrackPublications.values());
      audioPublications.forEach(publication => {
        if (publication.isSubscribed) {
          publication.setSubscribed(false);
          console.log('[CameraThumbnail] Desuscrito de audio track:', cameraName);
        }
      });
    }
  }, [cameraParticipant, hasSeenParticipant, cameraName]);

  // Detectar cuando el participante se desconecta (solo si lo vimos antes)
  useEffect(() => {
    if (!cameraParticipant && hasSeenParticipant && !hasNotifiedDisconnect) {
      console.log('[CameraThumbnail] Participante desconectado:', cameraName);
      setHasNotifiedDisconnect(true);
      // Pequeño delay para evitar race conditions
      setTimeout(() => {
        onParticipantDisconnected?.();
      }, 500);
    }
  }, [cameraParticipant, hasSeenParticipant, hasNotifiedDisconnect, cameraName, onParticipantDisconnected]);

  // Obtener el video track de la cámara
  const videoPublication = Array.from(cameraParticipant?.videoTrackPublications?.values() || [])[0];

  if (!videoPublication || !videoPublication.track) {
    return (
      <div className="thumbnail-loading-container">
        <div className="spinner-small"></div>
      </div>
    );
  }

  // Crear el trackRef en el formato que espera VideoTrack
  const trackRef = {
    participant: cameraParticipant,
    source: Track.Source.Camera,
    publication: videoPublication,
  };

  return (
    <div className="thumbnail-video-container">
      <VideoTrack
        trackRef={trackRef}
        className="thumbnail-video-track"
      />
    </div>
  );
};

/**
 * Componente que muestra el stream en vivo de una cámara como thumbnail
 */
const CameraThumbnailPreview = ({ roomId, cameraName, isOnline, onDisconnected }) => {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  const wsUrl = 'wss://babywise-jqbqqsgq.livekit.cloud';

  useEffect(() => {
    let isMounted = true;

    const fetchToken = async () => {
      if (!isOnline) {
        return;
      }

      try {
        const res = await axios.get(`${SIGNALING_SERVER_URL}/getToken`, {
          params: {
            roomName: roomId,
            participantName: `thumbnail-viewer-${cameraName}-${Date.now()}`,
          },
        });
        
        if (isMounted) {
          setToken(res.data.token);
          setError(false);
        }
      } catch (err) {
        console.error('[CameraThumbnail] Error obteniendo token:', err);
        if (isMounted) {
          setError(true);
        }
      }
    };

    fetchToken();

    return () => {
      isMounted = false;
    };
  }, [roomId, cameraName, isOnline]);

  const handleParticipantDisconnected = () => {
    console.log('[CameraThumbnail] Cámara desconectada, notificando al padre...');
    // Pequeño delay antes de cambiar el estado para evitar problemas con LiveKit
    setTimeout(() => {
      setIsConnected(false);
      onDisconnected?.();
    }, 100);
  };

  const handleConnectionError = () => {
    console.log('[CameraThumbnail] Error de conexión o timeout, tratando como desconectada');
    setConnectionFailed(true);
    setTimeout(() => {
      setIsConnected(false);
      onDisconnected?.();
    }, 100);
  };

  if (!isOnline || !isConnected || connectionFailed) {
    return null;
  }

  if (!token && !error) {
    return (
      <div className="thumbnail-loading-container">
        <div className="spinner-small"></div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <LiveKitRoom
      serverUrl={wsUrl}
      token={token}
      connect={true}
      audio={false}
      video={false}
      options={{
        adaptiveStream: { pixelDensity: 0.3 },
      }}
      connectOptions={{
        autoSubscribe: false,
      }}
      onError={(error) => {
        console.error('[CameraThumbnail] Error de LiveKit:', error);
        handleConnectionError();
      }}
      onConnected={() => {
        console.log('[CameraThumbnail] Conectado a LiveKit, suscripciones manuales');
      }}
    >
      <VideoRenderer 
        cameraName={cameraName}
        onParticipantDisconnected={handleParticipantDisconnected}
        onConnectionError={handleConnectionError}
      />
    </LiveKitRoom>
  );
};

export default CameraThumbnailPreview;
