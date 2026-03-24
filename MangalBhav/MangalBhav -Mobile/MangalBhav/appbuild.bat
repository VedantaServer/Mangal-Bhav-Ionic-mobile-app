@echo off
setlocal

REM ============================================
REM  reset-and-generate-icons.bat
REM  Resets Android project, syncs, regenerates icons,
REM  and opens Android project in Android Studio
REM ============================================

echo.
echo ====== Removing existing android folder ======
if exist android (
    rmdir /S /Q android
    if errorlevel 1 (
        echo.
        echo Failed to remove android folder.
        echo Make sure no files are open in Android Studio or Explorer.
        pause
        exit /b 1
    )
    echo Android folder removed.
) else (
    echo No android folder found, skipping removal.
)
echo.

echo ====== Re-adding android platform ======
call npx cap add android
if errorlevel 1 (
    echo.
    echo Failed to add android platform.
    pause
    exit /b 1
)
echo Android platform recreated successfully.
echo.

echo ====== Building Ionic app (ionic build) ======
call ionic build
if errorlevel 1 (
    echo.
    echo ionic build failed.
    echo Fix the build errors and run this script again.
    pause
    exit /b 1
)
echo ionic build completed successfully.
echo.

echo ====== Syncing Capacitor with Android (npx cap sync android) ======
call npx cap sync android
if errorlevel 1 (
    echo.
    echo npx cap sync android failed.
    pause
    exit /b 1
)
echo Capacitor sync with Android completed.
echo.

echo ====== Cleaning old Android icon folders ======
if exist android\app\src\main\res (
    for /d %%D in (android\app\src\main\res\mipmap-*) do (
        echo Removing %%D
        rmdir /S /Q "%%D"
    )
    echo Old icon folders cleaned.
) else (
    echo Android project not found: android\app\src\main\res does not exist.
    echo Something went wrong with 'npx cap add android' or 'npx cap sync android'.
    pause
    exit /b 1
)
echo.

echo ====== Checking app icon source ======
if not exist resources\icon.png (
    echo ERROR: resources\icon.png not found!
    echo Please place your 1024x1024 app icon in the 'resources' folder as:
    echo     resources\icon.png
    pause
    exit /b 1
)
echo Found resources\icon.png
echo.

echo ====== Generating new app icons (npx cordova-res android --skip-config --copy) ======
call npx cordova-res android --skip-config --copy
if errorlevel 1 (
    echo.
    echo Failed to generate Android icons.
    pause
    exit /b 1
)
echo Android icons generated and copied successfully.
echo Icons copied to: android\app\src\main\res\
echo.

echo ====== Opening Android project in Android Studio (npx cap open android) ======
call npx cap open android
if errorlevel 1 (
    echo.
    echo Failed to open Android project via npx cap open android.
    echo You can open it manually from the android folder in Android Studio.
    pause
    exit /b 1
)

echo.
echo All done!
echo - Android platform reset
echo - ionic build
echo - npx cap sync android
echo - Icons regenerated
echo - Android Studio opened (if no errors)
echo.
pause
endlocal
