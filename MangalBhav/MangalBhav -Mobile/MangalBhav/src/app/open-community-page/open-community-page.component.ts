import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ToastController } from '@ionic/angular';
import { Api, ApiNU } from 'src/providers';
import { Geolocation } from '@capacitor/geolocation';
import { JajmanbottomtabsComponent } from '../jajmanbottomtabs/jajmanbottomtabs.component';
import { LoggedoutbottomtabsComponent } from '../loggedoutbottomtabs/loggedoutbottomtabs.component';
import { PanditjibottomtabsComponent } from '../panditjibottomtabs/panditjibottomtabs.component';
import { TabscommonheaderComponent } from '../tabscommonheader/tabscommonheader.component';


@Component({
  selector: 'app-open-community-page',
  templateUrl: './open-community-page.component.html',
  styleUrls: ['./open-community-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, JajmanbottomtabsComponent, TabscommonheaderComponent, LoggedoutbottomtabsComponent, PanditjibottomtabsComponent]
})
export class OpenCommunityPageComponent implements OnInit {
  private animationId: number = 0;
  userDetails: any;
  userLoggedIn: boolean = false;
  Mandir = {
    //loop all columns here.
    TenantID: Number(1),
    MandirID: "-1",
    MandirName: '',
    GodName: '',
    FrontImage: '',
    InsideImage: '',
    PujariName: '',
    PujariPhoneNumber: '',
    History: '',
    Address: '',
    City: '',
    State: '',
    Pincode: '',
    Latitude: '',
    Longitude: '',
    IsVerified: true,
    VerificationStatus: '',
    AddedByUserID: Number(-1),
    AddedByName: '',
    DateAdded: new Date(),
    DateModified: new Date(),
    IsActive: true,
  }


  constructor(public api: Api, public routerCtrl: NavController, public apinu: ApiNU, private storage: Storage, public toastController: ToastController) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get("account");
    if (this.userDetails?.LoginID) {
      this.userLoggedIn = true;
    }

  }
  ngAfterViewInit() {
    // flowers wait for button tap — don't autostart
  }

  goBack() {
    this.routerCtrl.back();
  }

  playShankh() {
    const audio = new Audio('https://cdn.freesound.org/previews/439/439477_9012578-lq.mp3');
    audio.load();
    audio.play();
    // Start flowers immediately (parallel with sound)
    this.startFlowers();

    // Stop flowers when shankh ends
    audio.onended = () => {
      this.stopFlowers();
    };

  }

  startFlowers() {
    const canvas = document.getElementById('flowerCanvas') as HTMLCanvasElement;
    const parent = canvas.parentElement!;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    const ctx = canvas.getContext('2d')!;

    const flowers = ['🌸', '🌺', '🌼', '🏵️', '🌹', '🪷'];
    const petals: any[] = [];

    // Burst — create all petals from center top
    for (let i = 0; i < 35; i++) {
      petals.push({
        x: canvas.width / 2 + (Math.random() * 200 - 100), // burst from center
        y: canvas.height * 0.2,                              // start at Hanuman Ji's head
        size: Math.random() * 20 + 14,
        speedY: Math.random() * 2 + 1,
        speedX: Math.random() * 3 - 1.5,                    // spread left & right
        drift: Math.random() * 0.6 - 0.3,
        emoji: flowers[Math.floor(Math.random() * flowers.length)],
        opacity: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: Math.random() * 0.05 - 0.025,
        delay: Math.random() * 60                            // staggered start (frames)
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(p => {
        if (p.delay > 0) { p.delay--; return; } // stagger

        ctx.globalAlpha = p.opacity;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px serif`;
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();

        p.y += p.speedY;
        p.x += p.speedX;
        p.speedX += p.drift;
        p.rotation += p.rotSpeed;

        // reset to burst again from top when off screen
        if (p.y > canvas.height) {
          p.y = canvas.height * 0.2;
          p.x = canvas.width / 2 + (Math.random() * 200 - 100);
          p.speedX = Math.random() * 3 - 1.5;
          p.speedY = Math.random() * 2 + 1;
          p.opacity = 1;
        }
      });
      ctx.globalAlpha = 1;
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stopFlowers() {
    const canvas = document.getElementById('flowerCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;

    // Fade out gracefully
    let opacity = 1;
    const fadeOut = () => {
      cancelAnimationFrame(this.animationId);
      opacity -= 0.02;
      ctx.globalAlpha = opacity;
      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
      }
    };
    fadeOut();
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);

  }



  allMandirs: any[] = [];
  filteredMandirs: any[] = [];
  mandirSearchQuery = '';
  showAddMandirForm = false;
  isSubmittingMandir = false;

  // Front image
  selectedFrontImageFile: File | null = null;
  frontImagePreview: string | null = null;
  isUploadingFront = false;


}
