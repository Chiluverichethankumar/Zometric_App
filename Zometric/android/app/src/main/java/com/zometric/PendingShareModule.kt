package com.zometric

import com.facebook.react.bridge.*

class PendingShareModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PendingShare"

    @ReactMethod
    fun getPendingData(promise: Promise) {
        try {
            val pending = MainActivity.pendingShareData
            // Return the pending WritableArray (or null)
            promise.resolve(pending)
            // Clear after returning to avoid duplicate delivery
            MainActivity.pendingShareData = null
        } catch (e: Exception) {
            promise.reject("ERR", e)
        }
    }
}
