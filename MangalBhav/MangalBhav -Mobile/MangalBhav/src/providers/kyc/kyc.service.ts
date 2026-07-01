import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';

export interface KYCAuthRequest {
    userID: number;
    tenantID?: number;
    verificationID?: string;
    documentRequested?: string[];
    redirectUrl?: string;
    userFlow?: string;
    updatedByUser?: string;
}

export interface KYCStatusResponse {
    status: string;
    isVerified: boolean;
    isEKYC: boolean;
    isMBVerified: boolean;
    isPremium: boolean;
    isRecommended: boolean;
    verifiedName: string;
    verifiedAddress: string;
    verifiedDOB: string;
    verifiedGender: string;
    remarks: string;
    dateAdded: string;
    dateModified: string;
}

export interface CompleteKYCRequest {
    userID: number;
    tenantID?: number;
    verificationID: string;
    mobileNumber: string;
    aadhaarNumber: string;
    updatedByUser?: string;
}

@Injectable({
    providedIn: 'root'
})
export class KYCService {
    private baseUrl = 'https://app.mangalbhav.com/api/MangalBhavKYC'; // Change to your API URL

    // Store current KYC session data
    private currentKYCSession: any = null;

    constructor(
        private http: HttpClient,
        private platform: Platform
    ) { }

    /** Step 1: Generate DigiLocker Auth URL */
    generateAuthUrl(userId: number, tenantId: number, userName: string): Observable<any> {
        const verificationId = `MB_${userId}_${Date.now()}`;

        const body = {
            // Cashfree fields
            verification_id: verificationId,
            document_requested:['AADHAAR'],        // lowercase — Cashfree expects this
            redirect_url: 'https://app.mangalbhav.com/api/MangalBhavKYC/KYCCallback',  // valid HTTPS
            user_flow: 'signup',

            // Our DB fields
            UserID: userId,
            TenantID: tenantId,
            UpdatedByUser: userName
        };

        return this.http.post(`${this.baseUrl}/GenerateAuthUrl`, body);
    }

    /** Step 2: Check Consent Status */
    checkConsentStatus(referenceId: string, verificationId: string, userId: number, tenantId: number = 1): Observable<any> {
        return this.http.post(
            `${this.baseUrl}/CheckConsentStatus?referenceId=${referenceId}&verificationId=${verificationId}&userId=${userId}&tenantId=${tenantId}`,
            {}
        );
    }

    /** Step 3: Get Document Data (Aadhaar) */
    getDocumentData(
        referenceId: string,
        verificationId: string,
        documentType: string = 'AADHAAR',
        userId: number = 0,
        tenantId: number = 1
    ): Observable<any> {
        return this.http.post(
            `${this.baseUrl}/GetDocumentData?referenceId=${referenceId}&verificationId=${verificationId}&documentType=${documentType}&userId=${userId}&tenantId=${tenantId}`,
            {}
        );
    }

    /** Step 4: Complete KYC Verification */
    completeKYC(request: CompleteKYCRequest): Observable<any> {
        return this.http.post(`${this.baseUrl}/CompleteKYC`, request);
    }

    /** Get KYC Status by User ID */
    getKYCStatus(userId: number, tenantId: number = 1): Observable<KYCStatusResponse> {
        return this.http.post<KYCStatusResponse>(
            `${this.baseUrl}/GetKYCStatus?userId=${userId}&tenantId=${tenantId}`,
            {}
        );
    }

    /** Admin: Update KYC Status manually */
    updateKYCStatus(request: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/UpdateKYCStatus`, request);
    }

    // =========================================================
    // MOBILE-SPECIFIC METHODS
    // =========================================================

    /**
     * Open DigiLocker in Capacitor In-App Browser
     * This keeps user inside your app experience
     */
    async openDigiLockerInApp(url: string): Promise<void> {
        // Store session for when user returns
        this.currentKYCSession = {
            startTime: Date.now(),
            url: url
        };

        // Open in-app browser (NOT external browser)
        await Browser.open({ url: url });

        // Listen for browser close event
        Browser.addListener('browserFinished', () => {
            console.log('DigiLocker browser closed by user');
            // User closed browser - check status
            this.onBrowserClosed();
        });
    }

    /**
     * Called when in-app browser is closed
     * Check if KYC was completed
     */
    private onBrowserClosed() {
        // Emit event or use Subject to notify component
        // The component should call checkConsentStatus() after this
        console.log('Browser closed - checking KYC status');
    }

    /**
     * Get current KYC session
     */
    getCurrentKYCSession(): any {
        return this.currentKYCSession;
    }

    /**
     * Clear KYC session
     */
    clearKYCSession() {
        this.currentKYCSession = null;
    }
}