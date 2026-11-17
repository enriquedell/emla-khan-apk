package com.emlakhan.app

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.JsPromptResult
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import java.util.Locale

// املاخوان - طراح: منوچهر کریمی
class MainActivity : AppCompatActivity() {
    private lateinit var root: FrameLayout
    private lateinit var web: WebView
    private var overlay: WebView? = null
    private var tts: TextToSpeech? = null
    private var faOk = false

    inner class TtsBridge {
        @JavascriptInterface
        fun available(): Boolean = faOk

        @JavascriptInterface
        fun speak(id: String, text: String, rate: Double) {
            runOnUiThread {
                val t = tts ?: return@runOnUiThread
                t.setSpeechRate(rate.toFloat().coerceIn(0.3f, 2.0f))
                t.speak(text, TextToSpeech.QUEUE_FLUSH, null, id)
            }
        }

        @JavascriptInterface
        fun stop() {
            runOnUiThread { tts?.stop() }
        }
    }

    private fun fire(id: String?) {
        if (id == null) return
        runOnUiThread {
            web.evaluateJavascript("window.__ttsDone && window.__ttsDone('$id')", null)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun openOverlay(url: String) {
        if (overlay != null) return
        val w = WebView(this)
        w.settings.javaScriptEnabled = true
        w.settings.domStorageEnabled = true
        w.settings.mediaPlaybackRequiresUserGesture = false
        w.webViewClient = WebViewClient()
        root.addView(
            w,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
        )
        overlay = w
        w.loadUrl(url)
    }

    private fun closeOverlay(): Boolean {
        val w = overlay ?: return false
        if (w.canGoBack()) {
            w.goBack()
            return true
        }
        root.removeView(w)
        w.destroy()
        overlay = null
        return true
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        root = FrameLayout(this)
        web = WebView(this)
        root.addView(web)
        setContentView(root)

        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val s = request.url.scheme
                if (s == "http" || s == "https") {
                    openOvethis@MainActivity.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, request.url))rlay(request.url.toString())
                    return true
                }
                return false
            }
        }
        web.addJavascriptInterface(TtsBridge(), "AndroidTTS")

        tts = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val r = tts?.setLanguage(Locale("fa", "IR")) ?: TextToSpeech.LANG_NOT_SUPPORTED
                faOk = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {}
                    override fun onDone(utteranceId: String?) { fire(utteranceId) }
                    @Deprecated("Deprecated in Java")
                    override fun onError(utteranceId: String?) { fire(utteranceId) }
                })
                runOnUiThread {
                    web.evaluateJavascript(
                        "if(window.speechSynthesis&&speechSynthesis.onvoiceschanged){speechSynthesis.onvoiceschanged();}",
                        null
                    )
                }
            }
        }

        web.webChromeClient = object : WebChromeClient() {
            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity).setMessage(message)
                    .setPositiveButton("باشه") { _, _ -> result.confirm() }
                    .setOnCancelListener { result.cancel() }.show()
                return true
            }

            override fun onJsConfirm(view: WebView, url: String, message: String, result: JsResult): Boolean {
                AlertDialog.Builder(this@MainActivity).setMessage(message)
                    .setPositiveButton("بله") { _, _ -> result.confirm() }
                    .setNegativeButton("نه") { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }.show()
                return true
            }

            override fun onJsPrompt(view: WebView, url: String, message: String, defaultValue: String?, result: JsPromptResult): Boolean {
                val input = EditText(this@MainActivity)
                input.setText(defaultValue ?: "")
                AlertDialog.Builder(this@MainActivity).setMessage(message).setView(input)
                    .setPositiveButton("تأیید") { _, _ -> result.confirm(input.text.toString()) }
                    .setNegativeButton("لغو") { _, _ -> result.cancel() }
                    .setOnCancelListener { result.cancel() }.show()
                return true
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (closeOverlay()) return
                val js = "(function(){var w=document.getElementById('work');" +
                    "if(w&&!w.hidden){document.getElementById('btnBack').click();return 'back';}return 'exit';})()"
                web.evaluateJavascript(js) { r -> if (r == null || r.contains("exit")) finish() }
            }
        })

        web.loadUrl("file:///android_asset/www/index.html")
    }

    override fun onDestroy() {
        overlay?.destroy()
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }
}
