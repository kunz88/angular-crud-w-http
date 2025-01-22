import { Component, DestroyRef, inject, input } from '@angular/core';

import { Place } from './place.model';
import { PlacesService } from './places.service';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
  templateUrl: './places.component.html',
  styleUrl: './places.component.css',
})
export class PlacesComponent {
  places = input.required<Place[]>();
  placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);

  onSelectPlace(placeId: string) {
    const subscription = this.placesService
      .addPlaceToUserPlaces(placeId)
      .subscribe({
        next: (resData) => console.log(resData),
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
