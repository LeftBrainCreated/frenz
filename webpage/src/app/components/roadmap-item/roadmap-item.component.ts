import { Component, Input, OnInit } from '@angular/core';
import { RoadmapItem } from 'src/app/interfaces/RoadmapItem';

@Component({
  selector: 'app-roadmap-item',
  templateUrl: './roadmap-item.component.html',
  styleUrls: ['./roadmap-item.component.scss']
})

export class RoadmapItemComponent implements OnInit {
  parser = new DOMParser();

  @Input() left: boolean = true;
  @Input() item!: RoadmapItem;

  descriptionText: any = '';

  ngOnInit(): void {
    // this.descriptionText = this.parser.parseFromString(this.item.description, 'text/html').body.toString() ;
  }

  ngAfterViewInit(): void {
    document.getElementById("desText_" + this.item.title)!.append(this.parser.parseFromString(this.item.description, 'text/html').body)
  }



}
