package com.zometric

import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled

class MainActivity : ReactActivity() {

    companion object {
        private const val TAG = "MainActivity"
        const val EVENT_SHARE = "ShareExtensionReceived"

        // ⭐ buffer for when reactContext is null
        var pendingShareData: WritableArray? = null
    }

    override fun getMainComponentName(): String = "Zometric"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleShareIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleShareIntent(intent)
    }

    private fun handleShareIntent(intent: Intent?) {
        if (intent == null) return

        val action = intent.action
        val type = intent.type

        try {
            if (action == Intent.ACTION_SEND && type != null) {
                intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)?.let { uri ->
                    val arr = Arguments.createArray()
                    arr.pushMap(uriToWritableMap(uri))
                    emitToJSOrBuffer(arr)
                }
            } else if (action == Intent.ACTION_SEND_MULTIPLE && type != null) {
                val uris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
                val arr = Arguments.createArray()
                uris?.forEach { uri ->
                    uri?.let { arr.pushMap(uriToWritableMap(it)) }
                }
                emitToJSOrBuffer(arr)
            }

        } catch (e: Exception) {
            Log.e(TAG, "Error handling share intent: ${e.message}", e)
        }
    }

    private fun emitToJSOrBuffer(arr: WritableArray) {
        try {
            val reactContext = (application as MainApplication).reactHost.currentReactContext

            if (reactContext != null) {
                reactContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(EVENT_SHARE, arr)

                Log.d(TAG, "🔥 Delivered share event to JS")

                pendingShareData = null
            } else {
                Log.w(TAG, "⚠ React NOT ready — storing pending data")
                pendingShareData = arr   // ⭐ buffer the data
            }

        } catch (e: Exception) {
            Log.e(TAG, "Emit failed: ${e.message}")
        }
    }

    private fun uriToWritableMap(uri: Uri): WritableMap {
        val map = Arguments.createMap()
        map.putString("uri", uri.toString())

        var displayName: String? = null
        try {
            val cursor: Cursor? = contentResolver.query(uri, null, null, null, null)
            cursor?.use {
                val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index >= 0 && it.moveToFirst()) {
                    displayName = it.getString(index)
                }
            }
        } catch (_: Exception) {}

        map.putString("name", displayName ?: uri.lastPathSegment)

        try {
            map.putString("mimeType", contentResolver.getType(uri))
        } catch (_: Exception) {
            map.putNull("mimeType")
        }

        return map
    }
}
