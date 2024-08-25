import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    likes: mongoose.Types.ObjectId[];
}

const CommentSchema: Schema = new Schema({
    post: { type: mongoose.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likes: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
