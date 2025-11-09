import { io } from "socket.io-client";

const url = window.location.origin.replace(/^http/, "ws");
const socket = io(url);

export default socket;
