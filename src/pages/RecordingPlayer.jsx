import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdChevronLeft } from 'react-icons/md';
import './RecordingPlayer.css';

const RecordingPlayer = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { recording, recordingUrl, eventType, babyName, eventDate, userName } = location.state || {};
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determinar el origen de los datos
  const isFromNotification = !!recordingUrl;
  const isFromRecordingsList = !!recording;

  // Extraer la URL del video según el origen
  let videoUrl = null;
  let titleText = '';
  let subtitleText = '';

  if (isFromNotification && recordingUrl) {
    // Viene desde una notificación
    videoUrl = recordingUrl;
    titleText = `Evento: ${eventType || 'Detección'}`;
    
    if (babyName) {
      subtitleText = `${babyName}`;
    }
    
    if (eventDate) {
      const date = new Date(eventDate);
      const formattedDate = date.toLocaleDateString();
      const formattedTime = date.toLocaleTimeString();
      subtitleText += subtitleText ? ` - ${formattedDate} ${formattedTime}` : `${formattedDate} ${formattedTime}`;
    }
  } else if (isFromRecordingsList && recording?.playlistUrl) {
    // Viene desde la lista de grabaciones
    videoUrl = recording.playlistUrl;
    
    // Formatear fecha y hora igual que en RecordingsList
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const [year, month, day] = recording.date.split('-');
    const monthName = months[parseInt(month) - 1];
    const formattedTime = recording.time.replace(/_/g, ':');
    
    titleText = `${parseInt(day)} de ${monthName} de ${year} a las ${formattedTime}`;
    
    if (recording.duration) {
      subtitleText = `Duración: ${recording.duration}s`;
    }
  }

  console.log('[RecordingPlayer] Origen:', isFromNotification ? 'Notificación' : 'Lista');
  console.log('[RecordingPlayer] Video URL:', videoUrl);
  console.log('[RecordingPlayer] Params:', location.state);

  const handleGoBack = () => {
    navigate(`/recordings/${groupId}`, { replace: true });
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
  };

  const handleGoLive = () => {
    // Navegar al viewer en vivo
    const userNameToUse = userName || 'anonimo';
    console.log('[RecordingPlayer] Navegando a Viewer con groupId:', groupId, 'userName:', userNameToUse);
    navigate(`/group/${groupId}`);
  };

  // Si no hay URL válida, mostrar error
  if (!videoUrl) {
    return (
      <div className="recording-player-container">
        <div className="player-header">
          <button className="back-button" onClick={handleGoBack}>
            <MdChevronLeft size={32} />
          </button>
        </div>
        <div className="error-container">
          <h2 className="error-title">No hay grabación disponible</h2>
          <p className="error-text">
            La grabación no está disponible o no se pudo encontrar.
          </p>
          <button className="error-button" onClick={handleGoBack}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recording-player-container">
      <div className="player-header">
        <button className="back-button" onClick={handleGoBack}>
          <MdChevronLeft size={32} />
        </button>
      </div>

      <div className="player-content">
        {/* Título */}
        <h1 className="player-title">{titleText}</h1>
        {subtitleText && <p className="player-subtitle">{subtitleText}</p>}

        {/* Video player */}
        <div className="video-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p className="loading-text">Cargando grabación...</p>
            </div>
          )}
          
          {error && (
            <div className="loading-overlay">
              <p className="error-text">Error al cargar el video</p>
              <button className="retry-button" onClick={handleRetry}>
                Reintentar
              </button>
            </div>
          )}

          <video
            className="video-player"
            src={videoUrl}
            controls
            autoPlay
            onLoadStart={() => {
              console.log('[Video] Cargando...');
              setLoading(true);
            }}
            onLoadedData={() => {
              console.log('[Video] Cargado exitosamente');
              setLoading(false);
              setError(false);
            }}
            onError={(e) => {
              console.error('[Video] Error:', e);
              setLoading(false);
              setError(true);
            }}
          />
        </div>

        {/* Acción para ver en vivo (si viene de notificación) */}
        {isFromNotification && groupId && (
          <div className="actions-container">
            <p className="action-hint">¿Quieres ver al bebé en vivo?</p>
            <button className="live-button" onClick={handleGoLive}>
              Ver en vivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingPlayer;
