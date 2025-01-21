import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';

import { HttpClient } from '@angular/common/http';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  isLoading = signal(false);
  error = signal<string>('');

  ngOnInit() {
    this.isLoading.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>(
        'http://localhost:3000/places' /* ,{observe:'response'} */
      ) // se settiamo questo campo con questo valore la risposta sarà un' oggetto http response
      // setta invece il valore in {observe :events} per gestire più eventi prima della risposta
      .pipe(
        map(({ places }) => places),
        catchError((error) =>// utile per utilizzare un funzione per trasformare l'errore 
          throwError(() => new Error('Something went wrong..'))
        )
      )
      .subscribe({
        next: (places) => {
          this.places.set(places);
        },
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
}
