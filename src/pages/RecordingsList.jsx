import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MdChevronLeft, MdExpandMore, MdExpandLess, MdPlayCircleOutline } from 'react-icons/md';
import axios from 'axios';
import './RecordingsList.css';

const API_URL = 'http://localhost:3001';

const RecordingsList = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const babyName = location.state?.babyName; // Opcional: filtrar por cámara específica

  const [recordingsByParticipant, setRecordingsByParticipant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadedVideos, setLoadedVideos] = useState({});
  const [expandedBabies, setExpandedBabies] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  // Función para formatear la fecha y hora
  const formatDateTime = (dateString, timeString) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const [year, month, day] = dateString.split('-');
    const monthName = months[parseInt(month) - 1];
    
    // Reemplazar guiones bajos con dos puntos (hh_mm_ss -> hh:mm:ss)
    const formattedTime = timeString.replace(/_/g, ':');
    
    return `${parseInt(day)} de ${monthName} de ${year} a las ${formattedTime}`;
  };

  // Función para agrupar grabaciones por mes y año
  const groupRecordingsByMonth = (recordings) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const grouped = {};
    
    recordings.forEach(rec => {
      const [year, month] = rec.date.split('-');
      const monthName = months[parseInt(month) - 1];
      const key = `${month}-${year}`; // Formato: "02-2025"
      
      if (!grouped[key]) {
        grouped[key] = {
          displayName: `${monthName} de ${year}`, // Formato: "Febrero de 2025"
          recordings: []
        };
      }
      grouped[key].recordings.push(rec);
    });

    // Ordenar por fecha (más reciente primero)
    Object.keys(grouped).forEach(key => {
      grouped[key].recordings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time.replace(/_/g, ':'));
        const dateB = new Date(b.date + ' ' + b.time.replace(/_/g, ':'));
        return dateB - dateA;
      });
    });

    return grouped;
  };

  const toggleBaby = (babyName) => {
    setExpandedBabies(prev => ({
      ...prev,
      [babyName]: !prev[babyName]
    }));
  };

  const toggleMonth = (babyName, monthKey) => {
    const key = `${babyName}-${monthKey}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/recordings?room=${groupId}`);
        let recordings = response.data.recordingsByParticipant || [];
        
        // Si se recibe babyName, filtrar solo las grabaciones de ese bebé
        if (babyName) {
          recordings = recordings.filter(item => {
            const participantName = item.participant.replace("camera-", "");
            return participantName === babyName;
          });
        }
        
        setRecordingsByParticipant(recordings);
      } catch (err) {
        console.error('Error loading recordings:', err);
        setError('Error cargando grabaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, [groupId, babyName]);

  const handleSelect = (recording) => {
    navigate(`/recording/${groupId}`, { state: { recording } });
  };

  const handleGoBack = () => {
    navigate(`/group/${groupId}`, { replace: true });
  };

  return (
    <div className="recordings-list-container">
      {/* Header */}
      <div className="recordings-header">
        <button className="back-button" onClick={handleGoBack}>
          <MdChevronLeft size={32} />
        </button>
        <h1 className="recordings-title">
          {babyName ? `Grabaciones de ${babyName}` : 'Grabaciones'}
        </h1>
      </div>

      {/* Content */}
      <div className="recordings-content">
        {loading ? (
          <div className="recordings-center">
            <div className="recordings-spinner"></div>
            <p>Cargando grabaciones...</p>
          </div>
        ) : error ? (
          <div className="recordings-center">
            <p className="recordings-error">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        ) : recordingsByParticipant.length === 0 ? (
          <div className="recordings-center">
            <p className="recordings-empty">No hay grabaciones disponibles</p>
          </div>
        ) : (
          <div className="recordings-scroll">
            {recordingsByParticipant.map((participantData) => {
              const babyDisplayName = participantData.participant.replace("camera-", "");
              const isBabyExpanded = expandedBabies[babyDisplayName];
              const groupedByMonth = groupRecordingsByMonth(participantData.recordings);

              return (
                <div key={participantData.participant} className="participant-section">
                  {/* Acordeón del bebé */}
                  {!babyName && (
                    <button
                      className="accordion-header"
                      onClick={() => toggleBaby(babyDisplayName)}
                    >
                      <span className="baby-name">{babyDisplayName}</span>
                      {isBabyExpanded ? <MdExpandLess size={24} /> : <MdExpandMore size={24} />}
                    </button>
                  )}

                  {/* Contenido expandible del bebé */}
                  {(babyName || isBabyExpanded) && (
                    <div className="accordion-content">
                      {Object.entries(groupedByMonth).map(([monthKey, monthData]) => {
                        const monthExpandKey = `${babyDisplayName}-${monthKey}`;
                        const isMonthExpanded = expandedMonths[monthExpandKey];

                        return (
                          <div key={monthKey} className="month-section">
                            {/* Acordeón del mes */}
                            <button
                              className="month-header"
                              onClick={() => toggleMonth(babyDisplayName, monthKey)}
                            >
                              <span className="month-name">{monthData.displayName}</span>
                              {isMonthExpanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                            </button>

                            {/* Contenido expandible del mes */}
                            {isMonthExpanded && (
                              <div className="month-content">
                                {monthData.recordings.map((recording) => (
                                  <div
                                    key={recording.key}
                                    className="recording-card"
                                    onClick={() => handleSelect(recording)}
                                  >
                                    {/* Video thumbnail */}
                                    <div className="thumbnail-container">
                                      <video
                                        className={`video-thumbnail ${loadedVideos[recording.key] ? 'loaded' : ''}`}
                                        src={recording.playlistUrl}
                                        muted
                                        preload="metadata"
                                        onLoadedData={() => setLoadedVideos(prev => ({ ...prev, [recording.key]: true }))}
                                      />
                                      {!loadedVideos[recording.key] && (
                                        <div className="video-placeholder"></div>
                                      )}
                                      {/* Play overlay */}
                                      <div className="play-overlay">
                                        <MdPlayCircleOutline size={56} color="#FFFFFF" />
                                      </div>
                                    </div>
                                    
                                    {/* Recording info */}
                                    <div className="recording-info">
                                      <p className="recording-date">
                                        {formatDateTime(recording.date, recording.time)}
                                      </p>
                                      {recording.duration && (
                                        <p className="recording-duration">
                                          Duración: {recording.duration}s
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingsList;
