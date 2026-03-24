import { Component, HostListener } from '@angular/core';
import { SidebarService, SidebarState } from './services/sidebar.service';
import { GridModule } from 'smart-webcomponents-angular/grid';
import { AuthService } from './services/auth.service';
import { GlobalSelectedOrg, OrganizationService } from './services/organization.service';
import { User } from './models/user';
import { Api, OperationType, keys, Tables } from './services/api';;

import { EncoderService } from './encoder.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  inputText = 'Test <b>Encode</b>';
  base64 = '';
  url = '';
  html = '';
  title = 'GradeBook-Academic';
  Welcome = '';
  sidebarState: SidebarState;
  isBoxedLayoutEnabled: boolean = false;
  customTheme!: HTMLElement;
  themeColor: string = '';
  themeIsDark: boolean = false;
  globalOrg: GlobalSelectedOrg;
  currentUser: User;
  headerInfo = '';
  shownav: any;
  SchoolName: any;
  user_roleName: any;
  showlogout: boolean=false;
  constructor(private authenticationService: AuthService, public sidebarService: SidebarService,
    private OrgService: OrganizationService, private encoder: EncoderService, private api: Api) {

    //show header only after login.. so we subscribe.. this will be activated from login component.
    this.authenticationService.currentUser.subscribe((currentUser: any) => {
      setTimeout(() => {
        console.log(currentUser)
        this.currentUser = currentUser;
        this.Welcome = currentUser ? "Welcome" : '';
        console.log('user_roleID')
        console.log(currentUser.fK_RoleID)
        this.LoadRoleData(currentUser.fK_RoleID);
        this.showlogout = currentUser ? true : false;
      },1500);
    });

    //it will be changed from nav-menu-bar.
    //this.OrgService.currentOrg.subscribe((globalOrg: any) => {
    //  this.globalOrg = globalOrg;
    //  if ((this.globalOrg) && (this.currentUser)) {
    //    this.headerInfo = this.globalOrg.organizationName + '/' + this.globalOrg.orgLocationName + '/' + this.globalOrg.orgYear;
    //  }
    //  else {
    //    this.headerInfo = '';
    //  }
    //}); 

    this.sidebarState = sidebarService.state;

  }

  LoadRoleData(roleID) {

    const query = "TenantID = " + localStorage.getItem(keys.TenantID) + " and RoleID = " + roleID;
    this.api.postUrlData("UserRoleSelectAllByQuery?Query=" + query, null)
      .subscribe(
        data => {
          console.log('UserRoleSelectAllByQuery');
          console.log(data);
          this.user_roleName = data.UserRoleList[0].Role;
          });
        }


  encode() {
    this.base64 = this.encoder.base64Encode(this.inputText);
    this.url = this.encoder.urlEncode(this.inputText);
    this.html = this.encoder.htmlEncode(this.inputText);
  }

  decode() {
    this.base64 = this.encoder.base64Decode(this.base64);
    this.url = this.encoder.urlDecode(this.url);
    this.html = this.encoder.htmlDecode(this.html);
  }

  toggleSettingsPanel() {

    document.body.classList.toggle('settings-panel-shown');

  }
  navbarCollapsed: boolean = true; // Default to collapsed on mobile
  windowWidth: number = window.innerWidth; // Track window width

  ngOnInit() {
    this.checkWindowWidth(); // Set initial state based on window size when component loads
  }

  // Listen for window resize to adjust the navbar state
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = event.target.innerWidth;
    this.checkWindowWidth(); // Recalculate navbar state on resize
  }

  logoutOnClick() {


    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform logout action here
        this.showlogout = false;
        this.authenticationService.logout();
      } else {
        console.log('Logout canceled');
      }
    });

    //this.currentUserSubject.next(null);
  }
  // Check window width and update navbar collapse state
  checkWindowWidth() {
    if (this.windowWidth > 768) {
      this.navbarCollapsed = false; // Keep navbar open on larger screens
    } else {
      this.navbarCollapsed = true; // Collapse navbar on smaller screens
    }
  }

  // Toggle navbar collapse on mobile
  toggleNavbar() {
    if (this.windowWidth <= 768) {
      this.navbarCollapsed = !this.navbarCollapsed;
    }
  }

  toggleBoxedLayout() {

    this.isBoxedLayoutEnabled = !this.isBoxedLayoutEnabled;
    document.body.classList.toggle('boxed', this.isBoxedLayoutEnabled);

  }

  setThemeColor(theme: string) {

    this.themeColor = theme;

  }

  setIsThemeDark(isDark: boolean) {

    this.themeIsDark = isDark;

    if (isDark) {

      document.body.setAttribute('theme', 'dark');

      Array.from(document.querySelectorAll('smart-chart')).forEach(chart => chart.theme = 'dark');

    } else {

      document.body.setAttribute('theme', 'light');
      Array.from(document.querySelectorAll('smart-chart')).forEach(chart => chart.theme = 'light');

    }

  }

  setTheme() {

    if (this.customTheme) {
      this.customTheme.remove();
    }
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = `assets/css/bootstrap/${this.themeIsDark ? 'dark' : 'light'}/smart.bootstrap`
      + `${this.themeColor ? `.${this.themeColor}` : ''}`
      + '.css';
    this.customTheme = link;
    document.body.appendChild(link);
  }
}
