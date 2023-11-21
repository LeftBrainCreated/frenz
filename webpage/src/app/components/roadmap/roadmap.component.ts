import { Component, Input } from '@angular/core';
import { RoadmapItem } from 'src/app/interfaces/RoadmapItem';

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadmapComponent {

  @Input() RoadmapItems: RoadmapItem[] = [];

}
