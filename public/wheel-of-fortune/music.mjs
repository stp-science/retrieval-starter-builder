// Use a real, self-hosted audio file so playback follows the browser's normal
// media path. play() is called directly from the player's click or form submit.
export function createMusicPlayer(media, button, isHidden = () => document.hidden) {
  let enabled = true, preview = false, inRound = false;
  media.volume = .25;
  media.loop = true;
  const wanted = () => enabled && (inRound || preview) && !isHidden();
  function update() {
    const playing = !media.paused && !media.ended;
    button.textContent = playing ? 'Music on' : enabled ? 'Play music' : 'Music off';
    button.setAttribute('aria-pressed', String(playing));
    button.title = playing ? 'Mute background music' : 'Play game-show music';
  }
  function sync() {
    if (!wanted()) { media.pause(); update(); return Promise.resolve(false); }
    try {
      const playback = media.play();
      return Promise.resolve(playback).then(() => {
        if (!wanted()) media.pause();
        update();
        return !media.paused;
      }).catch(() => {
        // Never claim music is playing when browser autoplay is blocked.
        update();
        button.textContent = 'Play music';
        button.title = 'Click to start background music';
        return false;
      });
    } catch {
      update(); button.textContent = 'Play music'; return Promise.resolve(false);
    }
  }
  media.addEventListener('playing', update);
  media.addEventListener('pause', update);
  media.addEventListener('error', () => {
    button.textContent = 'Retry music';
    button.setAttribute('aria-pressed', 'false');
    button.title = 'The music did not load. Click to try again.';
  });
  update();
  return {
    autoplay() { preview = true; return sync(); },
    startRound() { inRound = true; preview = false; return sync(); },
    finishRound() { inRound = false; preview = false; return sync(); },
    toggle() {
      if (!media.paused) { enabled = false; preview = false; }
      else { enabled = true; preview = !inRound; if (media.error) media.load(); }
      return sync();
    },
    sync,
    stop() { media.pause(); update(); },
  };
}
