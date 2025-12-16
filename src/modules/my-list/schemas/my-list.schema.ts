import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'mylists' })
export class MyList extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  contentId: Types.ObjectId;

  @Prop({ type: String, enum: ['movie', 'tvshow'], required: true })
  contentType: string;

  @Prop({ default: Date.now })
  addedAt: Date;
}

export const MyListSchema = SchemaFactory.createForClass(MyList);

// Prevent duplicates
MyListSchema.index({ userId: 1, contentId: 1 }, { unique: true });
