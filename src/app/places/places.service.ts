import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);

  loadedUserPlaces = this.userPlaces.asReadonly();

  private fetchPlaces(url: string, errorMessage: string) {
    return (
      this.httpClient
        .get<{ places: Place[] }>(url /* ,{observe:'response'} */) // se settiamo questo campo con questo valore la risposta sarà un' oggetto http response
        // setta invece il valore in {observe :events} per gestire più eventi prima della risposta
        .pipe(
          map(({ places }) => places),
          catchError(
            (
              error // utile per utilizzare un funzione per trasformare l'errore
            ) => throwError(() => new Error(error))
          )
        )
    );
  }

  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something went wrong..'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something went wrong..'
    ).pipe(
      tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.update((prevPlaces) => [...prevPlaces, place]);
    }

    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error: { message: string }) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to add the selected place');
          return throwError(() => Error(error.message));
        })
      );
  }

  removeUserPlace(placeId: string) {
    const prevPlaces = this.userPlaces();
    this.userPlaces.update((prevPlaces) =>
      prevPlaces.filter((p) => p.id !== placeId)
    );
    console.log('inside remove', prevPlaces);

    return this.httpClient
      .delete(`http://localhost:3000/user-places/${placeId}`)
      .pipe(
        catchError((error: { message: string }) => {
          this.userPlaces.set(prevPlaces);
          this.errorService.showError('Failed to remove the selected place');
          return throwError(() => Error(error.message));
        })
      );
  }
}
