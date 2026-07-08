import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calculator, Palette, Globe, Atom, Brain, Coins, BookOpen, Film, SpellCheck } from 'lucide-react';

export default function CategorySelect() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 'var(--spacing-medium)' }} className="slide-up">
      <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-xlarge)', marginBottom: '10px', color: 'var(--primary-color)' }}>
        Choose a Category
      </h2>
      <p style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', marginBottom: '30px', color: '#555' }}>
        Select the area you'd like to practice today.
      </p>

      <div className="category-grid">
        <button className="btn btn-secondary category-select-btn slide-up delay-1" onClick={() => navigate('/quiz/Arts')}>
          <Palette size={28} style={{ marginRight: '10px' }} />
          Arts
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-1" onClick={() => navigate('/quiz/Mathematics')}>
          <Calculator size={28} style={{ marginRight: '10px' }} />
          Mathematics
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-2" onClick={() => navigate('/quiz/General Knowledge')}>
          <Globe size={28} style={{ marginRight: '10px' }} />
          General Knowledge
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-2" onClick={() => navigate('/quiz/Indian History & Geography')}>
          <MapPin size={28} style={{ marginRight: '10px' }} />
          Indian History & Geo
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-3" onClick={() => navigate('/quiz/Science')}>
          <Atom size={28} style={{ marginRight: '10px' }} />
          Science
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-3" onClick={() => navigate('/quiz/Logical Reasoning & Patterns')}>
          <Brain size={28} style={{ marginRight: '10px' }} />
          Logical Reasoning
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Economics & Financial Literacy')}>
          <Coins size={28} style={{ marginRight: '10px' }} />
          Economics & Finance
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Indian Literature & Classics')}>
          <BookOpen size={28} style={{ marginRight: '10px' }} />
          Literature & Classics
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Cinema, Music & Retro Nostalgia')}>
          <Film size={28} style={{ marginRight: '10px' }} />
          Cinema & Nostalgia
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Word Power & Language Puzzles')}>
          <SpellCheck size={28} style={{ marginRight: '10px' }} />
          Word Power Puzzles
        </button>
      </div>

      <div style={{ marginTop: '35px' }}>
        <button className="btn" style={{ backgroundColor: '#ccc', color: '#333', boxShadow: 'none' }} onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
