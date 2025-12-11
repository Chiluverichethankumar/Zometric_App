package com.zometric

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  // NOTE: keep the name `reactHost` (MainActivity expects this)
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages.apply {
        // Add manual packages that can't be autolinked:
        add(PendingSharePackage())
      }
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
