/// <reference types="@types/google.maps" />

declare global {
    interface Window {
      initGoogleMapsCallback: () => void;
    }
  }
  
  export function loadGoogleMapsScript(callback: () => void): void {
    // If Google Maps API is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      callback();
      return;
    }
  
    // Create callback function
    window.initGoogleMapsCallback = callback;
  
    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  
  export async function calculateDistance(
    origin: string,
    destination: string
  ): Promise<{ distance: number; duration: number }> {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Maps API not loaded'));
        return;
      }
  
      const service = new google.maps.DistanceMatrixService();
      
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === 'OK' && response) {
            const result = response.rows[0].elements[0];
            
            if (result.status === 'OK') {
              resolve({
                distance: result.distance.value / 1000, // Convert meters to kilometers
                duration: result.duration.value / 60, // Convert seconds to minutes
              });
            } else {
              reject(new Error('Could not calculate distance'));
            }
          } else {
            reject(new Error('Distance Matrix request failed'));
          }
        }
      );
    });
  }
  