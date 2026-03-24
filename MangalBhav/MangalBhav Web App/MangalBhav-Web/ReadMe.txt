
Check the material design icon from this page.
https://materializecss.com/icons.html

Smart Web component (installation)
	ng add smart-webcomponents-angular
	https://www.htmlelements.com/docs/angular-cli/




Setup & Installation
1. Install .net framework 5 - https://download.visualstudio.microsoft.com/download/pr/df452763-4b7d-490a-bc03-bd1003d3ff4c/665ee1786528809f33e791558b69cf51/dotnet-hosting-5.0.11-win.exe

2. Install asp.net runtime https://dotnet.microsoft.com/download/dotnet/5.0/runtime

3. Create website & setup app domain to 'No Manage Code'

4. Postman installation https://www.postman.com/product/rest-client/





NPM Install

goto /ClientApp/src and then run the following command
npm install


To Generate new page.
goto the app folder the run this command from the command promt of windows.
 
ng g component <component-name> --skip-import


Client:  login->authentication->api(http) : server url

Server : Contoller->SQLConnection->SQLCommand->Return JSON



Command to create azure database for temp storage of blob

SET emu="%programfiles(x86)%\Microsoft SDKs\Azure\Storage Emulator\AzureStorageEmulator.exe"
%emu% stop
%emu% clear all
%emu% start

Publish error?
revert the file package.json.lock from the git hub repository and try again.

