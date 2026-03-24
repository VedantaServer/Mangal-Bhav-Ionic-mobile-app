function unBlur() {
  var chart = document.getElementById('chart');
  chart.style = 'box - shadow: 0px 0px 20px 10px rgba(255, 255, 255, 1); transform: scale(1); opacity: 1;transition: opacity 1s ease-out;animation: fadeIn 1s;'
  //unfade(chart);
}
function blue() {
  var chart = document.getElementById('chart');
  chart.style = 'box - shadow: 0px 0px 20px 10px rgba(255, 255, 255, 1); transform: scale(0.8); opacity: 0.1;transition: opacity 1s ease-out;animation: fadeOut 1s;'
  //unfade(chart);
} 

 
const theme = sessionStorage.getItem('theme') || 'light';
let stickySideBar = sessionStorage.getItem('stickySideBar'),
    boxed = sessionStorage.getItem('boxed'),
    DOMContentLoaded = false,
    collapsed = true,
    autoCollapsed = false,
    programmaticTreeItemSelection = false,
    primaryContainer, treeNavigation, secondaryContainer, toggleBoxedLayout;

 
boxed = !boxed || boxed === 'false' ? false : true;

function getTheme() {
    return document.body.getAttribute('theme');
}

function updateTheme(theme) {
    const jqxEditor = document.querySelector('.jqx-editor.jqx-widget');

    document.body.setAttribute('theme', theme);
    Array.from(document.querySelectorAll('smart-chart')).forEach(chart => chart.theme = theme);

    if (jqxEditor) {
        $(jqxEditor).jqxEditor('theme', theme);
    }

    sessionStorage.setItem('theme', theme);
}

function addTodayMenuOpenHandlers() {
    const todayMenu = document.getElementById('todayMenu');

    Array.from(document.querySelectorAll('.settings-button')).forEach(button => {
        button.addEventListener('pointerup', function (event) {
            event.stopPropagation();
        });

        button.addEventListener('click', function () {
            const rect = button.getBoundingClientRect();

            Array.from(document.getElementsByTagName('smart-menu')).
                filter(menu => menu !== todayMenu).forEach(menu => menu.close());

            if (!todayMenu.opened) {
                todayMenu.open(rect.right - todayMenu.offsetWidth, rect.bottom + window.scrollY);
            }
            else {
                todayMenu.close();
            }
        });
    });
}

function selectTreeItem(path) {
    const respectiveAnchor = treeNavigation.querySelector('a[href="' + path + '"');

    if (respectiveAnchor) {
        let respectiveTreeItem = respectiveAnchor.closest('smart-tree-item');

        programmaticTreeItemSelection = true;
        respectiveTreeItem.selected = true;

        while (respectiveTreeItem) {
            respectiveTreeItem = respectiveTreeItem.parentItem;
            treeNavigation.expandItem(respectiveTreeItem, false);
        }

        programmaticTreeItemSelection = false;
    }
}

function collapseOnWindowResize() {
    if (!DOMContentLoaded) {
        return;
    }

    const windowWidth = window.innerWidth;

    //sideBar.style.transition = 'none';
  if (secondaryContainer)
    secondaryContainer.style.transition = 'none';

    if (!collapsed && windowWidth < 768) {
        collapsed = true;
        autoCollapsed = true;
    }
    else if (autoCollapsed && windowWidth >= 768) {
        collapsed = false;
        autoCollapsed = false;
    }
  if (primaryContainer)
    primaryContainer.classList.toggle('collapsed', collapsed);
 
    requestAnimationFrame(() => {
       // sideBar.style.transition = null;
      if (secondaryContainer)
        secondaryContainer.style.transition = null;
    });
}

 
function setBoxed() {
    boxed = !boxed;
    document.body.classList.toggle('boxed', boxed);
    sessionStorage.setItem('boxed', boxed);
}

function checkForBody() {
    if (document.body) {
        DOMContentLoaded = true;
        primaryContainer = document.getElementById('primaryContainer'); 
        treeNavigation = document.getElementById('tree');
        secondaryContainer = document.getElementById('secondaryContainer'); 
        toggleBoxedLayout = document.getElementById('toggleBoxedLayout'); 
        document.body.setAttribute('theme', theme);
        document.body.classList.toggle('boxed', boxed); 
        if (boxed) {
            toggleBoxedLayout.setAttribute('checked', '')
        }

        collapseOnWindowResize();
    }
    else {
        requestAnimationFrame(checkForBody);
    }
}

requestAnimationFrame(checkForBody);

function showHide() {
  //console.log(showHide);
  collapsed = !collapsed;
  autoCollapsed = true; 
  primaryContainer.classList.toggle('collapsed', collapsed);
}

function printdata(divprint) {
  const printContents = document.getElementById(divprint).innerHTML;
  console.log(printContents);
  const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

  popupWin.document.write(`
        <html>
            <head>
                <title>Print Page</title>
            </head>
            <body
                onload="document.execCommand('print');window.close()">${printContents} </body>
          </html>`
  );
  popupWin.document.close();
}

window.onload = function () {
  checkForBody();

    const messagesButton = document.getElementById('messages'),
    notificationsButton = document.getElementById('notifications'),
    languageButton = document.getElementById('language'),
    profileButton = document.getElementById('profile'),
    settingsButton = document.getElementById('settingsButton'),
    settingsPanel = document.getElementById('settingsPanel'),
    settingsCloseButton = document.getElementById('settingsCloseButton'),
    lightThemePreview = document.getElementById('lightThemePreview'),
    darkThemePreview = document.getElementById('darkThemePreview'),
    buyButton = document.getElementById('buy');



  var handles = document.querySelectorAll("#toggleButton");

  for (var i = 0; i < handles.length; ++i) {

    //console.log(handles[i].outerHTML); // do something with the elements (e.g display their outerHTML)

    handles[i].addEventListener('click', function () {
      //console.log("#toggleButtonDashboard:.. i m clicked.");
      collapsed = !collapsed;
      autoCollapsed = true;
      //alert('dashboardclicked..')
      primaryContainer.classList.toggle('collapsed', collapsed);
    });
  }






  /*
  document.getElementById('toggleButtonDashboard').addEventListener('click', function () {
    collapsed = !collapsed;
    autoCollapsed = false;
    alert('dashboardclicked..')
    primaryContainer.classList.toggle('collapsed', collapsed);

  });
  */

  if (treeNavigation) {
    treeNavigation.addEventListener('change', function (event) {
      if (programmaticTreeItemSelection) {
        return;
      }

      const anchor = event.detail.item.querySelector('a');

      if (anchor) {
        anchor.click();
      }
    });
  }

  //setupRouting();
};

window.onresize = collapseOnWindowResize;
 
