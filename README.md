# YouTube Android Player API for Gradle [![](https://jitpack.io/v/davidmigloz/youtube-android-player-api-gradle.svg)](https://jitpack.io/#davidmigloz/youtube-android-player-api-gradle)

[YouTube Android Player API](https://developers.google.com/youtube/android/player/) packaged as Gradle dependency for Android.

## Usage

#### Step 1

Add the JitPack repository to your `build.gradle ` file:

```gradle
allprojects {
	repositories {
		...
		maven { url "https://jitpack.io" }
	}
}
```

#### Step 2

Add the dependency:

```gradle
dependencies {
	compile 'com.github.davidmigloz:youtube-android-player-api-gradle:1.2.2.1'
}
```

## Versions supported

- YouTubeAndroidPlayerApi v1.2.2

## API levels

```gradle
minSdkVersion 19
targetSdkVersion 27
compileSdkVersion 27
buildToolsVersion "27.0.3"
```

## License

Copyright 2012 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
