import { Component, input, output } from '@angular/core';
import { Place } from './place.model';

@Component({
  selector: 'app-places',
  standalone: true,
  imports: [],
  templateUrl: './places.component.html',
  styleUrl: './places.component.css',
})
export class PlacesComponent {
  places = input.required<Place[]>();
  onSelectPlace = output<Place>();

  onClickCustomEvent(place: Place) {
    this.onSelectPlace.emit(place);
  }
}
