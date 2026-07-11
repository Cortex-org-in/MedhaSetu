import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/CategorySelect';
import SeedDatabase from './pages/SeedDatabase';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import SocialHub from './pages/SocialHub';
import VerifyEmail from './pages/VerifyEmail';
import { Menu, Home, PlayCircle, Users, Award, ShieldAlert, LogOut } from 'lucide-react';
import { TRANSLATIONS } from './utils/translationService';

function LayoutWrapper({ children }) {
  const { currentUser, userData, logout, language, updateLanguage } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  const navigateTo = (path) => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
    navigate(path);
  };

  const streak = userData?.streak || 0;
  const userInitials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const isAdmin = currentUser && currentUser.email === 'seniorsetu07@gmail.com';

  const isVerified = currentUser && userData && userData.isVerified === true;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <header className="app-header">
        <div className="app-header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {currentUser && isVerified ? (
            <button className="menu-btn" onClick={() => setSidebarOpen(true)} title="Open Menu">
              <Menu size={28} />
            </button>
          ) : (
            <div style={{ width: '44px' }} />
          )}

          <h1 
            style={{ cursor: currentUser && isVerified ? 'pointer' : 'default', userSelect: 'none', margin: '0 auto 0 10px', fontSize: '20px' }} 
            onClick={() => currentUser && isVerified && navigateTo('/')}
          >
            MedhaSetu
          </h1>

          {currentUser && isVerified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Language Selector Dropdown */}
              <select
                value={language}
                onChange={(e) => updateLanguage(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  paddingRight: '26px',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '12px'
                }}
              >
                <option value="en" style={{ color: 'var(--text-color)' }}>English</option>
                <option value="hi" style={{ color: 'var(--text-color)' }}>हिंदी (Hindi)</option>
                <option value="bn" style={{ color: 'var(--text-color)' }}>বাংলা (Bengali)</option>
                <option value="mr" style={{ color: 'var(--text-color)' }}>मराठी (Marathi)</option>
                <option value="te" style={{ color: 'var(--text-color)' }}>తెలుగు (Telugu)</option>
                <option value="ta" style={{ color: 'var(--text-color)' }}>தமிழ் (Tamil)</option>
              </select>

              <button 
                className="header-profile-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} 
                title="Profile Menu"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
              >
                {streak > 0 && <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffb74d' }}>🔥 {streak}</span>}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {userInitials}
                </div>
              </button>
            </div>
          ) : (
            <div style={{ width: '44px' }} />
          )}
        </div>
      </header>

      {/* Render profile dropdown popover directly inside the app-container (prevents overflow:hidden clip on header) */}
      {currentUser && isVerified && profileDropdownOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
            onClick={() => setProfileDropdownOpen(false)} 
          />
          <div 
            className="premium-card slide-up" 
            style={{ 
              position: 'absolute', 
              right: '20px', 
              top: '80px', 
              width: '280px', 
              zIndex: 999, 
              padding: '20px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
              borderRadius: '16px', 
              border: '1px solid #eaeaea', 
              backgroundColor: 'var(--background-color)',
              textAlign: 'left'
            }}
          >
            <div style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--text-color)', wordBreak: 'break-word' }}>
                {currentUser.displayName || 'Agile Thinker'}
              </div>
              <div style={{ fontSize: '14px', color: '#666', wordBreak: 'break-word', marginTop: '2px' }}>
                {currentUser.email}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '16px', color: 'var(--text-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span>🔥 Streak:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{streak} Days</span>
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '16px', minHeight: '44px', padding: '8px 12px', margin: 0, width: '100%' }} 
                onClick={() => navigateTo('/profile')}
              >
                {t.profile}
              </button>
              
              <button 
                className="btn btn-secondary" 
                style={{ 
                  fontSize: '16px', 
                  minHeight: '44px', 
                  padding: '8px 12px', 
                  margin: 0, 
                  width: '100%', 
                  backgroundColor: '#fdf0ef', 
                  color: '#d9534f', 
                  border: 'none', 
                  boxShadow: 'none' 
                }} 
                onClick={handleLogout}
              >
                {t.signOut}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Slide-out Sidebar Drawer */}
      {currentUser && isVerified && (
        <>
          {sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}
          <div className={`sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <span style={{ fontSize: '22px', fontWeight: 'bold' }}>Navigation</span>
              <button className="menu-btn" onClick={() => setSidebarOpen(false)} title="Close Menu">
                <Menu size={28} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
            <div className="sidebar-menu">
              <button className="sidebar-item" onClick={() => navigateTo('/')}>
                <Home size={22} /> {t.dashboard}
              </button>
              <button className="sidebar-item" onClick={() => navigateTo('/select-category')}>
                <PlayCircle size={22} /> {t.startTraining}
              </button>
              <button className="sidebar-item" onClick={() => navigateTo('/profile')}>
                <Award size={22} /> {t.profile}
              </button>
              <button className="sidebar-item" onClick={() => navigateTo('/social')}>
                <Users size={22} /> {t.socialHub}
              </button>
              {isAdmin && (
                <button className="sidebar-item" style={{ color: '#856404' }} onClick={() => navigateTo('/seed')}>
                  <ShieldAlert size={22} /> [Admin] Seed Data
                </button>
              )}
              <hr style={{ border: '0', borderTop: '1px solid #eaeaea', margin: '15px 0' }} />
              <button className="sidebar-item" style={{ color: '#d9534f' }} onClick={handleLogout}>
                <LogOut size={22} /> {t.signOut}
              </button>
            </div>
          </div>
        </>
      )}

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/select-category" element={
              <PrivateRoute>
                <CategorySelect />
              </PrivateRoute>
            } />
            
            <Route path="/quiz/:category" element={
              <PrivateRoute>
                <Quiz />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />

            <Route path="/social" element={
              <PrivateRoute>
                <SocialHub />
              </PrivateRoute>
            } />

            <Route path="/seed" element={
              <PrivateRoute>
                <SeedDatabase />
              </PrivateRoute>
            } />
          </Routes>
        </LayoutWrapper>
      </Router>
    </AuthProvider>
  );
}

export default App;
