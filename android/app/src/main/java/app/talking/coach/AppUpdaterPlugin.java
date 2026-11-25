package app.talking.coach;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Mise à jour dans l'app : télécharge l'APK de la dernière release dans le cache,
 * puis ouvre directement la fenêtre d'installation d'Android (l'utilisateur n'a plus qu'à accepter).
 * Si Android n'autorise pas encore l'app à installer des mises à jour, on ouvre le réglage
 * correspondant, puis on reprend l'installation au retour.
 */
@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    private static final String ALLOWED_PREFIX = "https://github.com/";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private File pendingApk;

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        // On n'installe que des fichiers publiés dans les releases GitHub du projet.
        if (url == null || !url.startsWith(ALLOWED_PREFIX)) {
            call.reject("Adresse de mise à jour invalide");
            return;
        }
        executor.execute(() -> {
            try {
                File apk = download(url);
                pendingApk = apk;
                getActivity().runOnUiThread(() -> installOrAskPermission(call));
            } catch (Exception e) {
                call.reject("Téléchargement impossible : " + e.getMessage());
            }
        });
    }

    private File download(String url) throws IOException {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists() && !dir.mkdirs()) throw new IOException("dossier de cache indisponible");
        File out = new File(dir, "talking-update.apk");

        String current = url;
        HttpURLConnection conn = null;
        // GitHub redirige vers son stockage de fichiers : on suit les redirections nous-mêmes (HTTPS uniquement).
        for (int hops = 0; hops < 6; hops++) {
            conn = (HttpURLConnection) new URL(current).openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(15000);
            conn.setReadTimeout(30000);
            conn.setRequestProperty("Accept", "application/octet-stream");
            int code = conn.getResponseCode();
            if (code >= 300 && code < 400) {
                String location = conn.getHeaderField("Location");
                conn.disconnect();
                if (location == null || !location.startsWith("https://")) throw new IOException("redirection invalide");
                current = location;
                continue;
            }
            if (code != 200) {
                conn.disconnect();
                throw new IOException("HTTP " + code);
            }
            break;
        }
        if (conn == null) throw new IOException("aucune connexion");

        long total = conn.getContentLengthLong();
        long done = 0;
        int lastPercent = -1;
        try (InputStream in = conn.getInputStream(); OutputStream os = new FileOutputStream(out)) {
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) != -1) {
                os.write(buf, 0, n);
                done += n;
                if (total > 0) {
                    int percent = (int) (done * 100 / total);
                    if (percent != lastPercent) {
                        lastPercent = percent;
                        JSObject ev = new JSObject();
                        ev.put("percent", percent);
                        notifyListeners("progress", ev);
                    }
                }
            }
        } finally {
            conn.disconnect();
        }
        if (out.length() < 100_000) throw new IOException("fichier incomplet");
        return out;
    }

    private boolean canInstall() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.O
            || getContext().getPackageManager().canRequestPackageInstalls();
    }

    private void installOrAskPermission(PluginCall call) {
        if (canInstall()) {
            launchInstaller(call);
            return;
        }
        Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
        JSObject ev = new JSObject();
        ev.put("step", "permission");
        notifyListeners("progress", ev);
        startActivityForResult(call, settings, "onInstallPermissionResult");
    }

    @ActivityCallback
    private void onInstallPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (canInstall()) launchInstaller(call);
        else call.reject("Autorisation d'installer les mises à jour refusée");
    }

    private void launchInstaller(PluginCall call) {
        try {
            Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", pendingApk);
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(install);
            call.resolve();
        } catch (Exception e) {
            call.reject("Impossible d'ouvrir l'installation : " + e.getMessage());
        }
    }
}
