"use client";
import { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [theme, setTheme] = useState<string|undefined>(undefined);
  useEffect(()=>{
    const saved = localStorage.getItem('mc-theme') as string|null;
    if (saved){
      document.documentElement.setAttribute('data-theme', saved);
      setTheme(saved);
    } else {
      // default to dark; respect system on first paint via CSS color-scheme
      const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const t = sysDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', t);
      setTheme(t);
    }
  },[]);
  const toggle = ()=>{
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('mc-theme', next);
    setTheme(next);
  };
  return (
    <button type="button" onClick={toggle} className="btn" aria-label="Toggle theme">
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
