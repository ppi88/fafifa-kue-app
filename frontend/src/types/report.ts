import { CakeType } from "./cake";

export interface DailyStock {
  date: string;
  cakeType: CakeType;
  produced: number;
  sold: number;
  remaining: number;
}