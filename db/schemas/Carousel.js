import { Schema, model } from "mongoose";

export const CarouselSchema = new Schema({
    url: [String]
})


export const Carousel = model('Carousel', CarouselSchema)