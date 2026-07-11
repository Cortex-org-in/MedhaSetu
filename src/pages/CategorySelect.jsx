import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calculator, Palette, Globe, Atom, Brain, Coins, BookOpen, Film, SpellCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translateText } from '../utils/translationService';

export default function CategorySelect() {
  const navigate = useNavigate();
  const { language } = useAuth();

  const [ui, setUi] = useState({
    title: "Choose a Category",
    subtitle: "Select the area you'd like to practice today.",
    arts: "Arts",
    math: "Mathematics",
    gk: "General Knowledge",
    geo: "Indian History & Geo",
    science: "Science",
    logic: "Logical Reasoning",
    econ: "Economics & Finance",
    lit: "Literature & Classics",
    cinema: "Cinema & Nostalgia",
    word: "Word Power Puzzles",
    backHome: "Back to Home"
  });

  useEffect(() => {
    async function loadTranslations() {
      const defaultUI = {
        title: "Choose a Category",
        subtitle: "Select the area you'd like to practice today.",
        arts: "Arts",
        math: "Mathematics",
        gk: "General Knowledge",
        geo: "Indian History & Geo",
        science: "Science",
        logic: "Logical Reasoning",
        econ: "Economics & Finance",
        lit: "Literature & Classics",
        cinema: "Cinema & Nostalgia",
        word: "Word Power Puzzles",
        backHome: "Back to Home"
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
        console.error("Failed to load category translations:", err);
      }
    }
    loadTranslations();
  }, [language]);

  return (
    <div style={{ padding: 'var(--spacing-medium)' }} className="slide-up">
      <h2 style={{ textAlign: 'center', fontSize: 'var(--font-size-xlarge)', marginBottom: '10px', color: 'var(--primary-color)' }}>
        {ui.title}
      </h2>
      <p style={{ textAlign: 'center', fontSize: 'var(--font-size-base)', marginBottom: '30px', color: '#555' }}>
        {ui.subtitle}
      </p>

      <div className="category-grid">
        <button className="btn btn-secondary category-select-btn slide-up delay-1" onClick={() => navigate('/quiz/Arts')}>
          <Palette size={28} style={{ marginRight: '10px' }} />
          {ui.arts}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-1" onClick={() => navigate('/quiz/Mathematics')}>
          <Calculator size={28} style={{ marginRight: '10px' }} />
          {ui.math}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-2" onClick={() => navigate('/quiz/General Knowledge')}>
          <Globe size={28} style={{ marginRight: '10px' }} />
          {ui.gk}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-2" onClick={() => navigate('/quiz/Indian History & Geography')}>
          <MapPin size={28} style={{ marginRight: '10px' }} />
          {ui.geo}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-3" onClick={() => navigate('/quiz/Science')}>
          <Atom size={28} style={{ marginRight: '10px' }} />
          {ui.science}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-3" onClick={() => navigate('/quiz/Logical Reasoning & Patterns')}>
          <Brain size={28} style={{ marginRight: '10px' }} />
          {ui.logic}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Economics & Financial Literacy')}>
          <Coins size={28} style={{ marginRight: '10px' }} />
          {ui.econ}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Indian Literature & Classics')}>
          <BookOpen size={28} style={{ marginRight: '10px' }} />
          {ui.lit}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Cinema, Music & Retro Nostalgia')}>
          <Film size={28} style={{ marginRight: '10px' }} />
          {ui.cinema}
        </button>
        <button className="btn btn-secondary category-select-btn slide-up delay-4" onClick={() => navigate('/quiz/Word Power & Language Puzzles')}>
          <SpellCheck size={28} style={{ marginRight: '10px' }} />
          {ui.word}
        </button>
      </div>

      <div style={{ marginTop: '35px' }}>
        <button className="btn" style={{ backgroundColor: '#ccc', color: '#333', boxShadow: 'none' }} onClick={() => navigate('/')}>
          {ui.backHome}
        </button>
      </div>
    </div>
  );
}
