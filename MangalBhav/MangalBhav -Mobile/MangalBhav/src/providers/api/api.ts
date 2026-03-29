import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'   // 👈 this makes it available globally
})
export class Api {


  PromotionsURL: any = "http://dashboard.vedantaerpserver.com/api/VedantaAnalytics/";
  schoolID: string = '0'

  secureCode: string = '1';

  chalisaLines = [
    // Doha 1
    [
      "श्री गुरु चरण सरोज रज, निज मन मुकुरु सुधारि।",
      "बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥"
    ],
    // Doha 2
    [
      "बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।",
      "बल बुद्धि विद्या देहु मोहिं, हरहु कलेश विकार॥"
    ],
    // Chaupai 1
    [
      "जय हनुमान ज्ञान गुण सागर।",
      "जय कपीस तिहुँ लोक उजागर॥"
    ],
    // Chaupai 2
    [
      "राम दूत अतुलित बल धामा।",
      "अंजनि पुत्र पवन सुत नामा॥"
    ],
    // Chaupai 3
    [
      "महावीर विक्रम बजरंगी।",
      "कुमति निवार सुमति के संगी॥"
    ],
    // Chaupai 4
    [
      "कंचन बरण विराज सुवेसा।",
      "कानन कुण्डल कुँचित केसा॥"
    ],
    // Chaupai 5
    [
      "हाथ बज्र औ ध्वजा विराजै।",
      "काँधे मूँज जनेऊ साजै॥"
    ],
    // Chaupai 6
    [
      "शंकर सुवन केसरी नंदन।",
      "तेज प्रताप महा जग वंदन॥"
    ],
    // Chaupai 7
    [
      "विद्यावान गुणी अति चातुर।",
      "राम काज करिबे को आतुर॥"
    ],
    // Chaupai 8
    [
      "प्रभु चरित्र सुनिबे को रसिया।",
      "राम लखन सीता मन बसिया॥"
    ],
    // Chaupai 9
    [
      "सूक्ष्म रूप धरि सियहिं दिखावा।",
      "बिकट रूप धरि लंक जरावा॥"
    ],
    // Chaupai 10
    [
      "भीम रूप धरि असुर सँहारे।",
      "रामचंद्र के काज सँवारे॥"
    ],
    // Chaupai 11
    [
      "लाय सजीवन लखन जियाये।",
      "श्री रघुबीर हरषि उर लाये॥"
    ],
    // Chaupai 12
    [
      "रघुपति कीन्ही बहुत बड़ाई।",
      "तुम मम प्रिय भरतहि सम भाई॥"
    ],
    // Chaupai 13
    [
      "सहस बदन तुम्हरो जस गावैं।",
      "अस कहि श्रीपति कंठ लगावैं॥"
    ],
    // Chaupai 14
    [
      "सनकादिक ब्रह्मादि मुनीसा।",
      "नारद सारद सहित अहीसा॥"
    ],
    // Chaupai 15
    [
      "जम कुबेर दिगपाल जहाँ ते।",
      "कवि कोबिद कहि सके कहाँ ते॥"
    ],
    // Chaupai 16
    [
      "तुम उपकार सुग्रीवहिं कीन्हा।",
      "राम मिलाय राज पद दीन्हा॥"
    ],
    // Chaupai 17
    [
      "तुम्हरो मंत्र विभीषण माना।",
      "लंकेश्वर भए सब जग जाना॥"
    ],
    // Chaupai 18
    [
      "जुग सहस्र जोजन पर भानू।",
      "लील्यो ताहि मधुर फल जानू॥"
    ],
    // Chaupai 19
    [
      "प्रभु मुद्रिका मेलि मुख माहीं।",
      "जलधि लाँघि गये अचरज नाहीं॥"
    ],
    // Chaupai 20
    [
      "दुर्गम काज जगत के जेते।",
      "सुगम अनुग्रह तुम्हरे तेते॥"
    ],
    // Chaupai 21
    [
      "राम दुआरे तुम रखवारे।",
      "होत न आज्ञा बिनु पैसारे॥"
    ],
    // Chaupai 22
    [
      "सब सुख लहै तुम्हारी सरना।",
      "तुम रक्षक काहू को डरना॥"
    ],
    // Chaupai 23
    [
      "आपन तेज सम्हारो आपै।",
      "तीनों लोक हाँक तें काँपै॥"
    ],
    // Chaupai 24
    [
      "भूत पिशाच निकट नहिं आवै।",
      "महाबीर जब नाम सुनावै॥"
    ],
    // Chaupai 25
    [
      "नासै रोग हरै सब पीरा।",
      "जपत निरंतर हनुमत बीरा॥"
    ],
    // Chaupai 26
    [
      "संकट से हनुमान छुड़ावै।",
      "मन क्रम बचन ध्यान जो लावै॥"
    ],
    // Chaupai 27
    [
      "सब पर राम तपस्वी राजा।",
      "तिनके काज सकल तुम साजा॥"
    ],
    // Chaupai 28
    [
      "और मनोरथ जो कोई लावै।",
      "सोई अमित जीवन फल पावै॥"
    ],
    // Chaupai 29
    [
      "चारों जुग परताप तुम्हारा।",
      "है परसिद्ध जगत उजियारा॥"
    ],
    // Chaupai 30
    [
      "साधु संत के तुम रखवारे।",
      "असुर निकंदन राम दुलारे॥"
    ],
    // Chaupai 31
    [
      "अष्ट सिद्धि नव निधि के दाता।",
      "अस बर दीन जानकी माता॥"
    ],
    // Chaupai 32
    [
      "राम रसायन तुम्हरे पासा।",
      "सदा रहो रघुपति के दासा॥"
    ],
    // Chaupai 33
    [
      "तुम्हरे भजन राम को पावै।",
      "जनम जनम के दुख बिसरावै॥"
    ],
    // Chaupai 34
    [
      "अंत काल रघुबर पुर जाई।",
      "जहाँ जन्म हरि भक्त कहाई॥"
    ],
    // Chaupai 35
    [
      "और देवता चित्त न धरई।",
      "हनुमत सेइ सर्ब सुख करई॥"
    ],
    // Chaupai 36
    [
      "संकट कटै मिटै सब पीरा।",
      "जो सुमिरै हनुमत बलबीरा॥"
    ],
    // Chaupai 37
    [
      "जय जय जय हनुमान गोसाईं।",
      "कृपा करहु गुरुदेव की नाईं॥"
    ],
    // Chaupai 38
    [
      "जो सत बार पाठ कर कोई।",
      "छूटहि बंदि महा सुख होई॥"
    ],
    // Chaupai 39
    [
      "जो यह पढ़ै हनुमान चालीसा।",
      "होय सिद्धि साखी गौरीसा॥"
    ],
    // Chaupai 40
    [
      "तुलसीदास सदा हरि चेरा।",
      "कीजै नाथ हृदय मह डेरा॥"
    ],
    // Final Doha
    [
      "पवन तनय संकट हरण, मंगल मूरति रूप।",
      "राम लखन सीता सहित, हृदय बसहु सुर भूप॥"
    ]
  ];


  /*
    //FaceUP-AI
    root: string = 'https://faceupai.vedantaerpserver.com';
    loginLogoURL: string = "../../assets/img/faceuplogo.png";
    url: string = 'https://faceupai.vedantaerpserver.com';
    forgetPassword: string = this.root + '/Pages/Popup/popup.aspx?action=../../UserControls/ForgetPassword.ascx'
    public OTPUrl = this.root + '/pages/notifications.aspx?';
    public tenantID = '2';
    //public resourcePath =this.root +'/Resources/SchoolImages';
    public SchoolName = 'FaceUP-AI';
    // packagename : com.mobile.FACEUPAI
  
    */

  //Bocw - The Building and Other Construction Workers Welfare Board
  /*
      root: string = 'https://avs.upsdc.gov.in:81';
      loginLogoURL: string = "https://www.rapporthr.in/uploads/BOCW.png"; 
      // url: string = 'https://avs.upsdc.gov.in:81';
      //   url: string = 'https://45.118.50.32';
     // url: string = 'https://faceupai.vedantaerpserver.com';
      forgetPassword: string = this.root + '/Pages/Popup/popup.aspx?action=../../UserControls/ForgetPassword.ascx'
      public OTPUrl = this.root + '/pages/notifications.aspx?';
      public tenantID = '1';
      public resourcePath =this.root +'/Resources/SchoolImages';
      // public SchoolName = 'The Building and Other Construction Workers Welfare Board ';
      public SchoolName = ' UP-BOCW ';
      // packagename : mobile.UPBOCW.com
      public appVersion = '1.0.0'
      // appName: UP BOCW
   */
  //localhost
  root: string = 'https://faceupai.vedantaerpserver.com';
  loginLogoURL: string = "";
  url: string = 'https://mangalbhav.com';
 //  url: string = 'https://localhost:44305';
  forgetPassword: string = this.root + '/Pages/Popup/popup.aspx?action=../../UserControls/ForgetPassword.ascx'
  public OTPUrl = this.root + '/pages/notifications.aspx?';
  public tenantID = '18';
  //public resourcePath =this.root +'/Resources/SchoolImages';
  public SchoolName = 'The Building and Other Construction Workers Welfare Board ';
  public appVersion = '1.0.0'
  // packagename : 





  // public feeReceiptPDFPath = this.resourcePath + '/FeePayments/';

  constructor(
    public http: HttpClient,
    private storage: Storage,
    public toastCtrl: ToastController,
  ) {
  }

  getForgetPasswordLink() {
    return this.forgetPassword;
  }
  getTenantID() {
    return this.tenantID;
  }
  setTenantID(loginTenantID: string) {
    this.tenantID = loginTenantID;
  }
  getSchoolID() {
    return this.schoolID;
  }
  setSchoolID(loginschoolID: string) {
    // console.log('set schoolID',loginschoolID);
    this.schoolID = loginschoolID;
  }

  getChalisaLine(index: number) {

    if (index >= 0 && index < this.chalisaLines.length) {
      return this.chalisaLines[index];
    }

    return null;

  }
  get(endpoint: string, params?: any, reqOpts?: any) {

    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }
    // Support easy query params for GET requests
    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }
    //console.log(this.url + '/' + endpoint, reqOpts);
    return this.http.get(this.url + '/' + endpoint, reqOpts);

  }

  getSchoolLogo() {
    return this.loginLogoURL;
  }


  getMediaUploadURL() {
    return this.url + "/PostFiles";
  }


  uploadFiles(files: File[], entityType: string, entityID: string, filePurpose: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file, file.name));
    formData.append('entityType', entityType);
    formData.append('entityID', entityID.toString());
    formData.append('filePurpose', filePurpose);

    console.log(this.url + 'UploadFile', formData)
    return this.http.post(this.url + '/UploadFile', formData);
  }




  uploadImage(files: File[], entityType: string, entityID: string, filePurpose: string): Observable<any> {

    const formData = new FormData();
    files.forEach(file => formData.append('file', file, file.name));
    formData.append('entityType', entityType);
    formData.append('entityID', entityID.toString());
    formData.append('filePurpose', filePurpose);

    console.log(this.url + 'UploadImages', formData)
    return this.http.post(this.url + '/UploadImages', formData);
  }


  getDirectPlainUrl(urlComplete: string) {
    //console.log(this.url+"/"+urlExtension);
    return this.http.get(urlComplete, { reportProgress: true, responseType: "blob" });
  }
  getOTPPlainUrl(urlComplete: string) {
    //console.log(urlComplete);
    return this.http.get(urlComplete, { responseType: 'text' });
  }

  getVendataPromotionData(webMethod: any) {
    console.log(this.PromotionsURL + webMethod);
    return this.http.get(this.PromotionsURL + webMethod);
  }
  postVendataPromotionActivity(webMethod: any, body: any) {
    console.log(webMethod, body);
    const headers = new HttpHeaders();
    headers.append("Content-Type", "application/json");
    //headers.append('Accept', 'application/json');
    //'Content-Type: application/json'

    return this.http.post(this.PromotionsURL + webMethod, body);
  }


  getExternalURL(urlLink: any, qparams: any) {
    var reqOpts = {
      params: new HttpParams()
    };
    if (qparams) {
      reqOpts.params = new HttpParams();

      for (let k in qparams) {
        reqOpts.params = reqOpts.params.set(k, qparams[k]);
      }
    }
    //console.log(urlLink, reqOpts);
    return this.http.get(urlLink, reqOpts);

  }
  getPlainUrl(urlExtension: string) {
    //console.log(this.url+"/"+urlExtension); 
    return this.http.get(this.url + "/" + urlExtension);
  }

  //   post(endpoint: string, body: any, reqOpts?: any) {
  //     const headers = {
  //   'Content-Type': 'text/plain'
  // };
  //     return this.http.post(this.url + '/' + endpoint, body,reqOpts );
  //   }

  // post(endpoint: string, body: any, reqOpts?: any) {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json'
  //   });

  //   return this.http.post(this.url + '/' + endpoint, body, { headers });
  // }






  postimage(endpoint: string, formData: FormData) {
    // console.log(this.url + '/' + endpoint, formData)
    return this.http.post(this.url + '/' + endpoint, formData);
  }

  getImage(endpoint: string, params: any = {}) {
    return this.http.get(this.url + '/' + endpoint, {
      params,
      responseType: 'blob'
    });
  }


  post(endpoint: string, body: any) {
    // console.log(this.url + '/' + endpoint)
    return this.http.post(this.url + '/' + endpoint, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
  put(endpoint: string, body: any, reqOpts?: any) {
    return this.http.put(this.url + '/' + endpoint, body, reqOpts);
  }

  delete(endpoint: string, reqOpts?: any) {
    return this.http.delete(this.url + '/' + endpoint, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(this.url + '/' + endpoint, body, reqOpts);
  }
  isValidURL(fileURI: any) {

    this.http.get(fileURI) //Make an attempt to the file.. 
      .subscribe(resp => {
        return true; //file does exists can be shown..
      },
        error => { return false });
  }


  deleteAppNotification(PersonID: any, Type: string) {

    this.storage.get("FCMToken").then((token) => {
      //console.log(this.url + '/' + 'DeleteAppNotification?PersonID=' + PersonID + '&Title=' + Type + '&IMEIKey=' + token + '&secureCode=1')
      this.http.get(this.url + '/' + 'DeleteAppNotification?PersonID=' + PersonID + '&Title=' + Type + '&IMEIKey=' + token + '&secureCode=1')
        .subscribe((resp: any) => {
          //console.log(resp);
        });
    });

  }

  presentToast(msgText: any) {
    let toast = this.toastCtrl.create({
      message: msgText,
      duration: 3000
    });
  }

  getIndiaDate(JSONDate: any) {
    var d = JSONDate;
    var date = new Date(Number(d.match(/\d+/)[0]));
    var day = ("0" + date.getDate()).slice(-2);//date.getDate();
    //day = day = (day < 10) ? ("0" + day) : day;
    var month = ("0" + (date.getMonth() + 1)).slice(-2);//date.getMonth() + 1;
    //month = (month < 10) ? ("0" + month) : month;
    var dateStr = (day) + "-" + (month) + "-" + date.getFullYear();
    // var houre = date.getHours() + ":" + date.getMinutes() + ":"  + date.getSeconds();
    // console.log("New ="+ dateStr + " " + houre);   
    return dateStr;
  }

  getIndiaDateTime(JSONDate: any) {
    var d = JSONDate;
    // console.log(d);
    var date = new Date(Number(d.match(/\d+/)[0]));
    var day = ("0" + date.getDate()).slice(-2);//date.getDate();
    //day = day = (day < 10) ? ("0" + day) : day;
    var month = ("0" + (date.getMonth() + 1)).slice(-2);//date.getMonth() + 1;
    //month = (month < 10) ? ("0" + month) : month;
    var dateStr = (day) + "-" + (month) + "-" + date.getFullYear();
    var houre = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    // console.log("New ="+ dateStr + " " + houre);   
    return dateStr + " " + houre;
  }


  public _enableDynamicHyperlinks(Description: any, isReplace: boolean): any {

    let returnUrl = '';
    var regex = new RegExp(/(https?:\/\/[^\s]+)/g);

    if (isReplace) {
      returnUrl = Description.replace(regex, "<a href=$1>$1</>")
    }
    else {
      if (Description.match(regex)) {
        let urls = Description.match(regex);
        urls.forEach((element: string) => {
          returnUrl += "<a href=" + element + ">" + element + "</>";
        });
      }
    }
    return returnUrl;


  }


}
