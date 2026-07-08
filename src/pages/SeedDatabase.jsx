import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, writeBatch, doc, setDoc } from 'firebase/firestore';

export default function SeedDatabase() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedData = async () => {
    setLoading(true);
    setMessage('Loading and parsing JSON files...');
    
    try {
      const responseArts = await fetch('/arts_questions.json');
      const arts = await responseArts.json();

      const responseMaths = await fetch('/maths_questions.json');
      const maths = await responseMaths.json();

      const responseGK = await fetch('/general_knowledge_questions.json');
      const gk = await responseGK.json();

      const responseHistory = await fetch('/indian_history_geography_quiz.json');
      let history = await responseHistory.json();
      if (Array.isArray(history)) {
        history = {
          questions: history.map(q => ({
            ...q,
            correct_answer: q.answer,
          }))
        };
      }

      const responseScience = await fetch('/science questions.json');
      const science = await responseScience.json();

      const responseLogic = await fetch('/logical reasoning and patterns.json');
      const logicReasoning = await responseLogic.json();

      const responseEcon = await fetch('/economics_financial_literacy.json');
      const economics = await responseEcon.json();

      const responseLiterature = await fetch('/india literature classics quiz.json');
      const literature = await responseLiterature.json();

      const responseNostalgia = await fetch('/indian cinema music nostalgia.json');
      const nostalgia = await responseNostalgia.json();

      const responseWordPower = await fetch('/word_power_language_puzzles.json');
      const wordPower = await responseWordPower.json();

      setMessage('Uploading categories to Firestore...');

      const allData = [
        { category: 'Arts', data: arts },
        { category: 'Mathematics', data: maths },
        { category: 'General Knowledge', data: gk },
        { category: 'Indian History & Geography', data: history },
        { category: 'Science', data: science },
        { category: 'Logical Reasoning & Patterns', data: logicReasoning },
        { category: 'Economics & Financial Literacy', data: economics },
        { category: 'Indian Literature & Classics', data: literature },
        { category: 'Cinema, Music & Retro Nostalgia', data: nostalgia },
        { category: 'Word Power & Language Puzzles', data: wordPower }
      ];

      let count = 0;
      
      for (const dataset of allData) {
        const batch = writeBatch(db);
        const questions = dataset.data.questions || [];
        
        questions.forEach((q) => {
          const docRef = doc(collection(db, 'questions'));
          batch.set(docRef, {
            id: q.id || count,
            category: dataset.category,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer || q.answer,
            difficulty: q.difficulty || 'easy'
          });
          count++;
        });
        
        await batch.commit();

        // Also write the complete list to categories collection
        const catRef = doc(db, 'categories', dataset.category);
        await setDoc(catRef, {
          questions: questions.map((q, idx) => ({
            id: q.id || idx,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer || q.answer,
            difficulty: q.difficulty || 'easy'
          }))
        });
      }

      setMessage(`Successfully uploaded ${count} questions across 10 categories to both collections!`);
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${error.message}. Ensure the JSON files are in the 'public' directory.`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Seed Database</h2>
      <p>This will upload questions from all 10 JSON files to Firestore.</p>
      <button className="btn" onClick={seedData} disabled={loading} style={{ marginTop: '20px' }}>
        {loading ? 'Seeding...' : 'Seed Data'}
      </button>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}
