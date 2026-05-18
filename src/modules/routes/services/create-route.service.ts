import { createRoute } from "../repositories/route-repository";
import { CreateRouteInput } from "../schemas/create-route.schema";

type Input = CreateRouteInput & {
  userId: string;
};

export function createRouteService(input: Input) {
  return createRoute(input);
}
