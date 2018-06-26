import {serializeEvent, deserializeEvent} from './event/eventSerializerV1';

export const STATUS_CREATED = 0;
export const STATUS_PUBLISHED = 1;
export const STATUS_ACCEPTED = 2;
export const STATUS_STARTED = 3;
export const STATUS_FINISHED = 4;
export const STATUS_CLOSED = 5;
export const STATUS_DISTRIBUTED = 6;

export {serializeEvent, deserializeEvent};