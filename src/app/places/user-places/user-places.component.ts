import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {
  placesService = inject(PlacesService);
  private destroyRef = inject(DestroyRef);
  isLoading = signal(false);
  error = signal<string>('');
  places = this.placesService.loadedUserPlaces; // gestiamo i dati direttamente nel service mentre la sottoscrizione all'observable , il loading ed gli errori nel componente

  ngOnInit() {
    this.isLoading.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe({
      error: (error: Error) => {
        console.log(error.message);
        this.error.set(error.message);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onDeletePlace(place: Place) {
    const deleteSub = this.placesService.removeUserPlace(place.id).subscribe();

    this.destroyRef.onDestroy(() => {
      deleteSub.unsubscribe();
    });
  }
}
