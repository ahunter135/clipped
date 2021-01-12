rm clipped.apk
ionic cordova build android --prod --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore /Users/austinhunter/Documents/My\ Projects/clipped/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk clipped
~/Library/Android/sdk/build-tools/29.0.2/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk clipped.apk
