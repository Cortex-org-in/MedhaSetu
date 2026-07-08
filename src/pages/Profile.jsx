import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ClipboardList, 
  Award, 
  BookOpen, 
  Brain, 
  Smile, 
  Sparkles, 
  Lightbulb, 
  FileText,
  Bookmark,
  Calendar,
  Compass
} from 'lucide-react';
import { BADGES } from '../utils/badgeConfig';

export default function Profile() {
  const { currentUser, userData } = useAuth();
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [activeBadgeTab, setActiveBadgeTab] = useState('earned');
  const navigate = useNavigate();

  if (!userData) {
    return (
      <div style={{ padding: '40px', fontSize: 'var(--font-size-large)', textAlign: 'center', color: 'var(--primary-color)' }}>
        Loading your progress dashboard...
      </div>
    );
  }

  const scores = userData.scores || [];
  const streak = userData.streak || 0;
  const badges = userData.badges || [];

  // Categorize quizzes taken
  const categoryCount = {};
  const categoryCorrect = {};
  const categoryTotal = {};

  scores.forEach(s => {
    const cat = s.category;
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    categoryCorrect[cat] = (categoryCorrect[cat] || 0) + s.score;
    categoryTotal[cat] = (categoryTotal[cat] || 0) + s.total;
  });

  // Subjects lists mapped to their icons and colors
  const categoryDataList = [
    { id: 'maths', name: 'Mathematics', icon: Brain, color: '#3b82f6' },
    { id: 'arts', name: 'Fine Arts', icon: Smile, color: '#ec4899' },
    { id: 'logic', name: 'Logical Reasoning', icon: Lightbulb, color: '#eab308' },
    { id: 'gk', name: 'General Knowledge', icon: Sparkles, color: '#10b981' },
    { id: 'nostalgia', name: 'Nostalgia', icon: Calendar, color: '#f97316' },
    { id: 'literature', name: 'Literature', icon: BookOpen, color: '#8b5cf6' },
    { id: 'wordpower', name: 'Word Power', icon: Bookmark, color: '#06b6d4' },
    { id: 'economics', name: 'Economics', icon: Compass, color: '#14b8a6' }
  ];

  const categoryStats = categoryDataList.map(cat => {
    const count = categoryCount[cat.id] || 0;
    const correct = categoryCorrect[cat.id] || 0;
    const total = categoryTotal[cat.id] || 0;
    const accuracy = count > 0 ? Math.round((correct / total) * 100) : null;
    return {
      ...cat,
      accuracy,
      quizzesTaken: count
    };
  });

  const totalQuizzes = scores.length;
  const totalCorrect = scores.reduce((sum, s) => sum + s.score, 0);
  const totalQuestions = scores.reduce((sum, s) => sum + s.total, 0);
  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Filter earned and locked badges
  const earnedBadgeIds = new Set(badges);
  const earnedBadges = BADGES.filter(b => earnedBadgeIds.has(b.id));
  const lockedBadges = BADGES.filter(b => !earnedBadgeIds.has(b.id));

  // Circular Chart stats calculation
  const strokeDashArray = `${overallAccuracy} 100`;

  // Draw trend line SVG
  const renderSVGChart = (scoreList) => {
    const last10 = scoreList.slice(-10);
    const width = 500;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    if (last10.length === 0) return null;

    // Map percentage values
    const points = last10.map((entry, idx) => {
      const x = paddingLeft + (idx / Math.max(1, last10.length - 1)) * chartWidth;
      const pct = entry.total > 0 ? entry.score / entry.total : 0;
      const y = paddingTop + chartHeight - pct * chartHeight;
      return { x, y, ...entry };
    });

    const pathData = points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';

    return (
      <div className="chart-container" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ minWidth: '400px' }}>
          {/* Y-axis Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, idx) => {
            const y = paddingTop + chartHeight - tick * chartHeight;
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text x={paddingLeft - 8} y={y + 4} fontSize="11px" fill="#888" textAnchor="end">{`${tick * 100}%`}</text>
              </g>
            );
          })}

          {/* Line Path */}
          {points.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="var(--primary-color)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Grid Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="var(--primary-color)"
                stroke="#fff"
                strokeWidth="2"
              />
              <title>{`${p.category}: ${p.score}/${p.total}`}</title>
              <text 
                x={p.x} 
                y={p.y - 12} 
                fontSize="11px" 
                fontWeight="bold" 
                fill="var(--primary-color)" 
                textAnchor="middle"
              >
                {`${Math.round((p.score / p.total) * 100)}%`}
              </text>
              <text
                x={p.x}
                y={height - 8}
                fontSize="11px"
                fill="#888"
                textAnchor="middle"
              >
                {`#${scores.length - last10.length + idx + 1}`}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ padding: 'var(--spacing-medium)' }} className="slide-up">
      <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-xlarge)', marginBottom: '10px', color: 'var(--primary-color)' }}>
        My Progress Dashboard
      </h2>
      <p style={{ textAlign: 'center', color: '#666', fontSize: 'var(--font-size-base)', marginBottom: '30px' }}>
        Visualize your mental agility training achievements.
      </p>

      {/* Profile Info Header */}
      <div className="premium-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-medium)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-large)', color: 'var(--text-color)' }}>{currentUser.displayName || 'Agile Thinker'}</h3>
          <p style={{ fontSize: 'var(--font-size-base)', color: '#777' }}>{currentUser.email}</p>
        </div>
        <div style={{ padding: '12px 24px', backgroundColor: '#f0fdf4', border: '2px solid #5cb85c', borderRadius: '12px' }}>
          <span className="streak-text" style={{ fontSize: 'var(--font-size-base)' }}>
            🏆 Training Streak: <strong>{streak} Days</strong>
          </span>
        </div>
      </div>

      {/* Visual stats grid */}
      <div className="dashboard-grid">
        <div className="dashboard-stat-card slide-up delay-1">
          <ClipboardList size={36} style={{ color: 'var(--primary-color)', marginBottom: '10px' }} />
          <div className="stat-value">{totalQuizzes}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>

        <div className="dashboard-stat-card slide-up delay-2">
          {/* Circular SVG Chart */}
          <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '70px', height: '70px', margin: '0 auto 10px' }}>
            <path className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path className="circle"
              strokeDasharray={strokeDashArray}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage" style={{ fontStyle: 'normal', fontWeight: 'bold', fontSize: '8px', textAnchor: 'middle', fill: 'var(--primary-color)' }}>
              {overallAccuracy}%
            </text>
          </svg>
          <div className="stat-label">Overall Accuracy</div>
        </div>
      </div>

      {/* Score History Trend Chart */}
      <div className="premium-card slide-up delay-2">
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '15px', color: 'var(--primary-color)' }}>
          📈 Training Trend (Last 10 Sessions)
        </h3>
        <p style={{ fontSize: 'var(--font-size-base)', color: '#666', marginBottom: '20px' }}>
          Track your mental agility progress over time. Keep training to see your scores rise!
        </p>
        {scores.length > 0 ? (
          renderSVGChart(scores)
        ) : (
          <p style={{ fontSize: 'var(--font-size-base)', color: '#666', textAlign: 'center', padding: '20px 0' }}>
            No quizzes taken yet. Complete your first training to see your trend!
          </p>
        )}
      </div>

      {/* Category Performance Section */}
      <div className="premium-card slide-up delay-3">
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '20px', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={28} /> Subject Accuracy Breakdown
        </h3>

        <div className="category-progress-container">
          {categoryStats.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <div key={index} className="category-progress-row">
                <div className="category-progress-info">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconComponent size={20} style={{ color: cat.color }} />
                    {cat.name}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>
                    {cat.accuracy !== null ? `${cat.accuracy}% (${cat.quizzesTaken} taken)` : 'Not Taken'}
                  </span>
                </div>
                <div className="progress-track" style={{ backgroundColor: '#eaeaea' }}>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${cat.accuracy !== null ? cat.accuracy : 0}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Section */}
      <div className="premium-card slide-up delay-4">
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '15px', color: 'var(--primary-color)' }}>
          🎖️ Brain Training Badges
        </h3>
        <p style={{ fontSize: 'var(--font-size-base)', color: '#666', marginBottom: '20px' }}>
          Earn badges by completing challenges and staying consistent!
        </p>

        {/* Tab Selection */}
        <div className="badge-tabs">
          <button 
            className={`badge-tab-btn ${activeBadgeTab === 'earned' ? 'active' : ''}`}
            onClick={() => setActiveBadgeTab('earned')}
            style={{ fontSize: 'var(--font-size-base)', padding: '12px' }}
          >
            Earned ({earnedBadges.length})
          </button>
          <button 
            className={`badge-tab-btn ${activeBadgeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveBadgeTab('available')}
            style={{ fontSize: 'var(--font-size-base)', padding: '12px' }}
          >
            Available ({lockedBadges.length})
          </button>
        </div>

        {activeBadgeTab === 'earned' ? (
          earnedBadges.length > 0 ? (
            <div className="badge-grid">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="badge-card" title={badge.desc}>
                  <div className="badge-emoji">{badge.emoji}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-desc">{badge.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--font-size-base)', color: '#666', textAlign: 'center', padding: '25px 0' }}>
              No badges earned yet. Complete quizzes to unlock your first badge!
            </p>
          )
        ) : (
          lockedBadges.length > 0 ? (
            <div className="badge-grid">
              {lockedBadges.map(badge => (
                <div key={badge.id} className="badge-card locked" title={badge.desc}>
                  <div className="badge-emoji">{badge.emoji}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-desc">{badge.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 'var(--font-size-base)', color: '#666', textAlign: 'center', padding: '25px 0' }}>
              🎉 You've unlocked all available badges! Fantastic job!
            </p>
          )
        )}
      </div>

      {/* Recent Scores Table */}
      <div className="premium-card slide-up delay-4" style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: 'var(--font-size-large)', marginBottom: '20px', color: 'var(--primary-color)' }}>Recent Training Logs</h3>
        
        {scores.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-base)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--secondary-color)', color: '#555' }}>
                    <th style={{ padding: '12px 10px' }}>Category</th>
                    <th style={{ padding: '12px 10px' }}>Score</th>
                    <th style={{ padding: '12px 10px', textAlign: 'right' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...scores]
                    .reverse()
                    .slice(0, showAllLogs ? scores.length : 5)
                    .map((scoreEntry, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eaeaea', animation: 'fadeIn 0.5s ease forwards', animationDelay: `${index * 0.05}s`, opacity: 0 }}>
                        <td style={{ padding: '16px 10px', fontWeight: '500' }}>{scoreEntry.category}</td>
                        <td style={{ padding: '16px 10px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            backgroundColor: (scoreEntry.score / scoreEntry.total) >= 0.7 ? '#e6f4ea' : '#fdf0ef',
                            color: (scoreEntry.score / scoreEntry.total) >= 0.7 ? '#137333' : '#c5221f'
                          }}>
                            {scoreEntry.score} / {scoreEntry.total}
                          </span>
                        </td>
                        <td style={{ padding: '16px 10px', color: '#666', textAlign: 'right' }}>{scoreEntry.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {scores.length > 5 && (
              <button 
                className="logs-toggle-btn"
                onClick={() => setShowAllLogs(!showAllLogs)}
              >
                {showAllLogs ? 'Hide Extra Logs' : `Show All Logs (${scores.length})`}
              </button>
            )}
          </>
        ) : (
          <p style={{ fontSize: 'var(--font-size-base)', color: '#666', textAlign: 'center', padding: '20px 0' }}>
            No quizzes taken yet. Start a quiz to see your progress logs!
          </p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button className="btn" style={{ display: 'flex', gap: '10px' }} onClick={() => navigate('/')}>
          <ArrowLeft size={24} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
