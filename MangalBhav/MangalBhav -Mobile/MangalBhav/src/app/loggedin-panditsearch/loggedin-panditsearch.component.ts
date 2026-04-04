import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Api } from '../../providers/api/api';
import { Storage } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-loggedin-panditsearch',
  templateUrl: './loggedin-panditsearch.component.html',
  styleUrls: ['./loggedin-panditsearch.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoggedinPanditsearchComponent implements OnInit {

  categoryid: any;
  categoryName: string = '';
  panditProfiles: any[] = [];
  isLoading: boolean = true;
  profileImages: { [key: number]: string } = {};  // userID → image blob URL
  serviceid: any;
  serviceName: string = '';
  userDetails: any;
  labels = {
    en: {
      welcomeLine: '🪔 Sacred rituals for every event of life',
      chooseStage: 'Choose a life stage...',

      rituals: 'Rituals',
      mins: 'mins',
      atHome: 'At your home',

      verifiedPandit: 'Verified Pandit Ji',
      samagriChecklist: 'Samagri checklist provided',

      findPandit: 'Find Pandit ji',

      veryGood: 'Very Good',
      reviews: 'Reviews',

      heroTagline: "India's most trusted platform for booking verified Pandits for every sacred ritual — from the first breath to the final farewell.",

      samskaras: '16 Samskaras Covered',
      verified: 'Verified Pandits',
      doorstep: 'At Your Doorstep',
      trusted: 'Trusted by Families',
      logoTitle: 'Mangal.Bhav',
      logoSub: '✦ Peace · Prosperity · Protection ✦',

      statsRituals: 'Sacred Rituals',
      statsPandits: 'Verified Pandits',
      statsFamilies: 'Families Served',
      statsCities: 'Cities Covered',

      // ── How It Works ──────────────────────────────
      simpleProcess: 'Simple Process',
      howWorks: 'How Mangal.Bhav Works',
      howSub: 'Connecting devotees with qualified pandits in 3 simple steps',

      step1: 'Step 1',
      step2: 'Step 2',
      step3: 'Step 3',

      how1Title: 'Choose Your Ritual',
      how1Desc: 'Browse from 30+ sacred havans and pooja ceremonies — from birth to ancestral rites. Select the one that fits your need.',

      how2Title: 'Match a Pandit',
      how2Desc: 'Get matched with a verified, experienced Pandit from your region. View profiles, specializations, languages, and ratings.',

      how3Title: 'Ritual at Your Home',
      how3Desc: 'The Pandit arrives at your doorstep with all necessary samagri. Experience authentic Vedic rituals in the comfort of your home.',

      // ── For Whom ──────────────────────────────────
      builtFor: 'Built For',
      twoSides: 'Two Sides, One Sacred Bridge',
      twoSidesSub: 'Whether you seek blessings or offer them — Mangal.Bhav is your home',

      yajman: 'Yajman',
      yajmanSubtitle: 'The Devotee · भक्त',
      forYou: 'For You',

      pandit: 'Pandit Ji',
      panditSubtitle: 'The Priest · पंडित जी',
      joinUs: 'Join Us',

      // Yajman features
      yFeature1: 'Browse 30+ rituals by life stage',
      yFeature2: 'View verified Pandit profiles & ratings',
      yFeature3: 'Book at-home ceremonies in minutes',
      yFeature4: 'Get muhurat (auspicious timing) suggestions',
      yFeature5: 'Track ritual progress and history',
      yFeature6: 'Samagri checklist provided beforehand',

      // Pandit features
      pFeature1: 'Create a verified professional profile',
      pFeature2: 'Receive booking requests near your location',
      pFeature3: 'Manage your schedule and availability',
      pFeature4: 'Grow your reach beyond word-of-mouth',
      pFeature5: 'Earn trust through reviews & ratings',
      pFeature6: 'List all specializations and expertise',

      trustedByFamilies: 'Trusted by families across India',

      // ── Testimonials ──────────────────────────────
      testimonials: 'Trusted By Families',
      whatFamilies: 'What Families Say',
      realExperiences: 'Real experiences from Yajmans across India',

      // ── Refer & Earn ──────────────────────────────
      referTitle: 'Refer & Earn',
      referSub: 'Invite your family & friends to Mangal.Bhav and earn sacred rewards together',

      youGet: 'You Get',
      friendGets: 'Friend Gets',
      referralCode: 'Your Referral Code',
      copy: 'Copy',
      copied: 'Copied!',
      share: 'Share with Friends',

      explore: 'Explore Life',
      me: 'Me',

      // ── Find Pandit Page ──────────────────────────
      sacredRitual: 'Sacred Vedic Ritual',

      // Info grid
      infoLabelDuration: 'Duration',
      infoValueDuration: '90 – 120 mins',
      infoLabelFamily: 'Family Members',
      infoValueFamily: 'All welcome',
      infoLabelVenue: 'Venue',
      infoValueVenue: 'At your home',
      infoLabelBestTime: 'Best Time',
      infoValueBestTime: 'Morning muhurat',

      // Loading / empty
      loadingPandits: 'Finding Pandits for you...',
      noPanditsTitle: 'No Pandits Found',
      noPanditsDesc: 'No pandits available for this pooja right now.',

      // Pandit card
      verifiedBadge: '✓ Verified',
      pendingBadge: '⏳ Pending',
      yrsExp: 'yrs exp',
      dakshina: 'Dakshina',
      bookNow: '🙏 Book Now →',

      // Pooja modal
      sevaDetails: 'Seva Details',
      aboutSeva: '🪔 About this Seva',
      aboutSevaText: 'This sacred ritual has been performed by Hindu families for thousands of years. It invokes divine blessings, purifies the surroundings, and brings peace, prosperity, and protection to all family members. Conducted by our verified Pandits with full Vedic vidhi and samagri.',
      whatsIncluded: "✅ What's Included",
      included1: 'Verified Pandit Ji',
      included2: 'Complete Vedic Vidhi',
      included3: 'Samagri checklist provided',
      included4: 'Muhurat consultation',
      included5: 'At-home ceremony',

      // Pandit modal
      panditProfile: 'Pandit Profile',
      verifiedPanditBadge: '✓ Verified Pandit',
      pendingPanditBadge: '⏳ Verification Pending',
      infoLabelExperience: 'Experience',
      infoLabelGender: 'Gender',
      infoLabelLanguages: 'Languages',
      aboutPandit: '🙏 About Pandit Ji',
      specializations: '📿 Specializations',
      spec1: 'Vedic Havans & Yagyas',
      spec2: 'Jyotish & Muhurat',
      spec3: 'Griha Pravesh & Vastu',
      spec4: 'Marriage Ceremonies',

      // ── Footer ────────────────────────────────────
      footerTagline: "India's most trusted platform for booking verified Pandits for every sacred ritual — from the first breath to the final farewell.",
      footerOm: 'ॐ नमः शिवाय',

      footerPlatform: '🙏 Platform',
      footerAbout: 'About Us',
      footerHowWorks: 'How It Works',
      footerAllRituals: 'All Rituals',
      footerCities: 'Cities We Serve',

      footerForPandits: '🧘 For Pandits',
      footerJoinPandit: 'Join as Pandit',
      footerDashboard: 'Pandit Dashboard',
      footerManageBookings: 'Manage Bookings',
      footerSupport: 'Support',

      footerLegal: '📜 Legal',
      footerPrivacy: 'Privacy Policy',
      footerTerms: 'Terms of Service',
      footerRefund: 'Refund Policy',
      footerContact: 'Contact Us',

      footerCopy: '© 2026 Mangal.Bhav . All rights reserved.',
    },

    hi: {
      welcomeLine: '🪔 जीवन के हर अवसर के लिए पवित्र अनुष्ठान',
      chooseStage: 'जीवन चरण चुनें...',

      rituals: 'अनुष्ठान',
      logoSub: '✦ शांति · समृद्धि · सुरक्षा ✦',
      logoTitle: 'मंगल.भाव',
      mins: 'मिनट',
      atHome: 'आपके घर पर',

      verifiedPandit: 'सत्यापित पंडित जी',
      samagriChecklist: 'सामग्री सूची प्रदान की जाएगी',

      findPandit: 'पंडित जी खोजें',

      veryGood: 'बहुत अच्छा',
      reviews: 'समीक्षाएँ',

      heroTagline: 'भारत का सबसे विश्वसनीय प्लेटफॉर्म पंडित जी बुक करने के लिए — जन्म से अंतिम संस्कार तक',

      samskaras: '16 संस्कार शामिल',
      verified: 'सत्यापित पंडित जी',
      doorstep: 'घर तक सेवा',
      trusted: 'परिवारों का भरोसा',

      statsRituals: 'अनुष्ठान',
      statsPandits: 'पंडित जी',
      statsFamilies: 'परिवार',
      statsCities: 'शहर',

      // ── How It Works ──────────────────────────────
      simpleProcess: 'सरल प्रक्रिया',
      howWorks: 'मंगल.भाव कैसे काम करता है',
      howSub: '3 आसान चरणों में पंडित जी से जुड़ें',

      step1: 'चरण 1',
      step2: 'चरण 2',
      step3: 'चरण 3',

      how1Title: 'अनुष्ठान चुनें',
      how1Desc: '30+ पवित्र हवन और पूजा समारोहों में से चुनें — जन्म से पितृ अनुष्ठान तक। अपनी आवश्यकता के अनुसार चुनें।',

      how2Title: 'पंडित जी चुनें',
      how2Desc: 'अपने क्षेत्र के सत्यापित और अनुभवी पंडित जी से मिलें। प्रोफ़ाइल, विशेषज्ञता, भाषा और रेटिंग देखें।',

      how3Title: 'घर पर अनुष्ठान',
      how3Desc: 'पंडित जी सभी आवश्यक सामग्री के साथ आपके घर आएंगे। अपने घर में ही प्रामाणिक वैदिक अनुष्ठान का अनुभव करें।',

      // ── For Whom ──────────────────────────────────
      builtFor: 'किसके लिए',
      twoSides: 'दो पक्ष, एक पवित्र सेतु',
      twoSidesSub: 'भक्त हों या पंडित — मंगल.भाव आपका घर है',

      yajman: 'यजमान',
      yajmanSubtitle: 'भक्त · The Devotee',
      forYou: 'आपके लिए',

      pandit: 'पंडित जी',
      panditSubtitle: 'पंडित जी · The Priest',
      joinUs: 'जुड़ें',

      // Yajman features
      yFeature1: 'जीवन चरण के अनुसार 30+ अनुष्ठान देखें',
      yFeature2: 'सत्यापित पंडित जी प्रोफ़ाइल और रेटिंग देखें',
      yFeature3: 'कुछ मिनटों में घर पर पूजा बुक करें',
      yFeature4: 'मुहूर्त (शुभ समय) सुझाव पाएं',
      yFeature5: 'अनुष्ठान की प्रगति और इतिहास ट्रैक करें',
      yFeature6: 'सामग्री सूची पहले से प्रदान की जाएगी',

      // Pandit features
      pFeature1: 'सत्यापित पेशेवर प्रोफ़ाइल बनाएं',
      pFeature2: 'अपने पास की बुकिंग अनुरोध प्राप्त करें',
      pFeature3: 'अपना शेड्यूल और उपलब्धता प्रबंधित करें',
      pFeature4: 'मुँह-ज़बानी से परे अपनी पहुँच बढ़ाएं',
      pFeature5: 'समीक्षाओं और रेटिंग से विश्वास अर्जित करें',
      pFeature6: 'सभी विशेषज्ञताएं और कौशल सूचीबद्ध करें',

      trustedByFamilies: 'भारत भर के परिवारों का विश्वास',

      // ── Testimonials ──────────────────────────────
      testimonials: 'परिवारों का विश्वास',
      whatFamilies: 'परिवार क्या कहते हैं',
      realExperiences: 'भारत भर के यजमानों के वास्तविक अनुभव',

      // ── Refer & Earn ──────────────────────────────
      referTitle: 'रेफर करें और कमाएँ',
      referSub: 'अपने परिवार और दोस्तों को आमंत्रित करें और साथ मिलकर पुरस्कार अर्जित करें',

      youGet: 'आपको मिलेगा',
      friendGets: 'मित्र को मिलेगा',
      referralCode: 'आपका रेफरल कोड',
      copy: 'कॉपी करें',
      copied: 'कॉपी हो गया!',
      share: 'साझा करें',

      explore: 'जीवन देखें',
      me: 'मैं',

      // ── Find Pandit Page ──────────────────────────
      sacredRitual: 'पवित्र वैदिक अनुष्ठान',

      // Info grid
      infoLabelDuration: 'अवधि',
      infoValueDuration: '90 – 120 मिनट',
      infoLabelFamily: 'परिवार के सदस्य',
      infoValueFamily: 'सभी आमंत्रित हैं',
      infoLabelVenue: 'स्थान',
      infoValueVenue: 'आपके घर पर',
      infoLabelBestTime: 'सर्वोत्तम समय',
      infoValueBestTime: 'प्रातः मुहूर्त',

      // Loading / empty
      loadingPandits: 'आपके लिए पंडित जी खोज रहे हैं...',
      noPanditsTitle: 'कोई पंडित जी नहीं मिला',
      noPanditsDesc: 'इस समय इस पूजा के लिए कोई पंडित जी उपलब्ध नहीं है।',

      // Pandit card
      verifiedBadge: '✓ सत्यापित',
      pendingBadge: '⏳ लंबित',
      yrsExp: 'वर्ष अनुभव',
      dakshina: 'दक्षिणा',
      bookNow: '🙏 अभी बुक करें →',

      // Pooja modal
      sevaDetails: 'सेवा विवरण',
      aboutSeva: '🪔 इस सेवा के बारे में',
      aboutSevaText: 'यह पवित्र अनुष्ठान हजारों वर्षों से हिंदू परिवारों द्वारा किया जाता रहा है। यह दिव्य आशीर्वाद प्रदान करता है, परिवेश को शुद्ध करता है और परिवार के सभी सदस्यों को शांति, समृद्धि और सुरक्षा देता है। हमारे सत्यापित पंडितों द्वारा पूर्ण वैदिक विधि और सामग्री के साथ संपन्न।',
      whatsIncluded: '✅ क्या शामिल है',
      included1: 'सत्यापित पंडित जी',
      included2: 'संपूर्ण वैदिक विधि',
      included3: 'सामग्री सूची प्रदान की जाएगी',
      included4: 'मुहूर्त परामर्श',
      included5: 'घर पर अनुष्ठान',

      // Pandit modal
      panditProfile: 'पंडित जी प्रोफ़ाइल',
      verifiedPanditBadge: '✓ सत्यापित पंडित जी',
      pendingPanditBadge: '⏳ सत्यापन लंबित',
      infoLabelExperience: 'अनुभव',
      infoLabelGender: 'लिंग',
      infoLabelLanguages: 'भाषाएँ',
      aboutPandit: '🙏 पंडित जी के बारे में',
      specializations: '📿 विशेषज्ञताएँ',
      spec1: 'वैदिक हवन और यज्ञ',
      spec2: 'ज्योतिष और मुहूर्त',
      spec3: 'गृह प्रवेश और वास्तु',
      spec4: 'विवाह संस्कार',

      // ── Footer ────────────────────────────────────
      footerTagline: 'भारत का सबसे विश्वसनीय प्लेटफॉर्म — जन्म से अंतिम संस्कार तक हर पवित्र अनुष्ठान के लिए सत्यापित पंडित बुक करें।',
      footerOm: 'ॐ नमः शिवाय',

      footerPlatform: '🙏 प्लेटफॉर्म',
      footerAbout: 'हमारे बारे में',
      footerHowWorks: 'कैसे काम करता है',
      footerAllRituals: 'सभी अनुष्ठान',
      footerCities: 'हम किन शहरों में हैं',

      footerForPandits: '🧘 पंडित जी के लिए',
      footerJoinPandit: 'पंडित जी के रूप में जुड़ें',
      footerDashboard: 'पंडित जी डैशबोर्ड',
      footerManageBookings: 'बुकिंग प्रबंधित करें',
      footerSupport: 'सहायता',

      footerLegal: '📜 कानूनी',
      footerPrivacy: 'गोपनीयता नीति',
      footerTerms: 'सेवा की शर्तें',
      footerRefund: 'धन-वापसी नीति',
      footerContact: 'संपर्क करें',

      footerCopy: '© 2026 मंगल.भाव . सर्वाधिकार सुरक्षित।',
    }
  };
  language: any;

  constructor(
    public routerCtrl: NavController,
    public api: Api,
    private storage: Storage,
    private plt: Platform,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  get t() {
    return this.language === 'Hindi'
      ? this.labels.hi
      : this.labels.en;
  }

  async ngOnInit() {



    this.userDetails = await this.storage.get("account");
    this.language = this.userDetails.Languages;
    this.route.queryParams.subscribe(params => {
      this.categoryid = params['categoryid'];
      this.serviceid = params['serviceid'];
      this.loadServiceName();
      this.loadPandits();
    });
  }

  openPage(pageName: any) {
    this.routerCtrl.navigateForward(`/${pageName}`);
  }


  loadServiceName() {
    if (!this.serviceid) return;
    this.api.post(`ServiceSelect?serviceID=${this.serviceid}&tenantId=1`, null)
      .subscribe((res: any) => {
        const svc = res?.ServiceList?.[0];
        if (svc) {
          const name = svc?.Name || '';

          const parts = name.split('/');

          this.serviceName =
            this.language?.toLowerCase() === 'hindi'
              ? (parts[1]?.trim() || parts[0]?.trim() || '')
              : (parts[0]?.trim() || parts[1]?.trim() || '');


        }
      });
  }


  isPoojaModalOpen = false;
  isPanditModalOpen = false;
  selectedPandit: any = null;

  openPoojaModal() {
    this.isPoojaModalOpen = true;
  }

  openPanditModal(pandit: any) {
    this.selectedPandit = pandit;
    this.isPanditModalOpen = true;
  }

  loadPandits() {
    this.isLoading = true;

    this.api.post(`PanditServicesSelectAllByServiceID?serviceID=${this.serviceid}`, null)
      .subscribe((res: any) => {

        const profileIDs = res.PanditServiceList?.map((x: any) => x.ProfileID) || [];
        const uniqueProfileIDs = [...new Set(profileIDs)];

        if (uniqueProfileIDs.length === 0) {
          this.panditProfiles = [];
          this.isLoading = false;
          return;
        }

        const profileCalls = uniqueProfileIDs.map((id: any) =>
          this.api.post(`ProfilesSelectAllByUserID?userID=${id}`, null)
        );

        forkJoin(profileCalls).subscribe((profiles: any[]) => {

          let profileData: any[] = [];
          profiles.forEach((p: any) => {
            if (p?.ProfileList?.length > 0) {
              profileData.push(...p.ProfileList);
            }
          });

          this.panditProfiles = profileData;
          this.isLoading = false;

          this.panditProfiles.forEach(p => {
            if (p.UserID) this.loadProfileImage(p);
          });

        });
      });
  }


  loadProfileImage(pandit: any) {
    if (!pandit.ProfilePhotoUrl) return;

    const params = {
      imageName: pandit.ProfilePhotoUrl,
      imagePurpose: 'ProfilePhoto'
    };

    this.api.getImage('DownloadImages', params).subscribe({
      next: (blob: Blob) => {
        if (blob?.type?.startsWith('image/')) {
          this.profileImages[pandit.UserID] = URL.createObjectURL(blob);
        }
      },
      error: () => {
        // fallback to default — already handled in getProfileImage()
      }
    });
  }
  getProfileImage(userID: number): string {
    return this.profileImages[userID] || 'assets/default.jfif';
  }

  // Book Now — store panditUserID, go to login
  async bookNow(pandit: any) {
    this.api.post(`PanditServicesNUSelectByQuery?Query=ProfileID = ${pandit.UserID} and ServiceID = ${this.serviceid}`, null)
      .subscribe((res: any) => {
        console.log(res?.PanditServiceList?.[0].PanditServiceID)

        this.router.navigate(['/book-pooja'], {
          queryParams: { id: res?.PanditServiceList?.[0].PanditServiceID }
        });
      })
  }

  goBack() {
    this.routerCtrl.back();
  }

}
