import { io } from "socket.io-client";

const { protocol, hostname } = window.location;

const socket = io(`${protocol}//${hostname}:3002`);

socket.on("reload-client", () => window.location.reload());
