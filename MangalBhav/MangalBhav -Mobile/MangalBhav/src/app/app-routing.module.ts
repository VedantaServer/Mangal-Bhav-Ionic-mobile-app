import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login';
import { ChangePasswordPage } from './change-password/change-password';


import { LoginOtpPage } from './login-otp/login-otp';
import { HomeComponent } from './home/home.component';
import { JajmanDashboardComponent } from './jajman-dashboard/jajman-dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { LocationsComponent } from './locations/locations.component';
import { BookingsComponent } from './bookings/bookings.component';
import { ServicesComponent } from './services/services.component';
import { PanditServicesComponent } from './pandit-services/pandit-services.component';
import { BookPoojaComponent } from './book-pooja/book-pooja.component';
import { YajmanBookingComponent } from './yajman-booking/yajman-booking.component';
import { FindPanditComponent } from './find-pandit/find-pandit.component';
import { PendingPoojaComponent } from './pending-pooja/pending-pooja.component';
import { CancelledPoojaComponent } from './cancelled-pooja/cancelled-pooja.component';
import { TodayPoojaComponent } from './today-pooja/today-pooja.component';
import { UpcomingPoojaComponent } from './upcoming-pooja/upcoming-pooja.component';
import { CompletedPoojaComponent } from './completed-pooja/completed-pooja.component';
import { JajmanUpcomingPoojaComponent } from './jajman-upcoming-pooja/jajman-upcoming-pooja.component';
import { JajmanCompletedPoojaComponent } from './jajman-completed-pooja/jajman-completed-pooja.component';
import { OpenPanditSearchComponent } from './open-pandit-search/open-pandit-search.component';
import { IndianFestivalsComponent } from './indian-festivals/indian-festivals.component';
import { TopRatedComponent } from './top-rated/top-rated.component';
import { LoggedinHomeComponent } from './loggedin-home/loggedin-home.component';
import { LoggedinPanditsearchComponent } from './loggedin-panditsearch/loggedin-panditsearch.component';
import { OpenFindPanditComponent } from './open-find-pandit/open-find-pandit.component';
import { OpenCommunityPageComponent } from './open-community-page/open-community-page.component';
import { JajmanRequestedPoojaComponent } from './jajman-requested-pooja/jajman-requested-pooja.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { AllChatsComponent } from './all-chats/all-chats.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { LanguageChangeComponent } from './language-change/language-change.component';
import { OpenfindmandirComponent } from './openfindmandir/openfindmandir.component';

const routes: Routes = [
  
  {
    path: '',
    component: LoginPage
  },

   
  {
    path: 'privacypolicy',
    component: PrivacyPolicyComponent
  },
  
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'otpPage',
    component: LoginOtpPage
  },
  {
    path: 'tabs',
    //component:Tab1PageModule
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'ChangePassword',
    component: ChangePasswordPage  // directly use the standalone component
  },
  {
    path: 'jajmandashboard',
    component: JajmanDashboardComponent  // directly use the standalone component
  },
  {
    path: 'user-profile',
    component: UserProfileComponent  // directly use the standalone component
  },
  {
    path: 'location',
    component: LocationsComponent  // directly use the standalone component
  },
  {
    path: 'yajman-booking',
    component: YajmanBookingComponent  // directly use the standalone component
  },
  {
    path: 'booking',
    component: BookingsComponent  // directly use the standalone component
  },
  {
    path: 'services',
    component: ServicesComponent  // directly use the standalone component
  }
  ,
  {
    path: 'panditservice',
    component: PanditServicesComponent  // directly use the standalone component
  }
  ,
  {
    path: 'book-pooja',
    component: BookPoojaComponent
  }
  ,
  {
    path: 'find-pandit',
    component: FindPanditComponent  // directly use the standalone component
  }

 ,
  {
    path: 'open-find-pandit',
    component: OpenFindPanditComponent  // directly use the standalone component
  }

  ,
  {
    path: 'open-community-page',
    component: OpenCommunityPageComponent  // directly use the standalone component
  }


 
  ,
  {
    path: 'pandit-list',
    component: OpenPanditSearchComponent  // directly use the standalone component
  }
  ,
  {
    path: 'india-festival',
    component: IndianFestivalsComponent  // directly use the standalone component
  }
  ,
  {
    path: 'loggedin-home',
    component: LoggedinHomeComponent  // directly use the standalone component
  }
  ,
  {
    path: 'loggedin-panditsearch',
    component: LoggedinPanditsearchComponent  // directly use the standalone component
  }
  ,
  {
    path: 'top-rated',
    component: TopRatedComponent  // directly use the standalone component
  }
  ,
  {
    path: 'pending-pooja',
    component: PendingPoojaComponent  // directly use the standalone component
  }

  ,
  {
    path: 'Cancelled-pooja',
    component: CancelledPoojaComponent  // directly use the standalone component
  }
  ,
  {
    path: 'requested-pooja',
    component: JajmanRequestedPoojaComponent  // directly use the standalone component
  }

  ,
  {
    path: 'today-pooja',
    component: TodayPoojaComponent  // directly use the standalone component
  }
  ,
  {
    path: 'upcoming-pooja',
    component: UpcomingPoojaComponent  // directly use the standalone component
  }
  ,
  {
    path: 'completed-pooja',
    component: CompletedPoojaComponent  // directly use the standalone component
  }
  ,
  {
    path: 'upcoming-booking',
    component: JajmanUpcomingPoojaComponent  // directly use the standalone component
  }
  ,
  {
    path: 'completed-booking',
    component: JajmanCompletedPoojaComponent  // directly use the standalone component
  }
   ,
  {
    path: 'allchats',
    component: AllChatsComponent  // directly use the standalone component
  }
  ,
  {
    path: 'chatbox',
    component: ChatBoxComponent  // directly use the standalone component
  }
    ,
  {
    path: 'appnotificatio',
    component: ChatBoxComponent  // directly use the standalone component
  }
  ,
  {
    path: 'languagechange',
    component: LanguageChangeComponent  // directly use the standalone component
  }

    ,
  {
    path: 'openfindmandir',
    component: OpenfindmandirComponent // directly use the standalone component
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
