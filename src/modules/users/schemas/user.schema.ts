import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
class WatchHistoryItem {
  @Prop({ required: true })
  contentId: string;

  @Prop({ required: true })
  watchedOn: Date;

  @Prop()
  rating?: number;
}

@Schema({ _id: false })
class Preferences {
  @Prop({ type: [String], default: [] })
  favoriteGenres: string[];

  @Prop({ type: [String], default: [] })
  dislikedGenres: string[];
}

@Schema({ collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ type: Preferences, default: () => ({}) })
  preferences: Preferences;

  @Prop({ type: [WatchHistoryItem], default: [] })
  watchHistory: WatchHistoryItem[];
}

export const UserSchema = SchemaFactory.createForClass(User);
