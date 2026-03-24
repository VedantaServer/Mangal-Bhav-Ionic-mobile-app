
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

