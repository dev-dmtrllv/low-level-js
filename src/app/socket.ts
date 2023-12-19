import { fn, Maybe } from "@shared";
import { io, Socket } from "socket.io-client"

const instance: Maybe<Socket<ServerEvents, ClientEvents>> = new Maybe();

export const socket = fn.cached(() => instance.getOrSet(() => io()));
