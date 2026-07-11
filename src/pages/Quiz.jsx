import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Volume2, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BADGES, checkForNewBadges } from '../utils/badgeConfig';

import Mascot from '../components/Mascot';

const TOTAL_QUESTIONS = 10;

export default function Quiz() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

  // Voice Assistant States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  // Fetch subject questions from Firestore
  useEffect(() => {
    const startTime = Date.now();
    async function fetchQuestions() {
      try {
        const docRef = doc(db, 'categories', category);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const qList = data.questions || [];
          if (qList.length === 0) {
            setError('No questions available in this category.');
          } else {
            setQuestions(qList);
            // Randomly select 10 questions
            const shuffled = [...qList].sort(() => 0.5 - Math.random());
            setSelectedQuestions(shuffled.slice(0, TOTAL_QUESTIONS));
          }
        } else {
          setError('Category not found.');
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError('Failed to load questions.');
      }
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
    fetchQuestions();
  }, [category]);

  const handleAnswerSubmit = (option) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    const currentQ = selectedQuestions[currentQuestionIndex];
    setSelectedAnswer(option);
    
    if (option === currentQ.correct_answer) {
      setIsCorrectAnswer(true);
      setScore(prev => prev + 1);
    } else {
      setIsCorrectAnswer(false);
    }
  };

  const startConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrectAnswer(false);
    setTranscript('');
    setSpeechFeedback('');
 
    if (currentQuestionIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished, save scores and verify badges
      setIsFinished(true);
      saveQuizResults();
    }
  };

  const saveQuizResults = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      const userDocData = userSnap.exists() ? userSnap.data() : {};
      
      const currentStreak = userDocData.streak || 0;
      const lastPlayed = userDocData.lastPlayedDate || '';
      
      // Calculate active training streak growth
      let newStreak = 1;
      const today = new Date().toISOString().split('T')[0];
      
      if (lastPlayed) {
        const lastPlayedDate = new Date(lastPlayed);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate - lastPlayedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Played yesterday, increment streak
          newStreak = currentStreak + 1;
        } else if (diffDays === 0) {
          // Already played today, retain current streak
          newStreak = currentStreak || 1;
        }
      }
      
      const scoreEntry = {
        category,
        score,
        total: TOTAL_QUESTIONS,
        date: today
      };
      
      const updatedScores = [...(userDocData.scores || []), scoreEntry];
      const currentBadgeIds = userDocData.badges || [];
      
      // Evaluate new badge milestones (20+ badges configuration)
      const newlyUnlockedIds = checkForNewBadges({
        scores: userDocData.scores || [],
        streak: newStreak,
        badges: currentBadgeIds
      }, scoreEntry);
      const finalBadgeIds = [...currentBadgeIds, ...newlyUnlockedIds];

      await setDoc(userRef, {
        streak: newStreak,
        lastPlayedDate: today,
        scores: updatedScores,
        badges: finalBadgeIds
      }, { merge: true });

      // Trigger confetti and display badge unlock overlay if new ones are earned
      if (newlyUnlockedIds.length > 0) {
        const badgesToDisplay = BADGES.filter(b => newlyUnlockedIds.includes(b.id));
        setUnlockedBadges(badgesToDisplay);
        setShowBadgeModal(true);
        startConfetti();
      }

    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  // Helper to speak text
  const speakText = (text, onEndCallback) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.92; // Slightly slower for seniors
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const cancelSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Start microphone listening
  const startListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.start();
      } catch (e) {
        console.error("Start listening error:", e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.error("Stop listening error:", e);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  };

  // Read current question and options
  const readQuestionAloud = () => {
    if (selectedQuestions.length === 0) return;
    const currentQ = selectedQuestions[currentQuestionIndex];
    if (!currentQ) return;
    
    const textToSpeak = `Question. ${currentQ.question}. Option 1. ${currentQ.options[0]}. Option 2. ${currentQ.options[1]}. Option 3. ${currentQ.options[2]}. Option 4. ${currentQ.options[3]}.`;
    speakText(textToSpeak, () => {
      if (isVoiceMode && selectedAnswer === null) {
        startListening();
      }
    });
  };

  // Trigger voice mode welcome intro
  const triggerVoiceIntro = () => {
    const intro = "Voice Assistant mode enabled. I will read each question and listen for your answer. You can say option 1, option 2, or say the answer itself.";
    speakText(intro, () => {
      readQuestionAloud();
    });
  };

  // Match voice input against options
  const handleVoiceCommand = (command) => {
    if (selectedQuestions.length === 0) return;
    const currentQ = selectedQuestions[currentQuestionIndex];
    if (!currentQ) return;

    // 1. If waiting for Next Question
    if (selectedAnswer !== null) {
      if (command.includes('next') || command.includes('continue') || command.includes('go') || command.includes('proceed')) {
        setSpeechFeedback("Advancing to next question...");
        setTimeout(() => {
          handleNextQuestion();
        }, 1000);
      }
      return;
    }

    // 2. Otherwise match command to options
    let matchedOption = null;

    // Check numerical option tags
    if (command.includes('one') || command.includes('1') || command.includes('first')) {
      matchedOption = currentQ.options[0];
    } else if (command.includes('two') || command.includes('2') || command.includes('second') || command.includes('to')) {
      matchedOption = currentQ.options[1];
    } else if (command.includes('three') || command.includes('3') || command.includes('third')) {
      matchedOption = currentQ.options[2];
    } else if (command.includes('four') || command.includes('4') || command.includes('fourth') || command.includes('for')) {
      matchedOption = currentQ.options[3];
    }

    // Direct fuzzy string match of the options text
    if (!matchedOption) {
      for (const option of currentQ.options) {
        const cleanOpt = option.toLowerCase().trim();
        if (command.includes(cleanOpt) || cleanOpt.includes(command)) {
          matchedOption = option;
          break;
        }
      }
    }

    if (matchedOption) {
      setSpeechFeedback(`Matched option: "${matchedOption}"`);
      handleAnswerSubmit(matchedOption);
      
      // Auto speak result feedback
      const isCorrect = matchedOption === currentQ.correct_answer;
      const feedbackSpeech = isCorrect 
        ? "Correct answer! Say next to continue." 
        : `Incorrect. The correct answer is ${currentQ.correct_answer}. Say next to continue.`;
        
      setTimeout(() => {
        speakText(feedbackSpeech, () => {
          if (isVoiceMode) {
            startListening();
          }
        });
      }, 500);
    } else {
      setSpeechFeedback("Could not match command. Please try again.");
      if (isVoiceMode) {
        setTimeout(() => {
          startListening();
        }, 1500);
      }
    }
  };

  // Setup Speech Recognition Instance
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      
      rec.onstart = () => {
        setIsListening(true);
        setSpeechFeedback('');
      };
      
      rec.onend = () => {
        setIsListening(false);
      };
      
      rec.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcriptText = event.results[resultIndex][0].transcript.toLowerCase().trim();
        setTranscript(transcriptText);
        
        if (event.results[resultIndex].isFinal) {
          handleVoiceCommand(transcriptText);
        }
      };
      
      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      setRecognitionInstance(rec);
    }

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentQuestionIndex, selectedQuestions, selectedAnswer]);

  // Auto trigger speech on new question load under Auto Voice Mode
  useEffect(() => {
    if (isVoiceMode && selectedQuestions.length > 0 && !loading && !isFinished) {
      setTranscript('');
      setSpeechFeedback('');
      // Delay slightly for screen transition
      const timer = setTimeout(() => {
        readQuestionAloud();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, isVoiceMode, loading, isFinished]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}>
        <Mascot state="loading" width="240" height="240" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div className="error-message">{error}</div>
        <button className="btn" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div style={{ padding: 'var(--spacing-medium)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {showBadgeModal && (
          <div className="badge-modal-overlay">
            <div className="badge-modal-content" style={{ padding: 'var(--spacing-large)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xlarge)', color: 'var(--primary-color)', marginBottom: '15px' }}>
                🎉 Badges Unlocked!
              </h2>
              <p style={{ fontSize: 'var(--font-size-base)', color: '#555', marginBottom: '20px' }}>
                Excellent achievement! You earned:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                {unlockedBadges.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #ddd' }}>
                    <span style={{ fontSize: 'var(--font-size-xlarge)' }}>{b.emoji}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--font-size-base)', color: 'var(--primary-color)' }}>{b.name}</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn" onClick={() => setShowBadgeModal(false)} style={{ marginBottom: 0 }}>
                Awesome!
              </button>
            </div>
          </div>
        )}

        <div style={{ width: '160px', height: '130px', marginBottom: '10px' }}>
          <Mascot state="wave" width="160" height="130" />
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xlarge)', color: '#2b6777', marginBottom: '20px' }}>Quiz Completed!</h2>
        <div className="premium-card" style={{ padding: 'var(--spacing-large)', width: '100%', maxWidth: '480px', marginBottom: '20px' }}>
          <p style={{ fontSize: 'var(--font-size-large)', margin: '20px 0', fontWeight: 'bold' }}>Your Score: {score} out of {TOTAL_QUESTIONS}</p>
          <p style={{ fontSize: 'var(--font-size-base)' }}>Great job exercising your brain today!</p>
        </div>
        <button className="btn" style={{ maxWidth: '480px', width: '100%' }} onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQ = selectedQuestions[currentQuestionIndex];

  return (
    <div style={{ padding: 'var(--spacing-medium)' }}>
      {showBadgeModal && (
        <div className="badge-modal-overlay">
          <div className="badge-modal-content" style={{ padding: 'var(--spacing-large)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xlarge)', color: 'var(--primary-color)', marginBottom: '15px' }}>
              🎉 Badges Unlocked!
            </h2>
            <p style={{ fontSize: 'var(--font-size-base)', color: '#555', marginBottom: '20px' }}>
              Excellent achievement! You earned:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
              {unlockedBadges.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #ddd' }}>
                  <span style={{ fontSize: 'var(--font-size-xlarge)' }}>{b.emoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 'var(--font-size-base)', color: 'var(--primary-color)' }}>{b.name}</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn" onClick={() => setShowBadgeModal(false)} style={{ marginBottom: 0 }}>
              Awesome!
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: 'var(--font-size-base)', fontWeight: '500', color: '#666' }}>
        <span>Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</span>
      </div>

      {/* Voice Assistant Panel */}
      <div 
        className="premium-card slide-up" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          padding: '16px', 
          marginBottom: '20px', 
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: '#fafbfc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              🎙️ Voice Assistant
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`btn ${isVoiceMode ? '' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '14px', minHeight: 'auto', margin: 0 }}
              onClick={() => {
                const nextMode = !isVoiceMode;
                setIsVoiceMode(nextMode);
                if (nextMode) {
                  triggerVoiceIntro();
                } else {
                  cancelSpeech();
                  stopListening();
                }
              }}
            >
              {isVoiceMode ? 'Auto Mode: ON' : 'Turn Auto Mode ON'}
            </button>
            <button 
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '14px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
              onClick={readQuestionAloud}
              disabled={isSpeaking}
            >
              <Volume2 size={16} /> Read Aloud
            </button>
            {SpeechRecognition && (
              <button 
                className={`btn ${isListening ? 'btn-error' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '14px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}
                onClick={toggleListening}
              >
                <Mic size={16} className={isListening ? 'pulse-animation' : ''} />
                {isListening ? 'Listening...' : 'Speak Answer'}
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript / Feedback Indicator */}
        {(isListening || speechFeedback || transcript) && (
          <div 
            style={{ 
              fontSize: '14px', 
              padding: '10px 14px', 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              border: '1px dashed #ccc',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <span className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d9534f', display: 'inline-block' }} />
                <span>Hearing: <strong style={{ color: 'var(--text-color)' }}>{transcript || 'Say your answer...'}</strong></span>
              </div>
            )}
            {speechFeedback && (
              <div style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
                ✨ {speechFeedback}
              </div>
            )}
            {!isListening && !speechFeedback && selectedAnswer === null && (
              <div style={{ fontSize: '13px', color: '#777' }}>
                💡 Tip: Say the option text (e.g. <strong>"{currentQ.options[0]}"</strong>) or simply say <strong>"Option One"</strong>
              </div>
            )}
            {!isListening && !speechFeedback && selectedAnswer !== null && (
              <div style={{ fontSize: '13px', color: '#777' }}>
                💡 Tip: Say <strong>"Next"</strong> to proceed.
              </div>
            )}
          </div>
        )}
      </div>
      
      <div key={currentQuestionIndex} className="slide-up">
        <div className="premium-card" style={{ marginBottom: '30px', padding: 'var(--spacing-medium)' }}>
          <h3 style={{ fontSize: 'var(--font-size-large)', lineHeight: '1.5', fontWeight: '500' }}>{currentQ.question}</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentQ.options && currentQ.options.map((option, index) => {
            let btnClass = "btn btn-secondary";
            let styleOverrides = { textAlign: 'left', minHeight: 'var(--btn-min-height)', padding: 'var(--spacing-medium)', fontSize: 'var(--font-size-large)', whiteSpace: 'normal', height: 'auto', marginBottom: 0 };
            
            if (selectedAnswer !== null) {
              if (option === currentQ.correct_answer) {
                btnClass = "btn btn-success";
              } else if (option === selectedAnswer) {
                btnClass = "btn btn-error";
              }
            }

            return (
              <button 
                key={index} 
                className={`${btnClass} slide-up delay-${index + 1}`}
                style={styleOverrides}
                onClick={() => handleAnswerSubmit(option)}
                disabled={selectedAnswer !== null}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '10px' }}>
                  <span>{option}</span>
                  {selectedAnswer !== null && option === currentQ.correct_answer && <CheckCircle size={28} style={{ flexShrink: 0 }} />}
                  {selectedAnswer !== null && option === selectedAnswer && option !== currentQ.correct_answer && <XCircle size={28} style={{ flexShrink: 0 }} />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selectedAnswer !== null && (
        <div style={{ marginTop: '30px', textAlign: 'center' }} className="slide-up">
          {isCorrectAnswer ? (
            <div className="success-message" style={{ fontSize: 'var(--font-size-large)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <CheckCircle size={28} /> Correct!
            </div>
          ) : (
            <div className="error-message" style={{ fontSize: 'var(--font-size-large)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <XCircle size={28} /> Incorrect. The answer is {currentQ.correct_answer}.
            </div>
          )}
          
          <button className="btn" style={{ marginTop: '20px' }} onClick={handleNextQuestion}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}
