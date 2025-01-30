import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

//code to hold the connected clients
const clients: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    ws.on('close', () => {
        clients.delete(ws);
    });
});

export const sendToClients = (message: string) => {
    clients.forEach((client) => {
        if ( client.readyState === WebSocket.OPEN ) {
            client.send(message);
        }
    })
}