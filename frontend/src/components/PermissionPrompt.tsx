import { useState, useEffect } from 'react';
import { FiMapPin, FiBell, FiX } from 'react-icons/fi';

const PERMISSION_KEY = 'present-foods-permissions';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

export default function PermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [locationState, setLocationState] = useState<PermissionState>('prompt');
  const [notificationState, setNotificationState] = useState<PermissionState>('prompt');

  useEffect(() => {
    const asked = localStorage.getItem(PERMISSION_KEY);
    if (asked) return;
    if (!('Notification' in window) && !('geolocation' in navigator)) return;
    setVisible(true);
  }, []);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationState('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationState('granted'),
      () => setLocationState('denied'),
      { timeout: 10000 }
    );
  };

  const requestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationState('unavailable');
      return;
    }
    const result = await Notification.requestPermission();
    setNotificationState(result === 'granted' ? 'granted' : 'denied');
  };

  const dismiss = () => {
    localStorage.setItem(PERMISSION_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const allDone = locationState !== 'prompt' && notificationState !== 'prompt';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-bold text-neutral-800">Enable Site Permissions</h2>
          {allDone && (
            <button onClick={dismiss} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Allow location and notifications for the best experience on Present Foods.
        </p>
        <div className="space-y-4">
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${locationState === 'granted' ? 'border-green-200 bg-green-50' : locationState === 'denied' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${locationState === 'granted' ? 'bg-green-100 text-green-600' : locationState === 'denied' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
              <FiMapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-neutral-800">Location</p>
              <p className="text-xs text-gray-500">
                {locationState === 'granted' ? 'Allowed' : locationState === 'denied' ? 'Blocked' : locationState === 'unavailable' ? 'Not available' : 'Find nearby restaurants & offers'}
              </p>
            </div>
            {locationState === 'prompt' && (
              <button onClick={requestLocation} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all shrink-0">
                Allow
              </button>
            )}
          </div>
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${notificationState === 'granted' ? 'border-green-200 bg-green-50' : notificationState === 'denied' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notificationState === 'granted' ? 'bg-green-100 text-green-600' : notificationState === 'denied' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
              <FiBell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-neutral-800">Notifications</p>
              <p className="text-xs text-gray-500">
                {notificationState === 'granted' ? 'Allowed' : notificationState === 'denied' ? 'Blocked' : notificationState === 'unavailable' ? 'Not available' : 'Get order updates & offers'}
              </p>
            </div>
            {notificationState === 'prompt' && (
              <button onClick={requestNotification} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-all shrink-0">
                Allow
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-6">
          {allDone ? (
            <button onClick={dismiss} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-all text-sm">
              Continue
            </button>
          ) : (
            <button onClick={dismiss} className="px-6 py-2.5 text-gray-500 hover:text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all text-sm">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
