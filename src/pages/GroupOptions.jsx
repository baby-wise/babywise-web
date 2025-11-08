import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { groupService } from '../services/apiService';
import { auth } from '../config/firebase';
import CameraThumbnailPreview from '../components/CameraThumbnailPreview';
import { 
  MdArrowBack, 
  MdSettings, 
  MdPersonAdd, 
  MdAdd, 
  MdBarChart, 
  MdPlayArrow,
  MdVideocamOff,
  MdAccountCircle,
  MdPersonRemove,
  MdRefresh
} from 'react-icons/md';
import './GroupOptions.css';

const GroupOptions = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const groupFromState = location.state?.group;

  // Estados principales
  const [group, setGroup] = useState(groupFromState || null);
  const [fetchedCameras, setFetchedCameras] = useState([]);
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para modales
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCameraNameModal, setShowCameraNameModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showCameraOptionsModal, setShowCameraOptionsModal] = useState(false);
  
  // Estados para código de invitación
  const [inviteCode, setInviteCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  // Estados para nombre de cámara
  const [cameraName, setCameraName] = useState('');
  
  // Estados para settings
  const [cryingDetection, setCryingDetection] = useState(false);
  const [audioVideoRecording, setAudioVideoRecording] = useState(false);
  const [motionDetection, setMotionDetection] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Estados para miembros
  const [groupMembers, setGroupMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserUID, setCurrentUserUID] = useState(null);
  
  // Estados para cámara seleccionada
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  
  // Estados para toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Estado para runtime status de cámaras
  const [camerasRuntimeStatus, setCamerasRuntimeStatus] = useState({});

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('[GroupOptions] Component mounted', { groupId, groupFromState });
    
    const initializeData = async () => {
      if (!groupId) return;
      
      // Esperar a que el usuario esté autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('[GroupOptions] Waiting for authentication...');
        // Esperar un momento para que Firebase Auth se inicialice
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryUser = auth.currentUser;
        if (!retryUser) {
          console.error('[GroupOptions] User not authenticated');
          navigate('/groups');
          return;
        }
      }
      
      if (!groupFromState) {
        console.log('[GroupOptions] Fetching group data...');
        await fetchGroupData();
      } else {
        console.log('[GroupOptions] Group from state:', groupFromState);
      }
      
      // Cargar datos en paralelo
      await Promise.all([
        loadGroupSettings(),
        fetchCamerasFromBackend(),
        checkIfUserIsAdmin()
      ]);
      
      getCurrentUserUID();
    };
    
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, location.key]);

  // Función para obtener datos del grupo si no vino por state
  const fetchGroupData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      const groups = await groupService.getUserGroups(currentUser.uid);
      const foundGroup = groups.find(g => String(g._id) === String(groupId));
      if (foundGroup) {
        setGroup(foundGroup);
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  // Función para obtener cámaras del backend
  const fetchCamerasFromBackend = async () => {
    setIsLoadingCameras(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('[GroupOptions] Cannot fetch cameras: user not authenticated');
        setFetchedCameras(groupFromState?.cameras || []);
        return;
      }
      
      const groups = await groupService.getUserGroups(currentUser.uid);
      const found = Array.isArray(groups) 
        ? groups.find(g => String(g._id) === String(groupId)) 
        : null;
      
      if (found && found.cameras) {
        setFetchedCameras(found.cameras);
      } else if (groupFromState && groupFromState.cameras) {
        setFetchedCameras(groupFromState.cameras);
      } else {
        setFetchedCameras([]);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setFetchedCameras(groupFromState?.cameras || []);
    } finally {
      setIsLoadingCameras(false);
    }
  };

  // Verificar si el usuario es admin
  const checkIfUserIsAdmin = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('[GroupOptions] Cannot check admin: user not authenticated');
        return;
      }

      const response = await groupService.isAdmin(currentUser.uid, groupId);
      setIsAdmin(response.message === "Is admin");
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Obtener UID del usuario actual
  const getCurrentUserUID = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserUID(currentUser.uid);
    }
  };

  // Cargar configuraciones del grupo
  const loadGroupSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('[GroupOptions] Cannot load settings: user not authenticated');
        return;
      }
      
      const settings = await groupService.getGroupSettings(groupId);
      setCryingDetection(settings.cryDetection);
      setAudioVideoRecording(settings.audioVideoRecording);
      setMotionDetection(settings.motionDetection);
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.response?.status === 401) {
        console.error('[GroupOptions] Authentication error, redirecting to login');
        navigate('/groups');
      } else {
        alert('No se pudieron cargar las configuraciones');
      }
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Guardar configuraciones del grupo
  const saveGroupSettings = async () => {
    setIsSavingSettings(true);
    try {
      await groupService.updateGroupSettings(groupId, {
        cryDetection: cryingDetection,
        audioVideoRecording: audioVideoRecording,
        motionDetection: motionDetection
      });
      
      showSuccessToast('Configuración guardada correctamente');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      
      if (error.response?.status === 403) {
        alert('Solo los administradores pueden cambiar la configuración');
      } else {
        alert('No se pudo guardar la configuración');
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Obtener miembros del grupo
  const fetchGroupMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const groups = await groupService.getUserGroups(currentUser.uid);
      const currentGroup = groups.find(g => String(g._id) === String(groupId));
      
      if (currentGroup && currentGroup.users) {
        const members = currentGroup.users.map(userObj => userObj.user);
        setGroupMembers(members);
      } else {
        setGroupMembers([]);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      alert('No se pudo cargar la lista de miembros');
      setGroupMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Eliminar miembro del grupo
  const handleRemoveMember = async (member) => {
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar miembros');
      return;
    }

    if (member.UID === currentUserUID) {
      alert('No puedes eliminarte a ti mismo del grupo');
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${member.email} del grupo?`)) {
      try {
        await groupService.removeMember(member.UID, groupId);
        showSuccessToast('Miembro eliminado correctamente');
        await fetchGroupMembers();
      } catch (error) {
        console.error('Error removing member:', error);
        alert(`No se pudo eliminar al miembro: ${error.response?.data?.error || error.message}`);
      }
    }
  };

  // Generar código de invitación
  const generateInviteCode = async () => {
    setIsGeneratingCode(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const code = await groupService.getInviteCode(groupId);
      setInviteCode(code);
      showSuccessToast('Código de invitación generado');
    } catch (error) {
      console.error('Error generating invite code:', error);
      alert('No se pudo generar el código de invitación');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Manejar nombre de cámara
  const handleCameraName = async () => {
    if (!cameraName.trim()) {
      alert('Por favor ingresa un nombre para la cámara');
      return;
    }
    
    try {
      await groupService.addCamera(groupId, cameraName.trim());
      const trimmedName = cameraName.trim();
      setShowCameraNameModal(false);
      setCameraName('');
      
      // Navegar a la pantalla de cámara
      navigate(`/camera/${groupId}/${trimmedName}`, { state: { group } });
      
      showSuccessToast('Cámara agregada correctamente');
      await fetchCamerasFromBackend();
    } catch (error) {
      console.error('Error adding camera:', error);
      alert('No se pudo agregar la cámara');
    }
  };

  // Refrescar cámaras
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCamerasFromBackend();
    setRefreshing(false);
  };

  // Mostrar toast
  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Abrir modal de agregar miembro
  const addMembers = () => {
    setShowAddMemberModal(true);
    generateInviteCode();
  };

  // Abrir modal de miembros
  const openMembersModal = async () => {
    setShowMembersModal(true);
    await fetchGroupMembers();
  };

  // Copiar código al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    showSuccessToast('Código copiado al portapapeles');
  };

  // Manejar cuando una cámara se desconecta
  const handleCameraDisconnected = (cameraId) => {
    console.log('[GroupOptions] Cámara desconectada:', cameraId);
    setCamerasRuntimeStatus(prev => ({
      ...prev,
      [cameraId]: 'OFFLINE'
    }));
  };

  // Manejar click en cámara (para abrir menú de opciones)
  const handleCameraClick = (event, camera) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Calcular posición del modal
    const modalWidth = 200;
    const modalHeight = 220;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let x = rect.left + rect.width / 2 - modalWidth / 2;
    let y = rect.top + rect.height / 2 - modalHeight / 2;
    
    // Ajustar si se sale de la pantalla
    if (x + modalWidth > windowWidth - 20) {
      x = windowWidth - modalWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }
    if (y + modalHeight > windowHeight - 20) {
      y = windowHeight - modalHeight - 20;
    }
    if (y < 20) {
      y = 20;
    }
    
    setModalPosition({ x, y });
    setSelectedCamera(camera);
    setShowCameraOptionsModal(true);
  };

  console.log('[GroupOptions] Rendering with group:', group);

  if (!group) {
    return (
      <div className="group-options-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando grupo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-options-container">
      {/* Header */}
      <div className="header-row">
        <button className="back-button" onClick={() => navigate('/groups')}>
          <MdArrowBack size={28} />
        </button>

        <div className="header-actions">
          <button className="icon-button" onClick={addMembers}>
            <MdPersonAdd size={28} />
          </button>
          <button className="icon-button" onClick={() => setShowSettingsModal(true)}>
            <MdSettings size={28} />
          </button>
        </div>
      </div>

      <div className="header-info-centered" onClick={openMembersModal}>
        <h1 className="group-title">{group.name}</h1>
        <p className="group-subtitle">{group.members || 0} miembros</p>
      </div>

      {/* Título de cámaras con botón de refresh */}
      <div className="section-header">
        <h2 className="section-title">Cámaras</h2>
        <button 
          className={`refresh-button ${refreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={refreshing}
        >
          <MdRefresh size={24} />
        </button>
      </div>

      {/* Lista de cámaras */}
      <div className="camera-list-container">
        {isLoadingCameras ? (
          <div className="no-camera-card">
            <div className="spinner"></div>
          </div>
        ) : fetchedCameras && fetchedCameras.length > 0 ? (
          fetchedCameras.map((cam, idx) => {
            const cameraId = cam._id || cam.user || idx;
            const runtimeStatus = camerasRuntimeStatus[cameraId];
            const effectiveStatus = runtimeStatus || cam.status;
            const isCurrentlyOnline = effectiveStatus === 'ONLINE';

            return (
              <div 
                key={cameraId} 
                className="camera-card-vertical"
                onClick={(e) => handleCameraClick(e, cam)}
              >
                <div className="camera-avatar-vertical">
                  {isCurrentlyOnline ? (
                    <>
                      <CameraThumbnailPreview
                        roomId={group._id || groupId}
                        cameraName={cam.name}
                        isOnline={true}
                        onDisconnected={() => handleCameraDisconnected(cameraId)}
                      />
                      <div className="live-badge">
                        <div className="live-indicator"></div>
                        <span className="live-text">EN VIVO</span>
                      </div>
                    </>
                  ) : (
                    <div className="offline-icon-container">
                      <MdVideocamOff size={48} color="#94A3B8" />
                    </div>
                  )}
                </div>
                
                <div className="camera-info">
                  <h3 className="camera-name-vertical">{cam.name || `Cámara ${idx + 1}`}</h3>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-camera-card">
            <p className="no-camera-text">No hay cámaras añadidas</p>
          </div>
        )}
      </div>

      {/* Barra de navegación inferior */}
      <div className="bottom-nav-bar">
        <button 
          className="nav-button"
          onClick={() => {/* navigate to statistics */}}
        >
          <MdBarChart size={32} color="#666" />
        </button>

        <button 
          className="nav-button-center"
          onClick={() => setShowCameraNameModal(true)}
        >
          <div className="nav-icon-container-center">
            <MdAdd size={40} color="#fff" />
          </div>
        </button>

        <button 
          className="nav-button"
          onClick={() => setShowMediaModal(!showMediaModal)}
        >
          <MdPlayArrow size={32} color="#666" />
        </button>
      </div>

      {/* Menú de Media */}
      {showMediaModal && (
        <div className="media-menu-container">
          <button
            className="media-menu-option"
            onClick={() => {
              setShowMediaModal(false);
              navigate(`/audios/${groupId}`, {
                state: { group }
              });
            }}
          >
            <span className="media-menu-text">Audios</span>
          </button>
          
          <button
            className="media-menu-option last"
            onClick={() => {
              setShowMediaModal(false);
              navigate(`/recordings/${groupId}`);
            }}
          >
            <span className="media-menu-text">Grabaciones</span>
          </button>
        </div>
      )}

      {/* Modal para agregar miembro */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Código de Invitación</h2>
            
            <p className="modal-description">
              Comparte este código con la persona que deseas agregar al grupo:
            </p>
            
            {isGeneratingCode ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Generando código...</p>
              </div>
            ) : (
              <div className="code-container">
                <p className="invite-code">{inviteCode}</p>
                <button className="copy-button" onClick={copyToClipboard}>
                  Copiar
                </button>
              </div>
            )}
            
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => setShowAddMemberModal(false)}
              >
                Cerrar
              </button>
              
              <button 
                className="modal-button add-button" 
                onClick={generateInviteCode}
                disabled={isGeneratingCode}
              >
                {isGeneratingCode ? <div className="spinner small"></div> : 'Nuevo Código'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nombre de cámara */}
      {showCameraNameModal && (
        <div className="modal-overlay" onClick={() => setShowCameraNameModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Nombre del Bebé</h2>
            <input
              type="text"
              className="modal-input"
              value={cameraName}
              onChange={(e) => setCameraName(e.target.value)}
              placeholder="Ingresa el nombre"
              autoFocus
            />
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => setShowCameraNameModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-button add-button" 
                onClick={handleCameraName}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Settings */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Configuración</h2>
            
            {isLoadingSettings ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Cargando configuración...</p>
              </div>
            ) : (
              <>
                <div className="setting-item">
                  <span className="setting-label">Detección de llanto</span>
                  <button 
                    className={`toggle ${cryingDetection ? 'active' : ''}`}
                    onClick={() => isAdmin && setCryingDetection(!cryingDetection)}
                    disabled={isSavingSettings || !isAdmin}
                  >
                    <div className={`toggle-circle ${cryingDetection ? 'active' : ''}`} />
                  </button>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Grabación de audio y video</span>
                  <button 
                    className={`toggle ${audioVideoRecording ? 'active' : ''}`}
                    onClick={() => isAdmin && setAudioVideoRecording(!audioVideoRecording)}
                    disabled={isSavingSettings || !isAdmin}
                  >
                    <div className={`toggle-circle ${audioVideoRecording ? 'active' : ''}`} />
                  </button>
                </div>
                
                <div className="setting-item">
                  <span className="setting-label">Detección de movimiento</span>
                  <button 
                    className={`toggle ${motionDetection ? 'active' : ''}`}
                    onClick={() => isAdmin && setMotionDetection(!motionDetection)}
                    disabled={isSavingSettings || !isAdmin}
                  >
                    <div className={`toggle-circle ${motionDetection ? 'active' : ''}`} />
                  </button>
                </div>
              </>
            )}
            
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => setShowSettingsModal(false)}
                disabled={isSavingSettings}
              >
                {isAdmin ? 'Cancelar' : 'Cerrar'}
              </button>
              
              {isAdmin && (
                <button 
                  className="modal-button add-button" 
                  onClick={saveGroupSettings}
                  disabled={isSavingSettings || isLoadingSettings}
                >
                  {isSavingSettings ? <div className="spinner small"></div> : 'Guardar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de miembros */}
      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Miembros del Grupo</h2>
            
            {isLoadingMembers ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Cargando miembros...</p>
              </div>
            ) : (
              <div className="members-list-container">
                {groupMembers.length > 0 ? (
                  groupMembers.map((member, index) => {
                    const isCurrentUser = member.UID === currentUserUID;
                    return (
                      <div key={member._id || index} className="member-item">
                        <div className="member-info">
                          <MdAccountCircle size={24} color="#64748B" />
                          <div className="member-text-container">
                            <span className="member-email">{member.email}</span>
                            {isCurrentUser && (
                              <span className="current-user-label">(Tú)</span>
                            )}
                          </div>
                        </div>
                        {isAdmin && !isCurrentUser && (
                          <button
                            className="remove-button"
                            onClick={() => handleRemoveMember(member)}
                          >
                            <MdPersonRemove size={24} color="#DC2626" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-members-container">
                    <p className="no-members-text">No hay miembros en este grupo</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="modal-buttons">
              <button 
                className="modal-button cancel-button" 
                onClick={() => setShowMembersModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de opciones de cámara */}
      {showCameraOptionsModal && (
        <>
          <div 
            className="camera-options-overlay"
            onClick={() => setShowCameraOptionsModal(false)}
          />
          
          <div 
            className="camera-options-container" 
            style={{ top: `${modalPosition.y}px`, left: `${modalPosition.x}px` }}
          >
            <button
              className="camera-option-button"
              onClick={() => {
                setShowCameraOptionsModal(false);
                navigate(`/viewer/${groupId}/${selectedCamera?.name || 'camera'}`, {
                  state: { 
                    group, 
                    userName: auth.currentUser?.email?.split('@')[0] || 'viewer',
                    cameraName: selectedCamera?.name 
                  }
                });
              }}
            >
              Ver en vivo
            </button>
            
            <button
              className="camera-option-button"
              onClick={() => {
                setShowCameraOptionsModal(false);
                navigate(`/camera/${groupId}/${selectedCamera?.name}`, { state: { group } });
              }}
            >
              Grabar en vivo
            </button>
            
            <button
              className="camera-option-button"
              onClick={() => {
                setShowCameraOptionsModal(false);
                navigate(`/recordings/${groupId}`, { state: { babyName: selectedCamera } });
              }}
            >
              Ver grabaciones
            </button>
            
            <button
              className="camera-option-button last"
              onClick={() => {
                setShowCameraOptionsModal(false);
                // navigate to statistics
              }}
            >
              Ver estadísticas
            </button>
          </div>
        </>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast-container">
          <p className="toast-text">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default GroupOptions;
