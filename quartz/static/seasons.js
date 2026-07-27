(function() {
  'use strict';
  
  const CONFIG = {
    cycleDuration: 60000, // 60 секунд на полный цикл
    transitionEase: true,
    seasons: ['spring', 'summer', 'autumn', 'winter']
  };
  
  let currentIndex = 0;
  let isPageVisible = true;
  let animationId = null;
  let startTime = null;
  
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
  }
  
  function interpolateColors(hex1, hex2, t) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return hex1;
    const r = rgb1.r + (rgb2.r - rgb1.r) * t;
    const g = rgb1.g + (rgb2.g - rgb1.g) * t;
    const b = rgb1.b + (rgb2.b - rgb1.b) * t;
    return rgbToHex(r, g, b);
  }
  
  function getSeasonStyles(seasonName) {
    const temp = document.createElement('div');
    temp.className = seasonName;
    temp.style.display = 'none';
    document.body.appendChild(temp);
    const styles = getComputedStyle(temp);
    const result = {
      '--bg-light': styles.getPropertyValue('--bg-light').trim(),
      '--bg-medium': styles.getPropertyValue('--bg-medium').trim(),
      '--primary': styles.getPropertyValue('--primary').trim(),
      '--secondary': styles.getPropertyValue('--secondary').trim(),
      '--tertiary': styles.getPropertyValue('--tertiary').trim(),
      '--links': styles.getPropertyValue('--links').trim()
    };
    document.body.removeChild(temp);
    return result;
  }
  
  function applySeasonMix(seasonFrom, seasonTo, progress) {
    const root = document.documentElement;
    const fromStyles = getSeasonStyles(seasonFrom);
    const toStyles = getSeasonStyles(seasonTo);
    const eased = CONFIG.transitionEase ? easeInOutCubic(progress) : progress;
    
    Object.keys(fromStyles).forEach(varName => {
      const color1 = fromStyles[varName];
      const color2 = toStyles[varName];
      if (color1 && color2 && color1.startsWith('#') && color2.startsWith('#')) {
        const mixed = interpolateColors(color1, color2, eased);
        root.style.setProperty(varName, mixed);
      } else {
        root.style.setProperty(varName, eased < 0.5 ? color1 : color2);
      }
    });
  }
  
  function animate(timestamp) {
    if (!isPageVisible) {
      animationId = null;
      return;
    }
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) % CONFIG.cycleDuration;
    const progress = elapsed / CONFIG.cycleDuration;
    const totalSeasons = CONFIG.seasons.length;
    const seasonProgress = progress * totalSeasons;
    const fromIndex = Math.floor(seasonProgress) % totalSeasons;
    const toIndex = (fromIndex + 1) % totalSeasons;
    const localProgress = seasonProgress - Math.floor(seasonProgress);
    
    applySeasonMix(CONFIG.seasons[fromIndex], CONFIG.seasons[toIndex], localProgress);
    animationId = requestAnimationFrame(animate);
  }
  
  function startAnimation() {
    if (animationId) return;
    isPageVisible = true;
    startTime = null;
    animationId = requestAnimationFrame(animate);
  }
  
  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }
  
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    isPageVisible ? startAnimation() : stopAnimation();
  });
  
  if (!document.hidden) startAnimation();
  
  // Индикатор сезона
  const indicator = document.createElement('div');
  indicator.className = 'season-indicator';
  indicator.textContent = '🌱 Весна';
  document.body.appendChild(indicator);
  
  const seasonEmojis = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };
  const seasonNames = { spring: 'Весна', summer: 'Лето', autumn: 'Осень', winter: 'Зима' };
  
  const originalApply = applySeasonMix;
  applySeasonMix = function(seasonFrom, seasonTo, progress) {
    originalApply(seasonFrom, seasonTo, progress);
    if (progress > 0.8 && progress < 0.95) {
      indicator.textContent = `${seasonEmojis[seasonTo]} ${seasonNames[seasonTo]}`;
    }
  };
  
  // Горячие клавиши
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const current = CONFIG.seasons.indexOf(document.documentElement.className.split(' ').find(c => CONFIG.seasons.includes(c)) || 'spring');
      const nextIndex = (current + 1) % CONFIG.seasons.length;
      const targetSeason = CONFIG.seasons[nextIndex];
      const styles = getSeasonStyles(targetSeason);
      const root = document.documentElement;
      Object.keys(styles).forEach(varName => root.style.setProperty(varName, styles[varName]));
      root.className = targetSeason;
      startTime = null;
      indicator.textContent = `${seasonEmojis[targetSeason]} ${seasonNames[targetSeason]}`;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const current = CONFIG.seasons.indexOf(document.documentElement.className.split(' ').find(c => CONFIG.seasons.includes(c)) || 'spring');
      const prevIndex = (current - 1 + CONFIG.seasons.length) % CONFIG.seasons.length;
      const targetSeason = CONFIG.seasons[prevIndex];
      const styles = getSeasonStyles(targetSeason);
      const root = document.documentElement;
      Object.keys(styles).forEach(varName => root.style.setProperty(varName, styles[varName]));
      root.className = targetSeason;
      startTime = null;
      indicator.textContent = `${seasonEmojis[targetSeason]} ${seasonNames[targetSeason]}`;
    }
  });
  
  console.log('🌸 Season Engine started! Use ← → arrows to change seasons manually');
})();