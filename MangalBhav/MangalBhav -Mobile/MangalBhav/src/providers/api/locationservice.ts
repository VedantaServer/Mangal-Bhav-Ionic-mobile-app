import { Injectable, NgZone } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { ApiNU } from '../../providers';

// Correct way to import this plugin — it exposes its type as BackgroundGeolocationPlugin,
// and the runtime instance is obtained via registerPlugin, not a named export
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

@Injectable({ providedIn: 'root' })
export class LocationTrackingService {
  private watcherId: string | null = null;

  constructor(private ngZone: NgZone, private apinu: ApiNU) {}

  async start(userId: number) {
    if (!Capacitor.isNativePlatform()) return;
    if (this.watcherId) return;

    try {
      this.watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundTitle: 'Mangalbhav',
          backgroundMessage: 'Checking nearby mandirs',
          requestPermissions: true,
          stale: false,
          distanceFilter: 500,
        },
        (location, error) => {
          if (error) {
            console.error('Location watcher error', error);
            return;
          }
          if (location) {
            this.ngZone.run(() => this.reportLocation(userId, location.latitude, location.longitude));
          }
        }
      );
    } catch (err) {
      console.error('Failed to start location watcher', err);
    }
  }

  private reportLocation(userId: number, lat: number, lng: number) {
    this.apinu.postUrlData(
      `UpdateUserLocation?userID=${userId}&lat=${lat}&lng=${lng}`,
      null
    ).subscribe({
      error: (err: any) => console.error('Failed to report location', err),
    });
  }

  async stop() {
    if (this.watcherId) {
      await BackgroundGeolocation.removeWatcher({ id: this.watcherId });
      this.watcherId = null;
    }
  }
}