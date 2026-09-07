import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { GAME_DISCOUNT_TIERS } from '../data/mockData';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  RotateCcw, 
  Heart, 
  Flame, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Copy,
  Zap
} from 'lucide-react';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: 'samosa' | 'biryani' | 'drumstick' | 'momo' | 'sweet' | 'bomb';
  icon: string;
  points: number;
  size: number;
}

export const DroolCatchGame: React.FC = () => {
  const { 
    gameHighScore, 
    updateGameScore, 
    claimedGameVouchers, 
    applyCouponCode, 
    setIsCartOpen,
    setCurrentTab
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Game state references for 60fps loop
  const gameStateRef = useRef({
    plateX: 200,
    plateWidth: 90,
    score: 0,
    lives: 3,
    items: [] as FallingItem[],
    nextItemId: 1,
    lastSpawnTime: 0,
    isPlaying: false,
  });

  const startNewGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);

    gameStateRef.current = {
      plateX: 200,
      plateWidth: 90,
      score: 0,
      lives: 3,
      items: [],
      nextItemId: 1,
      lastSpawnTime: performance.now(),
      isPlaying: true,
    };
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStateRef.current.isPlaying) return;
      const step = 28;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        gameStateRef.current.plateX = Math.max(gameStateRef.current.plateWidth / 2, gameStateRef.current.plateX - step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (canvasRef.current) {
          gameStateRef.current.plateX = Math.min(
            canvasRef.current.width - gameStateRef.current.plateWidth / 2,
            gameStateRef.current.plateX + step
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Canvas loop
  useEffect(() => {
    let animationFrameId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.parentElement?.clientWidth || 460;
    const height = 400;
    canvas.width = width;
    canvas.height = height;
    gameStateRef.current.plateX = width / 2;

    const itemTemplates = [
      { type: 'samosa' as const, icon: '🥟', points: 10, size: 28 },
      { type: 'drumstick' as const, icon: '🍗', points: 10, size: 28 },
      { type: 'biryani' as const, icon: '🍛', points: 15, size: 30 },
      { type: 'momo' as const, icon: '🥟', points: 10, size: 26 },
      { type: 'sweet' as const, icon: '🍨', points: 25, size: 32 },
      { type: 'bomb' as const, icon: '💣', points: -15, size: 28 },
    ];

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw background warm kitchen countertop styling
      ctx.fillStyle = '#FFF8F0';
      ctx.fillRect(0, 0, width, height);

      // Subtle warm pattern lines
      ctx.strokeStyle = '#FEE2E2';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      if (gameStateRef.current.isPlaying) {
        // Spawn items
        if (time - gameStateRef.current.lastSpawnTime > 800) {
          gameStateRef.current.lastSpawnTime = time;
          const template = itemTemplates[Math.floor(Math.random() * itemTemplates.length)];
          const spawnX = 30 + Math.random() * (width - 60);

          gameStateRef.current.items.push({
            id: gameStateRef.current.nextItemId++,
            x: spawnX,
            y: -20,
            speed: 2.2 + Math.min(3.5, gameStateRef.current.score / 50),
            type: template.type,
            icon: template.icon,
            points: template.points,
            size: template.size,
          });
        }

        // Update items
        const plateY = height - 40;
        const plateLeft = gameStateRef.current.plateX - gameStateRef.current.plateWidth / 2;
        const plateRight = gameStateRef.current.plateX + gameStateRef.current.plateWidth / 2;

        for (let i = gameStateRef.current.items.length - 1; i >= 0; i--) {
          const item = gameStateRef.current.items[i];
          item.y += item.speed;

          // Check collision with plate
          if (
            item.y + item.size / 2 >= plateY &&
            item.y - item.size / 2 <= plateY + 14 &&
            item.x >= plateLeft - 10 &&
            item.x <= plateRight + 10
          ) {
            // Caught!
            if (item.type === 'bomb') {
              gameStateRef.current.lives -= 1;
              setLives(gameStateRef.current.lives);
              if (gameStateRef.current.lives <= 0) {
                gameStateRef.current.isPlaying = false;
                setIsPlaying(false);
                setGameOver(true);
                updateGameScore(gameStateRef.current.score);
              }
            } else {
              gameStateRef.current.score += item.points;
              setScore(gameStateRef.current.score);
            }
            gameStateRef.current.items.splice(i, 1);
            continue;
          }

          // Missed item
          if (item.y > height + 20) {
            gameStateRef.current.items.splice(i, 1);
          }
        }

        // Draw items
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        gameStateRef.current.items.forEach((item) => {
          ctx.fillText(item.icon, item.x, item.y);
        });

        // Draw Player Plate / Pan
        const px = gameStateRef.current.plateX;
        const pw = gameStateRef.current.plateWidth;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(px, plateY + 12, pw / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pan rim
        const grad = ctx.createLinearGradient(px - pw / 2, plateY, px + pw / 2, plateY);
        grad.addColorStop(0, '#EA580C');
        grad.addColorStop(0.5, '#F97316');
        grad.addColorStop(1, '#DC2626');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(px - pw / 2, plateY, pw, 14, 7);
        ctx.fill();

        // Pan handle
        ctx.fillStyle = '#78350F';
        ctx.fillRect(px + pw / 2 - 4, plateY + 3, 20, 8);

        // Skillet inner gloss
        ctx.fillStyle = '#FED7AA';
        ctx.fillRect(px - pw / 2 + 6, plateY + 2, pw - 16, 3);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Pointer / Touch move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!gameStateRef.current.isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clampedX = Math.max(
      gameStateRef.current.plateWidth / 2,
      Math.min(canvas.width - gameStateRef.current.plateWidth / 2, x)
    );
    gameStateRef.current.plateX = clampedX;
  };

  const handleApplyVoucher = (code: string) => {
    applyCouponCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner - Bright Tempting Gradient */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-200" />
              <span>Drool & Burp Arcade</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
              Catch Sizzling Bites. Unlock Huge Feast Discounts!
            </h1>
            <p className="text-xs sm:text-sm text-rose-50 max-w-lg leading-relaxed font-medium">
              Move your chef pan to catch tempting snacks while avoiding burnt chili bombs. Every 30 points unlocks a massive discount voucher for your next order!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/30 text-center shrink-0 shadow-lg">
            <Trophy className="w-6 h-6 text-amber-200" />
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-rose-100">Neighborhood Best</div>
              <div className="font-mono text-xl font-black text-white">{gameHighScore} PTS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Interactive Canvas Game */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-amber-200 shadow-xl space-y-4 flex flex-col items-center">
          
          {/* Game Stats Header */}
          <div className="w-full flex items-center justify-between text-stone-900 text-xs px-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-bold">Score:</span>
              <span className="text-2xl font-black font-mono text-rose-600">{score}</span>
            </div>

            {/* Lives */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < lives ? 'text-rose-500 fill-rose-500 scale-105' : 'text-stone-200'
                  }`}
                />
              ))}
            </div>

            <button
              id="restart-game-btn"
              onClick={startNewGame}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>{isPlaying ? 'Reset' : 'Start Game'}</span>
            </button>
          </div>

          {/* Canvas Container */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-amber-200 bg-amber-50/40 flex items-center justify-center shadow-inner">
            <canvas
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              className="cursor-ew-resize touch-none w-full h-[380px]"
            />

            {/* Start Screen Overlay */}
            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/25 animate-pulse">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900 font-display">Ready for Drool Catch?</h3>
                  <p className="text-xs text-stone-600 max-w-xs mt-1 leading-relaxed font-medium">
                    Catch Samosas, Momos, and Biryanis. Steer clear of 💣 burnt bombs!
                  </p>
                </div>
                <button
                  id="start-play-btn"
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all transform active:scale-95"
                >
                  Start Game (Use Mouse, Touch, or Arrows)
                </button>
              </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
                <div className="text-4xl">💥</div>
                <div>
                  <h3 className="text-2xl font-black text-stone-900 font-display">Game Over!</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    You scored <strong className="text-rose-600 font-mono text-base font-black">{score} points</strong>!
                  </p>
                </div>

                {score >= 30 ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 space-y-1 shadow-xs">
                    <Sparkles className="w-4 h-4 mx-auto text-amber-500" />
                    <p className="font-black">🎉 Congratulations! Discount Voucher Unlocked!</p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">
                    Reach 30 points to unlock your first discount coupon!
                  </p>
                )}

                <button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* On-screen control arrows for mobile convenience */}
          <div className="w-full flex items-center justify-between pt-1">
            <button
              onMouseDown={() => {
                gameStateRef.current.plateX = Math.max(gameStateRef.current.plateWidth / 2, gameStateRef.current.plateX - 35);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-bold active:bg-rose-600 active:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Move Left
            </button>
            <span className="text-[11px] text-stone-500 font-medium">Drag or slide anywhere on screen</span>
            <button
              onMouseDown={() => {
                if (canvasRef.current) {
                  gameStateRef.current.plateX = Math.min(
                    canvasRef.current.width - gameStateRef.current.plateWidth / 2,
                    gameStateRef.current.plateX + 35
                  );
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-bold active:bg-rose-600 active:text-white transition-colors"
            >
              Move Right <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Col: Unlocked Vouchers & Tier Rules */}
        <div className="space-y-4">
          
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xl space-y-4 text-stone-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-amber-500 text-white flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-display font-black text-base text-stone-900">Score Discount Tiers</h3>
            </div>

            <div className="space-y-3">
              {GAME_DISCOUNT_TIERS.map((tier) => {
                const isUnlocked = claimedGameVouchers.includes(tier.code) || score >= tier.minScore;

                return (
                  <div
                    key={tier.code}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isUnlocked
                        ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-rose-700">{tier.code}</span>
                          {isUnlocked && (
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                              Unlocked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-800 font-bold">{tier.label}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">Requires {tier.minScore}+ pts</p>
                      </div>

                      {isUnlocked ? (
                        <button
                          id={`apply-game-coupon-${tier.code}`}
                          onClick={() => handleApplyVoucher(tier.code)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0"
                        >
                          {copiedCode === tier.code ? 'Applied!' : 'Apply to Tray'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-stone-400">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Rules */}
          <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm space-y-2 text-xs text-stone-600">
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">How Points Work</h4>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-stone-600">
              <li>🥟 Samosa & Momos = +10 Points</li>
              <li>🍛 Biryani Bowl = +15 Points</li>
              <li>🍨 Kesar Rabri Jamun = +25 Points</li>
              <li>💣 Burnt Chili Bomb = -15 Points & -1 Heart</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
