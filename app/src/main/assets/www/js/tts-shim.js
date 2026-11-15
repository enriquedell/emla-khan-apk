/* املاخوان — اتصال صدا به موتور اندروید - نسخه درست شده */
(function () {
  'use strict';
  // اگر AndroidTTS هست، همیشه از آن استفاده کن (حتی اگر speechSynthesis هم باشد)
  if (!window.AndroidTTS) return;
  var pending = null, seq = 0;
  function Utt(text) {
    this.text = text; this.lang = 'fa-IR'; this.rate = 1; this.pitch = 1;
    this.voice = null; this.onend = null; this.onerror = null;
  }
  window.__ttsDone = function (id) {
    if (pending && pending.id === id) {
      var u = pending.u; pending = null;
      if (u.onend) setTimeout(function(){ u.onend(); }, 0);
    }
  };
  var synth = {
    onvoiceschanged: null,
    getVoices: function () {
      try {
        if (window.AndroidTTS.available()) return [{ lang: 'fa-IR', name: 'متن به گفتار اندروید - فارسی' }];
      } catch (e) {}
      return [{ lang: 'fa-IR', name: 'فارسی' }];
    },
    speak: function (u) {
      if (pending) { var p = pending.u; pending = null; if (p.onerror) p.onerror(); }
      var id = 'u' + (++seq);
      pending = { id: id, u: u };
      try { window.AndroidTTS.speak(id, String(u.text), +u.rate || 0.85); }
      catch(e){ if(u.onerror) u.onerror(); }
    },
    cancel: function () {
      try { window.AndroidTTS.stop(); } catch (e) {}
      if (pending) { var p = pending.u; pending = null; }
    }
  };
  window.speechSynthesis = synth;
  window.SpeechSynthesisUtterance = Utt;
  if (synth.onvoiceschanged) synth.onvoiceschanged();
})();
