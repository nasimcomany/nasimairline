package ir.nasimairlines.app;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.net.http.SslError;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private static final String START_URL = "https://nasimairlines.ir/";
    private static final String DESKTOP_UA =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    + "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NasimAirlinesApp/1.2";

    private WebView webView;
    private View statusPanel;
    private TextView statusText;
    private ProgressBar progressBar;
    private Button retryButton;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        statusPanel = findViewById(R.id.status_panel);
        statusText = findViewById(R.id.status_text);
        progressBar = findViewById(R.id.progress);
        retryButton = findViewById(R.id.retry_button);

        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccess(true);
        settings.setUserAgentString(DESKTOP_UA);

        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        retryButton.setOnClickListener(v -> loadSite());

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                showLoading("در حال بارگذاری سایت نسیم…");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                // Site forces desktop width=1200; scale so it fits a phone WebView.
                view.evaluateJavascript(
                        "(function(){var m=document.querySelector('meta[name=viewport]');"
                                + "if(m){m.setAttribute('content','width=1200, initial-scale=0.32, maximum-scale=4, user-scalable=yes');}"
                                + "return document.title||'';})();",
                        value -> hideStatus());

                // If React never mounts, show a clear error instead of a silent white screen.
                view.postDelayed(() -> view.evaluateJavascript(
                        "(function(){var r=document.getElementById('root');"
                                + "return (r&&r.childElementCount>0)?'ok':'empty';})();",
                        value -> {
                            if (value != null && value.contains("empty")) {
                                showError(
                                        "سایت لود شد ولی محتوا نیامد.\n"
                                                + "VPN را یک‌بار خاموش/عوض کنید و «تلاش مجدد» بزنید.\n"
                                                + "اگر در کروم گوشی سایت باز می‌شود، همین را بگویید.");
                            }
                        }), 4000);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request != null && request.isForMainFrame()) {
                    String desc = error != null && error.getDescription() != null
                            ? error.getDescription().toString()
                            : "خطای ناشناخته";
                    showError("بارگذاری ناموفق بود:\n" + desc);
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                // Some Android WebViews / VPNs fail the cert chain even when browsers work.
                // Keep the user inside the app for nasimairlines.ir only.
                if (error != null && error.getUrl() != null && error.getUrl().contains("nasimairlines.ir")) {
                    handler.proceed();
                    return;
                }
                handler.cancel();
                showError("خطای امنیتی SSL هنگام باز کردن سایت.");
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress >= 90) {
                    // Keep panel until onPageFinished confirms content
                }
            }
        });

        loadSite();
    }

    private void loadSite() {
        showLoading("در حال بارگذاری سایت نسیم…");
        webView.loadUrl(START_URL);
    }

    private void showLoading(String message) {
        statusPanel.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.VISIBLE);
        retryButton.setVisibility(View.GONE);
        statusText.setText(message);
    }

    private void showError(String message) {
        statusPanel.setVisibility(View.VISIBLE);
        progressBar.setVisibility(View.GONE);
        retryButton.setVisibility(View.VISIBLE);
        statusText.setText(message);
    }

    private void hideStatus() {
        statusPanel.setVisibility(View.GONE);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
