import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdMusicNote, MdDelete, MdAdd, MdPlayArrow, MdStop } from 'react-icons/md';
import SIGNALING_SERVER_URL from '../config/serverUrl';
import './AudioList.css';

const AudioList = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const group = location.state?.group;
  
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cargar audios al montar
  useEffect(() => {
    fetchAudios();
  }, [groupId]);

  const fetchAudios = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${SIGNALING_SERVER_URL}/audios`, {
        params: { room: groupId }
      });
      setAudios(res.data.audios || []);
    } catch (err) {
      console.error('Error cargando audios:', err);
      setError('Error al cargar audios');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea un archivo de audio
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('room', groupId);
      formData.append('fileName', file.name);

      const uploadRes = await axios.post(
        `${SIGNALING_SERVER_URL}/audios/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Refrescar lista
      if (uploadRes.data.audios) {
        setAudios(uploadRes.data.audios);
      } else {
        await fetchAudios();
      }

      alert('Audio subido correctamente');
    } catch (err) {
      console.error('Error subiendo audio:', err);
      alert('No se pudo subir el audio: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAudio = async (audio) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este audio?')) {
      return;
    }

    try {
      setLoading(true);
      
      const res = await axios.post(
        `${SIGNALING_SERVER_URL}/audios/delete`,
        { key: audio.key, room: groupId },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Refrescar lista
      if (res.data.audios) {
        setAudios(res.data.audios);
      } else {
        await fetchAudios();
      }

      // Si se estaba reproduciendo este audio, detenerlo
      if (playingAudio?.key === audio.key) {
        setPlayingAudio(null);
      }
    } catch (err) {
      console.error('Error eliminando audio:', err);
      alert('No se pudo eliminar el audio');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (audio) => {
    if (playingAudio?.key === audio.key) {
      // Si ya está reproduciéndose, pausar
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      // Reproducir este audio
      setPlayingAudio(audio);
    }
  };

  const getAudioName = (key) => {
    return key
      .replace(`audio/${groupId}/`, '')
      .replace(/\.[^/.]+$/, '');
  };

  if (loading && audios.length === 0) {
    return (
      <div className="audio-list-container">
        <div className="header-row">
          <button className="back-button" onClick={() => navigate(-1)}>
            <MdArrowBack size={28} />
          </button>
        </div>
        
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Cargando audios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audio-list-container">
        <div className="header-row">
          <button className="back-button" onClick={() => navigate(-1)}>
            <MdArrowBack size={28} />
          </button>
        </div>
        
        <div className="error-container">
          <p className="error-text">{error}</p>
          <button className="retry-button" onClick={fetchAudios}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="audio-list-container">
      {/* Header */}
      <div className="header-row">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={28} />
        </button>
      </div>

      <h1 className="page-title">Audios</h1>
      <p className="page-subtitle">{group?.name || 'Grupo'}</p>

      {/* Lista de audios */}
      <div className="audios-list">
        {audios.length === 0 ? (
          <div className="empty-state">
            <MdMusicNote size={64} color="#ccc" />
            <p className="empty-text">No hay audios disponibles</p>
            <p className="empty-subtext">Presiona + para subir un audio</p>
          </div>
        ) : (
          audios.map((audio) => (
            <div key={audio.key} className="audio-item-row">
              <button
                className={`audio-card ${playingAudio?.key === audio.key ? 'playing' : ''}`}
                onClick={() => handlePlayAudio(audio)}
              >
                <div className="audio-icon">
                  {playingAudio?.key === audio.key ? (
                    <MdStop size={32} />
                  ) : (
                    <MdPlayArrow size={32} />
                  )}
                </div>
                <div className="audio-info">
                  <p className="audio-name">{getAudioName(audio.key)}</p>
                  {playingAudio?.key === audio.key && (
                    <p className="audio-status">Reproduciendo...</p>
                  )}
                </div>
              </button>
              
              <button
                className="delete-button"
                onClick={() => handleDeleteAudio(audio)}
                disabled={loading}
              >
                <MdDelete size={24} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botón flotante para subir audio */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <button
        className={`fab ${uploading ? 'disabled' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <div className="spinner-small"></div>
        ) : (
          <MdAdd size={32} />
        )}
      </button>

      {/* Audio player oculto */}
      {playingAudio && (
        <audio
          ref={audioRef}
          src={playingAudio.url}
          autoPlay
          onEnded={() => setPlayingAudio(null)}
          onError={() => {
            setPlayingAudio(null);
            alert('No se pudo reproducir el audio');
          }}
        />
      )}
    </div>
  );
};

export default AudioList;
