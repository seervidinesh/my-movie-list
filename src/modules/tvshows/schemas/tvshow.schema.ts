import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class Episode {
  @Prop({ required: true })
  episodeNumber: number;

  @Prop({ required: true })
  seasonNumber: number;

  @Prop({ required: true })
  releaseDate: Date;

  @Prop()
  director: string;

  @Prop({ type: [String], default: [] })
  actors: string[];
}

@Schema({ collection: 'tvshows' })
export class TVShow extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ type: [Episode], default: [] })
  episodes: Episode[];
}

export const TVShowSchema = SchemaFactory.createForClass(TVShow);
