import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../config/firebase'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { groupService, userService } from '../services/apiService'
import './HomeGroups.css'

const HomeGroups = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayEmail, setDisplayEmail] = useState(null)
  const [groups, setGroups] = useState([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  
  // Estados para unirse a grupo
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [isJoiningGroup, setIsJoiningGroup] = useState(false)
  
  // Estado para menú de perfil
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  // Estado para menú de opciones del botón +
  const [showAddMenu, setShowAddMenu] = useState(false)
  
  // Estados para configuración de usuario
  const [showUserSettingsModal, setShowUserSettingsModal] = useState(false)
  const [userSettings, setUserSettings] = useState({ allowNotifications: true })
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    // Verificar si hay un usuario ya autenticado
    checkCurrentUser()
  }, [])

  // Función para crear usuario en el backend si no existe
  const createUserIfNeeded = async (userEmail, uid) => {
    try {
      console.log('Checking/creating user in backend:', { userEmail, uid })
      
      const userData = {
        user: {
          email: userEmail,
          UID: uid
        }
      }
      
      await userService.createUser(userData)
      console.log('User created/verified in backend successfully')
    } catch (error) {
      console.log('User creation response:', error.message)
      if (!error.message?.includes('duplicate') && !error.message?.includes('exists')) {
        console.error('Error creating user in backend:', error)
      }
    }
  }

  // Función para cargar grupos del usuario
  const loadUserGroups = async (userEmail, uid) => {
    setIsLoadingGroups(true)
    try {
      if (!uid) {
        setGroups([])
        return
      }

      // Crear/verificar usuario en el backend primero
      await createUserIfNeeded(userEmail, uid)

      // Obtener grupos del usuario usando el UID de Firebase
      const userGroups = await groupService.getUserGroups(uid)
      
      // Transformar los datos del backend al formato esperado por el frontend
      const formattedGroups = userGroups.map((group, index) => ({
        id: group._id || group.id || `group-${index}`,
        name: group.name,
        members: group.users ? group.users.length : 0,
        _id: group._id
      }))
      
      setGroups(formattedGroups)
    } catch (error) {
      console.error('Error loading user groups:', error)
      setGroups([])
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const checkCurrentUser = () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true)
        setDisplayEmail(user.email)
        console.log('User already signed in:', user.email)
        await loadUserGroups(user.email, user.uid)
      } else {
        setIsLoggedIn(false)
        setDisplayEmail(null)
        setGroups([])
        console.log('No user currently signed in')
      }
    })
    return unsubscribe
  }

  const signIn = async () => {
    if (!isLoggedIn) {
      setIsLoading(true)
      try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        
        setIsLoggedIn(true)
        setDisplayEmail(result.user.email)
        console.log('Sign in successful:', result.user.email)
        
        await loadUserGroups(result.user.email, result.user.uid)
      } catch (error) {
        console.log('Sign in error:', error)
        setIsLoggedIn(false)
        
        if (error.code === 'auth/popup-closed-by-user') {
          console.log('User closed the popup')
        } else if (error.code === 'auth/cancelled-popup-request') {
          console.log('Popup request cancelled')
        } else {
          alert(`Error al iniciar sesión: ${error.message}`)
        }
      }
      setIsLoading(false)
    } else {
      // Sign out
      setIsLoading(true)
      try {
        await signOut(auth)
        setDisplayEmail(null)
        setIsLoggedIn(false)
        setGroups([])
        console.log('Sign out successful')
      } catch (error) {
        console.error('Sign out error:', error)
        setDisplayEmail(null)
        setIsLoggedIn(false)
        setGroups([])
      }
      setIsLoading(false)
    }
  }

  // Función para mostrar toast
  const showSuccessToast = (message) => {
    setToastMessage(message)
    setShowToast(true)
    
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // Función para crear un nuevo grupo
  const createNewGroup = async (groupName) => {
    setIsCreatingGroup(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      const isConnected = await groupService.testConnection()
      if (!isConnected) {
        throw new Error('No se puede conectar al servidor. Verifica tu conexión.')
      }

      const newGroup = await groupService.createGroup(currentUser.uid, groupName)
      
      const formattedGroup = {
        id: newGroup._id,
        name: newGroup.name,
        members: newGroup.users ? newGroup.users.length : 1,
        _id: newGroup._id
      }
      
      setGroups(prevGroups => [...prevGroups, formattedGroup])
      showSuccessToast(`Grupo "${groupName}" creado exitosamente`)
      
      return formattedGroup
    } catch (error) {
      console.error('Error creating group:', error)
      alert(`No se pudo crear el grupo: ${error.message}`)
      throw error
    } finally {
      setIsCreatingGroup(false)
    }
  }

  const createGroup = () => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para crear un grupo')
      return
    }
    setShowCreateModal(true)
  }

  // Función para unirse a un grupo con código de invitación
  const joinGroupWithCode = async (code) => {
    setIsJoiningGroup(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      const updatedGroup = await groupService.addMember(currentUser.uid, code)
      
      const formattedGroup = {
        id: updatedGroup._id,
        name: updatedGroup.name,
        members: updatedGroup.users ? updatedGroup.users.length : 1,
        _id: updatedGroup._id
      }
      
      setGroups(prevGroups => {
        const exists = prevGroups.some(g => g.id === formattedGroup.id)
        if (!exists) {
          return [...prevGroups, formattedGroup]
        }
        return prevGroups
      })
      
      showSuccessToast(`Te has unido al grupo "${updatedGroup.name}"`)
      setShowJoinModal(false)
      setInviteCode('')
      
      return formattedGroup
    } catch (error) {
      console.error('Error joining group:', error)
      alert('Código de invitación inválido o expirado')
      throw error
    } finally {
      setIsJoiningGroup(false)
    }
  }

  const openJoinModal = () => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para unirte a un grupo')
      return
    }
    setShowJoinModal(true)
  }

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      alert('Por favor ingresa un código de invitación')
      return
    }
    
    try {
      await joinGroupWithCode(inviteCode.trim())
    } catch (error) {
      // Error ya manejado en joinGroupWithCode
    }
  }

  const cancelJoinGroup = () => {
    setShowJoinModal(false)
    setInviteCode('')
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Por favor ingresa un nombre para el grupo')
      return
    }
    
    try {
      await createNewGroup(newGroupName.trim())
      setShowCreateModal(false)
      setNewGroupName('')
    } catch (error) {
      // Error ya manejado en createNewGroup
    }
  }

  const cancelCreateGroup = () => {
    setShowCreateModal(false)
    setNewGroupName('')
  }

  // Helper para obtener nombre de usuario legible
  const getUserName = () => {
    if (!displayEmail) return 'anonimo'
    return displayEmail.split('@')[0]
  }

  // Función para cargar configuración del usuario
  const loadUserSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      const response = await userService.getUserSettings(currentUser.uid)
      
      if (response.success && response.settings) {
        setUserSettings(response.settings)
      } else {
        setUserSettings({ allowNotifications: true })
      }
    } catch (error) {
      console.error('Error loading user settings:', error)
      setUserSettings({ allowNotifications: true })
    } finally {
      setIsLoadingSettings(false)
    }
  }

  // Función para guardar configuración del usuario
  const saveUserSettings = async () => {
    setIsSavingSettings(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('Usuario no autenticado')
      }

      const response = await userService.updateUserSettings(currentUser.uid, userSettings)
      
      if (response.success) {
        showSuccessToast('Configuración guardada exitosamente')
        setShowUserSettingsModal(false)
      } else {
        throw new Error('Error guardando configuración')
      }
    } catch (error) {
      console.error('Error saving user settings:', error)
      alert('No se pudo guardar la configuración')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Función para abrir el modal de configuración
  const openUserSettings = async () => {
    setShowProfileMenu(false)
    setShowUserSettingsModal(true)
    await loadUserSettings()
  }

  // Función para refrescar grupos
  const onRefresh = async () => {
    setRefreshing(true)
    console.log('Refrescando lista de grupos...')
    if (isLoggedIn && auth.currentUser) {
      await loadUserGroups(auth.currentUser.email, auth.currentUser.uid)
    }
    setRefreshing(false)
  }

  const joinGroup = (group) => {
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para unirte a un grupo')
      return
    }
    // TODO: Navegar a la pantalla de opciones del grupo
    navigate(`/group/${group.id}`, { state: { group, userName: getUserName() } })
  }

  return (
    <div className="home-groups">
      {/* Header con título */}
      <div className="header-container">
        <h1 className="app-title">
          <span className="title-baby">Baby</span>
          <span className="title-wise">Wise</span>
        </h1>
      </div>

      {/* Menú desplegable de perfil local (solo visible si showProfileMenu es true) */}
      {showProfileMenu && (
        <div className="profile-menu">
          {isLoggedIn ? (
            <>
              {/* Nombre del usuario */}
              <div className="profile-menu-username">
                {getUserName()}
              </div>
              
              {/* Botón de Configuración */}
              <button
                onClick={openUserSettings}
                className="profile-menu-item"
              >
                Configuración
              </button>
              
              {/* Botón de cerrar sesión */}
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  signIn()
                }}
                disabled={isLoading}
                className="profile-menu-item logout"
              >
                {isLoading ? (
                  <div className="loading"></div>
                ) : (
                  'Cerrar Sesión'
                )}
              </button>
            </>
          ) : (
            <>
              {/* Mensaje cuando no está logueado */}
              <div className="profile-menu-message">
                No has iniciado sesión
              </div>
              
              {/* Botón de iniciar sesión */}
              <button
                onClick={() => {
                  setShowProfileMenu(false)
                  signIn()
                }}
                disabled={isLoading}
                className="profile-menu-login"
              >
                {isLoading ? (
                  <div className="loading"></div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Lista de grupos */}
      <div className="groups-container">
        <div className="groups-header">
          <h2 className="section-title">Mis Grupos</h2>
          {isLoggedIn && (
            <button 
              onClick={onRefresh} 
              className="refresh-button"
              disabled={refreshing}
              aria-label="Refrescar"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className={refreshing ? 'spinning' : ''}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </button>
          )}
        </div>
        
        {isLoadingGroups ? (
          <div className="loading-state">
            <div className="loading large"></div>
            <p>Cargando grupos...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="groups-list">
            {groups.map((group, index) => (
              <div
                key={group.id || group._id || `group-${index}`}
                className="group-card"
                onClick={() => joinGroup(group)}
              >
                <div className="group-info">
                  <h3 className="group-name">{group.name}</h3>
                  <p className="group-members">{group.members} miembros</p>
                </div>
                <span className="group-arrow">→</span>
              </div>
            ))}
          </div>
        ) : isLoggedIn ? (
          <div className="empty-state">
            <h3>No tienes grupos aún</h3>
            <p>Crea un grupo o espera a que te inviten</p>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Inicia sesión para ver tus grupos</h3>
          </div>
        )}
      </div>

      {/* Modal para crear grupo */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={cancelCreateGroup}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Crear Nuevo Grupo</h2>

            <input
              type="text"
              className="modal-input"
              placeholder="Nombre del grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              autoFocus
              maxLength={50}
            />

            <div className="modal-buttons">
              <button
                className="modal-button cancel-button"
                onClick={cancelCreateGroup}
                disabled={isCreatingGroup}
              >
                Cancelar
              </button>

              <button
                className="modal-button add-button"
                onClick={handleCreateGroup}
                disabled={isCreatingGroup}
              >
                {isCreatingGroup ? <div className="loading small"></div> : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para unirse a grupo */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={cancelJoinGroup}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Unirse a Grupo</h2>

            <input
              type="text"
              className="modal-input"
              placeholder="Código de invitación"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              autoFocus
            />

            <div className="modal-buttons">
              <button
                className="modal-button cancel-button"
                onClick={cancelJoinGroup}
                disabled={isJoiningGroup}
              >
                Cancelar
              </button>

              <button
                className="modal-button add-button"
                onClick={handleJoinGroup}
                disabled={isJoiningGroup}
              >
                {isJoiningGroup ? <div className="loading small"></div> : 'Unirse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      {/* Modal de Configuración de Usuario */}
      {showUserSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowUserSettingsModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Configuración</h2>

            {isLoadingSettings ? (
              <div className="loading-state">
                <div className="loading large"></div>
                <p>Cargando configuración...</p>
              </div>
            ) : (
              <>
                <div className="settings-item">
                  <div className="settings-info">
                    <h4>Permitir Notificaciones</h4>
                    <p>Recibir alertas de eventos de llanto y movimiento</p>
                  </div>
                  
                  <button
                    className={`toggle-switch ${userSettings.allowNotifications ? 'active' : ''}`}
                    onClick={() => {
                      setUserSettings(prev => ({
                        ...prev,
                        allowNotifications: !prev.allowNotifications
                      }))
                    }}
                  >
                    <div className="toggle-thumb"></div>
                  </button>
                </div>

                <div className="modal-buttons">
                  <button
                    className="modal-button cancel-button"
                    onClick={() => setShowUserSettingsModal(false)}
                    disabled={isSavingSettings}
                  >
                    Cancelar
                  </button>

                  <button
                    className="modal-button add-button"
                    onClick={saveUserSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <div className="loading small"></div> : 'Guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Menú de opciones del botón + */}
      {showAddMenu && (
        <div className="add-menu">
          <button
            onClick={() => {
              setShowAddMenu(false)
              createGroup()
            }}
            className="add-menu-item"
          >
            Crear Grupo Nuevo
          </button>
          
          <button
            onClick={() => {
              setShowAddMenu(false)
              openJoinModal()
            }}
            className="add-menu-item"
          >
            Unirse a Grupo
          </button>
        </div>
      )}

      {/* Barra de navegación inferior con botón + */}
      <div className="bottom-nav">
        <button 
          className="fab"
          onClick={() => {
            if (!isLoggedIn) {
              alert('Debes iniciar sesión para crear o unirte a un grupo')
              return
            }
            setShowAddMenu(!showAddMenu)
          }}
          aria-label="Agregar"
        >
          +
        </button>
      </div>
    </div>
  )
}

export default HomeGroups
