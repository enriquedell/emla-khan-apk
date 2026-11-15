/* املاخوان — اتصال صدا به موتور متن‌به‌گفتار اندروید. طراح: منوچهر کریمی */
(function () {
  'use strict';
  if (window.speechSynthesis || !window.AndroidTTS) return;
  var pending = null, seq = 0, faOk = false;
  try { faOk = window.AndroidTTS.available(); } catch (e) { faOk = false; }

  function Utt(text) {
    this.text = text; this.lang = 'fa-IR'; this.rate = 1; this.pitch = 1;
    this.voice = null; this.onend = null; this.onerror = null;
  }
  window.SpeechSynthesisUtterance = Utt;

  window.__ttsDone = function (id) {
    if (pending && pending.id === id) {
      var u = pending.u; pending = null;
      if (u.onend) u.onend();
    }
  };

  window.speechSynthesis = {
    onvoiceschanged: null,
    getVoices: function () {
      return faOk ? [{ lang: 'fa-IR', name: 'متن به گفتار اندروید' }] : [{ lang: 'en-US', name: 'none' }];
    },
    speak: function (u) {
      if (pending) { var p = pending.u; pending = null; if (p.onerror) p.onerror(); }
      var id = 'u' + (++seq);
      pending = { id: id, u: u };
      window.AndroidTTS.speak(id, String(u.text), +u.rate || 1);
    },
    cancel: function () {
      try { window.AndroidTTS.stop(); } catch (e) { /* ignore */ }
      if (pending) { var p = pending.u; pending = null; if (p.onerror) p.onerror(); }
    }
  };
})();
