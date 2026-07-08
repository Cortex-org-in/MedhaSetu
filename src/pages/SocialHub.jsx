import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trophy, Milestone } from 'lucide-react';

export default function SocialHub() {
  const { currentUser } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rankBy, setRankBy] = useState('streak'); // 'streak' or 'quizzes'
  const [visibleCount, setVisibleCount] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        setUsersList(users);
      } catch (err) {
        console.error("Error fetching leaderboard users:", err);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', fontSize: 'var(--font-size-large)', textAlign: 'center', color: 'var(--primary-color)' }}>
        Loading rankings & milestones...
      </div>
    );
  }

  // Rank users
  const sortedUsers = [...usersList].sort((a, b) => {
    if (rankBy === 'streak') {
      const diff = (b.streak || 0) - (a.streak || 0);
      if (diff !== 0) return diff;
      return (b.scores?.length || 0) - (a.scores?.length || 0);
    } else {
      const diff = (b.scores?.length || 0) - (a.scores?.length || 0);
      if (diff !== 0) return diff;
      return (b.streak || 0) - (a.streak || 0);
    }
  });

  // Calculate Community stats
  let totalCommunityQuizzes = 0;
  let totalCommunityCorrect = 0;
  let totalCommunityStreak = 0;

  usersList.forEach(u => {
    totalCommunityStreak += u.streak || 0;
    const scores = u.scores || [];
    totalCommunityQuizzes += scores.length;
    scores.forEach(s => {
      totalCommunityCorrect += s.score || 0;
    });
  });

  // Milestone Goals
  const milestones = [
    {
      title: 'Quizzes Completed Collectively',
      goal: 100,
      current: totalCommunityQuizzes,
      unit: 'quizzes',
      desc: 'Let’s complete 100 total brain training quizzes together!'
    },
    {
      title: 'Total Questions Answered Correctly',
      goal: 1000,
      current: totalCommunityCorrect,
      unit: 'answers',
      desc: 'Aim for 1000 correct answers as a community!'
    },
    {
      title: 'Collective Active Streak Days',
      goal: 100,
      current: totalCommunityStreak,
      unit: 'days',
      desc: 'Combine our training days to hit 100 days of consistency!'
    }
  ];

  return (
    <div style={{ padding: 'var(--spacing-medium)' }} className="slide-up">
      <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-xlarge)', marginBottom: '10px', color: 'var(--primary-color)' }}>
        Community Circle
      </h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: 'var(--font-size-base)', marginBottom: '30px' }}>
        Learn, share, and achieve milestones together with your peers.
      </p>

      {/* TABS SELECT */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button 
          className={`btn ${rankBy === 'streak' ? '' : 'btn-secondary'}`} 
          style={{ flex: 1, minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-large)', padding: '10px' }}
          onClick={() => setRankBy('streak')}
        >
          Rank by Streak
        </button>
        <button 
          className={`btn ${rankBy === 'quizzes' ? '' : 'btn-secondary'}`} 
          style={{ flex: 1, minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-large)', padding: '10px' }}
          onClick={() => setRankBy('quizzes')}
        >
          Rank by Quizzes
        </button>
      </div>

      {/* LEADERBOARD SECTION */}
      <div className="premium-card">
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '20px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Trophy size={28} /> Top Agile Thinkers
        </h3>

        <div className="leaderboard-container">
          {sortedUsers.slice(0, visibleCount).map((user, index) => {
            const rank = index + 1;
            const isCurrentUser = user.id === currentUser.uid;
            let rankClass = "rank-badge";
            if (rank === 1) rankClass += " rank-1";
            else if (rank === 2) rankClass += " rank-2";
            else if (rank === 3) rankClass += " rank-3";

            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

            return (
              <div key={user.id} className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}>
                <div className={rankClass}>{rankEmoji || rank}</div>
                <div className="leaderboard-name" style={{ fontSize: 'var(--font-size-base)' }}>
                  {user.displayName || 'Anonymous Member'} {isCurrentUser && <span style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: 'bold' }}>(You)</span>}
                </div>
                <div className="leaderboard-stat">
                  {rankBy === 'streak' ? `${user.streak || 0} Days` : `${user.scores?.length || 0} Quizzes`}
                </div>
              </div>
            );
          })}
        </div>

        {sortedUsers.length > visibleCount && (
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '15px', width: '100%', minHeight: 'var(--btn-min-height)', fontSize: 'var(--font-size-large)' }} 
            onClick={() => setVisibleCount(prev => prev + 10)}
          >
            Load More Thinkers
          </button>
        )}
      </div>

      {/* COMMUNITY MILESTONES */}
      <div className="premium-card" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '20px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Milestone size={28} /> Community Goals
        </h3>
        <p style={{ fontSize: 'var(--font-size-base)', color: '#555', marginBottom: '20px' }}>
          Every quiz you complete contributes directly to our community milestones! Work together to reach them.
        </p>

        {milestones.map((ms, index) => {
          const progressPercent = Math.min(100, Math.round((ms.current / ms.goal) * 100));
          return (
            <div key={index} className="milestone-card" style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)', marginBottom: '8px' }}>{ms.title}</h4>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '12px' }}>{ms.desc}</p>
              <div className="milestone-progress-bar" style={{ marginBottom: '8px' }}>
                <div className="milestone-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: '#444' }}>
                <span>{progressPercent}% Achieved</span>
                <span>{ms.current} / {ms.goal} {ms.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className="btn" style={{ display: 'flex', gap: '10px' }} onClick={() => navigate('/')}>
          <ArrowLeft size={24} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
