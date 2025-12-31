
import React, { useState, useEffect } from 'react';
import { CountdownTime } from '../types';

const Countdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const nextYear = now.getFullYear() + 1;
      const target = new Date(`January 1, ${nextYear} 00:00:00`);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 my-8 scale-90 md:scale-100">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[100px] border border-white/20 shadow-xl">
          <span className="text-3xl md:text-5xl font-bold text-yellow-400 font-mono">
            {value.toString().padStart(2, '0')}
          </span>
          <span className="text-xs uppercase tracking-widest text-teal-300 font-semibold mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
