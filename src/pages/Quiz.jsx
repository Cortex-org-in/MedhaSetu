import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Volume2, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BADGES, checkForNewBadges } from '../utils/badgeConfig';
import Mascot from '../components/Mascot';
import { translateText, translateQuestion, TRANSLATIONS } from '../utils/translationService';

const TOTAL_QUESTIONS = 10;

const LANGUAGE_NUMBER_MAP = {
  hi: [
    ['एक', 'पहला', 'one', '1', 'first'],
    ['दो', 'दूसरा', 'two', '2', 'second'],
    ['तीन', 'तीसरा', 'three', '3', 'third'],
    ['चार', 'चौथा', 'four', '4', 'fourth']
  ],
  bn: [
    ['এক', 'প্রথম', 'one', '1', 'first'],
    ['দুই', 'দ্বিতীয়', 'two', '2', 'second'],
    ['তিন', 'তৃতীয়', 'three', '3', 'third'],
    ['চার', 'চতুর্থ', 'four', '4', 'fourth']
  ],
  mr: [
    ['एक', 'पहिले', 'one', '1', 'first'],
    ['दोन', 'दुसरे', 'two', '2', 'second'],
    ['तीन', 'तिसरे', 'three', '3', 'third'],
    ['चार', 'चौथे', 'four', '4', 'fourth']
  ],
  te: [
    ['ఒకటి', 'మొదటి', 'one', '1', 'first'],
    ['రెండు', 'రెండవ', 'two', '2', 'second'],
    ['మూడు', 'మూడవ', 'three', '3', 'third'],
    ['నాలుగు', 'నాలుగవ', 'four', '4', 'fourth']
  ],
  ta: [
    ['ஒன்று', 'முதல்', 'one', '1', 'first'],
    ['இரண்டு', 'இரண்டாவது', 'two', '2', 'second'],
    ['மூன்று', 'மூன்றாவது', 'three', '3', 'third'],
    ['நான்கு', 'நான்காவது', 'four', '4', 'fourth']
  ],
  en: [
    ['one', '1', 'first'],
    ['two', '2', 'second'],
    ['three', '3', 'third'],
    ['four', '4', 'fourth']
  ]
};

export default function Quiz() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, language } = useAuth();
  
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

  // Dynamic Question translation states
  const [currentTranslatedQ, setCurrentTranslatedQ] = useState(null);
  const [translatingQ, setTranslatingQ] = useState(false);

  // Voice Assistant States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

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

  // Load translations dynamically for current question
  useEffect(() => {
    if (selectedQuestions.length === 0) return;
    const currentQ = selectedQuestions[currentQuestionIndex];
    if (!currentQ) return;
    
    if (!language || language === 'en') {
      setCurrentTranslatedQ(currentQ);
      return;
    }
    
    async function loadQuestionTranslation() {
      setTranslatingQ(true);
      try {
        const trans = await translateQuestion(currentQ, language);
        setCurrentTranslatedQ(trans);
      } catch (err) {
        console.error("Error translating current question:", err);
        setCurrentTranslatedQ(currentQ);
      } finally {
        setTranslatingQ(false);
      }
    }
    
    loadQuestionTranslation();
  }, [currentQuestionIndex, selectedQuestions, language]);

  const handleAnswerSubmit = (option) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks

    const currentQ = currentTranslatedQ || selectedQuestions[currentQuestionIndex];
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

  // Keep track of voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const updateVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Helper to speak text
  // Helper to speak text
  const speakText = (text, onEndCallback, forceEnglish = false) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set synthesis language
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
      te: 'te-IN',
      ta: 'ta-IN'
    };
    const targetLangPrefix = forceEnglish ? 'en' : (language || 'en');
    const targetLangCode = forceEnglish ? 'en-US' : (langMap[targetLangPrefix] || 'en-US');
    utterance.lang = targetLangCode;
    utterance.rate = 0.92; // Slightly slower for seniors

    // Match premium natural human voice in target language if available
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritized list of high-quality human/natural voices per language
    const HIGH_QUALITY_VOICES = {
      en: ['microsoft aria', 'google us english', 'google uk english', 'samantha', 'english'],
      hi: ['swara', 'madhur', 'google हिन्दी', 'google hindi', 'lekha', 'hindi', 'hi-in'],
      bn: ['nabanita', 'pradeep', 'google বাংলা', 'google bengali', 'bengali', 'bn-in'],
      mr: ['aarohi', 'manohar', 'google मराठी', 'google marathi', 'marathi', 'mr-in'],
      te: ['shruti', 'mohan', 'google తెలుగు', 'google telugu', 'telugu', 'te-in'],
      ta: ['pallavi', 'valluvar', 'google தமிழ்', 'google tamil', 'tamil', 'ta-in']
    };

    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
    
    let selectedVoice = null;
    const preferredPatterns = HIGH_QUALITY_VOICES[targetLangPrefix] || [];
    
    for (const pattern of preferredPatterns) {
      selectedVoice = langVoices.find(v => v.name.toLowerCase().includes(pattern.toLowerCase()));
      if (selectedVoice) break;
    }
    
    if (!selectedVoice) {
      selectedVoice = langVoices[0] || voices.find(v => v.lang.startsWith('en'));
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
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
    const currentQ = currentTranslatedQ || selectedQuestions[currentQuestionIndex];
    const englishQ = selectedQuestions[currentQuestionIndex];
    if (!currentQ || !englishQ) return;
    
    // Toggle play/stop behavior
    if (isSpeaking) {
      cancelSpeech();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const targetLangPrefix = language || 'en';
    const hasVoice = voices.some(v => v.lang.toLowerCase().startsWith(targetLangPrefix));

    if (hasVoice || targetLangPrefix === 'en') {
      const textToSpeak = `${t.questionWord || 'Question'}. ${currentQ.question}. ${t.optionWord || 'Option'} 1. ${currentQ.options[0]}. ${t.optionWord || 'Option'} 2. ${currentQ.options[1]}. ${t.optionWord || 'Option'} 3. ${currentQ.options[2]}. ${t.optionWord || 'Option'} 4. ${currentQ.options[3]}.`;
      speakText(textToSpeak, null, false);
    } else {
      const textToSpeak = `Question. ${englishQ.question}. Option 1. ${englishQ.options[0]}. Option 2. ${englishQ.options[1]}. Option 3. ${englishQ.options[2]}. Option 4. ${englishQ.options[3]}.`;
      speakText(textToSpeak, null, true);
    }
  };

  // Match voice input against options
  const handleVoiceCommand = (command) => {
    const currentQ = currentTranslatedQ || selectedQuestions[currentQuestionIndex];
    if (!currentQ) return;

    // 1. If waiting for Next Question
    if (selectedAnswer !== null) {
      if (command.includes('next') || command.includes('continue') || command.includes('go') || command.includes('proceed') || command.includes('अगला') || command.includes('পরবর্তী') || command.includes('पुढे') || command.includes('తదుపరి') || command.includes('அடுத்து')) {
        setSpeechFeedback("Advancing...");
        setTimeout(() => {
          handleNextQuestion();
        }, 800);
      }
      return;
    }

    // 2. Match command to options by Option Number patterns in selected language
    let matchedOption = null;
    const lang = language || 'en';
    const maps = LANGUAGE_NUMBER_MAP[lang] || LANGUAGE_NUMBER_MAP.en;

    if (maps[0].some(p => command.includes(p))) {
      matchedOption = currentQ.options[0];
    } else if (maps[1].some(p => command.includes(p))) {
      matchedOption = currentQ.options[1];
    } else if (maps[2].some(p => command.includes(p))) {
      matchedOption = currentQ.options[2];
    } else if (maps[3].some(p => command.includes(p))) {
      matchedOption = currentQ.options[3];
    }

    if (matchedOption) {
      setSpeechFeedback(`${t.matchedOption || 'Matched option'}: "${matchedOption}"`);
      handleAnswerSubmit(matchedOption);
      
      const isCorrect = matchedOption === currentQ.correct_answer;
      
      const voices = window.speechSynthesis.getVoices();
      const targetLangPrefix = language || 'en';
      const hasVoice = voices.some(v => v.lang.toLowerCase().startsWith(targetLangPrefix));

      let feedbackText = "";
      let forceEng = false;
      if (hasVoice || targetLangPrefix === 'en') {
        feedbackText = isCorrect ? t.correct : `${t.incorrect} ${currentQ.correct_answer}`;
      } else {
        const correctEngAns = selectedQuestions[currentQuestionIndex].correct_answer;
        feedbackText = isCorrect ? "Correct answer!" : `Incorrect. The correct answer is ${correctEngAns}`;
        forceEng = true;
      }

      setTimeout(() => {
        speakText(feedbackText, null, forceEng);
      }, 300);
    } else {
      setSpeechFeedback("Could not match command. Please say the option number clearly.");
    }
  };

  // Setup Speech Recognition Instance
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      
      // Map Speech recognition language
      const langMap = {
        en: 'en-US',
        hi: 'hi-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        te: 'te-IN',
        ta: 'ta-IN'
      };
      rec.lang = langMap[language] || 'en-US';
      
      rec.onstart = () => {
        setIsListening(true);
        setTranscript('');
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
  }, [currentQuestionIndex, selectedQuestions, selectedAnswer, language]);

  if (loading || translatingQ) {
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
        <h2 style={{ fontSize: 'var(--font-size-xlarge)', color: '#2b6777', marginBottom: '20px' }}>{t.quizCompleted}</h2>
        <div className="premium-card" style={{ padding: 'var(--spacing-large)', width: '100%', maxWidth: '480px', marginBottom: '20px' }}>
          <p style={{ fontSize: 'var(--font-size-large)', margin: '20px 0', fontWeight: 'bold' }}>{t.yourScore}: {score} out of {TOTAL_QUESTIONS}</p>
          <p style={{ fontSize: 'var(--font-size-base)' }}>{t.greatJob}</p>
        </div>
        <button className="btn" style={{ maxWidth: '480px', width: '100%' }} onClick={() => navigate('/')}>{t.backToDashboard}</button>
      </div>
    );
  }

  const currentQ = currentTranslatedQ || selectedQuestions[currentQuestionIndex];

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
        <span>{t.questionWord || 'Question'} {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}</span>
      </div>
      
      {currentQ && (
        <div key={currentQuestionIndex} className="slide-up">
          <div className="premium-card" style={{ marginBottom: '30px', padding: 'var(--spacing-medium)' }}>
            {translatingQ ? (
              <p style={{ fontStyle: 'italic', color: '#777', margin: 0 }}>Translating question...</p>
            ) : (
              <h3 style={{ fontSize: 'var(--font-size-large)', lineHeight: '1.5', fontWeight: '500' }}>{currentQ.question}</h3>
            )}
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
      )}

      {/* Premium Voice Companion Panel (Placed directly under options) */}
      {currentQ && (
        <div 
          className="premium-card slide-up" 
          style={{ 
            marginTop: '30px', 
            padding: '24px', 
            borderRadius: '24px',
            border: '1px solid rgba(43, 103, 119, 0.08)',
            boxShadow: '0 10px 40px rgba(43, 103, 119, 0.06)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafcfc 100%)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px' }}>
              {t.voiceAssistant}
            </span>
          </div>

          <p style={{ fontSize: '14px', color: '#ff5722', fontWeight: 'bold', margin: '0 auto', maxWidth: '420px', lineHeight: '1.4' }}>
            {t.speakOptionNote}
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', margin: '10px 0' }}>
            <button 
              className={`btn ${isSpeaking ? 'btn-error' : 'btn-secondary'}`}
              style={{ 
                padding: '12px 24px', 
                fontSize: '15px', 
                borderRadius: '30px', 
                minHeight: '48px', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                fontWeight: '600',
                boxShadow: isSpeaking ? '0 4px 15px rgba(217, 83, 79, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onClick={readQuestionAloud}
              disabled={translatingQ}
            >
              <Volume2 size={20} />
              {isSpeaking ? t.stopReading : t.readAloud}
            </button>
            
            {SpeechRecognition && (
              <button 
                className={`btn ${isListening ? 'btn-error' : 'btn-secondary'}`}
                style={{ 
                  padding: '12px 24px', 
                  fontSize: '15px', 
                  borderRadius: '30px', 
                  minHeight: '48px', 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontWeight: '600',
                  boxShadow: isListening ? '0 4px 15px rgba(217, 83, 79, 0.2)' : '0 4px 15px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}
                onClick={toggleListening}
                disabled={translatingQ}
              >
                <Mic size={20} className={isListening ? 'pulse-animation' : ''} />
                {isListening ? t.listening : t.speakAnswer}
              </button>
            )}
          </div>

          {/* Live Transcript / Feedback Indicator */}
          {(isListening || speechFeedback || transcript) && (
            <div 
              style={{ 
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#ffffff', 
                borderRadius: '16px', 
                border: isListening ? '1px dashed #d9534f' : '1px dashed rgba(43, 103, 119, 0.2)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'slideUp 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', flex: 1 }}>
                {isListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '14px' }}>
                    <span className="live-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#d9534f', display: 'inline-block' }} />
                    <span>{t.hearing}: <strong style={{ color: 'var(--text-color)' }}>{transcript || '...'}</strong></span>
                  </div>
                )}
                {speechFeedback && (
                  <div style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '14px' }}>
                    ✨ {speechFeedback}
                  </div>
                )}
              </div>
              {isListening && (
                <div className="sound-wave">
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedAnswer !== null && (
        <div style={{ marginTop: '30px', textAlign: 'center' }} className="slide-up">
          {isCorrectAnswer ? (
            <div className="success-message" style={{ fontSize: 'var(--font-size-large)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <CheckCircle size={28} /> {t.correct}
            </div>
          ) : (
            <div className="error-message" style={{ fontSize: 'var(--font-size-large)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <XCircle size={28} /> {t.incorrect} {currentQ.correct_answer}.
            </div>
          )}
          
          <button className="btn" style={{ marginTop: '20px' }} onClick={handleNextQuestion}>
            {t.nextQuestion}
          </button>
        </div>
      )}
    </div>
  );
}
