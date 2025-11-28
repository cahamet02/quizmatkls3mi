import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import LevelMap from './components/LevelMap';
import GameLevel from './components/GameLevel';
import { Play, RotateCcw, Share2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Initialize state from localStorage if available
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('mathAdventureState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Gagal memuat save data", e);
    }
    return {
      currentLevel: 1,
      unlockedLevel: 1,
      score: 0,
      view: 'home'
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('mathAdventureState', JSON.stringify(state));
  }, [state]);

  const startGame = () => {
    setState(prev => ({ ...prev, view: 'map' }));
  };

  const selectLevel = (level: number) => {
    setState(prev => ({ ...prev, currentLevel: level, view: 'game' }));
  };

  const backToMap = () => {
    setState(prev => ({ ...prev, view: 'map' }));
  };

  const handleLevelComplete = (scoreDelta: number) => {
    setState(prev => {
      let newUnlocked = prev.unlockedLevel;
      // Default behavior: kembali ke map setelah menjawab (baik benar maupun salah)
      let nextView: GameState['view'] = 'map'; 

      if (scoreDelta > 0) {
        // Jawaban Benar
        if (prev.currentLevel === prev.unlockedLevel && prev.unlockedLevel < 100) {
          newUnlocked = prev.unlockedLevel + 1;
        }
        
        // Jika tamat level 100
        if (prev.currentLevel === 100 && scoreDelta > 0) {
            nextView = 'victory';
            triggerVictoryConfetti();
        }
      } else {
        // Jawaban Salah: Tetap kembali ke map, unlockedLevel tidak bertambah
      }

      return {
        ...prev,
        score: Math.max(0, prev.score + scoreDelta), // Skor tidak boleh minus
        unlockedLevel: newUnlocked,
        view: nextView
      };
    });
  };

  const triggerVictoryConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const resetGame = () => {
    if (confirm('Apakah kamu yakin ingin mengulang permainan dari awal? Skor akan hilang.')) {
      setState({
        currentLevel: 1,
        unlockedLevel: 1,
        score: 0,
        view: 'home'
      });
    }
  };

  const handleShare = async () => {
    const text = `Aku sudah mencapai level ${state.unlockedLevel} di Petualangan Matematika dengan skor ${state.score}! Bisakah kamu mengalahkanku?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Petualangan Matematika',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href);
      alert('Teks disalin ke clipboard! Bagikan ke temanmu.');
    }
  };

  // ---------------- Render Views ----------------

  if (state.view === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/20 animate-fade-in-up">
          <div className="mb-6 inline-block p-4 bg-yellow-400 rounded-full shadow-lg">
            <span className="text-4xl">🧮</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md font-fredoka">Petualangan Matematika</h1>
          <p className="text-lg mb-8 text-blue-100">Jadilah juara matematika kelas 3!</p>
          
          <button 
            onClick={startGame}
            className="w-full bg-white text-indigo-600 text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-yellow-300 hover:text-indigo-800 hover:scale-105 transition transform flex items-center justify-center gap-3 mb-4"
          >
            <Play className="fill-current w-6 h-6" />
            Mulai Bermain
          </button>

          {state.unlockedLevel > 1 && (
            <div className="bg-black/20 rounded-lg p-3 mt-4 flex items-center justify-between text-sm">
               <span>Lanjut Level {state.unlockedLevel}</span>
               <span className="font-bold flex items-center gap-1"><Award size={14}/> Skor: {state.score}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state.view === 'game') {
    return (
      <GameLevel 
        // Key ensures a fresh component instance for every level attempt
        key={`${state.currentLevel}-${state.score}`} 
        level={state.currentLevel} 
        onComplete={handleLevelComplete}
        onExit={backToMap}
      />
    );
  }

  if (state.view === 'victory') {
    return (
       <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-4 text-center">
         <div className="bg-white/90 backdrop-blur rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <h1 className="text-4xl md:text-6xl font-bold text-yellow-600 mb-2">SELAMAT! 🎉</h1>
            <p className="text-xl text-gray-600 font-bold mb-8">Kamu menaklukkan 100 Level!</p>
            
            <div className="bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 mb-8">
                <p className="text-gray-500 uppercase tracking-widest font-bold text-xs mb-2">Skor Akhir</p>
                <p className="text-6xl font-black text-indigo-600">{state.score}</p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleShare}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1"
              >
                <Share2 size={20} />
                Bagikan Prestasi
              </button>
              
              <button 
                onClick={resetGame}
                className="w-full bg-white border-2 border-gray-200 text-gray-500 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold transition"
              >
                Main Lagi Dari Awal
              </button>
            </div>
         </div>
       </div>
    );
  }

  // Default: Level Map
  return (
    <>
      <LevelMap 
        unlockedLevel={state.unlockedLevel} 
        onSelectLevel={selectLevel} 
        onBack={() => setState(prev => ({ ...prev, view: 'home' }))}
        score={state.score}
      />
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={resetGame}
          className="bg-white/80 backdrop-blur shadow-sm border border-gray-200 p-2 rounded-full text-red-400 hover:text-red-600 hover:bg-white transition flex items-center gap-1 text-xs font-bold px-3"
          title="Reset Progress"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>
    </>
  );
}