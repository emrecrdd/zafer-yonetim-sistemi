// frontend/src/components/Profile.js - GÜNCELLENMİŞ HALİ
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/users'
import api from '../services/api'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // İLÇE BİLGİLERİ STATE'LERİ
  const [districts, setDistricts] = useState([])
  const [loadingDistricts, setLoadingDistricts] = useState(true)
  const [userDistrict, setUserDistrict] = useState(null)

  // PROJE STATE'LERİ
  const [projects, setProjects] = useState([])
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    category: '',
    stage: 'idea',
    budget: '',
    needs: ''
  })

  // SADELEŞTİRİLMİŞ state
  const [profileData, setProfileData] = useState({
    // Temel Bilgiler
    name: '',
    surname: '',
    phone: '',
    email: '',
    
    // İletişim Bilgileri
    districtId: '',
    neighborhood: '',
    address: '',
    
    // Yetenekler
    skills: '',
    
    // Eğitim & İş
    profession: '',
    educationLevel: '',
    school: '',
    company: '',
    position: '',
    workExperience: '',
    
    // Acil Durum
    emergencyContact: '',
    emergencyPhone: '',
    
    // Kişisel
    birthDate: '',
    gender: '',
    bloodType: '',
    bio: '',
    
    // Sistem (sadece okuma)
    role: '',
    isActive: '',
    lastActivity: '',
    createdAt: '',
    profileImage: ''
  })

  // İlçe bilgilerini yükle
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setLoadingDistricts(true)
        const response = await api.get('/districts')
        console.log('📍 Districts response:', response.data)
        
        // Backend response formatına göre ayarla
        const districtsData = response.data.districts || response.data.data || []
        setDistricts(districtsData)
        
        // Kullanıcının ilçe bilgisini bul
        if (user?.districtId) {
          const districtId = parseInt(user.districtId)
          const foundDistrict = districtsData.find(d => d.id === districtId)
          console.log('📍 Found district for user:', foundDistrict)
          setUserDistrict(foundDistrict)
        }
      } catch (error) {
        console.error('❌ İlçeler yüklenemedi:', error)
        setDistricts([])
      } finally {
        setLoadingDistricts(false)
      }
    }

    loadDistricts()
  }, [user])

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (user) {
      setProfileData({
        // Temel Bilgiler
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || '',
        email: user.email || '',
        
        // İletişim Bilgileri - districtId'yi string'e çevir
        districtId: user.districtId ? String(user.districtId) : '',
        neighborhood: user.neighborhood || '',
        address: user.address || '',
        
        // Yetenekler
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
        
        // Eğitim & İş
        profession: user.profession || '',
        educationLevel: user.educationLevel || '',
        school: user.school || '',
        company: user.company || '',
        position: user.position || '',
        workExperience: user.workExperience || '',
        
        // Acil Durum
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        
        // Kişisel
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        gender: user.gender || '',
        bloodType: user.bloodType || '',
        bio: user.bio || '',
        
        // Sistem (sadece okuma)
        role: user.role || '',
        isActive: user.isActive !== undefined ? (user.isActive ? 'Aktif' : 'Pasif') : '',
        lastActivity: user.lastActivity || '',
        createdAt: user.createdAt || '',
        profileImage: user.profileImage || ''
      })

      // Örnek projeler - backend hazır olana kadar
      setProjects([
        {
          id: 1,
          title: 'Akıllı Şehir Ulaşım Sistemi',
          description: 'Yapay zeka destekli toplu taşıma optimizasyon projesi',
          category: 'teknoloji',
          stage: 'idea',
          budget: '100.000 TL',
          needs: ['yazılımcı', 'veri analisti', 'proje yöneticisi'],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Eğitimde Dijital Dönüşüm',
          description: 'Kırsal kesimdeki okullara dijital eğitim platformu',
          category: 'eğitim',
          stage: 'prototype',
          budget: '50.000 TL',
          needs: ['eğitmen', 'içerik geliştirici', 'teknik destek'],
          createdAt: new Date().toISOString()
        }
      ])
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
    
    // İlçe değiştiğinde userDistrict'i güncelle
    if (name === 'districtId' && value) {
      const selectedDistrict = districts.find(d => d.id === parseInt(value))
      setUserDistrict(selectedDistrict)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Skills'i array'e çevir, districtId'yi integer'a çevir
      const updateData = {
        ...profileData,
        skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s),
        districtId: profileData.districtId ? parseInt(profileData.districtId) : null
      }

      console.log('📤 Update data:', updateData)

      const response = await userService.updateProfile(user.id, updateData)
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Profil bilgileriniz başarıyla güncellendi' })
        updateUser(response.user)
        setIsEditing(false)
        
        // İlçe bilgisini güncelle
        if (response.user.districtId) {
          const updatedDistrict = districts.find(d => d.id === parseInt(response.user.districtId))
          setUserDistrict(updatedDistrict)
        }
        
        // Sayfayı yenile (isteğe bağlı)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Profil güncellenirken hata oluştu' 
      })
    } finally {
      setLoading(false)
    }
  }

  // PROJE FONKSİYONLARI
  const handleProjectInputChange = (e) => {
    const { name, value } = e.target
    setProjectForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateProject = async () => {
    if (!projectForm.title.trim()) {
      setMessage({ type: 'error', text: 'Proje başlığı zorunludur' })
      return
    }

    try {
      const projectData = {
        ...projectForm,
        needs: projectForm.needs.split(',').map(n => n.trim()).filter(n => n),
        id: currentProject ? currentProject.id : Date.now(),
        createdAt: currentProject ? currentProject.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (currentProject) {
        // Proje düzenleme
        setProjects(projects.map(p => p.id === currentProject.id ? projectData : p))
        setMessage({ type: 'success', text: 'Proje başarıyla güncellendi' })
      } else {
        // Yeni proje ekleme
        setProjects([...projects, projectData])
        setMessage({ type: 'success', text: 'Proje başarıyla eklendi' })
      }

      setShowProjectModal(false)
      setCurrentProject(null)
      setProjectForm({
        title: '',
        description: '',
        category: '',
        stage: 'idea',
        budget: '',
        needs: ''
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Proje kaydedilirken hata oluştu' 
      })
    }
  }

  const handleEditProject = (project) => {
    setCurrentProject(project)
    setProjectForm({
      title: project.title,
      description: project.description,
      category: project.category,
      stage: project.stage,
      budget: project.budget,
      needs: Array.isArray(project.needs) ? project.needs.join(', ') : project.needs
    })
    setShowProjectModal(true)
  }

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      setProjects(projects.filter(p => p.id !== projectId))
      setMessage({ type: 'success', text: 'Proje başarıyla silindi' })
    }
  }

  // Rol görüntüleme
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'SUPER_ADMIN': 'Süper Admin',
      'IL_BASKANI': 'İl Başkanı', 
      'ILCE_BASKANI': 'İlçe Başkanı',
      'GONULLU': 'Gönüllü'
    }
    return roleNames[role] || role
  }

  // Proje aşaması görüntüleme
  const getProjectStageDisplay = (stage) => {
    const stages = {
      'idea': 'Fikir Aşaması',
      'prototype': 'Prototip',
      'development': 'Geliştirme',
      'investment': 'Yatırım Arıyor',
      'completed': 'Tamamlandı'
    }
    return stages[stage] || stage
  }

  // Tarih formatlama
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return '-'
    }
  }

  // İlçe adını bulma
  const getDistrictName = (districtId) => {
    if (!districtId) return 'Belirtilmemiş'
    const district = districts.find(d => d.id === parseInt(districtId))
    return district ? district.name : 'İlçe bulunamadı'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profilim</h1>
        <p className="text-gray-600">Kişisel bilgilerinizi ve projelerinizi yönetin</p>
      </div>

      {/* Mesaj */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            {['profile', 'personal', 'contact', 'education', 'projects', 'system'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'profile' && 'Temel Bilgiler'}
                {tab === 'personal' && 'Kişisel Bilgiler'}
                {tab === 'contact' && 'İletişim'}
                {tab === 'education' && 'Eğitim'}
                {tab === 'projects' && 'Proje Fikirlerim'}
                {tab === 'system' && 'Sistem Bilgileri'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div>
            {/* TEMEL BİLGİLER */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
                  <input
                    type="text"
                    name="surname"
                    value={profileData.surname}
                    onChange={handleInputChange}
                    required
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Telefon numarası değiştirilemez</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yetenekler</label>
                  <input
                    type="text"
                    name="skills"
                    value={profileData.skills}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Yeteneklerinizi virgülle ayırarak yazın"
                  />
                  <p className="text-xs text-gray-500 mt-1">Örn: Grafik Tasarım, Muhasebe, Halkla İlişkiler</p>
                </div>
              </div>
            )}

            {/* KİŞİSEL BİLGİLER */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seçiniz</option>
                    <option value="male">Erkek</option>
                    <option value="female">Kadın</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kan Grubu</label>
                  <select
                    name="bloodType"
                    value={profileData.bloodType}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seçiniz</option>
                    <option value="a_positive">A Rh+</option>
                    <option value="a_negative">A Rh-</option>
                    <option value="b_positive">B Rh+</option>
                    <option value="b_negative">B Rh-</option>
                    <option value="ab_positive">AB Rh+</option>
                    <option value="ab_negative">AB Rh-</option>
                    <option value="o_positive">O Rh+</option>
                    <option value="o_negative">O Rh-</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hakkımda</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Kendinizden bahsedin..."
                  />
                </div>
              </div>
            )}

            {/* İLETİŞİM BİLGİLERİ */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İlçe *</label>
                  <select
                    name="districtId"
                    value={profileData.districtId}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading || loadingDistricts}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingDistricts 
                        ? 'İlçeler yükleniyor...' 
                        : districts.length === 0 
                          ? 'İlçe listesi yüklenemedi' 
                          : 'İlçe seçiniz'
                      }
                    </option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  {profileData.districtId && userDistrict && (
                    <p className="text-xs text-gray-500 mt-1">
                      Mevcut ilçe: <span className="font-medium">{userDistrict.name}</span>
                      {userDistrict.code && ` (${userDistrict.code})`}
                    </p>
                  )}
                  {districts.length === 0 && !loadingDistricts && (
                    <p className="text-xs text-red-500 mt-1">
                      İlçe listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mahalle</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={profileData.neighborhood}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                  <textarea
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Acil Durum Kişisi</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Acil Durum Telefonu</label>
                  <input
                    type="text"
                    name="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="5XX XXX XX XX"
                  />
                </div>
              </div>
            )}

            {/* EĞİTİM BİLGİLERİ */}
            {activeTab === 'education' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eğitim Durumu</label>
                  <select
                    name="educationLevel"
                    value={profileData.educationLevel}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Seçiniz</option>
                    <option value="primary">İlkokul</option>
                    <option value="middle">Ortaokul</option>
                    <option value="high">Lise</option>
                    <option value="university">Üniversite</option>
                    <option value="master">Yüksek Lisans</option>
                    <option value="phd">Doktora</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Okul</label>
                  <input
                    type="text"
                    name="school"
                    value={profileData.school}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meslek</label>
                  <input
                    type="text"
                    name="profession"
                    value={profileData.profession}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Şirket</label>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon</label>
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">İş Deneyimi</label>
                  <input
                    type="text"
                    name="workExperience"
                    value={profileData.workExperience}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Örn: 5 yıl"
                  />
                </div>
              </div>
            )}

            {/* PROJELERİM */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Proje Fikirlerim</h3>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    + Yeni Proje Ekle
                  </button>
                </div>

                <div className="grid gap-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Henüz proje eklenmemiş.</p>
                      <p className="text-sm mt-2">Yukarıdaki butondan ilk projenizi ekleyin!</p>
                    </div>
                  ) : (
                    projects.map(project => (
                      <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg text-gray-900">{project.title}</h4>
                            <p className="text-gray-600 mt-1">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                project.stage === 'idea' ? 'bg-blue-100 text-blue-800' :
                                project.stage === 'prototype' ? 'bg-yellow-100 text-yellow-800' :
                                project.stage === 'development' ? 'bg-orange-100 text-orange-800' :
                                project.stage === 'investment' ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getProjectStageDisplay(project.stage)}
                              </span>
                              
                              {project.category && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {project.category}
                                </span>
                              )}
                              
                              {project.budget && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                  Bütçe: {project.budget}
                                </span>
                              )}
                            </div>

                            {project.needs && project.needs.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm text-gray-500">İhtiyaç Duyulan Roller: </span>
                                {project.needs.map((need, index) => (
                                  <span key={index} className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                                    {need}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-600 rounded hover:bg-red-50 transition-colors"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                          <span>Oluşturulma: {formatDate(project.createdAt)}</span>
                          {project.updatedAt && (
                            <span className="ml-4">Güncelleme: {formatDate(project.updatedAt)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SİSTEM BİLGİLERİ */}
            {activeTab === 'system' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={getRoleDisplayName(profileData.role)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      profileData.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      profileData.role === 'IL_BASKANI' ? 'bg-blue-100 text-blue-800' :
                      profileData.role === 'ILCE_BASKANI' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {profileData.role}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bağlı Olduğu İlçe</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={userDistrict ? userDistrict.name : getDistrictName(profileData.districtId)}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    {userDistrict?.code && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded whitespace-nowrap">
                        {userDistrict.code}
                      </span>
                    )}
                  </div>
                  {profileData.districtId && !userDistrict && (
                    <p className="text-xs text-gray-500 mt-1">İlçe ID: {profileData.districtId}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={profileData.isActive}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    />
                    <span className={`w-3 h-3 rounded-full ${
                      profileData.isActive === 'Aktif' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Son Aktivite</label>
                  <input
                    type="text"
                    value={formatDate(profileData.lastActivity)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Üyelik Tarihi</label>
                  <input
                    type="text"
                    value={formatDate(profileData.createdAt)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profil Fotoğrafı</label>
                  <input
                    type="text"
                    value={profileData.profileImage || 'Yok'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed truncate"
                  />
                </div>
              </div>
            )}
          </div>

          {/* BUTONLAR */}
          <div className="mt-6 flex gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Bilgileri Düzenle
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  {loading ? 'Güncelleniyor...' : 'Tüm Bilgileri Güncelle'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  İptal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PROJE MODALI */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {currentProject ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Başlığı *</label>
                <input
                  type="text"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Proje adını yazın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Proje detaylarını açıklayın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  name="category"
                  value={projectForm.category}
                  onChange={handleProjectInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Kategori Seçin</option>
                  <option value="teknoloji">Teknoloji</option>
                  <option value="eğitim">Eğitim</option>
                  <option value="sağlık">Sağlık</option>
                  <option value="tarım">Tarım</option>
                  <option value="enerji">Enerji</option>
                  <option value="diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proje Aşaması</label>
                <select
                  name="stage"
                  value={projectForm.stage}
                  onChange={handleProjectInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="idea">Fikir Aşaması</option>
                  <option value="prototype">Prototip</option>
                  <option value="development">Geliştirme</option>
                  <option value="investment">Yatırım Arıyor</option>
                  <option value="completed">Tamamlandı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bütçe</label>
                <input
                  type="text"
                  name="budget"
                  value={projectForm.budget}
                  onChange={handleProjectInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Örn: 50.000 TL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İhtiyaç Duyulan Roller</label>
                <input
                  type="text"
                  name="needs"
                  value={projectForm.needs}
                  onChange={handleProjectInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Örn: yazılımcı, tasarımcı, pazarlama"
                />
                <p className="text-xs text-gray-500 mt-1">Rolleri virgülle ayırarak yazın</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProjectModal(false)
                  setCurrentProject(null)
                  setProjectForm({
                    title: '',
                    description: '',
                    category: '',
                    stage: 'idea',
                    budget: '',
                    needs: ''
                  })
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                İptal
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {currentProject ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile