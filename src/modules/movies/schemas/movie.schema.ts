import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'movies' })
export class Movie extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop()
  releaseDate: Date;

  @Prop()
  director: string;

  @Prop({ type: [String], default: [] })
  actors: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
