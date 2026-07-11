import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, User, LogOut, Database, Users } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import Mascot from '../components/Mascot';
import { translateText } from '../utils/translationService';

export default function Dashboard() {
  const { currentUser, userData, logout, language } = useAuth();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const navigate = useNavigate();

  const isAdmin = currentUser && currentUser.email === 'seniorsetu07@gmail.com';
  const streak = userData?.streak || 0;

  // Localized UI state
  const [ui, setUi] = useState({
    streakResetDesc: "Your daily training streak has reset. Don't worry! Consistent practice is a journey, and every day is a fresh opportunity to sharpen your mind. Let's start a new streak today!",
    welcomeSubtitle: "Keep your memory, logic, and cognitive health active with daily training exercises.",
    streakActiveDesc: "You are maintaining an excellent brain training habit. Keep it up!",
    streakInactiveDesc: "Complete a quiz today to start building your mental agility streak!",
    cognitiveDesc: "Choose from 10 different categories designed specifically to exercise different cognitive functions.",
    letsDoIt: "Let's Do It!",
    welcomeTitle: `Welcome, ${currentUser?.displayName || 'Friend'}!`,
    dailyStreakTitle: "Daily Brain Training Streak",
    activeDaysCount: `${streak} Days Active!`,
    noActiveStreak: "No Active Streak",
    cognitiveWorkouts: "Cognitive Workouts",
    startQuizBtn: "Start a Quiz Section",
    myStatsBtn: "My Progress Stats",
    leaderboardBtn: "Leaderboard & Milestones",
    streakResetTitle: "Streak Reset",
    streakTitleWord: "Streak"
  });

  useEffect(() => {
    async function checkStreakReset() {
      if (!userData || !currentUser) return;
      
      const lastPlayed = userData.lastPlayedDate;
      const currentStreak = userData.streak || 0;
      
      if (currentStreak > 0 && lastPlayed) {
        const today = new Date().toISOString().split('T')[0];
        const lastPlayedDate = new Date(lastPlayed);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastPlayedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
              streak: 0,
              streakBrokenAlert: true
            }, { merge: true });
            setShowStreakModal(true);
            console.log(`Streak reset on Home Page check. Last played: ${lastPlayed}.`);
          } catch (err) {
            console.error("Failed to reset streak in Firestore:", err);
          }
        }
      }
    }
    
    if (userData) {
      checkStreakReset();
      if (userData.streakBrokenAlert) {
        setShowStreakModal(true);
      }
    }
  }, [userData, currentUser]);

  // Load translations dynamically
  useEffect(() => {
    async function loadTranslations() {
      const welcome = `Welcome, ${currentUser?.displayName || 'Friend'}!`;
      const activeStreak = `${streak} Days Active!`;
      
      const defaultUI = {
        streakResetDesc: "Your daily training streak has reset. Don't worry! Consistent practice is a journey, and every day is a fresh opportunity to sharpen your mind. Let's start a new streak today!",
        welcomeSubtitle: "Keep your memory, logic, and cognitive health active with daily training exercises.",
        streakActiveDesc: "You are maintaining an excellent brain training habit. Keep it up!",
        streakInactiveDesc: "Complete a quiz today to start building your mental agility streak!",
        cognitiveDesc: "Choose from 10 different categories designed specifically to exercise different cognitive functions.",
        letsDoIt: "Let's Do It!",
        welcomeTitle: welcome,
        dailyStreakTitle: "Daily Brain Training Streak",
        activeDaysCount: activeStreak,
        noActiveStreak: "No Active Streak",
        cognitiveWorkouts: "Cognitive Workouts",
        startQuizBtn: "Start a Quiz Section",
        myStatsBtn: "My Progress Stats",
        leaderboardBtn: "Leaderboard & Milestones",
        streakResetTitle: "Streak Reset",
        streakTitleWord: "Streak"
      };

      if (!language || language === 'en') {
        setUi(defaultUI);
        return;
      }

      try {
        const trans = {};
        for (const [key, value] of Object.entries(defaultUI)) {
          trans[key] = await translateText(value, language);
        }
        setUi(trans);
      } catch (err) {
        console.error("Failed to load dashboard translations:", err);
      }
    }
    loadTranslations();
  }, [language, currentUser, streak]);

  const dismissStreakAlert = async () => {
    setShowStreakModal(false);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { streakBrokenAlert: false }, { merge: true });
    } catch (err) {
      console.error("Error resetting streak alert flag:", err);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-medium)' }} className="slide-up">
      {/* Polite Streak Reset Modal Popup */}
      {showStreakModal && (
        <div className="streak-alert-overlay">
          <div className="streak-alert-content" style={{ padding: 'var(--spacing-large)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '120px', height: '100px', marginBottom: '10px' }}>
              <Mascot state="idle" width="120" height="100" />
            </div>
            <h2 style={{ fontSize: 'var(--font-size-xlarge)', color: 'var(--warning-color)', marginBottom: '15px' }}>
              🌟 {ui.streakResetTitle}
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', lineHeight: '1.6', color: 'var(--text-color)', marginBottom: '25px' }}>
              {ui.streakResetDesc}
            </p>
            <button className="btn" onClick={dismissStreakAlert} style={{ margin: 0, width: '100%' }}>
              {ui.letsDoIt}
            </button>
          </div>
        </div>
      )}

      {/* Welcoming Hero Header Card */}
      <div 
        className="premium-card slide-up" 
        style={{ 
          padding: 'var(--spacing-large) var(--spacing-medium)', 
          background: 'linear-gradient(135deg, var(--primary-color) 0%, #3a889e 100%)', 
          color: '#fff', 
          borderRadius: '24px', 
          marginBottom: 'var(--spacing-medium)',
          boxShadow: '0 8px 30px rgba(43, 103, 119, 0.25)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px'
        }}
      >
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 'var(--font-size-xlarge)', marginBottom: '8px', color: '#fff', fontWeight: 'bold' }}>
            {ui.welcomeTitle}
          </h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: '#eef2f3', lineHeight: '1.5', margin: 0 }}>
            {ui.welcomeSubtitle}
          </p>
        </div>
        <div style={{ width: '120px', height: '100px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Mascot state="wave" width="120" height="100" />
        </div>
      </div>

      {/* Streak and Brain Health Banner */}
      <div className="premium-card slide-up delay-1" style={{ marginBottom: 'var(--spacing-medium)' }}>
        <h3 style={{ fontSize: 'var(--font-size-large)', color: 'var(--primary-color)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 {ui.dailyStreakTitle}
        </h3>
        {streak > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: 'var(--spacing-medium)', backgroundColor: '#f0fdf4', border: '2px solid #5cb85c', borderRadius: '16px' }}>
            <span style={{ fontSize: '32px' }}>🔥</span>
            <div>
              <div style={{ fontSize: 'var(--font-size-large)', fontWeight: 'bold', color: '#137333' }}>{ui.activeDaysCount}</div>
              <div style={{ fontSize: 'var(--font-size-base)', color: '#555', marginTop: '2px' }}>{ui.streakActiveDesc}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: 'var(--spacing-medium)', backgroundColor: '#fafafa', border: '2px dashed #ccc', borderRadius: '16px' }}>
            <span style={{ fontSize: '32px' }}>⚡</span>
            <div>
              <div style={{ fontSize: 'var(--font-size-large)', fontWeight: 'bold', color: '#666' }}>{ui.noActiveStreak}</div>
              <div style={{ fontSize: 'var(--font-size-base)', color: '#777', marginTop: '2px' }}>{ui.streakInactiveDesc}</div>
            </div>
          </div>
        )}
      </div>

      {/* Welcoming Start Quiz Section */}
      <div className="premium-card slide-up delay-2" style={{ marginBottom: 'var(--spacing-medium)' }}>
        <h3 style={{ fontSize: 'var(--font-size-large)', color: 'var(--primary-color)', marginBottom: '10px' }}>
          🧠 {ui.cognitiveWorkouts}
        </h3>
        <p style={{ fontSize: 'var(--font-size-base)', color: '#555', marginBottom: '20px', lineHeight: '1.4' }}>
          {ui.cognitiveDesc}
        </p>
        <button className="btn" onClick={() => navigate('/select-category')} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PlayCircle size={32} style={{ marginRight: '12px' }} />
          {ui.startQuizBtn}
        </button>
      </div>

      {/* Secondary Dashboard Options */}
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }} className="slide-up delay-3">
        <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
          <User size={28} style={{ marginRight: '15px' }} />
          {ui.myStatsBtn}
        </button>

        <button className="btn btn-secondary" onClick={() => navigate('/social')}>
          <Users size={28} style={{ marginRight: '15px' }} />
          {ui.leaderboardBtn}
        </button>

        {isAdmin && (
          <button className="btn btn-secondary" style={{ backgroundColor: '#fff3cd', color: '#856404', boxShadow: 'none' }} onClick={() => navigate('/seed')}>
            <Database size={28} style={{ marginRight: '15px' }} />
            [Admin] Seed Database
          </button>
        )}
      </div>
    </div>
  );
}
